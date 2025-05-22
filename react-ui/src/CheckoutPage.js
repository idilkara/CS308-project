import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { useAuth } from "./context/AuthContext";
import "./CheckoutPage.css";
import bookCover from './img/BookCover.png';
import PdfViewer from './components/pdfView.js';

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
total: 0
});

// Form states
const [shippingInfo, setShippingInfo] = useState({
fullName: '',
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
const [pdfUrl, setPdfUrl] = useState(null);
const [invId, setInvId] = useState(null);

// Check authentication on mount
useEffect(() => {
if (token == null) {
navigate('/login');
return;
}
}, [token, navigate]);

const getDiscountedPrice = (item) => {
if (!item.discount_rate || item.discount_rate <= 0) return null;
const discountMultiplier = 1 - item.discount_rate;
return (parseFloat(item.price) * discountMultiplier).toFixed(2);
};

// Fetch cart on component mount
useEffect(() => {
if (token) {
fetchCart();
}
}, [token]);

// Fetch PDF when invoice ID is available
useEffect(() => {
const fetchPdf = async () => {
if (!invId || !token) return;

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
}, [invId, token]);

// Calculate summary whenever cart items change
useEffect(() => {
const subtotal = cartItems.reduce((sum, item) => {
const discountedPrice = getDiscountedPrice(item);
const price = discountedPrice ? parseFloat(discountedPrice) : parseFloat(item.price) || 0;
return sum + price * item.quantity;
}, 0);

const total = subtotal;

setOrderSummary({
subtotal: subtotal.toFixed(2),
total: total.toFixed(2)
});
}, [cartItems]);

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
author: item.author,
publisher: item.distributor_information,
price: parseFloat(item.price) || 0,
quantity: item.quantity,
discount_rate: item.discount_rate || 0,
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
setShippingInfo({
fullName: userData.name || '',
email: userData.email || '',
address: userData.home_address || '',
});
}
}
} catch (error) {
console.error("Error fetching user info:", error);
}
};

const getPaymentMethod = async () => {
try {
const response = await fetch("http://localhost/api/users/payment_method", {
method: "GET",
headers: {
"Authorization": `Bearer ${token}`,
"Content-Type": "application/json"
}
});

if (!response.ok) {
const errorData = await response.json();
console.error("Failed to fetch payment method:", errorData.error || "Unknown error");
return;
}

const data = await response.json();
console.log("Payment method fetched successfully:", data.payment_method);
if (data.payment_method != null) {
setPaymentInfo({
cardNumber: data.payment_method,
cardName: ""
});
}
} catch (error) {
console.error("Error fetching payment method:", error);
}
};

useEffect(() => {
if (token) {
fetchUserInfo();
getPaymentMethod();
}
}, [token]);

// Handle shipping form changes
const handleShippingChange = (e) => {
const { name, value } = e.target;
setShippingInfo({
...shippingInfo,
[name]: value
});
};

// Handle payment form changes
const handlePaymentChange = (e) => {
const { name, value } = e.target;
setPaymentInfo({
...paymentInfo,
[name]: value
});
};

// Helper to edit home address
const editHomeAddress = async (token, newAddress) => {
try {
const response = await fetch("http://localhost/api/users/edit_address", {
method: "PUT",
headers: {
"Authorization": `Bearer ${token}`,
"Content-Type": "application/json"
},
body: JSON.stringify({ home_address: newAddress })
});
if (response.ok) {
const data = await response.json();
return data;
} else {
return { error: "Failed to edit address" };
}
} catch (error) {
return { error: "An error occurred while editing the address" };
}
};

// Helper to change payment method
const changePaymentMethod = async (token, newPaymentMethod) => {
    try {
        const response = await fetch("http://localhost/api/users/change_payment_method", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ new_payment_method: newPaymentMethod })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to update payment method:", errorData.error || "Unknown error");
            return { error: errorData.error || "Failed to update payment method" };
        }
        const data = await response.json();
        console.log("Payment method updated successfully:", data.message);
        await getPaymentMethod(token); // Fetch updated payment method
        return { message: data.message };
    } catch (error) {
        console.error("Error updating payment method:", error);
        return { error: "An error occurred while updating the payment method" };
    }
};

