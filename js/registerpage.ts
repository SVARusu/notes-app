import { DB } from './db';
import { IgeneralError, inputValidationRegex } from './utils';
const db = new DB();

let validateUsername: HTMLInputElement = document.querySelector("#username") as HTMLInputElement;
let validateEmail: HTMLInputElement = document.querySelector("#email") as HTMLInputElement;
let validatePassword: HTMLInputElement = document.querySelector("#password") as HTMLInputElement;
let validateRetypedPassword: HTMLInputElement = document.querySelector("#repassword") as HTMLInputElement;
const form: HTMLFormElement = document.querySelector('#register-form') as HTMLFormElement;
const submitButton = document.querySelector("#submit-button") as HTMLInputElement;

const usernameError = document.querySelector(".username") as HTMLElement;
const passwordError = document.querySelector(".password") as HTMLElement;
const confirmedError = document.querySelector(".password2") as HTMLElement;
const emailError = document.querySelector(".email") as HTMLElement;
const generalError = document.querySelector(".general-error") as HTMLElement;

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
      usernameError.style.visibility = "hidden";
    } else {
      validateUsername.setAttribute("style", "border: 2px solid red;");
      verifyUsername = false;
      usernameError.textContent = errorString;
      usernameError.style.visibility = "visible";
    }
  });


  validateEmail.addEventListener("blur", function (e: Event) {
    let value = (<HTMLInputElement>e.target).value;

    if (inputValidationRegex.email.test(value)) {
      validateEmail.removeAttribute("style");
      emailError.style.visibility = "hidden";
      verifyEmail = true;
    } else {
      validateEmail.setAttribute("style", "border: 2px solid red;");
      verifyEmail = false;
      emailError.style.visibility = "visible";
    }
  });


  validatePassword.addEventListener("blur", function (e: Event) {
    let value = (<HTMLInputElement>e.target).value;
    let errorString = passwordInputErrorHandler(value);
    password = value;

    if (errorString.includes("valid")) {
      validatePassword.removeAttribute("style");
      verifyPassword = true;
      passwordError.style.visibility = "hidden";
    } else {
      validatePassword.setAttribute("style", "border: 2px solid red;");
      verifyPassword = false;
      passwordError.textContent = errorString
      passwordError.style.visibility = "visible";
    }
  });

  validateRetypedPassword.addEventListener("blur", function (e: Event) {
    let value = (<HTMLInputElement>e.target).value;
    let errorString = passwordInputErrorHandler(value);
    confirmed = value;

    if (errorString.includes("valid")) {
      validateRetypedPassword.removeAttribute("style");
      verifyRetypedPassword = true;
      confirmedError.style.visibility = "hidden";
    } else {
      validateRetypedPassword.setAttribute("style", "border: 2px solid red;");
      verifyRetypedPassword = false;
      confirmedError.textContent = errorString;
      confirmedError.style.visibility = "visible";
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
    if (passwordMatch(password, confirmed)) {
      submitButton.disabled = false;
      generalErrorHandler('clear');
    } else {
      generalErrorHandler('password');
    }
  } else {
    submitButton.disabled = true;
  }
}
if (form) {
  form.addEventListener("submit", (e: Event) => {
    e.preventDefault();

    db.addUser(validateUsername.value, validateEmail.value, validatePassword.value)
      .then((response) => {
        generalErrorHandler(response as IgeneralError);
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
  } else if (input.length === 0) {
    errorStr = 'Username is required';
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
  } else if (input.length === 0) {
    errorStr = 'Password is required';
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
    return true;
  } else {
    return false;
  }
}

function generalErrorHandler(input: IgeneralError | string) {
  if (typeof input === 'string') {
    generalError.style.visibility = 'hidden';
  } else {
    if (input.code !== 0) {
      generalError.textContent = input.message;
      generalError.style.visibility = 'visible';
    }
  }
}
