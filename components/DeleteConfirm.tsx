"use client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name: string;
    description?: string;
    onConfirm: () => void;
    isPending?: boolean;
}

export function DeleteConfirm({
    open,
    onOpenChange,
    name,
    description,
    onConfirm,
    isPending,
}: DeleteConfirmProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Confirmer la suppression
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description ?? (
                            <>
                                Vous êtes sur le point de supprimer{" "}
                                <span className="font-semibold text-foreground">
                                    {name}
                                </span>
                                . Cette action est irréversible.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Suppression…" : "Supprimer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
