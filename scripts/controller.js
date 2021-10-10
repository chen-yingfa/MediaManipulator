
// Enums for hotkey functionalities
const fns = {
    CHANGE_SPEED: {
        val: 0,
        name: "Change Speed",
    },
    CHANGE_TIME:  {
        val: 1,
        name: "Change Time",
    },
    CHANGE_SPEED_ABS:  {
        val: 2,
        name: "Set Speed",
    },
    CHANGE_TIME_ABS:  {
        val: 3,
        name: "Set Time",
    },
    TOGGLE_VISIBILITY: {
        val: 4,
        name: "Toggle Panel Visibility",
    },
}

// Store all settings that are editable by the user. Will be stored in
// chrome.storage.
let settings = {
    // Default values, will be overridden by chrome.storage is possible
    enabled: true,
    maxSpeed: 16,
    rememberSpeed: false,
    panelOpacity: 0.3,
    hidePanelByDefault: false,
    hotkeys: {
        's': {
            fn: fns.CHANGE_SPEED,
            val: 0.1,
        },
        'a': {
            fn: fns.CHANGE_SPEED,
            val: -0.1,
        },
        'c': { // Reset to normal speed
            fn: fns.CHANGE_SPEED_ABS,
            val: 1,
        },
        'x': {
            fn: fns.CHANGE_TIME,
            val: 2,
        },
        'z': {
            fn: fns.CHANGE_TIME,
            val: -2,
        },
        '.': {
            fn: fns.CHANGE_TIME,
            val: 0.03,
        },
        ',': {
            fn: fns.CHANGE_TIME,
            val: -0.03,
        },
        '\'': {
            fn: fns.CHANGE_TIME,
            val: 10,
        },
        ';': {
            fn: fns.CHANGE_TIME,
            val: -10,
        },
        'v': {
            fn: fns.TOGGLE_VISIBILITY,
        }
    }
}

// panel params
let panelOffsetHor = 6
let panelOffsetVer = 6

let panel = null
let speedText = null
let player = null

/**
 * Log levels: (less to more)
 * 1: error
 * 2: info
 * 3: debug
 */
const LOG_LEVEL = 0
function error(...x) {
    if (LOG_LEVEL < 1) return
    console.log(...x)
}

function info(...x) {
    if (LOG_LEVEL < 2) return
    console.log(...x)
}

function debug(...x) {
    if (LOG_LEVEL < 3) return
    console.log(...x)
}

function createPanel() {
    /**
     * Create the panel on the top left corner of the video, for showing
     * current playback rate.
     */
    info("Creating panel for showing playback rate")
    
    let playerRect = player.getBoundingClientRect()
    panel = document.createElement("div")
    panel.id = "media-manipulator-panel"
    // panel.style.top = `${playerRect.top + panelOffsetVer}px`
    // panel.style.left = `${playerRect.left + panelOffsetHor}px`
    panel.style.background = `rgba(0, 0, 0, ${settings.panelOpacity})`
    
    // add text
    speedText = document.createElement("p")
    speedText.textContent = "1.00"
    
    panel.appendChild(speedText)
    document.body.appendChild(panel)

    // Make the panel draggable
    function makeDragable(elem) {
        let finalX = 0, finalY = 0
        let origX = 0, origY = 0
        elem.onmousedown = onMouseDown;

        function onMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            origX = e.clientX;
            origY = e.clientY;
            document.onmouseup = onMouseUp;
            // call a function whenever the cursor moves:
            document.onmousemove = onMouseMove;
        }

        function onMouseMove(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            finalX = origX - e.clientX;
            finalY = origY - e.clientY;
            origX = e.clientX;
            origY = e.clientY;
            // set the element's new position:
            elem.style.top = (elem.offsetTop - finalY) + "px";
            elem.style.left = (elem.offsetLeft - finalX) + "px";
        }

        function onMouseUp() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    makeDragable(panel)

    updatePanel()
    window.onresize = updatePanel  // Reposition panel when window is resized
}

function destroyPanel() {
    // Remove panel if it exists
    if (!panel) return

    info('Destroying panel')
    document.body.removeChild(panel)
    panel = null
}

function getPlayer() {
    /**
     * @abstract: Returns HTML element that holds the video.
     * 
     * @description: Generally, just get the "video" tag. But we need to
     * support different HTML document structures.
     */

    
    // For Bilibili
    if (window.location.hostname.includes("bilibili.com")) {
        info("Searching for Bilibili player")
        if (window.dashPlayer != null) {
            info("Found Bilibili player")
            return window.dashPlayer.video
        }
        info("Did not find Bilibili player")
    }

    // Other websites
    let _player = document.querySelector("video")
    if (_player) return _player
    info("did not find video tag")

    error("Could not find player")
    return null
}

function updatePanel() {
    // Update panel text and position
    if (!player || !panel) {
        destroyPanel()
        return
    }
    let playerRect = player.getBoundingClientRect()
    panel.style.top = `${playerRect.top + panelOffsetVer}px`
    panel.style.left = `${playerRect.left + panelOffsetHor}px`
    speedText.textContent = player.playbackRate.toFixed(2).toString()
}


