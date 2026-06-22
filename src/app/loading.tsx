export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f]">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
        </div>
        <span className="text-gradient font-bold text-lg">Z7shop</span>
      </div>
    </div>
  );
}
