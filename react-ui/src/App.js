import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import CategoryPage from "./CategoryPage";
<<<<<<< HEAD
import Login from "./Login";
import Register from "./Register";
import ManagerLogin from "./ManagerLogin";
import ManagerRegister from "./ManagerRegister"
=======
import UserPage from "./UserPage";
import ShoppingCart  from "./ShoppingCart";
import ProductPage from "./ProductPage";
>>>>>>> frontend

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
<<<<<<< HEAD
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/manager-login" element={<ManagerLogin />} />
        <Route path="/manager-register" element={<ManagerRegister />} />
=======
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/product" element={<ProductPage />} />
     
>>>>>>> frontend
        <Route path="/" element={<HomePage />} /> {/* Default route */}
      </Routes>
    </Router>
  );
}

export default App;
