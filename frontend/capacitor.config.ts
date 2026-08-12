import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cropdoctor.app",
  appName: "CropDoctor AI",
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
};

export default config;
