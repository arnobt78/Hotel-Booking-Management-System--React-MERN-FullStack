import { useMemo } from "react";
import { useQuery } from "react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import * as apiClient from "../../api-client";
import type { ReviewType } from "../../../../shared/types";
import { Badge } from "../../components/ui/badge";
import { DataTable } from "../../components/ui/data-table";

const AdminReviews = () => {
  const { data: reviews, isLoading } = useQuery(
    "fetchAdminReviews",
    apiClient.fetchAdminReviews,
  );

  const columns = useMemo<ColumnDef<ReviewType, unknown>[]>(
    () => [
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.rating}★</Badge>
        ),
      },
      {
        id: "verified",
        accessorFn: (r) => (r.isVerified ? "Verified" : ""),
        header: "Verified",
        cell: ({ row }) =>
          row.original.isVerified ? (
            <Badge className="bg-green-100 text-green-800">Verified</Badge>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ row }) => (
          <p className="text-sm text-gray-700 max-w-md whitespace-pre-line line-clamp-3">
            {row.original.comment}
          </p>
        ),
      },
      {
        id: "hotel",
        accessorKey: "hotelId",
        header: "Hotel",
        cell: ({ row }) => (
          <Link
            to={`/detail/${row.original.hotelId}`}
            className="text-xs text-primary-600 hover:underline"
          >
            Hotel {row.original.hotelId.slice(-6)}
          </Link>
        ),
      },
      {
        id: "date",
        accessorFn: (r) =>
          r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
        header: "Date",
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg md:text-2xl font-medium text-gray-700">
          Reviews
        </h1>
        <p className="text-sm text-gray-500">Guest feedback across hotels</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={(reviews as ReviewType[]) || []}
          searchPlaceholder="Search reviews…"
        />
      )}
    </div>
  );
};

export default AdminReviews;
