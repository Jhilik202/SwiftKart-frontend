import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import ProductGrid, { ProductSkeletons } from '../components/ProductGrid';
import Message from '../components/Message';
import { CATEGORIES, capitalize } from '../utils/helpers';

const categoryNotes = {
  electronics: 'Phones, audio and gadgets',
  clothing: 'Everyday wear and jackets',
  food: 'Snacks, tea and pantry items',
  books: 'Learn, study and read',
  other: 'Home and desk essentials',
};

const Home = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    // One request: the newest 20 products. Featured = newest 4, popular = best rated of the rest.
    getProducts({ sort: 'newest', limit: 20 })
      .then((response) => {
        if (!cancelled) setProducts(response.data);
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
  }, []);

  const featured = products.slice(0, 4);
  const popular = products
    .slice(4)
    .sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0) || (b.ratings?.count || 0) - (a.ratings?.count || 0))
    .slice(0, 4);

  const handleSearch = (event) => {
    event.preventDefault();
    const text = searchText.trim();
    navigate(text ? `/products?search=${encodeURIComponent(text)}` : '/products');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>Find it, add it, check out in minutes.</h1>
          <p>Search the whole catalogue, keep your cart across visits and follow every order from placed to delivered.</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search for headphones, books, tea..."
              aria-label="Search products"
            />
            <button type="submit" className="btn btn-accent">
              Search products
            </button>
          </form>

          <div className="hero-chips">
            {CATEGORIES.map((category) => (
              <Link key={category} to={`/products?category=${category}`} className="chip">
                {capitalize(category)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-header">
          <h2>Shop by category</h2>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <Link key={category} to={`/products?category=${category}`} className="category-tile">
              <strong>{capitalize(category)}</strong>
              <span>{categoryNotes[category]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-header">
          <h2>Featured products</h2>
          <Link to="/products" className="section-link">
            See all products
          </Link>
        </div>

        {loading && <ProductSkeletons count={4} />}
        {error && <Message type="error">Unable to load products. {error}</Message>}
        {!loading && !error && featured.length === 0 && (
          <div className="empty-state">
            <h3>No products yet</h3>
            <p>Products added by an admin or moderator will appear here.</p>
          </div>
        )}
        {featured.length > 0 && <ProductGrid products={featured} />}
      </section>

      <section className="promo">
        <div className="container promo-inner">
          <div>
            <h2>Two ways to pay</h2>
            <p>
              Choose the demo card for an instantly paid order, or cash on delivery to pay later. Both are simulated, so
              nothing is ever charged.
            </p>
          </div>
          <Link to="/products" className="btn btn-accent">
            Start shopping
          </Link>
        </div>
      </section>

      {popular.length > 0 && (
        <section className="container section">
          <div className="section-header">
            <h2>Popular products</h2>
          </div>
          <ProductGrid products={popular} />
        </section>
      )}
    </>
  );
};

export default Home;
