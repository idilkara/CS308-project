import React, { useState } from 'react';

const ReviewForm = ({ onSubmitReview }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredRating) => {
    setHoverRating(hoveredRating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsSubmitting(true);

    // Create review object
    const newReview = {
      id: Date.now(), // Temporary ID for demo
      rating,
      text: comment,
      userName: name,
      date: new Date().toISOString()
    };

    // Submit the review (would be an API call in a real app)
    setTimeout(() => {
      onSubmitReview(newReview);
      
      // Reset form
      setRating(0);
      setComment('');
      setName('');
      setIsSubmitting(false);
      setSuccess('Thank you for your review!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }, 500);
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
          <label htmlFor="reviewName">Your Name</label>
          <input
            type="text"
            id="reviewName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="reviewComment">Your Review</label>
          <textarea
            id="reviewComment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows="5"
            required
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