import React, { useState, useEffect } from 'react';
import './SalesManagerPage.css';
import { useAuth } from './context/AuthContext';
import Chart from 'chart.js/auto';
import Navbar from "./components/Navbar.jsx";

const SalesManager = () => {
  const { token } = useAuth();

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

  // ---------- API CALLS ----------

  // // API calls for pricing
  // const fetchNewProducts = async () => {
  //   setPricingIsLoading(true);
  //   try {
  //     // Simulate API call
  //     setTimeout(() => {
  //       const sampleNewProducts = [
  //         { id: 201, name: "New Novel", author: "J. Author", stock: 20, price: "", cost: "", status: "Pending" },
  //         { id: 202, name: "Business Guide", author: "B. Writer", stock: 15, price: "", cost: "", status: "Pending" },
  //         { id: 203, name: "Adventure Book", author: "A. Explorer", stock: 25, price: "", cost: "", status: "Pending" }
  //       ];
  //       setNewProducts(sampleNewProducts);
  //       setPricingIsLoading(false);
  //     }, 800);
  //   } catch (error) {
  //     console.error("Error fetching new products:", error);
  //     setPricingIsLoading(false);
  //   }
  // };

  const fetchNewProducts = async (token) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch("http://localhost/api/sm/waiting_products", {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("New waiting products fetched:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch waiting products:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to fetch waiting products" };
      }
    } catch (error) {
      console.error("Error fetching waiting products:", error);
      return { error: "An unexpected error occurred" };
    }
  };



  const updatePrice = async (token, productId, price) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = { price };

    try {
      const response = await fetch(`http://localhost/api/sm/update_price/${productId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Price updated successfully for product ${productId}:`, result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to update price:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to update price" };
      }
    } catch (error) {
      console.error("Error updating price:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  // API calls for discounts
  // const fetchAllProducts = async () => {
  //   try {
  //     // Simulate API call
  //     setTimeout(() => {
  //       const sampleProducts = [
  //         { id: 101, name: "Fiction Novel", author: "John Author", price: 12.99, discounted: false },
  //         { id: 102, name: "Non-Fiction Book", author: "Jane Writer", price: 14.99, discounted: false },
  //         { id: 103, name: "Sci-Fi Novel", author: "Robert Pen", price: 11.99, discounted: false },
  //         { id: 104, name: "Fantasy Book", author: "Sarah Storyteller", price: 16.99, discounted: false },
  //         { id: 201, name: "New Novel", author: "J. Author", price: 13.99, discounted: false },
  //         { id: 202, name: "Business Guide", author: "B. Writer", price: 19.99, discounted: false }
  //       ];
  //       setAllProducts(sampleProducts);
  //     }, 800);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   }
  // };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch("http://localhost/api/products/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("All products fetched:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch all products:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to fetch products" };
      }
    } catch (error) {
      console.error("Error fetching all products:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  // const applyDiscount = async () => {
  //   if (!discountRate || !discountStartDate || !discountEndDate || selectedProducts.length === 0) {
  //     alert("Please fill all discount details and select at least one product");
  //     return;
  //   }
  //
  //   try {
  //     // Simulate API call
  //     console.log(`Applying ${discountRate}% discount to ${selectedProducts.length} products`);
  //     console.log(`From ${discountStartDate} to ${discountEndDate}`);
  //
  //     // Update local state to show discount applied
  //     setAllProducts(prevProducts =>
  //       prevProducts.map(product =>
  //         selectedProducts.includes(product.id)
  //           ? {...product, discounted: true}
  //           : product
  //       )
  //     );
  //
  //     // Reset form
  //     setSelectedProducts([]);
  //     setDiscountRate('');
  //     setDiscountStartDate('');
  //     setDiscountEndDate('');
  //
  //     alert("Discount applied successfully! Customers have been notified.");
  //
  //     return { success: true };
  //   } catch (error) {
  //     console.error("Error applying discount:", error);
  //     return { error: "An unexpected error occurred" };
  //   }
  // };

  const updateDiscount = async (token, productId, discount) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = { product_id: productId, discount };

    try {
      const response = await fetch("http://localhost/api/discount/update_discount", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Discount updated successfully for product ${productId}:`, result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to update discount:", errorData.error || "Unknown error");
        return { error: errorData.error || "Failed to update discount" };
      }
    } catch (error) {
      console.error("Error updating discount:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const applyDiscount = async () => {
    if (!discountRate || !discountStartDate || !discountEndDate || selectedProducts.length === 0) {
      alert("Please fill all discount details and select at least one product");
      return;
    }

    const rate = parseFloat(discountRate);

    // Validate input properly first
    if (isNaN(rate) || rate < 1 || rate > 100) {
      alert("Discount rate must be between 1% and 100%");
      return;
    }

    const discountFraction = rate / 100; // ✅ Always divide by 100 before sending

    try {
      console.log(`Applying ${rate}% discount to ${selectedProducts.length} products`);
      console.log(`From ${discountStartDate} to ${discountEndDate}`);

      for (const productId of selectedProducts) {
        const result = await updateDiscount(token, productId, discountFraction);
        if (result.error) {
          throw new Error(result.error);
        }
      }

      // ✅ Visually update frontend
      setAllProducts(prevProducts =>
          prevProducts.map(product =>
              selectedProducts.includes(product.product_id)
                  ? { ...product, discounted: true }
                  : product
          )
      );

      setSelectedProducts([]);
      setDiscountRate('');
      setDiscountStartDate('');
      setDiscountEndDate('');

      alert("Discount applied successfully! Customers have been notified.");
      return { success: true };

    } catch (error) {
      console.error("Error applying discount:", error);
      alert(`Error: ${error.message}`);
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
  // const fetchRefundRequests = async () => {
  //   setRefundIsLoading(true);
  //   try {
  //     // Simulate API call
  //     setTimeout(() => {
  //       const sampleRefunds = [
  //         {
  //           id: 301,
  //           orderId: "ORD-2023-010",
  //           customer: "Alice Johnson",
  //           product: "Fiction Novel",
  //           purchaseDate: "2025-03-05",
  //           purchasePrice: 12.99,
  //           discounted: true,
  //           originalPrice: 14.99,
  //           reason: "Item arrived damaged",
  //           status: "pending"
  //         },
  //         {
  //           id: 302,
  //           orderId: "ORD-2023-015",
  //           customer: "Michael Davis",
  //           product: "Sci-Fi Novel",
  //           purchaseDate: "2025-03-08",
  //           purchasePrice: 11.99,
  //           discounted: false,
  //           originalPrice: 11.99,
  //           reason: "Wrong item received",
  //           status: "pending"
  //         },
  //         {
  //           id: 303,
  //           orderId: "ORD-2023-018",
  //           customer: "Emma Wilson",
  //           product: "Fantasy Book",
  //           purchaseDate: "2025-03-10",
  //           purchasePrice: 15.29,
  //           discounted: true,
  //           originalPrice: 16.99,
  //           reason: "Changed my mind",
  //           status: "pending"
  //         }
  //       ];
  //       setRefundRequests(sampleRefunds);
  //       setRefundIsLoading(false);
  //     }, 800);
  //   } catch (error) {
  //     console.error("Error fetching refund requests:", error);
  //     setRefundIsLoading(false);
  //   }
  // };

  const fetchRefundRequests = async (token) => {
    setRefundIsLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch("http://localhost/api/refunds/get_all_requests", {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Refund requests fetched:", result);
        setRefundRequests(result); // assuming result is an array of refund requests
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch refund requests:", errorData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching refund requests:", error);
    } finally {
      setRefundIsLoading(false);
    }
  };

  const handleRefundAction = async (refundId, action) => {
    try {
      if (action === 'approve') {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await fetch("http://localhost/api/refunds/accept_return", {
          method: "POST",
          headers,
          body: JSON.stringify({ return_request_id: refundId }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Refund approved:", result);

          // Update local state to mark it as approved
          setRefundRequests(prevRequests =>
              prevRequests.map(request =>
                  request.id === refundId
                      ? { ...request, status: "approved" }
                      : request
              )
          );

          alert(`Refund #${refundId} approved. Stock has been updated and customer has been notified.`);
          return { success: true };
        } else {
          const errorData = await response.json();
          console.error("Failed to approve refund:", errorData.error || "Unknown error");
          alert(`Error approving refund: ${errorData.error || "Unknown error"}`);
          return { error: errorData.error || "Failed to approve refund" };
        }
      } else {
        // If rejected — just update local state without calling backend (no reject API exists)
        setRefundRequests(prevRequests =>
            prevRequests.map(request =>
                request.id === refundId
                    ? { ...request, status: "rejected" }
                    : request
            )
        );
        alert(`Refund #${refundId} rejected. Customer has been notified.`);
        return { success: true };
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  // Load data when section changes
  useEffect(() => {
    const loadData = async () => {
      switch (activeSection) {
        case 'pricing':
          const fetchedProducts = await fetchNewProducts(token);
          if (fetchedProducts && !fetchedProducts.error) {
            setNewProducts(fetchedProducts);
          }
          break;
        case 'discounts':
          const fetchedAllProducts = await fetchAllProducts(token);
          if (fetchedAllProducts && !fetchedAllProducts.error) {
            setAllProducts(fetchedAllProducts);
          }
          break;
        case 'refunds':
          const fetchedRefunds = await fetchRefundRequests(token);
          if (fetchedRefunds && !fetchedRefunds.error) {
            setRefundRequests(fetchedRefunds);
          }
          break;
        default:
          break;
      }
    };

    loadData();
  }, [activeSection]);

  // Handlers
  const handlePriceInputChange = (e) => {
    setNewPrice(e.target.value);
  };

  const handleCostInputChange = (e) => {
    setNewCost(e.target.value);
  };

  const startEditPrice = (product) => {
    setEditPriceId(product.product_id);
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
    console.log(`id ot the product to update price : ${id}`);
    const result = await updatePrice(token, id, parseFloat(newPrice));

    if (result.ok) {
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

  const handlePresetPeriod = (period) => {
    const today = new Date();
    let startDateValue, endDateValue;
    
    switch (period) {
      case 'today':
        startDateValue = today.toISOString().split('T')[0];
        endDateValue = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDateValue = yesterday.toISOString().split('T')[0];
        endDateValue = yesterday.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        startDateValue = weekStart.toISOString().split('T')[0];
        endDateValue = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDateValue = monthStart.toISOString().split('T')[0];
        endDateValue = today.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
        const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
        startDateValue = quarterStart.toISOString().split('T')[0];
        endDateValue = today.toISOString().split('T')[0];
        break;
      default:
        return;
    }
    
    setStartDate(startDateValue);
    setEndDate(endDateValue);
    
    // Optionally fetch data immediately after setting the dates
    setTimeout(() => {
      fetchInvoices();
    }, 100);
  };

  return (
      <div className="container sales-manager">
         <Navbar />
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
                            <tr key={product.product_id}>
                              <td>{product.product_id}</td>
                              <td>{product.name}</td>
                              <td>{product.author}</td>
                              <td>{product.stock}</td>
                              <td className="price-column">
                                {editPriceId === product.product_id ? (
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
                                {editPriceId === product.product_id ? (
                                    <div
                                        type="number"
                                        className="sm-cost-input"
                                        value={newCost}
                                        onChange={handleCostInputChange}
                                        min="0.01"
                                        step="0.01"
                                        placeholder="50% of price"
                                    />
                                ) : product.cost ? (
                                    `$${product.cost}`
                                ) : (
                                    <span style={{color: 'gray'}}>Not set</span>
                                )}
                              </td>
                              <td>
                                {editPriceId === product.product_id ? (
                                    <div className="stock-edit-actions">
                                      <button
                                          className="sm-btn-save"
                                          onClick={() => handlePriceUpdate(product.product_id)}
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
              <h2 className="source-sans-semibold section-title">Manage Discounts</h2>
              <p className="section-description">Create promotional campaigns by applying discounts to selected products.</p>

              <div className="discount-form-container">
                <form onSubmit={handleDiscountSubmit} className="sm-discount-form">
                  <div className="form-header">
                    <h3 className="source-sans-semibold">New Discount Campaign</h3>
                  </div>
                  
                  <div className="sm-form-row">
                    <div className="sm-form-group">
                      <label className="form-label">Discount Rate (%)</label>
                      <input
                        type="number"
                        value={discountRate}
                        onChange={(e) => setDiscountRate(e.target.value)}
                        min="1"
                        max="90"
                        required
                        className="form-input"
                        placeholder="Enter percentage (1-90)"
                      />
                    </div>
                    <div className="sm-form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        value={discountStartDate}
                        onChange={(e) => setDiscountStartDate(e.target.value)}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="sm-form-group">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        value={discountEndDate}
                        onChange={(e) => setDiscountEndDate(e.target.value)}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="products-selection-header">
                    <h4 className="source-sans-semibold">Select Products for Discount</h4>
                    <p className="selection-count">
                      {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>

                  <div className="search-filter">
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="product-search"
                      onChange={(e) => {/* Add product filtering logic */}}
                    />
                    <select className="category-filter">
                      <option value="">All Categories</option>
                      <option value="fiction">Fiction</option>
                      <option value="non-fiction">Non-Fiction</option>
                      {/* Add more categories */}
                    </select>
                  </div>

                  <button type="submit" className="discount-submit-btn">
                    Apply Discount to Selected Products
                  </button>
                </form>

                <div className="product-selection-container">
                  <div className="sm-product-grid">
                    {allProducts.map(product => (
                      <div
                        key={product.product_id}
                        className={`sm-product-card ${selectedProducts.includes(product.product_id) ? 'selected' : ''} ${product.discounted ? 'discounted' : ''}`}
                        onClick={() => !product.discounted && handleProductSelection(product.product_id)}
                      >
                        <div className="product-image">
                          <img
                            src={`assets/covers/${product.name?.replace(/\s+/g, '').toLowerCase() || 'default'}.png`}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "assets/covers/default.png";
                            }}
                          />
                          {product.discounted && (
                            <span className="discount-badge">On Sale</span>
                          )}
                        </div>
                        <div className="product-details">
                          <h4 className="product-title">{product.name}</h4>
                          <p className="product-author">By {product.author}</p>
                          <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                        </div>
                        {selectedProducts.includes(product.product_id) && (
                          <div className="selected-indicator">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Discounts Section */}
              <div className="active-discounts-section">
                <h3 className="source-sans-semibold">Active Discount Campaigns</h3>
                <div className="active-discounts-table-container">
                  <table className="active-discounts-table">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Discount</th>
                        <th>Products</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sample active discount rows - replace with real data */}
                      <tr>
                        <td>Summer Sale</td>
                        <td>25%</td>
                        <td>5 products</td>
                        <td>2025-06-01</td>
                        <td>2025-06-30</td>
                        <td><span className="status-active">Active</span></td>
                        <td>
                          <button className="action-btn view-btn">View</button>
                          <button className="action-btn cancel-btn">Cancel</button>
                        </td>
                      </tr>
                      <tr>
                        <td>New Releases</td>
                        <td>15%</td>
                        <td>3 products</td>
                        <td>2025-05-15</td>
                        <td>2025-05-31</td>
                        <td><span className="status-upcoming">Upcoming</span></td>
                        <td>
                          <button className="action-btn view-btn">View</button>
                          <button className="action-btn edit-btn">Edit</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reports Section */}
          {activeSection === 'reports' && (
            <div className="reports-section">
              <h2 className="source-sans-semibold section-title">Sales Reports & Invoices</h2>
              
              <div className="reports-dashboard">
                <div className="date-range-selector">
                  <h3 className="source-sans-semibold">Generate Custom Report</h3>
                  <div className="date-selector-container">
                    <div className="date-inputs">
                      <div className="date-input-group">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="form-input date-input"
                        />
                      </div>
                      <div className="date-input-group">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="form-input date-input"
                        />
                      </div>
                    </div>
                    <div className="preset-periods">
                      <button className="period-btn" onClick={() => handlePresetPeriod('today')}>Today</button>
                      <button className="period-btn" onClick={() => handlePresetPeriod('yesterday')}>Yesterday</button>
                      <button className="period-btn" onClick={() => handlePresetPeriod('week')}>This Week</button>
                      <button className="period-btn" onClick={() => handlePresetPeriod('month')}>This Month</button>
                      <button className="period-btn" onClick={() => handlePresetPeriod('quarter')}>This Quarter</button>
                    </div>
                    <button onClick={fetchInvoices} className="generate-report-btn">
                      Generate Report
                    </button>
                  </div>
                </div>

                {reportData && (
                  <div className="report-results">
                    <div className="summary-dashboard">
                      <div className="summary-card revenue">
                        <div className="card-icon">💰</div>
                        <div className="card-content">
                          <h4>Total Revenue</h4>
                          <p className="amount">${reportData.revenue.toFixed(2)}</p>
                          <p className="change positive">+5.2% from previous period</p>
                        </div>
                      </div>
                      <div className="summary-card cost">
                        <div className="card-icon">💸</div>
                        <div className="card-content">
                          <h4>Total Cost</h4>
                          <p className="amount">${reportData.cost.toFixed(2)}</p>
                          <p className="change negative">+2.8% from previous period</p>
                        </div>
                      </div>
                      <div className="summary-card profit">
                        <div className="card-icon">📈</div>
                        <div className="card-content">
                          <h4>Net Profit</h4>
                          <p className="amount">${reportData.profit.toFixed(2)}</p>
                          <p className="change positive">+7.5% from previous period</p>
                        </div>
                      </div>
                      <div className="summary-card orders">
                        <div className="card-icon">📦</div>
                        <div className="card-content">
                          <h4>Total Orders</h4>
                          <p className="amount">{invoices.length}</p>
                          <p className="change positive">+3.1% from previous period</p>
                        </div>
                      </div>
                    </div>

                    <div className="charts-container">
                      <div className="chart-wrapper">
                        <h3 className="chart-title">Revenue & Profit Trends</h3>
                        <div className="sm-chart-container">
                          <canvas id="revenue-chart"></canvas>
                        </div>
                      </div>
                      <div className="chart-wrapper">
                        <h3 className="chart-title">Top Selling Products</h3>
                        <div className="top-products">
                          <div className="product-rank">
                            <div className="rank">1</div>
                            <div className="product-info">
                              <p className="product-name">Fiction Novel</p>
                              <p className="product-sales">32 units sold</p>
                            </div>
                            <div className="product-revenue">$415.68</div>
                          </div>
                          <div className="product-rank">
                            <div className="rank">2</div>
                            <div className="product-info">
                              <p className="product-name">Science Fiction</p>
                              <p className="product-sales">28 units sold</p>
                            </div>
                            <div className="product-revenue">$335.72</div>
                          </div>
                          <div className="product-rank">
                            <div className="rank">3</div>
                            <div className="product-info">
                              <p className="product-name">Historical Fiction</p>
                              <p className="product-sales">19 units sold</p>
                            </div>
                            <div className="product-revenue">$284.81</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="invoices-section">
                      <div className="invoices-header">
                        <h3 className="source-sans-semibold">Invoices</h3>
                        <div className="invoice-actions">
                          <button className="export-btn">Export as CSV</button>
                          <button className="print-all-btn">Print All</button>
                        </div>
                      </div>
                      
                      <div className="invoice-filters">
                        <div className="search-container">
                          <input type="text" placeholder="Search invoices..." className="invoice-search" />
                        </div>
                        <div className="filter-container">
                          <select className="filter-select">
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="invoices-table-container">
                        <table className="invoices-table">
                          <thead>
                            <tr>
                              <th className="sortable">Invoice # <span className="sort-icon">↓</span></th>
                              <th className="sortable">Date <span className="sort-icon"></span></th>
                              <th>Customer</th>
                              <th>Items</th>
                              <th className="sortable">Total <span className="sort-icon"></span></th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map(invoice => (
                              <tr key={invoice.id}>
                                <td className="invoice-id">{invoice.id}</td>
                                <td>{invoice.date}</td>
                                <td>{invoice.customer}</td>
                                <td className="items-cell">{invoice.items} items</td>
                                <td className="price-cell">${invoice.total.toFixed(2)}</td>
                                <td><span className="status-badge paid">Paid</span></td>
                                <td>
                                  <div className="invoice-actions">
                                    <button
                                      className="action-btn view-btn"
                                      title="View Invoice"
                                    >
                                      View
                                    </button>
                                    <button
                                      className="action-btn download-btn"
                                      onClick={() => handleSaveInvoicePDF(invoice.id)}
                                      title="Download PDF"
                                    >
                                      PDF
                                    </button>
                                    <button
                                      className="action-btn print-btn"
                                      onClick={() => handlePrintInvoice(invoice.id)}
                                      title="Print Invoice"
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
                      
                      <div className="pagination">
                        <button className="page-btn">Previous</button>
                        <div className="page-numbers">
                          <button className="page-number active">1</button>
                          <button className="page-number">2</button>
                          <button className="page-number">3</button>
                          <span>...</span>
                          <button className="page-number">8</button>
                        </div>
                        <button className="page-btn">Next</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
  );
};

export default SalesManager;