import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" />
        <p className="text-muted-foreground">Loading players...</p>
      </div>
    </div>
  );
}
