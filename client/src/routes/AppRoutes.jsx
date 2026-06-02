import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProjectsList from '../pages/ProjectsList';
import ProjectDetails from '../pages/ProjectDetails';
import ProjectForm from '../pages/ProjectForm';
import TasksList from '../pages/TasksList';
import TaskForm from '../pages/TaskForm';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import UsersList from '../pages/UsersList';

// Admin Protection Guard Component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Redirect fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Guest/Authentication Routes (under AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Authenticated Workspace Routes (under DashboardLayout) */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Project Routes */}
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route 
          path="/projects/new" 
          element={
            <AdminRoute>
              <ProjectForm />
            </AdminRoute>
          } 
        />
        <Route 
          path="/projects/:id/edit" 
          element={
            <AdminRoute>
              <ProjectForm />
            </AdminRoute>
          } 
        />

        {/* Task Routes */}
        <Route path="/tasks" element={<TasksList />} />
        <Route 
          path="/tasks/new" 
          element={
            <AdminRoute>
              <TaskForm />
            </AdminRoute>
          } 
        />
        <Route 
          path="/tasks/:id/edit" 
          element={
            <AdminRoute>
              <TaskForm />
            </AdminRoute>
          } 
        />

        {/* User Management */}
        <Route 
          path="/users" 
          element={
            <AdminRoute>
              <UsersList />
            </AdminRoute>
          } 
        />

        {/* Profile page */}
        <Route path="/profile" element={<Profile />} />

        {/* Fallback route within dashboard layout */}
        <Route path="/404" element={<NotFound />} />
      </Route>

      {/* External Catch-All fallback */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
