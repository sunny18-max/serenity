import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        outline: "border border-input bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-border dark:bg-card dark:hover:bg-primary/20 dark:hover:text-primary dark:hover:border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/70",
        ghost: "hover:bg-primary/10 hover:text-primary hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] dark:hover:bg-primary/20 dark:hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 dark:text-primary dark:hover:text-primary/80",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] font-semibold dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // Ensure caller `className` is appended after variant classes so overrides apply
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };