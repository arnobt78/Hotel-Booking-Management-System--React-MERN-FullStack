import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export type Props = {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
};

/** Search/list pagination — Prev / page numbers / Next */
const Pagination = ({ page, pages, onPageChange }: Props) => {
  if (pages <= 0) return null;

  const pageNumbers: number[] = [];
  for (let i = 1; i <= pages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      <ul className="flex flex-wrap items-center gap-1">
        {pageNumbers.map((number) => (
          <li key={number}>
            <Button
              type="button"
              size="sm"
              variant={page === number ? "default" : "outline"}
              onClick={() => onPageChange(number)}
              className={cn(
                "min-w-9",
                page === number && "bg-primary-600 hover:bg-primary-700",
              )}
              aria-current={page === number ? "page" : undefined}
            >
              {number}
            </Button>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        className="gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
