import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import ProductGrid, { ProductSkeletons } from '../components/ProductGrid';
import EmptyState from '../components/EmptyState';
import { SearchX } from 'lucide-react';
import Pagination from '../components/Pagination';
import Message from '../components/Message';
import { CATEGORIES, capitalize } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

const PAGE_SIZE = 12;

// The URL holds the filters (/products?category=books&page=2), so results can be shared and the back button works.
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const [form, setForm] = useState({ search, minPrice, maxPrice });
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Keep the form in sync when the URL changes (for example from a home page link)
  useEffect(() => {
    setForm({ search, minPrice, maxPrice });
  }, [search, minPrice, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getProducts({
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page,
      limit: PAGE_SIZE,
    })
      .then((response) => {
        if (cancelled) return;
        setProducts(response.data);
        setPagination(response.pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        setProducts([]);
        setPagination(null);
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, category, minPrice, maxPrice, sort, page]);

  // Merge changes into the URL and drop empty values
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    updateParams({
      search: form.search.trim(),
      minPrice: form.minPrice,
      maxPrice: form.maxPrice,
      page: '',
    });
  };

  const handleClear = () => {
    setSearchParams({});
  };

  const hasFilters = search || category || minPrice || maxPrice || sort !== 'newest';

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Products</h1>
        {pagination && !loading && (
          <p>
            {pagination.total} product{pagination.total === 1 ? '' : 's'} found
          </p>
        )}
      </div>

      <div className="products-layout">
        <aside className="filters">
          <form onSubmit={handleFilterSubmit}>
            <div className="form-group">
              <label htmlFor="search">Search</label>
              <input id="search" name="search" type="search" value={form.search} onChange={handleChange} placeholder="Name, brand or description" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minPrice">Min price</label>
                <input id="minPrice" name="minPrice" type="number" min="0" value={form.minPrice} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="maxPrice">Max price</label>
                <input id="maxPrice" name="maxPrice" type="number" min="0" value={form.maxPrice} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Apply filters
            </button>
          </form>

          <div className="form-group filters-block">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(event) => updateParams({ category: event.target.value, page: '' })}>
              <option value="">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {capitalize(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(event) => updateParams({ sort: event.target.value === 'newest' ? '' : event.target.value, page: '' })}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button type="button" className="btn btn-outline btn-block" onClick={handleClear}>
              Clear all filters
            </button>
          )}
        </aside>

        <div className="products-results">
          {loading && <ProductSkeletons count={PAGE_SIZE} />}

          {!loading && error && <Message type="error">Unable to load products. {error}</Message>}

          {!loading && !error && products.length === 0 && (
            <EmptyState icon={SearchX} title="No products found" text="Try a different search or remove some filters.">
              {hasFilters && (
                <button className="btn btn-primary" onClick={handleClear}>
                  Clear all filters
                </button>
              )}
            </EmptyState>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <ProductGrid products={products} />
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onChange={(newPage) => {
                  updateParams({ page: newPage === 1 ? '' : String(newPage) });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
