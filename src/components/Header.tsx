import React, { useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
const navigate = useNavigate();

useEffect(() => {
  const checkToken = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };
  checkToken();
  window.addEventListener("storage", checkToken);
 
  return () => {
    window.removeEventListener("storage", checkToken);
  };
}, []);

const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
};

return (
  <header>
    <h1>Budget app</h1>
    <nav>
      {isLoggedIn ? (
        <>
          <Link to="/">Se Budgetar</Link> | <Link to="/add">Lägg till budget</Link> |{" "}
          <button onClick={handleLogout}>Logga ut</button>
        </>
      ) : (
        <>
          <Link to="/login">Logga in</Link> | <Link to="/register">Registrera</Link>
        </>
      )}
    </nav>
  </header>
);
};

export default Header;