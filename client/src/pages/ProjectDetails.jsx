import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { 
  FolderKanban, 
  Users, 
  Plus, 
  Calendar, 
  User as UserIcon, 
  Edit, 
  ChevronLeft,
  CheckCircle,
  Inbox,
  AlertTriangle,
  Settings,
  Search,
  Filter
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search for tasks inside project
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Member management state
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [savingMembers, setSavingMembers] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      // 1. Get project metadata
      const projectRes = await API.get(`/projects/${id}`);
      setProject(projectRes.data);
      const currentMembers = projectRes.data.members.map(m => m._id);
      const pendingMembers = projectRes.data.pendingMembers?.map(m => m._id) || [];
      setSelectedMembers([...currentMembers, ...pendingMembers]);

      // 2. Get project tasks
      const tasksRes = await API.get(`/tasks?projectId=${id}`);
      setTasks(tasksRes.data);

      // 3. If Admin, get all users to support member additions
      if (user.role === 'Admin') {
        const usersRes = await API.get('/auth/users');
        // Filter out admins (optionally) or list everyone. Let's list everyone who is a Member.
        setAllUsers(usersRes.data.filter(u => u.role === 'Member'));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading project details:', err);
      toast.error('Failed to load project details');
      navigate('/projects');
    }
  };

  const handleMemberToggle = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSaveMembers = async () => {
    setSavingMembers(true);
    try {
      const { data } = await API.put(`/projects/${id}/members`, {
        members: selectedMembers
      });
      setProject(data);
      toast.success('Project collaborators updated successfully!');
      setMemberModalOpen(false);
    } catch (err) {
      console.error('Error updating project members:', err);
      toast.error(err.response?.data?.message || 'Failed to update members');
    } finally {
      setSavingMembers(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Filter tasks locally
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button */}
      <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium">
        <ChevronLeft size={14} />
        Back to projects list
      </Link>

      {/* Hero Banner card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <FolderKanban className="text-brand-500" size={24} />
              {project.name}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <UserIcon size={14} className="text-slate-400" />
                Created by: <span className="text-slate-300 font-semibold">{project.createdBy?.name || 'Admin'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                Created on: <span className="text-slate-300">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-3">
            {user.role === 'Admin' && (
              <>
                <Link to={`/projects/${project._id}/edit`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                    <Edit size={14} />
                    Edit Project
                  </Button>
                </Link>
                <Button 
                  variant="glass" 
                  size="sm" 
                  className="flex items-center gap-1.5"
                  onClick={() => setMemberModalOpen(true)}
                >
                  <Settings size={14} />
                  Manage Team
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MEMBERS SIDEBAR */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 shadow-xl h-fit space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
            <Users size={16} className="text-brand-400" />
            Project Members ({project.members?.length || 0})
          </h3>
          {project.members && project.members.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {project.members.map((member) => (
                <div key={member._id} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-brand-400 border border-slate-700">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-200 truncate">{member.name}</p>
                    <span className="text-[9px] text-slate-500 uppercase font-medium">{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500 text-xs">
              No members added to this project yet.
            </div>
          )}
        </div>

        {/* TASKS LIST */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400" />
              Tasks in this Project ({filteredTasks.length})
            </h3>
            {user.role === 'Admin' && (
              <Link to={`/tasks/new?projectId=${id}`}>
                <Button variant="primary" size="sm" className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Plus size={14} />
                  Add Task
                </Button>
              </Link>
            )}
          </div>

          {/* Search and Filters */}
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search project tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs glass-input focus:outline-none"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="glass-input px-3 py-2 text-xs cursor-pointer flex-1 md:flex-none"
              >
                <option value="">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="glass-input px-3 py-2 text-xs cursor-pointer flex-1 md:flex-none"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Grid Layout of Tasks */}
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task._id} className="glass-panel p-4 rounded-xl border border-white/5 hover:border-brand-500/20 hover:bg-slate-900/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to="/tasks" className="font-semibold text-slate-200 hover:text-brand-400 transition-colors truncate text-sm">
                        {task.title}
                      </Link>
                      <Badge type="priority" value={task.priority} />
                      <Badge type="status" value={task.status} />
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><UserIcon size={10} /> Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> Due: {formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end shrink-0 gap-3">
                    <Link to="/tasks">
                      <Button variant="outline" size="sm" className="px-2.5 py-1 text-xs">
                        View Board
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-white/5 p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Inbox size={24} className="opacity-40 animate-pulse" />
              <p className="text-xs font-semibold">No tasks match the active filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* MEMBER COLLABORATORS MANAGEMENT MODAL */}
      <Modal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title="Manage Project Collaborators"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select the team members authorized to access this project and be assigned tasks inside it.
          </p>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 border border-white/5 rounded-xl p-3 bg-slate-950/20">
            {allUsers.length > 0 ? (
              allUsers.map((user) => {
                const isSelected = selectedMembers.includes(user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => handleMemberToggle(user._id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500/30'
                        : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                        isSelected ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{user.name}</p>
                        <p className="text-[10px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded bg-slate-900 border-slate-800 text-brand-500 focus:ring-brand-500/20 h-4 w-4"
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-center py-4 text-xs text-slate-500">No members registered in system.</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setMemberModalOpen(false)} 
              disabled={savingMembers}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSaveMembers} 
              loading={savingMembers}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
