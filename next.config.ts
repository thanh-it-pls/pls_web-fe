import type { NextConfig } from "next";

/** `standalone` builds a self-contained server (server.js + traced node_modules) for the Docker image. */
const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
