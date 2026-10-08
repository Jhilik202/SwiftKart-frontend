import { useEffect, useState } from 'react';
import { optimizeImage } from '../utils/helpers';

// Round profile picture. Falls back to the user's initials when there is no picture.
// size: "sm" (navbar) or "lg" (profile page)
const Avatar = ({ user, size = 'sm', previewUrl }) => {
  const [failed, setFailed] = useState(false);

  const source = previewUrl || (user && user.profileImage) || '';

  useEffect(() => {
    setFailed(false);
  }, [source]);

  const initials = user && user.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')
    : '?';

  return (
    <span className={`avatar avatar-${size}`}>
      {source && !failed ? (
        <img
          src={previewUrl ? source : optimizeImage(source, size === 'lg' ? 300 : 80)}
          alt={user && user.name ? `${user.name}'s profile picture` : 'Profile picture'}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
};

export default Avatar;
