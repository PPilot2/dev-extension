// Initialize to-dos on window load
document.getElementById('set-background-image-button').addEventListener('click', setBackgroundImage);

function setBackgroundImage() {
  const fileInput = document.getElementById('background-image-input');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageUrl = e.target.result; // Get base64 image URL
      chrome.storage.local.set({ backgroundImage: imageUrl }, function () {
        document.body.style.backgroundImage = `url('${imageUrl}')`;
        document.body.style.backgroundSize = 'cover';
      });
    };
    reader.readAsDataURL(file); // Read the image file as base64
  }
}
document.getElementById('reset-background-button').addEventListener('click', function () {
  chrome.storage.local.remove('backgroundImage', function () {
    document.body.style.backgroundImage = '';
  });
});
// Load saved background image on window load
window.onload = function () {
  chrome.storage.local.get(['backgroundImage'], function (result) {
    if (result.backgroundImage) {
      document.body.style.backgroundImage = `url('${result.backgroundImage}')`;
      document.body.style.backgroundSize = 'cover';
    }
  });

  // Call other window.onload tasks
  chrome.storage.local.get(['todos'], function (result) {
    if (result.todos) {
      result.todos.forEach(function (todo, index) {
        addTodoToList(todo, index);
      });
    }
  });

  refreshGreeting();
  getTime();
  getRandomQuote('quotes.txt');
};


// Add to-do event listener
document.getElementById('add-button').addEventListener('click', addTodo);

function addTodo() {
  const todoText = document.getElementById('todo-input').value;
  if (todoText.trim()) {
    const todo = { text: todoText };
    chrome.storage.local.get(['todos'], function (result) {
      const todos = result.todos || [];
      todos.push(todo);
      chrome.storage.local.set({ todos: todos }, function () {
        addTodoToList(todo, todos.length - 1); // Pass the index of the new to-do
      });
    });
  }
  document.getElementById('todo-input').value = '';
}

function addTodoToList(todo, index) {
  const todoList = document.getElementById('todo-list');
  const li = document.createElement('li');
  li.textContent = todo.text;
  li.setAttribute('data-index', index);

  // Edit button
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => editTodo(index));

  // Remove button
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => removeTodo(index));

  li.appendChild(editButton);
  li.appendChild(removeButton);
  todoList.appendChild(li);

  adjustMainHeight();
}

function adjustMainHeight() {
  const todoList = document.getElementById('todo-list');
  const main = document.querySelector('main');
  const numTodos = todoList.children.length;
  const newHeight = Math.max(60, 80 - numTodos * 5); // Decrease height by 5px per to-do, minimum height 60px
  main.style.height = `${newHeight}vh`;
}

function editTodo(index) {
  chrome.storage.local.get(['todos'], function (result) {
    const todos = result.todos || [];
    const newTodoText = prompt('Edit your task:', todos[index].text);
    if (newTodoText !== null && newTodoText.trim()) {
      todos[index].text = newTodoText;
      chrome.storage.local.set({ todos: todos }, function () {
        refreshTodoList();
      });
    }
  });
}

function removeTodo(index) {
  chrome.storage.local.get(['todos'], function (result) {
    const todos = result.todos || [];
    todos.splice(index, 1);
    chrome.storage.local.set({ todos: todos }, function () {
      refreshTodoList();
    });
  });
}

function refreshTodoList() {
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = '';
  chrome.storage.local.get(['todos'], function (result) {
    if (result.todos) {
      result.todos.forEach(function (todo, index) {
        addTodoToList(todo, index);
      });
    }
  });
}

const nameInput = document.getElementById('name-input');
nameInput.addEventListener('input', changeGreeting);

if (chrome.storage.local.get(['userName']) !== null) {
  nameInput.style.visibility = 'hidden';
  refreshGreeting();
}

function changeGreeting() {
  const nameText = nameInput.value;
  chrome.storage.local.set({ userName: nameText }, function () {
    refreshGreeting();
  });
}

function refreshGreeting() {
  chrome.storage.local.get(['userName'], function (result) {
    if (result.userName) {
      document.getElementById('greeting').textContent = `Hi, ${result.userName}, how's it going?`;
    }
  });
}

function getTime() {
  const time = document.getElementById('time');
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  time.textContent = `${hours}:${minutes}`;
}

function getRandomQuote(filePath) {
  fetch(filePath)
    .then((response) => response.text())
    .then((text) => {
      const lines = text.split('\n');
      const randomLine = lines[Math.floor(Math.random() * lines.length)];
      document.getElementById('quote').textContent = randomLine;
    })
    .catch((error) => console.error('Error fetching the file:', error));
}

document.getElementById('color-button').addEventListener('click', changeBackground);

function changeBackground() {
  const color = document.getElementById('color-input').value;
  chrome.storage.local.set({ backgroundColor: color });
  document.body.style.backgroundColor = color;
}
