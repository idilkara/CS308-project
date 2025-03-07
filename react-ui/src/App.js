import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import CategoryPage from "./CategoryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/" element={<HomePage />} /> {/* Default route */}
      </Routes>
    </Router>
  );
}

export default App;
