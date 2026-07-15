"use client";

import { useRef, useState, type MouseEvent } from "react";

type BrandRibbonProps = {
  brands: string[];
  selectedBrand: string | null;
  onSelectBrand: (brand: string | null) => void;
};

export function BrandRibbon({ brands, selectedBrand, onSelectBrand }: BrandRibbonProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [didDrag, setDidDrag] = useState(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDidDrag(false);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    startScrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 5) setDidDrag(true); // treat as a drag, not a click
    scrollRef.current.scrollLeft = startScrollLeft.current - walk;
  };

  const stopDragging = () => setIsDragging(false);

  // Prevent the click-to-select firing right after a drag
  const handleSelect = (value: string | null) => {
    if (didDrag) return;
    onSelectBrand(value);
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      className={`mb-8 flex gap-3 overflow-x-auto pb-2 touch-pan-x select-none [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <button
        type="button"
        onClick={() => handleSelect(null)}
        className={`flex-shrink-0 whitespace-nowrap rounded-full px-6 py-3 text-base font-bold transition ${
          selectedBrand === null
            ? "bg-kiosk-primary text-white shadow-md"
            : "bg-white text-kiosk-primary hover:bg-kiosk-light"
        }`}
      >
        All Brands
      </button>
      {brands.map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => handleSelect(b)}
          className={`flex-shrink-0 whitespace-nowrap rounded-full px-6 py-3 text-base font-bold transition ${
            selectedBrand === b
              ? "bg-kiosk-primary text-white shadow-md"
              : "bg-white text-kiosk-primary hover:bg-kiosk-light"
          }`}
        >
          {b}
        </button>
      ))}
    </div>
  );
}