import { DB } from './db';
import { categories, todos, users } from './stitch/mongodb';
import { inputValidationRegex } from './utils';
const db = new DB();

let validateUsername: HTMLInputElement = document.querySelector("#username") as HTMLInputElement;
let validateEmail: HTMLInputElement = document.querySelector("#email") as HTMLInputElement;
let validatePassword: HTMLInputElement = document.querySelector("#password") as HTMLInputElement;
let validateRetypedPassword: HTMLInputElement = document.querySelector("#repassword") as HTMLInputElement;
const form: HTMLFormElement = document.querySelector('#register-form') as HTMLFormElement;

let password: string = '';
let confirmed: string = '';

let verifyUsername: boolean = false;
let verifyEmail: boolean = false;
let verifyPassword: boolean = false;
let verifyRetypedPassword: boolean = false;

if (validateUsername && validateEmail && validatePassword && validateRetypedPassword) {
  validateUsername.addEventListener("blur", function (e: Event) {
    let value = (<HTMLInputElement>e.target).value;
    let errorString = usernameInputErrorHandler(value);

    if (errorString.includes("valid")) {
      validateUsername.removeAttribute("style");
      verifyUsername = true;
      (<HTMLInputElement>document.querySelector(".username")).style.visibility = "hidden";
    } else {
      validateUsername.setAttribute("style", "border: 2px solid red;");
      verifyUsername = false;
      console.log(verifyUsername);
      (<HTMLInputElement>document.querySelector(".username")).textContent = errorString;
      (<HTMLInputElement>document.querySelector(".username")).style.visibility = "visible";
    }
  });


  validateEmail.addEventListener("blur", function (e: Event) {
    let value = (<HTMLInputElement>e.target).value;

    if (inputValidationRegex.email.test(value)) {
      console.log(value);
      validateEmail.removeAttribute("style");
      (<HTMLInputElement>document.querySelector(".email")).style.visibility = "hidden";
      verifyEmail = true;
    } else {
      validateEmail.setAttribute("style", "border: 2px solid red;");
      verifyEmail = false;
      console.log(verifyEmail);
      (<HTMLInputElement>document.querySelector(".email")).style.visibility = "visible";
    }
  });


  validatePassword.addEventListener("blur", function (e: Event) {
    let value = (<HTMLInputElement>e.target).value;
    let errorString = passwordInputErrorHandler(value);
    password = value;

    if (errorString.includes("valid")) {
      console.log(value);
      validatePassword.removeAttribute("style");
      verifyPassword = true;
      (<HTMLInputElement>document.querySelector(".password")).style.visibility = "hidden";
    } else {
      validatePassword.setAttribute("style", "border: 2px solid red;");
      verifyPassword = false;
      console.log(verifyPassword);
      (<HTMLInputElement>document.querySelector(".password")).textContent = errorString;
      (<HTMLInputElement>document.querySelector(".password")).style.visibility = "visible";
    }
  });

  validateRetypedPassword.addEventListener("blur", function (e: Event) {
    let value = (<HTMLInputElement>document.querySelector("#repassword")).value;
    let errorString = passwordInputErrorHandler(value);
    confirmed = value;

    console.log(value);
    if (errorString.includes("valid")) {
      console.log(value);
      validateRetypedPassword.removeAttribute("style");
      verifyRetypedPassword = true;
      (<HTMLInputElement>document.querySelector(".password2")).style.visibility = "hidden";
    } else {
      validateRetypedPassword.setAttribute("style", "border: 2px solid red;");
      verifyRetypedPassword = false;
      console.log(verifyRetypedPassword);
      (<HTMLInputElement>document.querySelector(".password2")).textContent = errorString;
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
  if (verifyUsername && verifyEmail && verifyPassword && verifyRetypedPassword && passwordMatch(password, confirmed)) {
    (<HTMLInputElement>document.querySelector("#submit-button")).disabled = false;
  } else {
    (<HTMLInputElement>document.querySelector("#submit-button")).disabled = true;
  }
}
if (form) {
  form.addEventListener("submit", (e: Event) => {
    e.preventDefault();
    const newUser = {
      "username": validateUsername.value,
      "password": validatePassword.value,
      "email": validateEmail.value
    }

    const query = { "username": "alexandru.rusu" }
    users.findOne(query)
      .then(result => {
        let user: any = result
        if (result) {
          console.log(`Successfully found document: ${result}.`)
          console.log(user._id.toString());

        } else {
          console.log("No document matches the provided query.")
        }
      })
      .catch(err => console.error(`Failed to find document: ${err}`))



    db.addUser(validateUsername.value, validateEmail.value, validatePassword.value)
      .then(() => {
        console.log("user already exists");
        let p: Element = document.querySelector("#user-exists") as HTMLElement
        (<HTMLElement>p).style.color = 'red';
        p.textContent = "User already exists";
        p.setAttribute("class", "text-center")

      })
  });
}

function usernameInputErrorHandler(input: string): string {
  let errorStr = '';

  if (input.length >= 6) {
    if (inputValidationRegex.username.test(input)) {
      errorStr = 'Username valid';
    } else if (inputValidationRegex.containsSymbols.test(input)) {
      errorStr = 'Username can only contain letters, numbers and dot (.) symbol';
    }
  } else {
    errorStr = 'Username length must be greater than 5 characters';
  }

  return errorStr;
}

function passwordInputErrorHandler(input: string): string {
  let errorStr = 'Password must contain ';
  let errorArr = [];
  if (input.length > 8) {
    if (inputValidationRegex.password.test(input)) {
      errorStr = 'Password valid';
    } else if (!inputValidationRegex.startsWithLetter.test(input)) {
      errorStr = 'Password must start with a letter';
    } else {
      if (!inputValidationRegex.containsUpper.test(input)) {
        errorArr.push('at least one upper case letter');
      }
      if (!inputValidationRegex.containsLower.test(input)) {
        errorArr.push('at least one lower case letter');
      }
      if (!inputValidationRegex.containsNumber.test(input)) {
        errorArr.push('at least one number');
      }
      if (inputValidationRegex.containsCaret.test(input)) {
        errorArr.push("cannot contain caret (^) symbol");
      }
    }
  } else {
    errorStr = 'Password length must be greater than 8 characters';
  }

  if (errorArr.length === 1 && errorArr[0].includes("cannot")) {
    errorStr = "Password cannot contain caret (^) symbol";
  } else {
    errorStr += errorArr.join(', ');
  }

  return errorStr;
}

function passwordMatch(password: string, confirmed: string): boolean {
  if (password === confirmed) {
    console.log('passwords match');
    return true;
  } else {
    console.log("passwords don't match");
    return false;
  }
}

function generalErrorHandler(input: string) {

}
