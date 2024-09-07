import React from 'react';
import '../styles/global.css';
import '../styles/fonts.css';

// Ensure global is defined
if (typeof window !== 'undefined') {
  window.global = window;
} else {
  global.global = global;
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;