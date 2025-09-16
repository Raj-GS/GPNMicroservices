import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper, Container } from '@mui/material';

const ChangePassword = () => {
  const [fields, setFields] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
const API_URL = process.env.REACT_APP_API_URL;

  // Password validation function
  const validatePassword = () => {
    const errors = [];
    if (!fields.new) errors.push('Password is required.');
    if (fields.new.length < 8 || fields.new.length > 20) errors.push('Password must be between 8 and 20 characters long.');
    if (!/[A-Z]/.test(fields.new)) errors.push('Password must contain at least one uppercase letter (A-Z).');
    if (!/[a-z]/.test(fields.new)) errors.push('Password must contain at least one lowercase letter (a-z).');
    if (!/[0-9]/.test(fields.new)) errors.push('Password must contain at least one number (0-9).');
    if (!/[@$!%*?&#]/.test(fields.new)) errors.push('Password must contain at least one special character (e.g. @$!%*?&#).');
    if (fields.new !== fields.confirm) errors.push('Passwords do not match.');
    return errors.length > 0 ? errors.join('\n') : '';
  };

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fields.current || !fields.new || !fields.confirm) {
      setError('All fields are required.');
      return;
    }

    // Validate password
    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: fields.current,
          newPassword: fields.new,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        setError(data?.message || 'Failed to change password');
      } else {
        setSuccess('Password changed successfully!');
        setFields({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Change Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField
            label="Current Password"
            name="current"
            type="password"
            value={fields.current}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="New Password"
            name="new"
            type="password"
            value={fields.new}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Confirm New Password"
            name="confirm"
            type="password"
            value={fields.confirm}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChangePassword;
