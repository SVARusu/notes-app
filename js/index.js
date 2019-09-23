let validateUsername = document.querySelector("#username");
let validateEmail = document.querySelector("#email");
let validatePassword = document.querySelector("#password");
let validateRetypedPassword = document.querySelector("#repassword");
let submitButton = document.querySelector("#submit-button");
let holdPassword = 0;
let verifyUsername = false;
let verifyEmail = false;
let verifyPassword = false;
let verifyRetypedPassword = false;

let username; 
let email;


validateUsername.addEventListener("input", function (e) {
    let letter = /^[A-Za-z0-9][A-Za-z0-9\.]{6,15}$/;
    if (e.target.value.match(letter)) {
        console.log(e.target.value);
        validateUsername.removeAttribute("style");
        verifyUsername = true;
        document.querySelector(".username").style.visibility = "hidden";
    } else {
        validateUsername.setAttribute("style", "border: 2px solid red;");
        verifyUsername = false;
        console.log(verifyUsername);
        document.querySelector(".username").style.visibility = "visible";
    }
});

validateEmail.addEventListener("input", function (e) {
    let letter = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (e.target.value.match(letter)) {
        console.log(e.target.value);
        validateEmail.removeAttribute("style");
        document.querySelector(".email").style.visibility = "hidden";
        verifyEmail = true;
    } else {
        validateEmail.setAttribute("style", "border: 2px solid red;");
        verifyEmail = false;
        console.log(verifyEmail);
        document.querySelector(".email").style.visibility = "visible";
    }
});


validatePassword.addEventListener("input", function (e) {
    let letter = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*])[a-zA-Z0-9!@#$%&*]{6,15}$/;
    holdPassword = e.target.value;
    if (e.target.value.match(letter)) {
        console.log(e.target.value);
        validatePassword.removeAttribute("style");
        verifyPassword = true;
        document.querySelector(".password").style.visibility = "hidden";
    } else {
        validatePassword.setAttribute("style", "border: 2px solid red;");
        verifyPassword = false;
        console.log(verifyPassword);
        document.querySelector(".password").style.visibility = "visible";
        
    }
});

validateRetypedPassword.addEventListener("input", function (e) {
    let letter = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*])[a-zA-Z0-9!@#$%&*]{6,15}$/;

    if (e.target.value.match(letter) && e.target.value === holdPassword) {
        console.log(e.target.value);
        validateRetypedPassword.removeAttribute("style");
        verifyRetypedPassword = true;
        document.querySelector(".password2").style.visibility = "hidden";
    } else {
        validateRetypedPassword.setAttribute("style", "border: 2px solid red;");
        verifyRetypedPassword = false;
        console.log(verifyRetypedPassword);
        document.querySelector(".password2").style.visibility = "visible";
    }
});

validateUsername.addEventListener("blur", drawBorder);
validateEmail.addEventListener("blur", drawBorder);
validatePassword.addEventListener("blur", drawBorder);
validateRetypedPassword.addEventListener("blur", drawBorder);
function drawBorder(e) {
    if (e.target.value === "") {
        e.target.setAttribute("style", "border: 2px solid red;");
    }
    if (verifyUsername && verifyEmail && verifyPassword && verifyRetypedPassword) {
        document.querySelector("#submit-button").disabled = false;
    } else {
        document.querySelector("#submit-button").disabled = true;
    }
}

submitButton.addEventListener("click", function(e){
    e.preventDefault();
    openDB();
});