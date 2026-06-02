import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Invalid credentials');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1">Please sign in to access your task dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="e.g. member@test.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={submitting}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
