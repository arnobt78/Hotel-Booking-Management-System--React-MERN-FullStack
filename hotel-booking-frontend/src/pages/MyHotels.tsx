import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
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
  UserCircle,
  CreditCard,
  Power,
  Sparkles,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { SafeImage } from "../components/ui/safe-image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import BookingLogModal from "../components/BookingLogModal";
import { useState } from "react";
import useAppContext from "../hooks/useAppContext";
import { invalidateHotelQueries } from "../lib/invalidate-queries";

const MyHotels = () => {
  const { isLoggedIn, showToast } = useAppContext();
  const queryClient = useQueryClient();
  const [selectedHotel, setSelectedHotel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isBookingLogOpen, setIsBookingLogOpen] = useState(false);

  const {
    data: hotelData,
    isLoading: isHotelsLoading,
    isFetching,
  } = useQueryWithLoading("fetchMyHotels", apiClient.fetchMyHotels, {
    onError: () => {},
    loadingMessage: "Loading your hotels...",
    enabled: isLoggedIn,
  });

  // Owner isActive toggle — invalidates My Hotels + search/home/admin hotel lists
  const activeMutation = useMutation(
    ({ hotelId, isActive }: { hotelId: string; isActive: boolean }) =>
      apiClient.updateMyHotelActive(hotelId, isActive),
    {
      onSuccess: async () => {
        await invalidateHotelQueries(queryClient);
        showToast({
          title: "Hotel status updated",
          description: "Visibility updated. Lists will refresh automatically.",
          type: "SUCCESS",
        });
      },
      onError: () => {
        showToast({
          title: "Failed to update hotel status",
          description: "Please try again in a moment.",
          type: "ERROR",
        });
      },
    },
  );

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary-100">
                <Building2 className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-2xl font-medium text-gray-700">
                  My Hotels
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your hotel listings and bookings
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To view and manage your hotels, please sign in with your test
              credentials or your personal account.
            </p>
            <div className="flex flex-col gap-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-normal text-gray-700">
                  Test credentials: test@user.com / 12345678
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-normal text-gray-700">
                  Or use your own registered account
                </span>
              </div>
            </div>
            <Link to="/sign-in">
              <Button className="w-full font-medium bg-primary-600 hover:bg-primary-700 mt-4">
                <Sparkles className="h-4 w-4 mr-2 text-white" />
                Sign In to View My Hotels
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenBookingLog = (hotelId: string, hotelName: string) => {
    setSelectedHotel({ id: hotelId, name: hotelName });
    setIsBookingLogOpen(true);
  };

  const handleCloseBookingLog = () => {
    setIsBookingLogOpen(false);
    setSelectedHotel(null);
  };

  // Skeleton while query settles — avoids "No Hotels Found" flash on nav
  if (isHotelsLoading || (isFetching && hotelData === undefined)) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 rounded-2xl animate-pulse border border-gray-100"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-[420px] bg-gray-100 rounded-2xl animate-pulse border border-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!hotelData || hotelData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
          <BsBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No Hotels Found
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't added any hotels yet.
          </p>
          <Link
            to="/add-hotel"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 " />
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
          <h1 className="text-lg md:text-2xl font-medium text-gray-700">
            My Hotels
          </h1>
          <p className="text-sm md:text-lg text-gray-600 tracking-tight leading-relaxed font-normal">
            Manage your hotel listings and bookings
          </p>
        </div>
        <Link
          to="/add-hotel"
          className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200 shadow-medium"
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
              <p className="text-sm md:text-lg font-medium text-gray-700">
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
              <p className="text-sm md:text-lg font-medium text-gray-700">
                {hotelData.reduce(
                  (sum, hotel) => sum + (hotel.totalBookings || 0),
                  0,
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
              <p className="text-sm md:text-lg font-medium text-gray-700">
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
              <p className="text-sm md:text-lg font-medium text-gray-700">
                {hotelData.length > 0
                  ? (
                      hotelData.reduce(
                        (sum, hotel) => sum + (hotel.averageRating || 0),
                        0,
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
              <SafeImage
                src={hotel.imageUrls[0]}
                alt={hotel.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <Badge className="bg-primary-600 text-white">
                  £{hotel.pricePerNight}/night
                </Badge>
                <Badge
                  className={
                    hotel.isActive === false
                      ? "bg-slate-600 text-white"
                      : "bg-green-600 text-white"
                  }
                >
                  {hotel.isActive === false ? "Inactive" : "Active"}
                </Badge>
                {hotel.isFeatured && (
                  <Badge className="bg-yellow-500 text-white">Featured</Badge>
                )}
              </div>

              <div className="absolute top-4 right-4">
                <Badge className="bg-white/90 text-gray-700">
                  <Star className="w-3 h-3 mr-1 text-yellow-500" />
                  {typeof hotel.averageRating === "number" &&
                  hotel.averageRating > 0
                    ? hotel.averageRating.toFixed(1)
                    : hotel.starRating}
                  {hotel.reviewCount != null && hotel.reviewCount > 0
                    ? ` (${hotel.reviewCount})`
                    : ""}
                </Badge>
              </div>
            </div>

            {/* Hotel Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-medium text-gray-700 mb-2 group-hover:text-primary-600 transition-colors">
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

              {/* Hotel Stats — upcoming / completed / cancelled + rating */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-xl mt-auto">
                <div className="text-center">
                  <p className="text-lg font-medium text-primary-700">
                    {hotel.upcomingBookings ?? 0}
                  </p>
                  <p className="text-xs text-gray-600">Upcoming</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-green-700">
                    {hotel.completedBookings ?? 0}
                  </p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-red-600">
                    {hotel.cancelledBookings ?? 0}
                  </p>
                  <p className="text-xs text-gray-600">Cancelled</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700">
                    {typeof hotel.averageRating === "number"
                      ? hotel.averageRating.toFixed(1)
                      : "0.0"}
                  </p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <div className="flex space-x-3">
                  <Link
                    to={`/edit-hotel/${hotel._id}`}
                    className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-700 transition-colors text-center flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 " />
                    Edit Hotel
                  </Link>
                  <Link
                    to={`/detail/${hotel._id}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 " />
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenBookingLog(hotel._id, hotel.name)}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors text-center flex items-center justify-center"
                  >
                    <Calendar className="w-4 h-4 " />
                    Booking Log
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={activeMutation.isLoading}
                  className="w-full font-medium"
                  onClick={() =>
                    activeMutation.mutate({
                      hotelId: hotel._id,
                      isActive: hotel.isActive === false,
                    })
                  }
                >
                  <Power className="w-4 h-4 " />
                  {hotel.isActive === false
                    ? "Activate listing"
                    : "Deactivate listing"}
                </Button>
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
