import { FormEvent, useState, useEffect, useRef } from "react";
import useSearchContext from "../hooks/useSearchContext";
import { MdTravelExplore } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

const SearchBar = () => {
  const navigate = useNavigate();
  const search = useSearchContext();

  const [destination, setDestination] = useState<string>(search.destination);
  const [showDropdown, setShowDropdown] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);
  const hasFetchedRef = useRef(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

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

        const response = await fetch("/api/hotels");

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
        setPlaces([]);
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    fetchPlaces();
  }, []); 

  // Clear dropdown state when component mounts (for search page)
  useEffect(() => {
    setShowDropdown(false);
    setFilteredPlaces([]);
    // Mark that initial mount is complete after a short delay
    setTimeout(() => {
      setIsInitialMount(false);
    }, 100);
  }, []);

  // Prevent dropdown from opening when destination is pre-filled from search context
  useEffect(() => {
    if (destination && places.length > 0) {
      const filtered = places.filter((place) =>
        place.toLowerCase().includes(destination.toLowerCase())
      );
      setFilteredPlaces(filtered);
      // Don't automatically show dropdown when destination is pre-filled
      setShowDropdown(false);
      // Reset user interaction state when destination is pre-filled
      setHasUserInteracted(false);
      // Force dropdown to stay closed during initial mount
      if (isInitialMount) {
        setShowDropdown(false);
      }
    }
  }, [destination, places, isInitialMount]);

  // Filter places as user types
  useEffect(() => {
    if (destination.length > 0) {
      const filtered = places.filter((place) =>
        place.toLowerCase().includes(destination.toLowerCase())
      );
      setFilteredPlaces(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  }, [destination, places]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    // Allow empty destination to show all hotels
    // Only proceed if destination is not empty
    if (!destination || destination.trim() === "") {
      // Show all hotels when destination is empty
      search.saveSearchValues(
        "", // Empty destination to show all hotels
        checkIn,
        checkOut,
        adultCount,
        childCount
      );

      // Close dropdown before navigation
      setShowDropdown(false);
      setFilteredPlaces([]);

      navigate("/search");

      return;
    }

    search.saveSearchValues(
      destination.trim(),
      checkIn,
      checkOut,
      adultCount,
      childCount
    );

    // Close dropdown before navigation
    setShowDropdown(false);
    setFilteredPlaces([]);

    navigate("/search");

  };

  const handleClear = () => {
    setDestination("");
    setCheckIn(minDate);
    setCheckOut(minDate);
    setAdultCount(1);
    setChildCount(0);
    search.clearSearchValues();
    setShowDropdown(false);
    setHasUserInteracted(false);
    setIsInitialMount(false);
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 items-center gap-4"
          autoComplete="off"
        >
          <div className="flex flex-row items-center flex-1 relative sm:col-span-2 lg:col-span-1">
            <MdTravelExplore
              size={20}
              className="mr-2 text-gray-500 absolute left-3 z-10"
            />
            <Input
              placeholder="Where are you going?"
              className="pl-10"
              value={destination}
              onChange={(event) => {
                setDestination(event.target.value);
                setHasUserInteracted(true);
              }}
              onFocus={() => {
                // Only show dropdown if user manually focuses and there are filtered places
                // AND we're not in initial mount state
                if (
                  filteredPlaces.length > 0 &&
                  destination.length > 0 &&
                  hasUserInteracted &&
                  !isInitialMount
                ) {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => setShowDropdown(false)}
            />
            {showDropdown && !isInitialMount && (
              <ul className="absolute top-full left-0 w-full bg-white p-2 border border-input rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                {filteredPlaces.map((place) => (
                  <li
                    key={place}
                    className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                    onMouseDown={() => {
                      setDestination(place);
                      setShowDropdown(false);
                    }}
                  >
                    {place}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sm:col-span-1">
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                  const newCheckIn = date as Date;
                  setCheckIn(newCheckIn);
                  if (!checkOut || checkOut <= newCheckIn) {
                    const nextDay = new Date(newCheckIn);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setCheckOut(nextDay);
                  }
                }}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-in Date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              wrapperClassName="min-w-full"
            />
          </div>
          <div className="sm:col-span-1">
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date as Date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn}
              maxDate={maxDate}
              placeholderText="Check-out Date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              wrapperClassName="min-w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Adults:
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={adultCount}
                onChange={(event) =>
                  setAdultCount(parseInt(event.target.value))
                }
                className="w-16"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Children:
              </label>
              <Input
                type="number"
                min={0}
                max={20}
                value={childCount}
                onChange={(event) =>
                  setChildCount(parseInt(event.target.value))
                }
                className="w-16"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-1">
            <Button
              type="submit"
              className="flex-1 items-center text-white bg-primary-600 px-6 py-2 rounded-md font-semibold hover:bg-primary-500 hover:shadow-medium transition-all duration-200 group"
            >
              Search
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 items-center text-white bg-gray-500 px-6 py-2 rounded-md font-semibold hover:bg-gray-400 hover:shadow-medium transition-all duration-200 group"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchBar;
