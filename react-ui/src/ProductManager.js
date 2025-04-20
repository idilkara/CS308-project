import React, { useState, useEffect } from 'react';
import './ProductManager.css';
import { useAuth } from './context/AuthContext';

const ProductManager = () => {

  const { token } = useAuth();
  console.log(token);

  // Add scroll fix
  useEffect(() => {
    // Apply scroll fixes when component mounts
    document.body.style.overflow = 'auto';

    // Find all parent containers that might be causing the issue
    const fixContainers = () => {
      // Get all parent elements
      let element = document.querySelector('.product-manager');
      if (!element) return;

      while (element && element !== document.body) {
        const style = window.getComputedStyle(element);

        // Check if element has problematic styles
        if (style.overflow === 'hidden' ||
            style.height === '100vh' ||
            style.height === '100%' ||
            style.position === 'fixed') {

          // Override problematic styles
          element.style.height = 'auto';
          element.style.maxHeight = 'none';
          element.style.overflow = 'visible';

          // Log which element was fixed for debugging
          console.log('Fixed container:', element);
        }

        // Move up to parent
        element = element.parentElement;
      }
    };

    // Run the fix
    fixContainers();

    // Also add a timeout to run the fix after content is fully loaded
    setTimeout(fixContainers, 500);

    // Clean up when component unmounts
    return () => {
      // Restore original body overflow
      document.body.style.overflow = '';
    };
  }, []);

  // State for active section
  // const [activeSection, setActiveSection] = useState('add');
  const [activeSection, setActiveSection] = useState('add');

  useEffect(() => {
    console.log("Active section changed to:", activeSection);
  }, [activeSection]);

  // State for the new product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    author: '',
    cover_img_url: '',
    model: '',
    description: '',
    stock_quantity: '',
    price: '',
    categories: [],
    discount: {
      discount_percentage: '',
      start_date: '',
      end_date: ''
    }
  });

  // State for order management
  const [deliveries, setDeliveries] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // State for comment management
  const [comments, setComments] = useState([]);
  const [commentIsLoading, setCommentIsLoading] = useState(false);
  const [commentFilter, setCommentFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'


  const createProduct = async (token, productData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch("http://localhost/api/pm_products/product/create", {
        method: "POST",
        headers,
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product created successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to create product:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to create product" };
      }
    } catch (error) {
      console.error("Error creating product:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const updateStockQuantity = async (token, productId, stockQuantity) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = { stock_quantity: stockQuantity };

    try {
      const response = await fetch(`http://localhost/api/pm_products/product/update_stock_quantity/${productId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Stock updated successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to update stock quantity:", errorData.error || "Unknown error");
        return { error: errorData.error || "Failed to update stock quantity" };
      }
    } catch (error) {
      console.error("Error updating stock quantity:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const addCategoryToProduct = async (token, productId, categoryId) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = { category_name: categoryId };

    try {
      const response = await fetch(`http://localhost/api/pm_products/product/add_category/${productId}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Category added successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to add category:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to add category" };
      }
    } catch (error) {
      console.error("Error adding category:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const removeCategoryFromProduct = async (token, productId, categoryId) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = { category_name: categoryId };

    try {
      const response = await fetch(`http://localhost/api/pm_products/product/remove_category/${productId}`, {
        method: "DELETE",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Category removed successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to remove category:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to remove category" };
      }
    } catch (error) {
      console.error("Error removing category:", error);
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
        console.log("Price updated successfully:", result);
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

  const removeProduct = async (token, productId) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(`http://localhost/api/pm_products/product/delete/${productId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product removed successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to remove product:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to remove product" };
      }
    } catch (error) {
      console.error("Error removing product:", error);
      return { error: "An unexpected error occurred" };
    }
  };



  //ORDERS API CALLS

  const viewOrdersPM = async (token) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch("http://localhost/api/delivery/view_orders", {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Orders fetched successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch orders:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to fetch orders" };
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const deliverOrdersPM = async (token, orderItemId, newStatus) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const data = { status: newStatus };

    try {
      const response = await fetch(`http://localhost/api/delivery/update_status/${orderItemId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Order status updated successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to update order status:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to update order status" };
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      return { error: "An unexpected error occurred" };
    }
  };

// REVIEW API CALLS



// React versions of the review management API calls
  const viewProductsPM = async (token) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch("http://localhost/api/pm_products/viewproducts", {
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

  useEffect(() => {
    viewProductsPM(token);
  }, [token]);

  const fetchProductsForStock = async () => {
    const products = await viewProductsPM(token); // You already wrote viewProductsPM

    if (products && !products.error) {
      setStockProducts(products.map(product => ({
        id: product.product_id,
        name: product.name,
        author: product.author,
        stock: product.stock_quantity,
        price: 0, // Backend currently doesn't return price, default to 0
        lastUpdated: new Date().toISOString().split('T')[0]
      })));
    }
  };

// View unapproved reviews
  const viewUnapprovedReviews = async (token) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch("http://localhost/api/reviews/unapproved", {
        method: "GET",
        headers,
      });

      const json = await response.json();
      console.log("Unapproved reviews JSON:", json);
      return json;

    } catch (error) {
      console.error("Error fetching unapproved reviews:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const viewApprovedReviews = async (token) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch("http://localhost/api/reviews/approved_reviews", {
        method: "GET",
        headers,
      });

      const json = await response.json();
      console.log("Approved reviews JSON:", json);
      return json;

    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const viewRejectedReviews = async (token) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch("http://localhost/api/reviews/rejected_review", {
        method: "GET",
        headers,
      });

      const json = await response.json();
      console.log("Rejected reviews JSON:", json);
      return json;

    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      return { error: "An unexpected error occurred" };
    }
  };

// Approve a review
  const approveReview = async (token, reviewId) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch(`http://localhost/api/reviews/approve/${reviewId}`, {
        method: "PUT",
        headers,
      });
      return await response.json();

    } catch (error) {
      console.error("Error approving review:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  //reject rev
  const rejectReview = async (token, reviewId) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch(`http://localhost/api/reviews/reject/${reviewId}`, {
        method: "PUT",
        headers,
      });
      return await response.json();

    } catch (error) {
      console.error("Error rejecting review:", error);
      return { error: "An unexpected error occurred" };
    }
  };

// Delete a review
  const deleteReview = async (token, reviewId) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch(`http://localhost/api/reviews/remove/${reviewId}`, {
        method: "DELETE",
        headers,
      });
      return await response.json();

    } catch (error) {
      console.error("Error deleting review:", error);
      return { error: "An unexpected error occurred" };
    }
  };


  // Load deliveries data when the "orders" section is active
  useEffect(() => {
    const fetchDeliveries = async () => {
      if (activeSection === 'orders') {
        setIsLoading(true);

        try {
          const result = await viewOrdersPM(token);

          if (result && !result.error) {
            const ordersArray = Array.isArray(result) ? result : result.orders;

            const mappedDeliveries = (ordersArray || []).map(item => ({
              id: item.userorder_id || item.orderitem_id || item.id, // fallback
              orderId: item.userorder_id || item.orderitem_id,
              customer: item.delivery_address || `User ${item.user_id}`,  // Using delivery address if available
              product: item.product_name,
              date: new Date(item.order_date).toLocaleDateString(),  // 🧽 Format clean date
              status: item.status
            }));

            setDeliveries(mappedDeliveries);

            const initialStatus = {};
            mappedDeliveries.forEach(delivery => {
              initialStatus[delivery.id] = delivery.status;
            });
            setSelectedStatus(initialStatus);

          } else {
            alert(result.error || 'Failed to fetch orders');
          }
        } catch (error) {
          console.error("Unexpected error fetching orders:", error);
          alert('An unexpected error occurred while fetching orders.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDeliveries();
  }, [activeSection, token]);

  // // Load comments when the "comments" section is active
  // useEffect(() => {
  //   if (activeSection === 'comments') {
  //     // Simulate loading from an API
  //     setCommentIsLoading(true);
  //
  //     // Simulate API call with a timeout
  //     setTimeout(() => {
  //       const sampleComments = [
  //         {
  //           id: 1,
  //           productId: 101,
  //           productName: "Fiction Novel",
  //           userId: 201,
  //           userName: "John Smith",
  //           rating: 4,
  //           comment: "Great book, really enjoyed the characters and plot development.",
  //           date: "2025-03-12",
  //           status: "pending"
  //         },
  //         {
  //           id: 2,
  //           productId: 102,
  //           productName: "Non-Fiction Book",
  //           userId: 202,
  //           userName: "Jane Doe",
  //           rating: 5,
  //           comment: "Very informative and well-written. Highly recommend for anyone interested in this subject.",
  //           date: "2025-03-14",
  //           status: "pending"
  //         },
  //         {
  //           id: 3,
  //           productId: 103,
  //           productName: "Sci-Fi Novel",
  //           userId: 203,
  //           userName: "Bob Johnson",
  //           rating: 2,
  //           comment: "I found the story confusing and the characters underdeveloped.",
  //           date: "2025-03-10",
  //           status: "pending"
  //         },
  //         {
  //           id: 4,
  //           productId: 104,
  //           productName: "Fantasy Book",
  //           userId: 204,
  //           userName: "Alice Williams",
  //           rating: 3,
  //           comment: "The world-building was excellent but the pacing was a bit slow.",
  //           date: "2025-03-15",
  //           status: "approved"
  //         },
  //         {
  //           id: 5,
  //           productId: 105,
  //           productName: "Mystery Novel",
  //           userId: 205,
  //           userName: "Charlie Brown",
  //           rating: 1,
  //           comment: "Very disappointing. The plot had too many holes and the ending was predictable.",
  //           date: "2025-03-11",
  //           status: "rejected"
  //         },
  //       ];
  //
  //       setComments(sampleComments);
  //       setCommentIsLoading(false);
  //     }, 800);
  //   }
  // }, [activeSection]);
  //

  // Handle status change for deliveries
  const handleStatusChange = (deliveryId, newStatus) => {
    setSelectedStatus(prev => ({
      ...prev,
      [deliveryId]: newStatus
    }));
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (activeSection === 'comments') {
        setCommentIsLoading(true);

        try {
          let unapproved = await viewUnapprovedReviews(token);
          let approved = await viewApprovedReviews(token);

          let rejected = await viewRejectedReviews(token);


          console.log("Fetched rejected:", rejected);

          console.log("Fetched unapproved:", unapproved);
          console.log("Fetched approved:", approved);

          let mappedComments = [];

          if (Array.isArray(unapproved)) {
            mappedComments = mappedComments.concat(
                unapproved.map(comment => ({
                  id: comment.review_id,
                  productId: comment.product_id,
                  productName: `Product ID ${comment.product_id}`,
                  userId: comment.user_id,
                  userName: `User ${comment.user_id}`,
                  rating: comment.rating,
                  comment: comment.comment,
                  date: new Date().toLocaleDateString(),
                  status: 'pending'  // unapproved -> pending
                }))
            );
          }

          if (Array.isArray(approved)) {
            mappedComments = mappedComments.concat(
                approved.map(comment => ({
                  id: comment.review_id,
                  productId: comment.product_id,
                  productName: `Product ID ${comment.product_id}`,
                  userId: comment.user_id,
                  userName: `User ${comment.user_id}`,
                  rating: comment.rating,
                  comment: comment.comment,
                  date: new Date().toLocaleDateString(),
                  status: 'approved'  // approved -> approved
                }))
            );
          }

          setComments(mappedComments);

        } catch (error) {
          console.error("Unexpected error fetching comments:", error);
          alert('An unexpected error occurred while fetching comments.');
        } finally {
          setCommentIsLoading(false);
        }
      }
    };

    fetchComments();
  }, [activeSection, token]);

  // // Handle save changes for deliveries
  // const handleSaveStatus = (deliveryId) => {
  //   // Find the delivery
  //   const delivery = deliveries.find(d => d.id === deliveryId);
  //
  //   // In a real app, you would make an API call here
  //   console.log(`Updating delivery ${deliveryId} (Order: ${delivery.orderId}) status to: ${selectedStatus[deliveryId]}`);
  //
  //   // Update the delivery status in the local state
  //   setDeliveries(prevDeliveries =>
  //     prevDeliveries.map(d =>
  //       d.id === deliveryId ? {...d, status: selectedStatus[deliveryId]} : d
  //     )
  //   );
  //
  //   // Show feedback
  //   alert(`Status updated for Order ${delivery.orderId}`);
  // };

  // Handle save changes for deliveries
  const handleSaveStatus = async (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);

    if (!delivery) {
      alert('Delivery not found.');
      return;
    }

    try {
      const result = await deliverOrdersPM(token, deliveryId, selectedStatus[deliveryId]);

      if (result && !result.error) {
        // If API call was successful, update the delivery status in the local state
        setDeliveries(prevDeliveries =>
            prevDeliveries.map(d =>
                d.id === deliveryId ? { ...d, status: selectedStatus[deliveryId] } : d
            )
        );

        alert(`Order ${delivery.orderId} status updated successfully!`);
      } else {
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert('An unexpected error occurred while updating status.');
    }
  };


  // // Handle comment approval
  // const handleApproveComment = (commentId) => {
  //   // In a real app, you would make an API call here
  //   setComments(prevComments =>
  //     prevComments.map(comment =>
  //       comment.id === commentId ? {...comment, status: "approved"} : comment
  //     )
  //   );
  //
  //   alert(`Comment #${commentId} has been approved and is now visible to users.`);
  // };
  //
  // // Handle comment rejection
  // const handleRejectComment = (commentId) => {
  //   // In a real app, you would make an API call here
  //   setComments(prevComments =>
  //     prevComments.map(comment =>
  //       comment.id === commentId ? {...comment, status: "rejected"} : comment
  //     )
  //   );
  //
  //   alert(`Comment #${commentId} has been rejected and will not be visible to users.`);
  // };

  const handleApproveComment = async (commentId) => {
    try {
      const result = await approveReview(token, commentId);

      if (result && !result.error) {
        setComments(prevComments =>
            prevComments.map(comment =>
                comment.id === commentId ? { ...comment, status: "approved" } : comment
            )
        );
        alert(`Comment #${commentId} has been approved and is now visible to users.`);
      } else {
        alert(result.error || 'Failed to approve comment.');
      }
    } catch (error) {
      console.error("Error approving comment:", error);
      alert('An unexpected error occurred while approving comment.');
    }
  };

  const handleRejectComment = async (commentId) => {
    try {
      const result = await rejectReview(token, commentId);

      if (result && !result.error) {
        // After deleting, remove comment from the list
        setComments(prevComments =>
            prevComments.filter(comment => comment.id !== commentId)
        );
        alert(`Comment #${commentId} has been rejected and deleted.`);
      } else {
        alert(result.error || 'Failed to reject comment.');
      }
    } catch (error) {
      console.error("Error rejecting comment:", error);
      alert('An unexpected error occurred while rejecting comment.');
    }
  };

  // Get filtered comments based on current filter
  const getFilteredComments = () => {
    if (commentFilter === 'all') {
      return comments;
    }
    return comments.filter(comment => comment.status === commentFilter);
  };

  // Define available status options for deliveries
  const statusOptions = ["processing", "in-transit", "delivered"];

  // Handle input changes for product details
  const handleInputChange = (e) => {

    const { name, value } = e.target;
    if (name.includes('discount.')) {
      const discountField = name.split('.')[1];
      setNewProduct({
        ...newProduct,
        discount: {
          ...newProduct.discount,
          [discountField]: value
        }
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: value
      });
    }
  };

  //  Manage Stocks
  const [stockProducts, setStockProducts] = useState([]);
  const [stockIsLoading, setStockIsLoading] = useState(false);
  const [stockFilter, setStockFilter] = useState(''); // For filtering products by name
  const [stockSortField, setStockSortField] = useState('name'); // 'name', 'stock', 'price'
  const [stockSortDirection, setStockSortDirection] = useState('asc'); // 'asc', 'desc'
  const [editStockId, setEditStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');

  // Load stock data when the "stocks" section is active
  useEffect(() => {
    if (activeSection === 'stocks') {
      fetchProductsForStock();
    }
  }, [activeSection, token]);

// Handle stock update input change
  const handleStockInputChange = (e) => {
    setNewStockValue(e.target.value);
  };

// Handle stock update submission
  const handleStockUpdate = async (id) => {
    if (newStockValue === '' || isNaN(newStockValue) || parseInt(newStockValue) < 0) {
      alert('Please enter a valid stock quantity (must be a non-negative number)');
      return;
    }

    try {
      const result = await updateStockQuantity(token, id, parseInt(newStockValue));

      if (result && !result.error) {
        setStockProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id
                    ? { ...product, stock: parseInt(newStockValue), lastUpdated: new Date().toISOString().split('T')[0] }
                    : product
            )
        );

        setEditStockId(null);
        setNewStockValue('');
        alert(`Stock updated successfully for product #${id}`);
      } else {
        alert(`Failed to update stock: ${result.error}`);
      }
    } catch (error) {
      console.error("Unexpected error updating stock:", error);
      alert('An unexpected error occurred while updating stock.');
    }
  };

// Cancel stock editing
  const cancelStockEdit = () => {
    setEditStockId(null);
    setNewStockValue('');
  };

// Start editing stock for a product
  const startEditStock = (product) => {
    setEditStockId(product.id);
    setNewStockValue(product.stock.toString());
  };

// Filter products by name
  const handleFilterChange = (e) => {
    setStockFilter(e.target.value);
  };

// Handle sort change
  const handleSortChange = (field) => {
    if (field === stockSortField) {
      // If clicking the same field, toggle direction
      setStockSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it and default to ascending
      setStockSortField(field);
      setStockSortDirection('asc');
    }
  };

// Get filtered and sorted products
  const getFilteredAndSortedProducts = () => {
    // First filter
    let filteredProducts = stockProducts;
    if (stockFilter) {
      const filter = stockFilter.toLowerCase();
      filteredProducts = stockProducts.filter(product =>
          product.name.toLowerCase().includes(filter) ||
          product.author.toLowerCase().includes(filter)
      );
    }

    // Then sort
    return filteredProducts.sort((a, b) => {
      let comparison = 0;

      switch (stockSortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated) - new Date(b.lastUpdated);
          break;
        default:
          comparison = 0;
      }

      return stockSortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Helper function to reset the form
  const resetForm = () => {
    setNewProduct({
      name: '',
      author: '',
      cover_img_url: '',
      model: '',
      description: '',
      stock_quantity: '',
      price: '',
      categories: [],
      discount: {
        discount_percentage: '',
        start_date: '',
        end_date: ''
      }
    });
  };

  // // Handle form submission
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //
  //   // Validate the form data
  //   const requiredFields = [
  //     'name', 'author', 'cover_img_url', 'stock_quantity', 'price'
  //   ];
  //
  //   const missingFields = requiredFields.filter(field => !newProduct[field]);
  //
  //   if (missingFields.length > 0) {
  //     alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
  //     return;
  //   }
  //
  //   // Check if dates are valid when discount is specified
  //   if (newProduct.discount.discount_percentage &&
  //      (!newProduct.discount.start_date || !newProduct.discount.end_date)) {
  //     alert('Please specify both start and end dates for the discount');
  //     return;
  //   }
  //
  //   // Format the data for API submission
  //   const productData = {
  //     ...newProduct,
  //     stock_quantity: parseInt(newProduct.stock_quantity, 10),
  //     price: parseFloat(newProduct.price),
  //     discount: newProduct.discount.discount_percentage
  //       ? {
  //           ...newProduct.discount,
  //           discount_percentage: parseFloat(newProduct.discount.discount_percentage)
  //         }
  //       : null
  //   };
  //
  //   console.log('Product ready for submission:', productData);
  //
  //   // Here you would typically send the data to your backend API
  //   // For now, just simulate success
  //   resetForm();
  //   alert('Product added successfully!');
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form data
    const requiredFields = [
      'name', 'author', 'cover_img_url', 'stock_quantity', 'price'
    ];

    const missingFields = requiredFields.filter(field => !newProduct[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Check if dates are valid when discount is specified
    if (newProduct.discount.discount_percentage &&
        (!newProduct.discount.start_date || !newProduct.discount.end_date)) {
      alert('Please specify both start and end dates for the discount');
      return;
    }

    // Format the data for API submission
    const productData = {
      ...newProduct,
      stock_quantity: parseInt(newProduct.stock_quantity, 10),
      price: parseFloat(newProduct.price),
      distributor_information: "Distributor Placeholder",
      discount: newProduct.discount.discount_percentage
          ? {
            ...newProduct.discount,
            discount_percentage: parseFloat(newProduct.discount.discount_percentage)
          }
          : null
    };

    console.log('Product ready for submission:', productData);

    try {
      const result = await createProduct(token, productData);

      if (result && !result.error) {
        alert('Product added successfully!');
        resetForm();
      } else {
        alert(`Error adding product: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting new product:", error);
      alert('An unexpected error occurred while adding the product.');
    }
  };

  // Placeholder categories (you would fetch these from your database)
  const availableCategories = [
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Sci-fi' },
    { id: 4, name: 'Fantasy' },
    { id: 5, name: 'Fiction' },
    { id: 6, name: 'Non-Fiction' },
    { id: 7, name: 'Sci-fi' },
    { id: 8, name: 'Fantasy' },
    { id: 9, name: 'Fiction' },
    { id: 10, name: 'Non-Fiction' },
    { id: 11, name: 'Scifi' },
    { id: 12, name: 'Fantasy' },
    { id: 13, name: 'Fiction' },
    { id: 14, name: 'Non-Fiction' },
    { id: 15, name: 'Sci-fi' },
    { id: 16, name: 'Fantasy' }
  ];

  // Handle category selection
  const handleCategoryToggle = (categoryId) => {
    if (newProduct.categories.includes(categoryId)) {
      setNewProduct({
        ...newProduct,
        categories: newProduct.categories.filter(id => id !== categoryId)
      });
    } else {
      setNewProduct({
        ...newProduct,
        categories: [...newProduct.categories, categoryId]
      });
    }
  };

  return (
      <div className="container product-manager">
        <h1 className="source-sans-bold pm-section-title">Product Manager</h1>

        {/* Navigation Tabs */}
        <div className="pm-section-tabs">
          <button
              className={`pm-tab source-sans-semibold ${activeSection === 'add' ? 'active' : ''}`}
              onClick={() => setActiveSection('add')}
          >
            Add Product
          </button>
          <button
              className={`pm-tab source-sans-semibold ${activeSection === 'stocks' ? 'active' : ''}`}
              onClick={() => setActiveSection('stocks')}
          >
            Manage Stocks
          </button>
          <button
              className={`pm-tab source-sans-semibold ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
          >
            Manage Orders
          </button>
          <button
              className={`pm-tab source-sans-semibold ${activeSection === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveSection('comments')}
          >
            Manage Comments
          </button>
        </div>

        {/* Content Area */}
        <div className="pm-section-content">
          {/* Add Product Section */}
          {activeSection === 'add' && (
              <div className="add-product-section">
                <h2 className="source-sans-semibold">Add New Product</h2>
                <form onSubmit={handleSubmit}>
                  <div className="pm-form-group">
                    <label className="source-sans-regular" htmlFor="name">Product Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                        required
                        className="pm-form-control"
                        placeholder="Enter product name"
                    />
                  </div>

                  {/* Author field */}
                  <div className="pm-form-group">
                    <label className="source-sans-regular" htmlFor="author">Author *</label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        value={newProduct.author}
                        onChange={handleInputChange}
                        required
                        className="pm-form-control"
                        placeholder="Enter author name"
                    />
                  </div>

                  {/* Cover Image URL field */}
                  <div className="pm-form-group">
                    <label className="source-sans-regular" htmlFor="cover_img_url">Cover Image URL *</label>
                    <input
                        type="url"
                        id="cover_img_url"
                        name="cover_img_url"
                        value={newProduct.cover_img_url}
                        onChange={handleInputChange}
                        required
                        className="pm-form-control"
                        placeholder="Enter cover image URL"
                    />
                    {newProduct.cover_img_url && (
                        <div className="cover-preview">
                          <p className="source-sans-light preview-label">Preview:</p>
                          <img
                              src={newProduct.cover_img_url}
                              alt="Cover preview"
                              className="cover-image-preview"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/150x200?text=Invalid+URL";
                              }}
                          />
                        </div>
                    )}
                  </div>

                  <div className="pm-form-group">
                    <label className="source-sans-regular" htmlFor="model">Model</label>
                    <input
                        type="text"
                        id="model"
                        name="model"
                        value={newProduct.model}
                        onChange={handleInputChange}
                        className="pm-form-control"
                        placeholder="Enter model number/name"
                    />
                  </div>

                  <div className="pm-form-group">
                    <label className="source-sans-regular" htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                        className="pm-form-control"
                        placeholder="Enter product description"
                        rows="4"
                    />
                  </div>

                  <div className="pm-form-row">
                    <div className="pm-form-group half">
                      <label className="source-sans-regular" htmlFor="stock_quantity">Stock Quantity *</label>
                      <input
                          type="number"
                          id="stock_quantity"
                          name="stock_quantity"
                          value={newProduct.stock_quantity}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="pm-form-control"
                          placeholder="Enter quantity"
                      />
                    </div>

                    <div className="pm-form-group half">
                      <label className="source-sans-regular" htmlFor="price">Price ($) *</label>
                      <input
                          type="number"
                          id="price"
                          name="price"
                          value={newProduct.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="pm-form-control"
                          placeholder="Enter price"
                      />
                    </div>
                  </div>

                  <div className="pm-form-group">
                    <label className="source-sans-regular">Product Categories</label>
                    <div className="pm-categories-container">
                      {availableCategories.map(category => (
                          <div className="pm-category-item" key={category.id}>
                            <input
                                type="checkbox"
                                id={`category-${category.id}`}
                                checked={newProduct.categories.includes(category.id)}
                                onChange={() => handleCategoryToggle(category.id)}
                            />
                            <label htmlFor={`category-${category.id}`} className="source-sans-light">
                              {category.name}
                            </label>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="pm-discount-section">
                    <h3 className="source-sans-semibold">Discount Information (Optional)</h3>

                    <div className="pm-form-group">
                      <label className="source-sans-regular" htmlFor="discount_percentage">Discount Percentage (%)</label>
                      <input
                          type="number"
                          id="discount_percentage"
                          name="discount.discount_percentage"
                          value={newProduct.discount.discount_percentage}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="0.01"
                          className="pm-form-control"
                          placeholder="Enter discount percentage"
                      />
                    </div>

                    <div className="pm-form-row">
                      <div className="pm-form-group half">
                        <label className="source-sans-regular" htmlFor="start_date">Start Date</label>
                        <input
                            type="date"
                            id="start_date"
                            name="discount.start_date"
                            value={newProduct.discount.start_date}
                            onChange={handleInputChange}
                            className="pm-form-control"
                        />
                      </div>

                      <div className="pm-form-group half">
                        <label className="source-sans-regular" htmlFor="end_date">End Date</label>
                        <input
                            type="date"
                            id="end_date"
                            name="discount.end_date"
                            value={newProduct.discount.end_date}
                            onChange={handleInputChange}
                            className="pm-form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pm-form-actions">
                    <button type="submit" className="pm-btn-submit source-sans-semibold">
                      Add Product
                    </button>
                    <button
                        type="button"
                        className="pm-btn-cancel source-sans-regular"
                        onClick={resetForm}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
          )}

          {/* Manage Stocks Section */}
          {activeSection === 'stocks' && (
              <div className="pm-stocks-section">
                <h2 className="source-sans-semibold">Manage Stocks</h2>

                {stockIsLoading ? (
                    <div className="pm-loading">
                      <p className="source-sans-regular">Loading product stock data...</p>
                    </div>
                ) : (
                    <>
                      <div className="pm-stocks-header">
                        <h3 className="source-sans-semibold">Inventory Management</h3>
                        <p className="source-sans-light">Update product stock levels and monitor inventory</p>

                        <div className="pm-stocks-tools">
                          <div className="pm-stocks-search">
                            <input
                                type="text"
                                placeholder="Search by product name or author..."
                                value={stockFilter}
                                onChange={handleFilterChange}
                                className="pm-search-input"
                            />
                          </div>
                        </div>
                      </div>

                      {stockProducts.length === 0 ? (
                          <p className="source-sans-regular pm-no-products">No products found in inventory.</p>
                      ) : (
                          <div className="pm-stocks-table-container">
                            <table className="pm-stocks-table">
                              <thead>
                              <tr>
                                <th
                                    className={`sortable ${stockSortField === 'name' ? `sorted-${stockSortDirection}` : ''}`}
                                    onClick={() => handleSortChange('name')}
                                >
                                  Product Name
                                  {stockSortField === 'name' && (
                                      <span className="sort-indicator">{stockSortDirection === 'asc' ? '↑' : '↓'}</span>
                                  )}
                                </th>
                                <th
                                    className={`sortable ${stockSortField === 'author' ? `sorted-${stockSortDirection}` : ''}`}
                                    onClick={() => handleSortChange('author')}
                                >
                                  Author
                                  {stockSortField === 'author' && (
                                      <span className="sort-indicator">{stockSortDirection === 'asc' ? '↑' : '↓'}</span>
                                  )}
                                </th>
                                <th
                                    className={`sortable ${stockSortField === 'stock' ? `sorted-${stockSortDirection}` : ''}`}
                                    onClick={() => handleSortChange('stock')}
                                >
                                  Current Stock
                                  {stockSortField === 'stock' && (
                                      <span className="sort-indicator">{stockSortDirection === 'asc' ? '↑' : '↓'}</span>
                                  )}
                                </th>
                                <th
                                    className={`sortable ${stockSortField === 'price' ? `sorted-${stockSortDirection}` : ''}`}
                                    onClick={() => handleSortChange('price')}
                                >
                                  Price
                                  {stockSortField === 'price' && (
                                      <span className="sort-indicator">{stockSortDirection === 'asc' ? '↑' : '↓'}</span>
                                  )}
                                </th>
                                <th
                                    className={`sortable ${stockSortField === 'lastUpdated' ? `sorted-${stockSortDirection}` : ''}`}
                                    onClick={() => handleSortChange('lastUpdated')}
                                >
                                  Last Updated
                                  {stockSortField === 'lastUpdated' && (
                                      <span className="sort-indicator">{stockSortDirection === 'asc' ? '↑' : '↓'}</span>
                                  )}
                                </th>
                                <th>Actions</th>
                              </tr>
                              </thead>
                              <tbody>
                              {getFilteredAndSortedProducts().map(product => (
                                  <tr key={product.id} className={product.stock <= 5 ? 'low-stock' : ''}>
                                    <td>{product.name}</td>
                                    <td>{product.author}</td>
                                    <td className="stock-column">
                                      {editStockId === product.id ? (
                                          <input
                                              type="number"
                                              value={newStockValue}
                                              onChange={handleStockInputChange}
                                              min="0"
                                              className="pm-stock-input"
                                              autoFocus
                                          />
                                      ) : (
                                          <span className={`stock-value ${product.stock <= 5 ? 'low-stock-text' : ''}`}>
                                  {product.stock}
                                </span>
                                      )}
                                    </td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.lastUpdated}</td>
                                    <td>
                                      {editStockId === product.id ? (
                                          <div className="stock-edit-actions">
                                            <button
                                                className="pm-btn-save-stock"
                                                onClick={() => handleStockUpdate(product.id)}
                                            >
                                              Save
                                            </button>
                                            <button
                                                className="pm-btn-cancel-stock"
                                                onClick={cancelStockEdit}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                      ) : (
                                          <button
                                              className="pm-btn-edit-stock"
                                              onClick={() => startEditStock(product)}
                                          >
                                            Update Stock
                                          </button>
                                      )}
                                    </td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      )}

                      <div className="pm-stocks-summary">
                        <div className="summary-card total-products">
                          <h4>Total Products</h4>
                          <p>{stockProducts.length}</p>
                        </div>
                        <div className="summary-card total-inventory">
                          <h4>Total Items in Stock</h4>
                          <p>{stockProducts.reduce((total, product) => total + product.stock, 0)}</p>
                        </div>
                        <div className="summary-card low-stock-items">
                          <h4>Low Stock Items</h4>
                          <p>{stockProducts.filter(product => product.stock <= 5).length}</p>
                        </div>
                        <div className="summary-card inventory-value">
                          <h4>Total Inventory Value</h4>
                          <p>${stockProducts.reduce((total, product) => total + (product.stock * product.price), 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </>
                )}
              </div>
          )}

          {/* Manage Orders Section with Deliveries */}
          {activeSection === 'orders' && (
              <div className="pm-orders-section">
                <h2 className="source-sans-semibold">Manage Orders</h2>

                {isLoading ? (
                    <div className="pm-loading">
                      <p className="source-sans-regular">Loading deliveries data...</p>
                    </div>
                ) : (
                    <>
                      <div className="pm-deliveries-header">
                        <h3 className="source-sans-semibold">Delivery Management</h3>
                        <p className="source-sans-light">Update the status of customer deliveries</p>
                      </div>

                      {deliveries.length === 0 ? (
                          <p className="source-sans-regular">No deliveries found.</p>
                      ) : (
                          <div className="pm-deliveries-table-container">
                            <table className="pm-deliveries-table">
                              <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Order Date</th>
                                <th>Current Status</th>
                                <th>Update Status</th>
                                <th>Actions</th>
                              </tr>
                              </thead>
                              <tbody>
                              {deliveries.map(delivery => (
                                  <tr key={delivery.id}>
                                    <td>{delivery.orderId}</td>
                                    <td>{delivery.customer}</td>
                                    <td>{delivery.product}</td>
                                    <td>{delivery.date}</td>
                                    <td>
                              <span className={`status-badge status-${delivery.status.toLowerCase()}`}>
                                {delivery.status}
                              </span>
                                    </td>
                                    <td>
                                      <select
                                          value={selectedStatus[delivery.id]}
                                          onChange={(e) => handleStatusChange(delivery.id, e.target.value)}
                                          className="pm-status-select"
                                      >
                                        {statusOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td>
                                      <button
                                          className="pm-btn-action"
                                          onClick={() => handleSaveStatus(delivery.id)}
                                          disabled={selectedStatus[delivery.id] === delivery.status}
                                      >
                                        Save
                                      </button>
                                    </td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      )}
                    </>
                )}
              </div>
          )}

          {/* Manage Comments Section */}
          {activeSection === 'comments' && (
              <div className="pm-comments-section">
                <h2 className="source-sans-semibold">Manage Comments</h2>

                {commentIsLoading ? (
                    <div className="pm-loading">
                      <p className="source-sans-regular">Loading comments...</p>
                    </div>
                ) : (
                    <>
                      <div className="pm-comments-header">
                        <h3 className="source-sans-semibold">Comment Approval</h3>
                        <p className="source-sans-light">Review and approve user comments before they become visible on the product pages</p>

                        <div className="pm-comments-filter">
                          <span className="source-sans-regular">Filter:</span>
                          <div className="pm-filter-buttons">
                            <button
                                className={`pm-filter-btn ${commentFilter === 'pending' ? 'active' : ''}`}
                                onClick={() => setCommentFilter('pending')}
                            >
                              Pending
                            </button>
                            <button
                                className={`pm-filter-btn ${commentFilter === 'approved' ? 'active' : ''}`}
                                onClick={() => setCommentFilter('approved')}
                            >
                              Approved
                            </button>
                            <button
                                className={`pm-filter-btn ${commentFilter === 'rejected' ? 'active' : ''}`}
                                onClick={() => setCommentFilter('rejected')}
                            >
                              Rejected
                            </button>
                            <button
                                className={`pm-filter-btn ${commentFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setCommentFilter('all')}
                            >
                              All
                            </button>
                          </div>
                        </div>
                      </div>

                      {getFilteredComments().length === 0 ? (
                          <p className="source-sans-regular pm-no-comments">
                            {commentFilter === 'pending'
                                ? 'No pending comments to review.'
                                : commentFilter === 'approved'
                                    ? 'No approved comments.'
                                    : commentFilter === 'rejected'
                                        ? 'No rejected comments.'
                                        : 'No comments found.'}
                          </p>
                      ) : (
                          <div className="pm-comments-list">
                            {getFilteredComments().map(comment => (
                                <div key={comment.id} className={`pm-comment-card pm-comment-${comment.status}`}>
                                  <div className="pm-comment-header">
                                    <div className="pm-comment-product">
                                      <span className="source-sans-semibold">Product:</span> {comment.productName}
                                    </div>
                                    <div className="pm-comment-user">
                                      <span className="source-sans-semibold">User:</span> {comment.userName}
                                    </div>
                                    <div className="pm-comment-date">
                                      <span className="source-sans-semibold">Date:</span> {comment.date}
                                    </div>
                                    <div className="pm-comment-rating">
                                      <span className="source-sans-semibold">Rating:</span>
                                      <div className="star-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={i < comment.rating ? "star filled" : "star"}
                                            >
                                  ★
                                </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pm-comment-content">
                                    <p className="source-sans-regular">{comment.comment}</p>
                                  </div>

                                  <div className="pm-comment-status">
                          <span className={`pm-status-badge pm-status-${comment.status}`}>
                            {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                          </span>
                                  </div>

                                  <div className="pm-comment-actions">
                                    {comment.status === 'pending' && (
                                        <>
                                          <button
                                              className="pm-btn-approve"
                                              onClick={() => handleApproveComment(comment.id)}
                                          >
                                            Approve
                                          </button>
                                          <button
                                              className="pm-btn-reject"
                                              onClick={() => handleRejectComment(comment.id)}
                                          >
                                            Reject
                                          </button>
                                        </>
                                    )}
                                    {comment.status === 'approved' && (
                                        <button
                                            className="pm-btn-reject"
                                            onClick={() => handleRejectComment(comment.id)}
                                        >
                                          Remove Approval
                                        </button>
                                    )}
                                    {comment.status === 'rejected' && (
                                        <button
                                            className="pm-btn-approve"
                                            onClick={() => handleApproveComment(comment.id)}
                                        >
                                          Approve Instead
                                        </button>
                                    )}
                                  </div>
                                </div>
                            ))}
                          </div>
                      )}
                    </>
                )}
              </div>
          )}
        </div>
      </div>
  );
};

export default ProductManager;