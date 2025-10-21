"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

// Define variants (currently only default)
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

// Type props for the Label component
export type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  className?: string;
};

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, ...props }, ref) => {
    return <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />;
  }
);

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
