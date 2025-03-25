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