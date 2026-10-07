import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { capitalize, formatDate } from '../utils/helpers';

const roleNotes = {
  user: 'You can browse, use the cart, place orders and write reviews.',
  moderator: 'You can also add and edit products from the Manage section.',
  admin: 'You have full access: products, orders and users in the Manage section.',
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container page">
      <div className="page-header">
        <h1>My profile</h1>
      </div>

      <section className="panel profile-panel">
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
        <p className="panel-note">
          Profile details are read from your account. To change your name, email or password, ask an administrator.
        </p>

        <button className="btn btn-outline" onClick={handleLogout}>
          Log out
        </button>
      </section>
    </div>
  );
};

export default Profile;
