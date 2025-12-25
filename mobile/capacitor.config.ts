import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.company.slingshot',
  appName: 'SlingShotApp',
  webDir: 'build',
  server: {
    androidScheme: 'http',
    cleartext: true
  },
  plugins: {
    Motion: {
      enabled: true
    },
    Camera: {
      enabled: true
    }
  }
};

export default config;
