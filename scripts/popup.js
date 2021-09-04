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
        enabledCheckbox.checked = result.enabled
    })


    function toggleEnabled() {
        enabled = enabledCheckbox.checked
        chrome.storage.sync.set({enabled: enabled})
        chrome.runtime.sendMessage({enabled: enabled})
    }
});