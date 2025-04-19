import React, { useState, useEffect } from 'react';
import './SalesManagerPage.css';
import { useAuth } from './context/AuthContext';
import Navbar from "./components/Navbar.jsx";
import Chart from 'chart.js/auto';

const SalesManager = () => {
    const { token, role } = useAuth();
    console.log(token);
    console.log(role);

  // Fix scroll issues (same approach as ProductManager)
  useEffect(() => {
    document.body.style.overflow = 'auto';
    
    const fixContainers = () => {
      let element = document.querySelector('.sales-manager');
      if (!element) return;
      
      while (element && element !== document.body) {
        const style = window.getComputedStyle(element);
        
        if (style.overflow === 'hidden' || 
            style.height === '100vh' || 
            style.height === '100%' ||
            style.position === 'fixed') {
          
          element.style.height = 'auto';
          element.style.maxHeight = 'none';
          element.style.overflow = 'visible';
          
          console.log('Fixed container:', element);
        }
        
        element = element.parentElement;
      }
    };
    
    fixContainers();
    setTimeout(fixContainers, 500);
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // State for active section
  const [activeSection, setActiveSection] = useState('pricing');
  
  // State for new product pricing
  const [newProducts, setNewProducts] = useState([]);
  const [pricingIsLoading, setPricingIsLoading] = useState(false);
  const [editPriceId, setEditPriceId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newCost, setNewCost] = useState('');
  
  // State for discounts
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountRate, setDiscountRate] = useState('');
  const [discountStartDate, setDiscountStartDate] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  
  // State for reports
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);
  
  // State for refunds
  const [refundRequests, setRefundRequests] = useState([]);
  const [refundIsLoading, setRefundIsLoading] = useState(false);

  // API calls for pricing
  const fetchNewProducts = async (token) => {
   
      try {
          const response = await fetch("http://localhost/api/sm/waiting_products", {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
          });
  
          if (response.ok) {
              try {
                  const data = await response.json();
                  console.log("Waiting products fetched successfully:", data);
                  return data; // Return the waiting products
              } catch (error) {
                  console.error("Invalid JSON response:", error);
                  return { error: "Invalid JSON response", status_code: response.status };
              }
          } else {
              try {
                  const errorData = await response.json();
                  console.error("Failed to fetch waiting products:", errorData);
                  return { error: "Failed to fetch waiting products", status_code: response.status, details: errorData };
              } catch (error) {
                  console.error("Failed to fetch waiting products:", error);
                  return { error: "Failed to fetch waiting products", status_code: response.status, details: response.statusText };
              }
          }
      } catch (error) {
          console.error("Error fetching waiting products:", error);
          return { error: "An unexpected error occurred", status_code: 500 };
      }
  
  };

  const updatePrice = async (token, productId, price) => {
      try {
        const response = await fetch(`http://localhost/api/sm/update_price/${productId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ price: price })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Price updated successfully:", data);
            return data; // Return the response data
        } else {
            const errorData = await response.json();
            console.error("Failed to update price:", errorData);
            return { error: "Failed to update price", status_code: response.status };
        }
    } catch (error) {
        console.error("Error updating price:", error);
        return { error: "An unexpected error occurred", status_code: 500 };
    }
  };

  const viewProductsSM = async (token) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch("http://localhost/api/sm/viewproducts", {
        method: "GET",
        headers,
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Products fetched successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch products:", errorData.error || "Unknown error");
        return { error: errorData.error || "Failed to fetch products" };
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      return { error: "An unexpected error occurred" };
    }
  };
  viewProductsSM(token)

  const applyDiscount = async () => {
    if (!discountRate || !discountStartDate || !discountEndDate || selectedProducts.length === 0) {
      alert("Please fill all discount details and select at least one product");
      return;
    }
    
    try {
     
      console.log(`Applying ${discountRate}% discount to ${selectedProducts.length} products`);
      console.log(`From ${discountStartDate} to ${discountEndDate}`);
      
      // Update local state to show discount applied
      setAllProducts(prevProducts => 
        prevProducts.map(product => 
          selectedProducts.includes(product.id) 
            ? {...product, discounted: true} 
            : product
        )
      );
      
      // Reset form
      setSelectedProducts([]);
      setDiscountRate('');
      setDiscountStartDate('');
      setDiscountEndDate('');
      
      alert("Discount applied successfully! Customers have been notified.");
      
      return { success: true };
    } catch (error) {
      console.error("Error applying discount:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  // API calls for reports
  const fetchInvoices = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    
    try {
      // Simulate API call
      setTimeout(() => {
        const sampleInvoices = [
          { id: "INV-2023-001", date: "2025-03-12", customer: "John Smith", total: 37.97, items: 3 },
          { id: "INV-2023-002", date: "2025-03-13", customer: "Mary Jones", total: 42.98, items: 2 },
          { id: "INV-2023-003", date: "2025-03-14", customer: "Robert Brown", total: 24.99, items: 1 },
          { id: "INV-2023-004", date: "2025-03-15", customer: "Jane Miller", total: 54.97, items: 3 },
          { id: "INV-2023-005", date: "2025-03-16", customer: "Sam Wilson", total: 29.98, items: 2 }
        ];
        setInvoices(sampleInvoices);
        
        // Sample report data
        const reportSample = {
          revenue: 190.89,
          cost: 95.45,
          profit: 95.44,
          dailyData: [
            { date: '2025-03-12', revenue: 37.97, cost: 18.99, profit: 18.98 },
            { date: '2025-03-13', revenue: 42.98, cost: 21.49, profit: 21.49 },
            { date: '2025-03-14', revenue: 24.99, cost: 12.50, profit: 12.49 },
            { date: '2025-03-15', revenue: 54.97, cost: 27.48, profit: 27.49 },
            { date: '2025-03-16', revenue: 29.98, cost: 14.99, profit: 14.99 }
          ]
        };
        setReportData(reportSample);
        
        // Create chart
        createChart(reportSample.dailyData);
      }, 800);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const createChart = (data) => {
    // Destroy previous chart if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(day => day.date),
        datasets: [
          {
            label: 'Revenue',
            data: data.map(day => day.revenue),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          },
          {
            label: 'Cost',
            data: data.map(day => day.cost),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
          },
          {
            label: 'Profit',
            data: data.map(day => day.profit),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    setChartInstance(chart);
  };

  // API calls for refund requests
  const fetchRefundRequests = async () => {
    setRefundIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const sampleRefunds = [
          { 
            id: 301, 
            orderId: "ORD-2023-010", 
            customer: "Alice Johnson", 
            product: "Fiction Novel", 
            purchaseDate: "2025-03-05", 
            purchasePrice: 12.99,
            discounted: true,
            originalPrice: 14.99,
            reason: "Item arrived damaged",
            status: "pending"
          },
          { 
            id: 302, 
            orderId: "ORD-2023-015", 
            customer: "Michael Davis", 
            product: "Sci-Fi Novel", 
            purchaseDate: "2025-03-08", 
            purchasePrice: 11.99,
            discounted: false,
            originalPrice: 11.99,
            reason: "Wrong item received",
            status: "pending"
          },
          { 
            id: 303, 
            orderId: "ORD-2023-018", 
            customer: "Emma Wilson", 
            product: "Fantasy Book", 
            purchaseDate: "2025-03-10", 
            purchasePrice: 15.29,
            discounted: true,
            originalPrice: 16.99,
            reason: "Changed my mind",
            status: "pending"
          }
        ];
        setRefundRequests(sampleRefunds);
        setRefundIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      setRefundIsLoading(false);
    }
  };

  const handleRefundAction = async (refundId, action) => {
    try {
      // Simulate API call
      console.log(`${action} refund request ${refundId}`);
      
      // Update local state
      setRefundRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === refundId 
            ? {...request, status: action === 'approve' ? 'approved' : 'rejected'} 
            : request
        )
      );
      
      if (action === 'approve') {
        alert(`Refund #${refundId} approved. Stock has been updated and customer has been notified.`);
      } else {
        alert(`Refund #${refundId} rejected. Customer has been notified.`);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error processing refund:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  // Load data when section changes
  useEffect(() => {
    switch(activeSection) {
      case 'pricing':
        fetchNewProducts();
        break;
      case 'discounts':
        viewProductsSM();
        break;
      case 'refunds':
        fetchRefundRequests();
        break;
      default:
        break;
    }
  }, [activeSection]);

  // Handlers
  const handlePriceInputChange = (e) => {
    setNewPrice(e.target.value);
  };

  const handleCostInputChange = (e) => {
    setNewCost(e.target.value);
  };

  const startEditPrice = (product) => {
    setEditPriceId(product.id);
    setNewPrice(product.price ? product.price.toString() : '');
    setNewCost(product.cost ? product.cost.toString() : '');
  };

  const handlePriceUpdate = async (id) => {
    if (newPrice === '' || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
      alert('Please enter a valid price (must be a positive number)');
      return;
    }
    
    // For cost, default to 50% of price if not specified
    const finalCost = newCost === '' || isNaN(newCost) ? parseFloat(newPrice) * 0.5 : parseFloat(newCost);
    
    const result = await updatePrice(id, parseFloat(newPrice), finalCost);
    
    if (result.success) {
      setEditPriceId(null);
      setNewPrice('');
      setNewCost('');
      alert(`Price updated successfully for product #${id}`);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const cancelPriceEdit = () => {
    setEditPriceId(null);
    setNewPrice('');
    setNewCost('');
  };

  const handleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    const result = await applyDiscount();
    
    if (!result.success && result.error) {
      alert(`Error: ${result.error}`);
    }
  };

  const handleSaveInvoicePDF = (invoiceId) => {
    // In a real app, this would trigger a PDF download
    alert(`Saving invoice ${invoiceId} as PDF...`);
  };

  const handlePrintInvoice = (invoiceId) => {
    // In a real app, this would open a print dialog
    alert(`Printing invoice ${invoiceId}...`);
  };

  return (
    <div>
      <Navbar />
   
    <div className="container sales-manager">
      <h1 className="source-sans-bold sm-section-title">Sales Manager</h1>
      
      {/* Navigation Tabs */}
      <div className="sm-section-tabs">
        <button 
          className={`sm-tab source-sans-semibold ${activeSection === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveSection('pricing')}
        >
          Set Prices
        </button>
        <button 
          className={`sm-tab source-sans-semibold ${activeSection === 'discounts' ? 'active' : ''}`}
          onClick={() => setActiveSection('discounts')}
        >
          Manage Discounts
        </button>
        <button 
          className={`sm-tab source-sans-semibold ${activeSection === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveSection('reports')}
        >
          Reports & Invoices
        </button>
        <button 
          className={`sm-tab source-sans-semibold ${activeSection === 'refunds' ? 'active' : ''}`}
          onClick={() => setActiveSection('refunds')}
        >
          Manage Refunds
        </button>
      </div>
      
      {/* Content Area */}
      <div className="sm-section-content">
        {/* Pricing Section */}
        {activeSection === 'pricing' && (
          <div className="pricing-section">
            <h2 className="source-sans-semibold">Set Product Prices</h2>
            <p>New products require pricing before they become available for purchase.</p>
            
            {pricingIsLoading ? (
              <div className="sm-loading">
                <p>Loading products...</p>
              </div>
            ) : newProducts.length === 0 ? (
              <div className="sm-no-products">
                <p>No new products require pricing at this time.</p>
              </div>
            ) : (
              <div className="sm-pricing-table-container">
                <table className="sm-pricing-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product Name</th>
                      <th>Author</th>
                      <th>Stock</th>
                      <th className="price-column">Price ($)</th>
                      <th className="cost-column">Cost ($)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.author}</td>
                        <td>{product.stock}</td>
                        <td className="price-column">
                          {editPriceId === product.id ? (
                            <input
                              type="number"
                              className="sm-price-input"
                              value={newPrice}
                              onChange={handlePriceInputChange}
                              min="0.01"
                              step="0.01"
                            />
                          ) : product.price ? (
                            `$${product.price}`
                          ) : (
                            <span style={{color: 'red'}}>Not set</span>
                          )}
                        </td>
                        <td className="cost-column">
                          {editPriceId === product.id ? (
                            <input
                              type="number"
                              className="sm-cost-input"
                              value={newCost}
                              onChange={handleCostInputChange}
                              min="0.01"
                              step="0.01"
                              placeholder="50% of price if empty"
                            />
                          ) : product.cost ? (
                            `$${product.cost}`
                          ) : (
                            <span style={{color: 'gray'}}>Not set</span>
                          )}
                        </td>
                        <td>
                          {editPriceId === product.id ? (
                            <div className="stock-edit-actions">
                              <button 
                                className="sm-btn-save"
                                onClick={() => handlePriceUpdate(product.id)}
                              >
                                Save
                              </button>
                              <button 
                                className="sm-btn-cancel"
                                onClick={cancelPriceEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (    <button 
                            className="sm-btn-edit"
                            onClick={() => startEditPrice(product)}
                          >
                            Set Price
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Discounts Section */}
      {activeSection === 'discounts' && (
        <div className="discounts-section">
          <h2 className="source-sans-semibold">Manage Discounts</h2>
          <p>Apply promotional discounts to selected products.</p>
          
          <form onSubmit={handleDiscountSubmit} className="sm-discount-form">
            <div className="sm-form-row">
              <div className="sm-form-group">
                <label>Discount Rate (%)</label>
                <input
                  type="number"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(e.target.value)}
                  min="1"
                  max="90"
                  required
                />
              </div>
              <div className="sm-form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={discountStartDate}
                  onChange={(e) => setDiscountStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="sm-form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={discountEndDate}
                  onChange={(e) => setDiscountEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="sm-btn-apply-discount">Apply Discount</button>
          </form>
          
          <div className="sm-product-selection">
            <h3>Select Products for Discount</h3>
            <div className="sm-product-grid">
              {allProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`sm-product-card ${selectedProducts.includes(product.id) ? 'selected' : ''} ${product.discounted ? 'discounted' : ''}`}
                  onClick={() => !product.discounted && handleProductSelection(product.id)}
                >
                  <h4>{product.name}</h4>
                  <p>By {product.author}</p>
                  <p className="sm-product-price">${product.price}</p>
                  {product.discounted && (
                    <span className="sm-discount-badge">On Sale</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Reports Section */}
      {activeSection === 'reports' && (
        <div className="reports-section">
          <h2 className="source-sans-semibold">Sales Reports & Invoices</h2>
          
          <div className="sm-date-selector">
            <div className="sm-form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="sm-form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button onClick={fetchInvoices} className="sm-btn-generate">Generate Report</button>
          </div>
          
          {reportData && (
            <div className="sm-report-data">
              <div className="sm-summary-cards">
                <div className="sm-summary-card">
                  <h3>Revenue</h3>
                  <p className="sm-amount">${reportData.revenue.toFixed(2)}</p>
                </div>
                <div className="sm-summary-card">
                  <h3>Cost</h3>
                  <p className="sm-amount">${reportData.cost.toFixed(2)}</p>
                </div>
                <div className="sm-summary-card">
                  <h3>Profit</h3>
                  <p className="sm-amount">${reportData.profit.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="sm-chart-container">
                <canvas id="revenue-chart"></canvas>
              </div>
              
              <h3>Invoice List</h3>
              <div className="sm-invoice-table-container">
                <table className="sm-invoice-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td>{invoice.id}</td>
                        <td>{invoice.date}</td>
                        <td>{invoice.customer}</td>
                        <td>{invoice.items}</td>
                        <td>${invoice.total.toFixed(2)}</td>
                        <td>
                          <div className="sm-invoice-actions">
                            <button
                              className="sm-btn-view"
                              onClick={() => handleSaveInvoicePDF(invoice.id)}
                            >
                              Save PDF
                            </button>
                            <button
                              className="sm-btn-print"
                              onClick={() => handlePrintInvoice(invoice.id)}
                            >
                              Print
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Refunds Section */}
      {activeSection === 'refunds' && (
        <div className="refunds-section">
          <h2 className="source-sans-semibold">Manage Refund Requests</h2>
          
          {refundIsLoading ? (
            <div className="sm-loading">
              <p>Loading refund requests...</p>
            </div>
          ) : refundRequests.length === 0 ? (
            <div className="sm-no-refunds">
              <p>No pending refund requests at this time.</p>
            </div>
          ) : (
            <div className="sm-refund-table-container">
              <table className="sm-refund-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Purchase Date</th>
                    <th>Price</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refundRequests.map(request => (
                    <tr key={request.id} className={`status-${request.status}`}>
                      <td>{request.id}</td>
                      <td>{request.orderId}</td>
                      <td>{request.customer}</td>
                      <td>{request.product}</td>
                      <td>{request.purchaseDate}</td>
                      <td>
                        ${request.purchasePrice.toFixed(2)}
                        {request.discounted && (
                          <span className="discounted-price">
                            (was ${request.originalPrice.toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td>{request.reason}</td>
                      <td>{request.status}</td>
                      <td>
                        {request.status === 'pending' && (
                          <div className="sm-refund-actions">
                            <button
                              className="sm-btn-approve"
                              onClick={() => handleRefundAction(request.id, 'approve')}
                            >
                              Approve
                            </button>
                            <button
                              className="sm-btn-reject"
                              onClick={() => handleRefundAction(request.id, 'reject')}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  </div>
);
};

export default SalesManager;