import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div>
        <strong className="footer-logo">SwiftKart</strong>
        <p>A college MERN stack project: React frontend, Express and MongoDB backend.</p>
      </div>
      <div className="footer-links">
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">My orders</Link>
      </div>
    </div>
    <div className="container footer-bottom">Payments in this project are simulated. No real money is charged.</div>
  </footer>
);

export default Footer;
