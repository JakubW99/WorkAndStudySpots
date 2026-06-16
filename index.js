import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// ─── Web-only: Inject global CSS for premium look ───
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const webStyleId = 'wss-global-web-css';
  if (!document.getElementById(webStyleId)) {
    const style = document.createElement('style');
    style.id = webStyleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

      *, *::before, *::after {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow: hidden;
      }

      #root {
        display: flex;
        flex-direction: column;
        height: 100vh;
        height: 100dvh; /* dynamic viewport height — fixes bottom tabs cut off by mobile browser chrome */
        width: 100vw;
        overflow: hidden;
      }

      input, textarea, select {
        outline: none !important;
        font-family: inherit;
      }

      input:focus, textarea:focus {
        outline: none !important;
      }

      /* Custom scrollbar — thin & subtle */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(150, 150, 170, 0.3);
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(150, 150, 170, 0.5);
      }

      /* Leaflet overrides */
      .custom-leaflet-icon {
        background: none !important;
        border: none !important;
      }

      /* Smooth transitions on interactive elements */
      [role="button"], button, a {
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Override Expo's @font-face for Ionicons with CDN URL ───
  // Expo/react-native-web injects @font-face with hashed local paths that don't
  // exist on Netlify. This runs after a short delay to ensure Expo's declarations
  // are already in the DOM, then appends ours LAST so it takes precedence.
  const fontFixId = 'wss-ionicons-cdn-fix';
  if (!document.getElementById(fontFixId)) {
    const injectIoniconsCDN = () => {
      // Remove previous injection if it exists, so we re-append at the END of <head>
      const existing = document.getElementById(fontFixId);
      if (existing) existing.remove();

      const fontStyle = document.createElement('style');
      fontStyle.id = fontFixId;
      fontStyle.textContent = `
        @font-face {
          font-family: 'Ionicons';
          src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `;
      document.head.appendChild(fontStyle);
    };
    // Run immediately AND after a delay to ensure it comes AFTER Expo's runtime injection
    injectIoniconsCDN();
    setTimeout(injectIoniconsCDN, 1500);
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
