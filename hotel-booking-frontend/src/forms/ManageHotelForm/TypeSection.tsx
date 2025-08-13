import { useFormContext } from "react-hook-form";
import { hotelTypes } from "../../config/hotel-options-config";
import { HotelFormData } from "./ManageHotelForm";

const TypeSection = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  const rawType = watch("type") as string | string[] | undefined;
  const typeWatch: string[] = Array.isArray(rawType)
    ? rawType.filter((t): t is string => typeof t === "string")
    : typeof rawType === "string"
    ? (rawType && rawType.length > 0
        ? [rawType]
        : [])
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Type</h2>
      <div className="grid grid-cols-5 gap-2">
        {hotelTypes.map((type) => (
          <label
            key={type}
            className={
              typeWatch.includes(type)
                ? "cursor-pointer bg-blue-300 text-sm rounded-full px-4 py-2 font-semibold"
                : "cursor-pointer bg-gray-300 text-sm rounded-full px-4 py-2 font-semibold"
            }
          >
            <input
              type="checkbox"
              value={type}
              checked={typeWatch.includes(type)}
              {...register("type")}
              onChange={(e) => {
                const checked = e.target.checked;
                let newTypes = Array.isArray(typeWatch) ? [...typeWatch] : [];
                if (checked) {
                  if (!newTypes.includes(type)) newTypes.push(type);
                } else {
                  newTypes = newTypes.filter((t) => t !== type);
                }
                setValue("type", newTypes, { shouldValidate: true });
              }}
              className="hidden"
            />
            <span>{type}</span>
          </label>
        ))}
      </div>
      {errors.type && (
        <span className="text-red-500 text-sm font-bold">
          {errors.type.message}
        </span>
      )}
    </div>
  );
};

export default TypeSection;
