import React, { useState } from 'react';
import "./UserPage.css";
import Navbar from "./components/Navbar.js";

// Mock order details data
const mockOrderDetails = {
  "ORD-10045": [
    { id: "ITEM-001", title: "Klara and the Sun", author: "Kazuo Ishiguro", quantity: 1, price: "$19.99", coverImage: "/images/klara.jpg" },
    { id: "ITEM-002", title: "The Iron Heel", author: "Jack London", quantity: 2, price: "$15.99", coverImage: "/images/iron-heel.jpg" },
    { id: "ITEM-003", title: "The Alchemist", author: "Paulo Coelho", quantity: 1, price: "$14.99", coverImage: "/images/alchemist.jpg" },
    { id: "ITEM-004", title: "1984", author: "George Orwell", quantity: 1, price: "$12.99", coverImage: "/images/1984.jpg" },
  ],
  "ORD-10044": [
    { id: "ITEM-005", title: "To Kill a Mockingbird", author: "Harper Lee", quantity: 1, price: "$17.50", coverImage: "/images/mockingbird.jpg" },
    { id: "ITEM-006", title: "The Great Gatsby", author: "F. Scott Fitzgerald", quantity: 1, price: "$16.99", coverImage: "/images/gatsby.jpg" },
    { id: "ITEM-007", title: "The Hobbit", author: "J.R.R. Tolkien", quantity: 1, price: "$18.99", coverImage: "/images/hobbit.jpg" },
  ],
  "ORD-10043": [
    { id: "ITEM-008", title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", quantity: 1, price: "$24.99", coverImage: "/images/harry-potter.jpg" },
    { id: "ITEM-009", title: "The Lord of the Rings: The Fellowship of the Ring", author: "J.R.R. Tolkien", quantity: 1, price: "$29.99", coverImage: "/images/lotr.jpg" },
    { id: "ITEM-010", title: "The Silmarillion", author: "J.R.R. Tolkien", quantity: 1, price: "$22.99", coverImage: "/images/silmarillion.jpg" },
    { id: "ITEM-011", title: "The Chronicles of Narnia", author: "C.S. Lewis", quantity: 1, price: "$32.99", coverImage: "/images/narnia.jpg" },
    { id: "ITEM-012", title: "Dune", author: "Frank Herbert", quantity: 1, price: "$19.99", coverImage: "/images/dune.jpg" },
  ],
  "ORD-10042": [
    { id: "ITEM-013", title: "Pride and Prejudice", author: "Jane Austen", quantity: 1, price: "$11.99", coverImage: "/images/pride.jpg" },
    { id: "ITEM-014", title: "Emma", author: "Jane Austen", quantity: 1, price: "$10.99", coverImage: "/images/emma.jpg" },
    { id: "ITEM-015", title: "Sense and Sensibility", author: "Jane Austen", quantity: 1, price: "$9.99", coverImage: "/images/sense.jpg" },
  ],
};

const mockUserData = {
  id: "usr_12345",
  name: "Jane Doe",
  email: "jane.doe@example.com",
  address: {
    street: "123 Maple Avenue",
    city: "Springfield",
    state: "IL",
    zipCode: "62704",
    country: "United States"
  },
  password: "********" 
};

// Mock order data
const mockOrders = [
  {
    id: "ORD-10045",
    date: "March 5, 2025",
    price: "$149.99",
    status: "delivered"
  },
  {
    id: "ORD-10044",
    date: "February 28, 2025",
    price: "$79.50",
    status: "ongoing"
  },
  {
    id: "ORD-10043",
    date: "February 20, 2025",
    price: "$225.00",
    status: "returned",
    returnReason: "Wrong size"
  },
  {
    id: "ORD-10042",
    date: "February 15, 2025",
    price: "$32.99",
    status: "cancelled",
    cancellationReason: "Out of stock"
  }
];

// Mock wishlist data
const mockWishlistBooks = [
  {
    id: "BK-3892",
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    price: "$24.99",
    coverImage: "/images/addie-larue.jpg"
  },
  {
    id: "BK-4267",
    title: "The Song of Achilles",
    author: "Madeline Miller",
    price: "$16.99",
    coverImage: "/images/achilles.jpg"
  },
  {
    id: "BK-1584",
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: "$28.99",
    coverImage: "/images/hail-mary.jpg"
  },
  {
    id: "BK-7391",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    price: "$17.99",
    coverImage: "/images/evelyn-hugo.jpg"
  },
  {
    id: "BK-8954",
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    price: "$19.99",
    coverImage: "/images/thorns-roses.jpg"
  }
];

const UserAccountPage = () => {
    const [userData, setUserData] = useState(mockUserData);
    const [activeTab, setActiveTab] = useState('profile');
    const [orderTab, setOrderTab] = useState('all');
    const [wishlistBooks, setWishlistBooks] = useState(mockWishlistBooks);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    
    // Password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    
    // Handle password confirmation
    const handleConfirmChanges = () => {
        if (newPassword === '' || confirmPassword === '') {
            setPasswordMessage('Please fill in both password fields.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setPasswordMessage('Passwords do not match.');
            return;
        }
        
        // Here you would typically make an API call to update the password
        setPasswordMessage('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        
        // Clear message after 3 seconds
        setTimeout(() => {
            setPasswordMessage('');
        }, 3000);
    };
    
    // Handle remove from wishlist
    const removeFromWishlist = (bookId) => {
        setWishlistBooks(wishlistBooks.filter(book => book.id !== bookId));
    };
    
    // Toggle order details expansion
    const toggleOrderDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null); // Collapse if already expanded
        } else {
            setExpandedOrderId(orderId); // Expand this order
        }
    };
    
    // Filter orders based on the selected tab
    const getFilteredOrders = () => {
        if (orderTab === 'all') return mockOrders;
        if (orderTab === 'ongoing') return mockOrders.filter(order => order.status === 'ongoing');
        if (orderTab === 'returns') return mockOrders.filter(order => order.status === 'returned');
        if (orderTab === 'cancellations') return mockOrders.filter(order => order.status === 'cancelled');
        return mockOrders;
    };
    
    const filteredOrders = getFilteredOrders();

    return (
        <div>
        <Navbar />
            <div className="account-container">
            <div className="account-header">
                <h1 className="account-title">My Account</h1>
                <p className="account-subtitle">Manage your profile information and preferences</p>
            </div>
            
            <div className="account-layout">
                <div className="account-sidebar">
                <ul className="sidebar-nav">
                    <li><a href="#profile" className={activeTab === 'profile' ? 'active' : ''} 
                    onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
                    Profile Information
                    </a></li>
                    <li><a href="#orders" className={activeTab === 'orders' ? 'active' : ''} 
                    onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}>
                    Order History
                    </a></li>
                    <li><a href="#wishlist" className={activeTab === 'wishlist' ? 'active' : ''} 
                    onClick={(e) => { e.preventDefault(); setActiveTab('wishlist'); }}>
                    Wishlist
                    </a></li>
                    <li><a href="#payment" className={activeTab === 'payment' ? 'active' : ''} 
                    onClick={(e) => { e.preventDefault(); setActiveTab('payment'); }}>
                    Payment Methods
                    </a></li>
                    <li><a href="#security" className={activeTab === 'security' ? 'active' : ''} 
                    onClick={(e) => { e.preventDefault(); setActiveTab('security'); }}>
                    Security
                    </a></li>
                </ul>
                </div>
                
                <div className="profile-section">
                {activeTab === 'profile' && (
                    <>
                    <h2 className="section-title">Profile Information</h2>
                    <div className="profile-info">
                        <div className="info-group">
                        <div className="info-label">Name</div>
                        <div className="info-value">{userData.name}</div>
                        </div>
                        
                        <div className="info-group">
                        <div className="info-label">Email Address</div>
                        <div className="info-value">{userData.email}</div>
                        </div>
                        
                        <div className="address-block">
                        <div className="info-label">Delivery Address</div>
                        <div className="info-value">
                            {userData.address.street}<br />
                            {userData.address.city}, {userData.address.state} {userData.address.zipCode}<br />
                            {userData.address.country}
                        </div>
                        </div>
                    </div>
                    
                    <button className="edit-button">Edit Profile</button>
                    </>
                )}
                
                {activeTab === 'orders' && (
                    <div className="content">
                       
                        <h2 className="section-title">My Orders</h2>
                        <div className="tabs">
                            <button 
                                className={orderTab === 'all' ? 'active' : ''} 
                                onClick={() => setOrderTab('all')}
                            >
                                All Orders
                            </button>
                            <button 
                                className={orderTab === 'ongoing' ? 'active' : ''} 
                                onClick={() => setOrderTab('ongoing')}
                            >
                                Ongoing Orders
                            </button>
                            <button 
                                className={orderTab === 'returns' ? 'active' : ''} 
                                onClick={() => setOrderTab('returns')}
                            >
                                Returns
                            </button>
                            <button 
                                className={orderTab === 'cancellations' ? 'active' : ''} 
                                onClick={() => setOrderTab('cancellations')}
                            >
                                Cancellations
                            </button>
                        </div>
                        
                        <div id="orders">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <div key={order.id} className="order-container">
                                        <div className="order" data-status={order.status}>
                                            <div className="details">
                                                <p className="status">
                                                    {order.status === 'delivered' && 'Delivered'}
                                                    {order.status === 'ongoing' && 'In Progress'}
                                                    {order.status === 'returned' && 'Returned'}
                                                    {order.status === 'cancelled' && 'Cancelled'}
                                                </p>
                                                <p><strong>Order No:</strong> {order.id}</p>
                                                <p><strong>Date:</strong> {order.date}</p>
                                                {order.returnReason && <p><strong>Return Reason:</strong> {order.returnReason}</p>}
                                                {order.cancellationReason && <p><strong>Cancellation Reason:</strong> {order.cancellationReason}</p>}
                                            </div>
                                            <p className="order-price"><strong>Price:</strong> {order.price}</p>
                                            <button 
                                                onClick={() => toggleOrderDetails(order.id)}
                                                className={expandedOrderId === order.id ? "view-details-active" : ""}
                                            >
                                                {expandedOrderId === order.id ? "Hide Details" : "View Order Details"}
                                            </button>
                                        </div>
                                        
                                        {/* Order Details Dropdown */}
                                        {expandedOrderId === order.id && (
                                            <div className="order-details-dropdown">
                                                <div className="order-details-header">
                                                    <h3>Order Items</h3>
                                                </div>
                                                <div className="order-items-container">
                                                    {mockOrderDetails[order.id].map(item => (
                                                        <div key={item.id} className="order-item">
                                                            <div className="item-image-container">
                                                                <div className="item-placeholder-cover"></div>
                                                            </div>
                                                            <div className="item-details">
                                                                <h4 className="item-title">{item.title}</h4>
                                                                <p className="item-author">{item.author}</p>
                                                                <div className="item-price-qty">
                                                                    <span className="item-price">{item.price}</span>
                                                                    <span className="item-quantity">Qty: {item.quantity}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="order-summary">
                                                    <div className="summary-item">
                                                        <span>Subtotal:</span>
                                                        <span>{order.price}</span>
                                                    </div>
                                                    <div className="summary-item">
                                                        <span>Shipping:</span>
                                                        <span>$4.99</span>
                                                    </div>
                                                    <div className="summary-item">
                                                        <span>Tax:</span>
                                                        <span>${(parseFloat(order.price.replace('$', '')) * 0.08).toFixed(2)}</span>
                                                    </div>
                                                    <div className="summary-item">
                                                        <span>Total:</span>
                                                        <span>{order.price}</span>
                                                    </div>
                                                </div>
                                                {/* Shipping information */}
                                                <div className="shipping-info">
                                                    <h4>Shipping Address</h4>
                                                    <p>
                                                        {userData.name}<br />
                                                        {userData.address.street}<br />
                                                        {userData.address.city}, {userData.address.state} {userData.address.zipCode}<br />
                                                        {userData.address.country}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No orders found in this category.</p>
                            )}
                        </div>
                    </div>
                    )}
                
                {activeTab === 'wishlist' && (
                    <div>
                        <h2 className="section-title">Your Wishlist</h2>
                        
                        {wishlistBooks.length > 0 ? (
                            <div className="book-card-grid">
                                {wishlistBooks.map(book => (
                                    <div key={book.id} className="book-card">
                                        <div className="book-card-inner">
                                            <div className="book-cover">
                                                <div className="placeholder-cover"></div>
                                                <button 
                                                    className="wishlist-icon filled"
                                                    onClick={() => removeFromWishlist(book.id)}
                                                    title="Remove from wishlist"
                                                >
                                                    ❤️
                                                </button>
                                            </div>
                                            <div className="book-info">
                                                <h3 className="book-title">{book.title}</h3>
                                                <p className="book-author">{book.author}</p>
                                                <p className="book-price">{book.price}</p>
                                            </div>
                                            <div className="book-actions">
                                                <button className="add-to-cart-btn">Add to Cart</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-wishlist">
                                <p>Your wishlist is empty.</p>
                                <p>Browse our collections and add books you love to your wishlist!</p>
                                <button className="browse-button">Browse Books</button>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'payment' && (
                    <div>
                    <h2 className="section-title">Payment Methods</h2>
                    <p>Your saved payment methods will appear here.</p>
                    </div>
                )}
                
                {activeTab === 'security' && (
                    <div>
                    <h2 className="section-title">Security Settings</h2>
                    <p>Update your password and security preferences here.</p>
                    
                    <div className="password-section">
                        <div className="password-field">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <button 
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>
                        
                        <div className="password-field">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                                <button 
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>
                        
                        {passwordMessage && (
                            <div className={`password-message ${passwordMessage.includes('successfully') ? 'success' : 'error'}`}>
                                {passwordMessage}
                            </div>
                        )}
                        
                        <button 
                            className="confirm-password-button"
                            onClick={handleConfirmChanges}
                        >
                            Confirm Changes
                        </button>
                    </div>
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
    );
};
  
export default UserAccountPage;