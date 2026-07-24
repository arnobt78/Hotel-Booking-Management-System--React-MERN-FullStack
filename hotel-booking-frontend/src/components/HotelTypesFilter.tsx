import { hotelTypes } from "../config/hotel-options-config";
import { Checkbox } from "./ui/checkbox";
import FilterSectionLabel from "./FilterSectionLabel";
import { Building2 } from "lucide-react";

type Props = {
  selectedHotelTypes: string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const HotelTypesFilter = ({ selectedHotelTypes, onChange }: Props) => {
  return (
    <div className="border-b border-slate-300 pb-5">
      <FilterSectionLabel icon={Building2} title="Hotel Type" />
      <div className="space-y-2">
        {hotelTypes.map((hotelType) => (
          <label
            key={hotelType}
            className="flex items-center space-x-2 cursor-pointer text-gray-700"
          >
            <Checkbox
              checked={selectedHotelTypes.includes(hotelType)}
              onCheckedChange={(checked) => {
                const synthetic = {
                  target: { value: hotelType, checked: checked === true },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(synthetic);
              }}
            />
            <span className="text-sm">{hotelType}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default HotelTypesFilter;
