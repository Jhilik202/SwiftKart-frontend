import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import Message from '../components/Message';
import EmptyState from '../components/EmptyState';
import { ShoppingCart } from 'lucide-react';
import { PAYMENT_METHODS, formatPrice } from '../utils/helpers';

const phonePattern = /^[0-9+\-\s]{7,15}$/;

const Checkout = () => {
  const { user } = useAuth();
  const { cart, loading, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user ? user.name : '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('mock_card');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleChange = (event) => {
    setAddress({ ...address, [event.target.name]: event.target.value });
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError('');

    if (!phonePattern.test(address.phone.trim())) {
      setError('Enter a valid phone number (7 to 15 digits).');
      return;
    }

    setSubmitting(true);

    try {
      // No "items" are sent: the backend orders the cart, reads prices from the database
      // and calculates the total itself.
      const response = await createOrder({ shippingAddress: address, paymentMethod });
      await refreshCart(); // the backend emptied the cart
      navigate(`/orders/${response.data._id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.message);
      refreshCart(); // stock may have changed, show the latest cart
      setSubmitting(false);
    }
  };

  if (loading && cart.items.length === 0) {
    return (
      <div className="container page">
        <Loading text="Loading checkout..." />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <EmptyState icon={ShoppingCart} title="Nothing to check out" text="Your cart is empty. Add products first.">
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </EmptyState>
      </div>
    );
  }

  const hasUnavailableItem = cart.items.some((item) => !item.available);

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <Message type="error">{error}</Message>

          <fieldset>
            <legend>Shipping address</legend>

            <div className="form-group">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" value={address.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={address.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="street">Street address</label>
              <input id="street" name="street" value={address.street} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={address.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input id="state" name="state" value={address.state} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="postalCode">Postal code</label>
                <input id="postalCode" name="postalCode" value={address.postalCode} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input id="country" name="country" value={address.country} onChange={handleChange} required />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Payment method</legend>
            {PAYMENT_METHODS.map((method) => (
              <label key={method.value} className={paymentMethod === method.value ? 'radio-option radio-option-active' : 'radio-option'}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span>{method.label}</span>
              </label>
            ))}
            <small className="form-hint">Payments are simulated. No real money is charged.</small>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || hasUnavailableItem}>
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
          {hasUnavailableItem && (
            <p className="form-hint">Some items are out of stock. Update your cart before placing the order.</p>
          )}
        </form>

        <aside className="summary">
          <h2>Order summary</h2>
          <ul className="summary-items">
            {cart.items.map((item) => (
              <li key={item.product._id}>
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatPrice(cart.totalAmount)}</dd>
            </div>
          </dl>
          <p className="summary-note">The server checks stock and calculates the final total when you place the order.</p>
          <Link to="/cart" className="summary-link">
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
