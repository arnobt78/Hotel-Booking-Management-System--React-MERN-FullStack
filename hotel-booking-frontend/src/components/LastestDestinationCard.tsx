import { Link } from "react-router-dom";
import { HotelType } from "../../../shared/types";

type Props = {
  hotel: HotelType;
};

const LatestDestinationCard = ({ hotel }: Props) => {
  return (
    <Link
      to={`/detail/${hotel._id}`}
      className="relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-transform duration-200 hover:scale-105 bg-white flex flex-col w-full h-[300px]"
      style={{ minWidth: 320, maxWidth: 500 }}
    >
      <div className="w-full h-full">
        <img
          src={hotel.imageUrls[0]}
          className="w-full h-full object-cover object-center"
          style={{ minHeight: 300, maxHeight: 300 }}
        />
      </div>

      <div className="absolute bottom-0 p-4 bg-black bg-opacity-50 w-full rounded-b-lg">
        <div className="flex items-center">
          <span className="text-white font-semibold tracking-tight text-3xl">
            {hotel.name}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-white tracking-tight text-sm">
            {hotel.city}, {hotel.country}
          </span>
        </div>
        
      </div>
    </Link>
  );
};

export default LatestDestinationCard;
