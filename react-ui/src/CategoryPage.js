import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './CategoryPage.css';
import Navbar from "./components/Navbar.jsx";
import bookCover from './img/BookCover.png';
import { ChevronUp, ChevronDown } from "lucide-react";
import { filterItems, sortItems } from "./utils/FilterUtils";

import { useAuth } from "./context/AuthContext"; // Import AuthContext if using Context API

const CategoryPage = () => {

  const navigate = useNavigate();
  //token getting
   const { token } = useAuth();
    console.log("Token from context:", token); // Log the token to check if it's being passed correctly

  const [dropdowns, setDropdowns] = useState({
    genres: false,
    priceRange: false,
    author: false,
    publicationYear: false
  });

  const sidebarRef = useRef(null);
  const filterRefs = {
    genres: useRef(null),
    priceRange: useRef(null),
    author: useRef(null),
    publicationYear: useRef(null)
  };

  const [favorites, setFavorites] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortMethod, setSortMethod] = useState("alpha-ascend");
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState({
    message: '',
    visible: false
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost/api/products/products");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched products:", data);
        setAllProducts(data);
        setFilteredProducts(data);
        
        // Log the first product to check its structure
        if (data.length > 0) {
          console.log("First product structure:", data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost/api/categories/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("Fetched categories:", data);
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  // fetch the items in the wishlist 
  const fetchWishlist = async (token) => {
      try {
          const response = await fetch("http://localhost/api/wishlist/view", {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
          });

          if (response.ok) {
              const wishlistData = await response.json();
              console.log("Wishlist fetched successfully:", wishlistData);
              //setWishlistBooks(wishlistData); // Update the wishlist state
          } else {
              const errorData = await response.json();
              console.error("Failed to fetch wishlist:", errorData.message || "Unknown error");
              alert(errorData.message || "Failed to fetch wishlist");
          }
      } catch (error) {
          console.error("Error fetching wishlist:", error);
          alert("An error occurred while fetching the wishlist.");
      }
  };

  // Add this function to handle cart button clicks 
  const handleAddToCart = (event, book) => {
    event.stopPropagation(); // Stop the event from propagating to the parent div
    
    if (token) {
      // User is logged in, add to their cart in the database
      addToCart(token, book.product_id, 1).then((result) => {
        if (result.error) {
          setNotification({
            message: result.error,
            visible: true
          });
        } else {
          // Show success message
          setNotification({
            message: "Added to cart successfully!",
            visible: true
          });
          setTimeout(() => {
            setNotification({ message: '', visible: false });
          }, 3000);
        }
      });
    } else {
      // User is not logged in, store the item in local storage
      const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
      const existingItemIndex = tempCart.findIndex(item => item.product_id === book.product_id);
      
      if (existingItemIndex >= 0) {
        // Item already exists, increase quantity
        tempCart[existingItemIndex].quantity += 1;
      } else {
        // New item, add to cart
        tempCart.push({
          product_id: book.product_id,
          name: getBookName(book),
          price: book.price || 0,
          quantity: 1,
          author: book.author || "Unknown Author",
          image: `assets/covers/${book.name.replace(/\s+/g, '').toLowerCase()}.png`
        });
      }
      
      localStorage.setItem('tempCart', JSON.stringify(tempCart));
      setNotification({
        message: "Product added to temporary cart!",
        visible: true
      });
      setTimeout(() => {
        setNotification({ message: '', visible: false });
      }, 3000);
    }
  };


  //add item to cart api 
  const addToCart = async (token, productId, quantity) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const data = { product_id: productId, quantity };
  
    try {
      const response = await fetch("http://localhost/api/shopping/add", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Added to cart:", result);
        return result;
      } else {
        return {
          error: "Failed to add to cart",
          status_code: response.status,
        };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  //ADD ITEM TO wishLIST API
  const addToWishlist = async (token, productId) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const data = { product_id: productId };
  
    try {
      const response = await fetch("http://localhost/api/wishlist/add", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Added to wishlist:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to add to wishlist:", errorData);
        return {
          error: errorData.message || "Failed to add to wishlist",
          status_code: response.status,
        };
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const removeFromWishlist = async (token, productId) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const data = { product_id: productId };
  
    try {
      const response = await fetch("http://localhost/api/wishlist/remove", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Removed from wishlist:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to remove from wishlist:", errorData);
        return {
          error: errorData.message || "Failed to remove from wishlist",
          status_code: response.status,
        };
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const updateDisplayedProducts = (newFilters = filters, newSort = sortMethod, newCategory = activeCategory) => {
    let updatedFilters = { ...newFilters };
    if (newCategory && newCategory !== "All") {
      updatedFilters.category = [newCategory];
    } else {
      delete updatedFilters.category;
    }
    const filtered = filterItems(allProducts, updatedFilters);
    const sorted = sortItems(filtered, newSort);

    console.log("Filtered + Sorted products:", sorted);

    setFilteredProducts(sorted);
  };

  const toggleDropdown = (dropdown) => {
    setDropdowns({ ...dropdowns, [dropdown]: !dropdowns[dropdown] });
  };

  const toggleFavorite = (index) => {
    setFavorites({ ...favorites, [index]: !favorites[index] });
  };

  const handleFilterChange = (filterType, value, checked) => {
    const prevValues = filters[filterType] || [];
    const updatedValues = checked
      ? [...prevValues, value]
      : prevValues.filter(v => v !== value);

    const newFilters = { ...filters, [filterType]: updatedValues };
    setFilters(newFilters);
    updateDisplayedProducts(newFilters);
  };

  // Function to determine what property to use for the book name
  const getBookName = (book) => {
    // Check various possible property names that might contain the title
    if (book.title) return book.title;
    if (book.name) return book.name;
    if (book.productName) return book.productName;
    if (book.book_title) return book.book_title;
    // If none of the above, return a placeholder
    return "Unknown Title";
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2 className="source-sans-semibold">Book Categories</h2>
          </div>

          <nav className="sidebar-menu" ref={sidebarRef}>
            <div className="filter-dropdown">
              <div className="filter-dropdown-header" onClick={() => toggleDropdown('genres')}>
                <span className="source-sans-regular">Genres</span>
                <i className="dropdown-icon">{dropdowns.genres ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</i>
              </div>
              <div className={`filter-dropdown-content ${dropdowns.genres ? 'active' : ''}`} ref={filterRefs.genres}>
                {/* Add "All" option */}
                <label className="source-sans-regular">
                  <input
                    type="checkbox"
                    value="All"
                    onChange={(e) => {
                      setActiveCategory('All');
                      updateDisplayedProducts(filters, sortMethod, 'All');
                    }}
                    checked={activeCategory === 'All'}
                  /> All
                </label>
                
                {categories.map((category, index) => (
                  <label key={index} className="source-sans-regular">
                    <input
                      type="checkbox"
                      value={category.name}
                      onChange={(e) => {
                        // When a genre is selected, also update the active category
                        if (e.target.checked) {
                          setActiveCategory(category.name);
                          updateDisplayedProducts(filters, sortMethod, category.name);
                        } else if (activeCategory === category.name) {
                          // If unchecking the active category, set to 'All'
                          setActiveCategory('All');
                          updateDisplayedProducts(filters, sortMethod, 'All');
                        }
                        handleFilterChange("genres", category.name, e.target.checked);
                      }}
                      checked={activeCategory === category.name}
                    /> {category.name}
                    <span className="filter-count">(50)</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-dropdown">
              <div className="filter-dropdown-header" onClick={() => toggleDropdown('priceRange')}>
                <span className="source-sans-regular">Price Range</span>
                <i className="dropdown-icon">{dropdowns.priceRange ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</i>
              </div>
              <div className={`filter-dropdown-content ${dropdowns.priceRange ? 'active' : ''}`} ref={filterRefs.priceRange}>
                {["0-20", "20-40", "40-60", "60-80", "80-100"].map((range, index) => (
                  <label key={index} className="source-sans-regular">
                    <input
                      type="checkbox"
                      value={range}
                      onChange={(e) => handleFilterChange("priceRange", range, e.target.checked)}
                    /> ${range}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-dropdown">
              <div className="filter-dropdown-header" onClick={() => toggleDropdown('author')}>
                <span className="source-sans-regular">Author</span>
                <i className="dropdown-icon">{dropdowns.author ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</i>
              </div>
              <div className={`filter-dropdown-content ${dropdowns.author ? 'active' : ''}`} ref={filterRefs.author}>
                {["Popular Authors", "New Authors", "Award Winners"].map((authorType, index) => (
                  <label key={index} className="source-sans-regular">
                    <input
                      type="checkbox"
                      value={authorType}
                      onChange={(e) => handleFilterChange("author", authorType, e.target.checked)}
                    /> {authorType}
                  </label>
                ))}
              </div>
            </div>
          </nav>
        </div>

        <div className="main-content">
          <div className="top-bar">
            <div className="sort-filter">
              <select
                className="source-sans-regular"
                value={sortMethod}
                onChange={(e) => {
                  const newSort = e.target.value;
                  setSortMethod(newSort);
                  updateDisplayedProducts(filters, newSort, activeCategory);
                }}
              >
                <option value="alpha-ascend">Sort by: Relevance</option>
                <option value="alpha-descend">A-Z Desc</option>
                <option value="date-descend">Newest Arrivals</option>
                <option value="date-ascend">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="content-wrapper">
            <div className="grid-container">
              {filteredProducts.map((book, index) => (
                <div className="grid-item" key={index}
                                  
                onClick={() => navigate('/product', { state: { product_id: book.product_id } })}
                style={{ cursor: 'pointer' }}
                >

                  <div className="item-actions">
                    {/* <button className={`favorite-btn ${favorites[index] ? 'active' : ''}`} onClick={() => toggleFavorite(index)}>
                      {favorites[index] ? <span className="heart-filled">♥</span> : <span className="heart-outline">♡</span>}
                    </button> */}
  <button
    className={`favorite-btn ${favorites[index] ? 'active' : ''}`}
    onClick={() => {
      if (favorites[index]) {
        // If already in the wishlist, remove it
        removeFromWishlist(token, book.product_id).then((result) => {
          if (result.error) {
            alert(result.error);
          } else {
            // Update the favorite state to reflect removal
            setFavorites({ ...favorites, [index]: false });
            alert("Product removed from wishlist successfully!");
          }
        });
      } else {
        // If not in the wishlist, add it
        addToWishlist(token, book.product_id).then((result) => {
          if (result.error) {
            alert(result.error);
          } else {
            // Update the favorite state to reflect addition
            setFavorites({ ...favorites, [index]: true });
            alert("Product added to wishlist successfully!");
          }
        });
      }
    }}
  >
    {favorites[index] ? (
      <span className="heart-filled">♥</span> // Filled heart for active
    ) : (
      <span className="heart-outline">♡</span> // Outline heart for inactive
    )}
  </button>
                    <button 
                    className="cart-btn" 
                    onClick={(e) => handleAddToCart(e, book)}
                  >
                    <span>🛒</span>
                  </button>
                  </div>
                  <div className="grid-item-content">
                  <img
                    src={`assets/covers/${book.name.replace(/\s+/g, '').toLowerCase()}.png`}
                    alt="Book Cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // prevents infinite loop if default also fails
                      e.currentTarget.src = bookCover;
                    }}
                  />
                </div>
                <hr />
                <div className="grid-item-header">
                  <h3 className="source-sans-semibold">
                    {getBookName(book).length > 27 ? getBookName(book).slice(0, 27) + '...' : getBookName(book)}
                  </h3>
                  <p className="source-sans-regular">{book.author || "Unknown Author"}</p>
                  <span className="source-sans-bold">${book.price || "0.00"}</span>
                </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {notification.visible && (
        <div className="cart-notification">
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;