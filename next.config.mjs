/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Good for Netlify
  },
  // Optional: Add experimental settings for better Netlify support
  experimental: {
    serverComponentsExternalPackages: ['@netlify/plugin-nextjs'], // If using App Router
  },
};

export default nextConfig;