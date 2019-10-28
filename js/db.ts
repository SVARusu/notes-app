import { categories, todos, users } from './stitch/mongodb';
import { Icomment, IgeneralError } from './utils';
const BSON = require('bson');

class DB {

  /* ////////////////////////////// USER OPERATIONS ///////////////////////////////// */

  userExists = async (username: string) => {
    const query = {
      "username": { "$eq": username },
    };
    return (await users.count(query) === 1)
  }

  validateLogin = async (username: string, password: string) => {
    const query = {
      "username": { "$eq": username },
      "password": { "$eq": password }
    };
    const options = { "limit": 1 };
    return !!(await users.find(query, options).first());
  }

  loginUser = async (username: string, password: string) => {
    const exists: boolean = await this.userExists(username);

    if (exists) {
      const valid: boolean = await this.validateLogin(username, password);

      if (valid) {
        const id: any = await this.getUserId(username);
        sessionStorage.setItem('loggedUser', id.toString());
        return ({
          code: 0,
          message: 'Valid username and password'
        } as IgeneralError);
      } else {
        return ({
          code: 2,
          message: 'Invalid password'
        } as IgeneralError);
      }
    } else {
      console.log(`user ${username} does not exist in database`);
      return ({
        code: 1,
        message: 'Username does not exist'
      } as IgeneralError);
    }
  }

  getAllUsers = () => {
    return new Promise((resolve, reject) => {
      users.find().toArray()
        .then(items => {
          console.log(`Successfully found ${items.length} documents.`)
          resolve(items);
        })
        .catch(err => console.error(`Failed to find documents: ${err}`))
    })
  }

