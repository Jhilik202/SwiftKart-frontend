import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../api/orderApi';
import Loading from '../components/Loading';
import Message from '../components/Message';
import Pagination from '../components/Pagination';
import {
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  PAYMENT_STATUSES,
  capitalize,
  formatDate,
  formatPrice,
  shortId,
} from '../utils/helpers';

// One table row with its own status dropdowns
const OrderRow = ({ order, onSaved, onError }) => {
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [saving, setSaving] = useState(false);

  // The current status plus the statuses the backend allows next
  const orderStatusOptions = [order.orderStatus, ...ORDER_TRANSITIONS[order.orderStatus]];

  const changed = orderStatus !== order.orderStatus || paymentStatus !== order.paymentStatus;

  const handleSave = async () => {
    if (orderStatus === 'cancelled' && orderStatus !== order.orderStatus) {
      if (!window.confirm('Cancel this order? The stock will be returned to the products.')) return;
    }

    const body = {};
    if (orderStatus !== order.orderStatus) body.orderStatus = orderStatus;
    if (paymentStatus !== order.paymentStatus) body.paymentStatus = paymentStatus;

    setSaving(true);
    try {
      await updateOrderStatus(order._id, body);
      await onSaved(`Order #${shortId(order._id)} updated.`);
    } catch (err) {
      onError(err.message);
      setSaving(false);
    }
  };

  return (
    <tr>
      <td>
        <Link to={`/orders/${order._id}`}>#{shortId(order._id)}</Link>
      </td>
      <td>
        {order.user ? order.user.name : 'Deleted user'}
        {order.user && <span className="table-sub">{order.user.email}</span>}
      </td>
      <td>{formatDate(order.createdAt)}</td>
      <td>{formatPrice(order.totalAmount)}</td>
      <td>
        <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} aria-label="Order status" disabled={orderStatusOptions.length === 1}>
          {orderStatusOptions.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} aria-label="Payment status">
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </td>
      <td>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!changed || saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
};

const AdminOrders = () => {
  const [page, setPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllOrders({
        orderStatus: orderStatusFilter,
        paymentStatus: paymentStatusFilter,
        page,
        limit: 10,
      });
      setOrders(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderStatusFilter, paymentStatusFilter, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSaved = async (text) => {
    setError('');
    setNotice(text);
    await loadOrders();
  };

  const handleError = (text) => {
    setNotice('');
    setError(text);
  };

  return (
    <div className="container page">
      <div className="page-header">
        <p className="breadcrumb">
          <Link to="/admin">Dashboard</Link> / Orders
        </p>
        <h1>Manage orders</h1>
      </div>

      <Message type="success">{notice}</Message>

      <div className="toolbar">
        <select
          value={orderStatusFilter}
          onChange={(event) => {
            setOrderStatusFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by order status"
        >
          <option value="">All order statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
        <select
          value={paymentStatusFilter}
          onChange={(event) => {
            setPaymentStatusFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by payment status"
        >
          <option value="">All payment statuses</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </div>

      {loading && <Loading text="Loading orders..." />}
      {!loading && error && <Message type="error">{error}</Message>}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>Orders will appear here when customers check out.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Order status</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow key={`${order._id}-${order.updatedAt}`} order={order} onSaved={handleSaved} onError={handleError} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-note">
            Orders move forward only: pending, confirmed, processing, shipped, delivered. Cancelled and delivered orders are final.
          </p>
          <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminOrders;
