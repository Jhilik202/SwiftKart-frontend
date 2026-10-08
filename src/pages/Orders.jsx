import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orderApi';
import Loading from '../components/Loading';
import Message from '../components/Message';
import EmptyState from '../components/EmptyState';
import { PackageSearch } from 'lucide-react';
import Pagination from '../components/Pagination';
import { capitalize, formatDate, formatPrice, shortId } from '../utils/helpers';

const Orders = () => {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getMyOrders({ page, limit: 10 })
      .then((response) => {
        if (cancelled) return;
        setOrders(response.data);
        setPagination(response.pagination);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="container page">
      <div className="page-header">
        <h1>My orders</h1>
      </div>

      {loading && <Loading text="Loading your orders..." />}
      {!loading && error && <Message type="error">Unable to load your orders. {error}</Message>}

      {!loading && !error && orders.length === 0 && (
        <EmptyState icon={PackageSearch} title="No orders yet" text="Your orders will appear here after you check out.">
          <Link to="/products" className="btn btn-primary">
            Start shopping
          </Link>
        </EmptyState>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order._id} className="order-card">
                <div>
                  <strong>Order #{shortId(order._id)}</strong>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  <span className="order-items-count">
                    {order.items.length} product{order.items.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="order-badges">
                  <span className={`badge badge-${order.orderStatus}`}>{capitalize(order.orderStatus)}</span>
                  <span className={`badge badge-pay-${order.paymentStatus}`}>Payment {order.paymentStatus}</span>
                </div>
                <strong className="order-total">{formatPrice(order.totalAmount)}</strong>
                <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                  View details
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Orders;
