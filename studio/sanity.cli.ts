import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "gntr6ikv",
    dataset: "production",
  },
  // Hosted at https://olam-hayadit.sanity.studio
  studioHost: "olam-hayadit",
  deployment: {
    appId: "rf0hymbxougsax3ucvxa199c",
    autoUpdates: true,
  },
});
