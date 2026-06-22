export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0c0c0f]">
      {/* Header skeleton */}
      <div className="h-16 border-b border-white/[0.05] flex items-center px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="h-6 w-16 bg-white/[0.06] rounded-lg animate-pulse" />
        <div className="flex-1" />
        <div className="flex gap-3">
          <div className="h-8 w-8 bg-white/[0.06] rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-white/[0.06] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="py-20 md:py-28 flex flex-col items-center px-4">
        <div className="h-4 w-28 bg-white/[0.06] rounded-full animate-pulse mb-6" />
        <div className="h-10 md:h-14 w-72 md:w-[480px] bg-white/[0.06] rounded-xl animate-pulse mb-4" />
        <div className="h-4 w-56 md:w-96 bg-white/[0.04] rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-44 md:w-72 bg-white/[0.04] rounded-lg animate-pulse mb-8" />
        <div className="flex gap-3">
          <div className="h-12 w-36 bg-gold/10 rounded-xl animate-pulse" />
          <div className="h-12 w-36 bg-white/[0.06] rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="h-8 w-48 bg-white/[0.06] rounded-lg animate-pulse mb-8 mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden">
              <div className="aspect-square bg-white/[0.04] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-5 w-24 bg-gold/10 rounded animate-pulse mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
