import React, { useState, useEffect } from 'react';
import { Search } from "lucide-react";

import { Link , useNavigate } from 'react-router-dom';
import { BsBag, BsPersonCircle, BsBarChartLineFill } from "react-icons/bs";

import { searchProducts } from "../utils/SearchUtils";
import { useAuth } from "../context/AuthContext";



const Navbar = () => {
    const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categooryQuery, setCategoryQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const navigate = useNavigate();
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
                    {/* <div className={`dropdown-menu ${isCategoriesOpen ? 'show' : ''}`}>

                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className="dropdown-item"
                            onClick={() => {
                                setCategoryQuery(category.name); // Update the category query
                                navigate('/category', { state: { searchQuery: '', selectedCategory: category.name } });
                            }}
                        >
                            {category.name}
                        </div>
                    ))}

                    </div> */}
                </div>
                {/* Authors Dropdown */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setIsAuthorsOpen(true)}
                    onMouseLeave={() => setIsAuthorsOpen(false)}
                >
                    <Link to="/Authors" className="dropdown-trigger">Authors ▾</Link>
                    {/* <div className={`dropdown-menu ${isAuthorsOpen ? 'show' : ''}`}>
                        {authors.map((author, index) => (
                            // <Link to={`/home`} className="dropdown-item" key={index}>
                            //     {author.author}
                            // </Link>
                            <div
                            key={index}
                            className="dropdown-item"
                            onClick={() => {
                              
                                navigate('/category', { state: { searchQuery: '', selectedCategory: "", selectedAuthor: author.author} });
                            }}
                            >
                            {author.author}
                            </div>
                        ))}
                    </div> */}
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

                        // Debounce filtering logic
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
            {/* Search button */}
            <div 
                className="search-button"
                onClick={() => {
                console.log("Search clicked with query:", searchQuery);
                navigate("/category", { state: { searchQuery } });
                }}
                style={{ cursor: "pointer" }}
            >
                <Search className="w-5 h-5" />
            </div>
            
            {/* Shopping bag/manager icon */}
            {role === "product_manager" ? (
                <Link to="/productmanager">
                <BsBarChartLineFill className="icon" />
                </Link>
            ) : role === "sales_manager" ? (
                <Link to="/salesmanager">
                <BsBarChartLineFill className="icon" />
                </Link>
            ) : (
                <Link to="/cart">
                <BsBag className="icon" />
                </Link>
            )}

            {/* User dropdown with inline styles */}
            <div
                className="dropdown"
                style={{ 
                position: 'relative',
                display: 'inline-block'
                }}
                onMouseEnter={() => setIsUserOpen(true)}
                onMouseLeave={() => setIsUserOpen(false)}
            >
                <Link to="/user" className="dropdown-trigger">
                <BsPersonCircle className="icon" />
                </Link>
                <div 
                className={`dropdown-menu ${isUserOpen ? 'show' : ''}`}
                style={{
                    position: 'absolute',
                    
                    top: '100%',
                    backgroundColor: 'white',
                    border: '1px solid #000',
                    minWidth: '100px',
                    padding: '8px 0',
                    zIndex: 100,
                    display: isUserOpen ? 'block' : 'none',
                    transform: 'translateX(-50%)', // This moves the menu left by half its width
                    
                    left: '50%' 
                }}
                >
                {isUserLoggedIn ? (
                    <>
                    <Link to={`/user`} className="dropdown-item">
                        Profile Page
                    </Link>
                    <Link to={`/login`} className="dropdown-item" onClick={handleLogout}>
                        Log Out 
                    </Link>
                    </>
                ) : (       
                    <>                     
                    <Link to={`/login`} className="dropdown-item">
                        Log In
                    </Link>
                    <Link to={`/register`} className="dropdown-item">
                        Register
                    </Link>
                    </>  
                )}
                </div>
            </div>
            </div>
        </header>
    );
};



export default Navbar;



