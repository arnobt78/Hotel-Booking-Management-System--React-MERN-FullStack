import { Checkbox } from "./ui/checkbox";
import FilterSectionLabel from "./FilterSectionLabel";
import { Star } from "lucide-react";

type Props = {
  selectedStars: string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const StarRatingFilter = ({ selectedStars, onChange }: Props) => {
  return (
    <div className="border-b border-slate-300 pb-5">
      <FilterSectionLabel icon={Star} title="Property Rating" />
      <div className="space-y-2">
        {["5", "4", "3", "2", "1"].map((star) => (
          <label
            key={star}
            className="flex items-center space-x-2 cursor-pointer text-gray-700"
          >
            <Checkbox
              checked={selectedStars.includes(star)}
              onCheckedChange={(checked) => {
                const synthetic = {
                  target: { value: star, checked: checked === true },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(synthetic);
              }}
            />
            <span className="text-sm">{star} Stars</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StarRatingFilter;
