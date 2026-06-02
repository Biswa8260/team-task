import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FolderKanban, Plus, Eye, Edit2, Trash2, Users, FileText, AlertTriangle } from 'lucide-react';

const ProjectsList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast.error('Failed to load projects');
      setLoading(false);
    }
  };

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProjectToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await API.delete(`/projects/${projectToDelete._id}`);
      toast.success('Project and associated tasks deleted successfully!');
      setProjects(projects.filter((p) => p._id !== projectToDelete._id));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
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
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="text-brand-500" />
            Projects Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {user.role === 'Admin' 
              ? 'Create and manage project containers and assign collaborating members.' 
              : 'Browse the workspace projects you are assigned to.'}
          </p>
        </div>

        {user.role === 'Admin' && (
          <Link to="/projects/new">
            <Button variant="primary" className="flex items-center gap-1.5 w-full sm:w-auto">
              <Plus size={16} />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      {/* Grid List */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-100 hover:text-brand-400 transition-colors truncate">
                    <Link to={`/projects/${project._id}`}>{project.name}</Link>
                  </h3>
                  {user.role === 'Admin' && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        to={`/projects/${project._id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
                        title="Edit Project"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(project)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                {/* Team Members List */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Users size={10} />
                    Collaborators ({project.members?.length || 0})
                  </span>
                  <div className="flex -space-x-1.5 overflow-hidden py-1">
                    {project.members && project.members.length > 0 ? (
                      project.members.slice(0, 5).map((member) => (
                        <div
                          key={member._id}
                          className="h-6 w-6 rounded-full ring-2 ring-[#0b0f19] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-brand-400 border border-slate-700"
                          title={`${member.name} (${member.role})`}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No members</span>
                    )}
                    {project.members && project.members.length > 5 && (
                      <div className="h-6 w-6 rounded-full ring-2 ring-[#0b0f19] bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +{project.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                <Link to={`/projects/${project._id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Eye size={12} />
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center gap-3">
          <FolderKanban className="text-slate-600 animate-pulse" size={48} />
          <h3 className="text-lg font-bold text-slate-200">No Projects Found</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {user.role === 'Admin'
              ? 'Get started by creating your very first project workspace.'
              : 'You are not assigned to any projects currently. Ask your Admin to add you.'}
          </p>
          {user.role === 'Admin' && (
            <Link to="/projects/new">
              <Button variant="primary" size="sm" className="mt-2">
                Create First Project
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirm Project Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-400 border-b border-rose-500/10 pb-3">
            <AlertTriangle size={24} />
            <span className="font-bold text-sm">Warning: Irreversible Action</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-100">"{projectToDelete?.name}"</span>?
          </p>
          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-300 leading-relaxed">
            This action will cascade and <span className="font-semibold text-rose-400">permanently delete all tasks</span> associated with this project. This cannot be undone.
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={closeDeleteModal} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteProject} loading={deleting}>
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsList;
