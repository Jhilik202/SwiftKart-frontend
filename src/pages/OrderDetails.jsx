import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrderById } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Message from '../components/Message';
import { capitalize, formatDate, formatPrice, shortId } from '../utils/helpers';

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getOrderById(id)
      .then((response) => {
        if (!cancelled) setOrder(response.data);
      })
      .catch((err) => {
        if (cancelled) return;
        // 403 means the order belongs to another user, 404 means it does not exist
        setError(err.status === 403 ? 'You can only view your own orders.' : err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container page">
        <Loading text="Loading order..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <Message type="error">{error}</Message>
        <Link to="/orders" className="btn btn-outline">
          Back to my orders
        </Link>
      </div>
    );
  }

  const address = order.shippingAddress;

  return (
    <div className="container page">
      {location.state?.justPlaced && <Message type="success">Your order was placed successfully. Thank you for shopping with us.</Message>}

      <div className="page-header">
        <h1>Order #{shortId(order._id)}</h1>
        <p>Placed on {formatDate(order.createdAt)}</p>
      </div>

      <div className="order-detail-layout">
        <section className="panel">
          <h2>Items</h2>
          <ul className="order-lines">
            {order.items.map((item) => (
              <li key={item.product}>
                <div>
                  <Link to={`/products/${item.product}`}>{item.name}</Link>
                  <span>
                    {formatPrice(item.price)} x {item.quantity}
                  </span>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="order-total-row">
            <span>Total</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
        </section>

        <aside className="order-side">
          <section className="panel">
            <h2>Status</h2>
            <p>
              Order: <span className={`badge badge-${order.orderStatus}`}>{capitalize(order.orderStatus)}</span>
            </p>
            <p>
              Payment: <span className={`badge badge-pay-${order.paymentStatus}`}>{capitalize(order.paymentStatus)}</span>
            </p>
            <p className="panel-note">Method: {capitalize(order.paymentMethod)}</p>
          </section>

          <section className="panel">
            <h2>Shipping to</h2>
            <address>
              {address.fullName}
              <br />
              {address.street}
              <br />
              {address.city}
              {address.state ? `, ${address.state}` : ''} {address.postalCode}
              <br />
              {address.country}
              <br />
              Phone: {address.phone}
            </address>
          </section>

          {isAdmin && order.user && (
            <section className="panel">
              <h2>Customer</h2>
              <p>
                {order.user.name}
                <br />
                {order.user.email}
              </p>
            </section>
          )}
        </aside>
      </div>

      <Link to={isAdmin ? '/admin/orders' : '/orders'} className="btn btn-outline">
        Back to orders
      </Link>
    </div>
  );
};

export default OrderDetails;
