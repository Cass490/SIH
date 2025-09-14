export interface User {
  id: string;
  email: string;
  name: string;
  farmingExperience: string;
  farmSize: number;
  location: string;
  preferredCrops: string[];
  farmingGoals: string;
  phone?: string;
  createdAt: string;
}

export interface Farm {
  _id: string;
  userId: string;
  farmName: string;
  latitude: number;
  longitude: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
  createdAt: string;
  updatedAt: string;
}

export interface CropRecommendation {
  cropName: string;
  confidence: number;
  expectedYield: number;
  estimatedProfit: number;
  sustainabilityScore: number;
  waterRequirement: string;
  growthDuration: number;
  marketDemand: string;
  riskLevel: string;
}

export interface RecommendationResponse {
  recommendations: CropRecommendation[];
  soilAnalysis: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    pH: number;
  };
  weatherForecast: any;
  marketInsights: any;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (signupData: SignupData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  farmingExperience: string;
  farmSize: number;
  location: string;
  preferredCrops: string[];
  farmingGoals: string;
  phone?: string;
}

export interface MarketData {
  crop: string;
  currentPrice: number;
  priceChange: number;
  trend: 'up' | 'down' | 'stable';
  forecast: {
    date: string;
    price: number;
  }[];
}