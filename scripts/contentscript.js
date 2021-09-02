var s = document.createElement('script');
s.src = chrome.runtime.getURL('scripts/controller.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};