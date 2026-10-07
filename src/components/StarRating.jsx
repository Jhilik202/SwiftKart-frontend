// Read-only stars. value is a number from 0 to 5.
const StarRating = ({ value = 0, count }) => {
  const rounded = Math.round(value);

  return (
    <span className="stars" aria-label={`Rated ${value} out of 5`}>
      <span className="stars-icons" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rounded ? 'star star-filled' : 'star'}>
            ★
          </span>
        ))}
      </span>
      {count !== undefined && (
        <span className="stars-count">
          {count > 0 ? `${value.toFixed(1)} (${count})` : 'No reviews yet'}
        </span>
      )}
    </span>
  );
};

// Clickable stars used in the review form
export const StarInput = ({ value, onChange }) => (
  <div className="star-input" role="radiogroup" aria-label="Rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        role="radio"
        aria-checked={star === value}
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
        className={star <= value ? 'star-button star-filled' : 'star-button'}
        onClick={() => onChange(star)}
      >
        ★
      </button>
    ))}
  </div>
);

export default StarRating;
