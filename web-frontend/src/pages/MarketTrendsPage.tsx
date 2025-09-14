import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Agriculture,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ArrowBack,
  ShowChart,
  Assessment,
  Insights,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { marketAPI } from '../services/api';
import { MarketData } from '../types';
import { toast } from 'react-toastify';

// Mock data for demonstration (replace with API calls)
const mockMarketData: MarketData[] = [
  {
    crop: 'Rice',
    currentPrice: 1450,
    priceChange: 5.2,
    trend: 'up',
    forecast: [
      { date: '2024-01', price: 1420 },
      { date: '2024-02', price: 1435 },
      { date: '2024-03', price: 1450 },
      { date: '2024-04', price: 1465 },
      { date: '2024-05', price: 1480 },
      { date: '2024-06', price: 1475 },
    ]
  },
  {
    crop: 'Wheat',
    currentPrice: 2150,
    priceChange: -2.1,
    trend: 'down',
    forecast: [
      { date: '2024-01', price: 2200 },
      { date: '2024-02', price: 2180 },
      { date: '2024-03', price: 2150 },
      { date: '2024-04', price: 2140 },
      { date: '2024-05', price: 2160 },
      { date: '2024-06', price: 2155 },
    ]
  },
  {
    crop: 'Maize',
    currentPrice: 1850,
    priceChange: 0.8,
    trend: 'stable',
    forecast: [
      { date: '2024-01', price: 1835 },
      { date: '2024-02', price: 1845 },
      { date: '2024-03', price: 1850 },
      { date: '2024-04', price: 1855 },
      { date: '2024-05', price: 1852 },
      { date: '2024-06', price: 1858 },
    ]
  },
  {
    crop: 'Cotton',
    currentPrice: 5200,
    priceChange: 8.5,
    trend: 'up',
    forecast: [
      { date: '2024-01', price: 4900 },
      { date: '2024-02', price: 5050 },
      { date: '2024-03', price: 5200 },
      { date: '2024-04', price: 5350 },
      { date: '2024-05', price: 5300 },
      { date: '2024-06', price: 5400 },
    ]
  },
  {
    crop: 'Sugarcane',
    currentPrice: 280,
    priceChange: -1.5,
    trend: 'down',
    forecast: [
      { date: '2024-01', price: 285 },
      { date: '2024-02', price: 282 },
      { date: '2024-03', price: 280 },
      { date: '2024-04', price: 278 },
      { date: '2024-05', price: 282 },
      { date: '2024-06', price: 285 },
    ]
  },
  {
    crop: 'Soybean',
    currentPrice: 4200,
    priceChange: 3.8,
    trend: 'up',
    forecast: [
      { date: '2024-01', price: 4050 },
      { date: '2024-02', price: 4125 },
      { date: '2024-03', price: 4200 },
      { date: '2024-04', price: 4275 },
      { date: '2024-05', price: 4250 },
      { date: '2024-06', price: 4300 },
    ]
  },
];

