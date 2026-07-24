import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Star,
  Building2,
  Sparkles,
  ArrowUpDown,
  CircleDot,
} from "lucide-react";
import useSearchContext from "../hooks/useSearchContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import FilterSectionLabel from "./FilterSectionLabel";

interface AdvancedSearchProps {
  onSearch: (searchData: unknown) => void;
  isExpanded?: boolean;
}

const GUEST_OPTIONS = [
  { value: "1-0", label: "1 adult", adults: 1, children: 0 },
  { value: "2-0", label: "2 adults", adults: 2, children: 0 },
  { value: "1-1", label: "1 adult, 1 child", adults: 1, children: 1 },
  { value: "2-1", label: "2 adults, 1 child", adults: 2, children: 1 },
  { value: "2-2", label: "2 adults, 2 children", adults: 2, children: 2 },
  { value: "3-0", label: "3 adults", adults: 3, children: 0 },
  { value: "4-0", label: "4 adults", adults: 4, children: 0 },
] as const;

const inputFocusClass =
  "pl-10 h-11 text-gray-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0 focus-visible:border-primary-500";

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
    minPrice: "",
    maxPrice: "",
    starRating: "",
    hotelType: "",
    facilities: [] as string[],
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

  const [showDropdown, setShowDropdown] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const hasFetchedRef = useRef(false);

  // Unique cities from live hotels (also powers Popular Destinations chips)
  useEffect(() => {
    if (isLoadingPlaces || hasFetchedRef.current) return;

    const fetchPlaces = async () => {
      try {
        setIsLoadingPlaces(true);
        hasFetchedRef.current = true;

        const cachedPlaces = localStorage.getItem("hotelPlaces");
        if (cachedPlaces) {
          const parsedPlaces = JSON.parse(cachedPlaces) as string[];
          const cacheTime = localStorage.getItem("hotelPlacesTime");
          const now = Date.now();
          if (cacheTime && now - parseInt(cacheTime, 10) < 5 * 60 * 1000) {
            setPlaces(parsedPlaces);
            setIsLoadingPlaces(false);
            return;
          }
        }

        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
        const response = await fetch(`${apiBaseUrl}/api/hotels`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: { city?: string; place?: string; name?: string }[] =
          await response.json();
        const uniquePlaces: string[] = Array.from(
          new Set(
            data
              .map((hotel) => hotel.city || hotel.place)
              .filter(
                (place): place is string =>
                  typeof place === "string" && place.length > 0,
              ),
          ),
        );

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
  }, []);

  useEffect(() => {
    setShowDropdown(false);
    setFilteredPlaces([]);
  }, []);

  useEffect(() => {
    if (searchData.destination.length > 0) {
      const filtered = places.filter((place) =>
        place.toLowerCase().includes(searchData.destination.toLowerCase()),
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

  const guestValue = useMemo(() => {
    const match = GUEST_OPTIONS.find(
      (o) =>
        o.adults === searchData.adultCount &&
        o.children === searchData.childCount,
    );
    return match?.value ?? "1-0";
  }, [searchData.adultCount, searchData.childCount]);

  const handleInputChange = (field: string, value: unknown) => {
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

  const resetLocalForm = () => {
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
  };

  const buildAndNavigate = (destination: string) => {
    search.saveSearchValues(
      destination,
      searchData.checkIn,
      searchData.checkOut,
      searchData.adultCount,
      searchData.childCount,
    );
    setShowDropdown(false);
    setFilteredPlaces([]);

    const searchParams = new URLSearchParams();
    searchParams.append("destination", destination);
    searchParams.append("checkIn", searchData.checkIn.toISOString());
    searchParams.append("checkOut", searchData.checkOut.toISOString());
    searchParams.append("adultCount", searchData.adultCount.toString());
    searchParams.append("childCount", searchData.childCount.toString());
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
      searchParams.append("facilities", facility),
    );

    navigate(`/search?${searchParams.toString()}`);
    onSearch(searchData);
    setTimeout(resetLocalForm, 100);
  };

  const handleSearch = () => {
    const dest = (searchData.destination || "").trim();
    buildAndNavigate(dest);
  };

  const handleQuickSearch = (destination: string) => {
    setSearchData((prev) => ({ ...prev, destination: destination.trim() }));
    setTimeout(() => {
      buildAndNavigate(destination.trim());
    }, 50);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large p-6 sm:p-8 w-full border border-white/20">
      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="space-y-2">
          <FilterSectionLabel icon={MapPin} title="Destination" className="mb-0" />
          <div className="relative">
            <Input
              type="text"
              placeholder="Where are you going?"
              className={inputFocusClass}
              value={searchData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              onFocus={() => setShowDropdown(filteredPlaces.length > 0)}
              onBlur={() => setShowDropdown(false)}
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            {showDropdown && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                {filteredPlaces.map((place) => (
                  <li
                    key={place}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
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

        <div className="space-y-2">
          <FilterSectionLabel icon={Calendar} title="Check-in" className="mb-0" />
          <div className="relative">
            <Input
              type="date"
              className={inputFocusClass}
              value={searchData.checkIn.toISOString().split("T")[0]}
              onChange={(e) =>
                handleInputChange("checkIn", new Date(e.target.value))
              }
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <FilterSectionLabel icon={Calendar} title="Check-out" className="mb-0" />
          <div className="relative">
            <Input
              type="date"
              className={inputFocusClass}
              value={searchData.checkOut.toISOString().split("T")[0]}
              onChange={(e) =>
                handleInputChange("checkOut", new Date(e.target.value))
              }
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <FilterSectionLabel icon={Users} title="Guests" className="mb-0" />
          <Select
            value={guestValue}
            onValueChange={(v) => {
              const opt = GUEST_OPTIONS.find((o) => o.value === v);
              if (!opt) return;
              handleInputChange("adultCount", opt.adults);
              handleInputChange("childCount", opt.children);
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Guests" />
            </SelectTrigger>
            <SelectContent>
              {GUEST_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
        </button>

        <Button
          type="button"
          onClick={handleSearch}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          <SearchIcon className="w-4 h-4 mr-2" />
          Search Hotels
        </Button>
      </div>

      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FilterSectionLabel
                icon={DollarSign}
                title="Price Range"
                subtitle="Min and max per night"
              />
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="text-gray-700"
                  value={searchData.minPrice}
                  onChange={(e) =>
                    handleInputChange("minPrice", e.target.value)
                  }
                />
                <span className="flex items-center text-gray-500">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="text-gray-700"
                  value={searchData.maxPrice}
                  onChange={(e) =>
                    handleInputChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <FilterSectionLabel icon={Star} title="Star Rating" />
              <Select
                value={searchData.starRating || "any"}
                onValueChange={(v) =>
                  handleInputChange("starRating", v === "any" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <FilterSectionLabel icon={Building2} title="Hotel Type" />
              <Select
                value={searchData.hotelType || "any"}
                onValueChange={(v) =>
                  handleInputChange("hotelType", v === "any" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Type</SelectItem>
                  {hotelTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <FilterSectionLabel
              icon={Sparkles}
              title="Facilities"
              subtitle="Select amenities you need"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {facilityOptions.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center space-x-2 cursor-pointer text-gray-700"
                >
                  <Checkbox
                    checked={searchData.facilities.includes(facility.id)}
                    onCheckedChange={() => handleFacilityToggle(facility.id)}
                  />
                  <span className="text-sm">
                    {facility.icon} {facility.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort / radius — pb-6 before Popular Destinations separator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            <div>
              <FilterSectionLabel icon={ArrowUpDown} title="Sort By" />
              <Select
                value={searchData.sortBy}
                onValueChange={(v) => handleInputChange("sortBy", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="priceLow">Price: Low to High</SelectItem>
                  <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <FilterSectionLabel
                icon={CircleDot}
                title="Search Radius (km)"
              />
              <Select
                value={searchData.radius}
                onValueChange={(v) => handleInputChange("radius", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic destinations from hotel cities */}
      <div className="border-t border-gray-200 pt-6">
        <FilterSectionLabel
          icon={MapPin}
          title="Popular Destinations"
          subtitle="Based on hotels in our catalog"
        />
        <div className="flex flex-wrap gap-2">
          {places.length === 0 ? (
            <p className="text-sm text-gray-500">
              {isLoadingPlaces ? "Loading destinations…" : "No destinations yet"}
            </p>
          ) : (
            places.map((destination) => (
              <button
                key={destination}
                type="button"
                onClick={() => handleQuickSearch(destination)}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors px-3 py-1 text-sm"
                >
                  {destination}
                </Badge>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
