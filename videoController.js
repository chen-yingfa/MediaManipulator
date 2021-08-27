// ==UserScript==
// @name        Video Controller
// @namespace   github.com/donny-chan/VideoController
// @version     0.1
// @description Add hotkeys for controlling time and speed of HTML5 videos
// @author      Donny Chan
// @match       *://*/*
// ==/UserScript==

(function() {
    'use strict'
    const fns = {
        CHANGE_SPEED: 0,
        CHANGE_TIME: 1,
        CHANGE_SPEED_ABS: 2,
        CHANGE_TIME_ABS: 3,
        TOGGLE_VISIBILITY: 4,
    }

    // panel params
    let fontSize = 12
    let panelHeight = 14
    let panelWidth = 30
    let panelBorderRadius = 6
    let panelOffsetHor = 6
    let panelOffsetVer = 6
    let panelBgColor = "rgba(0, 0, 0, .3)"
    let panelTextColor = "rgba(255, 255, 255, .5)"
    let panelPadding = 4

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
            val: 20,
        },
        ';': {
            fn: fns.CHANGE_TIME,
            val: -20,
        },
        'v': {
            fn: fns.TOGGLE_VISIBILITY,
        }
    }

    let panel = null;
    let speedText = null;
    let player = null;

    function createPanel() {
        console.log("Creating panel for Video Controls")

        let playerRect = player.getBoundingClientRect()
        panel = document.createElement("div")
        panel.id = "video-controls-panel"
        panel.style.position = "absolute";
        panel.style.height = `${panelHeight}px`
        panel.style.width = `${panelWidth}px`
        // panel.style.zIndex = "-10"
        panel.style.backgroundColor = panelBgColor
        panel.style.top = `${playerRect.top + panelOffsetVer}px`
        panel.style.left = `${playerRect.left + panelOffsetHor}px`
        panel.style.visibility = "visible"
        panel.style.padding = `${panelPadding}px`
        panel.style.borderRadius = `${panelBorderRadius}px`
        panel.style.display = "flex"
        panel.style.alignItems = "center"
        
        // add text
        speedText = document.createElement("p")
        speedText.textContent = "1.00"
        speedText.style.width = "100%"
        speedText.style.height = "100%"
        speedText.style.fontSize = `${fontSize}px`
        speedText.style.lineHeight = `${panelHeight}px`
        speedText.style.verticalAlign = "middle"
        speedText.style.textAlign = "center"
        speedText.style.color = panelTextColor
        speedText.style.fontFamily = "Courier New"
        speedText.style.fontStyle = "bold"

        panel.appendChild(speedText)
        document.body.appendChild(panel)
    }

    function getPlayer() {
        let player = document.querySelector("video")
        if (player) return player
        console.log("did not find video tag")
        player = document.querySelector("bwp-video")
        if (player) return player
        console.log("did not find bwp-video tag")
        let iframe = document.querySelector("iframe.b-help-player")
        player = iframe.contentWindow.document.querySelector("video")
        if (player) return player
        player = iframe.contentWindow.document.querySelector("bwp-video")
        if (player) return player

        console.error("Could not find player")
    }
    
    function updatePanel() {
        speedText.textContent = player.playbackRate.toFixed(2).toString();
    }
    

    function changeSpeed(amount) {
        let newSpeed = player.playbackRate + amount;
        if (newSpeed < 0.1) newSpeed = 0.1
        else if (newSpeed > 10) newSpeed = 10
        player.playbackRate = newSpeed;
        // console.log("playing in %sx", (newSpeed).toFixed(2));
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

    window.addEventListener('keypress', function(event) {
        if (event.key in hotkeys) {
            console.log("pressed " + event.key)
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
                console.error("Error handling hotkey")
            }
        }
    });

    function onLoad() {
        console.log("Initting Video Controls")
        player = getPlayer()
        createPanel()
        console.log("Created panel")
        window.onresize = updatePanel
    }

    onLoad()

})();
