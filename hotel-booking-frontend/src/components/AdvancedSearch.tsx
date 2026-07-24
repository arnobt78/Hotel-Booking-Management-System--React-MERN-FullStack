import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  MapPinHouse,
  MapPinned,
  Calendar,
  Users,
  User,
  DollarSign,
  Star,
  Building2,
  Building,
  Bed,
  BedDouble,
  Home,
  House,
  Coffee,
  Palmtree,
  Layers,
  Sparkles,
  ArrowUpDown,
  CircleDot,
  Eraser,
} from "lucide-react";
import useSearchContext from "../hooks/useSearchContext";
import { useHotelPlaces } from "../hooks/useHotelPlaces";
import {
  addLocalDays,
  formatDateInputValue,
  parseDateInputValue,
  startOfLocalDay,
} from "../lib/date-input";
import { SEARCH_SORT_OPTIONS } from "../lib/select-option-maps";
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
import { SelectOptionLabel } from "./ui/select-option-label";
import FilterSectionLabel from "./FilterSectionLabel";

interface AdvancedSearchProps {
  onSearch: (searchData: unknown) => void;
  isExpanded?: boolean;
}

const GUEST_OPTIONS = [
  { value: "1-0", label: "1 adult", adults: 1, children: 0, icon: User },
  { value: "2-0", label: "2 adults", adults: 2, children: 0, icon: Users },
  {
    value: "1-1",
    label: "1 adult, 1 child",
    adults: 1,
    children: 1,
    icon: Users,
  },
  {
    value: "2-1",
    label: "2 adults, 1 child",
    adults: 2,
    children: 1,
    icon: Users,
  },
  {
    value: "2-2",
    label: "2 adults, 2 children",
    adults: 2,
    children: 2,
    icon: Users,
  },
  { value: "3-0", label: "3 adults", adults: 3, children: 0, icon: Users },
  { value: "4-0", label: "4 adults", adults: 4, children: 0, icon: Users },
] as const;

const STAR_RATING_OPTIONS: {
  value: string;
  label: string;
  iconClassName?: string;
}[] = [
  { value: "any", label: "Any Rating", iconClassName: "text-gray-400" },
  {
    value: "5",
    label: "5 Stars",
    iconClassName: "fill-amber-400 text-amber-500",
  },
  {
    value: "4",
    label: "4+ Stars",
    iconClassName: "fill-amber-400 text-amber-500",
  },
  {
    value: "3",
    label: "3+ Stars",
    iconClassName: "fill-amber-400 text-amber-500",
  },
  {
    value: "2",
    label: "2+ Stars",
    iconClassName: "fill-amber-400 text-amber-500",
  },
];

const HOTEL_TYPE_OPTIONS: { value: string; label: string; icon: LucideIcon }[] =
  [
    { value: "any", label: "Any Type", icon: Layers },
    { value: "Hotel", label: "Hotel", icon: Building2 },
    { value: "Resort", label: "Resort", icon: Palmtree },
    { value: "Motel", label: "Motel", icon: BedDouble },
    { value: "Hostel", label: "Hostel", icon: Bed },
    { value: "Apartment", label: "Apartment", icon: Building },
    { value: "Villa", label: "Villa", icon: Home },
    { value: "Cottage", label: "Cottage", icon: House },
    { value: "B&B", label: "B&B", icon: Coffee },
  ];

const RADIUS_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "10", label: "10 km", icon: CircleDot },
  { value: "25", label: "25 km", icon: CircleDot },
  { value: "50", label: "50 km", icon: MapPinned },
  { value: "100", label: "100 km", icon: MapPinned },
];

const inputFocusClass =
  "pl-10 h-11 text-gray-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0 focus-visible:border-primary-500";

