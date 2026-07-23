import { useMutation, useQuery, useQueryClient } from "react-query";
import * as apiClient from "../../api-client";
import type { UserType } from "../../../../shared/types";
import { invalidateAdminQueries } from "../../lib/invalidate-queries";
import useAppContext from "../../hooks/useAppContext";

const ROLES = ["user", "admin", "hotel_owner"] as const;

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  const { data: users, isLoading } = useQuery(
    "fetchAdminUsers",
    apiClient.fetchAdminUsers
  );

  const mutation = useMutation(
    ({ userId, role }: { userId: string; role: (typeof ROLES)[number] }) =>
      apiClient.updateUserRole(userId, role),
    {
      onSuccess: async () => {
        await invalidateAdminQueries(queryClient);
        showToast({ title: "Role updated", type: "SUCCESS" });
      },
      onError: () => {
        showToast({
          title: "Failed to update role",
          type: "ERROR",
        });
      },
    }
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">Registered accounts</p>
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
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Bookings</th>
                <th className="p-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u: UserType) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <select
                      className="border border-slate-200 rounded-md px-2 py-1 text-sm bg-white"
                      value={u.role || "user"}
                      disabled={mutation.isLoading}
                      onChange={(e) =>
                        mutation.mutate({
                          userId: u._id,
                          role: e.target.value as (typeof ROLES)[number],
                        })
                      }
                      aria-label={`Role for ${u.email}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">{u.totalBookings ?? 0}</td>
                  <td className="p-3">
                    {u.isActive === false ? "No" : "Yes"}
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

export default AdminUsers;
