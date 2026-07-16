"use client";

export function Toast({ bericht }: { bericht: string }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-[500] flex justify-center px-4">
      <div className="animatie-toast rounded-full bg-donker px-5 py-2.5 text-sm font-semibold text-geel shadow-lg">
        {bericht}
      </div>
    </div>
  );
}
