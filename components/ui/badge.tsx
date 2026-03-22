import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                success:
                    "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
                warning:
                    "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
                admin: "border-transparent bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
                benevole:
                    "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
                intendant: "border-transparent bg-orange-100 text-orange-700",
                reparateur: "border-transparent bg-sky-100 text-sky-700",
                operationnel: "border-transparent bg-teal-100 text-teal-700",
                statut_en_attente:
                    "border-transparent bg-slate-100 text-slate-700",
                statut_en_cours:
                    "border-transparent bg-amber-100 text-amber-700",
                statut_repare:
                    "border-transparent bg-emerald-100 text-emerald-700",
                statut_irreparable:
                    "border-transparent bg-red-100 text-red-700",
                statut_a_rappeler:
                    "border-transparent bg-violet-100 text-violet-700",
            },
        },
        defaultVariants: { variant: "default" },
    },
);

export interface BadgeProps
    extends
        React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
