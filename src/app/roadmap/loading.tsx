export default function RoadmapLoading() {
  return (
    <main className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>

        {/* Roadmap columns skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['Backlog', 'Planned', 'In Progress', 'Completed'].map((status, i) => (
            <div key={status} className="space-y-4">
              <div className="text-center">
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 mx-auto mt-2 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="border rounded-lg p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
