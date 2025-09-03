import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";

const PoliciesSection = () => {
  const { register } = useFormContext<HotelFormData>();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Hotel Policies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-gray-700 text-sm font-bold flex-1">
          Check-in Time
          <input
            type="text"
            placeholder="e.g., 3:00 PM"
            className="border rounded w-full py-2 px-3 font-normal"
            {...register("policies.checkInTime")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Check-out Time
          <input
            type="text"
            placeholder="e.g., 11:00 AM"
            className="border rounded w-full py-2 px-3 font-normal"
            {...register("policies.checkOutTime")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Cancellation Policy
          <textarea
            placeholder="Describe your cancellation policy..."
            className="border rounded w-full py-2 px-3 font-normal"
            rows={3}
            {...register("policies.cancellationPolicy")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Pet Policy
          <textarea
            placeholder="Describe your pet policy..."
            className="border rounded w-full py-2 px-3 font-normal"
            rows={3}
            {...register("policies.petPolicy")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Smoking Policy
          <textarea
            placeholder="Describe your smoking policy..."
            className="border rounded w-full py-2 px-3 font-normal"
            rows={3}
            {...register("policies.smokingPolicy")}
          />
        </label>
      </div>
    </div>
  );
};

export default PoliciesSection;
