export const isAuthenticated = (): boolean => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const expiresAt = localStorage.getItem('expiresAt');

    if (!accessToken || !refreshToken || !expiresAt) {
      return false;
    }

    const currentTime = Date.now();
    const tokenExpiresAt = parseInt(expiresAt);

    return currentTime < tokenExpiresAt;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const hasRole = (requiredRole: string): boolean => {
  const user = getCurrentUser();
  return user?.role === requiredRole;
};

export const hasAnyRole = (requiredRoles: string[]): boolean => {
  const user = getCurrentUser();
  return requiredRoles.includes(user?.role);
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('expiresIn');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('user');
};
