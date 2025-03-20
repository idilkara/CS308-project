import React, { useState, useEffect } from 'react';
import { BsHeart, BsHeartFill, BsCart, BsDownload, BsPrinter, BsGear, BsBarChart, BsReceipt, BsArrowReturnLeft, BsTag } from 'react-icons/bs';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './SalesManagerPage.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesManagerDashboard = () => {
  // State management
const [activeTab, setActiveTab] = useState('pricing');
const [pendingProducts, setPendingProducts] = useState([]);
const [allProducts, setAllProducts] = useState([]);
const [selectedProducts, setSelectedProducts] = useState([]);
const [discountRate, setDiscountRate] = useState(0);
const [invoiceRange, setInvoiceRange] = useState({ startDate: '', endDate: '' });
const [invoices, setInvoices] = useState([]);
const [financialRange, setFinancialRange] = useState({ startDate: '', endDate: '' });
const [financialData, setFinancialData] = useState(null);
const [refundRequests, setRefundRequests] = useState([]);

// Mock data loading for demonstration
useEffect(() => {
// Simulate API calls
setPendingProducts([
    { id: 1, name: "Premium Headphones", description: "Noise cancelling", image: "/api/placeholder/140/180", cost: 75 },
    { id: 2, name: "Wireless Mouse", description: "Ergonomic design", image: "/api/placeholder/140/180", cost: 20 },
    { id: 3, name: "Mechanical Keyboard", description: "RGB backlit", image: "/api/placeholder/140/180", cost: 45 }
]);

setAllProducts([
    { id: 4, name: "Desktop Monitor", description: "27 inch 4K", image: "/api/placeholder/140/180", price: 299.99, cost: 150 },
    { id: 5, name: "Laptop Stand", description: "Adjustable height", image: "/api/placeholder/140/180", price: 49.99, cost: 25 },
    { id: 6, name: "USB-C Hub", description: "10-in-1 ports", image: "/api/placeholder/140/180", price: 79.99, cost: 40 }
]);

setInvoices([
    { id: 101, date: '2025-03-15', customer: 'John Doe', total: 429.97, items: [{ id: 4, qty: 1 }, { id: 5, qty: 1 }, { id: 6, qty: 1 }] },
    { id: 102, date: '2025-03-17', customer: 'Jane Smith', total: 349.98, items: [{ id: 4, qty: 1 }, { id: 6, qty: 1 }] },
    { id: 103, date: '2025-03-18', customer: 'Bob Johnson', total: 49.99, items: [{ id: 5, qty: 1 }] }
]);

setRefundRequests([
    { id: 201, invoiceId: 101, date: '2025-03-18', customer: 'John Doe', item: { id: 5, name: 'Laptop Stand', price: 49.99 }, reason: 'Defective product', status: 'pending' },
    { id: 202, invoiceId: 102, date: '2025-03-19', customer: 'Jane Smith', item: { id: 6, name: 'USB-C Hub', price: 79.99 }, reason: 'Changed mind', status: 'pending' }
]);
}, []);

// Set price for pending products
const handleSetPrice = (productId, price) => {
const updatedPending = pendingProducts.map(product => 
    product.id === productId ? { ...product, price: parseFloat(price) } : product
);
setPendingProducts(updatedPending);
};

// Publish product (move from pending to all products)
const handlePublishProduct = (productId) => {
const productToMove = pendingProducts.find(p => p.id === productId);
if (productToMove && productToMove.price > 0) {
    setPendingProducts(pendingProducts.filter(p => p.id !== productId));
    setAllProducts([...allProducts, productToMove]);
}
};

// Toggle product selection for discount
const handleToggleProductSelection = (productId) => {
if (selectedProducts.includes(productId)) {
    setSelectedProducts(selectedProducts.filter(id => id !== productId));
} else {
    setSelectedProducts([...selectedProducts, productId]);
}
};

