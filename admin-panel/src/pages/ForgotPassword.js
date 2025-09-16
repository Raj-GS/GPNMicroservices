import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const API_URL = process.env.REACT_APP_API_URL;

  // Email validation
  const validateEmail = () => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
    return '';
  };

  // OTP validation
  const validateOtp = () => {
    if (!otp) return 'OTP is required';
    if (!/^\d{4,6}$/.test(otp)) return 'Enter a valid OTP';
    return '';
  };

  // Password validation
  const validatePassword = () => {
    const errors = [];
    if (!newPassword) errors.push('Password is required.');
    if (newPassword.length < 8 || newPassword.length > 20) errors.push('Password must be between 8 and 20 characters long.');
    if (!/[A-Z]/.test(newPassword)) errors.push('Password must contain at least one uppercase letter (A-Z).');
    if (!/[a-z]/.test(newPassword)) errors.push('Password must contain at least one lowercase letter (a-z).');
    if (!/[0-9]/.test(newPassword)) errors.push('Password must contain at least one number (0-9).');
    if (!/[@$!%*?&#]/.test(newPassword)) errors.push('Password must contain at least one special character (e.g. @$!%*?&#).');
    if (newPassword !== confirmPassword) errors.push('Passwords do not match.');
    return errors.length > 0 ? errors.join('\n') : '';
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const err = validateEmail();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const res = await fetch(`${API_URL}forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email,is_set:1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to send OTP');
      } else {
        setSuccess('OTP sent! Please check your email.');
        setStep(2);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const err = validateOtp();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const res = await fetch(`${API_URL}forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp,is_set:2 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Invalid OTP');
      } else {
        setSuccess('OTP verified! Please enter your new password.');
        setStep(3);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const err = validatePassword();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const res = await fetch(`${API_URL}forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword,is_set:3 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to reset password');
      } else {
        setSuccess('Password reset successful! You can now log in with your new password.');
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a4a3a 0%, #1a4a3a 40%, #ffffff 40%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{
              color: '#ff8c00',
              fontWeight: '600',
              mb: 2,
            }}
          >
            Forgot Password
          </Typography>
          <Typography
            align="center"
            sx={{ color: '#1a4a3a', mb: 3 }}
          >
            {step === 1 && 'Enter your email address to receive an OTP.'}
            {step === 2 && 'Enter the OTP sent to your email.'}
            {step === 3 && 'Enter your new password.'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Step 1: Email */}
          {step === 1 && (
            <Box component="form" onSubmit={handleSendOtp} noValidate>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={!!error && step === 1}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#2d6a5b',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff8c00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8c00',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a4a3a',
                    '&.Mui-focused': {
                      color: '#ff8c00',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  marginTop: 3,
                  background: 'linear-gradient(45deg, #ff8c00 30%, #ffa726 90%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(255, 140, 0, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ffa726 30%, #ff8c00 90%)',
                    boxShadow: '0 6px 20px rgba(255, 140, 0, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </Box>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <Box component="form" onSubmit={handleVerifyOtp} noValidate>
              <TextField
                fullWidth
                label="OTP"
                type="text"
                margin="normal"
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                error={!!error && step === 2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#2d6a5b',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff8c00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8c00',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a4a3a',
                    '&.Mui-focused': {
                      color: '#ff8c00',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  marginTop: 3,
                  background: 'linear-gradient(45deg, #ff8c00 30%, #ffa726 90%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(255, 140, 0, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ffa726 30%, #ff8c00 90%)',
                    boxShadow: '0 6px 20px rgba(255, 140, 0, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </Box>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <Box component="form" onSubmit={handleResetPassword} noValidate>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                margin="normal"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                error={!!error && step === 3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#2d6a5b',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff8c00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8c00',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a4a3a',
                    '&.Mui-focused': {
                      color: '#ff8c00',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                margin="normal"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                error={!!error && step === 3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#2d6a5b',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff8c00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8c00',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a4a3a',
                    '&.Mui-focused': {
                      color: '#ff8c00',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  marginTop: 3,
                  background: 'linear-gradient(45deg, #ff8c00 30%, #ffa726 90%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(255, 140, 0, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ffa726 30%, #ff8c00 90%)',
                    boxShadow: '0 6px 20px rgba(255, 140, 0, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
