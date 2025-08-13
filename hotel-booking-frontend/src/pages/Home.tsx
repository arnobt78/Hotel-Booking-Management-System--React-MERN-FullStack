import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import LatestDestinationCard from "../components/LastestDestinationCard";

const Home = () => {
  const { data: hotels } = useQuery("fetchQuery", () =>
    apiClient.fetchHotels()
  );

  // No need to split rows, use a single grid for all cards

  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-bold">Latest Destinations</h2>
      <p>Most recent destinations added by our hosts</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {hotels?.map((hotel) => (
          <LatestDestinationCard key={hotel._id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
};

export default Home;
