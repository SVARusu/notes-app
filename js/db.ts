import { printEveryTodo } from './notespage';
import { resolve } from 'path';

class DB {

    private db: IDBDatabase;
    constructor() {
        this.db = <IDBDatabase>{};
        let request = window.indexedDB.open('notes_db', 5);
        request.onerror = function (e: Event) {
            console.log("e.target.result");
        }
        request.onsuccess = () => {
            this.db = request.result;
            //if (notesForm) this.printTodos();
        }

        request.onupgradeneeded = function (e: any) {
            let db = (e.target as IDBOpenDBRequest).result;
            if (e.oldVersion < 2) {
                let objectStore = db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });

                objectStore.createIndex('username', 'username', { unique: false });
                objectStore.createIndex('email', 'email', { unique: false });
                objectStore.createIndex('password', 'password', { unique: false });
                //objectStore.createIndex('completed', 'completed', { unique: false });
                objectStore.transaction.oncomplete = function (e: Event) {
                    // Store values in the newly created objectStore.
                    console.log('Database setup complete');
                };
            }
            if (e.oldVersion < 3) {
                let objectStore2 = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
                objectStore2.createIndex('todo', 'todo', { unique: false });
                objectStore2.createIndex('loggedUser', 'loggedUser', { unique: false });
            }
            if (e.oldVersion < 4) {
                let objectStore3 = db.createObjectStore('finished-todos', { keyPath: 'id', autoIncrement: true });
                objectStore3.createIndex('todo', 'todo', { unique: false });
                objectStore3.createIndex('loggedUser', 'loggedUser', { unique: false });
            }
            if (e.oldVersion < 5) {

                //let objectStore = db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
                let objectStore = e.target.transaction.objectStore("todos");
                objectStore.createIndex('completed', 'completed', { unique: false });
                objectStore.transaction.oncomplete = function (e: Event) {
                    // Store values in the newly created objectStore.
                    console.log('Database setup complete');
                };
            }
            console.log('Database setup complete');
        }
    }

    loginUser(username: string, password: string) {
        let transaction = this.db.transaction(['user'], "readwrite");
        let objectStore = transaction.objectStore('user');
        return new Promise((resolve, rejects) => {
            let found = false;
            objectStore.openCursor().onsuccess = function (e: any) {
                let cursor = e.target.result as IDBCursorWithValue;
                if (cursor) {
                    if (username === cursor.value.username && password === cursor.value.password) {
                        found = true;
                        sessionStorage.setItem("loggedUser", username);
                        resolve(found);
                    } else {
                        cursor.continue();
                    }
                } else {
                    throw ("Cursor doesn't exists");
                }
            }
        });
    }
    /* ///////////////////////////////// ADD A NEW USER /////////////////////////////// */

    userExists = (objectStore: any, username: string) => {
        return new Promise((resolve, reject) => {
            let found = false;
            objectStore.openCursor().onsuccess = function (e: any) {
                let cursor = e.target.result as IDBCursorWithValue;
                console.log(e);
                if (cursor) {
                    console.log(cursor.value.username);

                    if (username !== cursor.value.username) {
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
        });
    }

    addUser(username: string, email: string, password: string) {
        let newUser = { username: username, email: email, password: password };
        let transaction = this.db.transaction(['user'], 'readwrite');
        let objectStore = transaction.objectStore('user');
        return new Promise((resolve, reject) => {
            this.userExists(objectStore, username)
                .then((found) => {
                    if (!found) {
                        let request = objectStore.add(newUser);
                        request.onsuccess = function (e: Event) {
                            console.log("oh no");
                            resolve();
                        };
                        transaction.oncomplete = function () {
                            console.log("new data added");
                        };
                        transaction.onerror = function () {
                            console.log('Transaction not opened due to error');

                        };
                    }
                })
                .catch(() => {

                });
        });
    }

    /* ///////////////////////////////// ADD A NEW NOTE /////////////////////////////// */
    addNewNote(newNote: string) {
        let createTodo = { todo: newNote, loggedUser: sessionStorage.getItem("loggedUser"), completed: false }
        let transaction = this.db.transaction(['todos'], "readwrite");
        let objectStore = transaction.objectStore('todos');
        if (newNote !== '') {
            let request = objectStore.add(createTodo);
            request.onsuccess = function () {
                // Clear the form, ready for adding the next entry
                //newNote = '';
            };
        }
        transaction.oncomplete = () => {
            this.printTodos();
        }
    }

    printTodos() {
        return new Promise((resolve, reject) => {
            let request = window.indexedDB.open('notes_db', 5);
            request.onsuccess = () => {
                let db = request.result;
                //console.log(this.db);
                //if (notesForm) this.printTodos();
                // let transaction = this.db.transaction(['todos'], 'readwrite');
                // //let objectStore: IDBObjectStore = this.db.transaction('todos').objectStore('todos');
                // let objectStore = transaction.objectStore('todos');
                let objectStore = db.transaction('todos').objectStore('todos');
                let allTodos: any = [];
                objectStore.openCursor().onsuccess = function (e: any) {
                    let cursor = e.target.result as IDBCursorWithValue;
                    if (cursor) {
                        if (sessionStorage.getItem("loggedUser") === cursor.value.loggedUser && cursor.value.completed === false) {
                            allTodos.push(cursor.value);
                            // cursorValue.push(cursor.value.id);

                        }
                        cursor.continue();
                    } else {
                        resolve(allTodos);
                        console.log(allTodos);
                    }
                }

            }
        })
    }


    printCompletedTodos() {
        return new Promise((resolve, reject) => {
            let request = window.indexedDB.open('notes_db', 5);
            request.onsuccess = () => {
                let db = request.result;
                let objectStore = db.transaction('todos').objectStore('todos');
                let completedTodos: any = [];
                objectStore.openCursor().onsuccess = function (e: any) {
                    let cursor = e.target.result as IDBCursorWithValue;
                    if (cursor) {
                        if (sessionStorage.getItem("loggedUser") === cursor.value.loggedUser && cursor.value.completed === true) {
                            completedTodos.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(completedTodos);
                    }

                }
            }
        });
    }

    markCompletedNote = (todoId: number, checked: boolean) => {
        return new Promise((resolve, reject) => {
            let db: IDBDatabase;
            let request = window.indexedDB.open('notes_db', 5);

            request.onsuccess = () => {
                db = request.result;
                let transaction = db.transaction(['todos'], "readwrite");
                let objectStore = transaction.objectStore('todos');
                objectStore.openCursor().onsuccess = (e: any) => {
                    let cursor = e.target.result as IDBCursorWithValue;
                    if (cursor) {
                        if (cursor.value.id === todoId) {
                            console.log(cursor.value);
                            let data = cursor.value;
                            data.completed = checked;
                            let requestUpdate = objectStore.put(data);

                        }
                        cursor.continue();
                    } else {
                        resolve();
                    }
                }
            }
        });
    }
}

export { DB };