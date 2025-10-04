"use client";

export default function ChatListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="px-6 py-4 bg-background animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-10 bg-gray-200 rounded" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="h-3 w-56 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
