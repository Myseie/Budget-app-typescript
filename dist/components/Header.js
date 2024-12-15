"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const Header = () => {
    return (<header>
            <h1>Budget App</h1>
            <nav>
                <react_router_dom_1.Link to="/">Se budgetar</react_router_dom_1.Link> | <react_router_dom_1.Link to="/add">Lägg till budget</react_router_dom_1.Link>
            </nav>
        </header>);
};
exports.default = Header;
