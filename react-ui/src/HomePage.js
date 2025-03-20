import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./HomePage.css";
import './styles/root.css';
import banner1 from "./img/HomePageBanner1.png";
import banner2 from "./img/HomePageBanner2.png";
import banner3 from "./img/HomePageBanner3.png";

import Navbar from "./components/Navbar.jsx";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsBook, BsThreeDots } from "react-icons/bs";
import { FaRegNewspaper, FaUserSecret, FaTheaterMasks, FaRocket } from "react-icons/fa";

const HomePage = () => {
  const banners = [
    { id: 1, text: "Banner 1", image: banner3   },
    { id: 2, text: "Banner 2", image: banner2 },
    { id: 3, text: "Banner 3", image: banner1 }
  ];

  const products = [
    { id: 1, name: "Book 1", image: "https://m.media-amazon.com/images/I/61tqFlvlU3L.jpg" },
    { id: 2, name: "Book 2",image: "https://m.media-amazon.com/images/I/61tqFlvlU3L.jpg"  },
    { id: 3, name: "Book 3", image: "https://m.media-amazon.com/images/I/61tqFlvlU3L.jpg" },
    { id: 4, name: "Book 4",image: "https://m.media-amazon.com/images/I/61tqFlvlU3L.jpg"},
    { id: 5, name: "Book 5", image: "https://m.media-amazon.com/images/I/61tqFlvlU3L.jpg" },
    { id: 6, name: "Book 6", image: "https://m.media-amazon.com/images/I/61tqFlvlU3L.jpg" },
    { id: 7, name: "Book 7", image: "https://via.placeholder.com/150" },
    { id: 8, name: "Book 8", image: "https://via.placeholder.com/150" },
    { id: 9, name: "Book 9", image: "https://via.placeholder.com/150" },
    { id: 10, name: "Book 10", image: "https://via.placeholder.com/150" },
    { id: 11, name: "Book 11", image: "https://via.placeholder.com/150" },
    { id: 12, name: "Book 12", image: "https://via.placeholder.com/150" }
  ];

  const [bannerIndex, setBannerIndex] = useState(1);          //tracks which banner ad is shown
  const [isTransitioning, setIsTransitioning] = useState(false);  //prevents rapid clicking
  const [favorites, setFavorites] = useState({});

  const [Page, setPage] = useState(0);
  const productsPerPage = 5;
  const totalPages = Math.ceil(products.length / productsPerPage);

 
  const extendedBanners = [banners[banners.length - 1], ...banners, banners[0]]; 
  
  const navigate = useNavigate(); // Initialize navigation function

  //banner
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

  const toggleFavorite = (index) => {
    setFavorites({
      ...favorites,
      [index]: !favorites[index]
    });
  };

  //products
  const nextPage = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };


  //categories
  const categories = [
    { name: "Fiction", icon: <BsBook /> },
    { name: "Non-Fiction", icon: <FaRegNewspaper /> },
    { name: "Mystery", icon: <FaUserSecret /> },
    { name: "Drama", icon: <FaTheaterMasks /> },
    { name: "Science-Fiction", icon: <FaRocket /> },
    { name: "More...", onClick: () => navigate("/category") },
  ];

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

  return (
    <div>
    <Navbar /> 
    
    <div>
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
      {/* SLIDING PRODUCTS */}
      <div className="products-container">
      <h2 className="source-sans-bold">New Arrivals</h2>
      <div className="products-slider">
        <div 
          className="products-wrapper" 
          style={{
            transform: `translateX(-${Page * 100}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={pageIndex} className="product-page">
              {products
                .slice(pageIndex * productsPerPage, (pageIndex + 1) * productsPerPage)
                .map((product, index) => {
                  const productIndex = pageIndex * productsPerPage + index;
                  return (
                    <div key={productIndex} className="grid-item">
                      <div className="item-actions">
                        <button 
                          className={`favorite-btn ${favorites[productIndex] ? 'active' : ''}`}
                          onClick={() => toggleFavorite(productIndex)}
                        >
                          {favorites[productIndex] ? 
                            <span className="heart-filled">♥</span> : 
                            <span className="heart-outline">♡</span>
                          }
                        </button>
                        <button className="cart-btn">
                          <span>🛒</span>
                        </button>
                      </div>
                      
                      <div className="grid-item-content">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <hr />
                      <div className="grid-item-header">
                        <h3 style={{ fontFamily: 'SourceSans3-Bold, sans-serif', fontSize: '20px' }}>
                          Klara and the Sun
                        </h3>
                        <p style={{ fontFamily: 'SourceSans3-Regular, sans-serif', fontSize: '16px' }}>
                          Kazuo Ishiguro
                        </p>
                        <span style={{ fontFamily: 'SourceSans3-Regular, sans-serif', fontSize: '16px' }}>
                          $19.99
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
        <button className="prev-button" onClick={prevPage}>
          <FiChevronLeft size={30} color="black" />
        </button>
        <button className="next-button" onClick={nextPage}>
          <FiChevronRight size={30} color="black" />
        </button>
      </div>
    </div>

            <hr />
      {/* CATERGORIES */}
      <div className="category-container">
      <h2 className="source-sans-bold">Discover Categories</h2>
      <div className="category-slider">
        <div className="category-wrapper">
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-item source-sans-regular"
            onClick={category.onClick} // Add click event for More...
            style={{ cursor: category.onClick ? "pointer" : "default" }}
          >
            {category.icon}
            <span style={{ marginLeft: "8px" }}>{category.name}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
          <hr />
    {/* BEST SELLERS */}
    <div className="products-container">
      <h2 className="source-sans-bold">New Arrivals</h2>
      <div className="products-slider">
        <div 
          className="products-wrapper" 
          style={{
            transform: `translateX(-${Page * 100}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={pageIndex} className="product-page">
              {products
                .slice(pageIndex * productsPerPage, (pageIndex + 1) * productsPerPage)
                .map((product, index) => {
                  const productIndex = pageIndex * productsPerPage + index;
                  return (
                    <div key={productIndex} className="grid-item">
                      <div className="item-actions">
                        <button 
                          className={`favorite-btn ${favorites[productIndex] ? 'active' : ''}`}
                          onClick={() => toggleFavorite(productIndex)}
                        >
                          {favorites[productIndex] ? 
                            <span className="heart-filled">♥</span> : 
                            <span className="heart-outline">♡</span>
                          }
                        </button>
                        <button className="cart-btn">
                          <span>🛒</span>
                        </button>
                      </div>
                      
                      <div className="grid-item-content">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <hr />
                      <div className="grid-item-header">
                        <h3 style={{ fontFamily: 'SourceSans3-Bold, sans-serif', fontSize: '20px' }}>
                          Klara and the Sun
                        </h3>
                        <p style={{ fontFamily: 'SourceSans3-Regular, sans-serif', fontSize: '16px' }}>
                          Kazuo Ishiguro
                        </p>
                        <span style={{ fontFamily: 'SourceSans3-Regular, sans-serif', fontSize: '16px' }}>
                          $19.99
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
        <button className="prev-button" onClick={prevPage}>
          <FiChevronLeft size={30} color="black" />
        </button>
        <button className="next-button" onClick={nextPage}>
          <FiChevronRight size={30} color="black" />
        </button>
      </div>
    </div>
            <hr />
      {/* PUBLISHERS */}
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
    </div>
    </div>
  );
};

export default HomePage;