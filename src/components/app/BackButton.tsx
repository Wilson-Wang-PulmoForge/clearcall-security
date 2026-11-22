import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => router.history.back()}
      className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
    >
      <ChevronLeft className="h-6 w-6" />
    </button>
  );
}
