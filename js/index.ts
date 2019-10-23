import { DB } from './db';
import './stitch/stitchIndex';
import { loginAnonymous, hasLoggedInUser } from './stitch/stitchIndex';
import { IgeneralError } from './utils';

const db = new DB();
let loginUsername: HTMLInputElement = document.querySelector("#login-username") as HTMLInputElement;
let loginPassword: HTMLInputElement = document.querySelector("#login-password") as HTMLInputElement;
let loginForm: HTMLFormElement = document.querySelector("#login-form") as HTMLFormElement;

const usernameInput = document.querySelector('.usernameInput') as HTMLElement;
const passwordInput = document.querySelector('.passwordInput') as HTMLElement;
const generalError = document.querySelector(".general-error") as HTMLElement;

async function init() {
  loginAnonymous().then((resp: any) => {
    if (resp.errorCode) {
      generalErrorHandler(resp);
    }
    console.log('Anonymous user logged in: ', hasLoggedInUser());
  })

  if (loginForm && loginUsername && loginPassword) {
    loginForm.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      db.loginUser(loginUsername.value, loginPassword.value)
        .then((response) => {
          generalErrorHandler(response as IgeneralError);
          if (response.code === 0) {
            let location = window.location.href;
            if (location.includes("index.html")) {
              location = location.replace("index.html", "notes.html");
            } else {
              location = location + "notes.html";
            }
            window.location.href = location;
          }
        })
        .catch((error) => {
          console.log(error);
          generalError.textContent = "xxxxxxxxx";
          console.log("user does not exist");
        });

    });
  } else {
    console.log("lol nice try lmao");
  }

  loginUsername.addEventListener('blur', (e: Event) => {
    let value = (<HTMLInputElement>e.target).value;
    let errorString = usernameInputErrorHandler(value);

    if (errorString.includes("valid")) {
      loginUsername.removeAttribute("style");
      usernameInput.style.visibility = "hidden";
    } else {
      loginUsername.setAttribute("style", "border: 2px solid red;");
      usernameInput.textContent = errorString;
      usernameInput.style.visibility = "visible";
    }
  });

  loginPassword.addEventListener('blur', (e: Event) => {
    let value = (<HTMLInputElement>e.target).value;
    let errorString = passwordInputErrorHandler(value);

    if (errorString.includes("valid")) {
      loginPassword.removeAttribute("style");
      passwordInput.style.visibility = "hidden";
    } else {
      loginPassword.setAttribute("style", "border: 2px solid red;");
      passwordInput.textContent = errorString;
      passwordInput.style.visibility = "visible";
    }
  });
}
init();

function usernameInputErrorHandler(input: string): string {
  if (input.length === 0) {
    return 'Username is required';
  }
  return 'Input is valid';
}

function passwordInputErrorHandler(input: string): string {
  if (input.length === 0) {
    return 'Password is required';
  }
  return 'Input is valid';
}

function generalErrorHandler(input: IgeneralError | string) {
  if (typeof input === 'string') {
    generalError.style.visibility = 'hidden';
  } else {
    generalError.textContent = `${input.message}`
    generalError.style.visibility = 'visible';
  }
}
