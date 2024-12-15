import React, { useEffect, useState } from "react";
import axios from 'axios';
import { unparse } from 'papaparse';

type Transaction = {
    id: number;
    description: string;
    amount: number;
    type: string;
    created_at: string;
};

const BudgetList = () => {
    const [budgets, setBudgets] = useState<Transaction[]>([]); // Typen är Transaction[]
    const [filter, setFilter] = useState<string>("Alla");
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemPerPage = 5;


  
    const handleExport = () => {
        const csv = unparse(filteredBudgets);
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "budgetar.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    useEffect(() => {
        axios.get('http://localhost:4000/budgets')
            .then(response => {
                console.log("Budgets från backend:", response.data); // Debug-logga
                setBudgets(response.data);
            })
            .catch(err => console.error('Kunde inte hämta budgetar:', err));
    }, []);

    const translateType = (type: string) => {
       if(type.toLowerCase() === "Utgift" || type === "expense") return "Utgift";
       if(type.toLowerCase() === "Inkomst" || type === "income") return "Inkomst";
       return type;
    };

    const totalIncome = budgets
            .filter(budget => budget.type === "Inkomst")
            .reduce((sum, budget) => sum + parseFloat(budget.amount.toString()), 0);

    
    const totalExpense = budgets
            .filter(budget => budget.type === "Utgift")
            .reduce((sum, budget) => sum + parseFloat(budget.amount.toString()), 0);

    const balance = totalIncome - totalExpense;

    const filteredBudgets = budgets.filter((transaction) => {
        const transactionDate = new Date(transaction.created_at);
        const isWithinDateRange =
          (!startDate || transactionDate >= new Date(startDate)) &&
          (!endDate || transactionDate <= new Date(endDate));
        const isMatchingFilter =
          filter === "Alla" || transaction.type === filter;
      
        return isWithinDateRange && isMatchingFilter;
      });
    const handleDelete = (id: number) => {
        console.log(`Försöker ta bort transaktion med ID: ${id}`);
        axios.delete(`http://localhost:4000/transactions/${id}`)
            .then(() => {
                console.log(`Transaktion med ID ${id} togs bort`);
                setBudgets(budgets.filter((b) => b.id !== id));
            })
            .catch((err) => {
                console.error("Kunde inte ta bort transaktionen", err);
            });
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
    };


    const indexOfLastItem = currentPage * itemPerPage;
    const indexOfFirstItem = indexOfLastItem - itemPerPage;
    const currentBudgets = filteredBudgets.slice(indexOfFirstItem, indexOfLastItem);


    const handleSaveEdit = (updatedTransaction: Transaction) => {
    console.log('Försöker uppdatera transaktion:', updatedTransaction);
    axios.put(`http://localhost:4000/transactions/${updatedTransaction.id}`, updatedTransaction)
        .then(() => {
            console.log(`Transaktion med ID ${updatedTransaction.id} uppdaterades`);
            setBudgets(
                budgets.map((b) =>
                    b.id === updatedTransaction.id ? updatedTransaction : b
                )
            );
            setEditingTransaction(null);
        })
        .catch((err) => {
            console.error("Kunde inte uppdatera transaktionen", err);
        });
};

    return (
        <div>
            <h2>Budgetar</h2>
            <div>
                <p><strong>Total inkomst:</strong> {totalIncome.toFixed(2)} SEK</p>
                <p><strong>Total utgift:</strong>{totalExpense.toFixed(2)} SEK</p>
                <p><strong>Saldo:</strong>{balance.toFixed(2)} SEK</p>
                <label>
                    StartDatum:
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </label>
                <label>
                    SlutDatum:
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </label>
            </div>
            <button onClick={handleExport}>Exportera till CSV</button>
            <label>
                Filter:
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="Alla">Alla</option>
                    <option value="Inkomst">Inkomst</option>
                    <option value="Utgift">Utgift</option>
                </select>
            </label>
            <table>
            
                <thead>
                    <tr>
                        <th>Beskrivning</th>
                        <th>Belopp</th>
                        <th>Typ</th>
                        <th>Skapad</th>
                    </tr>
                </thead>
                <tbody>
                    {currentBudgets.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.description}</td>
                            <td>{transaction.amount}</td>
                            <td>{translateType(transaction.type)}</td>
                            <td>{new Date(transaction.created_at).toLocaleString()}</td>
                            <td><button onClick={() => handleEdit(transaction)}>Redigera</button>
                            <button onClick={() => handleDelete(transaction.id)}>Ta bort</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="paginaton">
                        {Array.from(
                            { length: Math.ceil(filteredBudgets.length / itemPerPage) },
                            (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    disabled={currentPage === i + 1}
                                >
                                    {i + 1}
                                </button>
                            )
                        )}
                    </div>
            {editingTransaction && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveEdit(editingTransaction);
                }}>
                    <input
                        type="text"
                        value={editingTransaction.description}
                        onChange={(e) => setEditingTransaction({...editingTransaction, description : e.target.value})}
                    />

                    <input
                        type="number"
                        value={editingTransaction.amount}
                        onChange={(e) => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value)})}
                    />
                    <button type="submit">Spara</button>
                </form>
            )}
        </div>
    );
};

export default BudgetList;

