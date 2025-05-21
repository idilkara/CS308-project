import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from './components/BookCard'; // Import the BookCard component

const WishlistTab = ({ 
  activeTab, 
  wishlistBooks, 
  removeFromWishlist, 
  notification, 
  addToCart 
}) => {
  const navigate = useNavigate();

  // Only render if this tab is active
  if (activeTab !== 'wishlist') return null;

  // Function to handle clicking on a book card
  const handleBookClick = (e, book) => {
    navigate('/product', { state: { product_id: book.product_id } });
  };

  return (
    <div>
      <h2 className="section-title">Your Wishlist</h2>
      
      {wishlistBooks && wishlistBooks.length > 0 ? (
        <div className="grid-container">
          {wishlistBooks.map(book => (
            <BookCard
              key={book.product_id}
              book={book}
              isFavorite={true} // Always true in wishlist
              onToggleFavorite={removeFromWishlist}
              onAddToCart={(e, book) => addToCart(book.product_id, 1)}
              onClick={handleBookClick}
            />
          ))}
        </div>
      ) : (
        <div className="empty-wishlist">
          <p>Your wishlist is empty.</p>
          <p>Browse our collections and add books you love to your wishlist!</p>
          <button className="browse-button" onClick={() => navigate('/category')}>Browse Books</button>
        </div>
      )}
      
      {notification.visible && (
        <div className="cart-notification">
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default WishlistTab;