/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site: no functions, no ISR. Rebuilt by a Sanity webhook.
  output: `export`,
  reactStrictMode: true,
  images: {
    // IGDB covers are already resized by their CDN
    unoptimized: true,
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
