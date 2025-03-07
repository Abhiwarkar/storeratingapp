// frontend/src/utils/helpers.js
// Format date to readable string
export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate average rating
  export const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };
  
  // Sort array by field
  export const sortByField = (array, field, ascending = true) => {
    return [...array].sort((a, b) => {
      if (a[field] < b[field]) return ascending ? -1 : 1;
      if (a[field] > b[field]) return ascending ? 1 : -1;
      return 0;
    });
  };
  
  // Filter function for multiple fields
  export const filterByFields = (array, filters) => {
    return array.filter(item => {
      return Object.keys(filters).every(key => {
        if (!filters[key]) return true; // Skip empty filters
        
        const filterValue = filters[key].toLowerCase();
        const itemValue = String(item[key]).toLowerCase();
        
        return itemValue.includes(filterValue);
      });
    });
  };
  
  // Validate email format
  export const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Validate password requirements
  export const isValidPassword = (password) => {
    // 8-16 characters, 1 uppercase, 1 special character
    const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
    return re.test(password);
  };