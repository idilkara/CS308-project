import React, { useState } from 'react';
import "./orderStyle.css";
import Navbar from './components/Navbar';

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Sample order data
  const orderData = [
    {
      id: 'W168084005',
      status: 'delivered',
      date: 'September 11, 2024',
      price: '$150.00'
    },
    {
      id: 'W179378013',
      status: 'delivered',
      date: 'April 14, 2024',
      price: '$80.00'
    }
  ];

  const showOrders = (status) => {
    setActiveTab(status);
  };

  // Filter orders based on active tab
  const filteredOrders = orderData.filter(order => 
    activeTab === 'all' || order.status === activeTab
  );

  return (
    <div>
        <Navbar />

        <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div className="sidebar">
            <div className="breadcrumb">
            <a href="#">Home</a> /
            <a href="#">My Account</a> /
            <span>My Orders</span>
            </div>
            
            <h3>My Account</h3>
            <a href="#">My Orders</a>
            <a href="#">Wish List</a>
            <a href="#">Reviews</a>
            <a href="#">Gift Cards</a>
            <a href="#">E-Books</a>
            <a href="#">Membership Info</a>
            <a href="#">Logout</a>
        </div>
        
        {/* Content */}
        <div className="content">
            <br />
            <br />
            <h2>My Orders</h2>
            <div className="tabs">
            <button 
                className={activeTab === 'all' ? 'active' : ''} 
                onClick={() => showOrders('all')}
            >
                All Orders
            </button>
            <button 
                className={activeTab === 'ongoing' ? 'active' : ''} 
                onClick={() => showOrders('ongoing')}
            >
                Ongoing Orders
            </button>
            <button 
                className={activeTab === 'returns' ? 'active' : ''} 
                onClick={() => showOrders('returns')}
            >
                Returns
            </button>
            <button 
                className={activeTab === 'cancellations' ? 'active' : ''} 
                onClick={() => showOrders('cancellations')}
            >
                Cancellations
            </button>
            </div>
            
            <div id="orders">
            {filteredOrders.map(order => (
                <div key={order.id} className="order" data-status={order.status}>
                <div className="details">
                    <p className="status">Delivered</p>
                    <p><strong>Order No:</strong> {order.id}</p>
                    <p><strong>Date:</strong> {order.date}</p>
                </div>
                <p className="order-price"><strong>Price:</strong> {order.price}</p>
                <button>View Order Details</button>
                </div>
            ))}
            </div>
        </div>
        </div>
    </div>
  );
};

export default OrdersPage;