/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        pathname: '/**', // Allow all paths for logo in Navbar
      },
      {
        protocol: 'https',
        hostname: 'api.empowernextgenbd.com',
        pathname: '/**', // Allow all paths, not restricted to /Uploads
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Allow all paths for Cloudinary
      },
    ],
  },
};

export default nextConfig;