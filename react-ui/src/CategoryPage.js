// Full CategoryPage with dynamic filtering & sorting

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './CategoryPage.css';
import Navbar from "./components/Navbar.jsx";
import bookCover from './img/BookCover.png';
import { ChevronUp, ChevronDown } from "lucide-react";
import { filterItems, sortItems } from "./utils/FilterUtils";

const CategoryPage = () => {
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://backend/products/viewall");
        const data = await res.json();
        setAllProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    fetchProducts();
  }, []);

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

  const categories = ['All', 'Bestsellers', 'New Releases', 'Fiction', 'Non-Fiction', 'Children', 'Young Adult'];

  const handleFilterChange = (filterType, value, checked) => {
    const prevValues = filters[filterType] || [];
    const updatedValues = checked
        ? [...prevValues, value]
        : prevValues.filter(v => v !== value);

    const newFilters = { ...filters, [filterType]: updatedValues };
    setFilters(newFilters);
    updateDisplayedProducts(newFilters);
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
                  {["Fiction", "Non-Fiction", "Science Fiction", "Mystery"].map((genre, index) => (
                      <label key={index} className="source-sans-regular">
                        <input
                            type="checkbox"
                            value={genre}
                            onChange={(e) => handleFilterChange("genres", genre, e.target.checked)}
                        /> {genre}
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
            <div className="horizontal-nav">
              <div className="categories-slider">
                <div className="categories-slider-container">
                  {categories.map((category, index) => (
                      <button
                          key={index}
                          className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                          onClick={() => {
                            setActiveCategory(category);
                            updateDisplayedProducts(filters, sortMethod, category);
                          }}
                      >
                        {category}
                      </button>
                  ))}
                </div>

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
              </div>
            </div>

            <div className="content-wrapper">
              <div className="grid-container">
                {filteredProducts.map((book, index) => (
                    <div className="grid-item" key={index}>
                      <div className="item-actions">
                        <button className={`favorite-btn ${favorites[index] ? 'active' : ''}`} onClick={() => toggleFavorite(index)}>
                          {favorites[index] ? <span className="heart-filled">♥</span> : <span className="heart-outline">♡</span>}
                        </button>
                        <button className="cart-btn">
                          <span>🛒</span>
                        </button>
                      </div>
                      <div className="grid-item-content">
                        <img src={book.imageUrl || bookCover} alt="Book Cover" />
                      </div>
                      <hr />
                      <div className="grid-item-header">
                        <h3 className="source-sans-semibold">{book.title}</h3>
                        <p className="source-sans-regular">{book.author}</p>
                        <span className="source-sans-bold">${book.price}</span>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CategoryPage;