// Handle continue to payment
const handleContinueToPayment = async (e) => {
    e.preventDefault();
    // Address check
    if (!shippingInfo.address || shippingInfo.address.trim() === '') {
        const newAddress = window.prompt('Please enter your delivery address:');
        if (newAddress && newAddress.trim() !== '') {
            const result = await editHomeAddress(token, newAddress.trim());
            if (!result.error) {
                setShippingInfo({ ...shippingInfo, address: newAddress.trim() });
            } else {
                alert('Failed to update address. Please try again.');
                return;
            }
        } else {
            return;
        }
    }
    // Payment method check
    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.trim() === '') {
        const newCard = window.prompt('Please enter your card number:');
        if (newCard && newCard.trim() !== '') {
            const result = await changePaymentMethod(token, newCard.trim());
            if (!result.error) {
                setPaymentInfo({ ...paymentInfo, cardNumber: newCard.trim() });
            } else {
                alert('Failed to update payment method. Please try again.');
                return;
            }
        } else {
            return;
        }
    }
    setActiveStep('payment');
    window.scrollTo(0, 0);
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

// Check for missing information
const missingInfo = [];

if (!shippingInfo.address || shippingInfo.address.trim() === '') {
missingInfo.push('delivery address');
}

if (!paymentInfo.cardNumber || paymentInfo.cardNumber.trim() === '') {
missingInfo.push('payment method');
}

if (missingInfo.length > 0) {
const confirmMessage = `You need to add ${missingInfo.join(' and ')} to your profile before proceeding with checkout. Would you like to go to your profile page now?`;
if (window.confirm(confirmMessage)) {
localStorage.setItem('pendingShippingInfo', JSON.stringify(shippingInfo));
navigate('/user');
return;
}
return;
}

setLoading(true);

try {
const orderData = {
items: cartItems.map(item => ({
product_id: item.id,
quantity: item.quantity,
price: item.price
})),
shipping_info: shippingInfo,
payment_method: paymentInfo.cardNumber,
total: parseFloat(orderSummary.total)
};

if (token) {
const response = await fetch("http://localhost/api/payment/create_order", {
method: "POST",
headers: {
"Authorization": `Bearer ${token}`,
"Content-Type": "application/json"
},
body: JSON.stringify(orderData)
});

if (response.ok) {
const data = await response.json();
setInvId(data.invoice_id);
setOrderNumber(generateOrderId());
setCartItems([]);
setOrderComplete(true);
localStorage.removeItem('pendingShippingInfo');
} else {
const errorData = await response.json();
alert('Order failed: Please ensure you have added both delivery address and payment information to your account.');
}
}
} catch (error) {
console.error("Error placing order:", error);
alert("Error placing order. Please try again later.");
} finally {
setLoading(false);
}
};

// Handle navigation to continue shopping
const handleContinueShopping = () => {
navigate('/');
};

// Generate random order ID for demo purposes
const generateOrderId = () => {
return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
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
</div>
</div>

{pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}

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
<button type="button" className="continue-btn" onClick={handleContinueToPayment}>Continue to Payment</button>
<button type="button" className="back-btn" onClick={() => navigate('/cart')}>Back to Cart</button>
</div>
</div>
)}

{activeStep === 'payment' && (
<div className="payment-form">
  <h2>Payment Information</h2>
  <div className="payment-display">
    <p><strong>Card:</strong> {'**** **** **** ' + (paymentInfo.cardNumber ? paymentInfo.cardNumber.slice(-4).padStart(4, '•') : '••••')}</p>
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
{cartItems.map((item, index) => {
const discountedPrice = getDiscountedPrice(item);
return (
<div key={index} className="summary-item">
<div className="item-image">
{item.image ? (
<img
src={item.image}
alt={item.name}
onError={(e) => {
e.target.onerror = null;
e.target.src = bookCover;
}}
/>
) : (
<img src={bookCover} alt="Default Book Cover" />
)}
</div>
<div className="item-details">
<p className="item-name">{item.name}</p>
<p className="item-author">{item.author}</p>
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
<p className="item-qty">Qty: {item.quantity}</p>
</div>
</div>
);
})}
</div>

<div className="summary-totals">
<div className="summary-row">
<span>Subtotal</span>
<span>${orderSummary.subtotal}</span>
</div>
<div className="summary-row total">
<span>Total</span>
<span>${orderSummary.total}</span>
</div>
</div>
</div>
</div>
);

// Add useEffect to restore shipping info when returning from profile page
useEffect(() => {
const pendingShippingInfo = localStorage.getItem('pendingShippingInfo');
if (pendingShippingInfo) {
setShippingInfo(JSON.parse(pendingShippingInfo));
}
}, []);

// Don't render anything if not authenticated
if (!token) {
return null;
}

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