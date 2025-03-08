// src/components/Layout.jsx
import React from 'react';
import Navbar from './Navbar';  // <-- Import Navbar
import Footer from './Footer'; // <-- Import Footer
import '../styles/root.css';    // Import styles

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <Navbar />
            <main className="content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
