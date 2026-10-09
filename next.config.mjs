/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Standaard 1MB — te weinig voor een affiche-foto (als base64 in de
      // server action payload) die client-side niet verkleind kon worden
      // (bv. HEIC op een niet-Apple-toestel, zie verwerk-affiche-afbeelding.ts).
      bodySizeLimit: "15mb",
    },
  },
  async headers() {
    return [
      {
        source: "/boules",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
