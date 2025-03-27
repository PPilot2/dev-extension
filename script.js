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
    document.body.style.backgroundColor = '#fff';
    chrome.storage.local.set({ backgroundColor: '#fff' });
    chrome.storage.local.set({ backgroundImage: '' });
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
  updateTime();
  getRandomQuote('quotes.txt');
  defaultBackground();
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
      document.getElementById('nameInputChange').value = result.userName;  
    }
  });
}

function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  if (hours <= 12) {
    document.getElementById('time').innerHTML = `${timeString} <img src="images/day.png" alt="Day" width="25" height="25"/>`;
  } else {
    document.getElementById('time').innerHTML = `${timeString} <img src="images/night.png" alt="Night" width="25" height="25"/>`;
  }
}
// Update the time every second
setInterval(updateTime, 1000);

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
  chrome.storage.local.set({ backgroundColor: color }, () => {
    console.log('Color saved:', color); // Debugging
    document.body.style.backgroundColor = color; // Set the background color
    document.body.style.backgroundImage = ''; // Remove the background image
    chrome.storage.local.set({ backgroundImage: '' });
  });
}

// Restore the background color from storage on page load
chrome.storage.local.get(['backgroundColor'], (result) => {
  if (result.backgroundColor) {
    document.body.style.backgroundColor = result.backgroundColor;
  }
});

document.getElementById('nameInputChangeButton').addEventListener('click', updateName);

function updateName() {
  const name = document.getElementById('nameInputChange').value;
  chrome.storage.local.set({ userName: name }, function () {
    refreshGreeting();
  });
}

function defaultBackground() {
  const randomImage = Math.floor(Math.random() * 5) + 1;
  const imageUrl = chrome.storage.local.get(['backgroundImage']);
  document.body.style.backgroundImage = 'url(${imageUrl})';
  document.body.style.backgroundRepeat = 'repeat';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundSize = 'cover';
  document.getElementById('popupGallery').style.display = 'none';
}

document.getElementById('background-image-gallery').addEventListener('click', showPopup);

function showPopup() {
  document.getElementById('popupGallery').style.display = 'flex';
}

document.getElementById('closePopupGallery').addEventListener('click', closePopup);

function closePopup() {
  document.getElementById('popupGallery').style.display = 'none';
}

const galleryImages = document.querySelectorAll('.gallery-image');
galleryImages.forEach(image => {
  image.addEventListener('click', function() {
    // Set the background image of the body
    document.body.style.backgroundImage = `url(${image.src})`;
    chrome.storage.local.set({ backgroundImage: image.src });
    closePopup(); // Close the popup after selecting an image
  });
});

// async function fetchTopPosts() {
//   try {
//     const response = await fetch('https://dev.to/api/articles?top=5');
//     const posts = await response.json();
//     displayPosts(posts);
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//   }
// }

// function displayPosts(posts) {
//   const postsContainer = document.getElementById('posts');
//   postsContainer.innerHTML = '<h2>Top 5 Articles from <a href="https://dev.to">Dev.to</a></h2>';

//   posts.forEach(post => {
//     const postElement = document.createElement('div');
//     postElement.className = 'post';
    
//     // Properly format reactions and comments
//     const reactions = post.positive_reactions_count || 0;
//     const comments = post.comments_count || 0;
//     const author = post.user?.name || 'Unknown author';
    
//     postElement.innerHTML = `
//       <h3><a href="${post.url}">${post.title}</a></h3>
//       <p class="post-meta">
//         <span>👤 ${author}</span> | 
//         <span>👍 ${reactions}</span> | 
//         <span>💬 ${comments}</span>
//       </p>
//     `;
//     postsContainer.appendChild(postElement);
//   });
// }

// Call this when your page loads
// document.addEventListener('DOMContentLoaded', fetchTopPosts);


document.addEventListener('DOMContentLoaded', function() {
  const API_KEY = '3b231ded94bf43278721f803e3d14da2';
  const NEWS_API = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;
  const container = document.getElementById('news-container');

  if (!container) {
      console.error("Error: #news-container not found in DOM!");
      return;
  }

  async function fetchNews() {
      try {
          const response = await fetch(NEWS_API);
          const data = await response.json();
          if (data.status === 'ok') {
              displayNews(data.articles);
          } else {
              container.innerHTML = `<p>Error: ${data.message}</p>`;
          }
      } catch (error) {
          container.innerHTML = `<p>Failed to fetch news: ${error.message}</p>`;
      }
  }

  function displayNews(articles) {
      container.innerHTML = articles.map(article => `
          <div class="news-article">
              <h2>${article.title}</h2>
              ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}">` : ''}
              <p>${article.description || ''}</p>
              <a href="${article.url}" target="_blank">Read more</a>
          </div>
      `).join('');
  }

  fetchNews(); // Fetch news after DOM is ready
});

// popup.js
document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ action: "fetchNews" }, (response) => {
    if (response.error) {
      console.error("Error:", response.error);
    } else {
      displayNews(response.articles);
    }
  });
});

function displayNews(articles) {
  const container = document.getElementById("news-container");
  container.innerHTML = articles.map(article => `
    <div class="article">
      <h3>${article.title}</h3>
      <p>${article.description || "No description"}</p>
      <a href="${article.url}" target="_blank">Read more</a>
    </div>
  `).join("");
}