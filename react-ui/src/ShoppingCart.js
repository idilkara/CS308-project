
import './ShoppingCart.css';
import Navbar from "./components/Navbar.jsx";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "./context/AuthContext"; // Import AuthContext if using Context API
import React, { useState, useEffect } from "react";


const ShoppingCart = () => {

  const { token } = useAuth();

  console.log("Token from context:", token); // Log the token to check if it's being passed correctly
  // Initial cart state
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Klara and the Sun",
      publisher: "Yapi Kredi Yayinlari",
      author: "Kazuo Ishiguro",
      price: 19.99,
      originalPrice: 19.99, // No discount
      quantity: 1,
      image: "https://m.media-amazon.com/images/I/61tqFlvlU3L._AC_UF1000,1000_QL80_.jpg"
    }
  ]);


    const fetchCart = async (token) => {
      try {
          console.log("Fetching cart with token:", token);
          const response = await fetch("http://localhost/api/shopping/view", {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
          });

          if (response.ok) {
              const cartData = await response.json();
              console.log("Cart fetched successfully:", cartData);
              return Array.isArray(cartData) ? cartData : []; // Ensure the response is an array
          } else {
              const errorData = await response.json();
              console.error("Failed to fetch cart:", errorData.message || "Unknown error");
              return []; // Return an empty array on error
          }
      } catch (error) {
          console.error("Error fetching cart:", error);
          return []; // Return an empty array on error
      }
  };


    // Fetch cart data when the component mounts
    useEffect(() => {
      const loadCart = async () => {
          if (token) {
              const cartData = await fetchCart(token);
              setCartItems(cartData); // Update the cart state with fetched data
          } else {
              console.error("Token is missing. Unable to fetch cart.");
          }
      };
  
      loadCart();
  }, [token]);


  // Calculate total
  const cartTotal = 10.0; //cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle quantity change
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    // setCartItems(cartItems.map(item => 
    //   item.id === id ? { ...item, quantity: newQuantity } : item
    // ));
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Empty the cart
  const emptyCart = () => {
    setCartItems([]);
  };

  return (
    <div>
      <Navbar /> 
      <div className="shopping-cart-container">
        <div className="cart-header">
          <h2 className="cart-title source-sans-bold">
            <i className="cart-icon">🛒</i> My Cart
          </h2>
        </div>
  
        <div className="cart-content">
          {cartItems.length > 0 ? (
              cartItems.map(item => (
                  <div className="cart-item" key={item.id}>
                      <div className="item-image">
                          <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                          <h3 className="item-name source-sans-semibold">{item.name}</h3>
                          <p className="item-publisher source-sans-regular">{item.publisher}</p>
                          <p className="item-author source-sans-regular">{item.author}</p>
                      </div>
                      <div className="item-quantity">
                          <span className="quantity-label source-sans-semibold">Quantity</span>
                          <div className="quantity-controls">
                              <button 
                                  className="quantity-btn source-sans-semibold" 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                  −
                              </button>
                              <span className="quantity-value source-sans-regular">{item.quantity}</span>
                              <button 
                                  className="quantity-btn source-sans-semibold" 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                  +
                              </button>
                          </div>
                      </div>
                      <div className="item-price">
                          <span className="price-label source-sans-semibold">Price</span>
                          <p className="current-price source-sans-semibold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="item-actions">
                          <button className="remove-item source-sans-regular" onClick={() => removeItem(item.id)}>
                              <FaTrash />
                          </button>
                      </div>
                  </div>
              ))
          ) : (
              <p>Your cart is empty.</p> // Fallback message
          )}
      </div>




  
        <div className="cart-footer">
          <div className="cart-actions">
            <button className="clear-cart source-sans-regular" onClick={emptyCart}>
              <FaTrash /> Clear Cart
            </button>
          </div>
          
          <div className="cart-summary">
            <div className="coupon-section">
              <input type="text" placeholder="Coupon/Gift Card Code" className="coupon-input source-sans-regular" />
              <button className="apply-coupon source-sans-semibold">Apply</button>
            </div>
            
            <div className="total-section">
              <div className="total-row grand-total">
                <span className="total-label source-sans-bold">Total:</span>
                <span className="total-value source-sans-bold">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button className="checkout-button source-sans-bold">CHECKOUT</button>
            <button className="continue-shopping source-sans-semibold">Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;