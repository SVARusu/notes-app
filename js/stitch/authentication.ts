import { AnonymousCredential } from "mongodb-stitch-browser-sdk";
import { stitchApp } from "./stitchapp";

export function loginAnonymous() {
  // Allow users to log in anonymously
  const credential = new AnonymousCredential();
  return stitchApp.auth.loginWithCredential(credential)
    .catch((e) => {
      return ({
        errorCode: e.errorCode as number,
        message: e.message as string
      })
    })
}

export function hasLoggedInUser() {
  // Check if there is currently a logged in user
  return stitchApp.auth.isLoggedIn;
}

export function getCurrentUser() {
  // Return the user object of the currently logged in user
  return stitchApp.auth.isLoggedIn ? stitchApp.auth.user : null;
}

export function logoutCurrentUser() {
  // Logout the currently logged in user
  const user: any = getCurrentUser();
  return stitchApp.auth.logoutUserWithId(user.id);
}
