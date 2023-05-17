// Цвет подсветки
backgroundColor = 'rgba(255, 255, 0, .4)';
color = 'white'; // цвет текста в выделенном тексте

// Функция для подсветки текста
function highlightText(selectedText) {
  var minSearchLength = 3;
  var maxSearchLength = 40;

  // Очищаем предыдущую подсветку
  removeHighlight();

  if (selectedText.length < minSearchLength && selectedText.length < maxSearchLength) {
    return;
  }

  // Функция для того, чтобы специальные символы были понимаемы регулярным выражением
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Создаем регулярное выражение для соответствия искомому выражению
  var regex = new RegExp(escapeRegExp(selectedText), 'gi');

  function highlightElement(element) {
    // Если встречаем текстовый узел, то проверяем его содержимое
    if (element.nodeType === Node.TEXT_NODE) {
      var matches = element.nodeValue.match(regex);
      if (matches) {
        var parent = element.parentNode;
        var text = element.nodeValue;

        // Обрабатываем каждое совпадение
        matches.forEach(function (match) {
          var mark = document.createElement('mark');
          mark.style.backgroundColor = backgroundColor;
          mark.style.color = color;
          mark.classList.add('highlighted-text');
          var highlightedText = document.createTextNode(match);
          mark.appendChild(highlightedText);

          // Заменяем совпадение на выделенный текст с тегом mark
          text = text.replace(new RegExp(escapeRegExp(match), 'gi'), mark.outerHTML);
        });

        // Вставляем новый текстовый узел, включающий выделенный текст с тегом mark
        var tempElement = document.createElement('div');
        tempElement.innerHTML = text;
        var newNodes = Array.from(tempElement.childNodes);
        newNodes.forEach(function (newNode) {
          parent.insertBefore(newNode, element);
        });
        parent.removeChild(element);
      }
    }
    // Если совпадения не найдены, переходим к следующему дочернему элементу
    else if (element.nodeType === Node.ELEMENT_NODE) {
      Array.from(element.childNodes).forEach(function (child) {
        highlightElement(child);
      });
    }
  }

  // Для всего документа вызываем функцию highlightElement
  highlightElement(document.body);
}

// Удаляем подсветку всех выделенных текстов
function removeHighlight() {
  var highlightedText = document.querySelectorAll('.highlighted-text');
  highlightedText.forEach(function (mark) {
    var parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
  });
}

// Вызываем функцию highlightText при выделении текста щелчком мыши
document.addEventListener('mouseup', function (event) {
  var selectedText = window.getSelection().toString();
  highlightText(selectedText);
});

// Вызываем функцию highlightText при движениях колесика мыши
document.addEventListener('wheel', function () {
  var selectedText = window.getSelection().toString();
  highlightText(selectedText);
});

// Принимаем сообщение от расширения и вызываем highlightText
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'highlightText') {
    var selectedText = request.selectedText;
    highlightText(selectedText);
    sendResponse({ success: true });
  }
});
