import React, { useState, useContext, useEffect } from 'react';
import bookCover from '../img/BookCover-default.png'; // Adjust path as needed for your project structure
import { Tag } from 'lucide-react';

import { useAuth } from "../context/AuthContext";

const BookCard = ({ 
  book, 
  isFavorite: initialIsFavorite, 
  onToggleFavorite, 
  onAddToCart, 
  onClick,
  showActions = true // Optional prop to hide actions when not needed
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const { token } = useAuth();

  useEffect(() => {
  setIsFavorite(initialIsFavorite || false);
}, [initialIsFavorite]);

  // Helper function to get book name consistently
  const getBookName = (book) => {
    if (book.title) return book.title;
    if (book.name) return book.name;
    if (book.productName) return book.productName;
    if (book.book_title) return book.book_title;
    return "Unknown Title";
  };

  // Function to handle wishlist toggle
  const handleToggleFavorite = async (productId) => {
    try {
      if (!token) {
        alert('Please login to add items to wishlist');
        return;
      }

      const endpoint = isFavorite ? '/wishlist/remove' : '/wishlist/add';
      
      // Use the same base URL as your other API calls (based on your console logs)
      const response = await fetch(`http://localhost/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Toggle the favorite state
      setIsFavorite(!isFavorite);
      
      // Call parent's onToggleFavorite if provided (for updating parent state)
      if (onToggleFavorite) {
        onToggleFavorite(productId);
      }
      
      console.log(data.message);
      
    } catch (error) {
      console.error('Wishlist error:', error);
      
      // Check if it's a network error or server error
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        alert('Cannot connect to server. Please check if the server is running.');
      } else {
        alert('Failed to update wishlist. Please try again.');
      }
    }
  };

  // Function to add item to cart
  const addToWishlist = async (productId) => {
    try {
      if (!token) {
        alert('Please login to add items to wishlist');
        return;
      }

      const response = await fetch(`http://localhost/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set as favorite
      setIsFavorite(true);
      
      // Call parent's onToggleFavorite if provided (for updating parent state)
      if (onToggleFavorite) {
        onToggleFavorite(productId);
      }
      
      console.log(data.message);
      alert('Item added to wishlist successfully!');
      
    } catch (error) {
      console.error('Add to wishlist error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        alert('Cannot connect to server. Please check if the server is running.');
      } else {
        alert('Failed to add to wishlist. Please try again.');
      }
    }
  };

  const isOutOfStock = !book.stock_quantity || book.stock_quantity <= 0;
  
  return (
    <div
      className={`grid-item ${isOutOfStock ? 'out-of-stock' : ''}`}
      onClick={(e) => {
        // Prevent navigation if clicking on buttons
        if (e.target.closest('.item-actions')) {
          e.stopPropagation();
          return;
        }
        if (onClick) onClick(e, book);
      }}
      style={{ cursor: 'pointer' }}
    >

      {parseFloat(book.discount_rate) > 0 && (
      <Tag className="discount-icon" size={28} color="#e60023" />
      )}
      {isOutOfStock && <span className="out-of-stock-label">Out of Stock</span>}
      
      {showActions && (
        <div className="item-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(book.product_id);
            }}
          >
            {isFavorite ? (
              <span className="heart-filled">♥</span>
            ) : (
              <span className="heart-outline">♡</span>
            )}
          </button>
          <button 
            className="cart-btn" 
            onClick={(e) => isOutOfStock ? e.preventDefault() : onAddToCart(e, book)}
            disabled={isOutOfStock}
          >
            <span>🛒</span>
          </button>
        </div>
      )}
      
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
        {parseFloat(book.discount_rate) > 0 ? (
          <div className="product-price-root">
            <span className="original-price-root">${book.price || "0.00"}</span>
            <span className="discounted-price-root">
              ${(
                parseFloat(book.price) * (1 - parseFloat(book.discount_rate))
              ).toFixed(2)}
            </span>
          </div>
        ) : (
          <span className="original-usual-price-root">${book.price || "0.00"}</span>
        )}
      </div>
    </div>
  );
};

export default BookCard;