const dateInputFocusClass =
  "pr-10 h-11 text-gray-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0 focus-visible:border-primary-500";

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  isExpanded = false,
}) => {
  const navigate = useNavigate();
  const search = useSearchContext();
  // Shared RQ + soft LS cache — invalidates on hotel CRUD via invalidateHotelQueries
  const { places, isLoadingPlaces } = useHotelPlaces();
  const [showAdvanced, setShowAdvanced] = useState(isExpanded);
  const [searchData, setSearchData] = useState({
    destination: search.destination,
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    // null until user picks — trigger shows placeholder (defaults on Search)
    adultCount: null as number | null,
    childCount: null as number | null,
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
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);

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
      setShowDropdown(true);
    } else {
      setFilteredPlaces([]);
      setShowDropdown(false);
    }
  }, [searchData.destination, places]);

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
    if (searchData.adultCount == null || searchData.childCount == null) {
      return undefined;
    }
    const match = GUEST_OPTIONS.find(
      (o) =>
        o.adults === searchData.adultCount &&
        o.children === searchData.childCount,
    );
    return match?.value;
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
      checkIn: null,
      checkOut: null,
      adultCount: null,
      childCount: null,
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
    setShowDropdown(false);
    setFilteredPlaces([]);
  };

  // Show Clear Search when any field differs from empty defaults
  const isSearchDirty = useMemo(() => {
    return (
      searchData.destination.trim().length > 0 ||
      searchData.checkIn != null ||
      searchData.checkOut != null ||
      searchData.adultCount != null ||
      searchData.childCount != null ||
      searchData.minPrice !== "" ||
      searchData.maxPrice !== "" ||
      searchData.starRating !== "" ||
      searchData.hotelType !== "" ||
      searchData.facilities.length > 0 ||
      searchData.sortBy !== "relevance" ||
      searchData.radius !== "50"
    );
  }, [searchData]);

  const buildAndNavigate = (destination: string) => {
    // Local calendar defaults — never leave null ISO; checkout at least check-in + 1 day
    const today = startOfLocalDay(new Date());
    const checkIn = searchData.checkIn
      ? startOfLocalDay(searchData.checkIn)
      : today;
    const checkOutCandidate = searchData.checkOut
      ? startOfLocalDay(searchData.checkOut)
      : addLocalDays(checkIn, 1);
    const resolvedCheckOut =
      checkOutCandidate.getTime() <= checkIn.getTime()
        ? addLocalDays(checkIn, 1)
        : checkOutCandidate;
    // Guests placeholder → default 1 adult / 0 children on Search
    const adultCount = searchData.adultCount ?? 1;
    const childCount = searchData.childCount ?? 0;

    search.saveSearchValues(
      destination,
      checkIn,
      resolvedCheckOut,
      adultCount,
      childCount,
    );
    setShowDropdown(false);
    setFilteredPlaces([]);

    const searchParams = new URLSearchParams();
    searchParams.append("destination", destination);
    searchParams.append("checkIn", checkIn.toISOString());
    searchParams.append("checkOut", resolvedCheckOut.toISOString());
    searchParams.append("adultCount", adultCount.toString());
    searchParams.append("childCount", childCount.toString());
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
    onSearch({
      ...searchData,
      checkIn,
      checkOut: resolvedCheckOut,
      adultCount,
      childCount,
    });
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
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large p-4 sm:p-6 w-full border border-white/20 max-w-7xl mx-auto">
      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
        <div className="space-y-2">
          <FilterSectionLabel
            icon={MapPin}
            title="Destination"
            className="mb-0"
          />
          <div className="relative">
            <Input
              type="text"
              placeholder="Where are you going?"
              className={inputFocusClass}
              value={searchData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              onFocus={() => setShowDropdown(searchData.destination.length > 0)}
              onBlur={() => setShowDropdown(false)}
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            {showDropdown && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-40 overflow-y-auto mt-1">
                {filteredPlaces.length === 0 ? (
                  <li className="px-4 py-2 text-sm text-gray-500">
                    No destination found in our hotel locations
                  </li>
                ) : (
                  filteredPlaces.map((place) => (
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
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <FilterSectionLabel
            icon={Calendar}
            title="Check-in"
            className="mb-0"
          />
          <div className="relative">
            <Input
              type="date"
              className={dateInputFocusClass}
              value={formatDateInputValue(searchData.checkIn)}
              onChange={(e) =>
                handleInputChange(
                  "checkIn",
                  parseDateInputValue(e.target.value),
                )
              }
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 opacity-70 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <FilterSectionLabel
            icon={Calendar}
            title="Check-out"
            className="mb-0"
          />
          <div className="relative">
            <Input
              type="date"
              className={dateInputFocusClass}
              value={formatDateInputValue(searchData.checkOut)}
              onChange={(e) =>
                handleInputChange(
                  "checkOut",
                  parseDateInputValue(e.target.value),
                )
              }
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 opacity-70 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <FilterSectionLabel icon={Users} title="Guests" className="mb-0" />
          {/* key remounts when cleared — Radix Select does not reset UI if value → undefined */}
          <Select
            key={`guests-${guestValue ?? "empty"}`}
            value={guestValue}
            onValueChange={(v) => {
              const opt = GUEST_OPTIONS.find((o) => o.value === v);
              if (!opt) return;
              setSearchData((prev) => ({
                ...prev,
                adultCount: opt.adults,
                childCount: opt.children,
              }));
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select number of guests" />
            </SelectTrigger>
            <SelectContent>
              {GUEST_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  <SelectOptionLabel icon={o.icon}>{o.label}</SelectOptionLabel>
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

        <div className="flex items-center gap-4">
          {isSearchDirty && (
            <button
              type="button"
              onClick={resetLocalForm}
              className="inline-flex items-center gap-1.5 text-sm font-normal text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Eraser className="h-4 w-4" />
              Clear Search
            </button>
          )}
          <Button
            type="button"
            onClick={handleSearch}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
          >
            <SearchIcon className="w-4 h-4 mr-2" />
            Search Hotels
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FilterSectionLabel icon={DollarSign} title="Price Range" />
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
                  {STAR_RATING_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <SelectOptionLabel
                        icon={Star}
                        iconClassName={o.iconClassName}
                      >
                        {o.label}
                      </SelectOptionLabel>
                    </SelectItem>
                  ))}
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
                  {HOTEL_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <SelectOptionLabel icon={o.icon}>
                        {o.label}
                      </SelectOptionLabel>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <FilterSectionLabel icon={Sparkles} title="Facilities" />
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
                  {SEARCH_SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <SelectOptionLabel icon={o.icon}>
                        {o.label}
                      </SelectOptionLabel>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FilterSectionLabel icon={CircleDot} title="Search Radius (km)" />
              <Select
                value={searchData.radius}
                onValueChange={(v) => handleInputChange("radius", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <SelectOptionLabel icon={o.icon}>
                        {o.label}
                      </SelectOptionLabel>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic destinations from hotel cities */}
      <div className="border-t border-gray-200 pt-6">
        <FilterSectionLabel
          icon={MapPinHouse}
          title="Popular Destinations"
          subtitle="Based on hotels in our catalog"
        />
        <div className="flex flex-wrap gap-2">
          {places.length === 0 ? (
            <p className="text-sm text-gray-500">
              {isLoadingPlaces
                ? "Loading destinations…"
                : "No destinations yet"}
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
