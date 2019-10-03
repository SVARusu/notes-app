import { DB } from './db';

const db = new DB();

let newNote: HTMLInputElement = document.querySelector("#new-note") as HTMLInputElement;
let notesForm: HTMLFormElement = document.querySelector("#note-form") as HTMLFormElement;
let notesList: HTMLElement = document.querySelector("#note-list") as HTMLElement;
let completedNotesList: HTMLElement = document.querySelector("#completed-note-list") as HTMLElement;
let viewUncompletedTodos: HTMLElement = document.querySelector("#view-uncompleted-todos") as HTMLElement;
let viewCompletedTodos: HTMLElement = document.querySelector("#view-completed-todos") as HTMLElement;
let selectedCategory: HTMLSelectElement = document.querySelector("#selected-category") as HTMLSelectElement;
let newCategoryFrom: HTMLFormElement = document.querySelector("#create-category-form") as HTMLFormElement;
let newCategory: HTMLInputElement = document.querySelector("#new-category") as HTMLInputElement;
let pickedColor: HTMLInputElement = document.querySelector("#picked-color") as HTMLInputElement;
let filterByCategory: HTMLSelectElement = document.querySelector("#filter-todos") as HTMLSelectElement;
let modalCategoryList: HTMLElement = document.querySelector("#category-list") as HTMLElement;
let logOut: HTMLElement = document.querySelector("#logout-button") as HTMLElement;

console.log(notesForm);
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
    viewUncompletedTodos.addEventListener("click", function () {
        (<HTMLInputElement>document.querySelector('.completed-todos')).style.display = "none";
        (<HTMLInputElement>document.querySelector('.completed-todos-title')).style.display = "none";
        (<HTMLInputElement>document.querySelector('.uncompleted-todos')).style.display = "contents";
        (<HTMLInputElement>document.querySelector('.uncompleted-todos-title')).style.display = "contents";
    });
    viewCompletedTodos.addEventListener("click", function () {
        (<HTMLInputElement>document.querySelector('.uncompleted-todos')).style.display = "none";
        (<HTMLInputElement>document.querySelector('.uncompleted-todos-title')).style.display = "none";
        (<HTMLInputElement>document.querySelector('.completed-todos')).style.display = "contents";
        (<HTMLInputElement>document.querySelector('.completed-todos-title')).style.display = "contents";
    });
    logOut.addEventListener('click', function(){
        sessionStorage.setItem("loggedUser", '');
        let location = window.location.href;
        location = location.replace("notes.html", "")
        window.location.href = location;
    })
    printEveryTodo();
    notesForm.addEventListener("submit", (e: Event) => {
        e.preventDefault();
        if (selectedCategory.value !== "Select a category" && newNote.value !== '') {
            console.log(selectedCategory.options[selectedCategory.selectedIndex].style.background);
            let color = selectedCategory.options[selectedCategory.selectedIndex].style.background;
            db.addNewNote(newNote.value, selectedCategory.value, color)
            printEveryTodo();
            newNote.value = "";
        }
    });
    newCategoryFrom.addEventListener("submit", function (e: Event) {
        e.preventDefault();
        db.createNewCategory(newCategory.value, pickedColor.value)
            .then(() => {
                newCategory.value = '';
                pickedColor.value = '#000000';
                console.log("New category added");
                printEveryTodo();
            });
    });


}

