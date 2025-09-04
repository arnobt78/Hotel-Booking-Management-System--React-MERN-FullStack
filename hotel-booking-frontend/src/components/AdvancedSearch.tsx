import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import useSearchContext from "../hooks/useSearchContext";

interface AdvancedSearchProps {
  onSearch: (searchData: any) => void;
  isExpanded?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  isExpanded = false,
}) => {
  const navigate = useNavigate();
  const search = useSearchContext();
  const [showAdvanced, setShowAdvanced] = useState(isExpanded);
  const [searchData, setSearchData] = useState({
    destination: search.destination,
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    adultCount: search.adultCount,
    childCount: search.childCount,
    // Advanced filters
    minPrice: "",
    maxPrice: "",
    starRating: "",
    hotelType: "",
    facilities: [] as string[],
    sortBy: "relevance",
    radius: "50", // km
    instantBooking: false,
    freeCancellation: false,
    breakfast: false,
    wifi: false,
    parking: false,
    pool: false,
    gym: false,
    spa: false,
  });

  // Dropdown functionality for destination
  const [showDropdown, setShowDropdown] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch hotel places on mount
  useEffect(() => {
    // Prevent multiple API calls - use a ref to track if we've already fetched
    if (isLoadingPlaces || hasFetchedRef.current) return;

    const fetchPlaces = async () => {
      try {
        setIsLoadingPlaces(true);
        hasFetchedRef.current = true;

        // Check if we have cached places data
        const cachedPlaces = localStorage.getItem("hotelPlaces");
        if (cachedPlaces) {
          const parsedPlaces = JSON.parse(cachedPlaces);
          const cacheTime = localStorage.getItem("hotelPlacesTime");
          const now = Date.now();

          // Cache is valid for 5 minutes
          if (cacheTime && now - parseInt(cacheTime) < 5 * 60 * 1000) {
            setPlaces(parsedPlaces);
            setIsLoadingPlaces(false);
            return;
          }
        }

        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:7002";
        const response = await fetch(`${apiBaseUrl}/api/hotels`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: { city?: string; place?: string; name?: string }[] =
          await response.json();
        const uniquePlaces: string[] = Array.from(
          new Set(
            data
              .map((hotel) => hotel.city || hotel.place || hotel.name)
              .filter(
                (place): place is string =>
                  typeof place === "string" && place.length > 0
              )
          )
        );

        // Cache the places data
        localStorage.setItem("hotelPlaces", JSON.stringify(uniquePlaces));
        localStorage.setItem("hotelPlacesTime", Date.now().toString());

        setPlaces(uniquePlaces);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setPlaces([]);
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    fetchPlaces();
  }, []); // Remove all dependencies to run only once on mount

  // Clear dropdown state when component mounts
  useEffect(() => {
    setShowDropdown(false);
    setFilteredPlaces([]);
  }, []);

  // Filter places as user types
  useEffect(() => {
    if (searchData.destination.length > 0) {
      const filtered = places.filter((place) =>
        place.toLowerCase().includes(searchData.destination.toLowerCase())
      );
      setFilteredPlaces(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  }, [searchData.destination, places]);

  const hotelTypes = [
    "Hotel",
    "Resort",
    "Motel",
    "Hostel",
    "Apartment",
    "Villa",
    "Cottage",
    "B&B",
  ];

  const facilityOptions = [
    { id: "wifi", label: "Free WiFi", icon: "📶" },
    { id: "parking", label: "Free Parking", icon: "🚗" },
    { id: "pool", label: "Swimming Pool", icon: "🏊" },
    { id: "gym", label: "Fitness Center", icon: "💪" },
    { id: "spa", label: "Spa", icon: "🧖" },
    { id: "breakfast", label: "Free Breakfast", icon: "🍳" },
    { id: "instantBooking", label: "Instant Booking", icon: "⚡" },
    { id: "freeCancellation", label: "Free Cancellation", icon: "✅" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFacilityToggle = (facilityId: string) => {
    setSearchData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId)
        ? prev.facilities.filter((f) => f !== facilityId)
        : [...prev.facilities, facilityId],
    }));
  };

  const handleSearch = () => {
    // Only proceed if destination is not empty
    if (!searchData.destination || searchData.destination.trim() === "") {
      // Show all hotels when destination is empty
      search.saveSearchValues(
        "", // Empty destination to show all hotels
        searchData.checkIn,
        searchData.checkOut,
        searchData.adultCount,
        searchData.childCount
      );

      // Close dropdown before navigation
      setShowDropdown(false);
      setFilteredPlaces([]);

      // Navigate to search page with advanced filters
      const searchParams = new URLSearchParams();
      searchParams.append("destination", ""); // Empty destination
      searchParams.append("checkIn", searchData.checkIn.toISOString());
      searchParams.append("checkOut", searchData.checkOut.toISOString());
      searchParams.append("adultCount", searchData.adultCount.toString());
      searchParams.append("childCount", searchData.childCount.toString());

      // Add advanced filters
      if (searchData.minPrice)
        searchParams.append("minPrice", searchData.minPrice);
      if (searchData.maxPrice)
        searchParams.append("maxPrice", searchData.maxPrice);
      if (searchData.starRating)
        searchParams.append("starRating", searchData.starRating);
      if (searchData.hotelType)
        searchParams.append("hotelType", searchData.hotelType);
      if (searchData.sortBy) searchParams.append("sortBy", searchData.sortBy);
      if (searchData.radius) searchParams.append("radius", searchData.radius);
      searchData.facilities.forEach((facility) =>
        searchParams.append("facilities", facility)
      );

      navigate(`/search?${searchParams.toString()}`);
      onSearch(searchData);

      // Don't clear search values immediately - let the search page use them
      // Only clear the local form state
      setTimeout(() => {
        setSearchData({
          destination: "",
          checkIn: new Date(),
          checkOut: new Date(),
          adultCount: 1,
          childCount: 0,
          minPrice: "",
          maxPrice: "",
          starRating: "",
          hotelType: "",
          facilities: [],
          sortBy: "relevance",
          radius: "50",
          instantBooking: false,
          freeCancellation: false,
          breakfast: false,
          wifi: false,
          parking: false,
          pool: false,
          gym: false,
          spa: false,
        });
        // Remove this line: search.clearSearchValues();
      }, 100);
      return;
    }

    // Update search context
    search.saveSearchValues(
      searchData.destination.trim(),
      searchData.checkIn,
      searchData.checkOut,
      searchData.adultCount,
      searchData.childCount
    );

    // Close dropdown before navigation
    setShowDropdown(false);
    setFilteredPlaces([]);

    // Navigate to search page with advanced filters
    const searchParams = new URLSearchParams();
    searchParams.append("destination", searchData.destination.trim());
    searchParams.append("checkIn", searchData.checkIn.toISOString());
    searchParams.append("checkOut", searchData.checkOut.toISOString());
    searchParams.append("adultCount", searchData.adultCount.toString());
    searchParams.append("childCount", searchData.childCount.toString());

    // Add advanced filters
    if (searchData.minPrice)
      searchParams.append("minPrice", searchData.minPrice);
    if (searchData.maxPrice)
      searchParams.append("maxPrice", searchData.maxPrice);
    if (searchData.starRating)
      searchParams.append("starRating", searchData.starRating);
    if (searchData.hotelType)
      searchParams.append("hotelType", searchData.hotelType);
    if (searchData.sortBy) searchParams.append("sortBy", searchData.sortBy);
    if (searchData.radius) searchParams.append("radius", searchData.radius);
    searchData.facilities.forEach((facility) =>
      searchParams.append("facilities", facility)
    );

    navigate(`/search?${searchParams.toString()}`);
    onSearch(searchData);

    // Don't clear search values immediately - let the search page use them
    // Only clear the local form state
    setTimeout(() => {
      setSearchData({
        destination: "",
        checkIn: new Date(),
        checkOut: new Date(),
        adultCount: 1,
        childCount: 0,
        minPrice: "",
        maxPrice: "",
        starRating: "",
        hotelType: "",
        facilities: [],
        sortBy: "relevance",
        radius: "50",
        instantBooking: false,
        freeCancellation: false,
        breakfast: false,
        wifi: false,
        parking: false,
        pool: false,
        gym: false,
        spa: false,
      });
      // Remove this line: search.clearSearchValues();
    }, 100);
  };

  const handleQuickSearch = (destination: string) => {
    if (!destination || destination.trim() === "") {
      // Show all hotels when destination is empty
      setSearchData((prev) => ({ ...prev, destination: "" }));
      setTimeout(() => handleSearch(), 100);
      return;
    }

    setSearchData((prev) => ({ ...prev, destination: destination.trim() }));
    setTimeout(() => handleSearch(), 100);
  };

  // const handleClear = () => {
  //   setSearchData({
  //     destination: "",
  //     checkIn: new Date(),
  //     checkOut: new Date(),
  //     adultCount: 1,
  //     childCount: 0,
  //     minPrice: "",
  //     maxPrice: "",
  //     starRating: "",
  //     hotelType: "",
  //     facilities: [],
  //     sortBy: "relevance",
  //     radius: "50",
  //     instantBooking: false,
  //     freeCancellation: false,
  //     breakfast: false,
  //     wifi: false,
  //     parking: false,
  //     pool: false,
  //     gym: false,
  //     spa: false,
  //   });
  //   search.clearSearchValues();
  // };

  const popularDestinations = [
    "New York",
    "London",
    "Paris",
    "Tokyo",
    "Sydney",
    "Dubai",
    "Singapore",
    "Barcelona",
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large p-8 max-w-6xl mx-auto border border-white/20">
      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Destination */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-primary-600" />
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Where are you going?"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={searchData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              onFocus={() => setShowDropdown(filteredPlaces.length > 0)}
              onBlur={() => setShowDropdown(false)}
            />
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            {showDropdown && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                {filteredPlaces.map((place) => (
                  <li
                    key={place}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                    onMouseDown={() => {
                      handleInputChange("destination", place);
                      setShowDropdown(false);
                    }}
                  >
                    {place}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Check-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary-600" />
            Check-in
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={searchData.checkIn.toISOString().split("T")[0]}
              onChange={(e) =>
                handleInputChange("checkIn", new Date(e.target.value))
              }
            />
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Check-out Date */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary-600" />
            Check-out
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={searchData.checkOut.toISOString().split("T")[0]}
              onChange={(e) =>
                handleInputChange("checkOut", new Date(e.target.value))
              }
            />
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <Users className="w-4 h-4 mr-2 text-primary-600" />
            Guests
          </label>
          <div className="relative">
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={`${searchData.adultCount} adults, ${searchData.childCount} children`}
              onChange={(e) => {
                const [adults, children] = e.target.value.split(", ");
                handleInputChange("adultCount", parseInt(adults));
                handleInputChange("childCount", parseInt(children));
              }}
            >
              <option value="1 adults, 0 children">1 adult</option>
              <option value="2 adults, 0 children">2 adults</option>
              <option value="1 adults, 1 children">1 adult, 1 child</option>
              <option value="2 adults, 1 children">2 adults, 1 child</option>
              <option value="2 adults, 2 children">2 adults, 2 children</option>
              <option value="3 adults, 0 children">3 adults</option>
              <option value="4 adults, 0 children">4 adults</option>
            </select>
            <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Advanced Search Toggle */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </button>

        <button
          onClick={handleSearch}
          className="flex items-center bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200 shadow-medium hover:shadow-large"
        >
          <SearchIcon className="w-4 h-4 mr-2" />
          Search Hotels
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6 space-y-6">
          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchData.minPrice}
                  onChange={(e) =>
                    handleInputChange("minPrice", e.target.value)
                  }
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchData.maxPrice}
                  onChange={(e) =>
                    handleInputChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Star Rating
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchData.starRating}
                onChange={(e) =>
                  handleInputChange("starRating", e.target.value)
                }
              >
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            {/* Hotel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotel Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchData.hotelType}
                onChange={(e) => handleInputChange("hotelType", e.target.value)}
              >
                <option value="">Any Type</option>
                {hotelTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Facilities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {facilityOptions.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={searchData.facilities.includes(facility.id)}
                    onChange={() => handleFacilityToggle(facility.id)}
                  />
                  <span className="text-sm text-gray-700">
                    {facility.icon} {facility.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchData.sortBy}
                onChange={(e) => handleInputChange("sortBy", e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="distance">Distance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius (km)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchData.radius}
                onChange={(e) => handleInputChange("radius", e.target.value)}
              >
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Destinations */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Popular Destinations
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularDestinations.map((destination) => (
            <button
              key={destination}
              onClick={() => handleQuickSearch(destination)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              {destination}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
