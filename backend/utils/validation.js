// backend/utils/validation.js
// Validation utilities for consistent validation across the application

// Validate name length (20-60 characters)
const validateName = (name) => {
    if (!name) {
      return 'Name is required';
    }
    if (name.length < 20) {
      return 'Name must be at least 20 characters';
    }
    if (name.length > 60) {
      return 'Name must be no more than 60 characters';
    }
    return null; // No error
  };
  
  // Validate address length (max 400 characters)
  const validateAddress = (address) => {
    if (!address) {
      return 'Address is required';
    }
    if (address.length > 400) {
      return 'Address must be no more than 400 characters';
    }
    return null; // No error
  };
  
  // Validate email format
  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    
    return null; // No error
  };
  
  // Validate password requirements (8-16 chars, 1 uppercase, 1 special char)
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    
    if (password.length < 8 || password.length > 16) {
      return 'Password must be between 8 and 16 characters';
    }
    
    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    // Check for special character
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    
    return null; // No error
  };
  
  // Validate role
  const validateRole = (role) => {
    if (!role) {
      return 'Role is required';
    }
    
    const validRoles = ['admin', 'user', 'store_owner'];
    if (!validRoles.includes(role)) {
      return 'Invalid role. Role must be one of: admin, user, store_owner';
    }
    
    return null; // No error
  };
  
  // Validate rating value (1-5)
  const validateRating = (rating) => {
    if (rating === undefined || rating === null) {
      return 'Rating is required';
    }
    
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5 || !Number.isInteger(ratingNum)) {
      return 'Rating must be an integer between 1 and 5';
    }
    
    return null; // No error
  };
  
  module.exports = {
    validateName,
    validateAddress,
    validateEmail,
    validatePassword,
    validateRole,
    validateRating
  };