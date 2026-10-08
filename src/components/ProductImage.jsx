import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { optimizeImage } from '../utils/helpers';

// Shows a product image with a loading shimmer.
// If the product has no image, or the image fails to load, a clean placeholder is shown
// (never a broken image icon). The parent decides the size of the box.
const ProductImage = ({ product, index = 0, alt = '', width = 600 }) => {
  const source = product && product.images ? product.images[index] : '';

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Start fresh when another image is shown (for example in the gallery)
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [source]);

  if (!source || failed) {
    return (
      <div className="img-placeholder" role={alt ? 'img' : undefined} aria-label={alt ? `${alt} (no image available)` : undefined}>
        <ImageOff size={28} aria-hidden="true" />
        <span>No image</span>
      </div>
    );
  }

  return (
    <div className="img-frame">
      {!loaded && <div className="img-skeleton" aria-hidden="true"></div>}
      <img
        src={optimizeImage(source, width)}
        alt={alt}
        loading="lazy"
        className={loaded ? 'img-loaded' : ''}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export default ProductImage;
