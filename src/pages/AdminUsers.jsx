import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser, getUsers, updateUser } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Message from '../components/Message';
import Pagination from '../components/Pagination';
import { capitalize, formatDate } from '../utils/helpers';

const ROLES = ['user', 'moderator', 'admin'];

const AdminUsers = () => {
  const { user: currentUser } = useAuth();

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUsers({ role: roleFilter, page, limit: 10 });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (user, role) => {
    if (role === user.role) return;
    if (!window.confirm(`Change ${user.name} from ${user.role} to ${role}?`)) return;

    setNotice('');
    setError('');
    try {
      await updateUser(user._id, { role });
      setNotice(`${user.name} is now ${role}.`);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? Their cart and reviews are removed. Their orders are kept.`)) return;

    setNotice('');
    setError('');
    try {
      await deleteUser(user._id);
      setNotice(`${user.name} was deleted.`);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container page">
      <div className="page-header">
        <p className="breadcrumb">
          <Link to="/admin">Dashboard</Link> / Users
        </p>
        <h1>Manage users</h1>
      </div>

      <Message type="success">{notice}</Message>
      <Message type="error">{error}</Message>

      <div className="toolbar">
        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {capitalize(role)}
            </option>
          ))}
        </select>
      </div>

      {loading && <Loading text="Loading users..." />}

      {!loading && users.length === 0 && !error && (
        <div className="empty-state">
          <h3>No users found</h3>
        </div>
      )}

      {!loading && users.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user._id === currentUser._id;

                  return (
                    <tr key={user._id}>
                      <td>
                        {user.name}
                        {isSelf && <span className="table-sub">This is you</span>}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(event) => handleRoleChange(user, event.target.value)}
                          disabled={isSelf}
                          title={isSelf ? 'You cannot change your own role' : ''}
                          aria-label={`Role for ${user.name}`}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {capitalize(role)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(user)}
                          disabled={isSelf}
                          title={isSelf ? 'You cannot delete your own account' : ''}
                        >
                          Delete
                        </button>
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

export default AdminUsers;
