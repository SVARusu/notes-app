import { categories, todos, users } from './stitch/mongodb';
const BSON = require('bson');

class DB {

    db: IDBDatabase | any;
    openedDB: IDBOpenDBRequest | any;
    loaded: boolean = false;
    constructor() {
        this.init();
    }

    init() {
        this.openedDB = window.indexedDB.open('notes_db');
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

        let objectStore = db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
        let objectStore2 = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
        let objectStore3 = db.createObjectStore('finished-todos', { keyPath: 'id', autoIncrement: true });
        let objectStore4 = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });

        objectStore.createIndex('username', 'username', { unique: false });
        objectStore.createIndex('email', 'email', { unique: false });
        objectStore.createIndex('password', 'password', { unique: false });

        objectStore2.createIndex('todo', 'todo', { unique: false });
        objectStore2.createIndex('loggedUser', 'loggedUser', { unique: false });
        objectStore2.createIndex('completed', 'completed', { unique: false });
        objectStore2.createIndex('category', 'category', { unique: false });
        objectStore2.createIndex('color', 'color', { unique: false });
        objectStore2.createIndex('dueDate', 'dueDate', { unique: false });

        objectStore3.createIndex('todo', 'todo', { unique: false });
        objectStore3.createIndex('loggedUser', 'loggedUser', { unique: false });

        objectStore4.createIndex('category', 'category', { unique: false });
        objectStore4.createIndex('color', 'color', { unique: false });
        objectStore4.createIndex('loggedUser', 'loggedUser', { unique: false });

        objectStore.transaction.oncomplete = function (e: Event) {
            console.log('Database setup complete');
        };
    }

    userExists = async (username: string) => {
        const query = { "username": { "$eq": username } };
        const options = { "limit": 1 };
        const user = await users.find(query, options).first();

        if (typeof user === 'undefined') {
            return false;
        }
        return true;
    }

    getUser = async (username: string) => {
        const query = { "username": { "$eq": username } };
        const options = { "limit": 1 };
        return await users.find(query, options).first();
    }

    loginUser = async (username: string, password: string) => {
        const exists: any = await this.userExists(username);

        if (exists) {
            const user: any = await this.getUser(username);
            if (user.password === password) {
                sessionStorage.setItem('loggedUser', user._id.toString());
                return 0;
            } else {
                console.log('password is invalid');
                return 2;
            }
        } else {
            console.log(`user ${username} does not exist in database`);
            return 1;
        }
    }

    /* ///////////////////////////////// ADD A NEW TODO /////////////////////////////// */
    addNewNote(newNote: string, category: string, color: any, newDate: string) {
        return new Promise((resolve, reject) => {
            let createTodo = { owner_id: sessionStorage.getItem("loggedUser"), category_name: category, completed: false, todo: newNote, due_date: newDate, color: color };
            todos.insertOne(createTodo)
                .then(result => {
                    console.log(`Successfully inserted item with _id: ${result.insertedId}`)
                    resolve();
                })
                .catch(err => console.error(`Failed to insert item: ${err}`))
        })

        // let transaction = this.db.transaction(['todos'], "readwrite");
        // let objectStore = transaction.objectStore('todos');
        // if (newNote !== '') {
        //     let request = objectStore.add(createTodo);
        //     request.onsuccess = function () {
        //         // Clear the form, ready for adding the next entry
        //         //newNote = '';
        //     };
        // }
        // transaction.oncomplete = () => {
        //     this.printTodos();
        // }
    }

    addUser(username: string, email: string, password: string) {
        let newUser = { username: username, password: password, email: email };
        const query = { "username": username }
        return new Promise((resolve, reject) => {
            users.findOne(query)
                .then(result => {
                    if (result) {
                        resolve(1); // user already exists
                    } else {
                        console.log("No document matches the provided query.")
                        users.insertOne(newUser)
                            .then(result => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
                            .catch(err => console.error(`Failed to insert item: ${err}`))
                    }
                })
                .catch(err => console.error(`Failed to find document: ${err}`))
        })

    }

    /* ///////////////////////////////// PRINT TODOS /////////////////////////////// */
    printTodos() {
        return new Promise((resolve, reject) => {
            const query = { owner_id: sessionStorage.getItem("loggedUser"), completed: false };
            todos.find(query).toArray()
                .then(items => {
                    resolve(items);
                })
                .catch(err => console.error(`Failed to find documents: ${err}`))
        })
    }

    printCompletedTodos() {
        return new Promise((resolve, reject) => {
            const query = { owner_id: sessionStorage.getItem("loggedUser"), completed: true };
            todos.find(query).toArray()
                .then(items => {
                    resolve(items);
                })
                .catch(err => console.error(`Failed to find documents: ${err}`))
        });
    }
    printTodosByCategory = (category: string, date: any, startDate: any, endDate: any) => {
        return new Promise((resolve, reject) => {
            let objectStore = this.db.transaction('todos').objectStore('todos');
            let todosByCategory: any = [];
            objectStore.openCursor().onsuccess = (e: any) => {
                let cursor = e.target.result as IDBCursorWithValue;
                if (cursor) {
                    if (startDate !== '' && endDate !== '') {
                        if (cursor.value.category === category && (Number(new Date(cursor.value.dueDate)) >= Number(new Date(startDate)) && Number(new Date(cursor.value.dueDate)) <= Number(new Date(endDate)))) {
                            todosByCategory.push(cursor.value);
                        }
                        if (cursor.value.category === category && (Number(new Date(cursor.value.dueDate)) >= Number(new Date(startDate)) && Number(new Date(cursor.value.dueDate)) <= Number(new Date(endDate)))) {
                            todosByCategory.push(cursor.value);
                        }
                        if (category === 'Display all todos' && (Number(new Date(cursor.value.dueDate)) >= Number(new Date(startDate)) && Number(new Date(cursor.value.dueDate)) <= Number(new Date(endDate)))) {
                            todosByCategory.push(cursor.value);
                        }
                        if (category === 'Display all todos' && (Number(new Date(cursor.value.dueDate)) >= Number(new Date(startDate)) && Number(new Date(cursor.value.dueDate)) <= Number(new Date(endDate)))) {
                            todosByCategory.push(cursor.value);
                        }
                    } else {
                        if (cursor.value.category === category && date.includes(cursor.value.dueDate)) {
                            todosByCategory.push(cursor.value);
                        }
                        if (cursor.value.category === category && date[0] === 0) {
                            todosByCategory.push(cursor.value);
                        }
                        if (category === 'Display all todos' && date.includes(cursor.value.dueDate)) {
                            todosByCategory.push(cursor.value);
                        }
                        if (category === 'Display all todos' && date[0] === 0) {
                            todosByCategory.push(cursor.value);
                        }
                    }
                    cursor.continue();
                } else {
                    resolve(todosByCategory);
                }
            }
        });
    }

    markCompletedNote = (todoId: any, checked: boolean) => {

        const filterDoc = { _id: new BSON.ObjectId(todoId) };
        return new Promise((resolve, reject) => {
            const query = { owner_id: sessionStorage.getItem("loggedUser"), _id: todoId };
            // todos.find(filterDoc).toArray()
            //     .then(items => {
            //         console.log("yes")
            //         console.log(items);

            //         resolve(items);
            //     })
            //     .catch(err => console.error(`Failed to find documents: ${err}`))
            //const query = { owner_id: sessionStorage.getItem("loggedUser"), todoId };
            const update = { "$set": { completed: checked } };
            todos.updateOne(filterDoc, update)
                .then(result => {
                    const { matchedCount, modifiedCount } = result;
                    if (matchedCount && modifiedCount) {
                        console.log(`Successfully updated the item.`);
                        resolve();
                    }
                })
                .catch(err => console.error(`Failed to update the item: ${err}`))
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
        let found = false;
        let newCategory = { owner_id: sessionStorage.getItem("loggedUser"), name: category, color: color, removed: false };
        const query = { owner_id: sessionStorage.getItem("loggedUser"), name: category };
        return new Promise((resolve, reject) => {
            categories.findOne(query)
                .then(result => {
                    let user: any = result
                    if (result) {
                        found = true;
                        resolve(found);
                    } else {
                        console.log("No document matches the provided query.")
                        resolve(found);
                        categories.insertOne(newCategory)
                            .then(result => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
                            .catch(err => console.error(`Failed to insert item: ${err}`))
                    }
                })
                .catch(err => console.error(`Failed to find document: ${err}`))
        })
        // let transaction = this.db.transaction(['categories'], 'readwrite');
        // let objectStore = transaction.objectStore('categories');
        // return new Promise((resolve, reject) => {
        //     this.categoryExists(objectStore, category)
        //         .then((found) => {
        //             if (category !== '') {
        //                 let request = objectStore.add(newCategory);
        //                 request.onsuccess = function (e: Event) {
        //                     resolve();
        //                 }
        //                 transaction.oncomplete = function () {
        //                     console.log("new data added");
        //                 };
        //                 transaction.onerror = function () {
        //                     console.log('Transaction not opened due to error');

        //                 };
        //             }

        //         })
        // });
    }

    editCategory = (newCatName: string, currentCategory: string) => {
        const query = { owner_id: sessionStorage.getItem("loggedUser"), name: currentCategory };
        return new Promise((resolve, rejects) => {
            const update = { "$set": { name: newCatName } };
            categories.updateOne(query, update)
                .then(result => {
                    const { matchedCount, modifiedCount } = result;
                    if (matchedCount && modifiedCount) {
                        console.log(`Successfully updated the item.`);
                        resolve();
                    }
                })
                .catch(err => console.error(`Failed to update the item: ${err}`))
        });
        // return new Promise((resolve, reject) => {
        //     let transaction = this.db.transaction(['categories'], 'readwrite');
        //     let objectStore = transaction.objectStore('categories');
        //     objectStore.openCursor().onsuccess = (e: any) => {
        //         let cursor = e.target.result as IDBCursorWithValue;
        //         if (cursor) {
        //             if (cursor.value.category === currentCategory) {
        //                 let secondTransaction = this.db.transaction(['todos'], 'readwrite');
        //                 let secondObjectStore = secondTransaction.objectStore('todos');
        //                 secondObjectStore.openCursor().onsuccess = (e: any) => {
        //                     let cursor = e.target.result as IDBCursorWithValue;
        //                     if (cursor) {
        //                         if (cursor.value.category === currentCategory) {
        //                             let data = cursor.value;
        //                             data.category = newCatName;
        //                             let requestUpdate = secondObjectStore.put(data);
        //                         }
        //                         cursor.continue();
        //                     }
        //                 }
        //                 let data = cursor.value;
        //                 data.category = newCatName;
        //                 let requestUpdate = objectStore.put(data);
        //             }
        //             cursor.continue();
        //         } else {
        //             resolve();
        //         }
        //     }
        // })
    }

    removeCategory = (catId: number, catName: any) => {
        const query = { owner_id: sessionStorage.getItem("loggedUser"), name: catName };
        return new Promise((resolve, rejects) => {
            const update = { "$set": { removed: true } };
            categories.updateOne(query, update)
                .then(result => {
                    const { matchedCount, modifiedCount, upsertedId } = result;
                    if (upsertedId) {
                        console.log(`Document not found. Inserted a new document with _id: ${upsertedId}`)
                    } else {
                        console.log(`Deleted item.`)
                        const query = { owner_id: sessionStorage.getItem("loggedUser"), category_name: catName };
                        const update = { "$set": { category_name: "default" } };
                        todos.updateMany(query, update)
                            .then(result => {
                                const { matchedCount, modifiedCount } = result;
                                console.log(`Successfully matched ${matchedCount} and modified ${modifiedCount} items.`)
                                resolve();
                            })
                            .catch(err => console.error(`Failed to update items: ${err}`))
                    }
                })
                .catch(err => console.error(`Failed to upsert document: ${err}`))
        });
    }

    printCategories = () => {
        return new Promise((resolve, reject) => {
            const query = { owner_id: sessionStorage.getItem("loggedUser"), removed: false };
            categories.find(query).toArray()
                .then(items => {
                    resolve(items);
                })
                .catch(err => console.error(`Failed to find documents: ${err}`))
            // let objectStore = this.db.transaction('categories').objectStore('categories');
            // let allCategories: any = [];
            // objectStore.openCursor().onsuccess = (e: any) => {
            //     let cursor = e.target.result as IDBCursorWithValue;
            //     if (cursor) {
            //         if (sessionStorage.getItem("loggedUser") === cursor.value.loggedUser) {
            //             allCategories.push(cursor.value);
            //         }
            //         cursor.continue();
            //     } else {
            //         resolve(allCategories);
            //     }
            // }
        });
    }

}

export { DB };
