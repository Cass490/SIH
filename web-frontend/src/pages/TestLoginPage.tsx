import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Container } from '@mui/material';

const TestLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  useEffect(() => {
    const testLogin = async () => {
      try {
        // Call the test-login endpoint to get a dummy user
        const response = await fetch('http://localhost:8000/test-login');
        const data = await response.json();
        
        // Store the token and user data
        localStorage.setItem('token', data.token);
        
        // Set user in context (we'll need to modify AuthContext for this)
        // For now, just redirect to test dashboard
        navigate('/test-dashboard');
      } catch (error) {
        console.error('Test login failed:', error);
        // Fallback: create a dummy user locally
        const dummyUser = {
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('token', 'dummy-token-for-testing');
        localStorage.setItem('user', JSON.stringify(dummyUser));
        navigate('/test-dashboard');
      }
    };

    testLogin();
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          Setting up test user...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You'll be redirected to the dashboard shortly
        </Typography>
      </Box>
    </Container>
  );
};

export default TestLoginPage;
