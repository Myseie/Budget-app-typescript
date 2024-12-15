import React, { useState} from "react";
import axios from 'axios';


const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post('http://localhost:4000/register', {username, password, email });
            setMessage('Registrering lyckades! Logga in nu.');
        }catch(err) {
            console.error('Fel vid registrering', err);
            setMessage('Kunde inte registrera. Prova igen');
        }
    };

    return (
        <div>
            <h2>Registrera</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Användarnamn:</label>
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Lösenord:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Registrera</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Register;