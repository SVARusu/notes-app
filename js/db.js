let db;

window.onload = function () {
    let request = window.indexedDB.open('notes_db', 2);
    console.log("yes");
    request.onerror = function (e) {
        console.log(e.target.result);
    }
    request.onsuccess = function () {
        db = request.result;
        console.log(db);
    }

    request.onupgradeneeded = function (e) {
        let db = e.target.result;

        let objectStore = db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });

        objectStore.createIndex('username', 'username', { unique: false });
        objectStore.createIndex('email', 'email', { unique: false });
        objectStore.createIndex('password', 'password', { unique: false });
        objectStore.transaction.oncomplete = function (e) {
            // Store values in the newly created objectStore.
            console.log('Database setup complete');
        };
        console.log('Database setup complete');
    }
    form.onsubmit = addData;
    function addData(e) {
        e.preventDefault();

        let newUser = { username: validateUsername.value, email: validateEmail.value, password: validatePassword.value };

        let transaction = db.transaction(['user'], 'readwrite');

        let objectStore = transaction.objectStore('user');

        //console.log(request.result.username);

        //let request = objectStore.add(newUser);


        promisedAddUser(objectStore)
            .then(function (found) {
                if (!found) {
                    let request = objectStore.add(newUser);
                    request.onsuccess = function (e) {
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

    function promisedAddUser(objectStore) {
        return new Promise((resolve, reject) => {
            let found = true;
            objectStore.openCursor().onsuccess = function (e) {
                let cursor = e.target.result;
                if (cursor) {
                    console.log(cursor.value.username);

                    if (validateUsername.value !== cursor.value.username) {
                        found = false;
                        cursor.continue();
                    } else {
                        found = true;
                        console.log("user already exists");
                    }
                } else {
                    resolve(found)
                }
            }
        })
    }
}