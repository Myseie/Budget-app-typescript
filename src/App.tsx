import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BudgetList from './components/BudgetList';
import AddBudgetForm from './components/AddBudgetForm';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Header />
      <main>
      <Routes>  
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
          <BudgetList /> 
          </ProtectedRoute>
          } 
        />
        <Route 
          path="/add" 
          element={
            <ProtectedRoute>
          <AddBudgetForm />
          </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;