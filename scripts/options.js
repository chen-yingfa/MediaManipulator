// var regStrip = /^[\r\t\f\v ]+|[\r\t\f\v ]+$/gm;

// Enums for hotkey functionalities
const fns = {
    CHANGE_SPEED: 0,
    CHANGE_TIME: 1,
    CHANGE_SPEED_ABS: 2,
    CHANGE_TIME_ABS: 3,
    TOGGLE_VISIBILITY: 4,
    RESET_SPEED: 5,
}

let settings = {
    // Default values, will be overridden by chrome.storage if possible
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
};

var keyBindings = [];

var keyCodeAliases = {
    0: "null",
    null: "null",
    undefined: "null",
    32: "Space",
    37: "Left",
    38: "Up",
    39: "Right",
    40: "Down",
    96: "Num 0",
    97: "Num 1",
    98: "Num 2",
    99: "Num 3",
    100: "Num 4",
    101: "Num 5",
    102: "Num 6",
    103: "Num 7",
    104: "Num 8",
    105: "Num 9",
    106: "Num *",
    107: "Num +",
    109: "Num -",
    110: "Num .",
    111: "Num /",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    186: ";",
    188: "<",
    189: "-",
    187: "+",
    190: ">",
    191: "/",
    192: "~",
    219: "[",
    220: "\\",
    221: "]",
    222: "'"
};

function recordKeyPress(e) {
    if ((e.keyCode >= 48 && e.keyCode <= 57) || // Numbers 0-9
    (e.keyCode >= 65 && e.keyCode <= 90) || // Letters A-Z
    keyCodeAliases[e.keyCode] // Other character keys
    ) {
        e.target.value =
        keyCodeAliases[e.keyCode] || String.fromCharCode(e.keyCode);
        e.target.keyCode = e.keyCode;
        
        e.preventDefault();
        e.stopPropagation();
    } else if (e.keyCode === 8) {
        // Clear input when backspace pressed
        e.target.value = "";
    } else if (e.keyCode === 27) {
        // When esc clicked, clear input
        e.target.value = "null";
        e.target.keyCode = null;
    }
}


function fnToName(fnVal) {
    if (fnVal == fns.CHANGE_SPEED) return "Change Speed"
    if (fnVal == fns.CHANGE_SPEED_ABS) return "Set Speed"
    if (fnVal == fns.CHANGE_TIME) return "Change Time"
    if (fnVal == fns.CHANGE_TIME_ABS) return "Set Time"
    if (fnVal == fns.TOGGLE_VISIBILITY) return "Toggle Panel Visibility"
    if (fnVal == fns.RESET_SPEED) return "Reset Speed"
    
    console.error("Invalid fnVal")
}

function inputFilterNumbersOnly(e) {
    var char = String.fromCharCode(e.keyCode);
    if (!/[\d\.]$/.test(char) || !/^\d+(\.\d*)?$/.test(e.target.value + char)) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function inputFocus(e) {
    e.target.value = "";
}

function inputBlur(e) {
    e.target.value =
    keyCodeAliases[e.target.keyCode] || String.fromCharCode(e.target.keyCode);
}

function updateShortcutInputText(inputId, keyCode) {
    document.getElementById(inputId).value =
    keyCodeAliases[keyCode] || String.fromCharCode(keyCode);
    document.getElementById(inputId).keyCode = keyCode;
}

function updateCustomShortcutInputText(inputItem, keyCode) {
    inputItem.value = keyCodeAliases[keyCode] || String.fromCharCode(keyCode);
    inputItem.keyCode = keyCode;
}

// List of hotkeys for which there is no value to be set
var noValFns = [fns.TOGGLE_VISIBILITY, fns.RESET_SPEED];

function createEmptyHotkeyDiv() {
    // Create an empty hotkey div (where options are still not set by user)
    var html = `
    <select class="hotkey-fn-select">`
    for (const [key, val] of Object.entries(fns)) {
        html += `<option value="${val}">${fnToName(val)}</option>`
    }
    html += `
    </select>
    <input class="hotkey-value-input" type="text" placeholder="ex: -0.1"/>
    <button class="hotkey-key-button">Press a key</button>`
    
    let hotkeyDiv = document.createElement("div")
    hotkeyDiv.setAttribute("class", "hotkey-row")
    hotkeyDiv.innerHTML = html
    return hotkeyDiv
}

function setHotkeyDivFn(hotkeyDiv, fn) {
    hotkeyDiv.children[0].value = fn
    if (noValFns.includes(fn)) {
        hotkeyDiv.children[1].style.visibility = "hidden"
    } else {
        hotkeyDiv.children[1].style.visibility = "visible"
    }
}

function createHotkeyDiv(key, val, fn) {
    /**
    * @param: 
    *  key: the key to press, eg: 'a'
    *  val: value
    *  fn: functionality of hotkey (the constant value)
    */
    
    // Create empty hotkey div, then fill in key, val and fn
    let hotkeyDiv = createEmptyHotkeyDiv()
    setHotkeyDivFn(hotkeyDiv, fn)
    hotkeyDiv.children[1].value = val
    hotkeyDiv.children[2].textContent = key.toUpperCase()
    return hotkeyDiv
}

function genHotkeyDivs(hotkeys) {
    // Create hotkey div for each hotkey in settings, and add them to 
    // hotkey list div for displaying in document.
    let hotkeyList = document.getElementById("hotkey-list")
    console.log(hotkeyList)
    for (const [key, options] of Object.entries(settings.hotkeys)) {
        let hotkeyDiv = createHotkeyDiv(key, options.val, options.fn)
        console.log(hotkeyList)
        hotkeyList.appendChild(hotkeyDiv)
    }
}

genHotkeyDivs(settings.hotkeys)


function createKeyBindings(item) {
    const action = item.querySelector(".customDo").value;
    const key = item.querySelector(".customKey").keyCode;
    const value = Number(item.querySelector(".customValue").value);
    const force = item.querySelector(".customForce").value;
    const predefined = !!item.id; //item.id ? true : false;
    
    keyBindings.push({
        action: action,
        key: key,
        value: value,
        force: force,
        predefined: predefined
    });
}

function validate() {
    // Return whether current settings are valid
    var valid = true;
    console.error("Validate() not implemented")
    return valid;
}



document.getElementById("hide-panel-by-default").onclick = (event) => {
    settings.hidePanelByDefault = event.target.checked
}

document.getElementById("remember-playback-speed").onclick = (event) => {
    settings.rememberSpeed = event.target.checked
}