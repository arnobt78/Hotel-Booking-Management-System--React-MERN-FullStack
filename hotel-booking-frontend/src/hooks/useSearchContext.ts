import { useContext } from "react";
import { SearchContext } from "../contexts/SearchContext";
import type { SearchContext as SearchContextType } from "../contexts/SearchContext";

const useSearchContext = () => {
  const context = useContext(SearchContext);
  return context as SearchContextType;
};

export default useSearchContext;
