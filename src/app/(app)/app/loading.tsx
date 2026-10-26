import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Title & Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-control" />
          <Skeleton className="h-4 w-72 rounded-control" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-control" />
          <Skeleton className="h-10 w-36 rounded-control" />
        </div>
      </div>

      {/* KPI Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-card border border-hairline bg-surface space-y-3 shadow-xs">
            <Skeleton className="h-4 w-24 rounded-control" />
            <Skeleton className="h-8 w-16 rounded-control" />
            <Skeleton className="h-3 w-32 rounded-control" />
          </div>
        ))}
      </div>

      {/* Main Content Card Skeleton */}
      <div className="p-6 rounded-card border border-hairline bg-surface space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded-control" />
          <Skeleton className="h-4 w-20 rounded-control" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-hairline/60">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 rounded-control" />
                <Skeleton className="h-3 w-28 rounded-control" />
              </div>
              <Skeleton className="h-7 w-20 rounded-control" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
