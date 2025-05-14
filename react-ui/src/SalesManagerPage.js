import React, { useState, useEffect } from 'react';
import './SalesManagerPage.css';
import { useAuth } from './context/AuthContext';
import Chart from 'chart.js/auto';
import Navbar from "./components/Navbar.jsx";
import PdfViewer from './components/pdfView.js';

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
  //const [invoices, setInvoices] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  //State for orders/invoices
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');

  // State for refunds
  const [refundRequests, setRefundRequests] = useState([]);
  const [refundIsLoading, setRefundIsLoading] = useState(false);

  const [pdfUrl, setPdfUrl] = useState(null);
const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

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

  const fetchOrders = async (token, startDate = null, endDate = null) => {
  setIsLoadingOrders(true);
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Always fetch all invoices since backend doesn't support date filtering
    const url = "http://localhost/api/invoice/get_invoices_manager";
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      
      // Map the response to the format you need
      // Modified part of fetchOrders function
let mappedOrders = [];
const orderMap = new Map();

data.forEach((invoice) => {
  // Use order_id as the primary key for aggregation, fall back to invoice_id if needed
  const orderId = invoice.order_id || invoice.invoice_id;
  
  if (orderMap.has(orderId)) {
    // If we've already seen this order, update the total
    const existingOrder = orderMap.get(orderId);
    existingOrder.total += parseFloat(invoice.total_price || 0);
    
    // We could add new items here if needed
    // existingOrder.products.push(...(invoice.items || []));
  } else {
    // Create new order entry
    const newOrder = {
      id: invoice.invoice_id,
      orderId: orderId,
      customer: extractCustomerName(invoice.delivery_address) || `User ${invoice.user_id}`,
      products: invoice.items || [{name: "Book", quantity: 1}],
      date: invoice.invoice_date?.split(' ')[0] || new Date().toLocaleDateString(),
      total: parseFloat(invoice.total_price || 0),
      status: invoice.status || "Completed"
    };
    orderMap.set(orderId, newOrder);
  }
});

// Convert Map to array
mappedOrders = Array.from(orderMap.values());
      
      // Filter orders on client-side if date range is provided
      if (startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        // Set endDateObj to end of day
        endDateObj.setHours(23, 59, 59, 999);
        
        mappedOrders = mappedOrders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= startDateObj && orderDate <= endDateObj;
        });
      }
      
      setOrders(mappedOrders);
      return mappedOrders;
    } else {
      const errorData = await response.json();
      console.error("Failed to fetch orders:", errorData.error || "Unknown error");
      return { error: errorData.error || "Failed to fetch orders" };
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "An unexpected error occurred" };
  } finally {
    setIsLoadingOrders(false);
  }
};

const extractCustomerName = (address) => {
  if (!address) return null;
  // Try to extract a name from the beginning of the address
  // This assumes the format is usually "Name, Address"
  const parts = address.split(',');
  if (parts.length > 0) {
    return parts[0].trim();
  }
  return address;
};

const handleFilterOrders = () => {
  console.log(orderStartDate, orderEndDate);
  if (!orderStartDate || !orderEndDate) {
    alert("Please select both start and end dates");
    return;
  }
  
  fetchOrders(token, orderStartDate, orderEndDate);
};

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

const fetchInvoicePdf = async (invoiceId) => {
  try {
    // First attempt to fetch as a manager
    const response = await fetch(`http://localhost/api/invoice/get_invoice_pdf/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      setSelectedInvoiceId(invoiceId);
    } else {
      // If that fails, we might need to try a different approach
      const errorText = await response.text();
      console.error("Failed to fetch invoice PDF:", errorText);
      
      // Try a different endpoint specifically for managers
      try {
        // This assumes you have or will create a manager-specific endpoint
        const managerResponse = await fetch(`http://localhost/api/invoice/get_manager_invoice_pdf/${invoiceId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (managerResponse.ok) {
          const blob = await managerResponse.blob();
          const objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
          setSelectedInvoiceId(invoiceId);
        } else {
          alert("Failed to load invoice PDF - you may not have permission to view this invoice");
        }
      } catch (innerError) {
        console.error("Error fetching manager invoice PDF:", innerError);
        alert("Error loading invoice PDF - backend service may be unavailable");
      }
    }
  } catch (error) {
    console.error("Error fetching invoice PDF:", error);
    alert("Error loading invoice PDF - check console for details");
  }
};

