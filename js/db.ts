import { form, validateEmail, validatePassword, validateUsername } from './index';
import { loginForm, loginUsername, loginPassword } from './loginpage';
import { resolve } from 'path';
import { rejects } from 'assert';
let db: IDBDatabase;

window.onload = function () {
    let request = window.indexedDB.open('notes_db', 2);
    console.log("yes");
    request.onerror = function (e: Event) {
        console.log("e.target.result");
    }
    request.onsuccess = function () {
        db = request.result;
        console.log(db);
    }

    request.onupgradeneeded = function (e) {
        let db = (e.target as IDBOpenDBRequest).result;

        let objectStore = db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });

        objectStore.createIndex('username', 'username', { unique: false });
        objectStore.createIndex('email', 'email', { unique: false });
        objectStore.createIndex('password', 'password', { unique: false });
        objectStore.transaction.oncomplete = function (e: Event) {
            // Store values in the newly created objectStore.
            console.log('Database setup complete');
        };
        //objectStore = db.o
        console.log('Database setup complete');
    }
    if (loginForm) loginForm.addEventListener("submit", loginUser);
    if (form) form.addEventListener("submit", addData);

    function loginUser(e: Event) {
        console.log("herw");
        e.preventDefault();
        let transaction = db.transaction(['user'], "readwrite");
        let objectStore = transaction.objectStore('user');
        promisedLoginUser(objectStore)
            .then(function (found) {
                console.log(window.location);
                let location = window.location.href;
                location = location.replace("login.html", "notes.html");
                window.location.href = location;
            })
    }
    function addData(e: Event) {
        e.preventDefault();

        let newUser = { username: (<HTMLInputElement>validateUsername).value, email: (<HTMLInputElement>validateEmail).value, password: (<HTMLInputElement>validatePassword).value };
        let transaction = db.transaction(['user'], 'readwrite');
        let objectStore = transaction.objectStore('user');
        promisedAddUser(objectStore)
            .then(function (found) {
                if (!found) {
                    let request = objectStore.add(newUser);
                    request.onsuccess = function (e: Event) {
                        console.log("oh no");
                    };
                    transaction.oncomplete = function () {
                        console.log("new data added");
                    };
                    transaction.onerror = function () {
                        console.log('Transaction not opened due to error');
                    };
                }
            })

    }

    function promisedLoginUser(objectStore: any) {
        return new Promise((resolve, rejects) => {
            console.log("got here");
            console.log(window.location.href);
            let found = false;
            objectStore.openCursor().onsuccess = function (e: any) {
                let cursor = e.target.result as IDBCursorWithValue;
                if (cursor) {
                    if ((<HTMLInputElement>loginUsername).value === cursor.value.username && (<HTMLInputElement>loginPassword).value === cursor.value.password) {
                        found = true;
                        resolve(found);
                    } else {
                        cursor.continue();
                    }
                } else {
                    let errMessage: Element = document.querySelector("#error-message") as HTMLElement;
                    errMessage.textContent = "Incorrect username or password or user does not exist.";
                    console.log("user does not exist");

                }
            }
        });
    }

    function promisedAddUser(objectStore: any) {
        return new Promise((resolve, reject) => {
            let found = true;
            console.log("got here");
            objectStore.openCursor().onsuccess = function (e: any) {
                let cursor = e.target.result as IDBCursorWithValue;
                console.log(e);
                if (cursor) {
                    console.log(cursor.value.username);

                    if ((<HTMLInputElement>validateUsername).value !== cursor.value.username) {
                        found = false;
                        cursor.continue();;
                    } else {
                        found = true;
                        console.log("user already exists");
                    }
                } else {
                    resolve(found);
                }
            }
        })
    }


}