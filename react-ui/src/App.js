import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import CategoryPage from "./CategoryPage";
import UserPage from "./UserPage";
import ShoppingCart  from "./ShoppingCart";
import ProductPage from "./ProductPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/product" element={<ProductPage />} />
     
        <Route path="/" element={<CategoryPage />} /> {/* Default route */}
      </Routes>
    </Router>
  );
}

export default App;
