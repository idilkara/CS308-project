
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './CategoryPage.css';
import Navbar from "./components/Navbar.jsx";
import bookCover from './img/BookCover.png';
import { ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "./context/AuthContext";

const CategoryPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

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
  const [activeCategory, setActiveCategory] = useState('All');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [],
    author: []
  });
  const [sortMethod, setSortMethod] = useState("alpha-ascend");
  const [categories, setCategories] = useState([]);

  // Price range state
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [customPriceRange, setCustomPriceRange] = useState({ min: 0, max: 100 });

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost/api/products/viewall");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);

        }
        const data = await res.json();
        console.log("Fetched products:", data);
        setAllProducts(data);
        setFilteredProducts(data);

        // Initialize favorites state based on wishlist if token exists
        if (token) {
          fetchWishlist(token).then(wishlistData => {
            if (wishlistData && Array.isArray(wishlistData)) {
              const wishlistMap = {};
              data.forEach((product, index) => {
                const isInWishlist = wishlistData.some(item => item.product_id === product.product_id);
                if (isInWishlist) {
                  wishlistMap[index] = true;
                }
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
  }, [token]);

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
  }, [filters, sortMethod, activeCategory]);

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

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      alert("Please log in to add items to cart");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = {
      product_id: productId,
      quantity
    };

    try {
      const response = await fetch("http://localhost/api/shopping/add", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Added to cart successfully!");
        return result;
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to add to cart");
        return {
          error: errorData.message || "Failed to add to cart",
          status_code: response.status,
        };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("An unexpected error occurred");
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
   
    // Apply category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(product =>
        // Check if product.categories array contains the active category
        product.categories && Array.isArray(product.categories) &&
        product.categories.includes(activeCategory)
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

  // Custom sort function
  const sortProducts = (products, sortMethod) => {
    const sorted = [...products];
    switch (sortMethod) {
      case 'alpha-ascend':
        return sorted.sort((a, b) => getBookName(a).localeCompare(getBookName(b)));
      case 'alpha-descend':
        return sorted.sort((a, b) => getBookName(b).localeCompare(getBookName(a)));
      case 'price-ascend':
        return sorted.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
      case 'price-descend':
        return sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
      case 'date-ascend':
        return sorted.sort((a, b) => new Date(a.publication_date || 0) - new Date(b.publication_date || 0));
      case 'date-descend':
        return sorted.sort((a, b) => new Date(b.publication_date || 0) - new Date(a.publication_date || 0));
      default:
        return sorted;
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown) => {
    setDropdowns({ ...dropdowns, [dropdown]: !dropdowns[dropdown] });
  };

  // Toggle favorite status
  const toggleFavorite = (index, productId) => {
    if (favorites[index]) {
      removeFromWishlist(productId).then((result) => {
        if (!result.error) {
          setFavorites({ ...favorites, [index]: false });
        }
      });
    } else {
      addToWishlist(productId).then((result) => {
        if (!result.error) {
          setFavorites({ ...favorites, [index]: true });
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
                    onChange={() => setActiveCategory('All')}
                    checked={activeCategory === 'All'}
                  />
                  All
                </label>
                {/* Categories from API */}
                {categories.map((category, index) => (
                  <label key={index} className="source-sans-regular">
                    <input
                      type="checkbox"
                      value={category.name}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setActiveCategory(category.name);
                        } else {
                          setActiveCategory('All');
                        }
                      }}
                      checked={activeCategory === category.name}
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
              </select>
            </div>
          </div>

          <div className="content-wrapper">
            <div className="grid-container">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((book, index) => (
                  <div
                    className="grid-item"
                    key={index}
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
                    <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`favorite-btn ${favorites[index] ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(index, book.product_id);
                        }}
                      >
                        {favorites[index] ? (
                          <span className="heart-filled">♥</span>
                        ) : (
                          <span className="heart-outline">♡</span>
                        )}
                      </button>
                      <button
                        className="cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(book.product_id, 1);
                        }}
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
                ))
              ) : (
                <div className="no-results">
                  <h3>No books match your current filters</h3>
                  <p>Try adjusting your filter criteria or clear filters to see more results.</p>
                  <button
                    onClick={() => {
                      setFilters({priceRange: [], author: []});
                      setActiveCategory('All');
                      setCustomPriceRange({ min: 0, max: 100 });
                    }}
                    className="clear-filters-btn"
                  >
                    Clear All Filters
                  </button>
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