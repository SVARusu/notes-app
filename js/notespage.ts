import { DB } from './db';


const db = new DB();

let newNote: HTMLInputElement = document.querySelector("#new-note") as HTMLInputElement;
let newDate: HTMLInputElement = document.querySelector('#new-date') as HTMLInputElement;
let notesForm: HTMLFormElement = document.querySelector("#note-form") as HTMLFormElement;
let notesList: HTMLElement = document.querySelector("#note-list") as HTMLElement;
let completedNotesList: HTMLElement = document.querySelector("#completed-note-list") as HTMLElement;
//let viewUncompletedTodos: HTMLElement = document.querySelector("#view-uncompleted-todos") as HTMLElement;
let viewCompletedTodos: HTMLElement = document.querySelector("#view-completed-todos") as HTMLElement;
let selectedCategory: HTMLSelectElement = document.querySelector("#selected-category") as HTMLSelectElement;
let newCategoryFrom: HTMLFormElement = document.querySelector("#create-category-form") as HTMLFormElement;
let newCategory: HTMLInputElement = document.querySelector("#new-category") as HTMLInputElement;
let pickedColor: HTMLInputElement = document.querySelector("#picked-color") as HTMLInputElement;
let filterByCategory = document.querySelector("#cat-list") as HTMLUListElement;
let modalCategoryList: HTMLElement = document.querySelector("#category-list") as HTMLElement;
let logOut: HTMLElement = document.querySelector("#logout-button") as HTMLElement;
let filterByDate: HTMLSelectElement = document.querySelector("#filter-by-date") as HTMLSelectElement;
// let rangeForm = document.querySelector("#date-range-form") as HTMLFormElement;
// let startDate = document.querySelector("#start-date") as HTMLInputElement;
// let endDate = document.querySelector("#end-date") as HTMLInputElement;
let todayCheckbox = document.querySelector("#today-checkbox") as HTMLInputElement;
let weekCheckbox = document.querySelector("#week-checkbox") as HTMLInputElement;
let datePickerCheckbox = document.querySelector("#date-picker-checkbox") as HTMLInputElement;

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
    todayCheckbox.addEventListener('click', selectOnlyThis);
    weekCheckbox.addEventListener('click', selectOnlyThis);
    datePickerCheckbox.addEventListener('click', selectOnlyThis);
    /////////////////////////////////////// CHANGE SMALL BOX COLOR //////////////////////////////////
    selectedCategory.addEventListener('change', function (e: any) {
        (<HTMLElement>document.querySelector("#color-box")).style.background = selectedCategory.options[selectedCategory.selectedIndex].getAttribute('customAttribute');
    });
    logOut.addEventListener('click', function () {
        sessionStorage.setItem("loggedUser", '');
        let location = window.location.href;
        location = location.replace("notes.html", "")
        window.location.href = location;
    })
    printEveryTodo();
    notesForm.addEventListener("submit", (e: Event) => {
        let color = selectedCategory.options[selectedCategory.selectedIndex].getAttribute('customAttribute');
        let categoryValue = Number(selectedCategory.value)
        let category = selectedCategory.value;
        console.log(categoryValue);
        e.preventDefault();
        if (newNote.value !== '' && newDate.value !== '') {
            if (categoryValue === 0) {
                color = 'white';
                category = 'default';
            }
            db.addNewNote(newNote.value, category, color, newDate.value)
                .then(() => {
                    newNote.value = "";
                    newDate.value = "";
                    (<HTMLElement>document.querySelector("#color-box")).style.background = 'none';
                    printEveryTodo();
                })
        }

    });
    newCategoryFrom.addEventListener("submit", function (e: Event) {
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
}

function printEveryTodo() {
    /* //////////////////////////Print todos ////////////////////////////// */
    function printToDos() {
        db.printTodos()
            .then((allTodos: any) => {
                allTodos.sort(compare);
                let newArr = groupBy(allTodos, 'category_name')
                addTodosToForm(newArr, notesList, false);

                // allTodos.sort(compare);
                // let isChecked = false
                // if (allTodos) {
                //     addTodosToForm(allTodos, notesList, isChecked);
                // }
            });

        db.printCompletedTodos()
            .then((completedTodos: any) => {
                completedTodos.sort(compare);
                let newArr = groupBy(completedTodos, 'category_name');
                addTodosToForm(newArr, completedNotesList, true);
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
        if (e.target.checked) {
            specificTodos();
        } else {
            printEveryTodo()
        }

    });

    weekCheckbox.addEventListener('click', (e: any) => {
        if (e.target.checked) {
            specificTodos();
        } else {
            printEveryTodo()
        }

    });

    datePickerCheckbox.addEventListener('click', (e: any) => {
        if (e.target.checked) {
            specificTodos();
        } else {
            printEveryTodo()
        }

    });


    /////////////////////////////////////// SPECIFIC TODO ////////////////////////////////////


    function specificTodos() {
        let date: any = [];
        if (todayCheckbox.checked) {
            let currDate = getCurrentDate();
            date.push(currDate);
        } else if (weekCheckbox.checked) {
            let curr = new Date();
            for (let i = 1; i <= 7; i++) {
                let first = curr.getDate() - curr.getDay() + i;
                let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
                let res = day.split('-');
                let newDay = `${res[2]}/${res[1]}/${res[0]}`;
                date.push(newDay);
            }
        } else if (datePickerCheckbox.checked) {
            let date = document.querySelector('#date-picker') as HTMLInputElement;
            let value: any = date.value
            let res = value.split(' - ');
            console.log(res[0]);

        }

        // if (startDate.value !== '' && endDate.value !== '' && Number(new Date(endDate.value)) < Number(new Date(startDate.value))) {
        //     let p = document.querySelector("#filter-by-date-range-error") as HTMLElement;
        //     p.textContent = "The end date is smaller than the start date";
        //     p.style.color = 'red';
        // } else {
        //     (<HTMLElement>document.querySelector("#filter-by-date-range-error")).textContent = ''
        //     db.printTodosByCategory(filterByCategory.value, date, startDate.value, endDate.value)
        //         .then((todosByCategory: any) => {
        //             let completedTodos: any[] = [];
        //             let uncompletedTodos: any[] = [];
        //             todosByCategory.forEach((todo: any) => {
        //                 if (todo.completed) {
        //                     completedTodos.push(todo);
        //                 } else {
        //                     uncompletedTodos.push(todo);
        //                 }
        //             });
        //             uncompletedTodos.sort(compare);
        //             completedTodos.sort(compare);
        //             console.log(completedTodos, uncompletedTodos);
        //             addTodosToForm(uncompletedTodos, notesList, false)
        //             addTodosToForm(completedTodos, completedNotesList, true)
        //         })
        // }
    }
    /* //////////////////////////Call this function when a todo checkbox is checked ////////////////////////////// */
    function markCompletedNote(e: Event) {
        let todoId: any = ((<HTMLElement>(<HTMLElement>(<HTMLElement>(<HTMLElement>e.target).parentNode).parentNode).parentNode).getAttribute('data-note-id'));

        let checked = (<HTMLInputElement>e.target).checked;
        console.log(checked);

        db.markCompletedNote(todoId, checked)
            .then(() => {
                //specificTodos();
                printToDos()
            });
    }
    /* //////////////////////////Remove a category////////////////////////////// */
    function deleteCategory(e: Event) {
        console.log(((<HTMLElement>(<HTMLElement>e.target).parentNode).childNodes[0]).textContent);
        let catName = ((<HTMLElement>(<HTMLElement>e.target).parentNode).childNodes[0]).textContent;
        let catId: any = ((<HTMLElement>(<HTMLElement>e.target).parentNode).getAttribute('data-note-id'));
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
            span.setAttribute("class", "checkmark");
            label.appendChild(input);
            label.appendChild(span);
            listItem.appendChild(label);
            placeToBeDisplayed.appendChild(listItem);

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
            let option: any = document.createElement('option');
            option.textContent = categories[i].name;
            //option.value = categories[i].color;
            option.setAttribute("customAttribute", categories[i].color)
            placeToBeDisplayed.appendChild(option);
        }
    }
    /* //////////////////////////Prin the todos on the page////////////////////////////// */
    function addTodosToForm(todos: any, list: HTMLElement, isChecked: boolean) {
        while (list.firstChild) {
            list.removeChild(list.firstChild as ChildNode);
        }
        for (var key in todos) {
            let ul = document.createElement('ul');
            let p = document.createElement('span');
            p.textContent = key;
            p.style.color = todos[key][0].color;
            ul.appendChild(p);
            ul.setAttribute('class', 'mb-3');
            for (let i = 0; i < todos[key].length; i++) {
                let listItem = document.createElement("li");
                let checkBox = document.createElement("input");
                let par = document.createElement("p");
                let date = document.createElement('p');
                let div = document.createElement('div');
                let label = document.createElement('label');
                let span = document.createElement('span');
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

                date.textContent = "Due date: " + todos[key][i].due_date;
                date.setAttribute('class', 'my-auto mr-4')
                div.appendChild(date);
                //div.appendChild(label);
                //div.setAttribute("class", "d-flex justify-content-between");

                par.textContent = todos[key][i].todo;
                par.setAttribute('class', 'my-auto')

                let div2 = document.createElement('div');
                div2.appendChild(label);
                div2.appendChild(par);
                div2.setAttribute("class", " d-flex justify-content-between");
                listItem.appendChild(div2);
                //listItem.appendChild(par);
                listItem.appendChild(div);
                //listItem.appendChild(date);

                listItem.setAttribute("class", " d-flex justify-content-between");
                listItem.setAttribute('data-note-id', todos[key][i]._id.toString());
                ul.appendChild(listItem);
            }
            list.appendChild(ul);

        }

        if (!list.firstChild) {
            let listItem = document.createElement('li');
            listItem.textContent = "No todos stored";
            list.appendChild(listItem);
        }
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

    function getCurrentDate() {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let currDate = dd + '/' + mm + '/' + yyyy;
        return currDate;
    }
    printToDos();

}

function selectOnlyThis(e: any) {
    var myCheckbox = document.getElementsByClassName("annoying");
    if (e.target.checked === true) {
        Array.prototype.forEach.call(myCheckbox, function (el) {
            el.checked = false;
        });
        e.target.checked = true;
    } else {
        e.target.checked = false;
    }

}

export { printEveryTodo };