import withSerwistInit from '@serwist/next';
/** @type {import('next').NextConfig} */

const withSerwist = withSerwistInit({
  // Note: This is only an example. If you use Pages Router,
  // use something else that works, such as "service-worker/index.ts".
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
};

export default withSerwist(nextConfig);