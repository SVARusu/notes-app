import { DB } from './db';
import {
  generateCommentField,
  createCommentElement,
  newCommentHandler
} from './components/notecomments';
const BSON = require('bson');
const db = new DB();

let newNote: HTMLInputElement = document.querySelector("#new-note") as HTMLInputElement;
let newNoteDescription = document.querySelector("#new-note-description") as HTMLTextAreaElement
let newDate: HTMLInputElement = document.querySelector('#new-date') as HTMLInputElement;
let notesForm: HTMLFormElement = document.querySelector("#note-form") as HTMLFormElement;
let notesList: HTMLElement = document.querySelector("#note-list") as HTMLElement;
let completedNotesList: HTMLElement = document.querySelector("#completed-note-list") as HTMLElement;
let viewCompletedTodos: HTMLElement = document.querySelector("#view-completed-todos") as HTMLElement;
let selectedCategory: HTMLSelectElement = document.querySelector("#selected-category") as HTMLSelectElement;
let newCategoryForm: HTMLFormElement = document.querySelector("#create-category-form") as HTMLFormElement;
let newCategory: HTMLInputElement = document.querySelector("#new-category") as HTMLInputElement;
let pickedColor: HTMLInputElement = document.querySelector("#picked-color") as HTMLInputElement;
let filterByCategory = document.querySelector("#cat-list") as HTMLUListElement;
let modalCategoryList: HTMLElement = document.querySelector("#category-list") as HTMLElement;
let logOut: HTMLElement = document.querySelector("#logout-button") as HTMLElement;
let todayCheckbox = document.querySelector("#today-checkbox") as HTMLInputElement;
let weekCheckbox = document.querySelector("#week-checkbox") as HTMLInputElement;
let datePickerCheckbox = document.querySelector("#date-picker-checkbox") as HTMLInputElement;
const addNoteSubmitButton = document.querySelector("#add-note") as HTMLButtonElement;

let checkedCategory: string[] = [];
/* ////////////////////////////////////// EDIT TODO VARIABLES/////////////////////////// */
let editTitle = document.querySelector('#edit-title') as HTMLInputElement;
let editDescription = document.querySelector('#edit-description') as HTMLTextAreaElement;
let editDate = document.querySelector('#edit-date') as HTMLInputElement;
let editCategory = document.querySelector('#edit-category') as HTMLSelectElement;
let editTodoForm: Element = document.querySelector("#edit-form") as HTMLElement;
let editTodoSubmitButton = document.querySelector("#save-changes") as HTMLButtonElement;

/* ////////////////////////////////////// Search User variables/////////////////////////// */
let search = document.querySelector("#search-user") as HTMLInputElement;
let matchList = document.querySelector("#match-list") as HTMLDivElement;
let chosenUsers = document.querySelector("#chosen-usernames") as HTMLDivElement;
let allUsers: any = [];
let selectedUsers: any = [];
/* //////////////////////////////////////Todo tasks/////////////////////////// */
let newTask = document.querySelector("#new-task") as HTMLInputElement;
let addTask = document.querySelector("#add-task") as HTMLButtonElement;
let displayTask = document.querySelector("#display-task") as HTMLDivElement;
let allTasks: string[] = []
function expand(e: any) {
  let content = e.currentTarget.childNodes[1];
  if (e.currentTarget.childNodes[1].childNodes[0].textContent !== '') {
    e.currentTarget.classList.toggle("active");
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }


}


