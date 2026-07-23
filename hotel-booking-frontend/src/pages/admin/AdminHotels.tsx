import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import * as apiClient from "../../api-client";
import type { HotelType } from "../../../../shared/types";
import { Badge } from "../../components/ui/badge";
import { invalidateAdminQueries } from "../../lib/invalidate-queries";
import useAppContext from "../../hooks/useAppContext";

const AdminHotels = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  const { data: hotels, isLoading } = useQuery(
    "fetchHotels",
    apiClient.fetchHotels
  );

  const mutation = useMutation(
    ({ hotelId, isActive }: { hotelId: string; isActive: boolean }) =>
      apiClient.updateHotelActive(hotelId, isActive),
    {
      onSuccess: async () => {
        await invalidateAdminQueries(queryClient);
        showToast({ title: "Hotel status updated", type: "SUCCESS" });
      },
      onError: () => {
        showToast({
          title: "Failed to update hotel",
          type: "ERROR",
        });
      },
    }
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hotels</h1>
        <p className="text-sm text-slate-500">All properties in the catalog</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Bookings</th>
                <th className="p-3 font-medium">Active</th>
                <th className="p-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(hotels || []).map((h: HotelType) => (
                <tr key={h._id} className="border-t border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{h.name}</td>
                  <td className="p-3 text-slate-600">
                    {h.city}, {h.country}
                  </td>
                  <td className="p-3">£{h.pricePerNight}/night</td>
                  <td className="p-3">
                    <Badge variant="outline">{h.totalBookings ?? 0}</Badge>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="text-sm px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
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
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/detail/${h._id}`}
                      className="text-primary-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;
