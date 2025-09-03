import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";

const ContactSection = () => {
  const { register } = useFormContext<HotelFormData>();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Contact Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="text-gray-700 text-sm font-bold flex-1">
          Phone
          <input
            type="text"
            className="border rounded w-full py-2 px-3 font-normal"
            {...register("contact.phone")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Email
          <input
            type="email"
            className="border rounded w-full py-2 px-3 font-normal"
            {...register("contact.email")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Website
          <input
            type="url"
            className="border rounded w-full py-2 px-3 font-normal"
            {...register("contact.website")}
          />
        </label>
      </div>
    </div>
  );
};

export default ContactSection;
