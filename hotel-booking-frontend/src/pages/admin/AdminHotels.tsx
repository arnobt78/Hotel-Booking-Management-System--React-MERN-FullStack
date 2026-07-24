import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import type { ColumnDef } from "@tanstack/react-table";
import * as apiClient from "../../api-client";
import type { HotelType } from "../../../../shared/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/data-table";
import { invalidateAdminQueries } from "../../lib/invalidate-queries";
import useAppContext from "../../hooks/useAppContext";

const AdminHotels = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  const { data: hotels, isLoading } = useQuery(
    "fetchHotels",
    apiClient.fetchHotels,
  );

  const mutation = useMutation(
    ({ hotelId, isActive }: { hotelId: string; isActive: boolean }) =>
      apiClient.updateHotelActive(hotelId, isActive),
    {
      onSuccess: async () => {
        await invalidateAdminQueries(queryClient);
        showToast({
          title: "Hotel status updated",
          description: "Visibility updated. Lists will refresh automatically.",
          type: "SUCCESS",
        });
      },
      onError: () => {
        showToast({
          title: "Failed to update hotel",
          description: "Please try again in a moment.",
          type: "ERROR",
        });
      },
    },
  );

  const columns = useMemo<ColumnDef<HotelType, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-gray-700">{row.original.name}</span>
        ),
      },
      {
        id: "location",
        accessorFn: (h) => `${h.city}, ${h.country}`,
        header: "Location",
      },
      {
        accessorKey: "pricePerNight",
        header: "Price",
        cell: ({ row }) => `£${row.original.pricePerNight}/night`,
      },
      {
        accessorKey: "totalBookings",
        header: "Bookings",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.totalBookings ?? 0}</Badge>
        ),
      },
      {
        id: "active",
        accessorFn: (h) => (h.isActive === false ? "inactive" : "active"),
        header: "Active",
        cell: ({ row }) => {
          const h = row.original;
          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={mutation.isLoading}
              onClick={() =>
                mutation.mutate({
                  hotelId: h._id,
                  isActive: !h.isActive,
                })
              }
            >
              {h.isActive === false
                ? "Inactive — activate"
                : "Active — deactivate"}
            </Button>
          );
        },
      },
      {
        id: "view",
        header: "",
        cell: ({ row }) => (
          <Link
            to={`/detail/${row.original._id}`}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            View
          </Link>
        ),
      },
    ],
    [mutation],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg md:text-2xl font-medium text-gray-700">
          Hotels
        </h1>
        <p className="text-sm text-gray-500">All properties in the catalog</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 bg-slate-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={hotels || []}
          searchPlaceholder="Search hotels…"
        />
      )}
    </div>
  );
};

export default AdminHotels;
