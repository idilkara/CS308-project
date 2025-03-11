import React, { useState } from 'react';
import { BsBag, BsPersonCircle } from "react-icons/bs";
import { Link } from 'react-router-dom'; // This was missing

const Navbar = () => {
    const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);
    const [isPublishersOpen, setIsPublishersOpen] = useState(false);

    return (
        <header className="navbar">
            <a href="/" className="brand">Odyssey</a>
            <nav className="menu">
                <a href="#">Shop</a>

                {/* Publishers Dropdown */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setIsPublishersOpen(true)}
                    onMouseLeave={() => setIsPublishersOpen(false)}
                >
                    <a href="#" className="dropdown-trigger">Publishers ▾</a>
                    <div className={`dropdown-menu ${isPublishersOpen ? 'show' : ''}`}>
                        <a href="#" >All Publishers</a>
                        <a href="#">Publisher 1</a>
                        <a href="#">Publisher 2</a>
                        <a href="#">Publisher 3</a>
                        <a href="#">Publisher 4</a>
                    </div>
                </div>

                {/* Authors Dropdown */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setIsAuthorsOpen(true)}
                    onMouseLeave={() => setIsAuthorsOpen(false)}
                >
                    <a href="#" className="dropdown-trigger">Authors ▾</a>
                    <div className={`dropdown-menu ${isAuthorsOpen ? 'show' : ''}`}>
                        <a href="#">All Authors</a>
                        <a href="#">Haruki Murakami</a>
                        <a href="#">Secil's Fav Author</a>
                        <a href="#">Idil's Fav Author</a>
                        <a href="#">Ursula K. Le Guin</a>
                        <a href="#">Zeynep's Fav Author</a>
                        <a href="#">Duygu's Fav Author</a>
                    </div>
                </div>

                <a href="#">Best Sellers</a>
                <a href="#">New Releases</a>
            </nav>
            <div className="search-container">
                <input type="text" className="search-bar" placeholder="Search a book, author, or a category" />
            </div>
            <div className="icons">
                <BsBag className="icon" />
                <Link to="/login">
                    <BsPersonCircle className="icon" />
                </Link>
            </div>
        </header>
    );
};

export default Navbar;
