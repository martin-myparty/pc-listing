"use client";
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

interface SliderProps {
  value: number[];
  onChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
}

export function Slider({ value, onChange, min, max, step }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      value={value}
      onValueChange={onChange}
      max={max}
      min={min}
      step={step}
    >
      <SliderPrimitive.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
        <SliderPrimitive.Range className="absolute bg-black dark:bg-white rounded-full h-full" />
      </SliderPrimitive.Track>
      {value.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block w-4 h-4 bg-black dark:bg-white rounded-full focus:outline-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}