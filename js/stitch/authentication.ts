import { AnonymousCredential } from "mongodb-stitch-browser-sdk";
import { stitchApp } from "./stitchapp";
import { IgeneralError } from "../utils";

export function loginAnonymous() {
  // Allow users to log in anonymously
  const credential = new AnonymousCredential();
  return stitchApp.auth.loginWithCredential(credential)
    .catch((e) => {
      return ({
          code: e.errorCode,
          message: e.message
        } as IgeneralError);
    });
}

export function hasLoggedInUser() {
  // Check if there is currently a logged in user
  return stitchApp.auth.isLoggedIn;
}
