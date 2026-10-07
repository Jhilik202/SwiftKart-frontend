import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container page">
    <div className="empty-state">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  </div>
);

export default NotFound;