if (notesForm) {
  /* //////////////////////////Redirect the user to the login page if he didnt log in and someone got here////////////////////////////// */
  if (sessionStorage.getItem("loggedUser") === null || !sessionStorage.getItem("loggedUser")) {
    console.log("hi");
    let location = window.location.href;
    location = location.replace("notes.html", "index.html");
    window.location.href = location;
  }
  window.onload = function () {
    init();
    (<HTMLElement>document.querySelector('.notes-body')).style.display = "contents";
  }
}
/* //////////////////////////Initialise everything////////////////////////////// */
function init() {
  viewCompletedTodos.addEventListener("click", function (e: Event) {
    if ((<HTMLInputElement>e.target).checked === true) {
      (<HTMLInputElement>document.querySelector('.uncompleted-todos')).style.display = "none";
      (<HTMLInputElement>document.querySelector('.uncompleted-todos-title')).style.display = "none";
      (<HTMLInputElement>document.querySelector('.completed-todos')).style.display = "block";
      (<HTMLInputElement>document.querySelector('.completed-todos-title')).style.display = "block";
    } else {
      (<HTMLInputElement>document.querySelector('.completed-todos')).style.display = "none";
      (<HTMLInputElement>document.querySelector('.completed-todos-title')).style.display = "none";
      (<HTMLInputElement>document.querySelector('.uncompleted-todos')).style.display = "block";
      (<HTMLInputElement>document.querySelector('.uncompleted-todos-title')).style.display = "block";
    }
  });
  /////////////////////////////////////// CHANGE SMALL BOX COLOR //////////////////////////////////
  selectedCategory.addEventListener('change', function (e: any) {
    console.log(selectedCategory.options[selectedCategory.selectedIndex].getAttribute('customAttribute'));

    (<HTMLElement>document.querySelector("#color-box")).style.background = selectedCategory.options[selectedCategory.selectedIndex].getAttribute('customAttribute');
    console.log((<HTMLElement>document.querySelector("#color-box")).style.background);
  });
  logOut.addEventListener('click', function () {
    sessionStorage.setItem("loggedUser", '');
    sessionStorage.setItem("username", '');
    let location = window.location.href;
    location = location.replace("notes.html", "")
    window.location.href = location;
  })
  printEveryTodo();
  addNoteSubmitButton.addEventListener("click", (e: Event) => {
    let color = selectedCategory.options[selectedCategory.selectedIndex].getAttribute('customAttribute');
    let categoryValue = Number(selectedCategory.value);
    let category = selectedCategory.value;
    let res = newDate.value.split('/');
    let date = `${res[2]}/${res[1]}/${res[0]}`;
    e.preventDefault();
    if (newNote.value !== '' && newDate.value !== '') {
      if (categoryValue === 0) {
        color = 'white';
        category = 'default';
      }
      db.addNewNote(newNote.value, newNoteDescription.value, category, color, Number(Date.parse(date)))
        .then(() => {
          newNote.value = "";
          newNoteDescription.value = "";
          newDate.value = "";
          (<HTMLElement>document.querySelector("#color-box")).style.background = 'none';
          printEveryTodo();
        })
    }

  });
  editCategory.addEventListener('change', function () {
    let some: any = editCategory.options[selectedCategory.selectedIndex].getAttribute('customAttribute')
    editCategory.setAttribute('customAttribute', some);

  });
  newCategoryForm.addEventListener("submit", function (e: Event) {
    let printError: Element = document.querySelector("#category-error") as HTMLElement;
    printError.textContent = "";
    e.preventDefault();
    db.createNewCategory(newCategory.value, pickedColor.value)
      .then((found) => {
        if (!found) {
          newCategory.value = '';
          pickedColor.value = '#000000';
          printError.textContent = "New category added";
          console.log("New category added");
        } else {
          printError.textContent = "Category already exists";
          (<HTMLElement>printError).style.color = 'red';
        }

        printEveryTodo();
      });
  });
  editTodoSubmitButton.addEventListener('click', function (e: Event) {
    console.log(editCategory.options[selectedCategory.selectedIndex], editCategory.value);
    let res = editDate.value.split('/');
    let date = `${res[2]}/${res[1]}/${res[0]}`;
    db.updateTodo(editTitle.value, editDescription.value, date, editCategory.value, editCategory.getAttribute('customAttribute'), editTodoForm.getAttribute('data-note-id'))
      .then(() => {
        printEveryTodo();
      })

    db.shareTodo(editTodoForm.getAttribute('data-note-id'), selectedUsers)
      .then(() => {

      })


  });
  /* /////////////////////////////////// GET USERS AND FILTER THEM BY ENTERED VALUE /////////////////////////////// */
  db.getAllUsers()
    .then((users: any) => {
      users.forEach((user: any) => {
        allUsers.push(user.username);
      });
    })

  search.addEventListener('input', () => {
    //searchUser(search.value);
    let matches = allUsers.filter((user: String) => {
      let exp = new RegExp(`^${search.value}`, 'gi');
      return user.match(exp);
    });
    if (search.value.length === 0) {
      matches = [];
      matchList.innerHTML = ''
    }
    outputMatches(matches);
  });

  function outputMatches(matches: string[]) {
    if (matches.length > 0) {
      let html = matches.map((match: string) => {
        return `<div class='card card-body over'>${match}</div>`;
      }).join('');
      matchList.innerHTML = html;
      let userDiv = Array.from(document.getElementsByClassName('over'));
      userDiv.forEach(div => {
        div.addEventListener('click', selectClickedUser);
      });
    } else {
      matchList.innerHTML = ''
    }
  }

  function selectClickedUser(e: Event) {
    matchList.innerHTML = '';
    search.value = '';
    let values = (<HTMLElement>e.currentTarget).textContent;
    if (!(selectedUsers.includes(values))) {
      if (values === sessionStorage.getItem('username')) {
        (<HTMLElement>document.querySelector("#duplicated-user")).textContent = "You cant share the todo with yourself";
      } else if (values === editTodoForm.getAttribute('original-user')) {
        (<HTMLElement>document.querySelector("#duplicated-user")).textContent = "You cant share the todo with the owner";
      }
      else {
        (<HTMLElement>document.querySelector("#duplicated-user")).textContent = "";
        selectedUsers.push(values);
      }

    }
    displayUsers();
  }
  /* /////////////////////////////////// TODO TASKS /////////////////////////////// */
  addTask.addEventListener('click', function (e: Event) {
    e.preventDefault();
    let todoId = editTodoForm.getAttribute('data-note-id');
    if (newTask.value !== '') {
      let task: any = {
        id: new BSON.ObjectId(),
        task_name: newTask.value,
        completed: false
      }
      newTask.value = '';
      allTasks.push(task);
      db.addTaskToTodo(todoId, task)
        .then(() => {
          displayTasksInEditForm(todoId);
          printEveryTodo();
        })
    }

  });

}
/* /////////////////////////////////// GET TASKS FOR A SPECIFIC TODO /////////////////////////////// */
function displayTasksInEditForm(todoId: any) {
  db.displayTasksInEditForm(todoId)
    .then((result: any) => {
      while (displayTask.firstChild) {
        displayTask.removeChild(displayTask.firstChild as ChildNode);
      }
      if (result.tasks) {
        console.log(result);

        for (let i = 0; i < result.tasks.length; i++) {
          let p = document.createElement('p');
          p.textContent = `${i + 1}. ${result.tasks[i].task_name}`;
          displayTask.appendChild(p);
        }
      }
    })

}
/* /////////////////////////////////// GET USERS THAT THE TODO IS SHARED WITH  /////////////////////////////// */
function displayUsers() {
  while (chosenUsers.firstChild) {
    chosenUsers.removeChild(chosenUsers.firstChild as ChildNode);
  }
  if (selectedUsers) {
    for (let i = 0; i < selectedUsers.length; i++) {
      let span = document.createElement('span');
      let p = document.createElement('span');
      span.setAttribute('class', 'mr-1 mb-1 user-par px-1');
      p.textContent = selectedUsers[i];
      let button = document.createElement('button');
      button.setAttribute('class', 'btn mx-1 remove-user-button');
      button.textContent = 'x';
      button.setAttribute('type', 'button');
      button.addEventListener('click', removeSelectedUser)
      span.appendChild(button);
      span.appendChild(p);
      chosenUsers.appendChild(span);
    };
  }

}
/* /////////////////////////////////// REMOVE USERS FROM THE SHARED LIST  /////////////////////////////// */
function removeSelectedUser(e: Event) {
  e.preventDefault();
  let value: any = (<HTMLElement>(<HTMLElement>e.currentTarget).parentNode).childNodes[1].textContent;
  let index = selectedUsers.indexOf(value);
  if (index > -1) {
    selectedUsers.splice(index, 1);
    displayUsers();
  }
}

