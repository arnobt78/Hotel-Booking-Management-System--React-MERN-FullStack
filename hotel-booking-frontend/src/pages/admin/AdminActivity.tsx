import { useQuery } from "react-query";
import * as apiClient from "../../api-client";
import type { BookingType, ReviewType } from "../../../../shared/types";

type ActivityItem = {
  id: string;
  at: number;
  kind: "booking" | "review";
  title: string;
  detail: string;
};

const AdminActivity = () => {
  const { data: bookings, isLoading: bLoading } = useQuery(
    "fetchAdminBookings",
    apiClient.fetchAdminBookings,
  );
  const { data: reviews, isLoading: rLoading } = useQuery(
    "fetchAdminReviews",
    apiClient.fetchAdminReviews,
  );

  const items: ActivityItem[] = [];
  (bookings as BookingType[] | undefined)?.forEach((b) => {
    items.push({
      id: `b-${b._id}`,
      at: new Date(b.createdAt || b.checkIn).getTime(),
      kind: "booking",
      title: `Booking ${b.status || "pending"} — ${b.firstName} ${b.lastName}`,
      detail: `£${b.totalCost} · check-in ${new Date(b.checkIn).toLocaleDateString()}`,
    });
  });
  (reviews as ReviewType[] | undefined)?.forEach((r) => {
    items.push({
      id: `r-${r._id}`,
      at: new Date(r.createdAt || Date.now()).getTime(),
      kind: "review",
      title: `Review ${r.rating}★`,
      detail: r.comment.slice(0, 120),
    });
  });
  items.sort((a, b) => b.at - a.at);

  const loading = bLoading || rLoading;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg md:text-2xl font-medium text-slate-900">
          Activity
        </h1>
        <p className="text-sm text-slate-500">
          Recent bookings and reviews (no separate audit log)
        </p>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 bg-slate-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : !items.length ? (
        <p className="text-sm text-slate-500">No recent activity.</p>
      ) : (
        <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {items.slice(0, 50).map((item) => (
            <li key={item.id} className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="uppercase font-medium text-slate-500">
                  {item.kind}
                </span>
                <span>{new Date(item.at).toLocaleString()}</span>
              </div>
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-600">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminActivity;
