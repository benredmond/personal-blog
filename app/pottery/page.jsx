'use client';

import { useState } from 'react';
import './pottery.css';

export default function PotteryCommissionPage() {
  const [formData, setFormData] = useState({
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (formData.message.length < 10) {
      newErrors.message = 'Tell me a bit more about what you\'re imagining';
    } else if (formData.message.length > 1000) {
      newErrors.message = 'Please keep it under 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Temporary: just log to console (MongoDB integration next sprint)
    console.log('Form submission:', {
      ...formData,
      timestamp: new Date().toISOString()
    });

    // Simulate button state change
    setTimeout(() => {
      // Wait for fade out animation before showing confirmation
      setTimeout(() => {
        setIsSubmitted(true);
      }, 500); // Match fade-out duration
    }, 100);
  };

  const handleInputChange = (value) => {
    setFormData({ message: value });
    // Clear error when user starts typing
    if (errors.message) {
      setErrors({});
    }
  };

  return (
    <div className="pottery-page">
      {!isSubmitted ? (
        <>
          {/* Top Illustration - Floating planter with succulent */}
          <div className="illustration-top">
            <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Planter pot - organic trapezoid with wobbles */}
              <path d="M 29 66 C 30 66.5, 31 66.8, 32 67.5 L 34 90 C 34.5 95, 35 105, 36 115 C 36.2 116, 36.5 116.5, 37 116.8 L 63 116.5 C 64 116.3, 64.5 115.8, 65 115 C 66 105, 66.5 95, 67 90 L 70 67.5 C 70.5 67, 71 66.5, 71 66 Z" stroke="#B8704F" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Planter rim - wobbly ellipse */}
              <path d="M 30 65 C 32 66.5, 38 68, 50 68 C 62 68, 68 66.5, 70 65 C 68 63.5, 62 62, 50 62 C 38 62, 32 63.5, 30 65" stroke="#B8704F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Succulent leaves - organic curves */}
              <path d="M 39 58 C 38 55, 35 48, 35 42 C 35 38, 36 34, 38 32 C 39 33, 40 36, 41 40" stroke="#B8704F" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
              <path d="M 48 54 C 48 50, 48 42, 48 35 C 48 30, 48.5 25, 50 22 C 51 24, 51.5 28, 52 34" stroke="#B8704F" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
              <path d="M 61 58 C 62 55, 65 48, 65 42 C 65 38, 64 34, 62 32 C 61 33, 60 36, 59 40" stroke="#B8704F" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
              {/* Succulent center - organic blob */}
              <path d="M 42 48 C 42 44, 44 40, 50 40 C 56 40, 58 44, 58 48 C 58 53, 55 56, 50 56 C 45 56, 42 53, 42 48" stroke="#B8704F" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Form Container */}
          <div className="pottery-container">
            <form onSubmit={handleSubmit} className={`pottery-form ${isSubmitting ? 'submitting' : ''}`} aria-label="Pottery commission request form">
              <h1 className="pottery-heading">Let's make something together.</h1>

              <label htmlFor="pottery-message" className="pottery-label">What's the form? What's the vibe?</label>
              <textarea
                id="pottery-message"
                value={formData.message}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`pottery-textarea ${errors.message ? 'error' : ''}`}
                placeholder="A small bowl, earthy and minimal..."
                aria-label="Describe your pottery commission idea"
              />
              {errors.message && <span className="error-message">{errors.message}</span>}

              <button
                type="submit"
                className="pottery-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending' : 'Let\'s make it'}
              </button>
            </form>
          </div>

          {/* Bottom Illustration - Floating cup at angle */}
          <div className="illustration-bottom">
            <svg width="70" height="60" viewBox="0 0 70 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Cup shadow/base - wobbly */}
              <path d="M 8 55 C 12 56, 22 57, 35 56.8 C 48 56.5, 58 55.5, 62 54.5" stroke="#B8704F" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
              {/* Cup body - organic curves with wobbles */}
              <path d="M 13 54 C 13.5 50, 15 40, 16 32 C 16.5 28, 17 24, 18 22 C 20 19.5, 25 18.5, 35 19 C 45 19.5, 50 20, 52 22 C 53 24, 54 28, 55 32 C 56 40, 57 48, 57.5 54" stroke="#B8704F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Cup rim - wobbly ellipse */}
              <path d="M 18 22 C 20 20.5, 26 19, 35 19 C 44 19, 50 20.5, 52 22 C 50 23, 44 24, 35 24 C 26 24, 20 23, 18 22" stroke="#B8704F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </>
      ) : (
        <div className="pottery-container confirmation-container">
          <div className="confirmation-screen">
            <div className="confirmation-check">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 8 21 C 11 24, 14 27, 17 30 C 21 23, 27 15, 33 9" stroke="#B8704F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>

            <div className="confirmation-text">
              <p>Consider it claimed. Expect a text.</p>
            </div>

            {/* Confirmation Illustration - Organic vase with stems */}
            <div className="illustration-confirmation">
              <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Vase shadow/base - wobbly */}
                <path d="M 10 89 C 15 90, 25 91, 40 90.5 C 55 90, 65 89, 70 88" stroke="#B8704F" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
                {/* Vase body - organic asymmetric curves with wobbles */}
                <path d="M 21 88 C 20 85, 18 78, 17 70 C 16 62, 16 54, 18 46 C 20 38, 24 28, 28 22 C 32 17, 36 15.5, 40 15 C 44 15.5, 48 17, 52 22 C 56 28, 60 38, 62 46 C 64 54, 64 62, 63 70 C 62 78, 60 85, 59 88" stroke="#B8704F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                {/* Vase neck/rim - wobbly */}
                <path d="M 30 16 C 32 14.5, 36 13.5, 40 13.5 C 44 13.5, 48 14.5, 50 16 C 48 17, 44 18, 40 18 C 36 18, 32 17, 30 16" stroke="#B8704F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                {/* Decorative plant stems - organic curves */}
                <path d="M 34 13 C 32 10, 30 7, 31 4 C 32 2, 34 1, 36 2" stroke="#B8704F" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <path d="M 40 12 C 40 9, 40 6, 40 3 C 40 1, 40.5 0, 41 0" stroke="#B8704F" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <path d="M 46 13 C 48 10, 50 7, 49 4 C 48 2, 46 1, 44 2" stroke="#B8704F" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
