
class DB {

    db: IDBDatabase | any;
    openedDB: IDBOpenDBRequest | any;
    loaded: boolean = false;
    constructor() {
        this.init();
    }

    init() {
        this.openedDB = window.indexedDB.open('notes_db', 8);
        this.openedDB.onerror = this.onDatabaseError;
        this.openedDB.onsuccess = this.onDatabaseSuccess;
        this.openedDB.onupgradeneeded = this.onDatabaseUpgradeNeeded;
    }

    onDatabaseError = (e: Event) => {
        console.log(e);
    }

    onDatabaseSuccess = () => {
        console.log(this.openedDB.readyState);
        this.db = this.openedDB.result;
        this.loaded = true;
    }

    onDatabaseUpgradeNeeded = (e: any) => {
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
        if (e.oldVersion < 6) {
            let objectStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('category', 'category', { unique: false });
            objectStore.createIndex('color', 'color', { unique: false });
        }
        if (e.oldVersion < 7) {
            let objectStore = e.target.transaction.objectStore("categories");
            objectStore.createIndex('loggedUser', 'loggedUser', { unique: false });
            objectStore.transaction.oncomplete = function (e: Event) {
                // Store values in the newly created objectStore.
                console.log('Database setup complete');
            };
        }
        if (e.oldVersion < 8) {
            let objectStore = e.target.transaction.objectStore("todos");
            objectStore.createIndex('category', 'category', { unique: false });
            objectStore.createIndex('color', 'color', { unique: false });
            objectStore.transaction.oncomplete = function (e: Event) {
                // Store values in the newly created objectStore.
                console.log('Database setup complete');
            };
        }
        console.log('Database setup complete');
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

    /* ///////////////////////////////// ADD A NEW TODO /////////////////////////////// */
    addNewNote(newNote: string, category: string, color: any) {
        let createTodo = { todo: newNote, loggedUser: sessionStorage.getItem("loggedUser"), category: category, color: color, completed: false }
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
    /* ///////////////////////////////// PRINT TODOS /////////////////////////////// */
    printTodos() {
        return new Promise((resolve, reject) => {
            let objectStore = this.db.transaction('todos').objectStore('todos');
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
        })
    }

    printCompletedTodos() {
        return new Promise((resolve, reject) => {
            let objectStore = this.db.transaction('todos').objectStore('todos');
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
        });
    }
    printTodosByCategory = (category: string) => {
        return new Promise((resolve, reject) => {
            let objectStore = this.db.transaction('todos').objectStore('todos');
            let todosByCategory: any = [];
            objectStore.openCursor().onsuccess = (e: any) => {
                let cursor = e.target.result as IDBCursorWithValue;
                if (cursor) {
                    if (cursor.value.category === category) {
                        todosByCategory.push(cursor.value);
                    } else if (category === 'Display all todos') {
                        todosByCategory.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(todosByCategory);
                }
            }
        });
    }

    markCompletedNote = (todoId: number, checked: boolean) => {
        return new Promise((resolve, reject) => {
            //let db: IDBDatabase;
            let transaction = this.db.transaction(['todos'], "readwrite");
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
        });
    }

    /* ///////////////////////////////// Categories /////////////////////////////// */
    categoryExists = (objectStore: any, category: string) => {
        return new Promise((resolve, reject) => {
            let found = false;
            objectStore.openCursor().onsuccess = (e: any) => {
                let cursor = e.target.result as IDBCursorWithValue;
                if (cursor) {
                    if (category !== cursor.value.category) {
                        found = false;
                        cursor.continue();
                    } else {
                        found = true;
                    }
                } else {
                    resolve(found);
                }
            }
        })
    }

    createNewCategory = (category: string, color: string) => {
        let newCategory = { category: category, color: color, loggedUser: sessionStorage.getItem("loggedUser") };
        let transaction = this.db.transaction(['categories'], 'readwrite');
        let objectStore = transaction.objectStore('categories');
        return new Promise((resolve, reject) => {
            this.categoryExists(objectStore, category)
                .then((found) => {
                    if (category !== '') {
                        let request = objectStore.add(newCategory);
                        request.onsuccess = function (e: Event) {
                            resolve();
                        }
                        transaction.oncomplete = function () {
                            console.log("new data added");
                        };
                        transaction.onerror = function () {
                            console.log('Transaction not opened due to error');

                        };
                    }

                })
        });
    }

    printCategories = () => {
        return new Promise((resolve, reject) => {
            let objectStore = this.db.transaction('categories').objectStore('categories');
            let allCategories: any = [];
            objectStore.openCursor().onsuccess = (e: any) => {
                let cursor = e.target.result as IDBCursorWithValue;
                if (cursor) {
                    if (sessionStorage.getItem("loggedUser") === cursor.value.loggedUser) {
                        allCategories.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(allCategories);
                }
            }
        });
    }

    displayModalCategories = () => {
        return new Promise((resolve, rejects) => {
            let objectStore = this.db.transaction('categories').objectStore('categories');

        });
    }
}

export { DB };