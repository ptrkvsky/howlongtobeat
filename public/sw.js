if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,t)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let c={};const r=e=>i(e,a),o={module:{uri:a},exports:c,require:r};s[a]=Promise.all(n.map((e=>o[e]||r(e)))).then((e=>(t(...e),c)))}}define(["./workbox-1846d813"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next//static/media/banner_home.16b9dff8.jpg",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/OzihFCPSnydgr-ipfsZ6o/_buildManifest.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/OzihFCPSnydgr-ipfsZ6o/_middlewareManifest.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/OzihFCPSnydgr-ipfsZ6o/_ssgManifest.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/345-544b7b3cca34a443.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/385-ffd6ae2a5bb89cde.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/635-3858d9716f194713.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/framework-91d7f78b5b4003c8.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/main-ec95d66e0c86d60d.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/_app-e47371711ae709ac.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/_error-2280fa386d040b66.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/genre/%5Bid%5D-8b8bf4de9d345465.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/index-c42900bd1691f2b7.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/jeu/%5Bid%5D-8a9562ef4907b55e.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/mentions-legales-98607db93a562a32.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/plan-du-site-048e769c2967b8f6.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/politique-de-confidentialite-9886c4b02c272e96.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/pages/sitemap.xml-92598e1eddee0214.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/polyfills-5cd94c89d3acac5f.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/chunks/webpack-514908bffb652963.js",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/_next/static/css/6a14eeca9b9e2f59.css",revision:"OzihFCPSnydgr-ipfsZ6o"},{url:"/favicon.ico",revision:"21b739d43fcb9bbb83d8541fe4fe88fa"},{url:"/fonts/BebasNeueBold.woff2",revision:"06a22213f618c5c815b95e93cea03276"},{url:"/fonts/PPCirka-Variable.woff2",revision:"cbafe24cf8471e0c71f6020ee8b61084"},{url:"/icons/180x180.png",revision:"bb9bd52993a22767c1a7fa738a0773fa"},{url:"/icons/72x72.png",revision:"6dfebd8daa301e864c8afb88b262b76c"},{url:"/icons/76x76.png",revision:"43273dc93937157ea357f69b4bd874ba"},{url:"/icons/favicon.ico",revision:"21b739d43fcb9bbb83d8541fe4fe88fa"},{url:"/icons/folder-games-icon.png",revision:"bd1c58b735bdbf770ce927b8101ff4a2"},{url:"/manifest.json",revision:"d9706c6e6f1ef94e0b985c5e73aabe0f"},{url:"/vercel.svg",revision:"0277e415b4bba9361a057a607884c295"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