function printEveryTodo() {
  /* //////////////////////////Print todos ////////////////////////////// */
  function printToDos() {
    db.printTodos()
      .then((allTodos: any) => {
        allTodos.sort(compare);
        let newArr = groupBy(allTodos, 'category_name')
        addTodosToForm(newArr, notesList, false);
      });

    db.printCompletedTodos()
      .then((completedTodos: any) => {
        completedTodos.sort(compare);
        let newArr = groupBy(completedTodos, 'category_name');
        addTodosToForm(newArr, completedNotesList, true);
      })

    /* //////////////////////////Display the categories in the modal ////////////////////////////// */
    db.printCategories()
      .then((allCategories: any) => {
        displayCategories(allCategories, selectedCategory, false);
        displayCategoriesInList(allCategories, filterByCategory, true);
        while (modalCategoryList.firstChild) {
          modalCategoryList.removeChild(modalCategoryList.firstChild as ChildNode);
        }
        allCategories.forEach((category: any) => {
          let listItem = document.createElement('li');
          let p = document.createElement('p');
          let button = document.createElement('button');
          p.textContent = category.name;
          p.setAttribute('class', 'my-auto');
          p.onclick = convertPToInput;
          button.textContent = 'x';
          button.setAttribute('class', 'btn btn-danger');
          button.onclick = deleteCategory;
          listItem.setAttribute("class", "list-group-item d-flex justify-content-between");
          listItem.appendChild(p);
          listItem.appendChild(button);
          listItem.setAttribute('data-note-id', category._id.toString());
          modalCategoryList.appendChild(listItem);

        });
      })
  }
  /* //////////////////////////Filter and display todos by category////////////////////////////// */
  todayCheckbox.addEventListener('click', (e: any) => {
    selectOnlyThis(e.target);
    specificTodos();

  });

  weekCheckbox.addEventListener('change', (e: any) => {
    selectOnlyThis(e.target);
    specificTodos();
  });

  datePickerCheckbox.addEventListener('click', (e: any) => {
    selectOnlyThis(e.target);
    let datePicker: any = document.querySelector('#date-picker') as HTMLInputElement;
    datePicker.style.border = '';
    if (datePicker.value === '' || datePicker.value.includes('...')) {
      datePicker.style.border = '0.5px solid red';
    } else {
      specificTodos();
    }
    if (datePickerCheckbox.checked === false) {
      datePicker.value = '';
    }
  });

  /////////////////////////////////////// PRINT FILTERED TODOS ////////////////////////////////////
  function specificTodos() {
    let datePicker = document.querySelector('#date-picker') as HTMLInputElement;
    let date: any = [];
    if (todayCheckbox.checked) {
      let currDate = getCurrentDate();
      date.push(Number(Date.parse(currDate)));

    } else if (weekCheckbox.checked) {
      let curr = new Date();
      for (let i = 1; i <= 7; i++) {
        let first = curr.getDate() - curr.getDay() + i;
        let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
        let newdate = modifyDate(day);
        date.push(Number(Date.parse(newdate)));
      }

    } else if (datePickerCheckbox.checked) {
      let value: any = datePicker.value;
      let res = value.split(' - ');
      res.forEach((element: any) => {
        let part = element.split('/');
        let firstDate = `${part[2]}-${part[1]}-${part[0]}`;
        let newdate = modifyDate(firstDate);
        date.push(Number(Date.parse(newdate)))
      });

    }

    db.printTodosByCategory(date, checkedCategory)
      .then((todosByCategory: any) => {
        sortTodoByCompletion(todosByCategory);
      })

  }
  function sortTodoByCompletion(todos: any) {
    let completedTodos: any[] = [];
    let uncompletedTodos: any[] = [];
    todos.forEach((todo: any) => {
      if (todo.completed) {
        completedTodos.push(todo);
      } else {
        uncompletedTodos.push(todo);
      }
    });
    uncompletedTodos.sort(compare);
    let newArr = groupBy(uncompletedTodos, 'category_name');
    completedTodos.sort(compare);
    let newArr2 = groupBy(completedTodos, 'category_name');
    addTodosToForm(newArr, notesList, false);
    addTodosToForm(newArr2, completedNotesList, true);
    getSharedTodos();
  }
  /* //////////////////////////Call this function when a todo is marked as completed ////////////////////////////// */
  function markCompletedNote(e: Event) {
    let todoId: any = ((<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>e.target).parentNode).parentNode).parentNode).parentNode).getAttribute('data-note-id'));
    let checked = (<HTMLInputElement>e.target).checked;
    db.markCompletedNote(todoId, checked)
      .then((completed) => {
        if (completed) {
          (<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>e.target).parentNode).parentNode).parentNode).parentNode).style.border = '';
          specificTodos();
        } else {
          (<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>e.target).parentNode).parentNode).parentNode).parentNode).style.border = '0.5px solid red';
          (<HTMLInputElement>e.target).checked = false;
        }
      });
  }
  function markCompletedTask(e: Event) {
    let todoId: any = ((<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>e.target).parentNode).parentNode).parentNode).parentNode).getAttribute('data-note-id'));
    let taskId: any = (<HTMLElement>e.target).getAttribute('task-id');
    let checked = (<HTMLInputElement>e.target).checked;
    db.markCompletedTask(todoId, taskId, checked)
      .then((completed) => {
        console.log(completed);

        if (!completed) {
          specificTodos();
        }
      })
  }
  /* //////////////////////////Remove a category////////////////////////////// */
  function deleteCategory(e: Event) {
    let catName = ((<HTMLElement>(<HTMLElement>e.target).parentNode).childNodes[0]).textContent;
    let catId: any = ((<HTMLElement>(<HTMLElement>e.target).parentNode).getAttribute('data-note-id'));
    db.removeCategory(catId, catName)
      .then(() => {
        printEveryTodo();
      })
  }
  /* //////////////////////////Transform a par to an input////////////////////////////// */
  function convertPToInput(e: Event) {
    let p: any = e.target;
    let currentCategory = p.textContent;
    let input: HTMLInputElement = document.createElement('input');
    input.value = p.textContent;
    p.replaceWith(input);
    input.addEventListener('blur', function (e: any) {
      db.editCategory(e.target.value, currentCategory)
        .then(() => {
          let p = document.createElement('p');
          p.textContent = e.target.value;
          p.setAttribute('class', 'my-auto');
          p.onclick = convertPToInput;
          e.target.replaceWith(p);
          printEveryTodo();
        })
    });
  }
  /* //////////////////////////DISPLAY ALL CATEGORIES IN THE SIDE MENU////////////////////////////// */
  function displayCategoriesInList(categories: any, placeToBeDisplayed: HTMLUListElement, defaultFilter: boolean) {
    while (placeToBeDisplayed.firstChild) {
      placeToBeDisplayed.removeChild(placeToBeDisplayed.firstChild as ChildNode);
    }
    categories.forEach((category: any) => {
      let listItem = document.createElement("li");
      let label = document.createElement("label");
      let input = document.createElement("input");
      let span = document.createElement("span");

      label.textContent = category.name;
      label.style.color = category.color;
      label.setAttribute('class', "check-label");
      input.setAttribute("class", "my-auto mr-2");
      input.setAttribute("type", "checkbox");
      input.onclick = checkCategory;
      span.setAttribute("class", "checkmark");
      label.appendChild(input);
      label.appendChild(span);
      listItem.appendChild(label);
      placeToBeDisplayed.appendChild(listItem);

    });
  }

  /* //////////////////////////RUN THIS WHEN A CATEGORY IS CHECKED////////////////////////////// */
  function checkCategory(e: any) {
    if (e.target.checked) {
      checkedCategory.push(e.target.parentNode.textContent);
      specificTodos();
    } else {
      let index = checkedCategory.indexOf(e.target.parentNode.textContent);
      if (index > -1) {
        checkedCategory.splice(index, 1);
      }
      specificTodos();
    }
  }
  /* //////////////////////////Display the categories in the dropdown////////////////////////////// */
  function displayCategories(categories: any, placeToBeDisplayed: HTMLSelectElement, defaultFilter?: boolean) {
    while (placeToBeDisplayed.firstChild) {
      placeToBeDisplayed.removeChild(placeToBeDisplayed.firstChild as ChildNode);
    }

    if (defaultFilter) {
      let displayAll: any = document.createElement('option');
      displayAll.textContent = 'Display all todos';
      placeToBeDisplayed.appendChild(displayAll);
    } else if (defaultFilter === false) {
      let firstOption: any = document.createElement('option');
      firstOption.textContent = 'Select a category';
      firstOption.value = 0;
      // firstOption.setAttribute("disabled selected", "disabled selected");
      firstOption.selected = true;
      firstOption.disabled = true;
      placeToBeDisplayed.appendChild(firstOption);
    }
    for (let i = 0; i < categories.length; i++) {
      let option: any = document.createElement('option');
      option.textContent = categories[i].name;
      option.value = categories[i].name;
      option.setAttribute("customAttribute", categories[i].color)
      placeToBeDisplayed.appendChild(option);
    }
  }
  /* //////////////////////////Prin the todos on the page////////////////////////////// */
  async function addTodosToForm(todos: any, list: HTMLElement, isChecked: boolean) {
    while (list.firstChild) {
      list.removeChild(list.firstChild as ChildNode);
    }
    for (var key in todos) {
      let li = document.createElement('li');
      let ul = document.createElement('ul');
      let p = document.createElement('span');
      p.textContent = key;
      p.style.color = todos[key][0].color;
      li.appendChild(p);
      li.setAttribute('class', 'mb-3 todo-list');
      for (let i = 0; i < todos[key].length; i++) {

        let listItem = document.createElement("li");
        let checkBox = document.createElement("input");
        let par = document.createElement("p");
        let date = document.createElement('span');
        let div = document.createElement('div');
        let div2 = document.createElement('div');
        let div3 = document.createElement('div');
        let div4 = document.createElement('div');
        let label = document.createElement('label');
        let span = document.createElement('span');
        let description = document.createElement('p');
        let button = document.createElement("button");

        const commentField = await generateCommentField(todos[key][i].comments);

        //btn.textContent = "x";
        checkBox.setAttribute("type", "checkbox");
        checkBox.setAttribute("class", "note-checkbox checkbox checkbox-primary");
        checkBox.onclick = markCompletedNote;
        span.setAttribute('class', 'checkmark');
        if (isChecked) {
          checkBox.checked = true;
        }
        label.appendChild(checkBox);
        label.appendChild(span);
        label.setAttribute("class", "check-label");
        date.textContent = "Due date: " + rearrangeDate(modifyDate(todos[key][i].due_date));
        date.setAttribute('class', 'my-auto');
        button.setAttribute('class', "btn btn-warning todo-edit-button ml-2 text-center");
        button.setAttribute('data-toggle', 'modal');
        button.setAttribute('data-target', '#todoModal');
        button.textContent = "Edit";
        button.addEventListener('click', getTodoDetails);

        div.appendChild(date);
        div.appendChild(button);
        //div.appendChild(label);
        div.setAttribute("class", "d-flex justify-content-between");

        par.textContent = todos[key][i].todo;
        par.setAttribute('class', 'my-auto')

        div2.appendChild(label);
        div2.appendChild(par);
        div2.setAttribute("class", " d-flex justify-content-between");
        div3.setAttribute("class", " d-flex justify-content-between mt-1");
        div3.style.width = '100%'
        div3.appendChild(div2);
        //listItem.appendChild(par);
        div3.appendChild(div);
        description.textContent = todos[key][i].description;
        description.style.padding = '0 18px';
        description.style.borderTop = '0.5px solid black';
        description.style.borderBottom = '0.5px solid black';

        div4.appendChild(description);
        div4.setAttribute('class', 'content mt-2');

        if (todos[key][i].tasks) {
          for (let j = 0; j < todos[key][i].tasks.length; j++) {
            let checkBox = document.createElement('input');
            let span = document.createElement('span');
            let par = document.createElement('span');
            let label = document.createElement('label');
            let div = document.createElement('div');
            checkBox.setAttribute("type", "checkbox");
            checkBox.setAttribute("class", "note-checkbox checkbox checkbox-primary");
            checkBox.setAttribute('task-id', todos[key][i].tasks[j].id.toString());
            checkBox.addEventListener('click', markCompletedTask);
            if (todos[key][i].tasks[j].completed === true) {
              checkBox.checked = true;
            }
            span.setAttribute('class', 'checkmark');
            label.appendChild(checkBox);
            label.appendChild(span);
            label.setAttribute("class", "check-label");
            par.textContent = todos[key][i].tasks[j].task_name;
            div.appendChild(label);
            div.appendChild(par);
            div.setAttribute("class", " d-flex");
            div4.appendChild(div);
          }
        }

        listItem.appendChild(div3);
        listItem.appendChild(div4);
        listItem.addEventListener('click', expand);
        listItem.setAttribute("class", " d-flex flex-column printed-note");
        listItem.setAttribute('data-note-id', todos[key][i]._id.toString());
        // add comment field to 'todo' item
        listItem.appendChild(commentField);
        const commentInput = listItem.children[2].children[1].firstChild as HTMLInputElement;
        const addCommentButton = listItem.children[2].children[2].children[1].lastChild as HTMLButtonElement;
        const numOfComments = listItem.children[2].children[2].children[0] as HTMLElement;
        const commentList = listItem.children[2].children[0] as HTMLUListElement;

        addCommentButton.addEventListener('click', () => newCommentHandler(
          commentInput,
          addCommentButton,
          todos[key][i]._id.toString(),
          numOfComments,
          commentList
        ));

        ul.appendChild(listItem);
      }
      li.appendChild(ul);
      list.appendChild(li);



    }
    if (!list.firstChild) {
      let listItem = document.createElement('li');
      listItem.textContent = "No todos stored";
      list.appendChild(listItem);
    }
  }

  /* //////////////////////// GET SHARED TODOS ////////////////////// */
  function getSharedTodos() {
    db.getSharedTodos()
      .then((todos: any) => {
        let completedTodos: any[] = [];
        let uncompletedTodos: any[] = [];
        todos.forEach((todo: any) => {
          if (todo.completed) {
            completedTodos.push(todo);
          } else {
            uncompletedTodos.push(todo);
          }
        });

        printSharedTodos(uncompletedTodos, notesList, false);
        printSharedTodos(completedTodos, completedNotesList, true);
      })
  }

  function printSharedTodos(todos: any, location: any, isChecked: boolean) {
    let ul = document.createElement('ul');
    if (todos.length > 0) ul.textContent = "Shared todos";
    todos.forEach((todos: any) => {
      let listItem = document.createElement("li");
      let checkBox = document.createElement("input");
      let par = document.createElement("p");
      let date = document.createElement('span');
      let div = document.createElement('div');
      let div2 = document.createElement('div');
      let div3 = document.createElement('div');
      let div4 = document.createElement('div');
      let label = document.createElement('label');
      let span = document.createElement('span');
      let description = document.createElement('p');
      let button = document.createElement("button");
      //btn.textContent = "x";
      checkBox.setAttribute("type", "checkbox");
      checkBox.setAttribute("class", "note-checkbox checkbox checkbox-primary");
      checkBox.onclick = markCompletedNote;
      span.setAttribute('class', 'checkmark');
      if (isChecked) {
        checkBox.checked = true;
      }
      label.appendChild(checkBox);
      label.appendChild(span);
      label.setAttribute("class", "check-label");
      date.textContent = "Due date: " + rearrangeDate(modifyDate(todos.due_date));
      date.setAttribute('class', 'my-auto');
      button.setAttribute('class', "btn btn-warning todo-edit-button ml-2 text-center");
      button.setAttribute('data-toggle', 'modal');
      button.setAttribute('data-target', '#todoModal');
      button.textContent = "Edit";
      button.addEventListener('click', getTodoDetails);

      div.appendChild(date);
      div.appendChild(button);
      //div.appendChild(label);
      div.setAttribute("class", "d-flex justify-content-between");

      par.textContent = todos.todo;
      par.setAttribute('class', 'my-auto')

      div2.appendChild(label);
      div2.appendChild(par);
      div2.setAttribute("class", " d-flex justify-content-between");
      div3.setAttribute("class", " d-flex justify-content-between mt-1");
      div3.style.width = '100%'
      div3.appendChild(div2);
      //listItem.appendChild(par);
      div3.appendChild(div);
      description.textContent = todos.description;
      description.style.padding = '0 18px';
      description.style.borderTop = '0.5px solid black';

      div4.appendChild(description);
      div4.setAttribute('class', 'content mt-2');

      listItem.appendChild(div3);
      listItem.appendChild(div4);
      listItem.addEventListener('click', expand);
      listItem.setAttribute("class", " d-flex flex-column printed-note");
      listItem.setAttribute('data-note-id', todos._id.toString());
      ul.appendChild(listItem);
    });
    location.appendChild(ul);
  }

  /* //////////////////////// GET TODO DETAILS AND PRINT THEM IN THE MODAL ////////////////////// */

  function getTodoDetails(e: Event) {
    let noteId = (<String>(<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>e.currentTarget).parentNode).parentNode).parentNode).getAttribute('data-note-id'));
    db.getTodoInfo(noteId)
      .then((result: any) => {
        editTodoForm.setAttribute('data-note-id', result._id.toString());
        editTitle.value = result.todo;
        if (result.description !== undefined) {
          editDescription.value = result.description;
        }
        editDate.value = rearrangeDate(modifyDate(result.due_date));
        db.printCategories()
          .then((categories) => {
            displayCategories(categories, editCategory);
            editCategory.value = result.category_name;
            editCategory.setAttribute('customAttribute', result.color)
          })
        console.log(result);

      })
  }
  /* //////////////////////////Functions used to alter the date depending on the need////////////////////////////// */
  function modifyDate(date: any) {
    let dateObj = new Date(date);
    let month = dateObj.getUTCMonth() + 1; //months from 1-12
    let day = dateObj.getUTCDate() + 1;
    let year = dateObj.getUTCFullYear();
    let newdate = year + "/" + month + "/" + day;
    return newdate;
  }

  function rearrangeDate(date: any) {
    let res = date.split('/');
    let newDate = `${res[2]}/${res[1]}/${res[0]}`;
    return newDate;
  }
  /* //////////////////////////Function used to sort the todos by category////////////////////////////// */
  function groupBy(arr: any, key: any) {
    return arr.reduce(function (rv: any, x: any) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  function compare(a: any, b: any) {
    if (a.category_name < b.category_name) {
      return -1;
    }
    if (a.category_name > b.category_name) {
      return 1;
    }
    return 0;
  }
  /* //////////////////////////Function used to get the current date////////////////////////////// */
  function getCurrentDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    let currDate = yyyy + '/' + mm + '/' + dd;
    return currDate;
  }
  printToDos();
}

/* //////////////////////////Function used make the checkboxes act like radio inputs////////////////////////////// */
function selectOnlyThis(e: any) {
  var myCheckbox = document.getElementsByClassName("annoying");
  if (e.checked === true) {
    Array.prototype.forEach.call(myCheckbox, function (el) {
      el.checked = false;
    });
    e.checked = true;
  } else {
    e.checked = false;
  }
}

export { printEveryTodo };
