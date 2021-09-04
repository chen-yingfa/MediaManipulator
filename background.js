chrome.runtime.onInstalled.addListener(() => {
	console.log('--------------------------------')
	console.log('| Welcome to Media Manipulator |')
	console.log('--------------------------------')
})

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
	// pass message to content script
	console.log("background.js got message")
	console.log(message)

	message = {enabled: message.enabled}
	console.log("Sending message to contentscript.js")
	chrome.tabs.query({active: true}, function(tabs) {
		console.log("tabs:", tabs)
		chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
			console.log(response);
		});
	}); 
	return true
})