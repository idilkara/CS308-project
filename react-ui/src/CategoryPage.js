import React, { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './CategoryPage.css';
import Navbar from "./components/Navbar.jsx"
import bookCover from './img/BookCover.png';

const CategoryPage = () => {
  // State for managing dropdown visibility
  const [dropdowns, setDropdowns] = useState({
    genres: false,
    priceRange: false,
    author: false,
    publicationYear: false
  });

  // Refs for scrollable elements
  const sidebarRef = useRef(null);
  const filterRefs = {
    genres: useRef(null),
    priceRange: useRef(null),
    author: useRef(null),
    publicationYear: useRef(null)
  };

  // State for favorite items
  const [favorites, setFavorites] = useState({});
  
  // State for active category
  const [activeCategory, setActiveCategory] = useState('All');

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown) => {
    setDropdowns({
      ...dropdowns,
      [dropdown]: !dropdowns[dropdown]
    });
  };

  // Toggle favorite status
  const toggleFavorite = (index) => {
    setFavorites({
      ...favorites,
      [index]: !favorites[index]
    });
  };

  // Book data
  const books = Array(12).fill({
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    price: 19.99,
    imageUrl: bookCover
  });

  // Category data
  const categories = [
    'All', 'Bestsellers', 'New Releases', 'Fiction', 'Non-Fiction', 'Children', 'Young Adult'
  ];

  return (
    <div>
      <Navbar />
      <div className="ccontainer">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2 className="source-sans-semibold">Book Categories</h2>
          </div>
          
          <nav className="sidebar-menu" ref={sidebarRef}>
            <div className="filter-dropdown">
              <div 
                className="filter-dropdown-header" 
                onClick={() => toggleDropdown('genres')}
              >
                <span className="source-sans-regular">Genres</span>
                <i className="dropdown-icon">{dropdowns.genres ? '▲' : '▼'}</i>
              </div>
              <div 
                className={`filter-dropdown-content ${dropdowns.genres ? 'active' : ''}`}
                ref={filterRefs.genres}
              >

                {Array(10).fill(0).map((_, index) => (
                  <label key={index} className="source-sans-regular">
                    <input type="checkbox" /> 
                    {index < 4 ? 
                      ['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery'][index] : 
                      `Genre ${index + 1}`}
                    <span className="filter-count">({75 - index * 5})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-dropdown">
              <div 
                className="filter-dropdown-header" 
                onClick={() => toggleDropdown('priceRange')}
              >
                <span className="source-sans-regular">Price Range</span>
                <i className="dropdown-icon">{dropdowns.priceRange ? '▲' : '▼'}</i>
              </div>
              <div 
                className={`filter-dropdown-content ${dropdowns.priceRange ? 'active' : ''}`}
                ref={filterRefs.priceRange}
              >
                {/* Removed filter navigation controls */}
                <div className="price-range-slider">
                  <input type="range" min="0" max="100" defaultValue="50" />
                  <div className="price-labels">
                    <span className="min-price source-sans-light">$0</span>
                    <span className="max-price source-sans-light">$100</span>
                  </div>
                </div>
                {/* Additional price range options */}
                {Array(5).fill(0).map((_, index) => (
                  <label key={index} className="source-sans-regular">
                    <input type="checkbox" /> ${index * 20} - ${(index + 1) * 20}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-dropdown">
              <div 
                className="filter-dropdown-header" 
                onClick={() => toggleDropdown('author')}
              >
                <span className="source-sans-regular">Author</span>
                <i className="dropdown-icon">{dropdowns.author ? '▲' : '▼'}</i>
              </div>
              <div 
                className={`filter-dropdown-content ${dropdowns.author ? 'active' : ''}`}
                ref={filterRefs.author}
              >
                <label className="source-sans-regular">
                  <input type="checkbox" /> Popular Authors
                </label>
                <label className="source-sans-regular">
                  <input type="checkbox" /> New Authors
                </label>
                <label className="source-sans-regular">
                  <input type="checkbox" /> Award Winners
                </label>
                {Array(8).fill(0).map((_, index) => (
                  <label key={index} className="source-sans-regular">
                    <input type="checkbox" /> Author Category {index + 1}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-dropdown">
              <div 
                className="filter-dropdown-header" 
                onClick={() => toggleDropdown('publicationYear')}
              >
                <span className="source-sans-regular">Publication Year</span>
                <i className="dropdown-icon">{dropdowns.publicationYear ? '▲' : '▼'}</i>
              </div>
              <div 
                className={`filter-dropdown-content ${dropdowns.publicationYear ? 'active' : ''}`}
                ref={filterRefs.publicationYear}
              >
                <label className="source-sans-regular">
                  <input type="checkbox" /> 2020-2023
                </label>
                <label className="source-sans-regular">
                  <input type="checkbox" /> 2015-2019
                </label>
                <label className="source-sans-regular">
                  <input type="checkbox" /> Before 2015
                </label>
                {Array(6).fill(0).map((_, index) => (
                  <label key={index} className="source-sans-regular">
                    <input type="checkbox" /> {2010 - (index * 5)}-{2014 - (index * 5)}
                  </label>
                ))}
              </div>
            </div>
          </nav>
        </div>
        <div className="main-content">
          {/* Horizontal Navigation Bar */}
          <div className="horizontal-nav">
            <div className="categories-slider">
              <div className="categories-slider-container">
                {categories.map((category, index) => (
                  <button 
                    key={index}
                    className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
                        
              <div className="top-bar">
                <div className="sort-filter">
                  <select className="source-sans-regular">
                    <option>Sort by: Relevance</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest Arrivals</option>
                    <option>Top Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="content-wrapper">
            <div className="grid-container">
              {books.map((book, index) => (
                <div className="grid-item" key={index}>
                  <div className="item-actions">
                    <button 
                      className={`favorite-btn ${favorites[index] ? 'active' : ''}`}
                      onClick={() => toggleFavorite(index)}
                    >
                      {favorites[index] ? 
                        <span className="heart-filled">♥</span> : 
                        <span className="heart-outline">♡</span>
                      }
                    </button>
                    <button className="cart-btn">
                      <span>🛒</span>
                    </button>
                  </div>
                  <div className="grid-item-content">
                    <img src={book.imageUrl} alt="Book Cover" />
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