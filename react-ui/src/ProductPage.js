import React, { useState } from 'react';
import "./ProductPage.css";
import Navbar from "./components/Navbar.jsx";
import ReviewForm from "./ReviewForm.js"; // Import the new component

const ProductPage = () => {
  // Sample product data
  const product = {
    name: "Product Name",
    brand: "Brand",
    price: "$19.99",
    code: "XXXXXXXXXX",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    shippingPolicy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    rating: 5,
    reviewCount: 17,
    stock: 20 // Added stock quantity
  };

  // Sample similar products
  const similarProducts = [
    { id: 1, name: "Product Name", brand: "Brand", price: "$19.99" },
    { id: 2, name: "Product Name", brand: "Brand", price: "$19.99" },
    { id: 3, name: "Product Name", brand: "Brand", price: "$19.99" },
    { id: 4, name: "Product Name", brand: "Brand", price: "$19.99" },
    { id: 5, name: "Product Name", brand: "Brand", price: "$19.99" }
  ];

  // Initialize with an empty array:
  const [comments, setComments] = useState([]);

  // State for filtering reviews
  const [reviewSort, setReviewSort] = useState('highest-rated');

  // For favorite/wishlist functionality
  const [favorites, setFavorites] = useState({});
  const [wishlistButtonText, setWishlistButtonText] = useState("Add to Wishlist");

  // Toggle favorite status
  const toggleFavorite = (id) => {
    const newFavoriteStatus = !favorites[id];
    
    setFavorites(prev => ({
      ...prev,
      [id]: newFavoriteStatus
    }));
    
    // Update button text if the ID is 'main' (the main product)
    if (id === 'main') {
      setWishlistButtonText(newFavoriteStatus ? "Added to Wishlist" : "Add to Wishlist");
    }
  };

  // Handle new review submission
  const handleReviewSubmit = (newReview) => {
    // Add the new review to the comments array
    setComments(prevComments => [newReview, ...prevComments]);
    
    // Update the review count in the product object
    // In a real app, this would be part of a more comprehensive state management
    const updatedProduct = {...product};
    updatedProduct.reviewCount = comments.length + 1;
  };

  // Sort reviews based on the selected option
  const getSortedReviews = () => {
    switch (reviewSort) {
      case 'highest-rated':
        return [...comments].sort((a, b) => b.rating - a.rating);
      case 'least-rated':
        return [...comments].sort((a, b) => a.rating - b.rating);
      case 'most-recent':
        return [...comments].sort((a, b) => new Date(b.date) - new Date(a.date));
      default:
        return comments;
    }
  };

  // Calculate average rating
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round(totalRating / reviews.length);
  };

  const sortedReviews = getSortedReviews();

  return (
    <div>
      <Navbar />
      <div className="product-container">
        
        <br></br>

        <div className="product-details-container">
          <div className="product-gallery">
            <div className="main-image">
              <div 
                className="favorite-btn"
                onClick={() => toggleFavorite('main')}
              >
                <span className={favorites['main'] ? "heart-filled" : "heart-outline"}>
                  {favorites['main'] ? "❤" : "♡"}
                </span>
              </div>
              {/* Placeholder for main product image */}
            </div>
          </div>
          
          <div className="product-info">
            <div className="product-header">
              <div className="product-brand">{product.brand}</div>
              <div className="product-rating">
                <div className="stars">
                  {comments.length > 0 
                    ? "★".repeat(calculateAverageRating(comments)) 
                    : "☆☆☆☆☆"}
                </div>
                <span className="review-count">({comments.length})</span>
              </div>
            </div>
            
            <h1 className="product-name">{product.name}</h1>
            <div className="product-price">{product.price}</div>
            <div className="product-code">Product Code: {product.code}</div>
            
            {/* Stock indicator */}
            <div className="product-stock">
              <span className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? '●' : '○'}
              </span>
              <span className="stock-text">
                {product.stock > 0 
                  ? `${product.stock} items in stock` 
                  : 'Out of stock'}
              </span>
            </div>
            
            <div className="product-add-to-cart">
              <button 
                className="add-to-cart-btn" 
                disabled={product.stock <= 0}
              >
                Add to Cart
              </button>
              <button 
                className={`wishlist-btn ${favorites['main'] ? "added" : ""}`}
                onClick={() => toggleFavorite('main')}
              >
                <span className={favorites['main'] ? "heart-filled" : "heart-outline"}>
                  {favorites['main'] ? "❤" : "♡"}
                </span>
                {wishlistButtonText}
              </button>
            </div>
            
            <div className="product-section">
              <h3 className="section-title">Product Description</h3>
              <p className="section-content">{product.description}</p>
            </div>
            
            <div className="product-section">
              <h3 className="section-title">Shipping and Return Policy</h3>
              <p className="section-content">{product.shippingPolicy}</p>
            </div>
          </div>
        </div>
        
        <div className="separator"></div>
        
        <div className="similar-products-section">
          <h2 className="section-heading">Similar Products</h2>
          <div className="similar-products-grid">
            {similarProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-card-image">
                  <div 
                    className="favorite-btn"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <span className={favorites[product.id] ? "heart-filled" : "heart-outline"}>
                      {favorites[product.id] ? "❤" : "♡"}
                    </span>
                  </div>
                </div>
                <div className="product-card-brand">{product.brand}</div>
                <div className="product-card-name">{product.name}</div>
                <div className="product-card-price">{product.price}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="separator"></div>
        
        <div className="comments-section">
          <div className="comments-header">
            <h2 className="section-heading">Comments ({comments.length})</h2>
            <div className="comments-filter">
              <select 
                className="filterRating-dropdown"
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
              >
                <option value="highest-rated">Highest Rated</option>
                <option value="least-rated">Lowest Rated</option>
                <option value="most-recent">Most Recent</option>
              </select>
            </div>
          </div>
          
          {/* Review Form */}
          <ReviewForm onSubmitReview={handleReviewSubmit} />
          
          <div className="comments-container">
            {sortedReviews.map(comment => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-user-info">
                    <div className="comment-avatar"></div>
                    <div className="comment-user-details">
                      <div className="comment-user-name">{comment.userName}</div>
                      <div className="comment-date">
                        {new Date(comment.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="comment-rating">
                    {"★".repeat(comment.rating)}
                  </div>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;