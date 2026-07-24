import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import FilterSectionLabel from "./FilterSectionLabel";
import { DollarSign } from "lucide-react";

type Props = {
  selectedPrice?: number;
  onChange: (value?: number) => void;
};

const PriceFilter = ({ selectedPrice, onChange }: Props) => {
  return (
    <div>
      <FilterSectionLabel icon={DollarSign} title="Max Price" />
      <Select
        value={selectedPrice != null ? String(selectedPrice) : "any"}
        onValueChange={(v) =>
          onChange(v === "any" ? undefined : parseInt(v, 10))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select max price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any</SelectItem>
          {[50, 100, 200, 300, 500].map((price) => (
            <SelectItem key={price} value={String(price)}>
              £{price}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PriceFilter;
