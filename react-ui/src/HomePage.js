import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./HomePage.css";
import './styles/root.css';
import banner1 from "./img/HomePageBanner1.png";
import banner2 from "./img/HomePageBanner2.png";
import banner3 from "./img/HomePageBanner3.png";
import bookCover from './img/BookCover.png';

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useAuth } from "./context/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  console.log("Token from HomePage:", token);
  
  const banners = [
    { id: 1, text: "Banner 1", image: banner3 },
    { id: 2, text: "Banner 2", image: banner2 },
    { id: 3, text: "Banner 3", image: banner1 }
  ];
  
  // State for data
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [notification, setNotification] = useState({
    message: '',
    visible: false
  });

  // Banner state
  const [bannerIndex, setBannerIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Pagination state
  const [newArrivalsPage, setNewArrivalsPage] = useState(0);
  const [bestSellersPage, setBestSellersPage] = useState(0);
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0);
  const categoryScrollAmount = 800; // Amount to scroll in pixels per click
  const productsPerPage = 5;
 
  
  const extendedBanners = [banners[banners.length - 1], ...banners, banners[0]];
  

  // Fetch new arrivals (last 20 products)
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await fetch("http://localhost/api/products/viewall");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        // Filter out out-of-stock items
        const inStockItems = data.filter(item => item.stock_quantity && item.stock_quantity > 0);

        // Get the last 20 items from the list
        const newestTwenty = inStockItems.slice(-20);

        setNewArrivals(newestTwenty);

        
        // Initialize favorites state based on wishlist if token exists
        if (token) {
          fetchWishlist(token).then(wishlistData => {
            if (wishlistData && Array.isArray(wishlistData)) {
              const wishlistMap = {};
              newestTwenty.forEach((product, index) => {
                const isInWishlist = wishlistData.some(item => item.product_id === product.product_id);
                if (isInWishlist) {
                  wishlistMap[`new-${index}`] = true;
                }
              });
              setFavorites(wishlistMap);
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch new arrivals", error);
      }
    };
    fetchNewArrivals();
  }, [token]);
  
  // Fetch best sellers (first 20 products)
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await fetch("http://localhost/api/products/viewall");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        // Filter out out-of-stock items
        const inStockItems = data.filter(item => item.stock_quantity && item.stock_quantity > 0);
        
        // For best sellers, we would ideally sort by sales or popularity
        // Since we don't have that data, we'll simulate it by taking the first 20 in-stock items
        // In a real app, you'd want to add a sales_count or popularity field to sort by
        
        // Get the first 20 in-stock items
        const topTwenty = inStockItems.slice(0, 20);
        setBestSellers(topTwenty);
        
        // Initialize favorites state based on wishlist if token exists
        if (token) {
          fetchWishlist(token).then(wishlistData => {
            if (wishlistData && Array.isArray(wishlistData)) {
              const wishlistMap = {...favorites};
              topTwenty.forEach((product, index) => {
                const isInWishlist = wishlistData.some(item => item.product_id === product.product_id);
                if (isInWishlist) {
                  wishlistMap[`best-${index}`] = true;
                }
              });
              setFavorites(wishlistMap);
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch best sellers", error);
      }
    };
    fetchBestSellers();
  }, [token]);



  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost/api/categories/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);
  
  // Fetch wishlist data
  const fetchWishlist = async (token) => {
    if (!token) return;
  
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
      if (Array.isArray(wishlistData)) {
        // Create a map of product_id to favorite status
        const newFavorites = {};
        
        // Process new arrivals
        newArrivals.forEach(product => {
          if (wishlistData.some(item => item.product_id === product.product_id)) {
            newFavorites[`new-${product.product_id}`] = true;
          }
        });
        bestSellers.forEach(product => {
          if (wishlistData.some(item => item.product_id === product.product_id)) {
            newFavorites[`best-${product.product_id}`] = true;
          }
        });
        
        
        setFavorites(newFavorites);
      }
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error);
  }
  };
  
  // Add to wishlist function
  const addToWishlist = async (productId) => {
    if (!token) {
      setNotification({
        message: "Please log in to add items to wishlist",
        visible: true
      });
      setTimeout(() => {
        setNotification({ message: '', visible: false });
      }, 3000);
      return { error: "Authentication required" };
    }
  
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  
    const data = {
      product_id: productId
    };
  
    try {
      const response = await fetch("http://localhost/api/wishlist/add", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        return { error: errorData.message || "Failed to add to wishlist" };
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return { error: "An unexpected error occurred" };
    }
  };
  
  // Update removeFromWishlist function - remove notification code  
  const removeFromWishlist = async (productId) => {
    if (!token) {
      return { error: "Authentication required" };
    }
  
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
        return result;
      } else {
        const errorData = await response.json();
        return { error: errorData.message || "Failed to remove from wishlist" };
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return { error: "An unexpected error occurred" };
    }
  };
  
  // Add to cart function
  const addToCart = async (event, book) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      if (token) {
        // User is logged in, add to their cart in the database
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const data = { product_id: book.product_id, quantity: 1 };
      
        const response = await fetch("http://localhost/api/shopping/add", {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });
      
        if (response.ok) {
          const result = await response.json();
          setNotification({
            message: "Added to cart successfully!",
            visible: true
          });
          setTimeout(() => {
            setNotification({ message: '', visible: false });
          }, 3000);
          return result;
        } else {
          const errorData = await response.json();
          setNotification({
            message: errorData.error || "Failed to add to cart",
            visible: true
          });
          setTimeout(() => {
            setNotification({ message: '', visible: false });
          }, 3000);
          return {
            error: errorData.error || "Failed to add to cart"
          };
        }
      } else {
        // User is not logged in, store the item in local storage
        const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
        const existingItemIndex = tempCart.findIndex(item => item.id === book.product_id);
        
        if (existingItemIndex >= 0) {
          // Item already exists, increase quantity
          tempCart[existingItemIndex].quantity += 1;
        } else {
          // New item, add to cart
          tempCart.push({
            id: book.product_id,
            name: getBookName(book),
            price: parseFloat(book.price) || 0,
            quantity: 1,
            author: book.author || "Unknown Author",
            publisher: book.distributor_information || "Unknown Publisher",
            image: `assets/covers/${book.name ? book.name.replace(/\s+/g, '').toLowerCase() : 'default'}.png`
          });
        }
        
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
        setNotification({
          message: "Added to cart successfully!",
          visible: true
        });
        setTimeout(() => {
          setNotification({ message: '', visible: false });
        }, 3000);
        return { success: true };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setNotification({
        message: "An unexpected error occurred",
        visible: true
      });
      setTimeout(() => {
        setNotification({ message: '', visible: false });
      }, 3000);
      return { error: "An unexpected error occurred" };
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = (index, productId, section) => {
    const key = `${section}-${index}`;
    const currentStatus = favorites[key];
    
    // Call the appropriate API function based on current status
    const apiFunction = currentStatus ? removeFromWishlist : addToWishlist;
    
    apiFunction(productId).then((result) => {
      if (!result.error) {
        setFavorites({ ...favorites, [key]: !currentStatus });
      }
    });
  };
  
  // Banner navigation functions
  const nextBanner = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setBannerIndex((prevIndex) => prevIndex + 1);
    }
  };

  const prevBanner = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setBannerIndex((prevIndex) => prevIndex - 1);
    }
  };
  
  // Products pagination functions
  const nextNewArrivalsPage = () => {
    const totalPages = Math.ceil(newArrivals.length / productsPerPage);
    setNewArrivalsPage((prev) => (prev + 1) % totalPages);
  };

  const prevNewArrivalsPage = () => {
    const totalPages = Math.ceil(newArrivals.length / productsPerPage);
    setNewArrivalsPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const nextBestSellersPage = () => {
    const totalPages = Math.ceil(bestSellers.length / productsPerPage);
    setBestSellersPage((prev) => (prev + 1) % totalPages);
  };

  const prevBestSellersPage = () => {
    const totalPages = Math.ceil(bestSellers.length / productsPerPage);
    setBestSellersPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  // Helper function to get book name
  const getBookName = (book) => {
    if (book.title) return book.title;
    if (book.name) return book.name;
    if (book.productName) return book.productName;
    if (book.book_title) return book.book_title;
    return "Unknown Title";
  };
  
  // Banner transition effect
  useEffect(() => {
    if (bannerIndex === extendedBanners.length - 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setBannerIndex(1);
      }, 500);
    } else if (bannerIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setBannerIndex(banners.length);
      }, 500);
    } else {
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [bannerIndex, extendedBanners.length, banners.length]);

  

  // Add these scrolling functions for categories section
  const scrollCategoriesRight = () => {
    // Get the category wrapper element
    const categoryWrapper = document.querySelector('.category-wrapper');
    if (!categoryWrapper) return;
    
    // Calculate max scroll based on content width minus visible width
    const maxScroll = categoryWrapper.scrollWidth - categoryWrapper.offsetWidth;
    
    // Calculate new position and ensure it doesn't exceed boundaries
    const newPosition = Math.min(categoryScrollPosition + categoryScrollAmount, maxScroll);
    setCategoryScrollPosition(newPosition);
  };

  const scrollCategoriesLeft = () => {
    // Calculate new position and ensure it doesn't go negative
    const newPosition = Math.max(categoryScrollPosition - categoryScrollAmount, 0);
    setCategoryScrollPosition(newPosition);
  };
  
  // Publishers array
  const publishers = [
    { name: "Macmillan", image: "https://macmillan.com/img/macmillan-publishers.jpg" },
    { name: "Harper Collins", image: "https://s21618.pcdn.co/wp-content/uploads/2016/12/FireandWaterLogo-768x831.jpg"},
    { name: "Penguin Random House", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo89m1QPG0ORTGNVAEWipEGwcy4MXz9QM2t0YYtZVnniE1rpcNqexPZLgvAh02IjbPwHk&usqp=CAU"},
    { name: "Scholastic", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw-X2wQtzllLppE2x9W-hKc5JvhnM165kINFk9jAEh7UpHm1NM34o5Rhdaholihd4eFhE&usqp=CAU"},
    { name: "Ithaki", image: "https://www.yaybir.org.tr/wp-content/uploads/2022/08/Ithaki-logo-pdf.jpg"},
    { name: "Yapi Kredi Kultur", image: "https://img.kitapyurdu.com/v1/getImage/fn:11263722/wi:200/wh:416d9f42c"},
    { name: "Ithaki", image: "https://www.yaybir.org.tr/wp-content/uploads/2022/08/Ithaki-logo-pdf.jpg"},
    { name: "Yapi Kredi Kultur", image: "https://img.kitapyurdu.com/v1/getImage/fn:11263722/wi:200/wh:416d9f42c"},
    { name: "Ithaki", image: "https://www.yaybir.org.tr/wp-content/uploads/2022/08/Ithaki-logo-pdf.jpg"},
  ];

  return (
    <div>
      <Navbar /> 
      
      <div>
        {/* Banner Section */}
        <div className="banner-container">
          <div
            className="banner-wrapper"
            style={{
              transform: `translateX(-${bannerIndex * 100}%)`,
              transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
            }}
          >
            {extendedBanners.map((banner, i) => (
              <img key={i} src={banner.image} alt={banner.text} className="banner-image" />
            ))}
          </div>
          <button className="prev-button" onClick={prevBanner}>
            <FiChevronLeft size={40} color="black" />
          </button>
          <button className="next-button" onClick={nextBanner}>
            <FiChevronRight size={40} color="black" />
          </button>
        </div>
        <hr />
        
        {/* New Arrivals Section */}
        <div className="products-container">
          <h2 className="source-sans-bold">New Arrivals</h2>
          <div className="products-slider">
            <div 
              className="products-wrapper" 
              style={{
                transform: `translateX(-${newArrivalsPage * 100}%)`,
                transition: "transform 0.5s ease-in-out",
              }}
            >
              {Array.from({ length: Math.ceil(newArrivals.length / productsPerPage) }).map((_, pageIndex) => (
                <div key={pageIndex} className="product-page" style={{ width: '100%' }}>
                  {newArrivals
                    .slice(pageIndex * productsPerPage, (pageIndex + 1) * productsPerPage)
                    .map((product, index) => {
                      const productIndex = pageIndex * productsPerPage + index;
                      const favoriteKey = `new-${product.product_id}`;
                      return (
                        <div 
                          key={productIndex} 
                          className="grid-item-hp"
                          onClick={() => navigate('/product', { state: { product_id: product.product_id } })}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className={`favorite-btn ${favorites[favoriteKey] ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(productIndex, product.product_id, 'new');
                              }}
                            >
                              {favorites[favoriteKey] ? 
                                <span className="heart-filled">♥</span> : 
                                <span className="heart-outline">♡</span>
                              }
                            </button>
                            <button 
                              className="cart-btn"
                              onClick={(e) => addToCart(e, product)}
                            >
                              <span>🛒</span>
                            </button>
                          </div>
                          
                          <div className="grid-item-content-hp">
                            <img
                              src={`assets/covers/${product.name?.replace(/\s+/g, '').toLowerCase() || 'default'}.png`}
                              alt={getBookName(product)}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = bookCover;
                              }}
                            />
                          </div>
                          <hr />
                          <div className="grid-item-header-hp">
                            <h3 className="source-sans-semibold">
                              {getBookName(product).length > 27
                                ? getBookName(product).slice(0, 27) + '...'
                                : getBookName(product)
                              }
                            </h3>
                            <p className="source-sans-regular">{product.author || "Unknown Author"}</p>
                            <span className="source-sans-bold">${product.price || "0.00"}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
            
          </div>
          <button className="prev-button" onClick={prevNewArrivalsPage}>
              <FiChevronLeft size={30} color="black" />
            </button>
            <button className="next-button" onClick={nextNewArrivalsPage}>
              <FiChevronRight size={30} color="black" />
            </button>
        </div>
        
        <hr />
        
        {/* Categories Section */}
        <div className="category-container">
          <h2 className="source-sans-bold">Discover Categories</h2>
          <div className="category-slider">
            <div 
              className="category-wrapper" 
              style={{
                transform: `translateX(-${categoryScrollPosition}px)`,
                transition: "transform 0.5s ease-in-out",
              }}
            >
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="category-item source-sans-regular"
                  onClick={() => navigate('/category', { state: { selectedCategory: category.name } })}
                  style={{ cursor: "pointer" }}
                >
                  <span style={{ marginLeft: "8px" }}>{category.name}</span>
                </div>
              ))}
            </div>
            
            
          </div>
          <button className="prev-button" onClick={scrollCategoriesLeft}>
              <FiChevronLeft size={30} color="black" />
            </button>
            <button className="next-button" onClick={scrollCategoriesRight}>
              <FiChevronRight size={30} color="black" />
            </button>
        </div>
        <hr />
        
        {/* Best Sellers Section */}
        <div className="products-container">
          <h2 className="source-sans-bold">Best Sellers</h2>
          <div className="products-slider">
            <div 
              className="products-wrapper" 
              style={{
                transform: `translateX(-${bestSellersPage * 100}%)`,
                transition: "transform 0.5s ease-in-out",
              }}
            >
              {Array.from({ length: Math.ceil(bestSellers.length / productsPerPage) }).map((_, pageIndex) => (
                <div key={pageIndex} className="product-page" style={{ width: '100%' }}>
                  {bestSellers
                    .slice(pageIndex * productsPerPage, (pageIndex + 1) * productsPerPage)
                    .map((product, index) => {
                      const productIndex = pageIndex * productsPerPage + index;
                      const favoriteKey = `best-${product.product_id}`;
                      return (
                        <div 
                          key={productIndex} 
                          className="grid-item-hp"
                          onClick={() => navigate('/product', { state: { product_id: product.product_id } })}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className={`favorite-btn ${favorites[favoriteKey] ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(productIndex, product.product_id, 'best');
                              }}
                            >
                              {favorites[favoriteKey] ? 
                                <span className="heart-filled">♥</span> : 
                                <span className="heart-outline">♡</span>
                              }
                            </button>
                            <button 
                              className="cart-btn"
                              onClick={(e) => addToCart(e, product)}
                            >
                              <span>🛒</span>
                            </button>
                          </div>
                          
                          <div className="grid-item-content-hp">
                            <img
                              src={`assets/covers/${product.name?.replace(/\s+/g, '').toLowerCase() || 'default'}.png`}
                              alt={getBookName(product)}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = bookCover;
                              }}
                            />
                          </div>
                          <hr />
                          <div className="grid-item-header-hp">
                            <h3 className="source-sans-semibold">
                              {getBookName(product).length > 27
                                ? getBookName(product).slice(0, 27) + '...'
                                : getBookName(product)
                              }
                            </h3>
                            <p className="source-sans-regular">{product.author || "Unknown Author"}</p>
                            <span className="source-sans-bold">${product.price || "0.00"}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>

            
          </div>
          <button className="prev-button" onClick={prevBestSellersPage}>
              <FiChevronLeft size={30} color="black" />
            </button>
            <button className="next-button" onClick={nextBestSellersPage}>
              <FiChevronRight size={30} color="black" />
            </button>
        </div>
        <hr />

        
        {/* Publishers Section */}
        <div className="category-container">
          <h2 className="source-sans-bold">Our Publishers</h2>
          <div className="category-slider">
            <div className="category-wrapper">
              {publishers.map((publisher, index) => (
                <div
                  key={index}
                  className="publisher-item"
                  style={{
                    backgroundImage: `url(${publisher.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <span className="publisher-name">{publisher.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Notification */}
        {notification.visible && (
          <div className="cart-notification">
            {notification.message}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;