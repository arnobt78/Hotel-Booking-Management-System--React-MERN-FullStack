import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import useAppContext from "../hooks/useAppContext";
import * as apiClient from "../api-client";
import { invalidateHotelQueries } from "../lib/invalidate-queries";

const AddHotel = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
    onSuccess: async () => {
      // Refresh My Hotels / Home / Search caches without full reload
      await invalidateHotelQueries(queryClient);
      showToast({
        title: "Hotel Added Successfully",
        description:
          "Your hotel has been added to the platform successfully! Redirecting to My Hotels...",
        type: "SUCCESS",
      });
      setTimeout(() => {
        navigate("/my-hotels");
      }, 1500);
    },
    onError: () => {
      showToast({
        title: "Failed to Add Hotel",
        description: "There was an error saving your hotel. Please try again.",
        type: "ERROR",
      });
    },
  });

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  return <ManageHotelForm onSave={handleSave} isLoading={isLoading} showBack />;
};

export default AddHotel;
