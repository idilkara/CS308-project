import React, { useState, useEffect } from "react";
import "./HomePage.css";
import './styles/root.css';
import leftArrow from "./img/left-arrow.png";
import rightArrow from "./img/right-arrow.png";

const HomePage = () => {
  const banners = [
    { id: 1, text: "Banner 1", },
    { id: 2, text: "Banner 2", },
    { id: 3, text: "Banner 3" }
  ];

  // Sample data 
  const products = [
    { id: 1, name: "Book 1", image: "https://via.placeholder.com/150" },
    { id: 2, name: "Book 2", image: "https://via.placeholder.com/150" },
    { id: 3, name: "Book 3", image: "https://via.placeholder.com/150" },
    { id: 4, name: "Book 4", image: "https://via.placeholder.com/150" },
    { id: 5, name: "Book 5", image: "https://via.placeholder.com/150" },
    { id: 6, name: "Book 6", image: "https://via.placeholder.com/150" },
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

  //categories
    const categories = ["Classics", "Non-Fiction", "Mystery", "Drama", "Science-Fiction", "More..."];
  
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
    //BANNER
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
          <img src={leftArrow} alt="Previous" />
        </button>
        <button className="next-button" onClick={nextBanner}>
          <img src={rightArrow} alt="Next" />
        </button>
      </div>

      {/* SLIDING PRODUCTS */}
      <div className="products-container">
        <h2>New Arrivals</h2>
        <div className="products-slider">
          <div
            className="products-wrapper"
            style={{
              transform: `translateX(-${productShiftPercentage}%)`,
              transition: "transform 0.5s ease-in-out",
            }}
          >
            {products.map((product) => (
              
              <div key={product.id} className="grid-item">
                
                <div className="grid-item-content">
                  <img src={product.image} alt={product.name} />
                
                </div>
                
                <div class="grid-item-header">
                                <h3>Klara and the Sun</h3>
                                <p>Kazuo Ishiguro</p>
                                <span>$19.99</span>
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
          <img src={leftArrow}  />
        </button>
        <button 
          className="next-button" 
          onClick={nextProducts}
          disabled={!canGoNext}
        >
          <img src={rightArrow} />
        </button>
      </div>

      {/* CATERGORIES */}
      <div className="category-container">
      <h2>Categories</h2>
      <div className="category-slider">
        <div
          className="category-wrapper"
          style={{
            transform: `translateX(-${categoryIndex * (100 / categoriesPerView)}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {categories.map((category, index) => (
            <div key={index} className="category-item">
              {category}
            </div>
          ))}
        </div>
      </div>

      <button 
        className="category-nav category-prev" 
        onClick={prevCategories} 
        disabled={categoryIndex === 0}
      >
        <img src={leftArrow} alt="Previous" />
      </button>

      <button 
        className="category-nav category-next" 
        onClick={nextCategories} 
        disabled={categoryIndex >= categories.length - categoriesPerView}
      >
        <img src={rightArrow} alt="Next" />
      </button>
    </div>

    </div>
  );
};

export default HomePage;