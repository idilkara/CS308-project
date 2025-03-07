// src/components/Navbar.js
import React from 'react';
import {BsBag, BsPersonCircle} from "react-icons/bs";


const Navbar = () => {
    return (
        <header className="navbar">
            <div className="brand">Odessey Bookstore</div>
            <nav className="menu">
                <a href="#">Category 1</a>
                <a href="#">Category 2</a>
                <a href="#">Category 3</a>
                <a href="#">Category 4</a>
                <a href="#">Category 5</a>
            </nav>
            <div className="search-container">
                <input type="text" className="search-bar" placeholder="Search a book, author or a category" />
            </div>
            <div className="icons">
                <BsBag className="icon" />
                <BsPersonCircle className="icon" />
            </div>
        </header>
    );
};

export default Navbar;
