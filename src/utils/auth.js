// Simple authentication utility
export const hashPassword = (password) => {
  // In a real app, use bcrypt or similar
  return btoa(password + 'despi_salt_2024');
};

export const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

export const generateSessionToken = () => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('admin_token');
  const expiry = localStorage.getItem('admin_token_expiry');
  
  if (!token || !expiry) return false;
  
  return new Date().getTime() < parseInt(expiry);
};

export const login = (token, expiresIn = 24 * 60 * 60 * 1000) => {
  const expiry = new Date().getTime() + expiresIn;
  localStorage.setItem('admin_token', token);
  localStorage.setItem('admin_token_expiry', expiry.toString());
};

export const logout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_token_expiry');
};