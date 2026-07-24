import { useMemo } from "react";
import { useQuery } from "react-query";
import type { ColumnDef } from "@tanstack/react-table";
import * as apiClient from "../../api-client";
import type { BookingType } from "../../../../shared/types";
import { Badge } from "../../components/ui/badge";
import { DataTable } from "../../components/ui/data-table";
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

  const columns = useMemo<ColumnDef<BookingType, unknown>[]>(
    () => [
      {
        id: "guest",
        accessorFn: (b) => `${b.firstName} ${b.lastName}`,
        header: "Guest",
        cell: ({ row }) => (
          <span className="font-medium text-gray-700">
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={statusClass(row.original.status)}>
            {row.original.status || "pending"}
          </Badge>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment",
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.paymentStatus || "pending"}
          </Badge>
        ),
      },
      {
        id: "dates",
        accessorFn: (b) =>
          `${new Date(b.checkIn).toLocaleDateString()} → ${new Date(b.checkOut).toLocaleDateString()}`,
        header: "Dates",
      },
      {
        accessorKey: "totalCost",
        header: "Total",
        cell: ({ row }) =>
          `£${row.original.totalCost?.toLocaleString() ?? 0}`,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <CancelBookingButton booking={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg md:text-2xl font-medium text-gray-700">
          Bookings
        </h1>
        <p className="text-sm text-gray-500">
          All reservations — cancel upcoming stays with Stripe refund when paid
        </p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={(bookings as BookingType[]) || []}
          searchPlaceholder="Search bookings…"
        />
      )}
    </div>
  );
};

export default AdminBookings;
