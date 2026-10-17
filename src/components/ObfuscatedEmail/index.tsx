'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// Basic anti-scraping: the prerendered HTML holds a decoy, the real address
// only appears after hydration
const ObfuscatedEmail = () =>
  useSyncExternalStore(
    subscribe,
    () => `johan@developpeur-web.tech`,
    () => `vincent.crtd@gmail.com`,
  );

export default ObfuscatedEmail;
