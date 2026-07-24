import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client";
import { invalidateReviewQueries } from "../lib/invalidate-queries";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SelectOptionLabel } from "./ui/select-option-label";
import { Star } from "lucide-react";
import useAppContext from "../hooks/useAppContext";

type Props = {
  hotelId: string;
  bookingId: string;
  onDone?: () => void;
};

/** Compact JWT review form for a completed booking */
const WriteReviewForm = ({ hotelId, bookingId, onDone }: Props) => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);

  const { mutate, isLoading } = useMutation(apiClient.createHotelReview, {
    onSuccess: async () => {
      await invalidateReviewQueries(queryClient);
      showToast({
        title: "Review submitted",
        description: "Thanks for sharing your stay experience.",
        type: "SUCCESS",
      });
      setOpen(false);
      setComment("");
      onDone?.();
    },
    onError: () => {
      showToast({
        title: "Could not submit review",
        description: "You may have already reviewed this booking.",
        type: "ERROR",
      });
    },
  });

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Write a review
      </Button>
    );
  }

  return (
    <form
      className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutate({
          hotelId,
          bookingId,
          rating,
          comment,
          // Same score across categories for a compact guest form
          categories: {
            cleanliness: rating,
            service: rating,
            location: rating,
            value: rating,
            amenities: rating,
          },
        });
      }}
    >
      {/* shadcn Select — matches global control styling (no native <select>) */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <Select
          value={String(rating)}
          onValueChange={(v) => setRating(Number(v))}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select rating" />
          </SelectTrigger>
          <SelectContent>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>
                <SelectOptionLabel
                  icon={Star}
                  iconClassName="fill-amber-400 text-amber-500"
                >
                  {n} stars
                </SelectOptionLabel>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <Textarea
          rows={3}
          required
          minLength={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your stay experience"
          className="bg-white"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading || comment.trim().length < 3}>
          {isLoading ? "Submitting…" : "Submit review"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default WriteReviewForm;
