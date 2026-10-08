import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Message from '../components/Message';
import Pagination from '../components/Pagination';
import ProductImage from '../components/ProductImage';
import EmptyState from '../components/EmptyState';
import { CATEGORIES, capitalize, checkImageFile, formatPrice } from '../utils/helpers';

const MAX_IMAGE_MB = 5; // same limit as the backend
const emptyForm = { name: '', description: '', price: '', category: 'electronics', brand: '', stock: '' };

const toForm = (product) => ({
  name: product.name,
  description: product.description,
  price: String(product.price),
  category: product.category,
  brand: product.brand || '',
  stock: String(product.stock),
});

// A FormData is used so the text fields and the image travel in one request.
// Without an image the backend treats it like a normal update and keeps the current image.
const buildFormData = (form, imageFile) => {
  const data = new FormData();
  data.append('name', form.name.trim());
  data.append('description', form.description.trim());
  data.append('price', form.price);
  data.append('category', form.category);
  data.append('brand', form.brand.trim());
  data.append('stock', form.stock);
  if (imageFile) data.append('image', imageFile);
  return data;
};

const AdminProducts = () => {
  const { isAdmin } = useAuth(); // only admins can upload images or delete. Moderators can add and edit text.

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const formFileRef = useRef(null);

  // Quick "change image" button in the table
  const rowFileRef = useRef(null);
  const [rowTarget, setRowTarget] = useState(null);
  const [uploadingId, setUploadingId] = useState('');

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

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (formFileRef.current) formFileRef.current.value = '';
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError('');
    clearImage();
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm(toForm(product));
    setFormError('');
    clearImage();
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
    setFormError('');
    clearImage();
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const problem = checkImageFile(file, MAX_IMAGE_MB);
    if (problem) {
      clearImage();
      setFormError(problem);
      return;
    }

    setFormError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
      const data = buildFormData(form, isAdmin ? imageFile : null);

      if (editingProduct) {
        await updateProduct(editingProduct._id, data);
        setNotice('Product updated.');
      } else {
        await createProduct(data);
        setNotice(imageFile ? 'Product created with its image.' : 'Product created.');
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

  // Table button: pick a file, upload it straight away for that product
  const startRowUpload = (product) => {
    setRowTarget(product);
    if (rowFileRef.current) {
      rowFileRef.current.value = '';
      rowFileRef.current.click();
    }
  };

  const handleRowFile = async (event) => {
    const file = event.target.files[0];
    const product = rowTarget;
    if (!file || !product) return;

    setNotice('');
    setError('');

    const problem = checkImageFile(file, MAX_IMAGE_MB);
    if (problem) {
      setError(`${product.name}: ${problem}`);
      return;
    }

    setUploadingId(product._id);
    try {
      const data = new FormData();
      data.append('image', file);
      await updateProduct(product._id, data);
      setNotice(`Image saved for "${product.name}".`);
      await loadProducts();
    } catch (err) {
      setError(`${product.name}: ${err.message}`);
    } finally {
      setUploadingId('');
      setRowTarget(null);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? Its reviews and image will be deleted too.`)) return;

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

  const currentImage = editingProduct && editingProduct.images && editingProduct.images[0];

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
            <Plus size={18} aria-hidden="true" />
            Add product
          </button>
        )}
      </div>

      <Message type="success">{notice}</Message>
      <Message type="error">{error}</Message>

      {isAdmin && (
        <Message type="info">
          To add pictures to your existing products, use the Image button in each row of the table below.
        </Message>
      )}

      {formOpen && (
        <section className="panel">
          <h2>{editingProduct ? 'Edit product' : 'Add a product'}</h2>
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
                <label htmlFor="stock">Quantity in stock</label>
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
              <label htmlFor="productImage">Product image</label>
              {isAdmin ? (
                <div className="image-upload">
                  <div className="image-upload-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Selected product preview" />
                    ) : currentImage ? (
                      <ProductImage product={editingProduct} alt="Current product image" width={400} />
                    ) : (
                      <div className="img-placeholder">
                        <ImagePlus size={28} aria-hidden="true" />
                        <span>No image yet</span>
                      </div>
                    )}
                  </div>
                  <div className="image-upload-controls">
                    <input
                      ref={formFileRef}
                      id="productImage"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                    />
                    <small className="form-hint">
                      JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB.
                      {editingProduct ? ' Leave empty to keep the current image.' : ''}
                    </small>
                    {imageFile && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={clearImage}>
                        <X size={14} aria-hidden="true" />
                        Remove selected image
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="form-hint">Only admins can upload product images.</p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (imageFile ? 'Uploading and saving...' : 'Saving...') : editingProduct ? 'Save changes' : 'Create product'}
              </button>
              <button type="button" className="btn btn-outline" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Hidden input used by the "Image" buttons in the table */}
      <input ref={rowFileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleRowFile} className="visually-hidden" tabIndex={-1} aria-hidden="true" />

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

      {!loading && !error && products.length === 0 && (
        <EmptyState icon={Plus} title="No products found" text="Add your first product with the Add product button." />
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const hasImage = Boolean(product.images && product.images[0]);

                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-thumb">
                          <ProductImage product={product} alt="" width={120} />
                        </div>
                      </td>
                      <td>
                        <Link to={`/products/${product._id}`}>{product.name}</Link>
                      </td>
                      <td>{capitalize(product.category)}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td className={product.stock === 0 ? 'text-danger' : ''}>{product.stock}</td>
                      <td className="table-actions">
                        {isAdmin && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => startRowUpload(product)}
                            disabled={uploadingId === product._id}
                          >
                            <ImagePlus size={15} aria-hidden="true" />
                            {uploadingId === product._id ? 'Uploading...' : hasImage ? 'Change image' : 'Add image'}
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(product)}>
                          <Pencil size={15} aria-hidden="true" />
                          Edit
                        </button>
                        {isAdmin && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product)}>
                            <Trash2 size={15} aria-hidden="true" />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
