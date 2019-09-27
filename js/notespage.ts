import { DB } from './db';
import { strict } from 'assert';

let newNote: HTMLInputElement = document.querySelector("#new-note") as HTMLInputElement;
let notesForm: HTMLFormElement = document.querySelector("#note-form") as HTMLFormElement;
let notesList: HTMLElement = document.querySelector("#note-list") as HTMLElement;
console.log(notesForm);
if (notesForm) {
    window.onload = function () {
        init();
    }

}

function init() {

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

    db.printTodos()
        .then((allTodos: string[]) => {
            while (notesList.firstChild) {
                notesList.removeChild(notesList.firstChild as ChildNode);
            }
            console.log(allTodos);
            
            if (allTodos) {
                allTodos.forEach((todo: string) => {
                    let listItem = document.createElement("li");
                    let btn = document.createElement("button")
                    let par = document.createElement("p");
                    btn.textContent = "x";
                    btn.setAttribute("class", "btn btn-danger");
                    par.textContent = todo;
                    listItem.appendChild(par);
                    listItem.appendChild(btn);

                    listItem.setAttribute("class", "list-group-item d-flex justify-content-between");
                    //listItem.textContent = 
                    notesList.appendChild(listItem);
                });
            }
            if (!notesList.firstChild) {
                let listItem = document.createElement('li');
                listItem.textContent = "No todos stored";
                notesList.appendChild(listItem);
            }
        });
}