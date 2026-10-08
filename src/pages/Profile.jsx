import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, KeyRound, LogOut, Upload, X } from 'lucide-react';
import { changePassword, uploadProfileImage } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Message from '../components/Message';
import { capitalize, checkImageFile, formatDate } from '../utils/helpers';

const MAX_IMAGE_MB = 2; // same limit as the backend

const roleNotes = {
  user: 'You can browse, use the cart, place orders and write reviews.',
  moderator: 'You can also add and edit products from the Manage section.',
  admin: 'You have full access: products, orders and users in the Admin section.',
};

const Profile = () => {
  const { user, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile picture
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pictureMessage, setPictureMessage] = useState({ type: '', text: '' });

  // Password
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Free the temporary preview URL when it is replaced or the page closes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const problem = checkImageFile(file, MAX_IMAGE_MB);
    if (problem) {
      clearSelection();
      setPictureMessage({ type: 'error', text: problem });
      return;
    }

    setPictureMessage({ type: '', text: '' });
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    setUploading(true);
    setPictureMessage({ type: '', text: '' });

    try {
      const response = await uploadProfileImage(selectedFile);
      updateCurrentUser(response.data); // the picture shows everywhere straight away
      clearSelection();
      setPictureMessage({ type: 'success', text: 'Your profile picture was updated.' });
    } catch (err) {
      setPictureMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = (event) => {
    setPasswords({ ...passwords, [event.target.name]: event.target.value });
  };

  // Same rules as the backend, checked first for quick feedback
  const validatePasswords = () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword) return 'Enter your current password.';
    if (newPassword.length < 6) return 'The new password must be at least 6 characters.';
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return 'The new password must contain at least one letter and one number.';
    }
    if (newPassword !== confirmPassword) return 'The new password and confirmation do not match.';
    if (newPassword === currentPassword) return 'The new password must be different from the current one.';
    return '';
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const problem = validatePasswords();
    if (problem) {
      setPasswordMessage({ type: 'error', text: problem });
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage({ type: 'success', text: 'Your password was changed. Use the new password the next time you log in.' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container page">
      <div className="page-header">
        <h1>My profile</h1>
        <p>Manage your picture, password and account details.</p>
      </div>

      <div className="profile-layout">
        <section className="panel profile-picture-panel">
          <h2>Profile picture</h2>

          <div className="profile-picture">
            <Avatar user={user} size="lg" previewUrl={previewUrl} />
          </div>

          <Message type={pictureMessage.type || 'info'}>{pictureMessage.text}</Message>

          <input
            ref={fileInputRef}
            id="profileImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="visually-hidden"
          />

          {!selectedFile && (
            <label htmlFor="profileImage" className="btn btn-outline btn-block file-button">
              <Camera size={18} aria-hidden="true" />
              {user.profileImage ? 'Change picture' : 'Upload picture'}
            </label>
          )}

          {selectedFile && (
            <div className="picture-actions">
              <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                <Upload size={16} aria-hidden="true" />
                {uploading ? 'Uploading...' : 'Save picture'}
              </button>
              <button className="btn btn-outline" onClick={clearSelection} disabled={uploading}>
                <X size={16} aria-hidden="true" />
                Cancel
              </button>
            </div>
          )}

          <small className="form-hint">JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB.</small>
        </section>

        <div className="profile-main">
          <section className="panel">
            <h2>Account details</h2>
            <dl className="profile-list">
              <div>
                <dt>Name</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>
                  <span className={`badge badge-role-${user.role}`}>{capitalize(user.role)}</span>
                </dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
            <p className="panel-note">{roleNotes[user.role]}</p>
          </section>

          <section className="panel">
            <h2>
              <KeyRound size={20} aria-hidden="true" className="heading-icon" />
              Change password
            </h2>

            <Message type={passwordMessage.type || 'info'}>{passwordMessage.text}</Message>

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current password</label>
                <input id="currentPassword" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} autoComplete="current-password" required />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New password</label>
                <input id="newPassword" name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} autoComplete="new-password" required />
                <small className="form-hint">At least 6 characters, with a letter and a number.</small>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordChange} autoComplete="new-password" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                {passwordSaving ? 'Saving...' : 'Change password'}
              </button>
            </form>
          </section>

          <button className="btn btn-outline" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
