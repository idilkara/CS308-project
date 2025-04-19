import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import CategoryPage from "./CategoryPage";
import UserPage from "./UserPage";
import ShoppingCart  from "./ShoppingCart";
import ProductPage from "./ProductPage";
import ManagerLoginPage from "./ManagerLoginPage";
import LoginPage from "./LoginPage";
import ManagerRegisterPage from "./ManagerRegisterPage";
import RegisterPage from "./RegisterPage";
import SalesManagerDashboard from "./SalesManagerPage";
import Authors from "./components/Authors";
import Categories from "./components/Categories";
import ProductManager from "./ProductManager";


import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/cart" element={<ShoppingCart/>} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/manager-login" element={<ManagerLoginPage />} />
        <Route path="/manager-register" element={<ManagerRegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/salesmanager" element={<SalesManagerDashboard />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/productmanager" element={<ProductManager />} />
        <Route path="/" element={<HomePage />} /> {/* Default route */}
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
