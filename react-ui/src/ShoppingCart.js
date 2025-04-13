import './ShoppingCart.css';
import Navbar from "./components/Navbar.jsx";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "./context/AuthContext"; // Import AuthContext if using Context API
import React, { useState, useEffect } from "react";


const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); // Use the auth context to check if user is logged in


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
              author: item.author || "Unknown Author",
              publisher: item.distributor_information || "Unknown Publisher",
              price: parseFloat(item.price) || 0,
              quantity: item.quantity,
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

  // Function to calculate the total price of items in cart
  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0) * item.quantity;
    }, 0);
    setCartTotal(total);
  };

  // Function to update quantity of an item
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    if (token) {
      // TODO: Implement API call to update quantity in backend
      // For now, update it locally
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
  };

  // Function to remove an item from the cart
  const removeItem = (itemId) => {
    if (token) {
      // TODO: Implement API call to remove item from backend
      // For now, remove it locally
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
    } else {
      // Remove from localStorage
      const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
      const updatedCart = tempCart.filter(item => item.id !== itemId);
      localStorage.setItem('tempCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
    }
  };

  // Function to empty the entire cart
  const emptyCart = () => {
    if (token) {
      // TODO: Implement API call to clear cart in backend
      // For now, clear it locally
      setCartItems([]);
    } else {
      // Clear localStorage
      localStorage.setItem('tempCart', JSON.stringify([]));
      setCartItems([]);
    }
  };
 

/*
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
          // Check if there are items in the temporary cart
          const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
          
          // If there are temporary items, add them to the user's cart
          if (tempCart.length > 0) {
            for (const item of tempCart) {
              await addToCart(token, item.product_id, item.quantity);
            }
            // Clear temporary cart after transferring items
            localStorage.removeItem('tempCart');
          }
          
          // Fetch the user's cart (now including any transferred items)
          const cartData = await fetchCart(token);
          setCartItems(cartData);
        } else {
          // User is not logged in, use the temporary cart
          const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
          setCartItems(tempCart);
        }
      };
    
      loadCart();
    }, [token]);


  // REMOVE FROM CART 
  // Clear the entire cart
const clearCart = async (token) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch("http://localhost/api/shopping/clear", {
      method: "DELETE",
      headers,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Cart cleared successfully:", result);
      alert("Cart cleared successfully!");
      return result;
    } else {
      const errorData = await response.json();
      console.error("Failed to clear cart:", errorData.message || "Unknown error");
      alert(errorData.message || "Failed to clear cart");
      return { error: errorData.message || "Failed to clear cart" };
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    alert("An error occurred while clearing the cart.");
    return { error: "An unexpected error occurred" };
  }
};

// to increase the quentity of the item
const addToCart = async (token, productId, quantity) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const data = { product_id: productId, quantity };

  try {
    const response = await fetch("http://localhost/api/shopping/add", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Added to cart:", result);
      return result;
    } else {
      return {
        error: "Failed to add to cart",
        status_code: response.status,
      };
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { error: "An unexpected error occurred" };
  }
};

// Remove a specific item from the cart
const removeFromCart = async (token, productId, quantity) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const data = {
    product_id: productId,
    quantity,
  };

  try {
    const response = await fetch("http://localhost/api/shopping/remove", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Removed from cart successfully:", result);
      alert("Product removed from cart successfully!");
      return result;
    } else {
      const errorData = await response.json();
      console.error("Failed to remove product from cart:", errorData.message || "Unknown error");
      alert(errorData.message || "Failed to remove product from cart");
      return { error: errorData.message || "Failed to remove product from cart" };
    }
  } catch (error) {
    console.error("Error removing product from cart:", error);
    alert("An error occurred while removing the product from the cart.");
    return { error: "An unexpected error occurred" };
  }
};




  // Calculate total
  //const cartTotal = 10.0; //cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + (price * quantity);
  }, 0);

  // Handle quantity change
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    // setCartItems(cartItems.map(item => 
    //   item.id === id ? { ...item, quantity: newQuantity } : item
    // ));
  };

  // Remove item from cart
  const removeItem = (id) => {
    if (token) {
      // Find the item to be removed to get correct productId and quantity
      const itemToRemove = cartItems.find(item => item.id === id || item.product_id === id);
      
      if (!itemToRemove) {
        console.error("Item not found in cart:", id);
        return;
      }
      
      // Log for debugging
      console.log("Removing item:", itemToRemove);
      console.log("Using product_id:", itemToRemove.product_id || itemToRemove.id);
      console.log("Using quantity:", itemToRemove.quantity);
      
      // Use proper ID (either product_id or id, depending on your API)
      const productId = itemToRemove.product_id || itemToRemove.id;
      
      // Call API to remove item
      removeFromCart(token, productId, itemToRemove.quantity)
        .then(result => {
          if (!result.error) {
            // Only update the state if the API call was successful
            setCartItems(cartItems.filter(item => (item.id !== id && item.product_id !== id)));
          } else {
            console.error("API returned error:", result.error);
          }
        });
    } else {
      // For non-logged in users with local storage cart
      const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
      
      // Log for debugging
      console.log("Current temp cart:", tempCart);
      console.log("Attempting to remove item with ID:", id);
      
      // Check what property is being used to identify items in tempCart
      // It might be product_id instead of id
      const updatedCart = tempCart.filter(item => 
        (item.id !== id && item.product_id !== id)
      );
      
      console.log("Updated temp cart:", updatedCart);
      localStorage.setItem('tempCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
    }
  }; 

  // Empty the cart
  const emptyCart = () => {
    if (token) {
      clearCart(token)
        .then(result => {
          if (!result.error) {
            setCartItems([]);
          }
        });
    } else {
      // For non-logged in users
      localStorage.removeItem('tempCart');
      setCartItems([]);
    }
  };
  */


    // Create an order CHECKOUT
    /*
const createOrder = async (token) => {
  console.log("Creating order...");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch("http://localhost/api/payment/create_order", {
      method: "POST",
      headers,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Order created successfully:", result);
      alert("Order created successfully!");
      return result;
    } else {
      const errorData = await response.json();
      console.error("Failed to create order:", errorData.message || "Unknown error");
      alert(errorData.message || "Failed to create order");
      return { error: errorData.message || "Failed to create order", status_code: response.status };
    }
  } catch (error) {
    console.error("Error creating order:", error);
    alert("An error occurred while creating the order.");
    return { error: "An unexpected error occurred" };
  }
}; */


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
            cartItems.map(item => (
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
                        <p className="current-price source-sans-semibold">
                          ${(parseFloat(item.price) || 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="item-actions">
                        <button className="remove-item source-sans-regular" onClick={() => removeItem(item.id)}>
                            <FaTrash />
                        </button>
                    </div>
                </div>
            ))
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