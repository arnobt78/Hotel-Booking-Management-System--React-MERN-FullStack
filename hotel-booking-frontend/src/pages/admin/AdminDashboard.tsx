import { useMutation, useQuery, useQueryClient } from "react-query";
import { useState } from "react";
import * as apiClient from "../../api-client";
import { invalidateAdminQueries } from "../../lib/invalidate-queries";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import useAppContext from "../../hooks/useAppContext";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();

  const { data: insights, isLoading: insightsLoading } = useQuery(
    "fetchAdminBusinessInsightsDashboard",
    apiClient.fetchAdminBusinessInsightsDashboard,
  );

  // Rollups via /api/business-insights/rollups (not /analytics — ad-blocker safe)
  const {
    data: rollups,
    isLoading: rollupsLoading,
    isError: rollupsError,
    refetch: refetchRollups,
  } = useQuery(
    "fetchBusinessInsightsRollups",
    apiClient.fetchBusinessInsightsRollups,
  );

  const { mutate: capture, isLoading: capturing } = useMutation(
    apiClient.createBusinessInsightsRollup,
    {
      onSuccess: async () => {
        await invalidateAdminQueries(queryClient);
        showToast({
          title: "Rollup saved",
          description: "Live figures captured to business insights rollups.",
          type: "SUCCESS",
        });
      },
      onError: () => {
        showToast({
          title: "Rollup failed",
          description: "Could not create business insights rollup.",
          type: "ERROR",
        });
      },
    },
  );

  const [insightsDraft, setInsightsDraft] = useState<string | null>(null);
  const [insightsProvider, setInsightsProvider] = useState<string | null>(null);
  const [aiDisabled, setAiDisabled] = useState(false);

  const { mutate: suggestInsights, isLoading: suggesting } = useMutation(
    () =>
      apiClient.suggestAiAssist({
        kind: "insights_copy",
        input: JSON.stringify(insights?.overview || {}),
      }),
    {
      onSuccess: (data) => {
        setInsightsDraft(data.draft);
        setInsightsProvider(data.provider);
        setAiDisabled(false);
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 503) {
          setAiDisabled(true);
          showToast({
            title: "AI assist unavailable",
            description: "Enable AI_ASSIST_ENABLED on the server.",
            type: "INFO",
          });
          return;
        }
        showToast({
          title: "Suggestion failed",
          type: "ERROR",
        });
      },
    },
  );

  const overview = insights?.overview;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-2xl font-medium text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Live hotel-domain figures and business insights rollups
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!aiDisabled && (
            <Button
              type="button"
              variant="outline"
              onClick={() => suggestInsights()}
              disabled={suggesting || insightsLoading}
            >
              {suggesting ? "Suggesting…" : "Suggest insights blurb"}
            </Button>
          )}
          <Button onClick={() => capture()} disabled={capturing}>
            {capturing ? "Capturing…" : "Capture rollup"}
          </Button>
        </div>
      </div>

      {insightsDraft && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <p className="text-xs text-slate-500">
            Insights draft ({insightsProvider}) — Apply copies into the box
            below (not auto-saved)
          </p>
          <p className="text-sm text-slate-800 whitespace-pre-line">
            {insightsDraft}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const el = document.getElementById(
                  "admin-insights-draft",
                ) as HTMLTextAreaElement | null;
                if (el) el.value = insightsDraft;
                setInsightsDraft(null);
                showToast({
                  title: "Draft applied to notepad",
                  type: "SUCCESS",
                });
              }}
            >
              Apply to notepad
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setInsightsDraft(null)}
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      <textarea
        id="admin-insights-draft"
        rows={3}
        placeholder="Local notepad for AI insights copy (not persisted)"
        className="w-full rounded-xl border border-slate-200 p-3 text-sm"
      />

      {insightsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Hotels", overview?.totalHotels],
            ["Users", overview?.totalUsers],
            ["Bookings", overview?.totalBookings],
            [
              "Revenue",
              overview?.totalRevenue != null
                ? `£${Number(overview.totalRevenue).toLocaleString()}`
                : "—",
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg md:text-2xl font-medium text-slate-900 mt-1">
                {value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="font-medium text-slate-900 mb-3">Recent rollups</h2>
        {rollupsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 animate-pulse rounded"
              />
            ))}
          </div>
        ) : rollupsError ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600">
              Failed to load rollups. Retry or check network / extensions.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => refetchRollups()}
            >
              Retry
            </Button>
          </div>
        ) : !rollups?.length ? (
          <p className="text-sm text-slate-500">
            No rollups yet. Capture one to persist live business figures.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rollups.slice(0, 10).map((s) => (
              <li
                key={s._id}
                className="py-3 flex flex-wrap items-center gap-3 text-sm"
              >
                <span className="font-medium text-slate-800">
                  {new Date(s.date).toLocaleString()}
                </span>
                <Badge variant="outline">
                  {s.metrics.totalBookings} bookings
                </Badge>
                <Badge variant="outline">
                  £{Number(s.metrics.totalRevenue).toLocaleString()}
                </Badge>
                <Badge variant="outline">
                  cancel {s.metrics.cancellationRate}%
                </Badge>
                <Badge variant="outline">
                  rating {s.metrics.averageRating}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
