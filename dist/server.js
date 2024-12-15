"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = "1234pepsi";
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Åtkomst nekad. Ingen token tillhandahållen' });
        return;
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, user) => {
        if (err)
            return res.status(403).json({ message: 'Ogiltlig token' });
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Budget APP API är igång');
});
app.get('/budgets', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.pool.query('SELECT * FROM transactions');
        console.log("Data från databasen innan översättning:", result.rows); // Debug-logg
        const translatedBudgets = result.rows.map((row) => {
            console.log(`Översätter row.type: ${row.type}`); // Debug-logg
            return Object.assign(Object.assign({}, row), { type: row.type === 'expense' ? 'Utgift' : row.type === 'income' ? 'Inkomst' : row.type });
        });
        console.log("Skickar data med översatta typer:", translatedBudgets); // Debug-logg
        res.json(translatedBudgets);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Serverfel');
    }
}));
app.delete('/transactions/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield database_1.pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            res.status(404).send('Transaktion hittades inte');
        }
        else {
            res.status(200).send('Transaktion raderad');
        }
    }
    catch (err) {
        console.error('Fel vid borttagning av transaktion:', err);
        res.status(500).send('Serverfel');
    }
}));
app.post('/register', (req, res) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password, email } = req.body;
        try {
            const existingUser = yield database_1.pool.query('SELECT * FROM users WHERE username = $1', [username]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: "Användarnamn redan taget" });
            }
            const passwordHash = yield bcrypt_1.default.hash(password, 10);
            const result = yield database_1.pool.query('INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email', [username, passwordHash, email]);
            res.status(201).json({ user: result.rows[0] });
        }
        catch (error) {
            console.error('Fel vid registrering:', error);
            res.status(500).json({ message: 'Serverfel' });
        }
    }))();
});
app.post('/login', (req, res) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password } = req.body;
        try {
            const userResult = yield database_1.pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = userResult.rows[0];
            if (!user) {
                return res.status(400).json({ message: "Felaktigt användarnamn eller lösenord" });
            }
            const isValidPassword = yield bcrypt_1.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(400).json({ message: "Felaktigt användarnamn eller lösenord" });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token });
        }
        catch (error) {
            console.error('Fel vid inloggning:', error);
            res.status(500).json({ message: 'Serverfel' });
        }
    }))();
});
app.post('/transactions', exports.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, amount, type } = req.body;
    console.log("Mottagen data:", { description, amount, type });
    console.log("Användare:", req.user);
    try {
        const validType = type === "income" || type === "expense" ? type : "income";
        const result = yield database_1.pool.query('INSERT INTO transactions (description, amount, type) VALUES ($1, $2, $3) RETURNING *', [description, amount, validType]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Serverfel');
    }
}));
app.put('/transactions/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { description, amount, type } = req.body;
    try {
        const result = yield database_1.pool.query('UPDATE transactions SET description = $1, amount = $2, type = $3 WHERE id = $4 RETURNING *', [description, amount, type, id]);
        if (result.rowCount === 0) {
            res.status(404).send('Transaktionen hittades inte');
        }
        else {
            res.json(result.rows[0]);
        }
    }
    catch (err) {
        console.error('Fel vid uppdatering av transaktion:', err);
        res.status(500).send('Serverfel');
    }
}));
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servern körs på port ${PORT}`);
});
