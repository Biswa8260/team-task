import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Folder, 
  Eye, 
  Edit, 
  Trash, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Inbox
} from 'lucide-react';

const TasksList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Task Details Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch initial tasks & projects for filters dropdown
  const fetchInitialData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/projects'),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading tasks initial data:', err);
      toast.error('Failed to load tasks database');
      setLoading(false);
    }
  };

  // Fetch tasks with current query filters
  const fetchFilteredTasks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedProject) queryParams.append('projectId', selectedProject);
      if (selectedStatus) queryParams.append('status', selectedStatus);
      if (selectedPriority) queryParams.append('priority', selectedPriority);

      const { data } = await API.get(`/tasks?${queryParams.toString()}`);
      setTasks(data);
      setLoading(false);
    } catch (err) {
      console.error('Error filtering tasks:', err);
      toast.error('Failed to load filtered tasks');
      setLoading(false);
    }
  };

  // Handle filter/search triggers
  useEffect(() => {
    // Debounce search input to avoid spamming requests
    const delayDebounceFn = setTimeout(() => {
      fetchFilteredTasks();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedProject, selectedStatus, selectedPriority]);

  const openDetailsModal = (task) => {
    setSelectedTask(task);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedTask(null);
  };

  // Member & Admin can update task status
  const handleStatusChange = async (newStatus) => {
    if (!selectedTask) return;
    setUpdatingStatus(true);
    try {
      const { data } = await API.put(`/tasks/${selectedTask._id}`, {
        status: newStatus,
      });
      
      // Update local task states
      setTasks(tasks.map(t => t._id === selectedTask._id ? data : t));
      setSelectedTask(data);
      toast.success('Task status updated successfully!');
    } catch (err) {
      console.error('Error updating task status:', err);
      toast.error(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setDeletingTask(true);
    try {
      await API.delete(`/tasks/${selectedTask._id}`);
      toast.success('Task deleted successfully!');
      setTasks(tasks.filter(t => t._id !== selectedTask._id));
      closeDetailsModal();
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeletingTask(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dateStr, status) => {
    return new Date(dateStr) < new Date() && status !== 'Completed';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="text-brand-500" />
            Central Tasks Board
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse task lists, inspect due dates, and update progress states.
          </p>
        </div>

        {user.role === 'Admin' && (
          <Link to="/tasks/new">
            <Button variant="primary" className="flex items-center gap-1.5 w-full sm:w-auto">
              <Plus size={16} />
              Add Task
            </Button>
          </Link>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search & Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search title/description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs glass-input focus:outline-none"
            />
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="glass-input px-3 py-2 text-xs cursor-pointer focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="glass-input px-3 py-2 text-xs cursor-pointer focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="glass-input px-3 py-2 text-xs cursor-pointer focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Task List Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const taskOverdue = isOverdue(task.dueDate, task.status);
            return (
              <div 
                key={task._id} 
                onClick={() => openDetailsModal(task)}
                className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 ${
                  taskOverdue ? 'border-rose-500/10 hover:border-rose-500/30' : 'border-white/5 hover:border-brand-500/20'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1 hover:text-brand-400 transition-colors">
                      {task.title}
                    </h3>
                    <Badge type="priority" value={task.priority} />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Folder size={10} />
                      {task.projectId?.name || 'Project'}
                    </span>
                    <span className={`flex items-center gap-1 ${taskOverdue ? 'text-rose-400' : ''}`}>
                      <Calendar size={10} />
                      Due: {formatDate(task.dueDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge type="status" value={task.status} />
                    <div 
                      className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-brand-400 border border-slate-700" 
                      title={`Assigned to: ${task.assignedTo?.name}`}
                    >
                      {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center gap-3">
          <Inbox className="text-slate-600 animate-pulse" size={48} />
          <h3 className="text-lg font-bold text-slate-200">No Tasks Found</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            There are no tasks matching the selected filters. Use the options above to adjust searches.
          </p>
        </div>
      )}

      {/* TASK DETAILS INTERACTIVE MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={closeDetailsModal}
        title="Task Specifications"
        size="md"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge type="priority" value={selectedTask.priority} />
                <Badge type="status" value={selectedTask.status} />
                {isOverdue(selectedTask.dueDate, selectedTask.status) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertTriangle size={10} />
                    Overdue
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-100 leading-tight">
                {selectedTask.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Folder size={14} />
                Project Container:{' '}
                <span className="text-slate-200 font-semibold">
                  {selectedTask.projectId?.name || 'Unknown Project'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl">
              <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedTask.description}
              </p>
            </div>

            {/* Assignment & Timeline Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-brand-400">
                  {selectedTask.assignedTo?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Assignee</h5>
                  <p className="text-xs font-bold text-slate-200">{selectedTask.assignedTo?.name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                <Calendar className="text-slate-500 h-6 w-6" />
                <div>
                  <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Deadline</h5>
                  <p className="text-xs font-bold text-slate-200">{formatDate(selectedTask.dueDate)}</p>
                </div>
              </div>
            </div>

            {/* ACTION SECTION */}
            <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
              {/* Member Own Task Status Update Area */}
              {selectedTask.assignedTo?._id === user._id && (
                <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock size={14} className="text-brand-400 animate-pulse" />
                    Update Task Status
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    You are assigned to this task. Select its current progress to notify your project Admin.
                  </p>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full mt-2 glass-input px-3 py-2 text-xs cursor-pointer focus:outline-none disabled:opacity-50"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}

              {/* Admin modifications block */}
              <div className="flex items-center justify-between gap-4 pt-2">
                {user.role === 'Admin' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Link to={`/tasks/${selectedTask._id}/edit`} onClick={closeDetailsModal}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Edit size={12} />
                          Edit Task
                        </Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={handleDeleteTask} loading={deletingTask} className="flex items-center gap-1">
                        <Trash size={12} />
                        Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  <div />
                )}
                
                <Button variant="secondary" size="sm" onClick={closeDetailsModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TasksList;
