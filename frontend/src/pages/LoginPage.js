import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert, Link } from '@mui/material';
import { loginUser, registerUser } from '../services/api'; // <-- Import both auth functions

function LoginPage() {
  const navigate = useNavigate();
  
  // State to toggle between Login and Register views
  const [isRegistering, setIsRegistering] = useState(false);

  // State for both forms
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    occupation: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const userData = await loginUser(formData.phone, formData.password);
    setIsLoading(false);

    if (userData && !userData.error) {
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/'); // Redirect to dashboard on successful login
    } else {
      setError(userData.error || "Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');

    const registrationData = {
        name: formData.name,
        phone: formData.phone,
        occupation: formData.occupation,
        password: formData.password
    };
    
    const result = await registerUser(registrationData);
    setIsLoading(false);

    if (result && !result.error) {
      setSuccess("Registration successful! Please log in.");
      setIsRegistering(false); // Switch back to the login form
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setFormData({ name: '', phone: '', occupation: '', password: '', confirmPassword: '' });
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          {isRegistering ? 'Create an Account' : 'Sign In to Green Waves'}
        </Typography>

        {isRegistering ? (
          // --- REGISTRATION FORM ---
          <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} autoFocus />
            <TextField margin="normal" required fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="Occupation (e.g., Farmer)" name="occupation" value={formData.occupation} onChange={handleChange} />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" value={formData.password} onChange={handleChange} />
            <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          </Box>
        ) : (
          // --- LOGIN FORM ---
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} autoFocus />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" value={formData.password} onChange={handleChange} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        )}
        
        {error && <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mt: 1 }}>{success}</Alert>}

        <Link href="#" variant="body2" onClick={toggleForm} sx={{ mt: 2 }}>
          {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Link>
      </Box>
    </Container>
  );
}

export default LoginPage;