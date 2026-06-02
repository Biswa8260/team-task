import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import API from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import Button from '../components/Button';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Check,
  Users
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [activeInvitation, setActiveInvitation] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);

      const unreads = data.filter((n) => n.status === 'Pending');
      setUnreadCount(unreads.length);

      // Trigger invitation modal if Member has a pending invitation
      if (user && user.role === 'Member') {
        const pendingInvite = unreads.find((n) => n.type === 'Invitation');
        if (pendingInvite) {
          setActiveInvitation(pendingInvite);
          setInvitationModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Poll notifications in the background
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return <Spinner fullPage />;
  }

  // Protect routes - redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  if (user && user.role === 'Admin') {
    navigation.push({ name: 'Users', href: '/users', icon: Users });
  }

  navigation.push({ name: 'Profile', href: '/profile', icon: User });

  const handleLogout = () => {
    logout();
  };

  // Invitation Accept/Reject Handler
  const handleInvitationResponse = async (status) => {
    if (!activeInvitation) return;
    try {
      await API.post(`/projects/${activeInvitation.project._id}/invitation-response`, {
        status,
        notificationId: activeInvitation._id,
      });

      toast.success(`Project invitation ${status.toLowerCase()}ed successfully!`);
      setInvitationModalOpen(false);
      setActiveInvitation(null);
      fetchNotifications();

      // Refresh project list if on projects page to reflect changes
      if (window.location.pathname === '/projects' || window.location.pathname === '/dashboard') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, status: 'Read' } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 glass-panel border-r border-white/5 transition-transform duration-300 transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 border border-brand-500/30">
              <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-wider uppercase text-slate-100">TeamTask</span>
          </Link>
          <button className="p-1 rounded-lg lg:hidden text-slate-400 hover:text-slate-200" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-brand-400 font-bold border border-slate-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-200 truncate">{user.name}</h4>
              <span className={`inline-flex items-center mt-0.5 px-2 py-0.25 rounded text-[10px] font-medium border ${
                user.role === 'Admin' 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-6 glass-panel border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 lg:hidden"
            >
              <Menu size={22} />
            </button>
            <h2 className="hidden sm:block text-sm font-medium text-slate-400">
              Welcome back, <span className="text-slate-200 font-semibold">{user.name}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Widget */}
            <div className="relative">
              <button
                onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all relative focus:outline-none"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0b0f19]" />
                )}
              </button>

              {notificationsDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 glass-panel border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-slideUp">
                    <div className="p-3 border-b border-white/5 bg-white/2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-semibold border border-brand-500/10">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-3 text-xs flex gap-3 transition-colors ${
                              notification.status === 'Pending' ? 'bg-brand-500/5' : 'bg-transparent'
                            }`}
                          >
                            <div className="flex-1 space-y-1">
                              <p className="text-slate-300 font-medium leading-relaxed">
                                {notification.message}
                              </p>
                              <span className="text-[9px] text-slate-500 block">
                                {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {notification.status === 'Pending' && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/10 transition-all shrink-0 h-fit"
                                title="Mark as read"
                              >
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          No notifications found.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100 focus:outline-none py-1.5 px-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
              >
                <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
                <ChevronDown size={14} className="opacity-60" />
              </button>

              {/* Dropdown menu */}
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 glass-panel border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-slideUp">
                    <div className="p-3 border-b border-white/5 bg-white/2 cursor-default">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                      <p className="text-xs text-slate-300 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-brand-600/10 hover:text-brand-400 transition-all"
                    >
                      <User size={14} />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-all text-left"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MEMBER INVITATION POPUP MODAL */}
      <Modal
        isOpen={invitationModalOpen}
        onClose={() => setInvitationModalOpen(false)}
        title="Project Assignment Notification"
        size="sm"
      >
        {activeInvitation && (
          <div className="space-y-4">
            <div className="p-3.5 bg-brand-500/5 border border-brand-500/10 rounded-xl space-y-1">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Invitation</h4>
              <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                {activeInvitation.message}
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have been assigned to collaborate on this project workspace. Please choose to Accept or Reject this invitation. 
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleInvitationResponse('Rejected')}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleInvitationResponse('Accepted')}
              >
                Accept Project
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardLayout;
