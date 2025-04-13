import React, { useState, useEffect } from 'react';
import { BsBag, BsPersonCircle } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { searchProducts } from "../utils/SearchUtils";

const Navbar = () => {
    const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                //const res = await fetch("http://backend/api/categories/categories");

                const res = await fetch("http://localhost/api/categories/categories", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log("Raw response:", res);
                const data = await res.json();
                console.log("Fetched categories:", data);
                setAllProducts(data);
            } catch (err) {
                console.error("Failed to fetch products for search", err);
            }
        };

        fetchProducts();
    }, []);

    //TODO add authors fetching

    return (
        <header className="navbar">
            <Link to="/home" className="brand">Odyssey</Link>

            <nav className="menu">
            <Link to="/category">Shop</Link>

                {/* Categories Dropdown */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                    <Link to="/Categories" className="dropdown-trigger">Categories ▾</Link>
                    <div className={`dropdown-menu ${isCategoriesOpen ? 'show' : ''}`}>
                        <a href="#">All Categories</a>
                        <a href="#">Sci-fi</a>
                        <a href="#">Fantasy</a>
                        <a href="#">Crime</a>
                        <a href="#">Magical Realism</a>
                    </div>
                </div>

                {/* Authors Dropdown */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setIsAuthorsOpen(true)}
                    onMouseLeave={() => setIsAuthorsOpen(false)}
                >
                    <Link to="/Authors" className="dropdown-trigger">Authors ▾</Link>
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
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search a book, author, or a category"
                    value={searchQuery}
                    onChange={(e) => {
                        const q = e.target.value;
                        setSearchQuery(q);
                        if (q.length > 3) {
                            const results = searchProducts(q, allProducts);
                            setSearchResults(results);
                        } else {
                            setSearchResults([]);
                        }
                    }}
                />

                {searchResults.length > 0 && (
                    <div className="search-dropdown">
                        {searchResults.slice(0, 5).map((product, index) => (
                            <Link
                                to={`/product/${product.product_id}`}
                                key={index}
                                className="search-dropdown-item"
                            >
                                {product.name}
                                {product.author && (
                                    <span style={{ color: "#888", fontSize: "0.85em" }}> — {product.author}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="icons">
                <Link to="/cart">
                    <BsBag className="icon" />
                </Link>
                <Link to="/user">
                    <BsPersonCircle className="icon" />
                </Link>
            </div>
        </header>
    );
};

export default Navbar;