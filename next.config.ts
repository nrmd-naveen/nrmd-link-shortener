import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Opt into server actions if needed later
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  // Allow bcryptjs to be bundled (it uses Node.js crypto which is fine in Node runtime)
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
