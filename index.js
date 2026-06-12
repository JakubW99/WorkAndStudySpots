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
        padding: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow: hidden;
      }

      #root {
        display: flex;
        flex-direction: column;
        height: 100vh;
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
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
