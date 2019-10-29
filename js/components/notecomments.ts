import { DB } from '../db';
import { Icomment } from '../utils';
const db = new DB();

/** Structure of note-comments component
 *  <div>
 *    <ul>
 *      <li>
 *        <span>owner</span>
 *        <span>message</span>
 *      </li>
 *    </ul>
 *    <div>
 *      <input type="text">
 *    </div>
 *    <div>
 *      <span>num of comments</span>
 *      <div>
 *        <button>Cancel</button> (hidden unless text input is opened)
 *        <button>Add comment</button>
 *      </div>
 *    </div>
 *  </div>
 */

async function generateCommentField(comments: Icomment[]) {
  const container = document.createElement('div');
  const commentsList = await createCommentsList(comments);
  const textField = createTextInput();
  const controllersField = createFieldControllers(comments);

  const textInput = textField.firstChild as HTMLInputElement;
  const numOfComments = controllersField.children[0] as HTMLElement;
  const cancelButton = controllersField.children[1].firstChild as HTMLElement;
  const addButton = controllersField.children[1].lastChild as HTMLButtonElement;

  // event listeners for elements interaction
  textInput.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
  })

  textInput.addEventListener('input', (e: Event) => {
    if (textInput.value !== '') {
      addButton.disabled = false;
    } else {
      addButton.disabled = true;
    }
  })

  numOfComments.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    commentsList.classList.toggle('d-none');
  })

  cancelButton.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();

    textInput.classList.add('d-none');
    textInput.value = '';

    cancelButton.classList.add('d-none');
    addButton.disabled = false;
  });

  document.addEventListener('keyup', (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.keyCode === 27) cancelButton.click();
  });

  addButton.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    textInput.classList.remove('d-none');
    cancelButton.classList.remove('d-none');
  });

  // container elements
  container.appendChild(commentsList);
  container.appendChild(textField);
  container.appendChild(controllersField);

  return container;
}

async function createCommentsList(comments: Icomment[]) {
  const list = document.createElement('ul');
  list.classList.add('comment-list', 'd-none');

  for (let comment of comments) {
    const newComment = document.createElement('li');
    const commentOwner = document.createElement('span');
    const commentMessage = document.createElement('span');
    const username = await db.getUsername(comment.owner_id);

    commentOwner.textContent = username;
    commentOwner.classList.add('comment-content');
    commentMessage.textContent = comment.message;

    newComment.appendChild(commentOwner);
    newComment.appendChild(commentMessage);
    newComment.classList.add('d-flex');

    list.appendChild(newComment);
  }

  return list;
}

async function createCommentElement(message: string, ownerId: string) {
  const newComment = document.createElement('li');
  const commentOwner = document.createElement('span');
  const commentMessage = document.createElement('span');
  const username = await db.getUsername(ownerId);

  commentOwner.textContent = username;
  commentOwner.classList.add('comment-content');
  commentMessage.textContent = message;

  newComment.appendChild(commentOwner);
  newComment.appendChild(commentMessage);
  newComment.classList.add('d-flex');

  return newComment as HTMLLIElement;
}

function createTextInput(): HTMLElement {
  const field = document.createElement('div');
  const textInput = document.createElement('input');

  textInput.setAttribute('type', 'text');
  textInput.setAttribute('id', 'comment-input');
  textInput.setAttribute('placeholder', 'Write a comment...');
  textInput.classList.add('comment-textinput', 'd-none');

  field.appendChild(textInput);
  field.classList.add('d-flex');

  return field;
}

function createFieldControllers(comments: Icomment[]): HTMLElement {
  const field = document.createElement('div');
  const numOfComments = document.createElement('span');

  numOfComments.textContent = `${comments.length} comments`;
  numOfComments.classList.add('comment-content');
  field.appendChild(numOfComments);

  const buttons = document.createElement('div');

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.classList.add('d-none');
  buttons.appendChild(cancelButton);

  const addButton = document.createElement('button');
  addButton.textContent = 'Add comment';

  buttons.appendChild(addButton);
  buttons.classList.add('d-flex');

  field.appendChild(buttons);
  field.classList.add('d-flex', 'justify-content-between');

  return field;
}

async function newCommentHandler(
  commentInput: HTMLInputElement,
  addCommentButton: HTMLButtonElement,
  todoNoteId: string,
  numOfComments: HTMLElement,
  commentList: HTMLUListElement
) {
  if (commentInput.value === '') {
    addCommentButton.disabled = true;
  } else {
    await db.addComment(
      todoNoteId,
      sessionStorage.getItem("loggedUser") as string,
      commentInput.value
    )
    const newCommentElem = await createCommentElement(
      commentInput.value,
      sessionStorage.getItem("loggedUser") as string
    );

    commentInput.value = '';
    addCommentButton.disabled = true;

    const commentCount = await db.countComments(todoNoteId);
    numOfComments.textContent = `${commentCount} comments`;
    commentList.appendChild(newCommentElem);
  }
}

export {
  generateCommentField,
  newCommentHandler
};
