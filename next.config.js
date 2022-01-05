const withPWA = require('next-pwa');

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['images.igdb.com'],
  },
  pwa: {
    dest: 'public',
  },
});
