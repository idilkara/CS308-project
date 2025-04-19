import React, { useState, useEffect } from 'react';
import { BsBag, BsPersonCircle } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { searchProducts } from "../utils/SearchUtils";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);

    const { token, role, setToken, setRole } = useAuth(); // Assuming setToken is provided by AuthContext
    // const setRole = useSetRole();

    const handleLogout = () => {
        setToken(null); // Clear the token
        setRole(null);  // Optionally reset the role
    };


    // if token != null, user is logged in
    useEffect(() => {
        if (token) {
            setIsUserLoggedIn(true);
        } else {
            setIsUserLoggedIn(false);
        }
    }, [token]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
 
                const res = await fetch("http://localhost/api/categories/categories", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log("Raw response:", res);
                const data = await res.json();
                console.log("Fetched categories:", data);
                setCategories(data);
            } catch (err) {
                console.error("Failed to fetch products for search", err);
            }
        };

        fetchCategories();
    }, []);


    useEffect(() => {
        const fetchAuthors = async () => {
            try {
 
                const res = await fetch("http://localhost/api/authors/authors", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log("Raw response:", res);
                const data = await res.json();
                console.log("Fetched authors:", data);
                setAuthors(data);
            } catch (err) {
                console.error("Failed to fetch products for search", err);
            }
        };

        fetchAuthors();
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

                        {categories.map((category, index) => (
                            <Link to ={`/home`} className="dropdown-item">
                                {category.name}
                            </Link>
                        ))}

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
                        {authors.map((author, index) => (
                            <Link to={`/home`} className="dropdown-item" key={index}>
                                {author.author}
                            </Link>
                        ))}
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
      
            {role === "product_manager" ? (
                    <Link to="/productmanager">
                        <BsPersonCircle className="icon" />
                    </Link>
                ) : role === "sales_manager" ? (
                    <Link to="/salesmanager">
                        <BsPersonCircle className="icon" />
                    </Link>
                ) : (
                    <Link to="/cart">
                        <BsBag className="icon" />
                    </Link>
                )}


                {/* UER Dropdown */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setIsUserOpen(true)}
                    onMouseLeave={() => setIsUserOpen(false)}
                >

                    <Link to="/user" className="dropdown-trigger"><BsPersonCircle className="icon" /></Link>
                    <div className={`dropdown-menu ${isUserOpen ? 'show' : ''}`}>
                        {isUserLoggedIn ? (
                            <div style={{ marginRight: '10px' }}>
                            <Link to={`/user`} className="dropdown-item">
                                Profile Page
                            </Link>
                            <Link to={`/login`} className="dropdown-item" onClick={handleLogout} >
                                Log Out 
                            </Link>
                            </div>
                        ) : (       
                            <div>                     
                            <Link to ={`/login`} className="dropdown-item">
                                Log In
                            </Link>
                            <Link to={`/register`} className="dropdown-item">
                                Register
                            </Link>
                            </div>  
                        )}



                    </div>
                </div>

                
            </div>
        </header>
    );
};

export default Navbar;