import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

const ReviewForm = ({ onSubmitReview, product_id, fetchProductInfo  }) => {

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
   // Placeholder for actual permission check
  const { token } = useAuth();
  console.log(token);
  console.log(product_id);
  // SUBMIT REVIEW API

  // TODO : DONT ALLOW TO SUBMIT REVIEW IF USER IS NOT LOGGED IN


  // get username from token

    const getUserInfo = async (token) => {
      try {
          const response = await fetch("http://localhost/api/users/userinfo", {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              throw new Error("Invalid token");
          }

          const data = await response.json();
          console.log("User data fetched successfully:", data);

       
         setName (data.name); // Set the username in the state
         console.log("Username set successfully:", data.name);

      
          return data; // Return the fetched data
      } catch (error) {
          console.error("Error fetching user data:", error);
          
          throw error; // Re-throw the error if needed
      }
  };


  if(token != null) {
    getUserInfo(token)
  }

  const addReview = async (token, product_id, rating, comment) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  
    const data = {
      product_id,
      rating,
      comment,
    };
  
    try {
      const response = await fetch("http://localhost/api/reviews/add", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Review added successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to add review:", errorData.message || "Unknown error");
        return { error: errorData.message || "Failed to add review" };
      }
    } catch (error) {
      console.error("Error adding review:", error);
      return { error: "An unexpected error occurred" };
    }
  };

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredRating) => {
    setHoverRating(hoveredRating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    // if (!comment.trim()) {
    //   setError('Please enter a comment');
    //   return;
    // }



    setIsSubmitting(true);

    // Check if token exists
    if (!token) {
      setError('You must be logged in to submit a review');
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit to API
      const result = await addReview(token, product_id, rating, comment);
      
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      
      // Create review object for local display
      const newReview = {
        id: result.id || Date.now(), // Use API ID if available
        rating,
        text: comment,
        userName: name,
        date: new Date().toISOString()
      };

      // Call the parent component's handler
      onSubmitReview(newReview);
      
      // Reset form
      setRating(0);
      setComment('');
      // setName('');
      setSuccess('Thank you for your review!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3 className="section-title">Write a Review</h3>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Rating</label>
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`rating-star ${(hoverRating || rating) >= star ? 'filled' : ''}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => handleRatingHover(star)}
                onMouseLeave={handleRatingLeave}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          {/* <label htmlFor="reviewName">Your Name</label> */}
          You are logged in as {name}
        </div>
        
        <div className="form-group">
          <label htmlFor="reviewComment">Your Review</label>
          <textarea
            id="reviewComment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows="5"
           
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;