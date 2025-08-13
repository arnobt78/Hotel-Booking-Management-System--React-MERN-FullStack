import { FormEvent, useState, useEffect } from "react";
import useSearchContext from "../hooks/useSearchContext";
import { MdTravelExplore } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();
  const search = useSearchContext();

  const [destination, setDestination] = useState<string>(search.destination);
  const [showDropdown, setShowDropdown] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);

  // Fetch hotel places on mount
  // You can replace this fetch with context if you already have hotel data

  useEffect(() => {
  fetch("/api/hotels")
    .then((res) => res.json())
    .then((data: { city?: string; place?: string; name?: string }[]) => {
      const uniquePlaces: string[] = Array.from(
        new Set(
          data
            .map((hotel) => hotel.city || hotel.place || hotel.name)
            .filter((place): place is string => typeof place === "string" && place.length > 0)
        )
      );
      setPlaces(uniquePlaces);
    });
}, []);

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
    search.saveSearchValues(
      destination,
      checkIn,
      checkOut,
      adultCount,
      childCount
    );
    navigate("/search");
  };

  const handleClear = () => {
    setDestination("");
    setCheckIn(minDate);
    setCheckOut(minDate);
    setAdultCount(1);
    setChildCount(0);
    search.saveSearchValues("", minDate, minDate, 1, 0);
    setShowDropdown(false);
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  return (
    <form
      onSubmit={handleSubmit}
      className="-mt-8 p-3 bg-orange-400 rounded shadow-md grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 items-center gap-4"
      autoComplete="off"
    >
      <div className="flex flex-row items-center flex-1 bg-white p-2 relative">
        <MdTravelExplore size={25} className="mr-2" />
        <input
          placeholder="Where are you going?"
          className="text-md w-full focus:outline-none"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          onFocus={() => setShowDropdown(filteredPlaces.length > 0)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        />
        {showDropdown && (
          <ul className="absolute top-full left-0 w-full bg-white border rounded shadow-lg z-10 max-h-40 overflow-y-auto">
            {filteredPlaces.map((place) => (
              <li
                key={place}
                className="px-3 py-2 cursor-pointer hover:bg-orange-100"
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

      <div>
        <DatePicker
          selected={checkIn}
          onChange={(date) => setCheckIn(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Check-in Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>
      <div>
        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Check-out Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>
      <div className="flex bg-white px-2 py-1 gap-2">
        <label className="items-center flex">
          Adults:
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={1}
            max={20}
            value={adultCount}
            onChange={(event) => setAdultCount(parseInt(event.target.value))}
          />
        </label>
        <label className="items-center flex">
          Children:
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={0}
            max={20}
            value={childCount}
            onChange={(event) => setChildCount(parseInt(event.target.value))}
          />
        </label>
      </div>
      
      <div className="flex gap-1">
        <button type="submit" className="w-2/3 bg-blue-600 text-white h-full p-2 font-bold text-xl hover:bg-blue-500">
          Search
        </button>
        <button
          type="button"
          className="w-1/3 bg-red-600 text-white h-full p-2 font-bold text-xl hover:bg-red-500"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
