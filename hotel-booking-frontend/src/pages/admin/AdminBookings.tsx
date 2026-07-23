import { useQuery } from "react-query";
import * as apiClient from "../../api-client";
import type { BookingType } from "../../../../shared/types";
import { Badge } from "../../components/ui/badge";
import CancelBookingButton from "../../components/CancelBookingButton";

const statusClass = (status?: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "refunded":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const AdminBookings = () => {
  const { data: bookings, isLoading } = useQuery(
    "fetchAdminBookings",
    apiClient.fetchAdminBookings,
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-medium text-slate-900">Bookings</h1>
        <p className="text-sm text-slate-500">
          All reservations — cancel upcoming stays with Stripe refund when paid
        </p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : !bookings?.length ? (
        <p className="text-sm text-slate-500">No bookings found.</p>
      ) : (
        <ul className="space-y-3">
          {(bookings as BookingType[]).map((b) => (
            <li
              key={b._id}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-medium text-slate-900">
                  {b.firstName} {b.lastName}
                </span>
                <Badge className={statusClass(b.status)}>
                  {b.status || "pending"}
                </Badge>
                <Badge variant="outline">{b.paymentStatus || "pending"}</Badge>
                <span className="text-xs text-slate-400">
                  #{b._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {new Date(b.checkIn).toLocaleDateString()} →{" "}
                {new Date(b.checkOut).toLocaleDateString()} · £
                {b.totalCost?.toLocaleString()}
              </p>
              <CancelBookingButton booking={b} className="mt-3" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminBookings;