function printEveryTodo() {
    /* //////////////////////////Print todos ////////////////////////////// */
    function printToDos() {
        db.printTodos()
            .then((allTodos: any) => {
                allTodos.sort(compare);
                console.log(allTodos);
                let isChecked = false
                if (allTodos) {
                    addTodosToForm(allTodos, notesList, isChecked);
                }
            });

        db.printCompletedTodos()
            .then((completedTodos: any) => {
                completedTodos.sort(compare);
                let isChecked = true;
                addTodosToForm(completedTodos, completedNotesList, isChecked);
            })
        /* //////////////////////////Display the categories in the select menu ////////////////////////////// */
        db.printCategories()
            .then((allCategories: any) => {
                let defaultFilter: boolean = false;
                displayCategories(allCategories, selectedCategory, defaultFilter);
            });
        db.printCategories()
            .then((allCategories: any) => {
                let defaultFilter: boolean = true;
                displayCategories(allCategories, filterByCategory, defaultFilter);
            })
        /* //////////////////////////Display the categories in the modal ////////////////////////////// */
        db.printCategories()
            .then((allCategories: any) => {
                while (modalCategoryList.firstChild) {
                    modalCategoryList.removeChild(modalCategoryList.firstChild as ChildNode);
                }
                allCategories.forEach((category: any) => {
                    let listItem = document.createElement('li');
                    let p = document.createElement('p');
                    let button = document.createElement('button');
                    p.textContent = category.category;
                    p.setAttribute('class', 'my-auto');
                    button.textContent = 'x';
                    button.setAttribute('class', 'btn btn-danger');
                    listItem.setAttribute("class", "list-group-item d-flex justify-content-between");
                    listItem.appendChild(p);
                    listItem.appendChild(button);
                    listItem.setAttribute('data-note-id', category.id);
                    modalCategoryList.appendChild(listItem);

                });
            })
    }   
    /* //////////////////////////Filter and display todos by category////////////////////////////// */
    filterByCategory.addEventListener('change', (e: Event) => {
        specificTodos()
    });

    function specificTodos() {
        db.printTodosByCategory(filterByCategory.value)
            .then((todosByCategory: any) => {
                let completedTodos: any[] = [];
                let uncompletedTodos: any[] = [];
                todosByCategory.forEach((todo: any) => {
                    console.log(todo.completed);
                    if (todo.completed) {
                        completedTodos.push(todo);
                    } else {
                        uncompletedTodos.push(todo);
                    }
                });
                uncompletedTodos.sort(compare);
                completedTodos.sort(compare);
                console.log(completedTodos, uncompletedTodos);
                addTodosToForm(uncompletedTodos, notesList, false)
                addTodosToForm(completedTodos, completedNotesList, true)
            })

    }
    /* //////////////////////////Call this function when a todo checkbox is checked ////////////////////////////// */
    function markCompletedNote(e: Event) {
        let todoId = Number((<HTMLElement>(<HTMLElement>e.target).parentNode).getAttribute('data-note-id'));
        let checked = (<HTMLInputElement>e.target).checked;
        db.markCompletedNote(todoId, checked)
            .then(() => {
                specificTodos();
            });
    }
/* //////////////////////////Display the categories in the dropdown////////////////////////////// */
    function displayCategories(categories: any, placeToBeDisplayed: HTMLSelectElement, defaultFilter: boolean) {
        while (placeToBeDisplayed.firstChild) {
            placeToBeDisplayed.removeChild(placeToBeDisplayed.firstChild as ChildNode);
        }

        if (defaultFilter) {
            let displayAll = document.createElement('option');
            displayAll.textContent = 'Display all todos';
            placeToBeDisplayed.appendChild(displayAll);
        } else {
            let firstOption = document.createElement('option');
            firstOption.textContent = 'Select a category';
            // firstOption.setAttribute("disabled selected", "disabled selected");
            firstOption.selected = true;
            firstOption.disabled = true;
            placeToBeDisplayed.appendChild(firstOption);
        }
        for (let i = 0; i < categories.length; i++) {
            let option = document.createElement('option');
            option.textContent = categories[i].category;
            option.setAttribute("class", "text-light");
            option.style.background = categories[i].color;
            placeToBeDisplayed.appendChild(option);
        }
    }
/* //////////////////////////Prin the todos on the page////////////////////////////// */
    function addTodosToForm(todos: any, list: HTMLElement, isChecked: boolean) {
        while (list.firstChild) {
            list.removeChild(list.firstChild as ChildNode);
        }
        for (let i = 0; i < todos.length; i++) {
            let listItem = document.createElement("li");
            let checkBox = document.createElement("input");
            let par = document.createElement("p");
            //btn.textContent = "x";
            checkBox.setAttribute("type", "checkbox");
            checkBox.setAttribute("class", "note-checkbox checkbox checkbox-primary");
            if (isChecked) {
                checkBox.checked = true;
            }
            checkBox.onclick = markCompletedNote;
            par.textContent = todos[i].todo;
            listItem.appendChild(par);
            listItem.appendChild(checkBox);
            listItem.style.background = todos[i].color;
            listItem.setAttribute("class", "list-group-item d-flex justify-content-between");
            listItem.setAttribute('data-note-id', todos[i].id);
            list.appendChild(listItem);
        }
        if (!list.firstChild) {
            let listItem = document.createElement('li');
            listItem.textContent = "No todos stored";
            list.appendChild(listItem);
        }
    }

    /* //////////////////////////Function used to sort the todos by category////////////////////////////// */
    function compare(a: any, b: any) {
        if (a.category < b.category) {
            return -1;
        }
        if (a.category > b.category) {
            return 1;
        }
        return 0;
    }
    printToDos();

}

export { printEveryTodo };