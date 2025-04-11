import React, { useState ,useEffect  }  from 'react';
import "./UserPage.css";
import Navbar from "./components/Navbar.jsx";
import { useLocation } from 'react-router-dom';



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

// Updated mock user data with addresses array
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
  // Add addresses array for multiple addresses
  addresses: [
    {
      street: "123 Maple Avenue",
      city: "Springfield",
      state: "IL",
      zipCode: "62704",
      country: "United States"
    }
  ],
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

// Mock payment methods data
const mockPaymentMethods = [
    {
      id: "pm_123456",
      type: "credit",
      brand: "Visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2026,
      isDefault: true
    },
    {
      id: "pm_789012",
      type: "credit",
      brand: "Mastercard",
      last4: "5555",
      expMonth: 8,
      expYear: 2025,
      isDefault: false
    }
  ];

const UserAccountPage = () => {

    const location = useLocation();
    const token = location.state?.token; // Retrieve the token from state
    console.log("Token received:", token); // Debugging: Log the token



    const [userData, setUserData] = useState(mockUserData);
    const [activeTab, setActiveTab] = useState('profile');
    const [orderTab, setOrderTab] = useState('all');
    const [wishlistBooks, setWishlistBooks] = useState(mockWishlistBooks);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        if (token) {
            fetch("http://localhost/api/users/userinfo", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(response => response.json())
            .then(data => console.log("User data fetched successfully:", data))
            .catch(error => console.error("Error fetching user data:", error));
            
        }
    }, [token]);
    

    // Payment methods state
    const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCard, setNewCard] = useState({
        cardNumber: '',
        cardName: '',
        expMonth: '',
        expYear: '',
        cvv: '',
        makeDefault: false
    });
    
    // Edit profile states
    const [editingProfile, setEditingProfile] = useState(false);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    
    // Edit profile form state
    const [formData, setFormData] = useState({
        name: userData.name,
        email: userData.email,
        addresses: userData.addresses || [userData.address]
    });
    
    // New address state
    const [addingAddress, setAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
    });
    
    // Password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    
    // Initialize edit form when entering edit mode
    const toggleEditMode = () => {
        if (!editingProfile) {
            // Initialize form data with current user data when entering edit mode
            setFormData({
                name: userData.name,
                email: userData.email,
                addresses: userData.addresses || [userData.address]
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
        const updatedAddresses = [...formData.addresses];
        updatedAddresses[index] = {
            ...updatedAddresses[index],
            [field]: value
        };
        
        setFormData({
            ...formData,
            addresses: updatedAddresses
        });
    };
    
    // Handle changes to new address form
    const handleNewAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress({
            ...newAddress,
            [name]: value
        });
    };
    
    // Add new address to addresses array
    const handleAddAddress = () => {
        // Validate the new address
        if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
            alert('Please fill in all required address fields');
            return;
        }
        
        // Add new address to the addresses array
        setFormData({
            ...formData,
            addresses: [...formData.addresses, newAddress]
        });
        
        // Reset the new address form and hide it
        setNewAddress({
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States'
        });
        setAddingAddress(false);
    };
    
    // Remove an address
    const handleRemoveAddress = (index) => {
        // Don't allow removing the last address
        if (formData.addresses.length <= 1) {
            alert('You must have at least one address');
            return;
        }
        
        const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            addresses: updatedAddresses
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
            address: formData.addresses[0],
            // Update the addresses array
            addresses: formData.addresses
        });
        
        // Exit edit mode
        setEditingProfile(false);
        
        // Show a success notification
        alert('Profile updated successfully!');
    };
    
    // Change selected address for display when not in edit mode
    const changeSelectedAddress = (index) => {
        setSelectedAddressIndex(index);
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

    // Payment methods functions
    
    // Handle input change for new card form
    const handleCardInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewCard({
            ...newCard,
            [name]: type === 'checkbox' ? checked : value
        });
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

     // Handle form submission for new payment method
     const handleAddCardSubmit = (e) => {
        e.preventDefault();
        
        // Create a new payment method object
        const newPaymentMethod = {
            id: `pm_${Math.floor(Math.random() * 1000000)}`,
            type: "credit",
            brand: newCard.cardNumber.startsWith('4') ? 'Visa' : 
                   newCard.cardNumber.startsWith('5') ? 'Mastercard' : 
                   newCard.cardNumber.startsWith('3') ? 'American Express' : 'Unknown',
            last4: newCard.cardNumber.slice(-4),
            expMonth: parseInt(newCard.expMonth),
            expYear: parseInt(newCard.expYear),
            isDefault: newCard.makeDefault
        };
        // Update existing cards if new card is set as default
        let updatedPaymentMethods = [...paymentMethods];
        if (newCard.makeDefault) {
            updatedPaymentMethods = updatedPaymentMethods.map(method => ({
                ...method,
                isDefault: false
            }));
        }

        // Add the new card
        setPaymentMethods([...updatedPaymentMethods, newPaymentMethod]);
        
        // Reset form and hide it
        setNewCard({
            cardNumber: '',
            cardName: '',
            expMonth: '',
            expYear: '',
            cvv: '',
            makeDefault: false
        });
        setShowAddForm(false);
    };

    // Set a payment method as default
    const setDefaultPaymentMethod = (id) => {
        const updatedMethods = paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === id
        }));
        setPaymentMethods(updatedMethods);
    };
    
    // Delete a payment method
    const deletePaymentMethod = (id) => {
        const updatedMethods = paymentMethods.filter(method => method.id !== id);
        setPaymentMethods(updatedMethods);
    };

     // Get card type icon/class based on card brand
     const getCardTypeClass = (brand) => {
        switch(brand.toLowerCase()) {
            case 'visa': return 'visa-icon';
            case 'mastercard': return 'mastercard-icon';
            case 'american express': return 'amex-icon';
            default: return 'card-icon';
        }
    };

    // Render payment methods section
    const renderPaymentMethodsSection = () => (
        <div>
            <h2 className="section-title">Payment Methods</h2>
            
            {paymentMethods.length > 0 ? (
                <div className="payment-methods-list">
                    {paymentMethods.map(method => (
                        <div key={method.id} className={`payment-method-card ${method.isDefault ? 'default-card' : ''}`}>
                            <div className="card-header">
                                <div className={`card-brand ${getCardTypeClass(method.brand)}`}>
                                    {method.brand}
                                </div>
                                {method.isDefault && <div className="default-badge">Default</div>}
                            </div>
                            
                            <div className="card-details">
                                <div className="card-number">
                                    •••• •••• •••• {method.last4}
                                </div>
                                <div className="card-expiry">
                                    Expires: {method.expMonth}/{method.expYear}
                                </div>
                            </div>
                            
                            <div className="card-actions">
                                {!method.isDefault && (
                                    <button 
                                        className="set-default-btn"
                                        onClick={() => setDefaultPaymentMethod(method.id)}
                                    >
                                        Set as Default
                                    </button>
                                )}
                                <button 
                                    className="delete-btn"
                                    onClick={() => deletePaymentMethod(method.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-payment-methods">
                    <p>You don't have any saved payment methods.</p>
                </div>
            )}
            
            {!showAddForm ? (
                <button 
                    className="add-payment-btn"
                    onClick={() => setShowAddForm(true)}
                >
                    <span>+</span> Add Payment Method
                </button>
            ) : (
                <div className="add-payment-form">
                    <h3>Add New Payment Method</h3>
                    <form onSubmit={handleAddCardSubmit}>
                        <div className="form-group">
                            <label htmlFor="cardName">Name on Card</label>
                            <input
                                type="text"
                                id="cardName"
                                name="cardName"
                                value={newCard.cardName}
                                onChange={handleCardInputChange}
                                required
                                className="form-input"
                                placeholder="John Doe"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="cardNumber">Card Number</label>
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={newCard.cardNumber}
                                onChange={(e) => {
                                    const formattedValue = formatCardNumber(e.target.value);
                                    setNewCard({...newCard, cardNumber: formattedValue});
                                }}
                                required
                                className="form-input"
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group expiry-group">
                                <label htmlFor="expMonth">Expiration Date</label>
                                <div className="expiry-inputs">
                                    <select
                                        id="expMonth"
                                        name="expMonth"
                                        value={newCard.expMonth}
                                        onChange={handleCardInputChange}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Month</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                    <span className="expiry-separator">/</span>
                                    <select
                                        id="expYear"
                                        name="expYear"
                                        value={newCard.expYear}
                                        onChange={handleCardInputChange}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group cvv-group">
                                <label htmlFor="cvv">CVV</label>
                                <input
                                    type="text"
                                    id="cvv"
                                    name="cvv"
                                    value={newCard.cvv}
                                    onChange={handleCardInputChange}
                                    required
                                    className="form-input"
                                    placeholder="123"
                                    maxLength="4"
                                    pattern="\d{3,4}"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group checkbox-group">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    name="makeDefault"
                                    checked={newCard.makeDefault}
                                    onChange={handleCardInputChange}
                                />
                                <span className="checkmark"></span>
                                Set as default payment method
                            </label>
                        </div>
                        
                        <div className="form-buttons">
                            <button type="submit" className="save-btn">Add Payment Method</button>
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
            
            {formData.addresses.map((address, index) => (
                <div key={index} style={{ 
                    backgroundColor: '#FFF8E1', 
                    padding: '20px 30px', /* Increased padding on left and right */
                    borderRadius: '8px', 
                    marginBottom: '20px', 
                    position: 'relative' 
                }}>
                    <h4 style={{ marginTop: '0', marginBottom: '15px' }}>Address {index + 1}</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>Street</label>
                            <input
                                type="text"
                                value={address.street}
                                onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
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
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>City</label>
                            <input
                                type="text"
                                value={address.city}
                                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
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
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>State</label>
                            <input
                                type="text"
                                value={address.state}
                                onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
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
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>Zip Code</label>
                            <input
                                type="text"
                                value={address.zipCode}
                                onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
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
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>Country</label>
                            <input
                                type="text"
                                value={address.country}
                                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
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
                    
                    {formData.addresses.length > 1 && (
                        <button
                            type="button"
                            onClick={() => handleRemoveAddress(index)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'none',
                                border: 'none',
                                color: '#d32f2f',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}

            {/* Add new address section */}
            {addingAddress ? (
                <div style={{ 
                    backgroundColor: '#FFF8E1', 
                    padding: '20px 30px', /* Increased padding on left and right */
                    borderRadius: '8px', 
                    marginBottom: '20px' 
                }}>
                    <h4 style={{ marginTop: '0', marginBottom: '15px' }}>New Address</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>Street</label>
                            <input
                                type="text"
                                name="street"
                                value={newAddress.street}
                                onChange={handleNewAddressChange}
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
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>City</label>
                            <input
                                type="text"
                                name="city"
                                value={newAddress.city}
                                onChange={handleNewAddressChange}
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
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>State</label>
                            <input
                                type="text"
                                name="state"
                                value={newAddress.state}
                                onChange={handleNewAddressChange}
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
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>Zip Code</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={newAddress.zipCode}
                                onChange={handleNewAddressChange}
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
                            <label className="info-label" style={{ marginBottom: '8px', display: 'block' }}>Country</label>
                            <input
                                type="text"
                                name="country"
                                value={newAddress.country}
                                onChange={handleNewAddressChange}
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
                    
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={handleAddAddress}
                            className="edit-button"
                            style={{ marginTop: '0' }}
                        >
                            Save Address
                        </button>
                        <button
                            type="button"
                            onClick={() => setAddingAddress(false)}
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
            ) : (
                <button
                    type="button"
                    onClick={() => setAddingAddress(true)}
                    style={{
                        background: 'none',
                        border: '1px solid var(--warm-brown)',
                        color: 'var(--warm-brown)',
                        padding: '8px 15px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginBottom: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '16px'
                    }}
                >
                    <span style={{ marginRight: '5px', fontWeight: 'bold' }}>+</span> Add New Address
                </button>
            )}
            
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
    const renderProfileView = () => (
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
            
            {/* Display address selector if multiple addresses exist */}
            {userData.addresses && userData.addresses.length > 1 && (
                <div style={{ gridColumn: 'span 2', marginBottom: '15px' }}>
                    <div className="info-label">Select Address</div>
                    <select 
                        onChange={(e) => changeSelectedAddress(parseInt(e.target.value, 10))}
                        value={selectedAddressIndex}
                        style={{ 
                            padding: '8px', 
                            borderRadius: '4px', 
                            border: '1px solid #ddd',
                            width: '100%'
                        }}
                    >
                        {userData.addresses.map((address, index) => (
                            <option key={index} value={index}>
                                Address {index + 1}: {address.street}, {address.city}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            <div className="address-block">
                <div className="info-label">
                    Delivery Address 
                    {userData.addresses && userData.addresses.length > 1 && (
                        <span> #{selectedAddressIndex + 1}</span>
                    )}
                </div>
                <div className="info-value">
                    {userData.addresses 
                        ? <>
                            {userData.addresses[selectedAddressIndex].street}<br />
                            {userData.addresses[selectedAddressIndex].city}, {userData.addresses[selectedAddressIndex].state} {userData.addresses[selectedAddressIndex].zipCode}<br />
                            {userData.addresses[selectedAddressIndex].country}
                          </>
                        : <>
                            {userData.address.street}<br />
                            {userData.address.city}, {userData.address.state} {userData.address.zipCode}<br />
                            {userData.address.country}
                          </>
                    }
                </div>
            </div>
        </div>
        
        <button className="edit-button" onClick={toggleEditMode}>Edit Profile</button>
        </>
    );

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