const pieChartColors = ['#2E7D32', '#66BB6A', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'];

const MarketTrendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Replace with actual API call:
      // const data = await marketAPI.getMarketTrends();
      // setMarketData(data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMarketData(mockMarketData);
      
    } catch (error) {
      toast.error('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  const selectedCropData = marketData.find(crop => crop.crop === selectedCrop);
  
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="warning" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'warning';
    }
  };

  const cropComparisonData = marketData.map(crop => ({
    name: crop.crop,
    price: crop.currentPrice,
    change: crop.priceChange,
  }));

  const marketShareData = marketData.map((crop, index) => ({
    name: crop.crop,
    value: Math.abs(crop.priceChange) * 10 + 20, // Mock market share calculation
    color: pieChartColors[index % pieChartColors.length],
  }));

  if (loading) {
    return (
      <>
        <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowBack />
            </IconButton>
            <Agriculture sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Market Trends Analysis
            </Typography>
          </Toolbar>
        </AppBar>
        <Container sx={{ py: 3 }}>
          <LinearProgress />
          <Typography align="center" sx={{ mt: 2 }}>
            Loading market data...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Agriculture sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Market Trends Analysis
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Market Overview Cards */}
        <Typography variant="h4" gutterBottom>
          Agricultural Market Overview
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {marketData.map((crop) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={crop.crop}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  border: selectedCrop === crop.crop ? 2 : 0,
                  borderColor: 'primary.main',
                }}
                onClick={() => setSelectedCrop(crop.crop)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {crop.crop}
                    </Typography>
                    {getTrendIcon(crop.trend)}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    ₹{crop.currentPrice}
                  </Typography>
                  <Chip
                    label={`${crop.priceChange > 0 ? '+' : ''}${crop.priceChange}%`}
                    color={getTrendColor(crop.trend)}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Detailed Analysis Section */}
        <Grid container spacing={3}>
          {/* Price Forecast Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Price Forecast - {selectedCrop}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Select Crop</InputLabel>
                  <Select
                    value={selectedCrop}
                    label="Select Crop"
                    onChange={(e) => setSelectedCrop(e.target.value)}
                  >
                    {marketData.map((crop) => (
                      <MenuItem key={crop.crop} value={crop.crop}>
                        {crop.crop}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              {selectedCropData ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedCropData.forecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`₹${value}`, 'Price']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2E7D32" 
                        strokeWidth={3}
                        dot={{ fill: '#2E7D32', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Current Price: ₹{selectedCropData.currentPrice} | 
                    Change: {selectedCropData.priceChange > 0 ? '+' : ''}{selectedCropData.priceChange}% | 
                    Trend: {selectedCropData.trend.toUpperCase()}
                  </Alert>
                </>
              ) : (
                <Typography>No data available for selected crop</Typography>
              )}
            </Paper>
          </Grid>

          {/* Market Insights */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                <Insights sx={{ mr: 1, verticalAlign: 'middle' }} />
                Market Insights
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Top Performing Crops
                </Typography>
                {marketData
                  .filter(crop => crop.priceChange > 0)
                  .sort((a, b) => b.priceChange - a.priceChange)
                  .slice(0, 3)
                  .map((crop, index) => (
                    <Box key={crop.crop} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        sx={{ mr: 1, width: 30 }} 
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {crop.crop}
                      </Typography>
                      <Chip 
                        label={`+${crop.priceChange}%`} 
                        color="success" 
                        size="small" 
                      />
                    </Box>
                  ))
                }
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Declining Crops
                </Typography>
                {marketData
                  .filter(crop => crop.priceChange < 0)
                  .sort((a, b) => a.priceChange - b.priceChange)
                  .slice(0, 3)
                  .map((crop, index) => (
                    <Box key={crop.crop} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        sx={{ mr: 1, width: 30 }} 
                        color="error"
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {crop.crop}
                      </Typography>
                      <Chip 
                        label={`${crop.priceChange}%`} 
                        color="error" 
                        size="small" 
                      />
                    </Box>
                  ))
                }
              </Box>

              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Recommendation:</strong> Consider investing in Cotton and Soybean 
                  as they show strong upward trends with good profit margins.
                </Typography>
              </Alert>
            </Paper>
          </Grid>

          {/* Price Comparison Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Current Price Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cropComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value}`, 'Price']}
                  />
                  <Bar dataKey="price" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Market Share Pie Chart */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Market Activity Share
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={marketShareData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marketShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Market Information */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Market Analysis Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Growing Markets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cotton, Rice, and Soybean markets are showing positive growth trends 
                  with increased demand and favorable weather conditions.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Market Stability
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Maize prices remain stable with consistent demand from livestock 
                  and food processing industries.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Insights sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Future Outlook
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agricultural markets are expected to remain volatile due to 
                  climate change impacts and global supply chain fluctuations.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default MarketTrendsPage;