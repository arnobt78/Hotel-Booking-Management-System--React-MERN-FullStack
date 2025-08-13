import { Link } from "react-router-dom";
import { HotelType } from "../../../shared/types";
import { AiFillStar } from "react-icons/ai";
type Props = {
  hotel: HotelType;
};

const SearchResultsCard = ({ hotel }: Props) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] border border-slate-300 rounded-lg p-8 gap-8">
      <div className="w-full h-[300px]">
        <img
          src={hotel.imageUrls[0]}
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="grid grid-rows-[1fr_2fr_1fr]">
        <div>
          <div className="flex items-center">
            <span className="flex">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <AiFillStar key={i} className="fill-yellow-400" />
              ))}
            </span>
            <span className="ml-1 text-sm">{hotel.type}</span>
          </div>
          <Link
            to={`/detail/${hotel._id}`}
            className="text-2xl font-bold cursor-pointer"
          >
            {hotel.name}
          </Link>
        </div>

        <div>
          <div className="line-clamp-4">{hotel.description}</div>
        </div>

        <div className="grid grid-cols-2 items-end">
          <div className="flex flex-col gap-2">
            {Array.from({ length: Math.ceil(hotel.facilities.length / 3) }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex gap-2">
                {hotel.facilities.slice(rowIdx * 3, rowIdx * 3 + 3).map((facility) => (
                  <span key={facility} className="bg-slate-300 p-2 rounded-lg font-bold text-xs whitespace-nowrap hover:bg-blue-500 hover:text-white transition-colors">
                    {facility}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end mt-4">
            <span className="font-bold mr-2">£{hotel.pricePerNight} per night</span>
            <Link
              to={`/detail/${hotel._id}`}
              className="bg-blue-600 text-white h-full p-3 font-bold text-xl rounded-lg hover:bg-blue-500 mt-2"
            >
              View More
            </Link>
          </div>
      </div>
    </div>
  );
};

export default SearchResultsCard;
