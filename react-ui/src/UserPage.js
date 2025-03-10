import React, { useState } from 'react';
import "./UserPage.css"
import Navbar from "./components/Navbar.js"

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

const UserAccountPage = () => {
    const [userData, setUserData] = useState(mockUserData);
    const [activeTab, setActiveTab] = useState('profile');

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
                    <div>
                    <h2 className="section-title">Order History</h2>
                    <p>Your recent orders will appear here.</p>
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