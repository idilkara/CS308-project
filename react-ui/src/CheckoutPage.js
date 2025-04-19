import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { useAuth } from "./context/AuthContext";
import "./CheckoutPage.css";
import bookCover from './img/BookCover.png';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  // Cart and order states
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 4.99,
    tax: 0,
    total: 0
  });

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    saveCard: false
  });

  const [activeStep, setActiveStep] = useState('shipping');
  const [formErrors, setFormErrors] = useState({});
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, [token]);

  // Calculate summary whenever cart items change
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
    const taxRate = 0.08; // 8% tax rate
    const tax = subtotal * taxRate;
    const shipping = subtotal > 50 ? 0 : 4.99; // Free shipping for orders over $50
    const total = subtotal + tax + shipping;

    setOrderSummary({
      subtotal,
      shipping,
      tax,
      total
    });
  }, [cartItems]);

  // Fetch user info if authenticated
  useEffect(() => {
    if (token) {
      fetchUserInfo();
    }
  }, [token]);

  // Function to fetch cart items
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

  // Function to fetch user info for pre-filling shipping form
  const fetchUserInfo = async () => {
    try {
      const response = await fetch("http://localhost/api/users/userinfo", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Pre-fill shipping info with user data if available
        if (userData) {
          const address = userData.address || {};
          setShippingInfo({
            fullName: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: address.street || '',
            city: address.city || '',
            state: address.state || '',
            zipCode: address.zipCode || '',
            country: address.country || 'United States'
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Handle shipping form changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle payment form changes
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Validate shipping form
  const validateShippingForm = () => {
    const errors = {};
    
    if (!shippingInfo.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingInfo.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) errors.email = 'Email is invalid';
    if (!shippingInfo.phone.trim()) errors.phone = 'Phone number is required';
    if (!shippingInfo.address.trim()) errors.address = 'Address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.state.trim()) errors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) errors.zipCode = 'ZIP code is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate payment form
  const validatePaymentForm = () => {
    const errors = {};
    
    if (!paymentInfo.cardName.trim()) errors.cardName = 'Name on card is required';
    if (!paymentInfo.cardNumber.trim()) errors.cardNumber = 'Card number is required';
    else if (paymentInfo.cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = 'Card number is invalid';
    if (!paymentInfo.expMonth) errors.expMonth = 'Expiration month is required';
    if (!paymentInfo.expYear) errors.expYear = 'Expiration year is required';
    if (!paymentInfo.cvv.trim()) errors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) errors.cvv = 'CVV is invalid';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle continue to payment
  const handleContinueToPayment = (e) => {
    e.preventDefault();
    
    if (validateShippingForm()) {
      setActiveStep('payment');
      window.scrollTo(0, 0);
    }
  };

  // Handle back to shipping
  const handleBackToShipping = (e) => {
    e.preventDefault();
    setActiveStep('shipping');
    window.scrollTo(0, 0);
  };

  // Place order function
  const placeOrder = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create order object
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_info: shippingInfo,
        payment_method: "credit_card",
        total: orderSummary.total
      };
      
      // If user is logged in, send to API
      if (token) {
        const response = await fetch("http://localhost/api/order/create", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
          const result = await response.json();
          setOrderNumber(result.order_id || 'ORD-' + Math.floor(100000 + Math.random() * 900000));
          
          // Clear cart after successful order
          const clearResponse = await fetch("http://localhost/api/shopping/clear", {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          if (clearResponse.ok) {
            setCartItems([]);
          }
          
          setOrderComplete(true);
        } else {
          const errorData = await response.json();
          alert(`Order failed: ${errorData.message || 'Please try again later'}`);
        }
      } else {
        // If user is not logged in, simulate order creation
        // In a real app, you might want to create a guest checkout API endpoint
        setTimeout(() => {
          setOrderNumber('ORD-' + Math.floor(100000 + Math.random() * 900000));
          localStorage.setItem('tempCart', JSON.stringify([]));
          setCartItems([]);
          setOrderComplete(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Generate random order ID for demo purposes
  const generateOrderId = () => {
    return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  };

  // Handle navigation to continue shopping
  const handleContinueShopping = () => {
    navigate('/');
  };

  // Render order confirmation page
  const renderOrderConfirmation = () => (
    <div className="order-confirmation">
      <div className="confirmation-icon">✓</div>
      <h2>Thank You for Your Order!</h2>
      <p>Your order has been successfully placed.</p>
      <p className="order-number">Order Number: <strong>{orderNumber}</strong></p>
      <p>We've sent a confirmation email with order details and tracking information to <strong>{shippingInfo.email}</strong>.</p>
      <div className="confirmation-details">
        <div className="confirmation-section">
          <h3>Shipping Information</h3>
          <p>{shippingInfo.fullName}</p>
          <p>{shippingInfo.address}</p>
          <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
          <p>{shippingInfo.country}</p>
        </div>
        <div className="confirmation-section">
          <h3>Payment Information</h3>
          <p>Credit Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
          <p>Billing address same as shipping</p>
        </div>
      </div>
      <div className="confirmation-summary">
        <h3>Order Summary</h3>
        <div className="summary-items">
          {cartItems.map((item, index) => (
            <div key={index} className="summary-item">
              <div className="summary-item-details">
                <p className="summary-item-name">{item.name}</p>
                <p className="summary-item-info">Qty: {item.quantity}</p>
              </div>
              <p className="summary-item-price">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="summary-totals">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${orderSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>

          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${orderSummary.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="confirmation-actions">
        <button className="continue-shopping-btn" onClick={handleContinueShopping}>Continue Shopping</button>
        <button className="view-orders-btn" onClick={() => navigate('/user')}>View My Orders</button>
      </div>
    </div>
  );

  // Render checkout form
  const renderCheckoutForm = () => (
    <div className="checkout-container">
      <div className="checkout-main">
        <div className="checkout-steps">
          <div className={`step ${activeStep === 'shipping' ? 'active' : ''} ${activeStep === 'payment' ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Shipping</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${activeStep === 'payment' ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Payment</div>
          </div>
        </div>

        {activeStep === 'shipping' && (
          <form className="shipping-form" onSubmit={handleContinueToPayment}>
            <h2>Shipping Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleShippingChange}
                  className={formErrors.fullName ? 'error' : ''}
                />
                {formErrors.fullName && <div className="error-message">{formErrors.fullName}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  className={formErrors.phone ? 'error' : ''}
                />
                {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  className={formErrors.address ? 'error' : ''}
                />
                {formErrors.address && <div className="error-message">{formErrors.address}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  className={formErrors.city ? 'error' : ''}
                />
                {formErrors.city && <div className="error-message">{formErrors.city}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="state">State/Province *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  className={formErrors.state ? 'error' : ''}
                />
                {formErrors.state && <div className="error-message">{formErrors.state}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">ZIP/Postal Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingChange}
                  className={formErrors.zipCode ? 'error' : ''}
                />
                {formErrors.zipCode && <div className="error-message">{formErrors.zipCode}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="continue-btn">Continue to Payment</button>
              <button type="button" className="back-btn" onClick={() => navigate('/cart')}>Back to Cart</button>
            </div>
          </form>
        )}

        {activeStep === 'payment' && (
          <form className="payment-form" onSubmit={placeOrder}>
            <h2>Payment Information</h2>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="cardName">Name on Card *</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={paymentInfo.cardName}
                  onChange={handlePaymentChange}
                  className={formErrors.cardName ? 'error' : ''}
                />
                {formErrors.cardName && <div className="error-message">{formErrors.cardName}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => {
                    const formattedValue = formatCardNumber(e.target.value);
                    setPaymentInfo({...paymentInfo, cardNumber: formattedValue});
                  }}
                  className={formErrors.cardNumber ? 'error' : ''}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
                {formErrors.cardNumber && <div className="error-message">{formErrors.cardNumber}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group expiry-group">
                <label>Expiration Date *</label>
                <div className="expiry-inputs">
                  <select
                    id="expMonth"
                    name="expMonth"
                    value={paymentInfo.expMonth}
                    onChange={handlePaymentChange}
                    className={formErrors.expMonth ? 'error' : ''}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  
                  <select
                    id="expYear"
                    name="expYear"
                    value={paymentInfo.expYear}
                    onChange={handlePaymentChange}
                    className={formErrors.expYear ? 'error' : ''}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {(formErrors.expMonth || formErrors.expYear) && 
                  <div className="error-message">{formErrors.expMonth || formErrors.expYear}</div>
                }
              </div>
              
              <div className="form-group cvv-group">
                <label htmlFor="cvv">CVV *</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={handlePaymentChange}
                  className={formErrors.cvv ? 'error' : ''}
                  placeholder="123"
                  maxLength="4"
                />
                {formErrors.cvv && <div className="error-message">{formErrors.cvv}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="saveCard"
                    checked={paymentInfo.saveCard}
                    onChange={handlePaymentChange}
                  />
                  <span className="checkmark"></span>
                  Save card for future purchases
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="place-order-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
              <button type="button" className="back-btn" onClick={handleBackToShipping}>
                Back to Shipping
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>
        
        <div className="summary-items">
          {cartItems.map((item, index) => (
            <div key={index} className="summary-item">
                              <div className="item-image">
                <img 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = bookCover;
                  }} 
                />
              </div>
              <div className="item-details">
                <p className="item-name">{item.name}</p>
                <p className="item-author">{item.author}</p>
                <div className="item-price-qty">
                  <p className="item-price">${(item.price).toFixed(2)}</p>
                  <p className="item-qty">Qty: {item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="summary-totals">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${orderSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${orderSummary.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="promo-section">
          <input 
            type="text" 
            placeholder="Promo Code" 
            className="promo-input"
          />
          <button className="apply-promo-btn">Apply</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-header">
          <h1 className="source-sans-bold">Checkout</h1>
        </div>
        
        {loading && cartItems.length === 0 ? (
          <div className="loading-spinner">Loading cart details...</div>
        ) : cartItems.length === 0 && !orderComplete ? (
          <div className="empty-cart-message">
            <p>Your cart is empty.</p>
            <button className="continue-shopping-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        ) : orderComplete ? (
          renderOrderConfirmation()
        ) : (
          renderCheckoutForm()
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;