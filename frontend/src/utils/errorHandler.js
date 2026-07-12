export const extractErrorMessage = (err) => {
  const data = err.response?.data;
  if (!data) return err.message || 'An unexpected error occurred';
  
  if (data.errors && data.errors.length > 0) {
    // Combine the main message with specific validation errors
    const errorsList = data.errors.join(' | ');
    return `${data.message}: ${errorsList}`;
  }
  
  return data.message || 'An unexpected error occurred';
};
