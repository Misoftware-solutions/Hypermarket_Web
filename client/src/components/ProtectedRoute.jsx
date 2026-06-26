import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute - Guards admin routes.
 * Checks sessionStorage for a logged-in user with role 'admin'.
 * Redirects to /login if not authenticated or not an admin.
 */
const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const userString = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('token');

  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
