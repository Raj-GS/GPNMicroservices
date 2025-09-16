import React, { useState, useEffect } from 'react';
import logo2 from '../assets/gp-logo.png';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();


      if (!res.ok) {
        setApiError(data.message || 'Login failed');

      } else {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);

          localStorage.setItem("userInfo", JSON.stringify({
            role: data.user.role,
            username: data.user.first_name + " " + data.user.last_name,
            profile_pic: data.user.profile_pic,
            organization: data.user.origanisation.org_name,
            organization_logo: data.user.origanisation.logo,
          }));
          
          // To access later
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));



        }
        setApiError('');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg,rgb(43, 78, 67) 0%,rgb(41, 75, 63) 40%, #ffffff 40%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '40%',
          left: 0,
          right: 0,
          height: '20px',
          background: 'linear-gradient(90deg,rgb(43, 85, 74) 0%,rgb(40, 68, 61) 100%)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        }
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={8} 
          sx={{ 
            padding: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: '2px solid #fac686',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                margin: '0 auto',
                mb: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src={logo2}
                alt="Logo"
                style={{
                  width: '90%',
                  height: '90%',
                  objectFit: 'contain',
                  borderRadius: '50%',
                }}
              />
            </Box>
            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                color: '#1a4a3a',
                fontWeight: 'bold',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Glocal Prayer Network
            </Typography>
            {/* Tagline */}
            {/* <Typography
              variant="h6"
              sx={{
                color: '#ff8c00',
                fontStyle: 'italic',
                mb: 3,
              }}
            >
              Pray without ceasing
            </Typography> */}
          </Box>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>
          )}

          <Typography 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ 
              color: '#ff8c00',
              fontWeight: '600',
              mb: 1
            }}
          >
            Admin Login
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
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
  label="Password"
  type={showPassword ? 'text' : 'password'}
  margin="normal"
  required
  value={password}
  onChange={e => setPassword(e.target.value)}
  error={!!errors.password}
  helperText={errors.password}
  inputProps={{ "data-testid": "password-input" }}   // ✅ correct place
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          edge="end"
        >
          {showPassword ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
              <Typography 
                variant="body2" 
                align="right" 
                component={Link}
                to="/forgot-password"
                sx={{ 
                  color: '#1a4a3a',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#ff8c00',
                    textDecoration: 'underline',
                  },
                  transition: 'color 0.3s ease',
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ 
                marginTop: 3,
                marginBottom: 2,
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
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
