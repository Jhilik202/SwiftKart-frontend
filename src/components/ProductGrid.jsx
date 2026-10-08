import ProductCard from './ProductCard';

const ProductGrid = ({ products }) => (
  <div className="product-grid">
    {products.map((product) => (
      <ProductCard key={product._id} product={product} />
    ))}
  </div>
);

// Grey placeholder cards shown while products are loading
export const ProductSkeletons = ({ count = 8 }) => (
  <div className="product-grid" role="status" aria-label="Loading products">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="product-card product-card-skeleton" aria-hidden="true">
        <div className="skeleton-image"></div>
        <div className="product-card-body">
          <span className="skeleton-line skeleton-short"></span>
          <span className="skeleton-line"></span>
          <span className="skeleton-line skeleton-short"></span>
        </div>
      </div>
    ))}
  </div>
);

export default ProductGrid;
