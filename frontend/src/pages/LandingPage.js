import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function LandingPage() {
  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to Green Waves
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Your AI-powered partner for smarter, more profitable, and sustainable farming.
      </Typography>
      <Typography variant="body1" paragraph>
        Get personalized crop recommendations based on your farm's unique soil, live weather data, and market trends. Diagnose crop diseases with a single photo and get expert advice in your own language.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" size="large">
        Go to My Farms
      </Button>
    </Paper>
  );
}

export default LandingPage;