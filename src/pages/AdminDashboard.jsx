import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { getAllOrders } from '../api/orderApi';
import { getUsers } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Message from '../components/Message';
import { capitalize, formatDate, formatPrice, shortId } from '../utils/helpers';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState({ products: null, orders: null, pending: null, users: null });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Moderators may only read products. Orders and users are admin only in the backend.
      const requests = [getProducts({ limit: 1 })];
      if (isAdmin) {
        requests.push(
          getAllOrders({ limit: 5 }),
          getAllOrders({ orderStatus: 'pending', limit: 1 }),
          getUsers({ limit: 1 })
        );
      }

      const results = await Promise.allSettled(requests);
      if (cancelled) return;

      const total = (result) => (result && result.status === 'fulfilled' ? result.value.pagination.total : null);

      setStats({
        products: total(results[0]),
        orders: total(results[1]),
        pending: total(results[2]),
        users: total(results[3]),
      });

      if (results[1] && results[1].status === 'fulfilled') {
        setRecentOrders(results[1].value.data);
      }

      const failed = results.find((result) => result.status === 'rejected');
      if (failed) setError(failed.reason.message);

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const show = (value) => (value === null ? '-' : value);

  return (
    <div className="container page">
      <div className="page-header">
        <h1>{isAdmin ? 'Admin dashboard' : 'Moderator dashboard'}</h1>
        <p>Signed in as {user.name} ({capitalize(user.role)})</p>
      </div>

      {loading && <Loading text="Loading dashboard..." />}
      {!loading && error && <Message type="error">Some figures could not be loaded. {error}</Message>}

      {!loading && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-value">{show(stats.products)}</span>
              <span className="stat-label">Products</span>
            </div>
            {isAdmin && (
              <>
                <div className="stat-card">
                  <span className="stat-value">{show(stats.orders)}</span>
                  <span className="stat-label">Orders</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{show(stats.pending)}</span>
                  <span className="stat-label">Pending orders</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{show(stats.users)}</span>
                  <span className="stat-label">Users</span>
                </div>
              </>
            )}
          </div>

          <div className="manage-links">
            <Link to="/admin/products" className="manage-card">
              <strong>Manage products</strong>
              <span>{isAdmin ? 'Add, edit, restock and delete products.' : 'Add and edit products and stock.'}</span>
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin/orders" className="manage-card">
                  <strong>Manage orders</strong>
                  <span>Update order and payment status.</span>
                </Link>
                <Link to="/admin/users" className="manage-card">
                  <strong>Manage users</strong>
                  <span>Change roles and remove accounts.</span>
                </Link>
              </>
            )}
          </div>

          {!isAdmin && (
            <Message type="info">Orders and users are managed by administrators. Your role covers products only.</Message>
          )}

          {isAdmin && recentOrders.length > 0 && (
            <section className="panel">
              <h2>Recent orders</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <Link to={`/orders/${order._id}`}>#{shortId(order._id)}</Link>
                        </td>
                        <td>{order.user ? order.user.name : 'Deleted user'}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <span className={`badge badge-${order.orderStatus}`}>{capitalize(order.orderStatus)}</span>
                        </td>
                        <td>{formatPrice(order.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
