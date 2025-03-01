import React, { useState, useEffect } from 'react';
import { Home, Bath, Building2, MapPin, Calculator, Server } from 'lucide-react';

function App() {
  const [sqft, setSqft] = useState<string>("1000");
  const [bhk, setBhk] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [location, setLocation] = useState<string>("");
  const [locations, setLocations] = useState<string[]>([]);
  const [estimatedPrice, setEstimatedPrice] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    // Check if backend is running and fetch locations
    checkBackendAndFetchLocations();
  }, []);

  const checkBackendAndFetchLocations = async () => {
    try {
      setIsLoading(true);
      setBackendStatus("checking");
      
      // Try to connect to the backend
      const response = await fetch('http://127.0.0.1:5000/get_location_names', {
        signal: AbortSignal.timeout(5000) // Timeout after 5 seconds
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackendStatus("online");
        
        if (data && data.locations) {
          setLocations(data.locations);
        } else {
          setError("Backend returned invalid data format");
        }
      } else {
        setBackendStatus("offline");
        setError("Backend server returned an error");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setBackendStatus("offline");
      setError("Cannot connect to the backend server. Please make sure it's running at http://127.0.0.1:5000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstimatePrice = async () => {
    if (!sqft || !location) {
      setError("Please fill all the fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Create form data for the POST request
      const formData = new FormData();
      formData.append('total_sqft', sqft);
      formData.append('bhk', bhk.toString());
      formData.append('bath', bathrooms.toString());
      formData.append('location', location);
      
      // Make the POST request to the backend
      const response = await fetch('http://127.0.0.1:5000/predict_home_price', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.estimated_price !== undefined) {
        setEstimatedPrice(data.estimated_price.toString());
      } else {
        setError("Failed to get price estimation from server");
      }
    } catch (error) {
      console.error("Error estimating price:", error);
      setError("Failed to get price estimation. Please make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBackendStatus = () => {
    if (backendStatus === "checking") {
      return (
        <div className="flex items-center justify-center mb-4 p-2 bg-blue-500/30 border border-blue-500/50 rounded-lg text-white">
          <Server className="mr-2 animate-pulse" size={18} />
          <span>Connecting to backend server...</span>
        </div>
      );
    } else if (backendStatus === "offline") {
      return (
        <div className="mb-4 p-3 bg-red-500/30 border border-red-500/50 rounded-lg text-white">
          <div className="flex items-center mb-2">
            <Server className="mr-2 text-red-400" size={18} />
            <span className="font-medium">Backend server is not available</span>
          </div>
          <p className="text-sm">
            Please make sure your Flask backend is running at http://127.0.0.1:5000
          </p>
          <button 
            onClick={checkBackendAndFetchLocations}
            className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm flex items-center"
          >
            <span>Retry Connection</span>
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Bangalore Cityscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-center mb-6">
              <Home className="text-amber-400 mr-2" size={28} />
              <h1 className="text-2xl font-bold text-white">Bangalore Home Price Predictor</h1>
            </div>
            
            {renderBackendStatus()}
            
            {error && backendStatus !== "offline" && (
              <div className="mb-4 p-3 bg-red-500/30 border border-red-500/50 rounded-lg text-white">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              {/* Area Input */}
              <div>
                <label className="flex items-center text-white font-medium mb-2">
                  <Building2 className="mr-2 text-amber-400" size={18} />
                  Area (Square Feet)
                </label>
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter area in sqft"
                  disabled={backendStatus === "offline"}
                />
              </div>
              
              {/* BHK Selection */}
              <div>
                <label className="flex items-center text-white font-medium mb-2">
                  <Home className="mr-2 text-amber-400" size={18} />
                  BHK (Bedrooms)
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBhk(value)}
                      className={`flex-1 py-2 rounded-md transition-colors ${
                        bhk === value 
                          ? 'bg-amber-500 text-white font-medium' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      disabled={backendStatus === "offline"}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Bathrooms Selection */}
              <div>
                <label className="flex items-center text-white font-medium mb-2">
                  <Bath className="mr-2 text-amber-400" size={18} />
                  Bathrooms
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBathrooms(value)}
                      className={`flex-1 py-2 rounded-md transition-colors ${
                        bathrooms === value 
                          ? 'bg-amber-500 text-white font-medium' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      disabled={backendStatus === "offline"}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Location Selection */}
              <div>
                <label className="flex items-center text-white font-medium mb-2">
                  <MapPin className="mr-2 text-amber-400" size={18} />
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                  disabled={locations.length === 0 || isLoading || backendStatus === "offline"}
                >
                  <option value="" disabled>
                    {backendStatus === "offline" 
                      ? "Backend server offline" 
                      : locations.length === 0 
                        ? "Loading locations..." 
                        : "Select a location"}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="bg-indigo-800 text-white">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Estimate Button */}
              <button
                onClick={handleEstimatePrice}
                disabled={isLoading || !location || backendStatus === "offline"}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg text-white font-medium shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Calculator className="mr-2" size={18} />
                    Estimate Price
                  </span>
                )}
              </button>
              
              {/* Result Display */}
              {estimatedPrice && (
                <div className="mt-6 bg-white/20 border border-white/30 rounded-lg p-4 text-center">
                  <h3 className="text-white font-medium mb-1">Estimated Price</h3>
                  <p className="text-2xl font-bold text-amber-400">₹ {estimatedPrice} Lakhs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;