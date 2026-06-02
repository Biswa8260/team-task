import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { FolderKanban, ArrowLeft, Save } from 'lucide-react';

const ProjectForm = () => {
  const { id } = useParams(); // populated if editing
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/projects/${id}`);
      setFormData({
        name: data.name,
        description: data.description,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching project for edit:', err);
      toast.error('Failed to load project details');
      navigate('/projects');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear validation error when editing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
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
        await API.put(`/projects/${id}`, formData);
        toast.success('Project updated successfully!');
      } else {
        await API.post('/projects', formData);
        toast.success('Project created successfully!');
      }
      navigate('/projects');
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error(err.response?.data?.message || 'Failed to save project');
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
      {/* Back link */}
      <Link
        to={isEditMode ? `/projects/${id}` : '/projects'}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
      >
        <ArrowLeft size={14} />
        Cancel and go back
      </Link>

      {/* Form Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-white/5">
          <div className="p-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/10">
            <FolderKanban size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">
              {isEditMode ? 'Edit Project Workspace' : 'Create New Project'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditMode ? 'Modify existing name and description' : 'Set up a new workspace context for task distribution'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Project Name"
            name="name"
            placeholder="e.g. Website Redesign"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="description" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Project Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              placeholder="Provide a detailed description of the project workspace objectives, target results, and resources..."
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

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to={isEditMode ? `/projects/${id}` : '/projects'}>
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
              {isEditMode ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