// Apply discount to selected products
const handleApplyDiscount = () => {
if (discountRate <= 0 || discountRate > 90) {
    alert('Please enter a valid discount rate between 1 and 90%');
    return;
}

const updatedProducts = allProducts.map(product => {
    if (selectedProducts.includes(product.id)) {
    const originalPrice = product.price;
    const discountedPrice = originalPrice * (1 - discountRate / 100);
    return { 
        ...product, 
        originalPrice,
        discountRate,
        price: parseFloat(discountedPrice.toFixed(2))
    };
    }
    return product;
});

setAllProducts(updatedProducts);
setSelectedProducts([]);
setDiscountRate(0);
alert(`Discount applied to ${selectedProducts.length} products and notifications sent to users with these items in their wishlist.`);
};

// Search invoices based on date range
const handleSearchInvoices = () => {
const { startDate, endDate } = invoiceRange;
const filteredInvoices = invoices.filter(invoice => 
    invoice.date >= startDate && invoice.date <= endDate
);
return filteredInvoices;
};

// Generate financial report data
const handleGenerateFinancialData = () => {
const { startDate, endDate } = financialRange;
const months = ['January', 'February', 'March', 'April', 'May'];

// Sample data for demonstration
const data = {
    labels: months,
    datasets: [
    {
        label: 'Revenue',
        data: [15000, 18000, 22000, 20000, 25000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
    {
        label: 'Profit',
        data: [7500, 9000, 11000, 10000, 12500],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }
    ],
};

setFinancialData(data);
};

// Handle approve refund
const handleApproveRefund = (refundId) => {
const updatedRefunds = refundRequests.map(refund => 
    refund.id === refundId ? { ...refund, status: 'approved' } : refund
);
setRefundRequests(updatedRefunds);
alert(`Refund #${refundId} has been approved.`);
};

// Handle reject refund
const handleRejectRefund = (refundId) => {
const updatedRefunds = refundRequests.map(refund => 
    refund.id === refundId ? { ...refund, status: 'rejected' } : refund
);
setRefundRequests(updatedRefunds);
alert(`Refund #${refundId} has been rejected.`);
};

return (
<div className="container">
    {/* Sidebar */}
    <div className="sidebar">
    <div className="sidebar-header">
        <div className="brand">Sales Manager</div>
    </div>
    <div className="sidebar-menu">
        <div 
        className={`filter-dropdown ${activeTab === 'pricing' ? 'active' : ''}`}
        onClick={() => setActiveTab('pricing')}
        >
        <div className="filter-dropdown-header">
            <span><BsTag className="icon" />Price Management</span>
        </div>
        </div>
        
        <div 
        className={`filter-dropdown ${activeTab === 'discounts' ? 'active' : ''}`}
        onClick={() => setActiveTab('discounts')}
        >
        <div className="filter-dropdown-header">
            <span><BsTag className="icon" />Discounts</span>
        </div>
        </div>
        
        <div 
        className={`filter-dropdown ${activeTab === 'invoices' ? 'active' : ''}`}
        onClick={() => setActiveTab('invoices')}
        >
        <div className="filter-dropdown-header">
            <span><BsReceipt className="icon" />Invoices</span>
        </div>
        </div>
        
        <div 
        className={`filter-dropdown ${activeTab === 'financials' ? 'active' : ''}`}
        onClick={() => setActiveTab('financials')}
        >
        <div className="filter-dropdown-header">
            <span><BsBarChart className="icon" />Financial Reports</span>
        </div>
        </div>
        
        <div 
        className={`filter-dropdown ${activeTab === 'refunds' ? 'active' : ''}`}
        onClick={() => setActiveTab('refunds')}
        >
        <div className="filter-dropdown-header">
            <span><BsArrowReturnLeft className="icon" />Refund Requests</span>
        </div>
        </div>
    </div>
    </div>
    
    {/* Main Content */}
    <div className="main-content">
    <div className="top-bar">
        <h1 className="source-sans-semibold">
        {activeTab === 'pricing' && 'Price Management'}
        {activeTab === 'discounts' && 'Discounts'}
        {activeTab === 'invoices' && 'Invoices'}
        {activeTab === 'financials' && 'Financial Reports'}
        {activeTab === 'refunds' && 'Refund Requests'}
        </h1>
    </div>
    
    <div className="content-wrapper">
        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
        <div className="tab-container">
            <h2>Set Prices for New Products</h2>
            <p>Products must have prices set before they can appear in the store.</p>
            
            <div className="grid-container">
            {pendingProducts.map(product => (
                <div className="grid-item" key={product.id}>
                <div className="grid-item-header">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>Cost: ${product.cost.toFixed(2)}</p>
                </div>
                <div className="grid-item-content">
                    <img src={product.image} alt={product.name} />
                    <div className="price-input-container">
                    <label htmlFor={`price-${product.id}`}>Set Price ($):</label>
                    <input
                        id={`price-${product.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={product.price || ''}
                        onChange={e => handleSetPrice(product.id, e.target.value)}
                        className="price-input"
                    />
                    <button 
                        onClick={() => handlePublishProduct(product.id)}
                        className="publish-btn"
                        disabled={!product.price}
                    >
                        Publish Product
                    </button>
                    </div>
                </div>
                </div>
            ))}
            {pendingProducts.length === 0 && (
                <div className="no-products">
                <p>No pending products require pricing.</p>
                </div>
            )}
            </div>
        </div>
        )}
        
        {/* Discounts Tab */}
        {activeTab === 'discounts' && (
        <div className="tab-container">
            <h2>Set Product Discounts</h2>
            <p>Select products and apply a discount percentage.</p>
            
            <div className="discount-control">
            <div>
                <label htmlFor="discount-rate">Discount Rate (%):</label>
                <input 
                id="discount-rate"
                type="number" 
                min="1" 
                max="90"
                value={discountRate}
                onChange={e => setDiscountRate(parseInt(e.target.value) || 0)}
                className="discount-input"
                />
            </div>
            <button 
                onClick={handleApplyDiscount}
                disabled={selectedProducts.length === 0 || discountRate <= 0}
                className="apply-discount-btn"
            >
                Apply Discount to Selected Products
            </button>
            <div>
                <span>{selectedProducts.length} products selected</span>
            </div>
            </div>
            
            <div className="grid-container">
            {allProducts.map(product => (
                <div 
                className={`grid-item ${selectedProducts.includes(product.id) ? 'selected' : ''}`}
                key={product.id}
                >
                <div className="item-actions">
                    <button 
                    className={`favorite-btn ${selectedProducts.includes(product.id) ? 'active' : ''}`}
                    onClick={() => handleToggleProductSelection(product.id)}
                    >
                    {selectedProducts.includes(product.id) ? (
                        <span className="heart-filled"><BsHeartFill /></span>
                    ) : (
                        <span className="heart-outline"><BsHeart /></span>
                    )}
                    </button>
                </div>
                <div className="grid-item-header">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                </div>
                <div className="grid-item-content">
                    <img src={product.image} alt={product.name} />
                    <div className="price-display">
                    {product.originalPrice ? (
                        <>
                        <p className="original-price">${product.originalPrice.toFixed(2)}</p>
                        <p className="discounted-price">
                            ${product.price.toFixed(2)} ({product.discountRate}% OFF)
                        </p>
                        </>
                    ) : (
                        <p className="regular-price">${product.price.toFixed(2)}</p>
                    )}
                    <p>Cost: ${product.cost.toFixed(2)}</p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
        )}
        
        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
        <div className="tab-container">
            <h2>Manage Invoices</h2>
            <p>View and export invoices by date range.</p>
            
            <div className="date-range-selector">
            <div>
                <label htmlFor="start-date">Start Date:</label>
                <input 
                id="start-date"
                type="date" 
                value={invoiceRange.startDate}
                onChange={e => setInvoiceRange({...invoiceRange, startDate: e.target.value})}
                className="date-input"
                />
            </div>
            <div>
                <label htmlFor="end-date">End Date:</label>
                <input 
                id="end-date"
                type="date" 
                value={invoiceRange.endDate}
                onChange={e => setInvoiceRange({...invoiceRange, endDate: e.target.value})}
                className="date-input"
                />
            </div>
            <button 
                onClick={handleSearchInvoices}
                disabled={!invoiceRange.startDate || !invoiceRange.endDate}
                className="search-btn"
            >
                Search Invoices
            </button>
            </div>
            
            <div className="invoices-table">
            <table>
                <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th className="right-align">Total</th>
                    <th className="center-align">Actions</th>
                </tr>
                </thead>
                <tbody>
                {invoices.map(invoice => (
                    <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.date}</td>
                    <td>{invoice.customer}</td>
                    <td className="right-align">${invoice.total.toFixed(2)}</td>
                    <td className="actions-cell">
                        <button className="icon-btn" title="Print Invoice">
                        <BsPrinter />
                        </button>
                        <button className="icon-btn" title="Download as PDF">
                        <BsDownload />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        )}
        
        {/* Financials Tab */}
        {activeTab === 'financials' && (
        <div className="tab-container">
            <h2>Financial Reports</h2>
            <p>View revenue and profit/loss in a given date range.</p>
            
            <div className="date-range-selector">
            <div>
                <label htmlFor="financial-start-date">Start Date:</label>
                <input 
                id="financial-start-date"
                type="date" 
                value={financialRange.startDate}
                onChange={e => setFinancialRange({...financialRange, startDate: e.target.value})}
                className="date-input"
                />
            </div>
            <div>
                <label htmlFor="financial-end-date">End Date:</label>
                <input 
                id="financial-end-date"
                type="date" 
                value={financialRange.endDate}
                onChange={e => setFinancialRange({...financialRange, endDate: e.target.value})}
                className="date-input"
                />
            </div>
            <button 
                onClick={handleGenerateFinancialData}
                disabled={!financialRange.startDate || !financialRange.endDate}
                className="generate-btn"
            >
                Generate Report
            </button>
            </div>
            
            {financialData && (
            <div className="financial-chart">
                <Line 
                data={financialData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Revenue and Profit Analysis'
                    }
                    }
                }}
                />
                
                <div className="financial-summary">
                <div className="summary-card">
                    <h3>Total Revenue</h3>
                    <p className="summary-value">$100,000.00</p>
                </div>
                <div className="summary-card">
                    <h3>Total Profit</h3>
                    <p className="summary-value">$50,000.00</p>
                </div>
                <div className="summary-card">
                    <h3>Profit Margin</h3>
                    <p className="summary-value">50%</p>
                </div>
                </div>
            </div>
            )}
        </div>
        )}
        
        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
        <div className="tab-container">
            <h2>Manage Refund Requests</h2>
            <p>Evaluate and process customer refund requests.</p>
            
            <div className="refunds-table">
            <table>
                <thead>
                <tr>
                    <th>Request #</th>
                    <th>Date</th>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Item</th>
                    <th className="right-align">Amount</th>
                    <th>Reason</th>
                    <th className="center-align">Status</th>
                    <th className="center-align">Actions</th>
                </tr>
                </thead>
                <tbody>
                {refundRequests.map(refund => (
                    <tr key={refund.id}>
                    <td>{refund.id}</td>
                    <td>{refund.date}</td>
                    <td>{refund.invoiceId}</td>
                    <td>{refund.customer}</td>
                    <td>{refund.item.name}</td>
                    <td className="right-align">${refund.item.price.toFixed(2)}</td>
                    <td>{refund.reason}</td>
                    <td className="center-align">
                        <span className={`status-badge ${refund.status}`}>
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                        </span>
                    </td>
                    <td className="actions-cell">
                        {refund.status === 'pending' && (
                        <>
                            <button 
                            onClick={() => handleApproveRefund(refund.id)}
                            className="approve-btn"
                            >
                            Approve
                            </button>
                            <button 
                            onClick={() => handleRejectRefund(refund.id)}
                            className="reject-btn"
                            >
                            Reject
                            </button>
                        </>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        )}
    </div>
    </div>
</div>
);
};

export default SalesManagerDashboard;