import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This is needed for accessing the dev server from other devices/ngrok
  allowedDevOrigins: [
    'localhost:3000', 
    'localhost:3001',
    '192.168.88.1:3001',
    '*.ngrok-free.app' 
  ],
};

export default nextConfig;
