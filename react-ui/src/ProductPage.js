import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./ProductPage.css";
import Navbar from "./components/Navbar.jsx";
import ReviewForm from "./ReviewForm.js";
import { useAuth } from "./context/AuthContext";
import { ChevronUp, ChevronDown } from "lucide-react";
import bookCover from './img/BookCover.png';

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product_id } = location.state || {};
  const { token } = useAuth();

  const [product, setProduct] = useState({
    name: "Loading...",
    author: "Loading...",
    categories: [],
    description: "Loading product details...",
    distributor_information: "Loading distributor info...",
    model: "Loading model...",
    price: "0.00",
    serial_number: "Loading serial number...",
    stock_quantity: 0,
    waiting: false,
    warranty_status: "Loading warranty status...",
  });
  
  // States for UI management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [notification, setNotification] = useState({
    message: '',
    visible: false,
    type: 'success' // 'success' or 'error'
  });
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('most-recent');
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
  });

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (token && product_id) {
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
            const isInWishlist = wishlistData.some(item => item.product_id === product_id);
            setInWishlist(isInWishlist);
          }
        } catch (error) {
          console.error("Error checking wishlist:", error);
        }
      }
    };
    
    checkWishlist();
  }, [token, product_id]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!product_id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost/api/products/product/info/${product_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
          console.log("Fetched product data:", productData);
          
          // Fetch similar products based on categories
          if (productData.categories && productData.categories.length > 0) {
            fetchSimilarProducts(productData.categories[0]);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch product information.");
        }
      } catch (err) {
        console.error("Error fetching product information:", err);
        setError("An unexpected error occurred while fetching product information.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();

  }, [product_id]);

  // Fetch similar products based on category
  const fetchSimilarProducts = async (category) => {
    try {
      const res = await fetch("http://localhost/api/products/viewall");
      if (res.ok) {
        const allProducts = await res.json();
        
        // Find products in the same category, excluding current product
        const similar = allProducts
          .filter(p => 
            p.product_id !== product_id && 
            p.categories && 
            p.categories.includes(category)
          )
          .slice(0, 5); // Limit to 5 products
          
        setSimilarProducts(similar);
      }
    } catch (error) {
      console.error("Failed to fetch similar products", error);
    }
  };

  // Fetch product reviews
  const fetchReviews = async () => {
    if (!product_id) return;
    
    try {
      // This URL seems incorrect in your original code - replace with correct endpoint
      const response = await fetch(`http://localhost/api/reviews/product/${product_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const reviewsData = await response.json();
        console.log("Fetched reviews data:", reviewsData);
        setReviews(reviewsData);
        
        // Calculate review statistics
        const totalReviews = reviewsData.length;
        let ratingSum = 0;
        const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        
        reviewsData.forEach(review => {
          ratingSum += review.rating;
          distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });
        
        setReviewStats({
          averageRating: totalReviews > 0 ? Math.round(ratingSum / totalReviews * 10) / 10 : 0,
          totalReviews,
          distribution
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Add to cart function
  const addToCart = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      if (token) {
        // User is logged in, add to their cart in the database
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const data = { product_id: product_id, quantity: quantity };
      
        const response = await fetch("http://localhost/api/shopping/add", {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });
      
        if (response.ok) {
          const result = await response.json();
          console.log("Added to cart:", result);
          showNotification("Added to cart successfully!", "success");
        } else {
          const errorData = await response.json();
          console.error("Failed to add to cart:", errorData);
          showNotification(errorData.error || "Failed to add to cart", "error");
        }
      } else {
        // User is not logged in, store the item in local storage
        const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
        const existingItemIndex = tempCart.findIndex(item => item.id === product_id);
        
        if (existingItemIndex >= 0) {
          // Item already exists, increase quantity
          tempCart[existingItemIndex].quantity += quantity;
        } else {
          // New item, add to cart
          tempCart.push({
            id: product_id,
            name: product.name || "Unknown Title",
            price: parseFloat(product.price) || 0,
            quantity: quantity,
            author: product.author || "Unknown Author",
            publisher: product.distributor_information || "Unknown Publisher",
            image: `assets/covers/${product.name ? product.name.replace(/\s+/g, '').toLowerCase() : 'default'}.png`
          });
        }
        
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
        showNotification("Added to cart successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("An unexpected error occurred", "error");
    }
  };

  // Toggle wishlist status
  const toggleWishlist = async () => {
    if (!token) {
      showNotification("Please log in to add items to wishlist", "error");
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      
      const data = { product_id: product_id };
      const endpoint = inWishlist ? "http://localhost/api/wishlist/remove" : "http://localhost/api/wishlist/add";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setInWishlist(!inWishlist);
        showNotification(
          inWishlist ? "Removed from wishlist" : "Added to wishlist", 
          "success"
        );
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || "Failed to update wishlist", "error");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showNotification("An unexpected error occurred", "error");
    }
  };

  // Add a new review
  const handleReviewSubmit = (newReview) => {
    showNotification("Your review has been submitted!", "success");
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({
      message,
      visible: true,
      type
    });
    
    setTimeout(() => {
      setNotification({ message: '', visible: false, type });
    }, 3000);
  };

  // Sort reviews based on selected option
  const getSortedReviews = () => {
    const sorted = [...reviews];
    
    switch (reviewSort) {
      case 'highest-rated':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'least-rated':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'most-recent':
        return sorted.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
      default:
        return sorted;
    }
  };

  // Get product image path
  const getProductImage = () => {
    if (!product || !product.name) return bookCover;
    
    const imagePath = `assets/covers/${product.name.replace(/\s+/g, '').toLowerCase()}.png`;
    return imagePath;
  };

  const sortedReviews = getSortedReviews();

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="product-container loading">
          <div className="loading-spinner">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="product-container error">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate('/category')}>
              Return to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="product-container">
        <div className="product-details-container">
          <div className="product-gallery">
            <div className="main-image">
              <div 
                className={`favorite-btn ${inWishlist ? 'active' : ''}`}
                onClick={toggleWishlist}
              >
                <span className={inWishlist ? "heart-filled" : "heart-outline"}>
                  {inWishlist ? "❤" : "♡"}
                </span>
              </div>
              <img 
                src={getProductImage()} 
                alt={product.name} 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = bookCover;
                }}
              />
            </div>
            {/* Optional: Add thumbnail images here if available */}
          </div>
          
          <div className="product-info">
            <div className="product-breadcrumb">
              <span onClick={() => navigate('/category')} className="breadcrumb-link">Books</span>
              {product.categories && product.categories.length > 0 && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span>{product.categories[0]}</span>
                </>
              )}
            </div>
            
            <div className="product-header">
              <div className="product-brand">{product.author}</div>
              <div className="product-rating">
                <div className="stars">
                  {"★".repeat(Math.floor(reviewStats.averageRating))}
                  {reviewStats.averageRating % 1 >= 0.5 ? "½" : ""}
                  {"☆".repeat(5 - Math.ceil(reviewStats.averageRating))}
                </div>
                <span className="review-count">({reviewStats.totalReviews})</span>
              </div>
            </div>
            
            <h1 className="product-name">{product.name}</h1>
            <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
            <div className="product-code">Product Code: {product.product_id}</div>
            
            {/* Stock indicator */}
            <div className="product-stock">
              <span className={`stock-indicator ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock_quantity > 0 ? '●' : '○'}
              </span>
              <span className="stock-text">
                {product.stock_quantity > 0 
                  ? `${product.stock_quantity} items in stock` 
                  : 'Out of stock'}
              </span>
            </div>
            
            <div className="product-add-to-cart">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={product.stock_quantity || 100}
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.stock_quantity || 100, prev + 1))}
                  disabled={quantity >= (product.stock_quantity || 100)}
                >
                  +
                </button>
              </div>
              
              <button 
                className="add-to-cart-btn" 
                onClick={addToCart}
                disabled={product.stock_quantity <= 0}
              >
                Add to Cart
              </button>
              
              <button 
                className={`wishlist-btn ${inWishlist ? "added" : ""}`}
                onClick={toggleWishlist}
              >
                <span className={inWishlist ? "heart-filled" : "heart-outline"}>
                  {inWishlist ? "❤" : "♡"}
                </span>
                {inWishlist ? "Added to Wishlist" : "Add to Wishlist"}
              </button>
            </div>
            
            <div className="product-section">
              <h3 className="section-title">Product Description</h3>
              <p className="section-content">{product.description || "No description available."}</p>
            </div>
            
            <div className="product-section">
              <h3 className="section-title">Shipping and Return Policy</h3>
              <p className="section-content">{product.shippingPolicy || "Standard shipping and return policies apply. Contact customer service for details."}</p>
            </div>

            <div className="product-section">
              <h3 className="section-title">Warranty</h3>
              <p className="section-content">{product.warranty_status}</p>
            </div>

            
            <div className="product-section">
              <h3 className="section-title">Serial Number</h3>
              <p className="section-content">{product.serial_number}</p>
            </div>
                        
            <div className="product-section">
              <h3 className="section-title">Model</h3>
              <p className="section-content">{product.model}</p>
            </div>



          </div>
        </div>
        
        <div className="separator"></div>
        
        {/* Similar Products Section */}
        <div className="similar-products-section">
          <h2 className="section-heading">Similar Products</h2>
          <div className="similar-products-grid">
            {similarProducts.length > 0 ? (
              similarProducts.map((similarProduct, index) => (
                <div 
                  key={index} 
                  className="product-card"
                  onClick={() => navigate('/product', { state: { product_id: similarProduct.product_id } })}
                >
                  <div className="product-card-image">
                    <img 
                      src={`assets/covers/${similarProduct.name?.replace(/\s+/g, '').toLowerCase() || 'default'}.png`}
                      alt={similarProduct.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = bookCover;
                      }}
                    />
                  </div>
                  <div className="product-card-brand">{similarProduct.author || "Unknown Author"}</div>
                  <div className="product-card-name">{similarProduct.name || "Unknown Title"}</div>
                  <div className="product-card-price">${parseFloat(similarProduct.price).toFixed(2)}</div>
                </div>
              ))
            ) : (
              <div className="no-similar-products">
                No similar products found
              </div>
            )}
          </div>
        </div>
        
        <div className="separator"></div>
        
        {/* Reviews Section */}
        <div className="comments-section">
          <div className="comments-header">
            <h2 className="section-heading">Reviews ({reviewStats.totalReviews})</h2>
            <div className="comments-filter">
              <select 
                className="filterRating-dropdown"
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
              >
                <option value="most-recent">Most Recent</option>
                <option value="highest-rated">Highest Rated</option>
                <option value="least-rated">Lowest Rated</option>
              </select>
            </div>
          </div>
          
          {/* Review summary */}
          <div className="review-summary">
            <div className="review-average">
              <h3>{reviewStats.averageRating.toFixed(1)}</h3>
              <div className="stars-large">
                {"★".repeat(Math.floor(reviewStats.averageRating))}
                {reviewStats.averageRating % 1 >= 0.5 ? "½" : ""}
                {"☆".repeat(5 - Math.ceil(reviewStats.averageRating))}
              </div>
              <p>{reviewStats.totalReviews} reviews</p>
            </div>
            
            <div className="review-distribution">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="rating-bar">
                  <span>{stars} stars</span>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ 
                        width: `${reviewStats.totalReviews > 0 
                          ? (reviewStats.distribution[stars] / reviewStats.totalReviews) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span>{reviewStats.distribution[stars] || 0}</span>
                </div>
              ))}
            </div>
          </div>
          
            {/* Review Form */}
            {token !== null ? (
              <ReviewForm onSubmitReview={handleReviewSubmit} product_id={product_id} />
            ) : (
              <div>You need to log in to write a review.</div>
            )}
          {/* Reviews list */}
          <div className="comments-container">
            {sortedReviews.length > 0 ? (
              sortedReviews.map((review, index) => (
                <div key={index} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-user-info">
                      <div className="comment-avatar">
                        {/* User initial or icon */}
                        {review.name?.charAt(0) || "U"}
                      </div>
                      <div className="comment-user-details">
                        <div className="comment-user-name">{review.name || "Anonymous"}</div>
                        <div className="comment-date">
                          {new Date(review.date || review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="comment-rating">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="comment-text">{review.comment || "No review content"}</p>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification */}
      {notification.visible && (
        <div className={`cart-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ProductPage;