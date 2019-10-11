import { DB } from './db';
import './stitch/stitchIndex';
import { loginAnonymous, hasLoggedInUser } from './stitch/stitchIndex';
import { categories, todos, users } from './stitch/mongodb';
console.log(todos);
const query = { "completed":  false  };

todos.find(query).toArray()
  .then(items => {
    console.log(`Successfully found ${items.length} documents.`)
    items.forEach(console.log)
    items.forEach((element: any) => {
      console.log(element.owner_id);
      
    });
    return items
  })
  .catch(err => console.error(`Failed to find documents: ${err}`))

const db = new DB();
//let loginButton: Element = document.querySelector("#login-button") as HTMLElement;
let loginUsername: HTMLInputElement = document.querySelector("#login-username") as HTMLInputElement;
let loginPassword: HTMLInputElement = document.querySelector("#login-password") as HTMLInputElement;
let loginForm: HTMLFormElement = document.querySelector("#login-form") as HTMLFormElement;

async function init() {
  loginAnonymous().then(() => {
    console.log('Anonymous user logged in: ', hasLoggedInUser());
  })

  if (loginForm && loginUsername && loginPassword) {
    loginForm.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      db.loginUser(loginUsername.value, loginPassword.value)
        .then((verdict) => {
          if (verdict === true) {
            console.log(window.location);
            let location = window.location.href;
            //location = location.replace("index.html", "notes.html");
            //location = location + "/notes.html";
            if (location.includes("index.html")) {
              location = location.replace("index.html", "notes.html");
            } else {
              location = location + "notes.html";
            }
            window.location.href = location;
          }
        })
        .catch((error) => {
          let errMessage: Element = document.querySelector("#error-message") as HTMLElement;
          errMessage.textContent = "Incorrect username or password or user does not exist.";
          console.log("user does not exist");

        });

    });
  } else {
    console.log("lol nice try lmao");

  }
}
init();
// export { loginForm, loginUsername, loginPassword };


