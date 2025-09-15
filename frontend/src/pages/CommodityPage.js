import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MapPin, Calendar, Search, RefreshCw, Wheat, BarChart3, IndianRupee, Package } from 'lucide-react';

const CommodityPage= () => {
  const [commodityData, setCommodityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedCommodity, setSelectedCommodity] = useState('Rice');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null);

  const states = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const commodities = [
    'Rice', 'Wheat', 'Jowar', 'Bajra', 'Maize', 'Barley', 'Gram', 'Tur', 'Moong',
    'Urad', 'Masoor', 'Groundnut', 'Sesamum', 'Nigerseed', 'Safflower', 'Sunflower',
    'Soyabean', 'Castor Seed', 'Cotton', 'Jute', 'Sugarcane', 'Potato', 'Onion',
    'Tomato', 'Brinjal', 'Cabbage', 'Cauliflower', 'Okra', 'Green Chilli'
  ];

  const fetchCommodityData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call to AgMarkNet
      // In reality, you'd call: https://agmarknet.gov.in/SearchCmmMkt.aspx?Tx_Commodity=Rice&Tx_State=Maharashtra&Tx_District=All&Tx_Market=All&DateFrom=2024-01-01&DateTo=2024-01-01&Fr_Date=01/01/2024&To_Date=01/01/2024&Tx_Commodity_Head=Rice&Tx_AddInfo=0
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data structure based on AgMarkNet format
      const mockMarkets = [
        'Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati'
      ];

      const mockData = {
        commodity: selectedCommodity,
        state: selectedState,
        date: selectedDate,
        summary: {
          totalMarkets: mockMarkets.length,
          avgMinPrice: Math.floor(Math.random() * 2000) + 1500,
          avgMaxPrice: Math.floor(Math.random() * 3000) + 2500,
          avgModalPrice: Math.floor(Math.random() * 2500) + 2000,
          totalArrivals: Math.floor(Math.random() * 10000) + 5000
        },
        markets: mockMarkets.map(market => {
          const minPrice = Math.floor(Math.random() * 2000) + 1200;
          const maxPrice = minPrice + Math.floor(Math.random() * 1000) + 500;
          const modalPrice = Math.floor((minPrice + maxPrice) / 2) + Math.floor(Math.random() * 200) - 100;
          
          return {
            market: market,
            district: market,
            minPrice: minPrice,
            maxPrice: maxPrice,
            modalPrice: modalPrice,
            arrivals: Math.floor(Math.random() * 1000) + 100,
            priceUnit: 'Rs/Quintal',
            arrivalUnit: 'Tonnes',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: (Math.random() * 10 - 5).toFixed(2)
          };
        }),
        priceHistory: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          price: Math.floor(Math.random() * 500) + 2000
        }))
      };

      setCommodityData(mockData);
    } catch (err) {
      setError('Failed to fetch commodity data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommodityData();
  }, [selectedState, selectedCommodity, selectedDate]);

  const PriceCard = ({ title, price, unit, icon: Icon, trend, change }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <div className="flex items-center mt-2">
            <IndianRupee className="w-5 h-5 text-gray-700 mr-1" />
            <p className="text-2xl font-bold text-gray-900">{price?.toLocaleString()}</p>
            <span className="text-sm text-gray-500 ml-2">/{unit}</span>
          </div>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{Math.abs(change)}% from yesterday</span>
            </div>
          )}
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <Icon className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </div>
  );

  const MarketCard = ({ market }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-orange-500" />
            {market.market}
          </h3>
          <p className="text-sm text-gray-600">{market.district} District</p>
        </div>
        <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
          market.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {market.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {Math.abs(market.change)}%
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs font-medium text-blue-600 uppercase">Min Price</p>
          <p className="text-lg font-bold text-blue-900">₹{market.minPrice.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs font-medium text-purple-600 uppercase">Max Price</p>
          <p className="text-lg font-bold text-purple-900">₹{market.maxPrice.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs font-medium text-green-600 uppercase">Modal Price</p>
          <p className="text-lg font-bold text-green-900">₹{market.modalPrice.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs font-medium text-orange-600 uppercase">Arrivals</p>
          <p className="text-lg font-bold text-orange-900">{market.arrivals} {market.arrivalUnit}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Wheat className="w-12 h-12 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              AgMarkNet Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time agricultural commodity prices and market arrivals from government-regulated mandis across India
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Commodity
              </label>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {commodities.map(commodity => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchCommodityData}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Loading...' : 'Get Prices'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
            <p className="text-red-600 text-sm mt-2">
              Note: This demo uses mock data as the actual AgMarkNet API may require authentication or have CORS restrictions.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-600 mb-4" />
            <p className="text-gray-600">Fetching commodity data from AgMarkNet...</p>
          </div>
        )}

        {/* Data Display */}
        {commodityData && !loading && (
          <div className="space-y-8">
            {/* Summary Header */}
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg shadow-md p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <h3 className="text-2xl font-bold">{commodityData.summary.totalMarkets}</h3>
                  <p className="opacity-90">Active Markets</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">₹{commodityData.summary.avgModalPrice?.toLocaleString()}</h3>
                  <p className="opacity-90">Avg Modal Price</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{(commodityData.summary.totalArrivals / 1000).toFixed(1)}K</h3>
                  <p className="opacity-90">Total Arrivals (Tonnes)</p>
                </div>
                <div className="flex items-center justify-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <div>
                    <h3 className="text-lg font-bold">{new Date(selectedDate).toLocaleDateString()}</h3>
                    <p className="opacity-90">Report Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PriceCard
                title="Average Min Price"
                price={commodityData.summary.avgMinPrice}
                unit="Quintal"
                icon={TrendingDown}
                trend="down"
                change="2.5"
              />
              <PriceCard
                title="Average Max Price"
                price={commodityData.summary.avgMaxPrice}
                unit="Quintal"
                icon={TrendingUp}
                trend="up"
                change="3.2"
              />
              <PriceCard
                title="Average Modal Price"
                price={commodityData.summary.avgModalPrice}
                unit="Quintal"
                icon={BarChart3}
                trend="up"
                change="1.8"
              />
            </div>

            {/* Market-wise Data */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-3 text-orange-600" />
                Market-wise Price & Arrival Data
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commodityData.markets.map((market, index) => (
                  <MarketCard key={index} market={market} />
                ))}
              </div>
            </div>

            {/* API Information */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-3">API Information</h3>
              <div className="text-sm text-orange-700 space-y-2">
                <p><strong>Data Source:</strong> AgMarkNet Portal - Ministry of Agriculture & Farmers Welfare</p>
                <p><strong>Update Frequency:</strong> Daily (Market working days)</p>
                <p><strong>Price Unit:</strong> Rupees per Quintal</p>
                <p><strong>Arrival Unit:</strong> Tonnes</p>
                <p><strong>Coverage:</strong> {commodityData.summary.totalMarkets} regulated markets in {selectedState}</p>
                <p className="text-xs mt-3 text-orange-600">
                  Note: This dashboard uses mock data for demonstration. Actual implementation would require AgMarkNet API integration or data.gov.in CSV/JSON feeds.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommodityPage;