import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // This is a workaround for a bug in `@mapbox/node-pre-gyp` that causes a build error in Next.js.
    // The package includes a test HTML file that webpack tries to parse, leading to an error.
    // We can ignore this specific file to prevent the error.
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    Object.assign(config.resolve.alias, {
      '@mapbox/node-pre-gyp/lib/util/nw-pre-gyp/index.html': false,
    });
    return config;
  },
};

export default nextConfig;
