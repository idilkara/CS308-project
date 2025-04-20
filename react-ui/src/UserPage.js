import React, { useState ,useEffect  }  from 'react';
import "./UserPage.css";
import Navbar from "./components/Navbar.jsx";
import { useNavigate } from 'react-router-dom'; 
import { useAuth, useSetRole } from "./context/AuthContext";

  const UserAccountPage = () => {

    const navigate = useNavigate(); // Initialize useNavigate
    const { token } = useAuth(); // Access the token from AuthContext
    console.log("Token from context:", token); // Log the token to check if it's being passed correctly
    const setRole = useSetRole(); // This is the hook call
   
    
    
    const [userData, setUserData] = useState({ name: '', email: '', address: '' }); // address is primary
    const [formData, setFormData] = useState({
        name: userData.name,
        email: userData.email,
        address:userData.address 
    });
    const [editingProfile, setEditingProfile] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');

    const [paymentMethod, setPaymentMethod] = useState({
        cardNumber: '',
        cardName: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);


    const [wishlistBooks, setWishlistBooks] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]); // Order history
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderTab, setOrderTab] = useState('all');
    const [activeTab, setActiveTab] = useState('profile');

    //CHECKS FOR THE TOKEN
    // useEffect to handle token validation and user info fetching
    useEffect(() => {
     //   const { token } = useAuth(); // Access the token from AuthContext
        if (!token) {
            console.error("Token is missing or invalid. Redirecting to login page.");
            navigate("/login"); // Redirect to userLogin page
            getUserInfo(token, navigate)
        } 
        else{
            // Get user info and update state
            getUserInfo(token, navigate)
                .then(userData => {
                    if (userData) {
                        setUserData({name: userData.name, email: userData.email, address: userData.home_address});
                    }
                });
            //to test other api requests
            fetchOrderHistory(token)
                .then(orderData => {
                    if (orderData && !orderData.error) {
                        setOrderHistory(orderData); // Update order history state
                    }
                });
            fetchWishlist(token);
        }
    }, [token]);
    
    const getUserInfo = async (token, navigate) => {
        try {
            const response = await fetch("http://localhost/api/users/userinfo", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (!response.ok) {
                throw new Error("Invalid token");
            }
    
            const data = await response.json();
            console.log("User data fetched successfully:", data);

            setRole(data.role); // This is the actual role-setting
            setUserData({name: data.name, email: data.email, address: data.home_address});

            // get payment method
            const payMethod = await getPaymentMethod(token);
            console.log("Payment method fetched successfully3:", payMethod);
            if (payMethod == null) {
                setPaymentMethod({cardNumber: "", cardName: ""}); // Update payment method state
                console.log("Payment method set successfully:", paymentMethod);
            }
         
            return data; // Return the fetched data
        } catch (error) {
            console.error("Error fetching user data:", error);
            navigate("/login"); // Redirect to userLogin page on error
            throw error; // Re-throw the error if needed
        }
    };

    const editHomeAddress = async (token, newAddress) => {

        console.log("Editing address with token:", token); // Log the token to check if it's being passed correctly
        console.log("New address:", newAddress); // Log the new address to check if it's being passed correctly
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


    const updatePassword = async (token, newPassword) => {
        try {
            const response = await fetch("http://localhost/api/users/update_password", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password: newPassword })
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                return { error: "Failed to update password" };
            }
        } catch (error) {
            return { error: "An error occurred while updating the password" };
        }
    };


    // view wishlist
    const fetchWishlist = async (token) => {
        try {
            const response = await fetch("http://localhost/api/wishlist/view", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (response.ok) {
                const wishlistData = await response.json();
                console.log("Wishlist fetched successfully:", wishlistData);

                setWishlistBooks(wishlistData); // Update the wishlist state
            } else {
                const errorData = await response.json();
                console.error("Failed to fetch wishlist:", errorData.message || "Unknown error");
                alert(errorData.message || "Failed to fetch wishlist");
            }
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            alert("An error occurred while fetching the wishlist.");
        }
    };


    
    // Remove item from wishlist
    const removeFromWishlistApi = async (productId) => {

        const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        };

        const data = {
        product_id: productId
        };

        try {
        const response = await fetch("http://localhost/api/wishlist/remove", {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Removed from wishlist:", result);
            return result;
        } else {
            const errorData = await response.json();
            console.error("Failed to remove from wishlist:", errorData);
            return {
            error: errorData.message || "Failed to remove from wishlist",
            status_code: response.status,
            };
        }
        } catch (error) {
        console.error("Error removing from wishlist:", error);
        return { error: "An unexpected error occurred" };
        }
    };

    // view order history
    const fetchOrderHistory = async (token) => {
        try {
            const response = await fetch("http://localhost/api/order/view_order_history", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (response.ok) {
                const orderHistory = await response.json();
                console.log("Order history fetched successfully:", orderHistory);
                return orderHistory; // Return the fetched order history
            } else {
                const errorData = await response.json();
                console.error("Failed to fetch order history:", errorData.message || "Unknown error");
                return { error: errorData.message || "Failed to fetch order history", status_code: response.status };
            }
        } catch (error) {
            console.error("Error fetching order history:", error);
            return { error: "An error occurred while fetching the order history" };
        }
    };

    const getPaymentMethod = async (token) => {
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
                return { error: errorData.error || "Failed to fetch payment method" };
            }
    
            const data = await response.json();
            console.log("Payment method fetched successfully:", data.payment_method);
            if (data.payment_method != null) {
                setPaymentMethod( {cardNumber:  data.payment_method, cardName : "" }); // Update payment method state
                // console.log("Payment method set successfully:", paymentMethod.cardNumber );
            }
          
            return data.payment_method; // Return the payment method
        } catch (error) {
            console.error("Error fetching payment method:", error);
            return { error: "An error occurred while fetching the payment method" };
        }
    };

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
            getPaymentMethod(token); // Fetch updated payment method
            return { message: data.message }; // Return success message
        } catch (error) {
            console.error("Error updating payment method:", error);
            return { error: "An error occurred while updating the payment method" };
        }
    };


    // Initialize edit form when entering edit mode
    const toggleEditMode = () => {
        if (!editingProfile) {
            // Initialize form data with current user data when entering edit mode
            setFormData({
                name: userData.name,
                email: userData.email,
                address: userData.address
            });
        }
        setEditingProfile(!editingProfile);
    };
    
    // Handle changes to main form fields
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    // Handle changes to existing addresses
    const handleAddressChange = (index, field, value) => {
        setFormData({
            ...formData,
            address: value
        });
    };
    
   
    // Save profile changes
    const handleSaveProfile = () => {
        // Validate form data
        if (!formData.name || !formData.email) {
            alert('Name and email are required');
            return;
        }
        // Update the userData state with the new profile information
        setUserData({
            ...userData,
            name: formData.name,
            email: formData.email,
            // Update the single address field for backward compatibility
            address: formData.address,

        });
        
        // Exit edit mode
        setEditingProfile(false);
        console.log("Form data userDATA:", formData.address); // Log the form data to check if it's being passed correctly
        console.log("Form data userDATA:", userData.address); // Log the form data to check if it's being passed correctly
        editHomeAddress(token, formData.address)
        // Show a success notification
        alert('Profile updated successfully!');
    };
    
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
        
        // Make API call to update the password 
        updatePassword(token, newPassword)
            .then(result => {
                if (result.error) {
                    setPasswordMessage(result.error);
                    return;
                }
                
                setPasswordMessage('Password updated successfully!');
                setNewPassword('');
                setConfirmPassword('');
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    setPasswordMessage('');
                }, 3000);
            });

    };
    
    // Handle remove from wishlist
    const removeFromWishlist = async (bookId) => {
        try {
            await removeFromWishlistApi(bookId);  // Wait for API to finish
            fetchWishlist(token);                 // Then refresh the wishlist
        } catch (err) {
            console.error("Failed to remove from wishlist", err);
        }
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
        // Use the real order history if available, otherwise return an empty array
        const orders = orderHistory.length > 0 ? orderHistory : [];
    
        if (orderTab === 'all') return orders;
        if (orderTab === 'ongoing') return orders.filter(order => order.status === 'ongoing');
        if (orderTab === 'returns') return orders.filter(order => order.status === 'returned');
        if (orderTab === 'cancellations') return orders.filter(order => order.status === 'cancelled');
        return orders;
    };

    // Payment methods functions
    
    // Handle input change for new card form
    // const handleCardInputChange = (e) => {
    //     const { name, value, type, checked } = e.target;
    //     setPaymentMethod({
    //         ...newCard,
    //         [name]: type === 'checkbox' ? checked : value
    //     });
    // };

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

     // Handle form submission for new payment method
     const handleAddCardSubmit = (e) => {
        e.preventDefault();
        console.log("Payment method data submit:", paymentMethod); // Log the payment method data to check if it's being passed correctly
   
        changePaymentMethod(token, paymentMethod.cardNumber)
        // For now, assume paymentMethod is already filled via form inputs
        setShowAddForm(false);
    };
    
    const deletePaymentMethod = () => {
        // setPaymentMethod({
        //     cardNumber: '',
        //     cardName: '',
        // });
       
        const a = 1;
    };
    

    // Render payment methods section
    const renderPaymentMethodsSection = () => (
        <div>
            <h2 className="section-title">Payment Methods</h2>
            <div className="payment-methods-list">
                {paymentMethod && paymentMethod.cardNumber != '' ? (
                    <div className="payment-method-card default-card">
                        <div className="card-header">
                            <div className="default-badge">Default</div>
                        </div>
                        <div className="card-details">
                            <div className="card-number">
                               {paymentMethod.cardNumber}
                            </div>
                            <div className="card-name">
                                {userData.name}
                            </div>
                        </div>

                        <div className="card-actions">
                            <button 
                                className="delete-btn"
                                onClick={deletePaymentMethod}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-payment-methods">
                        <p>You don't have any saved payment methods. </p>

                    </div>
                )}

                {!showAddForm ? (
                    <button 
                        className="add-payment-btn"
                        onClick={() => setShowAddForm(true)}
                    >
                        <span>+</span> Change Payment Method
                    </button>
                ) : (
                    <div className="add-payment-form">
                        <h3>Change Payment Method</h3>
                        <form onSubmit={handleAddCardSubmit}>

                            <div className="form-group">
                                <label htmlFor="cardNumber">Card Number</label>
                                <input
                                    type="text"
                                    id="cardNumber"
                                    name="cardNumber"
                                    value={paymentMethod.cardNumber}
                                    onChange={(e) => {
                                        const formattedValue = formatCardNumber(e.target.value);
                                        setPaymentMethod({ ...paymentMethod, cardNumber: formattedValue });
                                    }}
                                    required
                                    className="form-input"
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                />
                            </div>

                            <div className="form-buttons">
                                <button type="submit" className="save-btn">Save Payment Method</button>
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

                        
        </div>  
    );

    const filteredOrders = getFilteredOrders();

    // Edit Profile Form component integrated directly
    const renderEditProfileForm = () => (
        <div>
            <h2 className="section-title">Edit Profile Information</h2>
            
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label className="info-label" htmlFor="name" style={{ marginBottom: '8px', display: 'block' }}>Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            style={{ 
                                padding: '8px', 
                                border: '1px solid #ddd', 
                                borderRadius: '4px', 
                                width: '100%',
                                fontSize: '16px'
                            }}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="info-label" htmlFor="email" style={{ marginBottom: '8px', display: 'block' }}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            style={{ 
                                padding: '8px', 
                                border: '1px solid #ddd', 
                                borderRadius: '4px', 
                                width: '100%',
                                fontSize: '16px'
                            }}
                            required
                        />
                    </div>
                </div>
            </div>

            <h3 style={{ marginTop: '30px', fontSize: '18px', fontWeight: '500', marginBottom: '15px' }}>Your Addresses</h3>
   
                        <div>
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => handleAddressChange(0, 'address', e.target.value)}
                                style={{ 
                                    padding: '8px', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '4px', 
                                    width: '100%',
                                    fontSize: '16px'
                                }}
                                required
                            />
                        </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button 
                    type="button" 
                    onClick={handleSaveProfile} 
                    style={{
                        backgroundColor: 'var(--warm-brown)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        fontFamily: 'Source Sans 3, sans-serif',
                        fontWeight: '500',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        height: '40px',
                        lineHeight: '1'
                    }}
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={toggleEditMode}
                    style={{
                        padding: '10px 20px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer',
                        height: '40px',
                        fontSize: '16px',
                        fontFamily: 'Source Sans 3, sans-serif',
                        fontWeight: '500',
                        lineHeight: '1'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    // Render profile view 
    const renderProfileView = () => {
        
        if (token == null) {
            console.log("Token from context is null:", token); // Log the token to check if it's being passed correctly
            navigate("/login"); // Redirect to userLogin page
            return null; // Do not render anything if token is null
        }
        
        return (
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
                <div className="info-label">
                    Delivery Address 
                    
                </div>
                <div className="info-value">{userData.address}</div>

            </div>
        </div>
        
        <button className="edit-button" onClick={toggleEditMode}>Edit Profile</button>
        </>
    );
    };

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
                    editingProfile ? renderEditProfileForm() : renderProfileView()
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
                                                {/* <div className="order-items-container">
                                                    {OrderDetails[order.id].map(item => (
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
                                                </div> */}
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
                                                        {userData.address}<br />
                                                  
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
                                    <div key={book.product_id} className="book-card">
                                        <div className="book-card-inner">
                                            <div className="book-cover">
                                                <div className="placeholder-cover"></div>
                                                <button 
                                                    className="wishlist-icon filled"
                                                    onClick={() => removeFromWishlist(book.product_id)}
                                                    title="Remove from wishlist"
                                                >
                                                    ❤️
                                                </button>
                                            </div>
                                            <div className="book-info">
                                                <h3>{book.name}</h3>
                                                <p>{book.description}</p>
                                                <p className="book-price">₹{book.price}</p>
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
                
                {activeTab === 'payment' && renderPaymentMethodsSection()}
                
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