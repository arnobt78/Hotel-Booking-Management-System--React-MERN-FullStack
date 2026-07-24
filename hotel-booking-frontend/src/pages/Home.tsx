import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import LatestDestinationCard from "../components/LastestDestinationCard";
import Hero from "../components/Hero";
import PageContainer from "../components/PageContainer";

const Home = () => {
  const { data: hotels } = useQuery("fetchQuery", () =>
    apiClient.fetchHotels(),
  );

  const handleSearch = (_searchData: unknown) => {
    // Search is handled by Hero → SearchContext / navigation
  };

  return (
    <>
      <Hero onSearch={handleSearch} />
      <PageContainer className="py-6">
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-2xl font-medium text-gray-700">
            Latest Destinations
          </h2>
          <p className="text-sm md:text-lg text-gray-600 font-normal">
            Most recent destinations added by our hosts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels?.map((hotel) => (
            <LatestDestinationCard key={hotel._id} hotel={hotel} />
          ))}
        </div>
      </PageContainer>
    </>
  );
};

export default Home;
