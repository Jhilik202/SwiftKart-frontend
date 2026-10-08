import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import Message from '../components/Message';
import ProductImage from '../components/ProductImage';
import EmptyState from '../components/EmptyState';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

const Cart = () => {
  const { cart, loading, error, refreshCart, updateItem, removeItem, emptyTheCart } = useCart();
  const navigate = useNavigate();

  const [busyProduct, setBusyProduct] = useState('');
  const [actionError, setActionError] = useState('');

  // Always show the newest cart from the backend when the page opens
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const runAction = async (productId, action) => {
    setBusyProduct(productId);
    setActionError('');
    try {
      await action();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyProduct('');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Remove all items from your cart?')) return;
    setActionError('');
    try {
      await emptyTheCart();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const hasUnavailableItem = cart.items.some((item) => !item.available);

  if (loading && cart.items.length === 0) {
    return (
      <div className="container page">
        <Loading text="Loading your cart..." />
      </div>
    );
  }

  if (error && cart.items.length === 0) {
    return (
      <div className="container page">
        <Message type="error">Unable to load your cart. {error}</Message>
        <button className="btn btn-primary" onClick={refreshCart}>
          Try again
        </button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <EmptyState icon={ShoppingCart} title="Your cart is empty" text="Add a few products and they will show up here.">
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Your cart</h1>
        <p>
          {cart.totalItems} item{cart.totalItems === 1 ? '' : 's'}
        </p>
      </div>

      <Message type="error">{actionError}</Message>

      <div className="cart-layout">
        <ul className="cart-list">
          {cart.items.map((item) => {
            const { product } = item;
            const busy = busyProduct === product._id;

            return (
              <li key={product._id} className="cart-item">
                <Link to={`/products/${product._id}`} className="cart-item-image">
                  <ProductImage product={product} alt={product.name} width={200} />
                </Link>

                <div className="cart-item-info">
                  <Link to={`/products/${product._id}`} className="cart-item-name">
                    {product.name}
                  </Link>
                  <span className="cart-item-price">{formatPrice(product.price)} each</span>
                  {!item.available && (
                    <span className="stock stock-out">
                      {product.stock === 0 ? 'Out of stock' : `Only ${product.stock} left. Lower the quantity to continue.`}
                    </span>
                  )}
                </div>

                <div className="quantity">
                  <button
                    type="button"
                    onClick={() => runAction(product._id, () => updateItem(product._id, item.quantity - 1))}
                    disabled={busy || item.quantity <= 1}
                    aria-label={`Decrease quantity of ${product.name}`}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => runAction(product._id, () => updateItem(product._id, item.quantity + 1))}
                    disabled={busy || item.quantity >= product.stock}
                    aria-label={`Increase quantity of ${product.name}`}
                  >
                    +
                  </button>
                </div>

                <strong className="cart-item-subtotal">{formatPrice(item.subtotal)}</strong>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => runAction(product._id, () => removeItem(product._id))}
                  disabled={busy}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="summary">
          <h2>Order summary</h2>
          <dl>
            <div>
              <dt>Items</dt>
              <dd>{cart.totalItems}</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatPrice(cart.totalAmount)}</dd>
            </div>
          </dl>
          <p className="summary-note">The final total is calculated by the server when you place the order.</p>

          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')} disabled={hasUnavailableItem}>
            Go to checkout
          </button>
          <button className="btn btn-outline btn-block" onClick={handleClear}>
            Clear cart
          </button>
          <Link to="/products" className="summary-link">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
