import React, { useState, useEffect, useRef, use } from 'react';
import './CategoryPage.css';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import bookCover from './img/BookCover.png';
import { ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";



const CategoryPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const location = useLocation();
  
  const searchQuery = location.state?.searchQuery || ""; // Retrieve searchQuery from state
  const categoryQuery = location.state?.selectedCategory || ""; // Retrieve selectedCategory from state
  const authorQuery = location.state?.selectedAuthor || ""; // Retrieve selectedAuthor from state
  const [searchKeyWord, setSearchKeyWord] = useState(''); 
  
  console.log("Token from AuthContext:", token);
      useEffect(() => {
        setSearchKeyWord(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
      if (categoryQuery != "") {
        console.log("Category from state:", categoryQuery);
        // Instead of setting active category, add to selectedCategories
        setSelectedCategories(prev => [...prev, categoryQuery]);
      }
    }, [categoryQuery]);

    useEffect(() => {
      if (authorQuery != "") {
        console.log("author from state:", authorQuery);
        setFilters((prevFilters) => ({
          ...prevFilters,
          author: [...prevFilters.author, authorQuery], // Add the author to the filters
        }));
      }
    }, [authorQuery]);
    useEffect(() => {
        console.log("Search keyword updated:", searchKeyWord);

        // Perform search or filter action here based on searchKeyWord
          if (searchKeyWord) {
            console.log("Filtering products with keyword:", searchKeyWord);
            const filtered = allProducts.filter(product => {
                const bookName = getBookName(product).toLowerCase();
                return bookName.includes(searchKeyWord.toLowerCase());
            });
            setFilteredProducts(filtered);
        } else {
            // If no search keyword, reset to show all products
            setFilteredProducts(allProducts);
        }

    }, [searchKeyWord]);

  // State for filter dropdowns
  const [dropdowns, setDropdowns] = useState({
    categories: false,
    priceRange: false,
    author: false,
    publicationYear: false
  });

  // Refs for sidebar elements
  const sidebarRef = useRef(null);
  const filterRefs = {
    categories: useRef(null),
    priceRange: useRef(null),
    author: useRef(null),
    publicationYear: useRef(null)
  };

  // State for product data and filters
  const [favorites, setFavorites] = useState({});
  // Replace activeCategory with selectedCategories array
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [],
    author: []
  });
  const [sortMethod, setSortMethod] = useState("alpha-ascend");
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState({
    message: '',
    visible: false
  });
  

  // Price range state
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [customPriceRange, setCustomPriceRange] = useState({ min: 0, max: 100 });

  // Handle incoming category selection from HomePage
  useEffect(() => {
    if (location.state && location.state.selectedCategory) {
      const selected = location.state.selectedCategory;
      
      // Add to selectedCategories instead of setting activeCategory
      setSelectedCategories(prev => {
        if (prev.includes('All')) {
          return [selected];
        }
        return [...prev, selected];
      });
      
      // Open the categories dropdown
      setDropdowns(prev => ({
        ...prev,
        categories: true
      }));
      
      // Clear navigation state to prevent reapplying on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Add a separate useEffect that will trigger when selectedCategories changes
  useEffect(() => {
    if (selectedCategories.length > 0) {
      updateDisplayedProducts();
    }
  }, [selectedCategories, allProducts]); // Include allProducts to ensure we have data
  

  // Fetch products on component mount
  // Update the fetch products useEffect to apply sorting when products are first loaded
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost/api/products/viewall");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched products:", data);
        
        // Store the raw data in allProducts
        setAllProducts(data);
        
        // Apply initial sorting to move out-of-stock items to the bottom
        const sortedData = sortProducts(data, sortMethod);
        
        // Set initially sorted data for display
        setFilteredProducts(sortedData);
  
        // Initialize favorites state based on wishlist if token exists
        if (token) {
          fetchWishlist(token).then(wishlistData => {
            if (wishlistData && Array.isArray(wishlistData)) {
              // Create a map using product_id as keys instead of array indices
              const wishlistMap = {};
              wishlistData.forEach(item => {
                wishlistMap[item.product_id] = true;
              });
              setFavorites(wishlistMap);
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, [token, sortMethod]); // Add sortMethod as a dependency
  
  // Modify the search effect to maintain sorting after filtering
  useEffect(() => {
    if (searchKeyWord) {
      console.log("Filtering products with keyword:", searchKeyWord);
  
      const filtered = allProducts.filter(product => {
        // Check all fields of the product and the categories array
        return (
          Object.values(product).some(value => {
            if (typeof value === "string") {
              return value.toLowerCase().includes(searchKeyWord.toLowerCase());
            }
            return false; // Skip non-string fields
          }) ||
          // Check if the searchKeyWord exists in the categories array
          (Array.isArray(product.categories) &&
            product.categories.some(category =>
              category.toLowerCase().includes(searchKeyWord.toLowerCase())
            ))
        );
      });
  
      // Apply sorting to maintain out-of-stock items at the bottom
      const sortedFiltered = sortProducts(filtered, sortMethod);
      setFilteredProducts(sortedFiltered);
    } else {
      // If no search keyword, reset to show all products (sorted)
      const sortedAllProducts = sortProducts(allProducts, sortMethod);
      setFilteredProducts(sortedAllProducts);
    }
  }, [searchKeyWord, allProducts, sortMethod]); 

  // Fetch categories on component mount
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
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Update filtered products when filters or sort method changes
  useEffect(() => {
    updateDisplayedProducts();
  }, [filters, sortMethod, selectedCategories]);

  // Fetch wishlist data
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
        return wishlistData;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch wishlist:", errorData.message || "Unknown error");
        return null;
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return null;
    }
  };

// Consolidated addToCart function for CategoryPage
const addToCart = async (event, book) => {
  if (event) {
    event.stopPropagation(); // Stop the event from propagating to the parent div
  }
  
  // Check if item is out of stock
  if (!book.stock_quantity || book.stock_quantity <= 0) {
    setNotification({
      message: "This item is currently out of stock",
      visible: true
    });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
    return { error: "Out of stock" };
  }
  
  try {
    if (token) {
      // User is logged in, add to their cart in the database
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const data = { product_id: book.product_id, quantity: 1 };
    
      const response = await fetch("http://localhost/api/shopping/add", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
    
      if (response.ok) {
        const result = await response.json();
        console.log("Added to cart:", result);
        // Show success message
        setNotification({
          message: "Added to cart successfully!",
          visible: true
        });
        setTimeout(() => {
          setNotification({ message: '', visible: false });
        }, 3000);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to add to cart:", errorData);
        setNotification({
          message: errorData.error || "Failed to add to cart",
          visible: true
        });
        setTimeout(() => {
          setNotification({ message: '', visible: false });
        }, 3000);
        return {
          error: errorData.error || "Failed to add to cart",
          status_code: response.status,
        };
      }
    } else {
      // User is not logged in, store the item in local storage
      const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
      const existingItemIndex = tempCart.findIndex(item => item.id === book.product_id);
      
      if (existingItemIndex >= 0) {
        // Item already exists, increase quantity
        tempCart[existingItemIndex].quantity += 1;
      } else {
        // New item, add to cart
        tempCart.push({
          id: book.product_id,
          name: getBookName(book),
          price: parseFloat(book.price) || 0,
          quantity: 1,
          author: book.author || "Unknown Author",
          publisher: book.distributor_information || "Unknown Publisher",
          image: `assets/covers/${book.name ? book.name.replace(/\s+/g, '').toLowerCase() : 'default'}.png`
        });
      }
      
      localStorage.setItem('tempCart', JSON.stringify(tempCart));
      setNotification({
        message: "Added to cart successfully!",
        visible: true
      });
      setTimeout(() => {
        setNotification({ message: '', visible: false });
      }, 3000);
      return { success: true };
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    setNotification({
      message: "An unexpected error occurred",
      visible: true
    });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
    return { error: "An unexpected error occurred" };
  }
};

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!token) {
      alert("Please log in to add items to wishlist");
      return { error: "Authentication required" };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = {
      product_id: productId
    };

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

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!token) {
      return { error: "Authentication required" };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = {
      product_id: productId
    };

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

  // Update displayed products based on filters and sorting
  const updateDisplayedProducts = () => {
    // Start with all products
    let filtered = [...allProducts];
   
    // Apply category filter - modified to handle multiple categories
    if (!selectedCategories.includes('All')) {
      filtered = filtered.filter(product =>
        // Check if product.categories array contains any of the selected categories
        product.categories && Array.isArray(product.categories) &&
        product.categories.some(category => selectedCategories.includes(category))
      );
    }
   
    // Apply price range filter
    if (filters.priceRange && filters.priceRange.length > 0) {
      filtered = filtered.filter(product => {
        const productPrice = parseFloat(product.price) || 0;
        return filters.priceRange.some(range => {
          const [min, max] = range.split('-').map(Number);
          return productPrice >= min && productPrice <= max;
        });
      });
    }
   
    // Apply custom price range if set
    if (customPriceRange.min > 0 || customPriceRange.max < 100) {
      filtered = filtered.filter(product => {
        const productPrice = parseFloat(product.price) || 0;
        return productPrice >= customPriceRange.min && productPrice <= customPriceRange.max;
      });
    }
   
    // Apply author filter
    if (filters.author && filters.author.length > 0) {
      filtered = filtered.filter(product =>
        filters.author.includes(product.author)
      );
    }
   
    // Sort filtered products
    const sorted = sortProducts(filtered, sortMethod);
    setFilteredProducts(sorted);
  };

  // Custom sort function - updated to include popularity sort based on average_rating
  const sortProducts = (products, sortMethod) => {
    // First, separate in-stock and out-of-stock items
    const inStock = products.filter(item => item.stock_quantity > 0);
    const outOfStock = products.filter(item => !item.stock_quantity || item.stock_quantity <= 0);
    
    // Sort each group by the selected method
    let sortedInStock = [...inStock];
    let sortedOutOfStock = [...outOfStock];
    
    switch (sortMethod) {
      case 'alpha-ascend':
        sortedInStock.sort((a, b) => getBookName(a).localeCompare(getBookName(b)));
        sortedOutOfStock.sort((a, b) => getBookName(a).localeCompare(getBookName(b)));
        break;
      case 'alpha-descend':
        sortedInStock.sort((a, b) => getBookName(b).localeCompare(getBookName(a)));
        sortedOutOfStock.sort((a, b) => getBookName(b).localeCompare(getBookName(a)));
        break;
      case 'price-ascend':
        sortedInStock.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        sortedOutOfStock.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price-descend':
        sortedInStock.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        sortedOutOfStock.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'date-ascend':
        sortedInStock.sort((a, b) => new Date(a.publication_date || 0) - new Date(b.publication_date || 0));
        sortedOutOfStock.sort((a, b) => new Date(a.publication_date || 0) - new Date(b.publication_date || 0));
        break;
      case 'date-descend':
        sortedInStock.sort((a, b) => new Date(b.publication_date || 0) - new Date(a.publication_date || 0));
        sortedOutOfStock.sort((a, b) => new Date(b.publication_date || 0) - new Date(a.publication_date || 0));
        break;
      case 'popularity': // New case for popularity sort
        sortedInStock.sort((a, b) => (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0));
        sortedOutOfStock.sort((a, b) => (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0));
        break;
    }
    
    // Return in-stock items first, followed by out-of-stock items
    return [...sortedInStock, ...sortedOutOfStock];
  };

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown) => {
    setDropdowns({ ...dropdowns, [dropdown]: !dropdowns[dropdown] });
  };

// Toggle favorite status - update to use product ID as key
const toggleFavorite = (productId) => {
  if (favorites[productId]) {
      removeFromWishlist(productId).then((result) => {
        if (!result.error) {
        // Use product ID as key instead of index
        const updatedFavorites = { ...favorites };
        delete updatedFavorites[productId];
        setFavorites(updatedFavorites);
        }
      });
    } else {
      addToWishlist(productId).then((result) => {
        if (!result.error) {
        // Use product ID as key instead of index
        setFavorites({ ...favorites, [productId]: true });
        }
      });
    }
  };

  // Handle filter checkbox changes
  const handleFilterChange = (filterType, value, checked) => {
    const prevValues = filters[filterType] || [];
    let updatedValues;
    if (checked) {
      updatedValues = [...prevValues, value];
    } else {
      updatedValues = prevValues.filter(v => v !== value);
    }
    setFilters({ ...filters, [filterType]: updatedValues });
  };

  // Handle price range input changes
  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setCustomPriceRange({ ...customPriceRange, [name]: parseFloat(value) });
  };

  // Apply custom price range
  const applyPriceRange = () => {
    setPriceRange(customPriceRange);
    updateDisplayedProducts();
  };

  // Get book name from various possible properties
  const getBookName = (book) => {
    if (book.title) return book.title;
    if (book.name) return book.name;
    if (book.productName) return book.productName;
    if (book.book_title) return book.book_title;
    return "Unknown Title";
  };

  // Count products in each category for the filter count
  const getCategoryCount = (categoryName) => {
    return allProducts.filter(product =>
      product.categories &&
      Array.isArray(product.categories) &&
      product.categories.includes(categoryName)
    ).length;
  };

  // Handle category selection/deselection
  const handleCategoryChange = (categoryName, checked) => {
    setSelectedCategories(prev => {
      // If "All" is being selected, return only "All"
      if (categoryName === 'All' && checked) {
        return ['All'];
      }
      
      // If any other category is being selected, remove "All"
      let newCategories = prev.filter(cat => cat !== 'All');
      
      if (checked) {
        // Add the category
        newCategories.push(categoryName);
      } else {
        // Remove the category
        newCategories = newCategories.filter(cat => cat !== categoryName);
      }
      
      // If no categories are selected, default to "All"
      if (newCategories.length === 0) {
        return ['All'];
      }
      
      return newCategories;
    });
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
            {/* Categories filter dropdown */}
            <div className="filter-dropdown">
              <div className="filter-dropdown-header" onClick={() => toggleDropdown('categories')}>
                <span className="source-sans-regular">Categories</span>
                <i className="dropdown-icon">
                  {dropdowns.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </i>
              </div>
              <div
                className={`filter-dropdown-content ${dropdowns.categories ? 'active' : ''}`}
                ref={filterRefs.categories}
              >
                {/* "All" option */}
                <label className="source-sans-regular">
                  <input
                    type="checkbox"
                    value="All"
                    onChange={(e) => handleCategoryChange('All', e.target.checked)}
                    checked={selectedCategories.includes('All')}
                  />
                  All
                </label>
                {/* Categories from API */}
                {categories.map((category, index) => (
                  <label key={index} className="source-sans-regular">
                    <input
                      type="checkbox"
                      value={category.name}
                      onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                      checked={selectedCategories.includes(category.name)}
                    />
                    {category.name}
                    <span className="filter-count">({getCategoryCount(category.name) || 0})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range filter dropdown */}
            <div className="filter-dropdown">
              <div
                className="filter-dropdown-header"
                onClick={() => toggleDropdown('priceRange')}
              >
                <span className="source-sans-regular">Price Range</span>
                <i className="dropdown-icon">
                  {dropdowns.priceRange ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </i>
              </div>
              <div
                className={`filter-dropdown-content ${dropdowns.priceRange ? 'active' : ''}`}
                ref={filterRefs.priceRange}
              >
                {/* Predefined price ranges */}
                {["0-20", "20-40", "40-60", "60-80", "80-100","100-500"].map((range, index) => (
                  <label key={index} className="source-sans-regular">
                    <input
                      type="checkbox"
                      value={range}
                      onChange={(e) => handleFilterChange("priceRange", range, e.target.checked)}
                      checked={filters.priceRange.includes(range)}
                    />
                    ${range}
                  </label>
                ))}
                {/* Custom price range */}
                <div className="price-range-input">
                  <input
                    type="number"
                    name="min"
                    min="1"
                    max="100"
                    value={customPriceRange.min}
                    onChange={handlePriceRangeChange}
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    name="max"
                    min="1"
                    max="500"
                    value={customPriceRange.max}
                    onChange={handlePriceRangeChange}
                    placeholder="Max"
                  />
                  <button onClick={applyPriceRange}>Apply</button>
                </div>
              </div>
            </div>

            {/* Author filter dropdown */}
            <div className="filter-dropdown">
              <div
                className="filter-dropdown-header"
                onClick={() => toggleDropdown('author')}
              >
                <span className="source-sans-regular">Author</span>
                <i className="dropdown-icon">
                  {dropdowns.author ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </i>
              </div>
              <div
                className={`filter-dropdown-content ${dropdowns.author ? 'active' : ''}`}
                ref={filterRefs.author}
              >
                {/* Get unique authors from products */}
                {Array.from(new Set(allProducts.map(p => p.author).filter(Boolean)))
                  .slice(0, 10)
                  .map((author, index) => (
                    <label key={index} className="source-sans-regular">
                      <input
                        type="checkbox"
                        value={author}
                        onChange={(e) => handleFilterChange("author", author, e.target.checked)}
                        checked={filters.author.includes(author)}
                      />
                      {author}
                      <span className="filter-count">
                        ({allProducts.filter(p => p.author === author).length})
                      </span>
                    </label>
                  ))
                }
              </div>
            </div>
          </nav>
        </div>

        <div className="main-content">
          <div className="top-bar">
            {searchKeyWord !== "" && (
              <div className="search-result-info">
                <h3 className="source-sans-semibold">Showing products for your search: "{searchKeyWord}"</h3>
                <button 
                  className="clear-search-btn"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear the search?")) {
                      setFilters({ priceRange: [], author: [] });
                      setSelectedCategories(['All']);
                      setCustomPriceRange({ min: 0, max: 100 });
                      setSearchKeyWord('');
                      setFilteredProducts(allProducts);
                    }
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}

            <div className="sort-filter">
              <select
                className="source-sans-regular"
                value={sortMethod}
                onChange={(e) => {
                  setSortMethod(e.target.value);
                }}
              >
                <option value="alpha-ascend">Sort by: A-Z</option>
                <option value="alpha-descend">Sort by: Z-A</option>
                <option value="price-ascend">Price: Low to High</option>
                <option value="price-descend">Price: High to Low</option>
                <option value="date-descend">Newest Arrivals</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>

          <div className="content-wrapper">
            <div className="grid-container">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((book, index) => {
                const isOutOfStock = !book.stock_quantity || book.stock_quantity <= 0;
                
                return (
                  <div
                    className={`grid-item ${isOutOfStock ? 'out-of-stock' : ''}`}
                    key={book.product_id}
                    onClick={(e) => {
                      // Prevent navigation if clicking on buttons
                      if (e.target.closest('.item-actions')) {
                        e.stopPropagation();
                        return;
                      }
                      navigate('/product', { state: { product_id: book.product_id } });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {isOutOfStock && <span className="out-of-stock-label">Out of Stock</span>}
                    <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`favorite-btn ${favorites[book.product_id] ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(book.product_id);
                        }}
                      >
                        {favorites[book.product_id] ? (
                          <span className="heart-filled">♥</span>
                        ) : (
                          <span className="heart-outline">♡</span>
                        )}
                      </button>
                      <button 
                        className="cart-btn" 
                        onClick={(e) => isOutOfStock ? e.preventDefault() : addToCart(e, book)}
                        disabled={isOutOfStock}
                      >
                        <span>🛒</span>
                        </button>
                    </div>
                    <div className="grid-item-content">
                      <img
                        src={`assets/covers/${book.name?.replace(/\s+/g, '').toLowerCase() || 'default'}.png`}
                        alt={getBookName(book)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = bookCover;
                        }}
                      />
                    </div>
                    <hr />
                    <div className="grid-item-header">
                      <h3 className="source-sans-semibold">
                        {getBookName(book).length > 27
                          ? getBookName(book).slice(0, 27) + '...'
                          : getBookName(book)
                        }
                      </h3>
                      <p className="source-sans-regular">{book.author || "Unknown Author"}</p>
                      <span className="source-sans-bold">${book.price || "0.00"}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid-container no-results-active">
                  <div className="no-results">
                    <h3>No books match your current filters</h3>
                    <p>Try adjusting your filter criteria or clear filters to see more results.</p>
                    <button
                      onClick={() => {
                        setFilters({priceRange: [], author: []});
                        setSelectedCategories(['All']); 
                        setCustomPriceRange({ min: 0, max: 100 });
                        setSearchKeyWord(''); // Clear search keyword
                        setFilteredProducts(allProducts); // Reset to show all products
                      }}
                      className="clear-filters-btn"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
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