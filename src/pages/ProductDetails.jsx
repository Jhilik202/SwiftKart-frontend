import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../api/productApi';
import { createReview, deleteReview, getReviews, updateReview } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating, { StarInput } from '../components/StarRating';
import ProductImage from '../components/ProductImage';
import Loading from '../components/Loading';
import Message from '../components/Message';
import { capitalize, formatDate, formatPrice } from '../utils/helpers';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState({ type: '', text: '' });

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

  const loadReviews = useCallback(async () => {
    try {
      const response = await getReviews(id, { limit: 100 });
      setReviews(response.data);
    } catch (err) {
      setReviewMessage({ type: 'error', text: `Unable to load reviews. ${err.message}` });
    }
  }, [id]);

  const loadProduct = useCallback(async () => {
    const response = await getProductById(id);
    setProduct(response.data);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setActiveImage(0);
    setQuantity(1);

    getProductById(id)
      .then((response) => {
        if (cancelled) return;
        setProduct(response.data);
        loadReviews();
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
  }, [id, loadReviews]);

  // The logged-in user's own review (the backend allows only one per product)
  const myReview = isAuthenticated ? reviews.find((review) => review.user && review.user._id === user._id) : null;
  const showReviewForm = isAuthenticated && (!myReview || editing);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setAdding(true);
    setCartMessage({ type: '', text: '' });

    try {
      await addItem(product._id, quantity);
      setCartMessage({ type: 'success', text: `Added ${quantity} to your cart.` });
    } catch (err) {
      setCartMessage({ type: 'error', text: err.message });
    } finally {
      setAdding(false);
    }
  };

  const startEditing = () => {
    setRating(myReview.rating);
    setComment(myReview.comment || '');
    setEditing(true);
    setReviewMessage({ type: '', text: '' });
  };

  const cancelEditing = () => {
    setEditing(false);
    setRating(0);
    setComment('');
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (rating < 1) {
      setReviewMessage({ type: 'error', text: 'Choose a rating from 1 to 5 stars.' });
      return;
    }

    setReviewSaving(true);
    setReviewMessage({ type: '', text: '' });

    try {
      if (editing && myReview) {
        await updateReview(id, myReview._id, { rating, comment });
        setReviewMessage({ type: 'success', text: 'Your review was updated.' });
      } else {
        await createReview(id, { rating, comment });
        setReviewMessage({ type: 'success', text: 'Your review was added.' });
      }
      setEditing(false);
      setRating(0);
      setComment('');
      await Promise.all([loadReviews(), loadProduct()]); // the product's average rating changes too
    } catch (err) {
      setReviewMessage({ type: 'error', text: err.message });
    } finally {
      setReviewSaving(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!window.confirm('Delete your review?')) return;

    try {
      await deleteReview(id, myReview._id);
      setReviewMessage({ type: 'success', text: 'Your review was deleted.' });
      await Promise.all([loadReviews(), loadProduct()]);
    } catch (err) {
      setReviewMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <Loading text="Loading product..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <Message type="error">Unable to load this product. {error}</Message>
        <Link to="/products" className="btn btn-outline">
          Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock < 1;
  const images = product.images && product.images.length > 0 ? product.images : [null];

  return (
    <div className="container page">
      <p className="breadcrumb">
        <Link to="/products">Products</Link> / {capitalize(product.category)}
      </p>

      <div className="details-layout">
        <div className="gallery">
          <div className="gallery-main">
            <ProductImage product={product} index={activeImage} alt={product.name} width={1000} />
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === activeImage ? 'thumb thumb-active' : 'thumb'}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                >
                  <ProductImage product={product} index={index} alt="" width={160} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="details-info">
          <span className="product-category">{capitalize(product.category)}</span>
          <h1>{product.name}</h1>
          {product.brand && <p className="details-brand">by {product.brand}</p>}

          <StarRating value={product.ratings?.average || 0} count={product.ratings?.count || 0} />

          <p className="details-price">{formatPrice(product.price)}</p>

          <p className={outOfStock ? 'stock stock-out' : product.stock <= 5 ? 'stock stock-low' : 'stock stock-in'}>
            {outOfStock ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : `In stock (${product.stock} available)`}
          </p>

          <p className="details-description">{product.description}</p>

          {!outOfStock && (
            <div className="details-buy">
              <div className="quantity">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                  -
                </button>
                <span aria-live="polite">{quantity}</span>
                <button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button className="btn btn-primary" onClick={handleAddToCart} disabled={adding}>
                {adding ? 'Adding...' : 'Add to cart'}
              </button>
            </div>
          )}

          <Message type={cartMessage.type || 'info'}>{cartMessage.text}</Message>
          {cartMessage.type === 'success' && (
            <Link to="/cart" className="section-link">
              Go to cart
            </Link>
          )}
        </div>
      </div>

      <section className="reviews">
        <h2>Customer reviews</h2>

        <Message type={reviewMessage.type || 'info'}>{reviewMessage.text}</Message>

        {!isAuthenticated && (
          <p className="reviews-note">
            <Link to="/login" state={{ from: location }}>
              Log in
            </Link>{' '}
            to write a review.
          </p>
        )}

        {myReview && !editing && (
          <div className="review-own-note">
            You reviewed this product.
            <button className="btn btn-outline btn-sm" onClick={startEditing}>
              Edit review
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleReviewDelete}>
              Delete review
            </button>
          </div>
        )}

        {showReviewForm && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3>{editing ? 'Edit your review' : 'Write a review'}</h3>
            <div className="form-group">
              <label>Your rating</label>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <div className="form-group">
              <label htmlFor="comment">Comment (optional)</label>
              <textarea id="comment" rows="3" maxLength="1000" value={comment} onChange={(event) => setComment(event.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={reviewSaving}>
                {reviewSaving ? 'Saving...' : editing ? 'Save changes' : 'Submit review'}
              </button>
              {editing && (
                <button type="button" className="btn btn-outline" onClick={cancelEditing}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="empty-state empty-state-small">
            <p>No reviews yet. Be the first to review this product.</p>
          </div>
        ) : (
          <ul className="review-list">
            {reviews.map((review) => (
              <li key={review._id} className="review-item">
                <div className="review-head">
                  <strong>{review.user ? review.user.name : 'Deleted user'}</strong>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                <StarRating value={review.rating} />
                {review.comment && <p>{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ProductDetails;
