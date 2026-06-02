import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member', // Default role
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error
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
      newErrors.name = 'Full Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-100">Create Account</h2>
        <p className="text-xs text-slate-400 mt-1">Get started with Team Task Manager</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="name"
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="e.g. johndoe@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Min 6 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="role" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Account Role
          </label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="glass-input px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          >
            <option value="Member" className="bg-[#0f172a]">Member (View projects, tasks & update status)</option>
            <option value="Admin" className="bg-[#0f172a]">Admin (Create projects, assign tasks & view stats)</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={submitting}
        >
          Register
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
