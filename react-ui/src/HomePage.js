import React, { useState, useEffect } from "react";
import "./HomePage.css";
import './styles/root.css';
import banner1 from "./img/HomePageBanner1.png";
import banner2 from "./img/HomePageBanner2.png";
import banner3 from "./img/HomePageBanner3.png";

import Navbar from "./components/Navbar"; 
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsBook, BsThreeDots } from "react-icons/bs";
import { FaRegNewspaper, FaUserSecret, FaTheaterMasks, FaRocket } from "react-icons/fa";



const HomePage = () => {
  const banners = [
    { id: 1, text: "Banner 1", image: banner1   },
    { id: 2, text: "Banner 2", image: banner2 },
    { id: 3, text: "Banner 3", image: banner3 }
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
  const [productStartIndex, setProductStartIndex] = useState(0);   //for product display section
    const [favorites, setFavorites] = useState({});

  const extendedBanners = [banners[banners.length - 1], ...banners, banners[0]];   
  
  const itemsPerView = 5;
  const maxStartIndex = Math.max(0, products.length - itemsPerView);

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

  //items
  const nextProducts = () => {
    // Move forward by 5 items or less if fewer remain
    const newIndex = Math.min(productStartIndex + itemsPerView, maxStartIndex);
    setProductStartIndex(newIndex);
  };

  const prevProducts = () => {
    // Move backward by 5 items
    const newIndex = Math.max(productStartIndex - itemsPerView, 0);
    setProductStartIndex(newIndex);
  };

  const toggleFavorite = (index) => {
    setFavorites({
      ...favorites,
      [index]: !favorites[index]
    });
  };

  //categories
  const categories = [
    { name: "Classics", icon: <BsBook /> },
    { name: "Non-Fiction", icon: <FaRegNewspaper /> },
    { name: "Mystery", icon: <FaUserSecret /> },
    { name: "Drama", icon: <FaTheaterMasks /> },
    { name: "Science-Fiction", icon: <FaRocket /> },
    { name: "More...", icon: <BsThreeDots /> },
  ];

  const publishers = [
    { name: "Macmillan", image: "https://macmillan.com/img/macmillan-publishers.jpg" },
    { name: "Harper Collins", image: "https://s21618.pcdn.co/wp-content/uploads/2016/12/FireandWaterLogo-768x831.jpg"},
    { name: "Penguin Random House", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo89m1QPG0ORTGNVAEWipEGwcy4MXz9QM2t0YYtZVnniE1rpcNqexPZLgvAh02IjbPwHk&usqp=CAU"},
    { name: "Scholastic", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw-X2wQtzllLppE2x9W-hKc5JvhnM165kINFk9jAEh7UpHm1NM34o5Rhdaholihd4eFhE&usqp=CAU"},
    { name: "Ithaki", image: "https://www.yaybir.org.tr/wp-content/uploads/2022/08/Ithaki-logo-pdf.jpg"},
    { name: "Yapi Kredi Kultur", image: "https://img.kitapyurdu.com/v1/getImage/fn:11263722/wi:200/wh:416d9f42c"},
    { name: "Macmillan", image: "https://macmillan.com/img/macmillan-publishers.jpg" },
    { name: "Harper Collins", image: "https://s21618.pcdn.co/wp-content/uploads/2016/12/FireandWaterLogo-768x831.jpg"},
    { name: "Penguin Random House", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo89m1QPG0ORTGNVAEWipEGwcy4MXz9QM2t0YYtZVnniE1rpcNqexPZLgvAh02IjbPwHk&usqp=CAU"},
    { name: "Scholastic", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw-X2wQtzllLppE2x9W-hKc5JvhnM165kINFk9jAEh7UpHm1NM34o5Rhdaholihd4eFhE&usqp=CAU"},
    { name: "Ithaki", image: "https://www.yaybir.org.tr/wp-content/uploads/2022/08/Ithaki-logo-pdf.jpg"},
    { name: "Yapi Kredi Kultur", image: "https://img.kitapyurdu.com/v1/getImage/fn:11263722/wi:200/wh:416d9f42c"},
    { name: "Macmillan", image: "https://macmillan.com/img/macmillan-publishers.jpg" },
    { name: "Harper Collins", image: "https://s21618.pcdn.co/wp-content/uploads/2016/12/FireandWaterLogo-768x831.jpg"},
    { name: "Penguin Random House", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo89m1QPG0ORTGNVAEWipEGwcy4MXz9QM2t0YYtZVnniE1rpcNqexPZLgvAh02IjbPwHk&usqp=CAU"},
    { name: "Scholastic", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw-X2wQtzllLppE2x9W-hKc5JvhnM165kINFk9jAEh7UpHm1NM34o5Rhdaholihd4eFhE&usqp=CAU"},
    { name: "Ithaki", image: "https://www.yaybir.org.tr/wp-content/uploads/2022/08/Ithaki-logo-pdf.jpg"},
    { name: "Yapi Kredi Kultur", image: "https://img.kitapyurdu.com/v1/getImage/fn:11263722/wi:200/wh:416d9f42c"},
  ];
  
    const [categoryIndex, setCategoryIndex] = useState(0);
    const categoriesPerView = 2;
  
    const nextCategories = () => {
      if (categoryIndex < categories.length - categoriesPerView ) {
        setCategoryIndex(categoryIndex + categoriesPerView );
      }
    };
  
    const prevCategories = () => {
      if (categoryIndex > 0) {
        setCategoryIndex(categoryIndex - categoriesPerView );
      }
    };

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

  
  // Calculate percentage to shift the product container
  const productShiftPercentage = (productStartIndex / itemsPerView) * 100;
  
  // Calculate if we can navigate forward or backward
  const canGoNext = productStartIndex < maxStartIndex;
  const canGoPrev = productStartIndex > 0;

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

      {/* SLIDING PRODUCTS */}
      <div className="products-container">
      <h2 className="source-sans-bold">New Arrivals</h2>
        <div className="products-slider">
          <div
            className="products-wrapper"
            style={{
              transform: `translateX(-${productShiftPercentage}%)`,
              transition: "transform 0.5s ease-in-out",
            }}
          >
            {products.map((product, index) => (
              
              <div key={index} className="grid-item" >
                 <div className="item-actions">
                    <button 
                      className={`favorite-btn ${favorites[index] ? 'active' : ''}`}
                      onClick={() => toggleFavorite(index)}
                    >
                      {favorites[index] ? 
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
                <div class="grid-item-header">
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
            ))}
          </div>
        </div>
        <button 
          className="prev-button" 
          onClick={prevProducts}
          disabled={!canGoPrev}
        >
          <FiChevronLeft size={40} color="black" />
        </button>
        <button 
          className="next-button" 
          onClick={nextProducts}
          disabled={!canGoNext}
        >
          <FiChevronRight size={40} color="black" />
        </button>
      </div>
            <hr />
      {/* CATERGORIES */}
      <div className="category-container">
      <h2 className="source-sans-bold">Discover Categories</h2>
      <div className="category-slider">
        <div
          className="category-wrapper"
          style={{
            transform: `translateX(-${categoryIndex * (100 / categoriesPerView)}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {categories.map((category, index) => (
            <div key={index} className="category-item source-sans-regular">
              {category.icon}<span style={{ marginLeft: "8px" }}>{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        className="category-nav category-prev" 
        onClick={prevCategories} 
        disabled={categoryIndex === 0}
      >
        <FiChevronLeft size={40} color="black" />
      </button>

      <button 
        className="category-nav category-next" 
        onClick={nextCategories} 
        disabled={categoryIndex >= categories.length - categoriesPerView}
      >
        <FiChevronRight size={40} color="black" />
      </button>
    </div>
          <hr />
    {/* BEST SELLERS */}
    <div className="products-container">
    <h2 className="source-sans-bold">Best Sellers</h2>
        <div className="products-slider">
          <div
            className="products-wrapper"
            style={{
              transform: `translateX(-${productShiftPercentage}%)`,
              transition: "transform 0.5s ease-in-out",
            }}
          >
            {products.map((product, index) => (
              
              <div key={index} className="grid-item" >
                 <div className="item-actions">
                    <button 
                      className={`favorite-btn ${favorites[index] ? 'active' : ''}`}
                      onClick={() => toggleFavorite(index)}
                    >
                      {favorites[index] ? 
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
                <div class="grid-item-header">
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
            ))}
          </div>
        </div>
        <button 
          className="prev-button" 
          onClick={prevProducts}
          disabled={!canGoPrev}
        >
          <FiChevronLeft size={40} color="black" />
        </button>
        <button 
          className="next-button" 
          onClick={nextProducts}
          disabled={!canGoNext}
        >
          <FiChevronRight size={40} color="black" />
        </button>
      </div>
            <hr />
      {/* PUBLISHERS */}
      <div className="category-container">
        <h2 className="source-sans-bold">Publishers</h2>
        <div className="category-slider">
          <div
            className="category-wrapper"
            style={{
              transform: `translateX(-${categoryIndex * (100 / categoriesPerView)}%)`,
              transition: "transform 0.5s ease-in-out",
            }}
          >
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
      


      <button 
        className="category-nav category-prev" 
        onClick={prevCategories} 
        disabled={categoryIndex === 0}
      >
        <FiChevronLeft size={40} color="black" />
      </button>

      <button 
        className="category-nav category-next" 
        onClick={nextCategories} 
        disabled={categoryIndex >= categories.length - categoriesPerView}
      >
        <FiChevronRight size={40} color="black" />
      </button>
    </div>

    </div>
    </div>
  );
};

export default HomePage;