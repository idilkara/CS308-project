import './ShoppingCart.css';
import Navbar from "./components/Navbar.jsx";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "./context/AuthContext"; // Import AuthContext if using Context API
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth(); // Use the auth context to check if user is logged in

  // Update the checkout button onClick handler
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  useEffect(() => {
    fetchCart();
  }, [token]);

  // Calculate total whenever cart items change
  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  // Function to fetch cart items from backend or local storage
  const fetchCart = async () => {
    setLoading(true);
    
    try {
      if (token) {
        // User is logged in, fetch from API
        const response = await fetch("http://localhost/api/shopping/view", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Transform the API response to match our cart item structure
          if (Array.isArray(data)) {
            const formattedItems = data.map(item => ({
              id: item.product_id,
              name: item.name,
              author: item.author,
              publisher: item.distributor_information,
              price: parseFloat(item.price) || 0,
              discount_rate: parseFloat(item.discount_rate) || 0,
              quantity: item.quantity,
              stock_quantity: item.stock_quantity,
              image: `assets/covers/${item.name.replace(/\s+/g, '').toLowerCase()}.png`
            }));

            setCartItems(formattedItems);
          } else {
            // Empty cart or message received
            setCartItems([]);
          }
        } else {
          console.error("Failed to fetch cart:", await response.json());
          setCartItems([]);
        }
      } else {
        // User is not logged in, get from localStorage
        const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
        setCartItems(tempCart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate the total price of items in cart (with discounts)
  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      // Calculate final price after discount
      const discountMultiplier = 1 - (item.discount_rate || 0);
      const finalPrice = (parseFloat(item.price) || 0) * discountMultiplier;
      return sum + finalPrice * item.quantity;
    }, 0);
    setCartTotal(total);
  };

  // Calculate the discounted price for an item
  const getDiscountedPrice = (item) => {
    if (!item.discount_rate || item.discount_rate <= 0) return null;
    const discountMultiplier = 1 - item.discount_rate;
    return (parseFloat(item.price) * discountMultiplier).toFixed(2);
  };

  // Function to update quantity of an item
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    const currentItem = cartItems.find(item => item.id === itemId);

    console.log("Current item:", currentItem);
    console.log("New quantity:", newQuantity);
    console.log("Current item stock quantity:", currentItem.stock_quantity);
    if (!currentItem) return;
    
    // Don't allow quantities greater than stock
    if (newQuantity > currentItem.stock_quantity) {
      console.log(`Cannot add more than ${currentItem.stock_quantity} items to the cart.`);
      newQuantity = currentItem.stock_quantity;
    }
    
    try {
      if (token) {
        // Get current quantity
        const currentItem = cartItems.find(item => item.id === itemId);
        if (!currentItem) return;
        
        const currentQty = currentItem.quantity;
        const difference = newQuantity - currentQty;

        console.log("Current item quantity:", currentQty);
        console.log("Difference:", difference);

        // If increasing quantity, use "add" endpoint
        if (difference > 0) {
          await fetch("http://localhost/api/shopping/add", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              product_id: itemId,
              quantity: difference
            })
          });
        } 
        // If decreasing quantity, use "remove" endpoint
        else if (difference < 0) {
          await fetch("http://localhost/api/shopping/remove", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              product_id: itemId,
              quantity: Math.abs(difference)
            })
          });
        }
        console.log("Quantity updated successfully");
        // Update local state to reflect the change immediately
        const updatedItems = cartItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
      } else {
        // Update in localStorage
        const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
        const updatedCart = tempCart.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('tempCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  // Function to remove an item from the cart
  const removeItem = async (itemId) => {
    try {
      if (token) {
        // Make API call to remove item from backend
        const response = await fetch("http://localhost/api/shopping/remove", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            product_id: itemId,
            quantity: 1000 // Set a large quantity to remove the entire item
          })
        });
        
        if (response.ok) {
          // If successful, update the local state
          const updatedItems = cartItems.filter(item => item.id !== itemId);
          setCartItems(updatedItems);
          console.log("Item removed from cart successfully");
        } else {
          console.error("Failed to remove item from cart:", await response.json());
        }
      } else {
        // Remove from localStorage for non-logged in users
        const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
        const updatedCart = tempCart.filter(item => item.id !== itemId);
        localStorage.setItem('tempCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // Function to empty the entire cart
  const emptyCart = async () => {
    try {
      if (token) {
        // Make API call to clear cart in backend
        const response = await fetch("http://localhost/api/shopping/clear", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          setCartItems([]);
          console.log("Cart cleared successfully");
        } else {
          console.error("Failed to clear cart:", await response.json());
        }
      } else {
        // Clear localStorage
        localStorage.setItem('tempCart', JSON.stringify([]));
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };
  
  // Function to handle continue shopping button
  const handleContinueShopping = () => {
    navigate('/');
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
          {loading ? (
            <p>Loading your cart...</p>
          ) : cartItems.length > 0 ? (
              cartItems.map(item => {
                const discountedPrice = getDiscountedPrice(item);
                return (
                  <div className="cart-item" key={item.id}>
                    <div className="item-image">
                      <img src={item.image} alt={item.name} onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "assets/covers/default.png";
                      }} />
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
                      {discountedPrice ? (
                        <div className="price-container">
                          <p className="original-price source-sans-regular">
                            <del>${(parseFloat(item.price) || 0).toFixed(2)}</del>
                          </p>
                          <p className="discounted-price-root source-sans-semibold">
                            ${discountedPrice}
                          </p>
                        </div>
                      ) : (
                        <p className="current-price source-sans-semibold">
                          ${(parseFloat(item.price) || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="item-actions">
                      <button className="remove-item source-sans-regular" onClick={() => removeItem(item.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })
          ) : (
              <p>Your cart is empty.</p>
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-actions">
            <button className="clear-cart source-sans-regular" onClick={emptyCart}>
              <FaTrash /> Clear Cart
            </button>
          </div>
          
          <div className="cart-summary">
            <div className="total-section">
              <div className="total-row grand-total">
                <span className="total-label source-sans-bold">Total:</span>
                <span className="total-value source-sans-bold">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button className="checkout-button source-sans-bold" onClick={handleCheckout}>CHECKOUT</button>
            <button className="continue-shopping source-sans-semibold" onClick={handleContinueShopping}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;