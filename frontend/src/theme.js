import { createTheme } from '@mui/material/styles';

// Define your color palette
const palette = {
  primary: {
    main: '#0D47A1', // A strong, trustworthy blue
    light: '#1E88E5',
    dark: '#0D47A1',
  },
  secondary: {
    main: '#43A047', // A vibrant, natural green
    light: '#66BB6A',
    dark: '#2E7D32',
  },
  background: {
    default: '#F5F5F5', // A very light grey for the page background
    paper: '#FFFFFF', // White for cards and surfaces
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
};

// Create the theme instance
const theme = createTheme({
  palette: palette,
  
  // Define your typography (fonts)
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      color: palette.primary.dark,
    },
    h6: {
      fontWeight: 600,
    },
  },
  
  // Define default styles for components
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly more rounded buttons
          textTransform: 'none', // Buttons with normal casing, not all caps
          fontWeight: 'bold',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More rounded cards and surfaces
        },
      },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: palette.primary.dark,
            }
        }
    }
  },
});

export default theme;