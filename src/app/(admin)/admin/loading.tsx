import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 rounded-control" />
        <Skeleton className="h-4 w-80 rounded-control" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-card border border-hairline bg-surface space-y-3">
            <Skeleton className="h-4 w-28 rounded-control" />
            <Skeleton className="h-8 w-20 rounded-control" />
          </div>
        ))}
      </div>

      <div className="p-6 rounded-card border border-hairline bg-surface space-y-4">
        <Skeleton className="h-10 w-full max-w-sm rounded-control" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-control" />
          ))}
        </div>
      </div>
    </div>
  );
}
