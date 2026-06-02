import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { 
  Users, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ShieldAlert,
  Inbox
} from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Password reset modal states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [submittingReset, setSubmittingReset] = useState(false);
  const [resetError, setResetError] = useState('');

  // Password hash visibility state (dict of userId -> bool)
  const [visibleHashes, setVisibleHashes] = useState({});

  // Copy indicator state (dict of userId -> bool or stringId -> bool)
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/auth/users');
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users list:', err);
      setError('Failed to load user management panel');
      setLoading(false);
    }
  };

  const handleToggleHash = (userId) => {
    setVisibleHashes(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openResetModal = (user) => {
    setUserToReset(user);
    setNewPassword('');
    setResetError('');
    setResetModalOpen(true);
  };

  const closeResetModal = () => {
    setResetModalOpen(false);
    setUserToReset(null);
    setNewPassword('');
    setResetError('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }

    setSubmittingReset(true);
    try {
      await API.put(`/auth/users/${userToReset._id}/password`, {
        password: newPassword
      });
      toast.success(`Password for ${userToReset.name} reset successfully!`);
      closeResetModal();
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error resetting password:', err);
      setResetError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmittingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center border border-rose-500/20 max-w-lg mx-auto">
        <ShieldAlert className="mx-auto text-rose-400 mb-2 animate-bounce" size={32} />
        <h3 className="text-lg font-bold text-slate-100">Access Error</h3>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="text-brand-500" />
          Credentials & User Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review MongoDB User IDs, inspect active Bcrypt password hashes, and override credentials.
        </p>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-sm font-bold text-slate-200">Registered System Accounts ({users.length})</h3>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">MongoDB User ID</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4">Bcrypt Password Hash</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {users.map((u) => {
                  const isHashVisible = visibleHashes[u._id];
                  return (
                    <tr key={u._id} className="hover:bg-white/[0.005] transition-colors">
                      {/* Name / Email */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200">{u.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
                      </td>
                      
                      {/* User ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                          <span>{u._id}</span>
                          <button
                            onClick={() => handleCopy(u._id, u._id)}
                            className="p-1 text-slate-500 hover:text-slate-200 transition-colors rounded hover:bg-white/5"
                            title="Copy User ID"
                          >
                            {copiedId === u._id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                          u.role === 'Admin' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Bcrypt Hash display */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 truncate block max-w-[150px]">
                            {isHashVisible 
                              ? u.password 
                              : '••••••••••••••••••••••••••••••••••••'}
                          </span>
                          <button
                            onClick={() => handleToggleHash(u._id)}
                            className="p-1 text-slate-500 hover:text-slate-200 transition-colors rounded hover:bg-white/5"
                            title={isHashVisible ? "Hide password hash" : "Show password hash"}
                          >
                            {isHashVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          {isHashVisible && (
                            <button
                              onClick={() => handleCopy(u.password, `${u._id}-hash`)}
                              className="p-1 text-slate-500 hover:text-slate-200 transition-colors rounded hover:bg-white/5"
                              title="Copy Bcrypt Hash"
                            >
                              {copiedId === `${u._id}-hash` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions (Reset Password button) */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResetModal(u)}
                          className="flex items-center gap-1 ml-auto text-xs"
                        >
                          <Key size={12} />
                          Override Creds
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Inbox size={32} className="opacity-40 animate-pulse" />
            <p className="text-sm font-medium">No registered system accounts found.</p>
          </div>
        )}
      </div>

      {/* OVERRIDE CREDENTIALS MODAL */}
      <Modal
        isOpen={resetModalOpen}
        onClose={closeResetModal}
        title="Override User Password"
        size="sm"
      >
        {userToReset && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1">
              <h4 className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert size={12} />
                Caution: Security Override
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are about to force-update the login password for account: 
                <span className="font-bold text-slate-100 block mt-1">{userToReset.name} ({userToReset.email})</span>
              </p>
            </div>

            <Input
              label="New Plaintext Password"
              type="password"
              name="newPassword"
              placeholder="Enter new password (min 6 chars)..."
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (resetError) setResetError('');
              }}
              error={resetError}
              required
              autoFocus
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={closeResetModal} disabled={submittingReset}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" type="submit" loading={submittingReset}>
                Save Password Override
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UsersList;
