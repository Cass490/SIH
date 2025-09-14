/**
 * AgriAI Decision Support System - Mobile Application
 * Main App Component
 */

import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  LogBox,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as ReduxProvider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen';

// Import store and navigation
import {store, persistor} from './src/store/store';
import MainNavigator from './src/navigation/MainNavigator';
import LoadingScreen from './src/components/LoadingScreen';
import {theme} from './src/theme/theme';
import './src/services/i18n'; // Initialize internationalization

// Ignore specific warnings for development
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

const App: React.FC = () => {
  useEffect(() => {
    // Hide splash screen after app is ready
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ReduxProvider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <PaperProvider theme={theme}>
            <NavigationContainer>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.primary}
              />
              <SafeAreaView style={styles.container}>
                <MainNavigator />
              </SafeAreaView>
            </NavigationContainer>
          </PaperProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default App;