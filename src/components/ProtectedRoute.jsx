import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';
import EmptyState from './EmptyState';
import { ShieldAlert } from 'lucide-react';

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
        <EmptyState
          icon={ShieldAlert}
          title="You do not have access to this page"
          text={`Your account role (${role}) cannot open this section.`}
        >
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
        </EmptyState>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
