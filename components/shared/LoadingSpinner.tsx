"use client";

import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={32} className="text-blue-500 animate-spin" />
      {message && (
        <p className="text-sm text-gray-500 mt-3">{message}</p>
      )}
    </div>
  );
}
