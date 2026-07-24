import { Search, MapPin, Calendar, Users, Star } from "lucide-react";
import AdvancedSearch from "./AdvancedSearch";
import PageContainer from "./PageContainer";
import { StaggerItem } from "./ui/stagger";

/**
 * Landing hero — classic primary blue bg stays static (never staggered).
 * Only badge / title / copy / features / search card animate in.
 */
const Hero = ({ onSearch }: { onSearch: (searchData: unknown) => void }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      {/* Static overlays — not StaggerItems */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent"
        aria-hidden
      />

      <PageContainer className="relative pt-8 pb-6">
        <div className="text-center max-w-4xl mx-auto">
          <StaggerItem index={0} className="inline-block mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-2 backdrop-blur-sm">
              <Star className="w-5 h-5 shrink-0 text-yellow-400" />
              <span className="text-white/90 font-medium">
                Trusted by 10,000+ travelers
              </span>
            </div>
          </StaggerItem>

          <StaggerItem index={1}>
            <h1 className="text-xl md:text-5xl font-medium text-white mb-6 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Dream Stay
              </span>
            </h1>
          </StaggerItem>

          <StaggerItem index={2}>
            <p className="text-lg md:text-2xl text-white/90 mb-12 leading-relaxed">
              Discover amazing hotels, resorts, and accommodations worldwide.
              <br className="hidden md:block" />
              Book with confidence and enjoy unforgettable experiences.
            </p>
          </StaggerItem>

          <StaggerItem index={3}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 mb-12 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-white/80">
                <Search className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm font-medium">
                  Smart Search
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-white/80">
                <MapPin className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm font-medium">
                  Global Destinations
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-white/80">
                <Calendar className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm font-medium">
                  Flexible Booking
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-white/80">
                <Users className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm font-medium">
                  24/7 Support
                </span>
              </div>
            </div>
          </StaggerItem>
        </div>

        <StaggerItem index={4}>
          <AdvancedSearch onSearch={onSearch} />
        </StaggerItem>
      </PageContainer>
    </section>
  );
};

export default Hero;
