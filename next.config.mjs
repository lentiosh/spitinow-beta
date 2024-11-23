/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['rqehumxwxtzsmmggahqb.supabase.co'],
    },
    async headers() {
      return [
        {
          // Apply these headers to all routes
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;