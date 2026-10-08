import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const NotFound = () => (
  <div className="container page">
    <EmptyState icon={FileQuestion} title="Page not found" text="The page you are looking for does not exist or was moved.">
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </EmptyState>
  </div>
);

export default NotFound;
