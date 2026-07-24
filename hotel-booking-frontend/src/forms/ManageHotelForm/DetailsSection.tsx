import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useMutation } from "react-query";
import { HotelFormData } from "./ManageHotelForm";
import * as apiClient from "../../api-client";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import useAppContext from "../../hooks/useAppContext";

const DetailsSection = () => {
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<HotelFormData>();
  const { showToast, isLoggedIn } = useAppContext();
  const [draft, setDraft] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [aiDisabled, setAiDisabled] = useState(false);

  const { mutate: suggest, isLoading } = useMutation(
    () =>
      apiClient.suggestAiAssist({
        kind: "hotel_description",
        input: getValues("description") || getValues("name") || "",
      }),
    {
      onSuccess: (data) => {
        setDraft(data.draft);
        setProvider(data.provider);
        setAiDisabled(false);
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 503) {
          setAiDisabled(true);
          showToast({
            title: "AI assist unavailable",
            description:
              "Enable AI_ASSIST_ENABLED on the server to use suggestions.",
            type: "INFO",
          });
          return;
        }
        showToast({
          title: "Suggestion failed",
          description: "Could not generate a draft.",
          type: "ERROR",
        });
      },
    },
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-2xl font-medium mb-3">Add Hotel</h1>
      <label className="text-gray-700 text-sm font-medium flex-1">
        Name
        <input
          type="text"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("name", { required: "This field is required" })}
        ></input>
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </label>

      <div className="flex gap-4">
        <label className="text-gray-700 text-sm font-medium flex-1">
          City
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("city", { required: "This field is required" })}
          ></input>
          {errors.city && (
            <span className="text-red-500">{errors.city.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-medium flex-1">
          Country
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("country", { required: "This field is required" })}
          ></input>
          {errors.country && (
            <span className="text-red-500">{errors.country.message}</span>
          )}
        </label>
      </div>
      <label className="text-gray-700 text-sm font-medium flex-1">
        Description
        <textarea
          rows={10}
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("description", { required: "This field is required" })}
        ></textarea>
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}
      </label>

      {/* Draft-and-approve: never auto-saves description */}
      {isLoggedIn && !aiDisabled && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => suggest()}
          >
            {isLoading ? "Suggesting…" : "Suggest polish"}
          </Button>
          {draft && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <p className="text-xs text-slate-500">
                Draft ({provider}) — review then Apply or Discard
              </p>
              <p className="text-sm text-slate-800 whitespace-pre-line">
                {draft}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setValue("description", draft, { shouldDirty: true });
                    setDraft(null);
                    showToast({
                      title: "Draft applied",
                      description: "Save the hotel form to persist.",
                      type: "SUCCESS",
                    });
                  }}
                >
                  Apply
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDraft(null)}
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <label className="text-gray-700 text-sm font-medium max-w-[50%]">
        Price Per Night
        <input
          type="number"
          min={1}
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("pricePerNight", { required: "This field is required" })}
        ></input>
        {errors.pricePerNight && (
          <span className="text-red-500">{errors.pricePerNight.message}</span>
        )}
      </label>
      {/* shadcn Select + RHF Controller — starRating is number on HotelFormData */}
      <div className="text-gray-700 text-sm font-medium max-w-[50%] space-y-1.5">
        <label htmlFor="starRating">Star Rating</label>
        <Controller
          name="starRating"
          control={control}
          rules={{ required: "This field is required" }}
          render={({ field }) => (
            <Select
              value={
                field.value != null && !Number.isNaN(Number(field.value))
                  ? String(field.value)
                  : "_unset"
              }
              onValueChange={(v) => {
                if (v === "_unset") {
                  field.onChange(undefined as unknown as number);
                  return;
                }
                field.onChange(Number(v));
              }}
            >
              <SelectTrigger id="starRating" className="w-full bg-white">
                <SelectValue placeholder="Select as Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_unset">Select as Rating</SelectItem>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.starRating && (
          <span className="text-red-500">{errors.starRating.message}</span>
        )}
      </div>
    </div>
  );
};

export default DetailsSection;
