import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { CheckSquare, ArrowLeft, Save, Calendar, User } from 'lucide-react';

const TaskForm = () => {
  const { id } = useParams(); // populated if editing
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [projects, setProjects] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch projects to populate project dropdown
      const { data: projectsData } = await API.get('/projects');
      setProjects(projectsData);

      // Pre-select project from query string if present (e.g. from ProjectDetails "Add Task" link)
      const queryProjectId = searchParams.get('projectId');

      if (isEditMode) {
        // 2. Fetch task details for edit
        const { data: taskData } = await API.get(`/tasks/${id}`);
        
        // Format ISO Date to YYYY-MM-DD for standard html inputs
        const formattedDate = taskData.dueDate 
          ? new Date(taskData.dueDate).toISOString().substring(0, 10) 
          : '';

        setFormData({
          title: taskData.title,
          description: taskData.description,
          projectId: taskData.projectId?._id || '',
          assignedTo: taskData.assignedTo?._id || '',
          status: taskData.status,
          priority: taskData.priority,
          dueDate: formattedDate,
        });

        // Setup assignable users for pre-selected project
        const activeProj = projectsData.find(p => p._id === taskData.projectId?._id);
        if (activeProj) {
          setAssignableUsers(activeProj.members || []);
        }
      } else if (queryProjectId) {
        setFormData(prev => ({ ...prev, projectId: queryProjectId }));
        const activeProj = projectsData.find(p => p._id === queryProjectId);
        if (activeProj) {
          setAssignableUsers(activeProj.members || []);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching task form baseline data:', err);
      toast.error('Failed to load form details');
      navigate('/tasks');
    }
  };

  // Automatically update assignees when project selection changes
  const handleProjectChange = (e) => {
    const selectedProjId = e.target.value;
    setFormData({
      ...formData,
      projectId: selectedProjId,
      assignedTo: '', // reset assignee since project changed
    });

    const activeProj = projects.find(p => p._id === selectedProjId);
    if (activeProj) {
      setAssignableUsers(activeProj.members || []);
    } else {
      setAssignableUsers([]);
    }

    if (errors.projectId) {
      setErrors({ ...errors, projectId: '' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.description.trim()) newErrors.description = 'Task description is required';
    if (!formData.projectId) newErrors.projectId = 'Project target container is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Assigned user collaborator is required';
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date deadline is required';
    } else if (new Date(formData.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
      // Due dates cannot be historically completed
      newErrors.dueDate = 'Due date must be today or in the future';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await API.put(`/tasks/${id}`, formData);
        toast.success('Task updated successfully!');
      } else {
        await API.post('/tasks', formData);
        toast.success('Task created and assigned successfully!');
      }
      navigate('/tasks');
    } catch (err) {
      console.error('Error saving task:', err);
      toast.error(err.response?.data?.message || 'Failed to save task specifications');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
      {/* Back button */}
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
      >
        <ArrowLeft size={14} />
        Cancel and go back
      </Link>

      <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-white/5">
          <div className="p-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/10">
            <CheckSquare size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">
              {isEditMode ? 'Edit Task Specifications' : 'Distribute New Task'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditMode ? 'Modify title, priority, assignee, or deadline' : 'Define new task, link it to a project, and assign it to a collaborator'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Selector */}
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="projectId" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Project Target Container
            </label>
            <select
              name="projectId"
              id="projectId"
              value={formData.projectId}
              onChange={handleProjectChange}
              disabled={isEditMode} // Cannot move tasks across projects in edit mode for simplicity/safety
              className={`glass-input px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer ${
                isEditMode ? 'opacity-65 cursor-not-allowed' : ''
              } ${errors.projectId ? 'border-rose-500/60' : ''}`}
              required
            >
              <option value="">Select project workspace...</option>
              {projects.map(p => (
                <option key={p._id} value={p._id} className="bg-[#0f172a]">{p.name}</option>
              ))}
            </select>
            {errors.projectId && (
              <span className="text-xs text-rose-400 mt-0.5 font-medium">{errors.projectId}</span>
            )}
          </div>

          <Input
            label="Task Title"
            name="title"
            placeholder="e.g. Design Homepage Mockup"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="description" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Task Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              placeholder="Outline the steps, requirements, and checkpoints to fulfill this task successfully..."
              value={formData.description}
              onChange={handleChange}
              className={`glass-input px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
                errors.description ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
              }`}
              required
            />
            {errors.description && (
              <span className="text-xs text-rose-400 mt-0.5 font-medium">{errors.description}</span>
            )}
          </div>

          {/* Assignee Selector */}
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="assignedTo" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Assignee Collaborator
            </label>
            <select
              name="assignedTo"
              id="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              disabled={!formData.projectId}
              className={`glass-input px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer ${
                !formData.projectId ? 'opacity-50 cursor-not-allowed' : ''
              } ${errors.assignedTo ? 'border-rose-500/60' : ''}`}
              required
            >
              <option value="">
                {formData.projectId 
                  ? 'Select collaborator...' 
                  : 'Select a project container first...'}
              </option>
              {assignableUsers.map(user => (
                <option key={user._id} value={user._id} className="bg-[#0f172a]">
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.assignedTo && (
              <span className="text-xs text-rose-400 mt-0.5 font-medium">{errors.assignedTo}</span>
            )}
          </div>

          {/* Priority, Status, and Due Date row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="status" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Progress Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="glass-input px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
              >
                <option value="Todo" className="bg-[#0f172a]">Todo</option>
                <option value="In Progress" className="bg-[#0f172a]">In Progress</option>
                <option value="Completed" className="bg-[#0f172a]">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="priority" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Priority Rank
              </label>
              <select
                name="priority"
                id="priority"
                value={formData.priority}
                onChange={handleChange}
                className="glass-input px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
              >
                <option value="Low" className="bg-[#0f172a]">Low</option>
                <option value="Medium" className="bg-[#0f172a]">Medium</option>
                <option value="High" className="bg-[#0f172a]">High</option>
              </select>
            </div>

            {/* Due Date */}
            <Input
              label="Deadline Date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/tasks">
              <Button variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              className="flex items-center gap-1.5"
            >
              <Save size={16} />
              {isEditMode ? 'Update Task' : 'Distribute Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
