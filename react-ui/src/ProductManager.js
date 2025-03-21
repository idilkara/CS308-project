import React, { useState, useEffect } from 'react';
import './ProductManager.css';

const ProductManager = () => {
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
  const [activeSection, setActiveSection] = useState('add');
  
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

  // Handle form submission
  const handleSubmit = (e) => {
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
      discount: newProduct.discount.discount_percentage 
        ? {
            ...newProduct.discount,
            discount_percentage: parseFloat(newProduct.discount.discount_percentage)
          } 
        : null
    };
    
    console.log('Product ready for submission:', productData);
    
    // Here you would typically send the data to your backend API
    // For now, just simulate success
    resetForm();
    alert('Product added successfully!');
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
        
        {/* Manage Stocks Section (Placeholder) */}
        {activeSection === 'stocks' && (
          <div className="pm-stocks-section">
            <h2 className="source-sans-semibold">Manage Stocks</h2>
            <p className="source-sans-light">This section is under development.</p>
          </div>
        )}
        
        {/* Manage Orders Section (Placeholder) */}
        {activeSection === 'orders' && (
          <div className="pm-orders-section">
            <h2 className="source-sans-semibold">Manage Orders</h2>
            <p className="source-sans-light">This section is under development.</p>
          </div>
        )}
        
        {/* Manage Comments Section (Placeholder) */}
        {activeSection === 'comments' && (
          <div className="pm-comments-section">
            <h2 className="source-sans-semibold">Manage Comments</h2>
            <p className="source-sans-light">This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;