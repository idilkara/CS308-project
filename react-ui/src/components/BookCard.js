import React from 'react';
import bookCover from '../img/BookCover.png'; // Adjust path as needed for your project structure
import { Tag } from 'lucide-react';

const BookCard = ({ 
  book, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart, 
  onClick,
  showActions = true // Optional prop to hide actions when not needed
}) => {
  // Helper function to get book name consistently
  const getBookName = (book) => {
    if (book.title) return book.title;
    if (book.name) return book.name;
    if (book.productName) return book.productName;
    if (book.book_title) return book.book_title;
    return "Unknown Title";
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
              onToggleFavorite(book.product_id);
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