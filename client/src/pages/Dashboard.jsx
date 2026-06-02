import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FolderKanban,
  Users,
  CheckSquare,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronRight,
  TrendingUp,
  Inbox
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/dashboard/stats');
      setData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated successfully!');
      fetchStats(); // Refetch stats immediately to update dashboard numbers
    } catch (err) {
      console.error('Error updating task status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
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
        <AlertTriangle className="mx-auto text-rose-400 mb-2 animate-bounce" size={32} />
        <h3 className="text-lg font-bold text-slate-100">Error Loading Stats</h3>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); }}
          className="mt-4 px-4 py-2 bg-slate-800 text-xs font-semibold rounded-lg text-slate-200 hover:bg-slate-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { stats } = data;

  // Helper: Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper: check if a date is overdue
  const isOverdue = (dateStr, status) => {
    return new Date(dateStr) < new Date() && status !== 'Completed';
  };

  // Helper: calculate days remaining/overdue
  const getDaysStatus = (dateStr, status) => {
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (status === 'Completed') return { text: 'Completed', color: 'text-emerald-400' };
    if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: 'text-rose-400 font-semibold' };
    if (days === 0) return { text: 'Due today', color: 'text-amber-400 font-semibold' };
    return { text: `${days}d left`, color: 'text-slate-400' };
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-white/5 bg-gradient-to-r from-slate-900/60 to-brand-950/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            {user.role === 'Admin' ? 'Admin Control Center' : 'My Workspace'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {user.role === 'Admin' 
              ? 'Manage projects, orchestrate team collaboration, and inspect progress metrics.' 
              : 'Review your task assignments, track deadlines, and update status logs.'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-slate-400 font-medium">Date Overview</span>
          <p className="text-sm font-semibold text-brand-400 mt-0.5">{formatDate(new Date())}</p>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      {user.role === 'Admin' ? (
        // Admin Metrics
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-2 shadow-sm hover:border-brand-500/20 hover:shadow-brand-500/5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Projects</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10"><FolderKanban size={16} /></div>
            </div>
            <div className="mt-2"><p className="text-2xl font-bold text-slate-100">{stats.totalProjects}</p></div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-2 shadow-sm hover:border-brand-500/20 hover:shadow-brand-500/5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Members</span>
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/10"><Users size={16} /></div>
            </div>
            <div className="mt-2"><p className="text-2xl font-bold text-slate-100">{stats.totalMembers}</p></div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-2 shadow-sm hover:border-brand-500/20 hover:shadow-brand-500/5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Tasks</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10"><CheckSquare size={16} /></div>
            </div>
            <div className="mt-2"><p className="text-2xl font-bold text-slate-100">{stats.totalTasks}</p></div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-2 shadow-sm hover:border-brand-500/20 hover:shadow-brand-500/5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Completed</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"><TrendingUp size={16} /></div>
            </div>
            <div className="mt-2"><p className="text-2xl font-bold text-slate-100">{stats.completedTasks}</p></div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-2 shadow-sm hover:border-brand-500/20 hover:shadow-brand-500/5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pending</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/10"><Clock size={16} /></div>
            </div>
            <div className="mt-2"><p className="text-2xl font-bold text-slate-100">{stats.pendingTasks}</p></div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-rose-500/10 flex flex-col gap-2 shadow-sm hover:border-rose-500/30 hover:shadow-rose-500/5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Overdue</span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border-rose-500/10"><AlertTriangle size={16} /></div>
            </div>
            <div className="mt-2"><p className="text-2xl font-bold text-rose-400">{stats.overdueTasks}</p></div>
          </div>
        </div>
      ) : (
        // Member Metrics
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between shadow-sm hover:border-brand-500/20 hover:shadow-brand-500/5 transition-all">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Assigned Tasks</span>
              <p className="text-3xl font-bold text-slate-100 mt-2">{stats.assignedTasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10"><CheckSquare size={22} /></div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between shadow-sm hover:border-brand-500/20 hover:shadow-brand-500/5 transition-all">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Completed</span>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.completedTasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"><TrendingUp size={22} /></div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between shadow-sm hover:border-brand-500/20 hover:shadow-brand-500/5 transition-all">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pending Work</span>
              <p className="text-3xl font-bold text-amber-400 mt-2">{stats.pendingTasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/10"><Clock size={22} /></div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-rose-500/10 flex items-center justify-between shadow-sm hover:border-rose-500/30 hover:shadow-rose-500/5 transition-all">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Overdue Tasks</span>
              <p className="text-3xl font-bold text-rose-400 mt-2">{stats.overdueTasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border-rose-500/10"><AlertTriangle size={22} /></div>
          </div>
        </div>
      )}

      {/* DETAILED TABLES / LOGS */}
      <div className="space-y-8">
        {user.role === 'Admin' ? (
          <>
            {/* Project Progress & Task Assignments (Admin View) */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Project Progress & Task Assignments</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time status of all workspaces, task progress, and member distributions</p>
              </div>

              {data.projectProgress && data.projectProgress.length > 0 ? (
                <div className="space-y-6">
                  {data.projectProgress.map((project) => (
                    <div key={project._id} className="p-5 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
                      {/* Project Header and Progress bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-200">
                            <Link to={`/projects/${project._id}`} className="hover:text-brand-400 transition-colors">
                              {project.name}
                            </Link>
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">Created by: {project.createdBy}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-64">
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div 
                              className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-300 min-w-[35px] text-right">{project.progress}%</span>
                        </div>
                      </div>

                      {/* Expandable/List of Tasks inside project */}
                      {project.tasks && project.tasks.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-950/20 border-b border-white/5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-4 py-2">Task Title</th>
                                <th className="px-4 py-2">Assignee Member</th>
                                <th className="px-4 py-2">Priority</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Due Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {project.tasks.map((task) => (
                                <tr key={task._id} className="hover:bg-white/[0.005]">
                                  <td className="px-4 py-2.5 font-semibold text-slate-300">{task.title}</td>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-brand-400 border border-slate-700">
                                        {task.assignedTo?.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-slate-450 font-semibold">{task.assignedTo?.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <Badge type="priority" value={task.priority} />
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <Badge type="status" value={task.status} />
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-500 font-medium">
                                    {formatDate(task.dueDate)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 text-center py-2">
                          No tasks have been distributed inside this project yet.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Inbox size={32} className="opacity-40 animate-pulse" />
                  <p className="text-sm font-medium">No projects found. Create a project to start planning!</p>
                </div>
              )}
            </div>

            {/* Admin View: Recent Tasks */}
            <div className="glass-panel rounded-2xl border border-white/5 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Recently Created Tasks</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Summary of the latest tasks distributed across projects</p>
                </div>
                <Link
                  to="/tasks"
                  className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold hover:text-brand-300 transition-colors"
                >
                  View all tasks
                  <ChevronRight size={14} />
                </Link>
              </div>

              {data.recentTasks && data.recentTasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Task Details</th>
                        <th className="px-6 py-4">Project</th>
                        <th className="px-6 py-4">Assigned To</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {data.recentTasks.map((task) => (
                        <tr key={task._id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4">
                            <Link to="/tasks" className="font-semibold text-slate-200 hover:text-brand-400 transition-colors block">
                              {task.title}
                            </Link>
                            <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">{task.description}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-300">
                            {task.projectId?.name || 'Unknown Project'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-700">
                                {task.assignedTo?.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-slate-300 font-medium">{task.assignedTo?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge type="priority" value={task.priority} />
                          </td>
                          <td className="px-6 py-4">
                            <Badge type="status" value={task.status} />
                          </td>
                          <td className={`px-6 py-4 text-xs font-medium ${isOverdue(task.dueDate, task.status) ? 'text-rose-400' : 'text-slate-400'}`}>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} />
                              {formatDate(task.dueDate)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Inbox size={32} className="opacity-40 animate-pulse" />
                  <p className="text-sm font-medium">No tasks found. Create a project and tasks to start planning!</p>
                </div>
              )}
            </div>
          </>
        ) : (
          // Member View: My Projects & Tasks
          <div className="space-y-8">
            {/* My Projects */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <FolderKanban className="text-brand-400" size={18} />
                My Project Workspaces ({data.assignedProjects?.length || 0})
              </h3>
              {data.assignedProjects && data.assignedProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.assignedProjects.map(project => (
                    <div key={project._id} className="p-4 bg-slate-900/30 border border-white/5 rounded-xl space-y-2 hover:border-brand-500/20 transition-all">
                      <h4 className="text-sm font-bold text-slate-200 truncate">
                        <Link to={`/projects/${project._id}`} className="hover:text-brand-400 transition-colors">
                          {project.name}
                        </Link>
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No accepted projects. Check your notifications for invites!
                </div>
              )}
            </div>

            {/* Upcoming Task Deadlines */}
            <div className="glass-panel rounded-2xl border border-white/5 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Upcoming Task Deadlines</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tasks needing immediate attention, sorted by due date</p>
                </div>
                <Link
                  to="/tasks"
                  className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold hover:text-brand-300 transition-colors"
                >
                  View my tasks
                  <ChevronRight size={14} />
                </Link>
              </div>

              {data.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Task Details</th>
                        <th className="px-6 py-4">Project</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status Selector</th>
                        <th className="px-6 py-4">Deadline Tracker</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {data.upcomingDeadlines.map((task) => {
                        const dayStatus = getDaysStatus(task.dueDate, task.status);
                        return (
                          <tr key={task._id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4">
                              <Link to="/tasks" className="font-semibold text-slate-200 hover:text-brand-400 transition-colors block">
                                {task.title}
                              </Link>
                              <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">{task.description}</span>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-300">
                              {task.projectId?.name || 'Unknown Project'}
                            </td>
                            <td className="px-6 py-4">
                              <Badge type="priority" value={task.priority} />
                            </td>
                            <td className="px-6 py-4">
                              {/* Member Status Dropdown */}
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                                className="glass-input text-xs px-2 py-1 font-semibold focus:outline-none cursor-pointer"
                              >
                                <option value="Todo" className="bg-[#0f172a]">Todo</option>
                                <option value="In Progress" className="bg-[#0f172a]">In Progress</option>
                                <option value="Completed" className="bg-[#0f172a]">Completed</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-slate-300">{formatDate(task.dueDate)}</span>
                                <span className={`text-[11px] ${dayStatus.color}`}>{dayStatus.text}</span>
                              </div>
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
                  <p className="text-sm font-medium">All caught up! No upcoming pending deadlines found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
