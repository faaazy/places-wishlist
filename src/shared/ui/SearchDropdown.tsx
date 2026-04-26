import { useEffect, useRef } from "react";
import type { SearchResult } from "../lib/geocoding";
import styles from "./SearchDropdown.module.css";

interface SearchDropdownProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
}

export function SearchDropdown({
  results,
  onSelect,
  onClose,
}: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickOutsideHandler(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", clickOutsideHandler);

    return () => document.removeEventListener("mousedown", clickOutsideHandler);
  }, [onClose]);

  if (results.length === 0) return null;

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      {results.slice(0, 5).map((res) => {
        const parts = res.display_name.split(",");
        const main = parts[0]?.trim() || "";
        const details = parts.slice(1).join(",").trim();

        return (
          <div
            key={res.lat + "," + res.lon}
            className={styles.item}
            onClick={() => onSelect(res)}
          >
            <span className={styles.main}>{main}</span>
            {details && <span className={styles.details}>{details}</span>}
          </div>
        );
      })}
    </div>
  );
}
