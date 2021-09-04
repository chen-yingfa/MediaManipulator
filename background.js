chrome.runtime.onInstalled.addListener(() => {
	console.log('--------------------------------')
	console.log('| Welcome to Media Manipulator |')
	console.log('--------------------------------')
})

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
	// Redirect message to content script
	message = {enabled: message.enabled}
	chrome.tabs.query({active: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
			console.log(response);
		});
	}); 
	return true
})