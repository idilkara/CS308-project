import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { useAuth } from "./context/AuthContext";
import "./CheckoutPage.css";
import bookCover from './img/BookCover.png';
import PdfViewer from './components/pdfView.js';


//phone city country / expire card name info falan sil
// siparişiniz alındı sayfasına yönlendir
// address ve payment yoksa devam etmeye izin verme
// user logged in değilken checkouta girmeye izin verme !!!!!!!!!!!!!
// cart boşsa checkouta girmeye izin verme

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  if (token == null) {
    // Redirect to login if not authenticated
    navigate('/login');
  }

  // Cart and order states
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    // shipping: 4.99,
    // tax: 0,
    total: 0
  });

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
  });

  const [activeStep, setActiveStep] = useState('shipping');
  const [formErrors, setFormErrors] = useState({});
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, [token]);


  const [pdfUrl, setPdfUrl] = useState(null);
  const [invId ,   setInvId] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(`http://localhost/api/invoice/get_invoice_pdf/${invId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch invoice:", errorText);
        }
      } catch (err) {
        console.error("Error fetching PDF:", err);
      }
    };

    fetchPdf();
  }, [invId]);


  // Calculate summary whenever cart items change
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
    // const taxRate = 0.08; // 8% tax rate
    // const tax = subtotal * taxRate;
    // const shipping = subtotal > 50 ? 0 : 4.99; // Free shipping for orders over $50
    const total = subtotal ;

    setOrderSummary({
      subtotal: subtotal,
      // shipping: shipping,
      // tax: tax,
      total: total
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
            address: userData.home_address || '',
          });

          if (userData.payment_method && userData.payment_method.length > 0) {
            setPaymentInfo({
              cardNumber: userData.payment_method || '',
            });
          if (userData.payment_method = null) {

            alert("Please add a payment method to your account from the profile page. ");
          }
          }
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
    if (!shippingInfo.address.trim()) errors.address = 'Address is required';
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
  if (e) e.preventDefault();

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
      const response = await fetch("http://localhost/api/payment/create_order", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
       
      });

      if (response.ok) {
        const data = await response.json();

        setInvId(data.invoice_id);

        setCartItems([]);
        setOrderComplete(true);
      } else {
        const errorData = await response.json();
        alert(`Order failed: 'Please add delivery address and payment information to your account and try again'}`);
      }
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
      <p>We've sent a confirmation email with order details to <strong>{shippingInfo.email}</strong>.</p>
      <div className="confirmation-details">
        <div className="confirmation-section">
          <h3>Shipping Information</h3>
          <p>{shippingInfo.fullName}</p>
          <p>{shippingInfo.address}</p>

        </div>
        <div className="confirmation-section">
          <h3>Payment Information</h3>
          <p>Credit Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
          <p>Billing address same as shipping</p>
        </div>
      </div>
      {/* <div className="confirmation-summary">
        <h3>Order Summary</h3>
        <div className="summary-items">
          {cartItems.map((item, index) => (
            <div key={index} className="summary-item">
              <div className="summary-item-details">
                <p className="summary-item-name">{item.name}</p>
                <p className="summary-item-info">Qty: {item.quantity}</p>
              </div>
              <p className="summary-item-price">${(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="summary-totals">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${orderSummary.subtotal}</span>
          </div>
     
          <div className="summary-row total">
            <span>Total</span>
            <span>${orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
      </div> */}
      <PdfViewer pdfUrl={pdfUrl} />
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
          <div className="shipping-form">
          <h2>Shipping Information</h2>
          <div className="shipping-display">
            <p><strong>Name:</strong> {shippingInfo.fullName}</p>
            <p><strong>Email:</strong> {shippingInfo.email}</p>
         
            <p><strong>Address:</strong> {shippingInfo.address}</p>

          </div>
          <div className="form-actions">
            <button type="button" className="continue-btn" onClick={() => setActiveStep('payment')}>Continue to Payment</button>
            <button type="button" className="back-btn" onClick={() => navigate('/cart')}>Back to Cart</button>
          </div>
        </div>
        )}

        {activeStep === 'payment' && (
          <div className="payment-form">
          <h2>Payment Information</h2>
          <div className="payment-display">
            <p>
              <strong>Card:</strong> 
                {showCardNumber 
                  ? paymentInfo.cardNumber 
                  : `**** **** **** ${paymentInfo.cardNumber.slice(-4)}`}
                <button 
                  type="button" 
                  onClick={() => setShowCardNumber(!showCardNumber)} 
                  className="toggle-visibility-btn"
                >
                  {showCardNumber ? 'Hide' : 'Show'}
                </button>
            </p>
            <p><strong>Name on Card:</strong> {paymentInfo.cardName}</p>
            <p><strong>Expires:</strong> {paymentInfo.expMonth}/{paymentInfo.expYear}</p>
          </div>
          <div className="form-actions">
            <button type="button" className="place-order-btn" onClick={placeOrder} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
            <button type="button" className="back-btn" onClick={() => setActiveStep('shipping')}>
              Back to Shipping
            </button>
          </div>
        </div>
        )}
      </div>

      
      
<div className="order-summary">
  <h2>Order Summary</h2>

  <div className="summary-items">
    {cartItems.map((item, index) => (
      <div key={index} className="summary-item">
        <div className="item-image">
          <img 
            src={item.image ? item.image : bookCover}
            alt={item.name || "Default Book Cover"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = bookCover;
            }} 
          />
        </div>
        <div className="item-details">
          <p className="item-name">{item.name}</p>
          <p className="item-author">{item.author || "Unknown Author"}</p>
          <div className="item-price-qty">
            <p className="item-price">${item.price}</p>
            <p className="item-qty">Qty: {item.quantity}</p>
          </div>
        </div>
      </div>
    ))}
  </div>



        
        <div className="summary-totals">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${orderSummary.subtotal}</span>
          </div>
          {/* <div className="summary-row">
            <span>Shipping</span>
            <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${orderSummary.tax.toFixed(2)}</span>
          </div> */}
          <div className="summary-row total">
            <span>Total</span>
            <span>${orderSummary.total}</span>
          </div>
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