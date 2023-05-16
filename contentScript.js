// Цвет подсветки
color = 'rgba(255, 255, 0, .4)';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(selectedText) {
  var minSearchLength = 3;

  // Очищаем предыдущую подсветку
  removeHighlight();

  if (selectedText.length < minSearchLength) {
    return;
  }

  var regex = new RegExp(escapeRegExp(selectedText), 'gi');

  function highlightElement(element) {
    if (element.nodeType === Node.TEXT_NODE) {
      var matches = element.nodeValue.match(regex);
      if (matches) {
        var parent = element.parentNode;
        var text = element.nodeValue;

        matches.forEach(function (match) {
          var span = document.createElement('span');
          span.style.backgroundColor = color;
          span.classList.add('highlighted-text');
          var highlightedText = document.createTextNode(match);
          span.appendChild(highlightedText);

          text = text.replace(new RegExp(escapeRegExp(match), 'gi'), span.outerHTML);
        });

        var tempElement = document.createElement('div');
        tempElement.innerHTML = text;
        var newNodes = Array.from(tempElement.childNodes);
        newNodes.forEach(function (newNode) {
          parent.insertBefore(newNode, element);
        });
        parent.removeChild(element);
      }
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      Array.from(element.childNodes).forEach(function (child) {
        highlightElement(child);
      });
    }
  }

  highlightElement(document.body);
}

function removeHighlight() {
  var highlightedText = document.querySelectorAll('.highlighted-text');
  highlightedText.forEach(function (span) {
    var parent = span.parentNode;
    parent.replaceChild(document.createTextNode(span.textContent), span);
  });
}

document.addEventListener('mouseup', function (event) {
  var selectedText = window.getSelection().toString();
  highlightText(selectedText);
});

document.addEventListener('wheel', function () {
  var selectedText = window.getSelection().toString();
  highlightText(selectedText);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'highlightText') {
    var selectedText = request.selectedText;
    highlightText(selectedText);
    sendResponse({ success: true });
  }
});