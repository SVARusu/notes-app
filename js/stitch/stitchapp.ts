import { Stitch } from "mongodb-stitch-browser-sdk";

// Add your Stitch app's App ID
const APP_ID = "todo-ptazc";

// Initialize the app client
const stitchApp = Stitch.hasAppClient(APP_ID)
  ? Stitch.getAppClient(APP_ID)
  : Stitch.initializeAppClient(APP_ID)

export { stitchApp };
