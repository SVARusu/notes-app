/** Structure of note-tasks
 *  <div>
 *    <div> // Task element
 *      <label class='check-label'>
 *        <input type='checkbox' class='note-checkbox checkbox checkbox-primary task-id='...'>
 *        <span class='checkmark'>
 *      </label>
 *      <span>{{Task text}}</span>
 *    </div> 
 *  </div>
 */

function generateTasksField(
  todoItem: any, // should use interface for todo item
  markCompletedTask: any // function in notespage.ts -- should implement better
  ): HTMLElement {
  const container = document.createElement('div');
  for (let i = 0; i < todoItem.tasks.length; i++) {
    let checkBox = document.createElement('input');
    let span = document.createElement('span');
    let par = document.createElement('span');
    let label = document.createElement('label');
    let div = document.createElement('div');

    checkBox.setAttribute("type", "checkbox");
    checkBox.setAttribute("class", "note-checkbox checkbox checkbox-primary");
    checkBox.setAttribute('task-id', todoItem.tasks[i].id.toString());
    checkBox.setAttribute('data-note-id', todoItem._id.toString()); // *****
    checkBox.addEventListener('click', markCompletedTask);
    if (todoItem.tasks[i].completed === true) {
      checkBox.checked = true;
    }

    span.setAttribute('class', 'checkmark');

    label.appendChild(checkBox);
    label.appendChild(span);
    label.setAttribute("class", "check-label");

    par.textContent = todoItem.tasks[i].task_name;

    div.appendChild(label);
    div.appendChild(par);
    div.setAttribute("class", " d-flex");
    container.appendChild(div);
  }
  return container;
}

export { generateTasksField }
