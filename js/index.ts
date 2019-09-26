let validateUsername: Element = document.querySelector("#username") as HTMLElement;
let validateEmail: Element = document.querySelector("#email") as HTMLElement;
let validatePassword: Element = document.querySelector("#password") as HTMLElement;
let validateRetypedPassword: Element = document.querySelector("#repassword") as HTMLElement;
let submitButton: Element = document.querySelector("#submit-button") as HTMLElement;
const form: Element = document.querySelector('#register-form') as HTMLElement;
let username: string;
let email: string;
let password: string = '';

let verifyUsername: boolean = false;
let verifyEmail: boolean = false;
let verifyPassword: boolean = false;
let verifyRetypedPassword: boolean = false;

if (validateUsername && validateEmail && validatePassword && validateRetypedPassword) {
    validateUsername.addEventListener("input", function (e: Event) {
        let letter = /^[A-Za-z0-9][A-Za-z0-9\.]{6,15}$/;
        let value = (<HTMLInputElement>e.target).value;
        if (value.match(letter)) {
            console.log(value);
            validateUsername.removeAttribute("style");
            verifyUsername = true;
            username = value;
            (<HTMLInputElement>document.querySelector(".username")).style.visibility = "hidden";
        } else {
            validateUsername.setAttribute("style", "border: 2px solid red;");
            verifyUsername = false;
            console.log(verifyUsername);
            (<HTMLInputElement>document.querySelector(".username")).style.visibility = "visible";
        }
    });


    validateEmail.addEventListener("input", function (e: Event) {
        let letter = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let value = (<HTMLInputElement>e.target).value;
        if (value.match(letter)) {
            console.log(value);
            validateEmail.removeAttribute("style");
            (<HTMLInputElement>document.querySelector(".email")).style.visibility = "hidden";
            verifyEmail = true;
            email = value;
        } else {
            validateEmail.setAttribute("style", "border: 2px solid red;");
            verifyEmail = false;
            console.log(verifyEmail);
            (<HTMLInputElement>document.querySelector(".email")).style.visibility = "visible";
        }
    });


    validatePassword.addEventListener("input", function (e: Event) {
        let letter = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*])[a-zA-Z0-9!@#$%&*]{6,15}$/;
        let value = (<HTMLInputElement>e.target).value;
        password = value;
        if (value.match(letter)) {
            console.log(value);
            validatePassword.removeAttribute("style");
            verifyPassword = true;
            (<HTMLInputElement>document.querySelector(".password")).style.visibility = "hidden";
        } else {
            validatePassword.setAttribute("style", "border: 2px solid red;");
            verifyPassword = false;
            console.log(verifyPassword);
            (<HTMLInputElement>document.querySelector(".password")).style.visibility = "visible";

        }
    });

    validateRetypedPassword.addEventListener("input", function (e: Event) {
        let letter = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*])[a-zA-Z0-9!@#$%&*]{6,15}$/;
        let value = (<HTMLInputElement>e.target).value;
        if (value.match(letter) && value === password) {
            console.log(value);
            validateRetypedPassword.removeAttribute("style");
            verifyRetypedPassword = true;
            (<HTMLInputElement>document.querySelector(".password2")).style.visibility = "hidden";
        } else {
            validateRetypedPassword.setAttribute("style", "border: 2px solid red;");
            verifyRetypedPassword = false;
            console.log(verifyRetypedPassword);
            (<HTMLInputElement>document.querySelector(".password2")).style.visibility = "visible";
        }
    });

    validateUsername.addEventListener("blur", drawBorder);
    validateEmail.addEventListener("blur", drawBorder);
    validatePassword.addEventListener("blur", drawBorder);
    validateRetypedPassword.addEventListener("blur", drawBorder);
}
function drawBorder(e: Event) {
    let value = (<HTMLInputElement>e.target).value;
    if (value === "") {
        (<HTMLInputElement>e.target).setAttribute("style", "border: 2px solid red;");
    }
    if (verifyUsername && verifyEmail && verifyPassword && verifyRetypedPassword) {
        (<HTMLInputElement>document.querySelector("#submit-button")).disabled = false;
    } else {
        (<HTMLInputElement>document.querySelector("#submit-button")).disabled = true;
    }
}

/* submitButton.addEventListener("click", function(e){
    e.preventDefault();
    openDB(username, email, password);
}); */

export { form, validateEmail, validatePassword, validateUsername };