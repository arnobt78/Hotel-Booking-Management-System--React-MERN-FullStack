import { FormEvent, useState, useEffect } from "react";
import useSearchContext from "../hooks/useSearchContext";
import { useHotelPlaces } from "../hooks/useHotelPlaces";
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
  // Shared with AdvancedSearch — clears + refetches on hotel CRUD
  const { places } = useHotelPlaces();

  const [destination, setDestination] = useState<string>(search.destination);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

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
        place.toLowerCase().includes(destination.toLowerCase()),
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
        place.toLowerCase().includes(destination.toLowerCase()),
      );
      setFilteredPlaces(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  }, [destination, places]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Allow empty destination to show all hotels
    // Only proceed if destination is not empty
    if (!destination || destination.trim() === "") {
      // Show all hotels when destination is empty
      search.saveSearchValues(
        "", // Empty destination to show all hotels
        checkIn,
        checkOut,
        adultCount,
        childCount,
      );

      // Close dropdown before navigation
      setShowDropdown(false);
      setFilteredPlaces([]);

      navigate("/search");

      // Don't clear search values immediately - let the search page use them
      // Only clear the local form state
      setTimeout(() => {
        setDestination("");
        setCheckIn(minDate);
        setCheckOut(minDate);
        setAdultCount(1);
        setChildCount(0);
        // Remove this line: search.clearSearchValues();
      }, 100);
      return;
    }

    search.saveSearchValues(
      destination.trim(),
      checkIn,
      checkOut,
      adultCount,
      childCount,
    );

    // Close dropdown before navigation
    setShowDropdown(false);
    setFilteredPlaces([]);

    navigate("/search");

    // Don't clear search values immediately - let the search page use them
    // Only clear the local form state
    setTimeout(() => {
      setDestination("");
      setCheckIn(minDate);
      setCheckOut(minDate);
      setAdultCount(1);
      setChildCount(0);
      // Remove this line: search.clearSearchValues();
    }, 100);
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
              className=" text-gray-500 absolute left-3 z-10"
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
              <ul className="absolute top-full left-0 w-full bg-white p-2 border border-input rounded-xl shadow-xl z-10 max-h-40 overflow-y-auto">
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
              onChange={(date) => setCheckIn(date as Date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-in Date"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
              wrapperClassName="min-w-full"
            />
          </div>
          <div className="sm:col-span-1">
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date as Date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-out Date"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="flex-1 items-center text-white bg-primary-600 px-6 py-2 rounded-xl font-medium hover:bg-primary-500 hover:shadow-medium transition-all duration-200 group"
            >
              Search
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 items-center text-white bg-gray-500 px-6 py-2 rounded-xl font-medium hover:bg-gray-400 hover:shadow-medium transition-all duration-200 group"
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
