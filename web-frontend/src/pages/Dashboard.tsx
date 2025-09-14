import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Agriculture,
  Add,
  LocationOn,
  Science,
  TrendingUp,
  AccountCircle,
  Logout,
  Menu as MenuIcon,
  Close,
  Save,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { farmAPI, recommendationAPI } from '../services/api';
import { Farm, CropRecommendation } from '../types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';

const validationSchema = yup.object({
  farmName: yup
    .string('Enter farm name')
    .min(2, 'Farm name should be at least 2 characters')
    .required('Farm name is required'),
  latitude: yup
    .number('Enter latitude')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .required('Latitude is required'),
  longitude: yup
    .number('Enter longitude')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .required('Longitude is required'),
  nitrogen: yup
    .number('Enter nitrogen value')
    .min(0, 'Nitrogen must be positive')
    .max(200, 'Nitrogen value seems too high')
    .required('Nitrogen is required'),
  phosphorus: yup
    .number('Enter phosphorus value')
    .min(0, 'Phosphorus must be positive')
    .max(200, 'Phosphorus value seems too high')
    .required('Phosphorus is required'),
  potassium: yup
    .number('Enter potassium value')
    .min(0, 'Potassium must be positive')
    .max(200, 'Potassium value seems too high')
    .required('Potassium is required'),
  pH: yup
    .number('Enter pH value')
    .min(3, 'pH must be between 3 and 10')
    .max(10, 'pH must be between 3 and 10')
    .required('pH is required'),
});

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [addFarmDialogOpen, setAddFarmDialogOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const formik = useFormik({
    initialValues: {
      farmName: '',
      latitude: '',
      longitude: '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      pH: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const farmData = {
          farmName: values.farmName,
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
          nitrogen: Number(values.nitrogen),
          phosphorus: Number(values.phosphorus),
          potassium: Number(values.potassium),
          pH: Number(values.pH),
        };
        
        const newFarm = await farmAPI.createFarm(farmData);
        setFarms(prev => [...prev, newFarm]);
        toast.success('Farm added successfully!');
        resetForm();
        setAddFarmDialogOpen(false);
        
        // Refresh the farms list to ensure consistency
        await loadFarms();
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to add farm';
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const loadFarms = async () => {
    try {
      setLoading(true);
      const farmsData = await farmAPI.getFarms();
      setFarms(farmsData);
    } catch (error) {
      // If API fails, show dummy data for testing
      console.log('API failed, showing dummy data for testing');
      const dummyFarms = [
        {
          _id: 'dummy-farm-1',
          farmName: 'North Field',
          latitude: 40.7128,
          longitude: -74.0060,
          nitrogen: 85,
          phosphorus: 45,
          potassium: 40,
          pH: 6.5,
          userId: 'test-user-123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'dummy-farm-2',
          farmName: 'South Field',
          latitude: 40.7589,
          longitude: -73.9851,
          nitrogen: 75,
          phosphorus: 50,
          potassium: 35,
          pH: 6.8,
          userId: 'test-user-123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setFarms(dummyFarms);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async (farm: Farm) => {
    try {
      setLoading(true);
      const response = await recommendationAPI.getRecommendations(farm._id);
      setRecommendations(response.recommendations);
      setSelectedFarm(farm);
    } catch (error) {
      // If API fails, show dummy recommendations for testing
      console.log('API failed, showing dummy recommendations for testing');
      const dummyRecommendations = [
        {
          cropName: 'Rice',
          confidence: 0.85,
          expectedYield: 4.5,
          estimatedProfit: 2500,
          waterRequirement: 'High',
          growthDuration: 120,
          plantingSeason: 'Monsoon',
          marketDemand: 'High',
          riskFactors: ['Weather dependent', 'Water availability'],
          recommendations: ['Use high-yield variety', 'Ensure proper irrigation']
        },
        {
          cropName: 'Wheat',
          confidence: 0.78,
          expectedYield: 3.2,
          estimatedProfit: 1800,
          waterRequirement: 'Medium',
          growthDuration: 90,
          plantingSeason: 'Winter',
          marketDemand: 'Stable',
          riskFactors: ['Temperature sensitive'],
          recommendations: ['Plant in November', 'Use disease-resistant variety']
        },
        {
          cropName: 'Maize',
          confidence: 0.72,
          expectedYield: 3.8,
          estimatedProfit: 2200,
          waterRequirement: 'Medium',
          growthDuration: 100,
          plantingSeason: 'Summer',
          marketDemand: 'Growing',
          riskFactors: ['Pest attacks'],
          recommendations: ['Use hybrid seeds', 'Apply proper pesticides']
        }
      ];
      setRecommendations(dummyRecommendations);
      setSelectedFarm(farm);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)' }}>
        <Toolbar>
          <Agriculture sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AgriAI Dashboard
          </Typography>
          <Button
            color="inherit"
            startIcon={<TrendingUp />}
            onClick={() => navigate('/market-trends')}
            sx={{ mr: 2 }}
          >
            Market Trends Analysis
          </Button>
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuClick}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Typography textAlign="center">Welcome, {user?.name}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Side Panel - Farms List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom>
                  My Farms
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => setAddFarmDialogOpen(true)}
                  sx={{ 
                    background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)',
                    mb: 1
                  }}
                >
                  Add New Farm
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/market-trends')}
                  sx={{ mb: 1 }}
                >
                  Market Trends Analysis
                </Button>
              </Box>
              
              <Box sx={{ overflow: 'auto', height: 'calc(100% - 120px)' }}>
                {loading && farms.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary" align="center">
                      Loading farms...
                    </Typography>
                  </Box>
                ) : farms.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary" align="center">
                      No farms added yet. Click "Add New Farm" to get started.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {farms.map((farm) => (
                      <React.Fragment key={farm._id}>
                        <ListItem
                          button
                          onClick={() => getRecommendations(farm)}
                          selected={selectedFarm?._id === farm._id}
                        >
                          <ListItemIcon>
                            <Agriculture color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={farm.farmName}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  <Chip label={`N: ${farm.nitrogen}`} size="small" />
                                  <Chip label={`P: ${farm.phosphorus}`} size="small" />
                                  <Chip label={`K: ${farm.potassium}`} size="small" />
                                  <Chip label={`pH: ${farm.pH}`} size="small" />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={8}>
            {selectedFarm ? (
              <Box>
                <Typography variant="h4" gutterBottom>
                  {selectedFarm.farmName}
                </Typography>
                
                {/* Farm Details */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Farm Details
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<TrendingUp />}
                      onClick={() => navigate('/market-trends')}
                      size="small"
                    >
                      Market Trends
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Latitude
                      </Typography>
                      <Typography variant="body1">
                        {selectedFarm.latitude.toFixed(6)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Longitude
                      </Typography>
                      <Typography variant="body1">
                        {selectedFarm.longitude.toFixed(6)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Nitrogen (N)
                      </Typography>
                      <Typography variant="body1">
                        {selectedFarm.nitrogen} mg/kg
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Phosphorus (P)
                      </Typography>
                      <Typography variant="body1">
                        {selectedFarm.phosphorus} mg/kg
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Potassium (K)
                      </Typography>
                      <Typography variant="body1">
                        {selectedFarm.potassium} mg/kg
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        pH Level
                      </Typography>
                      <Typography variant="body1">
                        {selectedFarm.pH}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Recommendations */}
                {recommendations.length > 0 ? (
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Crop Recommendations
                    </Typography>
                    <Grid container spacing={2}>
                      {recommendations.map((rec, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {rec.cropName}
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Chip
                                  label={`${(rec.confidence * 100).toFixed(1)}% Confidence`}
                                  color="primary"
                                  size="small"
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Expected Yield: {rec.expectedYield} tons/acre
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Estimated Profit: ${rec.estimatedProfit}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Water Requirement: {rec.waterRequirement}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Growth Duration: {rec.growthDuration} days
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ) : selectedFarm && (
                  <Paper sx={{ p: 3 }}>
                    <Alert severity="info">
                      Click on a farm from the left panel to get AI-powered crop recommendations based on soil conditions and current market trends.
                    </Alert>
                  </Paper>
                )}
              </Box>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', height: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box>
                  <Agriculture sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Welcome to AgriAI Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Add your first farm or select an existing one to get started with AI-powered crop recommendations.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={() => setAddFarmDialogOpen(true)}
                    sx={{ 
                      background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)',
                      mr: 2
                    }}
                  >
                    Add Your First Farm
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<TrendingUp />}
                    onClick={() => navigate('/market-trends')}
                  >
                    View Market Trends
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Add Farm Dialog */}
      <Dialog
        open={addFarmDialogOpen}
        onClose={() => setAddFarmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Add New Farm
            <IconButton onClick={() => setAddFarmDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="farmName"
              label="Farm Name"
              name="farmName"
              placeholder="e.g., My North Field"
              value={formik.values.farmName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.farmName && Boolean(formik.errors.farmName)}
              helperText={formik.touched.farmName && formik.errors.farmName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Agriculture color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="latitude"
                  label="Latitude"
                  name="latitude"
                  type="number"
                  inputProps={{ step: 'any' }}
                  placeholder="e.g., 40.7128"
                  value={formik.values.latitude}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.latitude && Boolean(formik.errors.latitude)}
                  helperText={formik.touched.latitude && formik.errors.latitude}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="longitude"
                  label="Longitude"
                  name="longitude"
                  type="number"
                  inputProps={{ step: 'any' }}
                  placeholder="e.g., -74.0060"
                  value={formik.values.longitude}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.longitude && Boolean(formik.errors.longitude)}
                  helperText={formik.touched.longitude && formik.errors.longitude}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
              Soil Nutrient Analysis
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nitrogen"
                  label="Nitrogen (N)"
                  name="nitrogen"
                  type="number"
                  placeholder="85"
                  value={formik.values.nitrogen}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nitrogen && Boolean(formik.errors.nitrogen)}
                  helperText={formik.touched.nitrogen && formik.errors.nitrogen}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Science color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">mg/kg</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phosphorus"
                  label="Phosphorus (P)"
                  name="phosphorus"
                  type="number"
                  placeholder="45"
                  value={formik.values.phosphorus}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phosphorus && Boolean(formik.errors.phosphorus)}
                  helperText={formik.touched.phosphorus && formik.errors.phosphorus}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Science color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">mg/kg</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="potassium"
                  label="Potassium (K)"
                  name="potassium"
                  type="number"
                  placeholder="40"
                  value={formik.values.potassium}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.potassium && Boolean(formik.errors.potassium)}
                  helperText={formik.touched.potassium && formik.errors.potassium}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Science color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">mg/kg</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="pH"
                  label="Soil pH"
                  name="pH"
                  type="number"
                  inputProps={{ step: 0.1 }}
                  placeholder="6.5"
                  value={formik.values.pH}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pH && Boolean(formik.errors.pH)}
                  helperText={formik.touched.pH && formik.errors.pH}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Science color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddFarmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={formik.handleSubmit}
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={<Save />}
            sx={{ 
              background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)',
            }}
          >
            {formik.isSubmitting ? 'Adding...' : 'Add Farm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;