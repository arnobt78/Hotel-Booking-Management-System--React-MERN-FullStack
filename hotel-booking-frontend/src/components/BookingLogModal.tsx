import React, { useState } from "react";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import { BookingType } from "../../../shared/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
// import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  Building2,
  Star,
  CreditCard,
  FileText,
  // X,
  Filter,
} from "lucide-react";

interface BookingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string;
  hotelName: string;
}

const BookingLogModal: React.FC<BookingLogModalProps> = ({
  isOpen,
  onClose,
  hotelId,
  hotelName,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data: bookings, isLoading } = useQueryWithLoading(
    "fetchHotelBookings",
    () => apiClient.fetchHotelBookings(hotelId),
    {
      enabled: isOpen && !!hotelId,
      loadingMessage: "Loading booking data...",
    }
  );

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (paymentStatus: string | undefined) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDateCategory = (checkIn: Date) => {
    const today = new Date();
    const checkInDate = new Date(checkIn);
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "past";
    } else if (diffDays <= 7) {
      return "upcoming";
    } else {
      return "future";
    }
  };

  const filteredBookings = bookings?.filter((booking: BookingType) => {
    const statusMatch =
      statusFilter === "all" || booking.status === statusFilter;
    const dateMatch =
      dateFilter === "all" || getDateCategory(booking.checkIn) === dateFilter;
    return statusMatch && dateMatch;
  });

  const groupedBookings = filteredBookings?.reduce(
    (groups: any, booking: BookingType) => {
      const category = getDateCategory(booking.checkIn);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(booking);
      return groups;
    },
    {}
  );

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "upcoming":
        return "Upcoming Bookings (Next 7 Days)";
      case "future":
        return "Future Bookings";
      case "past":
        return "Past Bookings";
      default:
        return "All Bookings";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "upcoming":
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case "future":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "past":
        return <Calendar className="w-4 h-4 text-gray-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] min-h-[600px] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-primary-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Log - {hotelName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and track all bookings for this hotel
                </p>
              </div>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming (Next 7 Days)</option>
            <option value="future">Future</option>
            <option value="past">Past</option>
          </select>
        </div>

        {/* Booking Statistics */}
        {bookings && bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Bookings
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Confirmed
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {
                        bookings.filter(
                          (b: BookingType) => b.status === "confirmed"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      £
                      {bookings
                        .filter((b: BookingType) => b.paymentStatus === "paid")
                        .reduce(
                          (sum: number, b: BookingType) =>
                            sum + (b.totalCost || 0),
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {
                        bookings.filter(
                          (b: BookingType) => b.status === "pending"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings List Container */}
        <div className="flex-1 flex flex-col">
          {/* Bookings List */}
          <div className="space-y-6 flex-1 min-h-[400px]">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading bookings...</p>
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <Building2 className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Bookings Found
                </h3>
                <p className="text-gray-500 mb-4">
                  This hotel doesn't have any bookings yet.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-blue-700">
                    When guests make bookings for this hotel, they will appear
                    here with all their details, special requests, and payment
                    information.
                  </p>
                </div>
              </div>
            ) : !filteredBookings || filteredBookings.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <Filter className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Matching Bookings
                </h3>
                <p className="text-gray-500 mb-4">
                  No bookings match your current filter criteria.
                </p>
                <div className="bg-yellow-50 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-yellow-700">
                    Try adjusting your filters:
                    {statusFilter !== "all" && (
                      <span className="block mt-1">
                        • Status: Currently filtering for "{statusFilter}"
                        bookings
                      </span>
                    )}
                    {dateFilter !== "all" && (
                      <span className="block mt-1">
                        • Date: Currently filtering for "{dateFilter}" bookings
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              Object.entries(groupedBookings || {}).map(
                ([category, categoryBookings]: [string, any]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getCategoryTitle(category)}
                      </h3>
                      <Badge variant="outline" className="ml-2">
                        {categoryBookings.length} booking
                        {categoryBookings.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {categoryBookings.map((booking: BookingType) => (
                        <Card
                          key={booking._id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                  <Users className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {booking.firstName} {booking.lastName}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Booking #
                                    {booking._id.slice(-8).toUpperCase()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={getStatusColor(booking.status)}
                                >
                                  {booking.status}
                                </Badge>
                                <Badge
                                  className={getPaymentStatusColor(
                                    booking.paymentStatus
                                  )}
                                >
                                  {booking.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Guest Information */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {booking.email}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {booking.phone}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {booking.adultCount} adults,{" "}
                                    {booking.childCount} children
                                  </span>
                                </div>
                              </div>

                              {/* Stay Information */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    Check-in:{" "}
                                    {new Date(
                                      booking.checkIn
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    Check-out:{" "}
                                    {new Date(
                                      booking.checkOut
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    Booked:{" "}
                                    {booking.createdAt
                                      ? new Date(
                                          booking.createdAt
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>

                              {/* Financial Information */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <CreditCard className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    Total: £
                                    {booking.totalCost?.toLocaleString()}
                                  </span>
                                </div>
                                {booking.refundAmount !== undefined &&
                                  booking.refundAmount > 0 && (
                                    <div className="flex items-center space-x-2 text-sm">
                                      <CreditCard className="w-4 h-4 text-red-500" />
                                      <span className="text-red-700">
                                        Refunded: £
                                        {booking.refundAmount.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Special Requests */}
                            {booking.specialRequests && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-start space-x-2">
                                  <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 mb-1">
                                      Special Requests:
                                    </p>
                                    <p className="text-sm text-blue-700">
                                      {booking.specialRequests}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingLogModal;
