import { Link } from "react-router-dom";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiHotel, BiMoney } from "react-icons/bi";
import {
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Users,
  Star,
  Building2,
  Calendar,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import BookingLogModal from "../components/BookingLogModal";
import { useState } from "react";

const MyHotels = () => {
  const [selectedHotel, setSelectedHotel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isBookingLogOpen, setIsBookingLogOpen] = useState(false);

  const { data: hotelData } = useQueryWithLoading(
    "fetchMyHotels",
    apiClient.fetchMyHotels,
    {
      onError: () => {},
      loadingMessage: "Loading your hotels...",
    }
  );

  const handleOpenBookingLog = (hotelId: string, hotelName: string) => {
    setSelectedHotel({ id: hotelId, name: hotelName });
    setIsBookingLogOpen(true);
  };

  const handleCloseBookingLog = () => {
    setIsBookingLogOpen(false);
    setSelectedHotel(null);
  };

  if (!hotelData) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
          <BsBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Hotels Found
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't added any hotels yet.
          </p>
          <Link
            to="/add-hotel"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Hotel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Hotels</h1>
          <p className="text-gray-600 mt-1">
            Manage your hotel listings and bookings
          </p>
        </div>
        <Link
          to="/add-hotel"
          className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200 shadow-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Hotel
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hotels</p>
              <p className="text-2xl font-bold text-gray-900">
                {hotelData.length}
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-xl">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {hotelData.reduce(
                  (sum, hotel) => sum + (hotel.totalBookings || 0),
                  0
                )}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                £
                {hotelData
                  .reduce((sum, hotel) => sum + (hotel.totalRevenue || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {hotelData.length > 0
                  ? (
                      hotelData.reduce(
                        (sum, hotel) => sum + (hotel.averageRating || 0),
                        0
                      ) / hotelData.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {hotelData.map((hotel) => (
          <div
            key={hotel._id}
            data-testid="hotel-card"
            className="bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full"
          >
            {/* Hotel Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={hotel.imageUrls[0]}
                alt={hotel.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <Badge className="bg-primary-600 text-white">
                  £{hotel.pricePerNight}/night
                </Badge>
                {hotel.isFeatured && (
                  <Badge className="bg-yellow-500 text-white">Featured</Badge>
                )}
              </div>

              <div className="absolute top-4 right-4">
                <Badge className="bg-white/90 text-gray-800">
                  <Star className="w-3 h-3 mr-1 text-yellow-500" />
                  {hotel.starRating}
                </Badge>
              </div>
            </div>

            {/* Hotel Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {hotel.name}
              </h2>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {hotel.description}
              </p>

              {/* Hotel Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BsMap className="w-4 h-4 text-primary-600" />
                  <span>
                    {hotel.city}, {hotel.country}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BsBuilding className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1 min-h-[24px]">
                    {Array.isArray(hotel.type) ? (
                      hotel.type.map((type, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {hotel.type}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BiMoney className="w-4 h-4 text-primary-600" />
                  <span>£{hotel.pricePerNight} per night</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BiHotel className="w-4 h-4 text-primary-600" />
                  <span>
                    {hotel.adultCount} adults, {hotel.childCount} children
                  </span>
                </div>
              </div>

              {/* Hotel Stats */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl mt-auto">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {hotel.totalBookings || 0}
                  </p>
                  <p className="text-xs text-gray-600">Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    £{(hotel.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {hotel.averageRating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Link
                  to={`/edit-hotel/${hotel._id}`}
                  className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-center flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Hotel
                </Link>
                <Link
                  to={`/detail/${hotel._id}`}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
                <button
                  onClick={() => handleOpenBookingLog(hotel._id, hotel.name)}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors text-center flex items-center justify-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Booking Log
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Log Modal */}
      {selectedHotel && (
        <BookingLogModal
          isOpen={isBookingLogOpen}
          onClose={handleCloseBookingLog}
          hotelId={selectedHotel.id}
          hotelName={selectedHotel.name}
        />
      )}
    </div>
  );
};

export default MyHotels;
