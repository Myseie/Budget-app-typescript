import express, {Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { pool } from './database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = "1234pepsi";

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        res.status(401).json({ message: 'Åtkomst nekad. Ingen token tillhandahållen'});
        return;
    }

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if(err) {
            console.error("Ogiltig token:", err);
            return res.status(403).json({ message: 'Ogiltlig token'});
        }
        (req as any).user = user;
        next();
    });
};

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req: Request, res: Response) => {
    res.send('Budget APP API är igång');
});

app.get('/budgets', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM transactions');
        console.log("Data från databasen innan översättning:", result.rows); // Debug-logg

        const translatedBudgets = result.rows.map((row) => {
            console.log(`Översätter row.type: ${row.type}`); // Debug-logg
            return {
                ...row,
                type: row.type === 'expense' ? 'Utgift' : row.type === 'income' ? 'Inkomst' : row.type,
            };
        });

        console.log("Skickar data med översatta typer:", translatedBudgets); // Debug-logg
        res.json(translatedBudgets);
    } catch (err) {
        console.error(err);
        res.status(500).send('Serverfel');
    }
});

app.delete('/transactions/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        if(result.rowCount === 0) {
            res.status(404).send('Transaktion hittades inte');
        } else {
            res.status(200).send('Transaktion raderad');
        }
    } catch (err) {
        console.error('Fel vid borttagning av transaktion:', err);
        res.status(500).send('Serverfel');
    }
});

app.post('/register', (req: express.Request, res: express.Response) => {
    (async () => {
        const { username, password, email } = req.body;

        try {
            const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: "Användarnamn redan taget" });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const result = await pool.query(
                'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email',
                [username, passwordHash, email]
            );

            res.status(201).json({ user: result.rows[0] });
        } catch (error) {
            console.error('Fel vid registrering:', error);
            res.status(500).json({ message: 'Serverfel' });
        }
    })(); 
}); 

app.post('/login', (req: express.Request, res: express.Response) => {
    (async () => {
        const { username, password } = req.body;

        try {
            const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = userResult.rows[0];

            if (!user) {
                return res.status(400).json({ message: "Felaktigt användarnamn eller lösenord" });
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(400).json({ message: "Felaktigt användarnamn eller lösenord" });
            }

            const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

            res.json({ token });
        } catch (error) {
            console.error('Fel vid inloggning:', error);
            res.status(500).json({ message: 'Serverfel' });
        }
    })();
});

app.post('/transactions', authenticateToken, async (req: Request, res: Response) => {
    const {description, amount, type} = req.body;
    console.log("Mottagen data:", { description, amount, type });
    console.log("Användare:", (req as any).user);
    try{
        const validType = type === "income" || type === "expense" ? type : "income";
        const result = await pool.query(
            'INSERT INTO transactions (description, amount, type) VALUES ($1, $2, $3) RETURNING *',
            [description, amount, validType]

        );
        res.json(result.rows[0]);
    } catch(err) {
        console.error(err);
        res.status(500).send('Serverfel');
    }
});

app.put('/transactions/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { description, amount, type} = req.body;

    try {
        const result = await pool.query(
            'UPDATE transactions SET description = $1, amount = $2, type = $3 WHERE id = $4 RETURNING *',
            [description, amount, type, id]
        );
        if (result.rowCount === 0) {
            res.status(404).send('Transaktionen hittades inte');
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Fel vid uppdatering av transaktion:', err);
        res.status(500).send('Serverfel');
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servern körs på port ${PORT}`);
});