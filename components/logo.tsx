export function Logo() {
  return (
    <div className="relative h-[38px] w-[46px] shrink-0">
      <div
        className="absolute left-0 top-0 h-7 w-7 rounded-full shadow-[1px_2px_6px_rgba(0,0,0,0.3)]"
        style={{
          background: "radial-gradient(circle at 35% 32%, #4a90d9, #0b1f3a)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 h-[18px] w-[18px] rounded-full shadow-[1px_2px_4px_rgba(0,0,0,0.3)]"
        style={{
          background: "radial-gradient(circle at 35% 32%, #6ab0f5, #1a4480)",
        }}
      />
      <div
        className="absolute bottom-[2px] left-[2px] h-[9px] w-[9px] rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 32%, #ff6b35, #c0392b)",
        }}
      />
    </div>
  );
}
