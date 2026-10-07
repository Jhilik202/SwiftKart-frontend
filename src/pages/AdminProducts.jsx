import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Message from '../components/Message';
import Pagination from '../components/Pagination';
import { CATEGORIES, capitalize, formatPrice } from '../utils/helpers';

const emptyForm = { name: '', description: '', price: '', category: 'electronics', brand: '', images: '', stock: '' };

const toForm = (product) => ({
  name: product.name,
  description: product.description,
  price: String(product.price),
  category: product.category,
  brand: product.brand || '',
  images: (product.images || []).join('\n'),
  stock: String(product.stock),
});

const toPayload = (form) => ({
  name: form.name.trim(),
  description: form.description.trim(),
  price: Number(form.price),
  category: form.category,
  brand: form.brand.trim(),
  images: form.images
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
  stock: Number(form.stock),
});

const AdminProducts = () => {
  const { isAdmin } = useAuth(); // moderators can add and edit, only admins can delete

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProducts({ search: appliedSearch, page, limit: 10 });
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreate = () => {
    setEditingId('');
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm(toForm(product));
    setFormError('');
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId('');
    setFormError('');
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (form.price.trim() === '' || Number(form.price) < 0 || Number.isNaN(Number(form.price))) {
      setFormError('Enter a price of zero or more.');
      return;
    }
    if (form.stock.trim() === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setFormError('Stock must be a whole number of zero or more.');
      return;
    }

    setSaving(true);

    try {
      const payload = toPayload(form);
      if (editingId) {
        await updateProduct(editingId, payload);
        setNotice('Product updated.');
      } else {
        await createProduct(payload);
        setNotice('Product created.');
        setPage(1);
      }
      closeForm();
      await loadProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? Its reviews will be deleted too.`)) return;

    setNotice('');
    setError('');
    try {
      await deleteProduct(product._id);
      setNotice('Product deleted.');
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  return (
    <div className="container page">
      <div className="page-header page-header-row">
        <div>
          <p className="breadcrumb">
            <Link to="/admin">Dashboard</Link> / Products
          </p>
          <h1>Manage products</h1>
        </div>
        {!formOpen && (
          <button className="btn btn-primary" onClick={openCreate}>
            Add product
          </button>
        )}
      </div>

      <Message type="success">{notice}</Message>

      {formOpen && (
        <section className="panel">
          <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>
          <Message type="error">{formError}</Message>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description (at least 10 characters)</label>
              <textarea id="description" name="description" rows="3" value={form.description} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (INR)</label>
                <input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Stock</label>
                <input id="stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {capitalize(category)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input id="brand" name="brand" value={form.brand} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="images">Image URLs (one per line)</label>
              <textarea id="images" name="images" rows="3" value={form.images} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create product'}
              </button>
              <button type="button" className="btn btn-outline" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <form className="toolbar" onSubmit={handleSearch}>
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" />
        <button type="submit" className="btn btn-outline">
          Search
        </button>
        {appliedSearch && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setSearch('');
              setAppliedSearch('');
              setPage(1);
            }}
          >
            Clear
          </button>
        )}
      </form>

      {loading && <Loading text="Loading products..." />}
      {!loading && error && <Message type="error">{error}</Message>}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Add your first product with the Add product button.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <Link to={`/products/${product._id}`}>{product.name}</Link>
                    </td>
                    <td>{capitalize(product.category)}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td className={product.stock === 0 ? 'text-danger' : ''}>{product.stock}</td>
                    <td className="table-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(product)}>
                        Edit
                      </button>
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminProducts;
