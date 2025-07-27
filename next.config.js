/** @type {import('next').NextConfig} */
const nextConfig = {
  // אופטימיזציות ביצועים
  compress: true,
  poweredByHeader: false,
  
  // אופטימיזציות ייצור
  swcMinify: true,
  
  // אופטימיזציות תמונות
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: 'default-src \'self\'; script-src \'none\'; sandbox;',
  },
  
  // הגדרות experimental לביצועים
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // webpack אופטימיזציות
  webpack: (config, { dev, isServer }) => {
    // אופטימיזציות לייצור
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }
    
    return config;
  },
  
  // headers לביצועים
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
