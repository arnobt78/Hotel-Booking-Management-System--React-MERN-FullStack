import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";
import TypeSection from "./TypeSection";
import FacilitiesSection from "./FacilitiesSection";
import GuestsSection from "./GuestsSection";
import ImagesSection from "./ImagesSection";
import ContactSection from "./ContactSection";
import PoliciesSection from "./PoliciesSection";
import { HotelType } from "../../../../shared/types";
import { useEffect } from "react";

export type HotelFormData = {
  name: string;
  city: string;
  country: string;
  description: string;
  type: string[];
  pricePerNight: number;
  starRating: number;
  facilities: string[];
  imageFiles?: FileList;
  imageUrls: string[];
  adultCount: number;
  childCount: number;
  // New fields
  contact?: {
    phone: string;
    email: string;
    website: string;
  };
  policies?: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    petPolicy: string;
    smokingPolicy: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };
  isFeatured: boolean;
};

type Props = {
  hotel?: HotelType;
  onSave: (hotelFormData: FormData) => void;
  isLoading: boolean;
};

const ManageHotelForm = ({ onSave, isLoading, hotel }: Props) => {
  const formMethods = useForm<HotelFormData>();
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    if (hotel) {
      // Ensure contact and policies are properly initialized
      const formData = {
        ...hotel,
        contact: hotel.contact || {
          phone: "",
          email: "",
          website: "",
        },
        policies: hotel.policies || {
          checkInTime: "",
          checkOutTime: "",
          cancellationPolicy: "",
          petPolicy: "",
          smokingPolicy: "",
        },
      };
      reset(formData);
    }
  }, [hotel, reset]);

  const onSubmit = handleSubmit((formDataJson: HotelFormData) => {
    const formData = new FormData();
    if (hotel) {
      formData.append("hotelId", hotel._id);
    }
    formData.append("name", formDataJson.name);
    formData.append("city", formDataJson.city);
    formData.append("country", formDataJson.country);
    formData.append("description", formDataJson.description);
    formDataJson.type.forEach((t, idx) => {
      formData.append(`type[${idx}]`, t);
    });
    formData.append("pricePerNight", formDataJson.pricePerNight.toString());
    formData.append("starRating", formDataJson.starRating.toString());
    formData.append("adultCount", formDataJson.adultCount.toString());
    formData.append("childCount", formDataJson.childCount.toString());

    formDataJson.facilities.forEach((facility, index) => {
      formData.append(`facilities[${index}]`, facility);
    });

    // Add contact information
    if (formDataJson.contact) {
      formData.append("contact.phone", formDataJson.contact.phone || "");
      formData.append("contact.email", formDataJson.contact.email || "");
      formData.append("contact.website", formDataJson.contact.website || "");
    }

    // Add policies
    if (formDataJson.policies) {
      formData.append(
        "policies.checkInTime",
        formDataJson.policies.checkInTime || ""
      );
      formData.append(
        "policies.checkOutTime",
        formDataJson.policies.checkOutTime || ""
      );
      formData.append(
        "policies.cancellationPolicy",
        formDataJson.policies.cancellationPolicy || ""
      );
      formData.append(
        "policies.petPolicy",
        formDataJson.policies.petPolicy || ""
      );
      formData.append(
        "policies.smokingPolicy",
        formDataJson.policies.smokingPolicy || ""
      );
    }

    if (formDataJson.imageUrls) {
      formDataJson.imageUrls.forEach((url, index) => {
        formData.append(`imageUrls[${index}]`, url);
      });
    }

    if (formDataJson.imageFiles && formDataJson.imageFiles.length > 0) {
      Array.from(formDataJson.imageFiles).forEach((imageFile) => {
        formData.append(`imageFiles`, imageFile);
      });
    }

    onSave(formData);
  });

  return (
    <FormProvider {...formMethods}>
      <form className="flex flex-col gap-10" onSubmit={onSubmit}>
        <DetailsSection />
        <TypeSection />
        <FacilitiesSection />
        <GuestsSection />
        <ContactSection />
        <PoliciesSection />
        <ImagesSection />
        <span className="flex justify-end">
          <button
            disabled={isLoading}
            type="submit"
            className="bg-blue-600 text-white  px-6 py-2 rounded-lg font-semibold hover:bg-blue-500 text-xl disabled:bg-gray-500"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </span>
      </form>
    </FormProvider>
  );
};

export default ManageHotelForm;
