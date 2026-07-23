import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client";
import { invalidateBookingQueries } from "../lib/invalidate-queries";
import { isBookingCancellable } from "../lib/booking-utils";
import type { BookingType } from "../../../shared/types";
import { Button } from "./ui/button";
import useAppContext from "../hooks/useAppContext";

type Props = {
  booking: BookingType;
  /** Extra class on the outer wrapper */
  className?: string;
};

/** Cancel upcoming booking (guest or owner) — Stripe refund when paid */
const CancelBookingButton = ({ booking, className }: Props) => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate, isLoading } = useMutation(
    () =>
      apiClient.cancelBooking(booking._id, {
        cancellationReason: reason.trim() || undefined,
      }),
    {
      onSuccess: async (data) => {
        await invalidateBookingQueries(queryClient);
        const skipNote = data.refundSkipped ? ` ${data.refundSkipped}` : "";
        const refundNote =
          data.refundAmount > 0
            ? ` Refunded £${data.refundAmount.toFixed(2)}.`
            : "";
        showToast({
          title: "Booking cancelled",
          description: `${refundNote}${skipNote}`.trim() || "Status updated.",
          type: "SUCCESS",
        });
        setOpen(false);
        setReason("");
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Could not cancel booking";
        showToast({
          title: "Cancel failed",
          description: message,
          type: "ERROR",
        });
      },
    }
  );

  if (!isBookingCancellable(booking)) {
    return null;
  }

  if (!open) {
    return (
      <div className={className}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => setOpen(true)}
        >
          Cancel booking
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`mt-3 space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 ${className || ""}`}
    >
      <p className="text-sm text-red-800">
        Cancel this upcoming stay? Paid bookings receive a full Stripe refund
        when a payment intent is on file.
      </p>
      <label className="block text-sm font-medium text-gray-700">
        Reason (optional)
        <input
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Change of plans"
        />
      </label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isLoading}
          onClick={() => mutate()}
        >
          {isLoading ? "Cancelling…" : "Confirm cancel"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => {
            setOpen(false);
            setReason("");
          }}
        >
          Keep booking
        </Button>
      </div>
    </div>
  );
};

export default CancelBookingButton;
