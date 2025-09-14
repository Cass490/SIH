/**
 * Home Screen - Main screen with crop recommendations
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  ProgressBar,
  Avatar,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import {useAppDispatch, useAppSelector} from '../hooks/redux';
import {getLocation} from '../services/locationService';
import {fetchRecommendations} from '../store/slices/recommendationsSlice';
import WeatherCard from '../components/WeatherCard';
import SoilDataCard from '../components/SoilDataCard';
import CropRecommendationCard from '../components/CropRecommendationCard';
import {theme} from '../theme/theme';

interface LocationData {
  latitude: number;
  longitude: number;
  area_hectares: number;
}

const HomeScreen: React.FC = ({navigation}: any) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  
  const {recommendations, loading, error, weather, soil} = useAppSelector(
    state => state.recommendations,
  );
  const {user} = useAppSelector(state => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Get user location
      const locationData = await getLocation();
      const farmLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        area_hectares: user?.farmSize || 1.0,
      };
      
      setLocation(farmLocation);
      
      // Fetch recommendations
      dispatch(fetchRecommendations({
        location: farmLocation,
        budget: user?.budget,
        previous_crops: user?.previousCrops || [],
        farming_experience: user?.experience || 'beginner',
      }));
    } catch (error) {
      Alert.alert(
        t('error.title'),
        t('error.location_access'),
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  };

  const handleCropSelect = (cropName: string) => {
    navigation.navigate('CropDetails', {cropName});
  };

  const handleAddFarmData = () => {
    navigation.navigate('FarmProfile');
  };

  const handleTakePicture = () => {
    navigation.navigate('CropCamera');
  };

  const renderWelcomeSection = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryContainer]}
      style={styles.welcomeSection}>
      <View style={styles.welcomeContent}>
        <Avatar.Icon
          size={60}
          icon="agriculture"
          style={styles.avatar}
        />
        <View style={styles.welcomeText}>
          <Title style={styles.welcomeTitle}>
            {t('home.welcome', {name: user?.name || t('common.farmer')})}
          </Title>
          <Paragraph style={styles.welcomeSubtitle}>
            {t('home.subtitle')}
          </Paragraph>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <Icon name="landscape" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>
            {location?.area_hectares?.toFixed(1) || '0'} {t('common.hectares')}
          </Text>
          <Text style={styles.statLabel}>{t('home.farm_size')}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <Icon name="trending-up" size={24} color={theme.colors.secondary} />
          <Text style={styles.statValue}>
            {recommendations?.length || 0}
          </Text>
          <Text style={styles.statLabel}>{t('home.recommendations')}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <Icon name="eco" size={24} color={theme.colors.tertiary} />
          <Text style={styles.statValue}>
            {weather?.current?.temperature?.toFixed(0) || '--'}°C
          </Text>
          <Text style={styles.statLabel}>{t('home.temperature')}</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleTakePicture}>
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.secondaryContainer]}
          style={styles.actionButtonGradient}>
          <Icon name="camera-alt" size={24} color="white" />
          <Text style={styles.actionButtonText}>{t('home.scan_crop')}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleAddFarmData}>
        <LinearGradient
          colors={[theme.colors.tertiary, theme.colors.tertiaryContainer]}
          style={styles.actionButtonGradient}>
          <Icon name="edit-location" size={24} color="white" />
          <Text style={styles.actionButtonText}>{t('home.farm_profile')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderRecommendations = () => {
    if (loading) {
      return (
        <Card style={styles.loadingCard}>
          <Card.Content>
            <Title>{t('home.loading_recommendations')}</Title>
            <ProgressBar indeterminate color={theme.colors.primary} />
            <Paragraph style={styles.loadingText}>
              {t('home.analyzing_conditions')}
            </Paragraph>
          </Card.Content>
        </Card>
      );
    }

    if (error) {
      return (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Title>{t('error.title')}</Title>
            <Paragraph>{error}</Paragraph>
            <Button onPress={onRefresh} mode="contained" style={styles.retryButton}>
              {t('common.retry')}
            </Button>
          </Card.Content>
        </Card>
      );
    }

    if (!recommendations || recommendations.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Title>{t('home.no_recommendations')}</Title>
            <Paragraph>{t('home.add_farm_data_prompt')}</Paragraph>
            <Button
              onPress={handleAddFarmData}
              mode="contained"
              style={styles.addDataButton}>
              {t('home.add_farm_data')}
            </Button>
          </Card.Content>
        </Card>
      );
    }

    return (
      <View style={styles.recommendationsContainer}>
        <Title style={styles.sectionTitle}>{t('home.recommended_crops')}</Title>
        {recommendations.map((recommendation, index) => (
          <CropRecommendationCard
            key={index}
            recommendation={recommendation}
            onPress={() => handleCropSelect(recommendation.crop_name)}
            style={styles.recommendationCard}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {renderWelcomeSection()}
      {renderQuickStats()}
      {renderActionButtons()}
      
      <View style={styles.contentContainer}>
        {weather && <WeatherCard weather={weather} style={styles.weatherCard} />}
        {soil && <SoilDataCard soil={soil} style={styles.soilCard} />}
        {renderRecommendations()}
      </View>

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={onRefresh}
        loading={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  welcomeText: {
    flex: 1,
    marginLeft: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: theme.colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 4,
  },
  actionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  weatherCard: {
    marginBottom: 16,
  },
  soilCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onBackground,
  },
  recommendationsContainer: {
    marginBottom: 100,
  },
  recommendationCard: {
    marginBottom: 12,
  },
  loadingCard: {
    marginVertical: 16,
    elevation: 2,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 12,
    color: theme.colors.onSurfaceVariant,
  },
  errorCard: {
    marginVertical: 16,
    elevation: 2,
  },
  retryButton: {
    marginTop: 12,
  },
  emptyCard: {
    marginVertical: 16,
    elevation: 2,
  },
  addDataButton: {
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default HomeScreen;