/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Server configuration for IPv4 and IPv6 compatibility
  server: {
    // Support both IPv4 and IPv6
    host: '::',
    port: 3000,
  },
}

export default nextConfig