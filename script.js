document.getElementById('add-button').addEventListener('click', addTodo);

// Load saved to-dos from storage
chrome.storage.local.get(['todos'], function(result) {
  if (result.todos) {
    result.todos.forEach(function(todo, index) {
      addTodoToList(todo, index);
    });
  }
});

function addTodo() {
  const todoText = document.getElementById('todo-input').value;
  if (todoText.trim()) {
    const todo = { text: todoText };
    chrome.storage.local.get(['todos'], function(result) {
      const todos = result.todos || [];
      todos.push(todo);
      chrome.storage.local.set({ todos: todos }, function() {
        addTodoToList(todo, todos.length - 1); // pass the index of the new todo
      });
    });
  }
  document.getElementById('todo-input').value = '';
}

function addTodoToList(todo, index) {
  const li = document.createElement('li');
  li.textContent = todo.text;

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
  document.getElementById('todo-list').appendChild(li);
}

function editTodo(index) {
  chrome.storage.local.get(['todos'], function(result) {
    const todos = result.todos || [];
    const newTodoText = prompt("Edit your task:", todos[index].text);
    if (newTodoText !== null && newTodoText.trim()) {
      todos[index].text = newTodoText;
      chrome.storage.local.set({ todos: todos }, function() {
        refreshTodoList();
      });
    }
  });
}

function removeTodo(index) {
  chrome.storage.local.get(['todos'], function(result) {
    const todos = result.todos || [];
    todos.splice(index, 1);
    chrome.storage.local.set({ todos: todos }, function() {
      refreshTodoList();
    });
  });
}

function refreshTodoList() {
  document.getElementById('todo-list').innerHTML = '';
  chrome.storage.local.get(['todos'], function(result) {
    if (result.todos) {
      result.todos.forEach(function(todo, index) {
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
    const nameText = document.getElementById('name-input').value;
    chrome.storage.local.set({userName: nameText}, function() {
        refreshGreeting();
    });
}

function refreshGreeting() {
    chrome.storage.local.get(['userName'], function(result) {
        if (result.userName) {
            document.getElementById('greeting').textContent = `Hi, ${result.userName}, how's it going?`;
        }
    });
}

const time = document.getElementById('time');
window.onload = getTime();
function getTime() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    time.textContent = `${hours}:${minutes}`;
}