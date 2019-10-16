import { DB } from './db';
import './stitch/stitchIndex';
import { loginAnonymous, hasLoggedInUser } from './stitch/stitchIndex';
import { categories, todos, users } from './stitch/mongodb';
const query = { "completed":  false  };

const db = new DB();
let loginUsername: HTMLInputElement = document.querySelector("#login-username") as HTMLInputElement;
let loginPassword: HTMLInputElement = document.querySelector("#login-password") as HTMLInputElement;
let loginForm: HTMLFormElement = document.querySelector("#login-form") as HTMLFormElement;
const generalError = document.querySelector(".general-error-login") as HTMLElement;

async function init() {
  loginAnonymous().then(() => {
    console.log('Anonymous user logged in: ', hasLoggedInUser());
  })

  if (loginForm && loginUsername && loginPassword) {
    loginForm.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      db.loginUser(loginUsername.value, loginPassword.value)
        .then((verdict) => {
          generalErrorHandler(verdict);
          if (verdict === 0) {
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
          generalError.textContent = "xxxxxxxxx";
          console.log("user does not exist");

        });

    });
  } else {
    console.log("lol nice try lmao");

  }
}
init();
// export { loginForm, loginUsername, loginPassword };

function generalErrorHandler(input: number | string) {
  if (input === 1) {
    generalError.textContent = 'Username does not exist';
    generalError.style.visibility = 'visible';
  } else if (input === 2) {
    generalError.textContent = 'Wrong password';
    generalError.style.visibility = 'visible';
  } else if (input === 'clear') {
    generalError.style.visibility = 'hidden';
  }
}
