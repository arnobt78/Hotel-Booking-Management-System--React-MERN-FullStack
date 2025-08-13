import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import type { BookingType } from "../../../shared/types";

const MyBookings = () => {
  const { data: hotels } = useQuery(
    "fetchMyBookings",
    apiClient.fetchMyBookings
  );

  if (!hotels || hotels.length === 0) {
    return <span>No bookings found</span>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">My Bookings History</h1>
      {hotels.map((hotel) => (
        <div key={hotel._id} className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] border border-slate-300 rounded-lg p-8 gap-5">
          <div className="lg:w-full lg:h-[250px]">
            <img
              src={hotel.imageUrls[0]}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px]">
            <div className="text-2xl font-bold">
              {hotel.name}
              <div className="text-sm font-normal">
                {hotel.city}, {hotel.country}
              </div>
            </div>
            {hotel.bookings.map((booking: BookingType) => {
              const checkInDate = new Date(booking.checkIn);
              const checkOutDate = new Date(booking.checkOut);
              const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
              const totalPrice = hotel.pricePerNight * nights;
              return (
                <div key={booking._id} className="">
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="font-bold mr-2">Dates:</span>
                      <span>
                        {checkInDate.toDateString()} - {checkOutDate.toDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">Guests:</span>
                      <span>
                        {booking.adultCount} adults, {booking.childCount} children
                      </span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">Nights:</span>
                      <span>{nights}</span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">Total Price:</span>
                      <span>£{totalPrice}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;
