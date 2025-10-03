'use client'

export default function ChatHistorySkeleton() {
  return (
    <div className="flex-1 overflow-y-auto bg-background-muted w-full">
      <div className="mx-auto p-6 w-full animate-pulse">
        {Array.from({ length: 5 }).map((_, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <div className="h-6 w-24 bg-gray-200 rounded mx-auto mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((__, rowIdx) => (
                <div key={rowIdx} className={`flex ${rowIdx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[70%] px-6 py-4 rounded-2xl bg-gray-200 h-6 w-64" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


