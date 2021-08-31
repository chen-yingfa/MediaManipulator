
const fns = {
    CHANGE_SPEED: 0,
    CHANGE_TIME: 1,
    CHANGE_SPEED_ABS: 2,
    CHANGE_TIME_ABS: 3,
    TOGGLE_VISIBILITY: 4,
}

// panel params
let panelOffsetHor = 6
let panelOffsetVer = 6

let maxSpeed = 16

let hotkeys = {
    's': {
        fn: fns.CHANGE_SPEED,
        val: 0.1,
    },
    'a': {
        fn: fns.CHANGE_SPEED,
        val: -0.1,
    },
    'c': {
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
function error(x) {
    if (LOG_LEVEL < 1) return
    console.log(x)
}

function info(x) {
    if (LOG_LEVEL < 2) return
    console.log(x)
}

function debug(x) {
    if (LOG_LEVEL < 3) return
    console.log(x)
}

function createPanel() {
    info("Creating panel for Video Controls")
    
    let playerRect = player.getBoundingClientRect()
    panel = document.createElement("div")
    panel.id = "media-manipulator-panel"
    panel.style.top = `${playerRect.top + panelOffsetVer}px`
    panel.style.left = `${playerRect.left + panelOffsetHor}px`
    
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

    window.onresize = updatePanel
}

function getPlayer() {
    /**
     * @abstract: Returns HTML element that holds the video.
     * 
     * @description: Generally, just get the "video" tag. But we need to
     * support different HTML document structures.
     */
    let player = document.querySelector("video")
    if (player) return player
    info("did not find video tag")

    function getBilibiliPlayer() {
        info("Checking Bilibili player")
        let = player = document.querySelector("bwp-video")
        if (player) return player
        info("did not find bwp-video tag")
        let iframe = document.querySelector("iframe.b-help-player")
        if (iframe) {
            player = iframe.contentWindow.document.querySelector("video")
            if (player) return player
            player = iframe.contentWindow.document.querySelector("bwp-video")
            if (player) return player
        }
        info("Did not find Bilibili player")
    }

    player = getBilibiliPlayer()
    if (player) return player

    error("Could not find player")
    return null
}

function updatePanel() {
    // let playerRect = player.getBoundingClientRect()
    // panel.style.top = `${playerRect.top + panelOffsetVer}px`
    // panel.style.left = `${playerRect.left + panelOffsetHor}px`
    speedText.textContent = player.playbackRate.toFixed(2).toString()
}


function changeSpeed(amount) {
    debug("change speed " + amount.toString())
    debug(player)
    debug(player.playbackRate)
    let newSpeed = player.playbackRate + amount
    if (newSpeed < 0.1) newSpeed = 0.1
    else if (newSpeed > maxSpeed) newSpeed = maxSpeed
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

window.addEventListener('keydown', function(event) {
    player = getPlayer()
    if (!player) return
    if (!panel) {
        createPanel()
    }

    if (event.key in hotkeys) {
        debug("pressed " + event.key)
        let act = hotkeys[event.key]
        let fn = act.fn
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

function onLoad() {
    if (window.location.hostname.includes("bilibili.com")) {
        localStorage.setItem("bwphevc_supported", "\{\}")
    }
    debug("Initting Media Manipulator")
    player = getPlayer()
    if (player) {
        createPanel()
    }
    debug("Create panel")
    window.onresize = updatePanel
    // setInterval(() => {
    //     update()
    // }, 100)
}

function update() {
    // updatePanel()
}

debug("Calling onLoad()")
window.setTimeout(() => {
    onLoad()
}, 20)