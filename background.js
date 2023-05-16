chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: 'highlightText',
    title: 'Highlight Selected Text',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'highlightText') {
    chrome.tabs.sendMessage(tab.id, { action: 'highlightText', selectedText: '' }, function(response) {
      if (response && response.success) {
        console.log('Text highlighted successfully.');
      } else {
        console.error('Failed to highlight text.');
      }
    });
  }
});