  addUser(username: string, email: string, password: string) {
    const newUser = { username: username, password: password, email: email };
    const query = { "username": username }
    return new Promise((resolve, reject) => {
      users.findOne(query)
        .then((result: any) => {
          if (result) {
            resolve({
              code: 3,
              message: 'User already exists'
            } as IgeneralError);
          } else {
            console.log("No document matches the provided query.")
            users.insertOne(newUser)
              .then((result: { insertedId: any; }) => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
              .catch((err: any) => console.error(`Failed to insert item: ${err}`))
          }
        })
        .catch((err: any) => console.error(`Failed to find document: ${err}`))
    })

  }

  printTodos() {
    return new Promise((resolve, reject) => {
      const query = { owner_id: sessionStorage.getItem("loggedUser") };
      todos.find(query).toArray()
        .then((items: any) => {
          resolve(items);
        })
        .catch((err: any) => console.error(`Failed to find documents: ${err}`))
    })
  }

  printCompletedTodos() {
    return new Promise((resolve, reject) => {
      const query = { owner_id: sessionStorage.getItem("loggedUser"), completed: true };
      todos.find(query).toArray()
        .then((items: any) => {
          resolve(items);
        })
        .catch((err: any) => console.error(`Failed to find documents: ${err}`))
    });
  }

  getTodoInfo = (todoId: String) => {
    return new Promise((resolve, reject) => {
      const query = { _id: new BSON.ObjectId(todoId) }
      todos.findOne(query)
        .then(result => {
          if (result) {
            resolve(result);
          } else {
            console.log("No document matches the provided query.")
          }
        })
        .catch(err => console.error(`Failed to find document: ${err}`))
    });
  }

  updateTodo = (editTitle: String, editDescription: String, editDate: any, editCategory: String, color: any, todoId: any) => {
    const query = { owner_id: sessionStorage.getItem("loggedUser"), _id: new BSON.ObjectId(todoId) };
    return new Promise((resolve, rejects) => {
      console.log(editTitle, editDescription, editDate, editCategory, color, todoId);
      const update = { "$set": { category_name: editCategory, todo: editTitle, description: editDescription, due_date: editDate, color: color } };
      todos.updateOne(query, update)
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

  addNewNote(newNote: string, newNoteDescription: string, category: string, color: any, newDate: any) {
    return new Promise((resolve, reject) => {
      let createTodo = {
        owner_id: sessionStorage.getItem("loggedUser"),
        username: sessionStorage.getItem("username"),
        category_name: category,
        completed: false,
        todo: newNote,
        description: newNoteDescription,
        due_date: newDate,
        color: color,
        comments: []
      };
      todos.insertOne(createTodo)
        .then(result => {
          console.log(`Successfully inserted item with _id: ${result.insertedId}`)
          resolve();
        })
        .catch(err => console.error(`Failed to insert item: ${err}`))
    });
  }

  addTaskToTodo(todoId: any, tasks: any) {
    console.log(tasks);

    return new Promise((resolve, reject) => {
      const query = { _id: new BSON.ObjectId(todoId) };
      const update = { "$push": { tasks: tasks } };
      todos.updateOne(query, update)
        .then(result => {
          const { matchedCount, modifiedCount } = result;
          if (matchedCount && modifiedCount) {
            console.log(`Successfully updated the item.`);
            resolve();
          }
        })
        .catch(err => console.error(`Failed to update the item: ${err}`))
    })
  }

  displayTasksInEditForm(todoId: any) {
    return new Promise((resolve, reject) => {
      const query = { _id: new BSON.ObjectId(todoId) }
      todos.findOne(query)
        .then(result => {
          if (result) {
            resolve(result);
          } else {
            console.log("No document matches the provided query.")
          }
        })
        .catch(err => console.error(`Failed to find document: ${err}`))
    })
  }

  shareTodo(todoId: any, selectedUsers: string[]) {
    const query = { owner_id: sessionStorage.getItem("loggedUser"), _id: new BSON.ObjectId(todoId) };
    return new Promise((resolve, rejects) => {
      const update = { "$set": { share: selectedUsers } };
      todos.updateOne(query, update)
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

  getSharedTodos() {
    return new Promise((resolve, reject) => {
      const query = { share: sessionStorage.getItem("username") };
      todos.find(query).toArray()
        .then(items => {
          resolve(items);
        })
        .catch(err => console.error(`Failed to find documents: ${err}`))
    })
  }

  markCompletedNote = (todoId: any, checked: boolean) => {
    const filterDoc = { _id: new BSON.ObjectId(todoId) };
    return new Promise((resolve, reject) => {
      todos.findOne(filterDoc)
        .then((result: any) => {
          let tasksCompleted: boolean = true;
          if (result) {
            result.tasks.forEach((task: any) => {
              if (task.completed === false) {
                tasksCompleted = false;
                resolve(false);
              }
              if (tasksCompleted) {
                const update = { "$set": { completed: checked } };
                todos.updateOne(filterDoc, update)
                  .then(result => {
                    const { matchedCount, modifiedCount } = result;
                    if (matchedCount && modifiedCount) {
                      console.log(`Successfully updated the item.`);
                      resolve(true);
                    }
                  })
                  .catch(err => console.error(`Failed to update the item: ${err}`))
              }
            });
          } else {
            console.log("No document matches the provided query.")

          }
        })
        .catch(err => console.error(`Failed to find document: ${err}`))
    });
  }

  markCompletedTask(todoId: any, taskId: any, checked: boolean) {
    return new Promise((resolve, reject) => {
      todos.updateOne(
        {
          _id: new BSON.ObjectId(todoId),
          tasks: { $elemMatch: { id: new BSON.ObjectId(taskId) } }
        },
        { $set: { "tasks.$.completed": checked } }
      ).then(() => {
        if (!checked) {
          const filterDoc = { _id: new BSON.ObjectId(todoId) };
          const update = { "$set": { completed: checked } };
          todos.updateOne(filterDoc, update)
            .then(result => {
              const { matchedCount, modifiedCount } = result;
              if (matchedCount && modifiedCount) {
                console.log(`Successfully updated the item.`);
                resolve(false);
              }
              resolve(true);
            })
            .catch(err => console.error(`Failed to update the item: ${err}`))
        }
        console.log(`Successfully updated the item.`);

      })
        .catch(err => console.error(`Failed to update the item: ${err}`))
    });
  }

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

  printTodosByCategory = (date: any, checkedCategory: string[]) => {
    return new Promise((resolve, reject) => {
      let query: any = {};
      if (date.length > 0) {
        if (date.length === 2) {
          query = { owner_id: sessionStorage.getItem("loggedUser"), due_date: { $gt: date[0], $lt: date[1] } };
        } else {
          query = { owner_id: sessionStorage.getItem("loggedUser"), due_date: { $in: date } };
        }
      }
      if (checkedCategory.length > 0) {
        query["category_name"] = { $in: checkedCategory };
      }
      todos.find(query).toArray()
        .then(items => {
          resolve(items);

        })
        .catch(err => console.error(`Failed to find documents: ${err}`))
    });
  }

  createNewCategory = (category: string, color: string) => {
    let newCategory = { owner_id: sessionStorage.getItem("loggedUser"), name: category, color: color, removed: false };
    const query = { owner_id: sessionStorage.getItem("loggedUser"), name: category };
    return new Promise((resolve, reject) => {
      categories.findOne(query)
        .then((result: any) => {
          if (result) {
            resolve(true);
          } else {
            console.log("No document matches the provided query.")
            resolve(false);
            categories.insertOne(newCategory)
              .then((result: { insertedId: any; }) => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
              .catch((err: any) => console.error(`Failed to insert item: ${err}`))
          }
        })
        .catch(err => console.error(`Failed to find document: ${err}`))
    });
  }

  editCategory = (newCatName: string, currentCategory: string) => {
    const query = { owner_id: sessionStorage.getItem("loggedUser"), name: currentCategory };
    return new Promise((resolve, rejects) => {
      const update = { "$set": { name: newCatName } };
      categories.updateOne(query, update)
        .then((result: { matchedCount: any; modifiedCount: any; }) => {
          const { matchedCount, modifiedCount } = result;
          if (matchedCount && modifiedCount) {
            console.log(`Successfully updated the item.`);
            resolve();
          }
        })
        .catch((err: any) => console.error(`Failed to update the item: ${err}`))
    });
  }

  printCategories = () => {
    return new Promise((resolve, reject) => {
      const query = { owner_id: sessionStorage.getItem("loggedUser"), removed: false };
      categories.find(query).toArray()
        .then((items: any) => {
          resolve(items);
        })
        .catch((err: any) => console.error(`Failed to find documents: ${err}`))
    });
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

  getUsername = async (userId: string) => {
    const query = { "_id": { "$eq": new BSON.ObjectId(userId) } };
    const resp: any = await users.findOne(query);

    if (resp !== null) {
      return resp.username;
    } else {
      return 'unknown';
    }
  }

  getUserId = async (username: string) => {
    const query = { "username": { "$eq": username } };
    const resp: any = await users.findOne(query);

    if (resp !== null) {
      return resp._id;
    } else {
      return 'unknown';
    }
  }

  getNote = async (noteId: string) => {
    const query = { "_id": { "$eq": new BSON.ObjectId(noteId) } };
    return await todos.findOne(query);
  }

  addComment = async (noteId: string, userId: string, message: string) => {
    const newComment: Icomment = {
      owner_id: userId,
      message: message
    }

    const query = { "_id": { "$eq": new BSON.ObjectId(noteId) } };
    const update = { "$push": { "comments": newComment } };
    const options = { "upsert": false };

    try {
      const resp: any = await todos.updateOne(query, update, options);
      const { matchedCount, modifiedCount } = resp;

      if (matchedCount && modifiedCount) {
        console.log('Successfully added a new comment.');
      }
    } catch (err) {
      console.log(`Failed to add comment: ${err}`);
    }
  }

  countComments = async (noteId: string) => {
    const note: any = await this.getNote(noteId);
    return note.comments.length;
  }
}

export { DB };
