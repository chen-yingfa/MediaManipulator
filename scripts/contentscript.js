function injectScript() {

    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('scripts/controller.js');
    (document.head||document.documentElement).appendChild(s);
    s.onload = function() {
        s.parentNode.removeChild(s);
    };
}
injectScript()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    data = {
        type: "FROM_MEDIA_MANIPULATOR",
        content: {
            enabled: message.enabled
        }
    }
    window.postMessage({type: "MM_onSettingsUpdate", data: data})
    return true
})

window.addEventListener("message", function(event) {
    // console.log("contentscript.js got message event:", event)

    // We only accept messages from ourselves
    if (event.source != window) return;

    if (event.data.type && (event.data.type == "MM_fetchSettings")) {
        // Reply to message with settings update
        chrome.storage.sync.get(["enabled"], (result) => {            
            data = {
                type: "FROM_MEDIA_MANIPULATOR",
                content: {
                    enabled: result.enabled
                }
            }
            // console.log("posting message")
            window.postMessage({type: "MM_onSettingsUpdate", data: data})
        })
    }
});