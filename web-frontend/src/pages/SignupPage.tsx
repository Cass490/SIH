import React from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Grid,
} from '@mui/material';
import { 
  Person, 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff, 
  Agriculture,
  LocationOn,
  Phone,
  Landscape,
  Timeline,
  EmojiNature
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const validationSchema = yup.object({
  name: yup
    .string('Enter your name')
    .min(2, 'Name should be at least 2 characters')
    .required('Name is required'),
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .min(8, 'Password should be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string('Confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  farmingExperience: yup
    .string('Select your farming experience')
    .required('Farming experience is required'),
  farmSize: yup
    .mixed()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue == null) {
        return undefined;
      }
      const parsed = Number(originalValue);
      return isNaN(parsed) ? undefined : parsed;
    })
    .test('is-number', 'Enter a valid number', (value) => {
      return value !== undefined && !isNaN(value);
    })
    .test('is-positive', 'Farm size must be positive', (value) => {
      return value > 0;
    })
    .required('Farm size is required'),
  location: yup
    .string('Enter your location')
    .min(2, 'Location should be at least 2 characters')
    .required('Location is required'),
  preferredCrops: yup
    .array()
    .min(1, 'Select at least one preferred crop')
    .required('Preferred crops are required'),
  farmingGoals: yup
    .string('Enter your farming goals')
    .min(10, 'Please provide more details about your farming goals')
    .required('Farming goals are required'),
  phone: yup
    .string('Enter your phone number')
    .matches(/^[+]?[1-9]\d{1,14}$/, 'Enter a valid phone number'),
});

const experienceLevels = [
  'Beginner (0-2 years)',
  'Intermediate (3-5 years)',
  'Experienced (6-10 years)',
  'Expert (10+ years)'
];

const cropOptions = [
  'Rice', 'Wheat', 'Maize', 'Barley', 'Cotton', 'Sugarcane',
  'Potato', 'Tomato', 'Onion', 'Cabbage', 'Carrot', 'Beans',
  'Soybean', 'Sunflower', 'Groundnut', 'Tea', 'Coffee', 'Spices'
];

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      farmingExperience: '',
      farmSize: '',
      location: '',
      preferredCrops: [] as string[],
      farmingGoals: '',
      phone: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const signupData = {
          ...values,
          farmSize: Number(values.farmSize),
        };
        await signup(signupData);
        navigate('/dashboard');
      } catch (error) {
        // Error handled in AuthContext
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Agriculture sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
              AgriAI
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h5" gutterBottom>
            Join AgriAI
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create your account to get started with smart crop recommendations
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            {/* Basic Information */}
            <Typography variant="h6" sx={{ mt: 2, mb: 2, color: 'primary.main', fontWeight: 600 }}>
              Basic Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            
            {/* Farming Information */}
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main', fontWeight: 600 }}>
              Farming Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="farming-experience-label">Farming Experience</InputLabel>
                  <Select
                    labelId="farming-experience-label"
                    id="farmingExperience"
                    name="farmingExperience"
                    value={formik.values.farmingExperience}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.farmingExperience && Boolean(formik.errors.farmingExperience)}
                    label="Farming Experience"
                  >
                    {experienceLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        <Timeline sx={{ mr: 1 }} color="action" />
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.farmingExperience && formik.errors.farmingExperience && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {formik.errors.farmingExperience}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="farmSize"
                  label="Farm Size (acres)"
                  name="farmSize"
                  type="number"
                  value={formik.values.farmSize}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.farmSize && Boolean(formik.errors.farmSize)}
                  helperText={formik.touched.farmSize && formik.errors.farmSize}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Landscape color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="location"
                  label="Farm Location (City, State)"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="preferred-crops-label">Preferred Crops</InputLabel>
                  <Select
                    labelId="preferred-crops-label"
                    id="preferredCrops"
                    name="preferredCrops"
                    multiple
                    value={formik.values.preferredCrops}
                    onChange={(event) => {
                      const value = event.target.value;
                      formik.setFieldValue('preferredCrops', typeof value === 'string' ? value.split(',') : value);
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.preferredCrops && Boolean(formik.errors.preferredCrops)}
                    input={<OutlinedInput id="select-multiple-chip" label="Preferred Crops" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <EmojiNature sx={{ mr: 1 }} color="action" />
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {cropOptions.map((crop) => (
                      <MenuItem key={crop} value={crop}>
                        {crop}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.preferredCrops && formik.errors.preferredCrops && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {formik.errors.preferredCrops}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="farmingGoals"
                  label="Farming Goals & Objectives"
                  name="farmingGoals"
                  multiline
                  rows={3}
                  placeholder="Tell us about your farming goals, what you hope to achieve, and any specific challenges you're facing..."
                  value={formik.values.farmingGoals}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.farmingGoals && Boolean(formik.errors.farmingGoals)}
                  helperText={formik.touched.farmingGoals && formik.errors.farmingGoals}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)',
              }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <Box textAlign="center">
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Already have an account? Sign in here
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupPage;