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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Budget APP API är igång');
});
app.get('/budgets', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.pool.query('SELECT * FROM transactions');
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Serverfel');
    }
}));
app.post('/transactions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, amount, type } = req.body;
    try {
        const result = yield database_1.pool.query('INSERT INTO transactions (description, amount, type) VALUES ($1, $2, $3) RETURNING *', [description, amount, type]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Serverfel');
    }
}));
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servern körs på port ${PORT}`);
});