function changeSpeed(amount) {
    debug("change speed " + amount.toString())
    debug(player)
    debug(player.playbackRate)
    let newSpeed = player.playbackRate + amount
    if (newSpeed < 0.1) newSpeed = 0.1
    else if (newSpeed > settings.maxSpeed) newSpeed = settings.maxSpeed
    player.playbackRate = newSpeed
    updatePanel()
}

function changeSpeedAbs(speed) {
    player.playbackRate = speed
    updatePanel()
}

function changeTime(amount) {
    player.currentTime += amount
}

function changeTimeAbs(time) {
    player.currentTime = time
}

function togglePanelVisibility() {
    if (panel.style.visibility == "visible") 
    panel.style.visibility = "hidden"
    else {
        panel.style.visibility = "visible"
    }
}

function isInputElement(elem) {
    // Return whether element is an input element
    let tag = elem.tagName.toLowerCase()
    if (tag == "textarea") return true
    else if (tag == "input" && elem.getAttribute("type") == "text") {
        return true
    }
    return false
}

window.addEventListener('keydown', function(event) {
    /**
     * Every hotkey is handled by this event listener.
     */

    // Ignore hotkey if extension is disabled, or no player is found.
    if (!settings.enabled) return
    player = getPlayer()
    if (!player) return
    if (!panel) {
        createPanel()
    }

    // Block hotkeys when user is inputting
    if (isInputElement(event.target)) {
        debug("Keydown on input element")
        return
    }

    if (event.key in settings.hotkeys) {
        debug("pressed " + event.key)
        let act = settings.hotkeys[event.key]
        let fn = act.fn
        // Call corresponding function
        if (fn == fns.CHANGE_TIME) {
            changeTime(act.val)
        } else if (fn == fns.CHANGE_SPEED) {
            changeSpeed(act.val)
        } else if (fn == fns.CHANGE_TIME_ABS) {
            changeTimeAbs(act.val)
        } else if (fn == fns.CHANGE_SPEED_ABS) {
            changeSpeedAbs(act.val)
        } else if (fn == fns.TOGGLE_VISIBILITY) {
            togglePanelVisibility()
        } else {
            error("Error handling hotkey")
        }
    }
})

function fetchSettings() {
    /**
     * Fetch settings from content script. Settings should be set by
     * the options or popup page.
     */
    info("controller.js fetching settings from contentscript.js")
    let data = {type: "MM_fetchSettings"}
    window.postMessage(data, "*")
}

function onLoad() {
    info("Calling onLoad()")
    if (window.location.hostname.includes("bilibili.com")) {
        localStorage.setItem("bwphevc_supported", "\{\}")
    }
    debug("Initting Media Manipulator")
    player = getPlayer()
    if (player) {
        createPanel()
        debug("Created panel")
    } else {
        destroyPanel()
        debug('Destroyed panel')
    }

    info("Init event listener for settings update")
    fetchSettings()
}

function onMutation() {
    // If player is invalid after mutation, destroy it
    player = getPlayer()

    if (!player) {
        destroyPanel()
        return
    }
    const rect = player.getBoundingClientRect()
    if (rect.width == 0 && rect.height == 0) {
        destroyPanel()
        return
    }

    // Player is valid, update it's position
    if (!panel) {
        createPanel()
    }
    updatePanel()
}

// A small delay to make sure page is loaded
window.setTimeout(() => {
    onLoad()
}, 20)

window.addEventListener("message", (event) => {
    // Listen to message from content script


    debug("controller.js got message event:", event)
    // We only accept messages from ourselves
    if (event.source != window) {
        return;
    }

    if (event.data.type && (event.data.type == "MM_onSettingsUpdate")) {
        debug("Content script received:", event.data);

        // Update variables in settings
        let dataType = event.data.data.type
        let data = event.data.data.content
        settings.enabled = data.enabled;

        info("Updated settings:", settings)

        if (settings.enabled) {
            // If just enabled, create panel
            player = getPlayer()
            if (player) {
                if (!panel) {
                    createPanel()
                }
            } else {
                destroyPanel()
            }
        } else {
            // If just disabled, remove panel
            if (panel) {
                panel.parentNode.removeChild(panel)
                panel = null
            }
        } 
    }
}, false);

// Listen to DOM changes
function addMutationObserver() {

    // Options for the observer (which mutations to observe)
    const mutationObserverConfig = {
        attributes: true,
        childList: true,
        subtree: true
    }
        
    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if (mutation.target.tagName == 'video') {
                    info("MutationObserver observed an addition of a video element")
                    onLoad()
                }
            }
        }
        // info('Mutation observed')
        onMutation()
    }
    
    // Create an observer instance linked to the callback function
    const mutationObserver = new MutationObserver(callback)
    
    // Start observing the target node for configured mutations
    mutationObserver.observe(document.body, mutationObserverConfig)
}

addMutationObserver()