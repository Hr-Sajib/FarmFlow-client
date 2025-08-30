/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.postimg.cc'], // Keep existing domain for logo in Navbar
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.empowernextgenbd.com',
        pathname: '/uploads/**', // Restrict to /Uploads path
      },
    ],
  },
};

export default nextConfig;