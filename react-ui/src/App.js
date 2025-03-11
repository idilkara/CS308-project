import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import CategoryPage from "./CategoryPage";
import UserPage from "./UserPage";
import ShoppingCart  from "./ShoppingCart";
<<<<<<< HEAD
import OrdersPage from "./OrderPage";
=======
import ProductPage  from "./ProductPage";
>>>>>>> 00e637b4d3bbca18acc72aefed87f6222a1c3fd0

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/user" element={<UserPage />} />
<<<<<<< HEAD
        <Route path="/order" element={<OrdersPage />} />
        <Route path="/" element={<CategoryPage />} /> {/* Default route */}
=======
        <Route path="/" element={<ProductPage />} /> {/* Default route */}

>>>>>>> 00e637b4d3bbca18acc72aefed87f6222a1c3fd0
      </Routes>
    </Router>
  );
}

export default App;
