import { Search, MapPin, Calendar, Users, Star } from "lucide-react";
import AdvancedSearch from "./AdvancedSearch";
import PageContainer from "./PageContainer";

const Hero = ({ onSearch }: { onSearch: (searchData: unknown) => void }) => {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-bounce-gentle" />
      <div
        className="absolute bottom-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-xl animate-bounce-gentle"
        style={{ animationDelay: "1s" }}
      />

      <PageContainer className="pt-8 pb-6 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white/90 font-medium">
              Trusted by 10,000+ travelers
            </span>
          </div>

          <h1 className="text-xl md:text-5xl font-medium text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Dream Stay
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-white/90 mb-12 leading-relaxed">
            Discover amazing hotels, resorts, and accommodations worldwide.
            <br className="hidden md:block" />
            Book with confidence and enjoy unforgettable experiences.
          </p>

          {/* Feature icons — 2×2 on phone, 4-col on sm+ */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Search className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Smart Search</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/80">
              <MapPin className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Global Destinations</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Calendar className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Flexible Booking</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Users className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Advanced Search — full width of PageContainer */}
        <AdvancedSearch onSearch={onSearch} />
      </PageContainer>
    </section>
  );
};

export default Hero;