// Add a cleanup effect to release object URLs when component unmounts
useEffect(() => {
  return () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  };
}, []);

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

  // // API calls for reports
  // const fetchInvoices = async () => {
  //   if (!startDate || !endDate) {
  //     alert("Please select both start and end dates");
  //     return;
  //   }
  //
  //   try {
  //     // Simulate API call
  //     setTimeout(() => {
  //       const sampleInvoices = [
  //         { id: "INV-2023-001", date: "2025-03-12", customer: "John Smith", total: 37.97, items: 3 },
  //         { id: "INV-2023-002", date: "2025-03-13", customer: "Mary Jones", total: 42.98, items: 2 },
  //         { id: "INV-2023-003", date: "2025-03-14", customer: "Robert Brown", total: 24.99, items: 1 },
  //         { id: "INV-2023-004", date: "2025-03-15", customer: "Jane Miller", total: 54.97, items: 3 },
  //         { id: "INV-2023-005", date: "2025-03-16", customer: "Sam Wilson", total: 29.98, items: 2 }
  //       ];
  //       setInvoices(sampleInvoices);
  //
  //       // Sample report data
  //       const reportSample = {
  //         revenue: 190.89,
  //         cost: 95.45,
  //         profit: 95.44,
  //         dailyData: [
  //           { date: '2025-03-12', revenue: 37.97, cost: 18.99, profit: 18.98 },
  //           { date: '2025-03-13', revenue: 42.98, cost: 21.49, profit: 21.49 },
  //           { date: '2025-03-14', revenue: 24.99, cost: 12.50, profit: 12.49 },
  //           { date: '2025-03-15', revenue: 54.97, cost: 27.48, profit: 27.49 },
  //           { date: '2025-03-16', revenue: 29.98, cost: 14.99, profit: 14.99 }
  //         ]
  //       };
  //       setReportData(reportSample);
  //
  //       // Create chart
  //       createChart(reportSample.dailyData);
  //     }, 800);
  //   } catch (error) {
  //     console.error("Error fetching invoices:", error);
  //   }
  // };

  const generateAnalyticsReport = async () => {
    if (!token) {
      console.error("Token is missing");
      return;
    }

    try {
      console.log("Using token:", token);

      const response = await fetch("http://localhost/api/invoice/get_invoices_manager", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Failed to fetch invoices (JSON error):", errorData);
          alert("Failed to fetch invoices: " + (errorData.message || "Unknown error"));
        } else {
          const text = await response.text();
          console.error("Failed to fetch invoices (non-JSON error):", text);
          alert("Failed to fetch invoices: Non-JSON error returned from server");
        }
        return;
      }

      // ✅ Safe to parse JSON now
      const data = await response.json();

      const parsedInvoices = data.map((invoice) => ({
        id: invoice.invoice_id,
        date: invoice.invoice_date.split(' ')[0],
        customer: invoice.delivery_address,
        items: 1, // Placeholder: adjust if real item count is available
        total: parseFloat(invoice.total_price),
      }));

     // setInvoices(parsedInvoices);

      const reportData = {
        revenue: parsedInvoices.reduce((sum, i) => sum + i.total, 0),
        cost: parsedInvoices.reduce((sum, i) => sum + i.total * 0.5, 0),
        profit: parsedInvoices.reduce((sum, i) => sum + i.total * 0.5, 0),
        dailyData: parsedInvoices.reduce((acc, inv) => {
          const date = inv.date;
          const existing = acc.find(d => d.date === date);
          const revenue = inv.total;
          const cost = revenue * 0.5;
          const profit = revenue - cost;

          if (existing) {
            existing.revenue += revenue;
            existing.cost += cost;
            existing.profit += profit;
          } else {
            acc.push({ date, revenue, cost, profit });
          }

          return acc;
        }, []),
      };

      setReportData(reportData);
      createChart(reportData.dailyData);

    } catch (error) {
      console.error("Unexpected error fetching invoices:", error);
      alert("Unexpected error fetching invoices");
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

          // In your existing useEffect where you load data for different sections
        case 'invoices':
          fetchOrders(token);
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
/*
  const handleSaveInvoicePDF = (invoiceId) => {
    // In a real app, this would trigger a PDF download
    alert(`Saving invoice ${invoiceId} as PDF...`);
  };

  const handlePrintInvoice = (invoiceId) => {
    // In a real app, this would open a print dialog
    alert(`Printing invoice ${invoiceId}...`);
  }; */

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
          {/* REPORTS = ANALYTICS  */}
          <button
              className={`sm-tab source-sans-semibold ${activeSection === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveSection('reports')}
          >
            Analytics
          </button>
          <button
              className={`sm-tab source-sans-semibold ${activeSection === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveSection('invoices')}
          >
            Orders & Invoices
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
                            key={product.product_id}
                            className={`sm-product-card ${selectedProducts.includes(product.product_id) ? 'selected' : ''} ${product.discounted ? 'discounted' : ''}`}
                            onClick={() => !product.discounted && handleProductSelection(product.product_id)}
                        >
                          <h4>{product.name}</h4>
                          <p>By {product.author}</p>
                          <p className="sm-product-price">${parseFloat(product.price).toFixed(2)}</p>
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
                <h2 className="source-sans-semibold">Sales Reports & Analytics</h2>

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
                  <button onClick={generateAnalyticsReport} className="sm-btn-generate">Generate Report</button>
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
{/*
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
                      </div> */}
                    </div>
                )}
              </div>
          )}

          {/* Orders & Invoices Section */}
{activeSection === 'invoices' && (
  <div className="invoices-section">
    <h2 className="source-sans-semibold">Orders & Invoices</h2>
    
    {/* Date filtering */}
    <div className="sm-date-selector">
      <div className="sm-form-group">
        <label>Start Date</label>
        <input
          type="date"
          value={orderStartDate}
          onChange={(e) => setOrderStartDate(e.target.value)}
        />
      </div>
      <div className="sm-form-group">
        <label>End Date</label>
        <input
          type="date"
          value={orderEndDate}
          onChange={(e) => setOrderEndDate(e.target.value)}
        />
      </div>
      <button onClick={handleFilterOrders} className="sm-btn-generate">Filter Orders</button>
    </div>

    {isLoadingOrders ? (
      <div className="sm-loading">
        <p>Loading orders data...</p>
      </div>
    ) : (
      <>
        <div className="sm-orders-header">
          <h3 className="source-sans-semibold">Order Management</h3>
          <p className="source-sans-light">View and manage customer orders</p>
        </div>

        {orders.length === 0 ? (
          <p className="source-sans-regular">No orders found.</p>
        ) : (
          <div className="sm-orders-table-container">
            <table className="sm-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.orderId}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button 
                      className="sm-btn-view"
                      onClick={() => fetchInvoicePdf(order.id)}
                    >
                      View Invoice
                    </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Invoice PDF Modal */}



                {selectedInvoiceId && pdfUrl && (
  <div className="invoice-modal">
    <div className="invoice-modal-content">
      <div className="invoice-modal-header">
        <h3>Invoice #{selectedInvoiceId}</h3>
        <button 
          className="invoice-modal-close"
          onClick={() => {
            setSelectedInvoiceId(null);
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }}
        >
          ×
        </button>
      </div>
      <div className="invoice-modal-body">
        <PdfViewer pdfUrl={pdfUrl} />
      </div>
      <div className="invoice-modal-footer">
        <button
          className="sm-btn-save"
          onClick={() => window.open(pdfUrl, '_blank')}
        >
          Download PDF
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        )}
      </>
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
  );
};

export default SalesManager;