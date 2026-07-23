import { useQuery } from "react-query";
import * as apiClient from "../../api-client";
import type { ReviewType } from "../../../../shared/types";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";

const AdminReviews = () => {
  const { data: reviews, isLoading } = useQuery(
    "fetchAdminReviews",
    apiClient.fetchAdminReviews,
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-medium text-slate-900">Reviews</h1>
        <p className="text-sm text-slate-500">Guest feedback across hotels</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : !reviews?.length ? (
        <p className="text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {(reviews as ReviewType[]).map((r) => (
            <li key={r._id} className="p-4 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{r.rating}★</Badge>
                {r.isVerified && (
                  <Badge className="bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
                <Link
                  to={`/detail/${r.hotelId}`}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Hotel {r.hotelId.slice(-6)}
                </Link>
                {r.createdAt && (
                  <span className="text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {r.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReviews;
