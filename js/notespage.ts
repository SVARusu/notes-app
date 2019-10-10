import { DB } from './db';


const db = new DB();

let newNote: HTMLInputElement = document.querySelector("#new-note") as HTMLInputElement;
let newDate: HTMLInputElement = document.querySelector('#new-date') as HTMLInputElement;
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
let filterByDate: HTMLSelectElement = document.querySelector("#filter-by-date") as HTMLSelectElement;
let rangeForm = document.querySelector("#date-range-form") as HTMLFormElement;
let startDate = document.querySelector("#start-date") as HTMLInputElement;
let endDate = document.querySelector("#end-date") as HTMLInputElement;

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
    logOut.addEventListener('click', function () {
        sessionStorage.setItem("loggedUser", '');
        let location = window.location.href;
        location = location.replace("notes.html", "")
        window.location.href = location;
    })
    printEveryTodo();
    notesForm.addEventListener("submit", (e: Event) => {
        e.preventDefault();
        if (Number(selectedCategory.value) !== 0 && newNote.value !== '' && newDate.value !== '') {
            let color = selectedCategory.options[selectedCategory.selectedIndex].style.background;
            db.addNewNote(newNote.value, selectedCategory.value, color, newDate.value)
            printEveryTodo();
            newNote.value = "";
            newDate.value = "";
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
        /* //////////////////////////Display the categories in the select menus ////////////////////////////// */
        // db.printCategories()
        //     .then((allCategories: any) => {
        //         let defaultFilter: boolean = false;
        //         displayCategories(allCategories, selectedCategory, defaultFilter);
        //     });
        // db.printCategories()
        //     .then((allCategories: any) => {
        //         let defaultFilter: boolean = true;
        //         displayCategories(allCategories, filterByCategory, defaultFilter);
        //     })
        /* //////////////////////////Display the categories in the modal ////////////////////////////// */
        db.printCategories()
            .then((allCategories: any) => {
                displayCategories(allCategories, selectedCategory, false);
                displayCategories(allCategories, filterByCategory, true);
                while (modalCategoryList.firstChild) {
                    modalCategoryList.removeChild(modalCategoryList.firstChild as ChildNode);
                }
                allCategories.forEach((category: any) => {
                    let listItem = document.createElement('li');
                    let p = document.createElement('p');
                    let button = document.createElement('button');
                    p.textContent = category.category;
                    p.setAttribute('class', 'my-auto');
                    p.onclick = convertPToInput;
                    button.textContent = 'x';
                    button.setAttribute('class', 'btn btn-danger');
                    button.onclick = deleteCategory;
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
        specificTodos();
    });

    filterByDate.addEventListener('change', () => {
        specificTodos();
    });

    rangeForm.addEventListener('change', function () {
        specificTodos();
    });
    function specificTodos() {
        let date: any = [];
        if (Number(filterByDate.value) === 1) {
            let currDate = getCurrentDate();
            date.push(currDate)
        } else if (Number(filterByDate.value) === 2) {
            let curr = new Date();
            for (let i = 1; i <= 7; i++) {
                let first = curr.getDate() - curr.getDay() + i
                let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
                date.push(day)
            }
        } else {
            date.push(Number(filterByDate.value));
        }

        if (startDate.value !== '' && endDate.value !== '' && Number(new Date(endDate.value)) < Number(new Date(startDate.value))) {
            let p = document.querySelector("#filter-by-date-range-error") as HTMLElement;
            p.textContent = "The end date is smaller than the start date";
            p.style.color = 'red';
        } else {
            (<HTMLElement>document.querySelector("#filter-by-date-range-error")).textContent = ''
            db.printTodosByCategory(filterByCategory.value, date, startDate.value, endDate.value)
                .then((todosByCategory: any) => {
                    let completedTodos: any[] = [];
                    let uncompletedTodos: any[] = [];
                    todosByCategory.forEach((todo: any) => {
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
    }
    /* //////////////////////////Call this function when a todo checkbox is checked ////////////////////////////// */
    function markCompletedNote(e: Event) {
        let todoId = Number((<HTMLElement>(<HTMLElement>(<HTMLElement>e.target).parentNode).parentNode).getAttribute('data-note-id'));
        let checked = (<HTMLInputElement>e.target).checked;
        db.markCompletedNote(todoId, checked)
            .then(() => {
                specificTodos();
            });
    }
    /* //////////////////////////Remove a category////////////////////////////// */
    function deleteCategory(e: Event) {
        console.log(((<HTMLElement>(<HTMLElement>e.target).parentNode).childNodes[0]).textContent);
        let catName = ((<HTMLElement>(<HTMLElement>e.target).parentNode).childNodes[0]).textContent;
        let catId: number = Number((<HTMLElement>(<HTMLElement>e.target).parentNode).getAttribute('data-note-id'));
        db.removeCategory(catId, catName)
            .then(() => {
                printEveryTodo();
            })

    }

    function convertPToInput(e: Event) {
        let p: any = e.target;
        let currentCategory = p.textContent;
        let input: HTMLInputElement = document.createElement('input');
        input.value = p.textContent;
        console.log(input.value);
        p.replaceWith(input);
        input.addEventListener('blur', function (e: any) {
            // if (e.currentTarget.dataset.triggered) return;
            // e.currentTarget.dataset.triggered = true;
            db.editCategory(e.target.value, currentCategory)
                .then(() => {
                    let p = document.createElement('p');
                    p.textContent = e.target.value;
                    p.setAttribute('class', 'my-auto');
                    p.onclick = convertPToInput;
                    e.target.replaceWith(p);
                    printEveryTodo();
                })

            //alert('clicked');
        });

    }
    /* //////////////////////////Display the categories in the dropdown////////////////////////////// */
    function displayCategories(categories: any, placeToBeDisplayed: HTMLSelectElement, defaultFilter: boolean) {
        while (placeToBeDisplayed.firstChild) {
            placeToBeDisplayed.removeChild(placeToBeDisplayed.firstChild as ChildNode);
        }

        if (defaultFilter) {
            let displayAll: any = document.createElement('option');
            displayAll.textContent = 'Display all todos';
            placeToBeDisplayed.appendChild(displayAll);
        } else {
            let firstOption: any = document.createElement('option');
            firstOption.textContent = 'Select a category';
            firstOption.value = 0;
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
            let date = document.createElement('p');
            let div = document.createElement('div')
            //btn.textContent = "x";
            checkBox.setAttribute("type", "checkbox");
            checkBox.setAttribute("class", "note-checkbox checkbox checkbox-primary");
            if (isChecked) {
                checkBox.checked = true;
            }
            checkBox.onclick = markCompletedNote;
            par.textContent = todos[i].todo;
            par.setAttribute('class', 'my-auto')
            date.textContent = "Due date: " + todos[i].dueDate;
            date.setAttribute('class', 'my-auto mr-4')
            div.appendChild(date);
            div.appendChild(checkBox);
            div.setAttribute("class", "d-flex justify-content-between");
            listItem.appendChild(par);
            listItem.appendChild(div);
            // listItem.appendChild(date);
            // listItem.appendChild(checkBox);
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

    function getCurrentDate() {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let currDate = yyyy + '-' + mm + '-' + dd;
        return currDate;
    }
    printToDos();

}

export { printEveryTodo };