if(!self.define){let e,s={};const n=(n,i)=>(n=new URL(n+".js",i).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(i,t)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let c={};const f=e=>n(e,a),r={module:{uri:a},exports:c,require:f};s[a]=Promise.all(i.map((e=>r[e]||f(e)))).then((e=>(t(...e),c)))}}define(["./workbox-1846d813"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next//static/media/banner_home.16b9dff8.jpg",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/167-57d0010b83c5a57c.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/283-654bce9f2b2f2c6a.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/343-6cd64c818d1d4dd3.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/729-6e6b0f85b59f9a43.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/847-86180eb5885ed5f0.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/framework-91d7f78b5b4003c8.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/main-ec95d66e0c86d60d.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/_app-d148b16aa4953ad3.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/_error-2280fa386d040b66.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/genre/%5Bslug%5D-1fdaac71b01a744b.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/index-28d5a340c86b154b.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/jeu/%5Bslug%5D-b39a655d38375850.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/mentions-legales-5f1bc997065110ea.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/plan-du-site-7b0926fe2b9f3053.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/politique-de-confidentialite-825903f37f7b0a5c.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/pages/sitemap.xml-2b924fab52248264.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/polyfills-5cd94c89d3acac5f.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/chunks/webpack-b927671265afed5e.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/css/6a14eeca9b9e2f59.css",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/jfU0fHEAUNpL7NeYWjIfl/_buildManifest.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/jfU0fHEAUNpL7NeYWjIfl/_middlewareManifest.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/_next/static/jfU0fHEAUNpL7NeYWjIfl/_ssgManifest.js",revision:"jfU0fHEAUNpL7NeYWjIfl"},{url:"/favicon.ico",revision:"21b739d43fcb9bbb83d8541fe4fe88fa"},{url:"/fonts/BebasNeueBold.woff2",revision:"06a22213f618c5c815b95e93cea03276"},{url:"/fonts/PPCirka-Variable.woff2",revision:"cbafe24cf8471e0c71f6020ee8b61084"},{url:"/icons/180x180.png",revision:"bb9bd52993a22767c1a7fa738a0773fa"},{url:"/icons/72x72.png",revision:"6dfebd8daa301e864c8afb88b262b76c"},{url:"/icons/76x76.png",revision:"43273dc93937157ea357f69b4bd874ba"},{url:"/icons/favicon.ico",revision:"21b739d43fcb9bbb83d8541fe4fe88fa"},{url:"/icons/folder-games-icon.png",revision:"bd1c58b735bdbf770ce927b8101ff4a2"},{url:"/manifest.json",revision:"d9706c6e6f1ef94e0b985c5e73aabe0f"},{url:"/vercel.svg",revision:"0277e415b4bba9361a057a607884c295"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:i})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
