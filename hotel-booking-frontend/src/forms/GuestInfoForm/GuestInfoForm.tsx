import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useSearchContext from "../../hooks/useSearchContext";
import useAppContext from "../../hooks/useAppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Calendar, Users, User, Baby, CreditCard } from "lucide-react";

type Props = {
  hotelId: string;
  pricePerNight: number;
};

type GuestInfoFormData = {
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
};

const GuestInfoForm = ({ hotelId, pricePerNight }: Props) => {
  const search = useSearchContext();
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    defaultValues: {
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adultCount: search.adultCount,
      childCount: search.childCount,
    },
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  // Calculate number of nights
  let numberOfNights = 1;
  if (checkIn && checkOut) {
    const diff = checkOut.getTime() - checkIn.getTime();
    numberOfNights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  const totalPrice = pricePerNight * numberOfNights;

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const onSignInClick = (data: GuestInfoFormData) => {
    search.saveSearchValues(
      "",
      data.checkIn,
      data.checkOut,
      data.adultCount,
      data.childCount
    );
    navigate("/sign-in", { state: { from: location } });
  };

  const onSubmit = (data: GuestInfoFormData) => {
    search.saveSearchValues(
      "",
      data.checkIn,
      data.checkOut,
      data.adultCount,
      data.childCount
    );
    navigate(`/hotel/${hotelId}/booking`);
  };

  return (
    <>
      <style>
        {`
          .react-datepicker {
            background-color: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            font-family: inherit !important;
          }
          .react-datepicker__header {
            background-color: #f8fafc !important;
            border-bottom: 1px solid #e5e7eb !important;
            border-radius: 8px 8px 0 0 !important;
          }
          .react-datepicker__current-month {
            color: #374151 !important;
            font-weight: 600 !important;
          }
          .react-datepicker__day-name {
            color: #6b7280 !important;
            font-weight: 500 !important;
          }
          .react-datepicker__day {
            color: #374151 !important;
            border-radius: 6px !important;
            margin: 2px !important;
          }
          .react-datepicker__day:hover {
            background-color: #dbeafe !important;
            color: #1e40af !important;
          }
          .react-datepicker__day--selected {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          .react-datepicker__day--in-range {
            background-color: #dbeafe !important;
            color: #1e40af !important;
          }
          .react-datepicker__day--keyboard-selected {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          .react-datepicker__day--outside-month {
            color: #9ca3af !important;
          }
          .react-datepicker__navigation {
            color: #6b7280 !important;
          }
          .react-datepicker__navigation:hover {
            color: #374151 !important;
          }
        `}
      </style>
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg font-semibold">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Booking Summary</span>
            </div>
            <Badge variant="outline" className="text-sm">
              £{pricePerNight}/night
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price Display */}
          <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">
                £{pricePerNight} × {numberOfNights} night
                {numberOfNights > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                £{totalPrice}
              </div>
              <div className="text-xs text-gray-500">Total Price</div>
            </div>
          </div>

          <form
            onSubmit={
              isLoggedIn ? handleSubmit(onSubmit) : handleSubmit(onSignInClick)
            }
            className="space-y-4"
          >
            {/* Date Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" />
                Select Dates
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <DatePicker
                    required
                    selected={checkIn}
                    onChange={(date) => setValue("checkIn", date as Date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholderText="Check-in Date"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    wrapperClassName="w-full"
                  />
                </div>

                <div className="relative">
                  <DatePicker
                    required
                    selected={checkOut}
                    onChange={(date) => setValue("checkOut", date as Date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholderText="Check-out Date"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Guest Information
              </Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="h-3 w-3" />
                    Adults
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    className="text-center font-semibold"
                    {...register("adultCount", {
                      required: "This field is required",
                      min: {
                        value: 1,
                        message: "There must be at least one adult",
                      },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.adultCount && (
                    <span className="text-red-500 text-xs">
                      {errors.adultCount.message}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs text-gray-600">
                    <Baby className="h-3 w-3" />
                    Children
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    className="text-center font-semibold"
                    {...register("childCount", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Book Now
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign in to Book
                </div>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
            Free cancellation • No booking fees • Instant confirmation
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default GuestInfoForm;
