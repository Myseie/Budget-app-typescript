import React, { useState} from "react";
import axios from "axios";


const AddBudgetForm = () => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [type, setType] = useState('expense');
    const [error, setError] = useState<string | null>(null);
 


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Skickar data till backend:", { description, amount, type }); 

        if(!description || !amount || !type) {
            setError("Alla fält måste vara ifyllda!");
            return; 
        }

        setError(null);
        
        axios.post(
            'http://localhost:4000/transactions',
            { description, amount, type },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
        .then(() => {
            alert('Budget tillagd!');
            setDescription('');
            setAmount('');
            setType('income');
        })
        .catch(err => console.error('Kunde inte lägga till budget:', err));
    };

    return ( 
        
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h2>Lägg till budget</h2>
            <div>
                <label>Beskrivning:</label>
                <input  
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Belopp:</label>
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    required
                />
            </div>
            <div>
                <label>Typ:</label>
                <select value={type} onChange={(e) => {
                    console.log("Dropdown-värde ändrat till:", e.target.value);
                    setType(e.target.value);
                }}>
               
                    <option value="income">Inkomst</option>
                    <option value="expense">Utgift</option>
                </select>
            </div>
            <button type="submit">Lägg till</button>
        </form>
    );
};

export default AddBudgetForm;