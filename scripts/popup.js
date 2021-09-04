document.addEventListener("DOMContentLoaded", () => {
    let enabled = true

    const settingsDiv = document.getElementById("settings")
    const githubDiv = document.getElementById("github")
    const enabledCheckbox = document.getElementById("enable-checkbox")
    
    githubDiv.addEventListener("click", () => {
        window.open("https://github.com/donny-chan/MediaManipulator")
    })

    settingsDiv.addEventListener("click", () => {
        window.open(chrome.runtime.getURL("../pages/options.html"))
    })

    enabledCheckbox.addEventListener("click", () => {
        toggleEnabled()
    })


    // Set enabled checkbox according to chrome.storage
    chrome.storage.sync.get(["enabled"], (result) => {
        // console.log("value:", result.enabled)
        enabledCheckbox.checked = result.enabled
    })


    function toggleEnabled() {
        console.log("toggle enabled")
        enabled = enabledCheckbox.checked
        chrome.storage.sync.set({enabled: enabled})
        chrome.runtime.sendMessage({enabled: enabled})
        
        // let event = new CustomEvent("onSettingsUpdate", {enabled: enabled})
        // window.dispatchEvent(event)
        // setTimeout(() => {
        //     console.log("sending message from content script to web page")
        //     window.postMessage({type: "FROM_POPUP", text: "ceshi"}, "*")
        // }, 100)
    }
});