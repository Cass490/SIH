import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Typography, CircularProgress, Box, Alert, Card, CardContent, Divider } from '@mui/material';
import { getFarmHubData } from '../services/api';
import Chatbot from '../components/Chatbot'; 
// Dummy response for testing the UI
const dummyHubResponse = {
    farm_details: { farm_name: "My Test Rice Field" },
    live_weather: { temperature: 25.1, humidity: 79, rainfall: 0.81 },
    model_recommendation: { best_recommendation: { crop: "jute", confidence: "33.45%" } },
    final_analysis: "Hello! Based on our analysis, the top recommended crop for your field is jute. This is because your soil and the local climate are an excellent match. You can also consider muskmelon and rice. Quick tip for jute: ensure your field has good drainage."
};

function FarmHubPage() {
  const { farmId } = useParams(); // Gets the farm_id from the URL
  const { t , i18n} = useTranslation();
  const [hubData, setHubData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHubData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Get the data from the REAL API using the farmId from the URL
        const currentLanguage = i18n.language; // Get the current language (e.g., 'en' or 'hi')
        const data = await getFarmHubData(farmId, currentLanguage); 

        if (data && !data.error) {
          setHubData(data); // Set the state with the REAL analysis from the backend
        } else {
          setError(data.error || 'Failed to fetch farm analysis.');
        }

      } catch (err) {
        setError('Failed to fetch farm analysis. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Only run the fetch if we have a farmId from the URL
    if (farmId) {
      fetchHubData();
    }
  },  [farmId, i18n.language]); // This effect re-runs if the user somehow navigates from one hub to another

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('loading_analysis')}</Typography>
      </Box>
    );
  }
  
  if (error) {
    return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;
  }

  if (!hubData) return null; // Or show a "No data" message

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {hubData.farm_details.farm_name} - {t('hub_title')}
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">{t('final_analysis')}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {hubData.final_analysis}
          </Typography>
        </CardContent>
      </Card>
      
      <Chatbot farmId={farmId} />
    </Container>
  );
}

export default FarmHubPage;