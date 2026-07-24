import { hotelFacilities } from "../config/hotel-options-config";
import { Checkbox } from "./ui/checkbox";
import FilterSectionLabel from "./FilterSectionLabel";
import { Sparkles } from "lucide-react";

type Props = {
  selectedFacilities: string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const FacilitiesFilter = ({ selectedFacilities, onChange }: Props) => {
  return (
    <div className="border-b border-slate-300 pb-5">
      <FilterSectionLabel icon={Sparkles} title="Facilities" />
      <div className="space-y-2">
        {hotelFacilities.map((facility) => (
          <label
            key={facility}
            className="flex items-center space-x-2 cursor-pointer text-gray-700"
          >
            <Checkbox
              checked={selectedFacilities.includes(facility)}
              onCheckedChange={(checked) => {
                // Bridge to existing ChangeEvent handler in Search.tsx
                const synthetic = {
                  target: {
                    value: facility,
                    checked: checked === true,
                  },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(synthetic);
              }}
            />
            <span className="text-sm">{facility}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FacilitiesFilter;
