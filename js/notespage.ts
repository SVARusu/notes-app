import { DB } from './db';


let newNote: HTMLInputElement = document.querySelector("#new-note") as HTMLInputElement;
let notesForm: HTMLFormElement = document.querySelector("#note-form") as HTMLFormElement;
let notesList: HTMLElement = document.querySelector("#note-list") as HTMLElement;
let completedNotesList: HTMLElement = document.querySelector("#completed-note-list") as HTMLElement;
let viewUncompletedTodos: HTMLElement = document.querySelector("#view-uncompleted-todos") as HTMLElement;
let viewCompletedTodos: HTMLElement = document.querySelector("#view-completed-todos") as HTMLElement;
console.log(notesForm);
if (notesForm) {
    window.onload = function () {
        init();
    }
}

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
    const db = new DB;
    printEveryTodo(db);
    notesForm.addEventListener("submit", (e: Event) => {
        e.preventDefault();
        db.addNewNote(newNote.value)
        printEveryTodo(db);
        newNote.value = ""
    });

}

function printEveryTodo(db: any) {
    function printToDos() {
        db.printTodos()
            .then((allTodos: any) => {
                let isChecked = false
                while (notesList.firstChild) {
                    notesList.removeChild(notesList.firstChild as ChildNode);
                }
                if (allTodos) {
                    addTodosToForm(allTodos, notesList, isChecked)
                }
                if (!notesList.firstChild) {
                    let listItem = document.createElement('li');
                    listItem.textContent = "No todos stored";
                    notesList.appendChild(listItem);
                }
            });

        db.printCompletedTodos()
            .then((completedTodos: any) => {
                let isChecked = true;
                while (completedNotesList.firstChild) {
                    completedNotesList.removeChild(completedNotesList.firstChild as ChildNode);
                }
                addTodosToForm(completedTodos, completedNotesList, isChecked)
                if (!completedNotesList.firstChild) {
                    let listItem = document.createElement('li');
                    listItem.textContent = "No todos completed";
                    completedNotesList.appendChild(listItem);
                }
            })
        }

    function markCompletedNote(e: Event) {
        let todoId = Number((<HTMLElement>(<HTMLElement>e.target).parentNode).getAttribute('data-note-id'));
        let checked = (<HTMLInputElement>e.target).checked;
        db.markCompletedNote(todoId, checked)
            .then(() => {
                printToDos();
            });
    }    

    function addTodosToForm(todos: any, list: HTMLElement, isChecked: boolean) {
        for (let i = 0; i < todos.length; i++) {
            let listItem = document.createElement("li");
            let checkBox = document.createElement("input")
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
            listItem.setAttribute("class", "list-group-item d-flex justify-content-between");
            listItem.setAttribute('data-note-id', todos[i].id);
            //listItem.textContent = db.markCompletedNote
            //listItem.setAttribute('data-note-id', cursorValue[i]);
            list.appendChild(listItem);
        }
    }
    printToDos();
}

export { printEveryTodo };