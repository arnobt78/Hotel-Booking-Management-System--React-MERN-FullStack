import { useMutation, useQuery } from "react-query";
import { useParams, useNavigate } from "react-router-dom";
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import useAppContext from "../hooks/useAppContext";

const EditHotel = () => {
  const { hotelId } = useParams();
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  const { data: hotel } = useQuery(
    "fetchMyHotelById",
    () => apiClient.fetchMyHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
    }
  );

  const { mutate, isLoading } = useMutation(apiClient.updateMyHotelById, {
    onSuccess: () => {
      showToast({
        title: "Hotel Updated Successfully",
        description:
          "Your hotel details have been updated successfully! Redirecting to My Hotels...",
        type: "SUCCESS",
      });
      // Redirect to My Hotels page after successful update
      setTimeout(() => {
        navigate("/my-hotels");
      }, 1500); // Give user time to see the success message
    },
    onError: () => {
      showToast({
        title: "Failed to Update Hotel",
        description:
          "There was an error updating your hotel. Please try again.",
        type: "ERROR",
      });
    },
  });

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  return (
    <ManageHotelForm hotel={hotel} onSave={handleSave} isLoading={isLoading} />
  );
};

export default EditHotel;
