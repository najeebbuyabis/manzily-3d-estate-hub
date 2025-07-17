import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.561e668e18b84ecc99e2218176afcc33',
  appName: 'manzily-3d-estate-hub',
  webDir: 'dist',
  server: {
    url: 'https://561e668e-18b8-4ecc-99e2-218176afcc33.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT_CONTENT',
      backgroundColor: '#000000',
    },
  },
};

export default config;