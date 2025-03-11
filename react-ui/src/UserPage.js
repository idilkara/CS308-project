import React, { useState } from 'react';
import "./UserPage.css";
import Navbar from "./components/Navbar.js";

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

const UserAccountPage = () => {
    const [userData, setUserData] = useState(mockUserData);
    const [activeTab, setActiveTab] = useState('profile');
    const [orderTab, setOrderTab] = useState('all');
    
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
                                    <div key={order.id} className="order" data-status={order.status}>
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
                                        <button>View Order Details</button>
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
                    <p>Items you've saved to your wishlist will appear here.</p>
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
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
    );
  };
  
  export default UserAccountPage;