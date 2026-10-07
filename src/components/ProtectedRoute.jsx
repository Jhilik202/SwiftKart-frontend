import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

// <ProtectedRoute>                          -> any logged-in user
// <ProtectedRoute roles={['admin']}>        -> only these roles
// This only controls what the UI shows. The backend still enforces real permissions.
const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading text="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>You do not have access to this page</h2>
          <p>Your account role ({role}) cannot open this section.</p>
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
