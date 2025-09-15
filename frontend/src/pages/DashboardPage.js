import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, List, ListItem, ListItemText, Button, CircularProgress, Box, Alert, Paper, Stack, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getFarmsForUser } from '../services/api';

function DashboardPage() {
  const { t } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFarms = async () => {
      setIsLoading(true);
      setError('');
      try {
        // We will replace this hardcoded ID with a real one from our auth system
        const userId = "test_user_happy_path"; 
        
        // This is the real API call from api.js
        const result = await getFarmsForUser(userId);

        // Check if the API call was successful and returned data
        if (result && !result.error) {
          setFarms(result); // Set the state with REAL data from the API
        } else {
          // If there was an error, set the error message
          setError(result.error || 'Failed to fetch farms.');
        }

      } catch (err) {
        // Catch any unexpected errors during the process
        setError('An unexpected error occurred. Please try again later.');
        console.error(err);
      } finally {
        // This runs whether the call succeeded or failed
        setIsLoading(false);
      }
    };

    fetchFarms();
  }, []);  // The empty array [] means this runs only once when the page loads

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('My farms')}
          </Typography>
          <Button 
            component={RouterLink} 
            to="/add-farm" 
            variant="contained" 
            color="secondary" // Use the green color from our theme
            startIcon={<AddIcon />}
          >
            {t('Add a new farm')}
          </Button>
        </Stack>
        
        <Divider />

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {!isLoading && !error && (
          <List sx={{ mt: 2 }}>
            {farms.map((farm) => (
              <ListItem 
                key={farm._id} 
                button 
                component={RouterLink} 
                to={`/farm/${farm._id}`}
                sx={{ 
                  mb: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <ListItemText 
                  primary={farm.farm_name} 
                  primaryTypographyProps={{ fontWeight: 'bold' }} 
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default DashboardPage;