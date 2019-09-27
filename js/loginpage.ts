import { DB } from './db';

//let loginButton: Element = document.querySelector("#login-button") as HTMLElement;
let loginUsername: HTMLInputElement = document.querySelector("#login-username") as HTMLInputElement;
let loginPassword: HTMLInputElement = document.querySelector("#login-password") as HTMLInputElement;
let loginForm: HTMLFormElement = document.querySelector("#login-form") as HTMLFormElement;

const db = new DB();
if (loginForm) {
    loginForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        db.loginUser(loginUsername.value, loginPassword.value)
            .then((response) => {
                console.log(window.location);
                let location = window.location.href;
                location = location.replace("login.html", "notes.html");
                window.location.href = location;
            })
            .catch((error) => {
                let errMessage: Element = document.querySelector("#error-message") as HTMLElement;
                errMessage.textContent = "Incorrect username or password or user does not exist.";
                console.log("user does not exist");

            });

    });

}

// export { loginForm, loginUsername, loginPassword };


