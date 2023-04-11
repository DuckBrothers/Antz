// this background code defines the logic for the popup and injects our scripts

// keeps track of which character we want to infect the page
var clickedChar = "ant";

// keeps track of whether scripts have been injected
var ready = false;

var optionsInfo = {
  type: 'options',
  extractionKeys: ['frequency', 'speed', 'size', 'max', 'distance', 'random', 'replace'],
  localStorageKey: 'options',
  innerForm: 'innerOptions',
  otherToggle: 'addCharToggle',
  expanded: false,
}

var addCharInfo = {
  type: 'chars',
  extractionKeys: ['icon', 'dead', 'type', 'angle'],
  localStorageKey: 'chars',
  innerForm: 'innerAddChar',
  otherToggle: 'optionsToggle',
  expanded: false,
}

async function getTabId() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}

// called when popup loads, sends out initial script to determine if our program has already been sent down
async function injectController() {
  await chrome.scripting.executeScript({
    target : {tabId : await getTabId(), allFrames : true},
    files : [ "./src/controller.js" ],
  })
  console.log("Controller injected!");
}

// injects all our scripts - only called the first time popup loads per page
async function injectScripts() {
  let injection_target = { tabId : await getTabId(), allFrames : true };

  let script_local_paths = [
    'jquery-3.3.1.min.js',
    './src/rotate.js',
    './src/scrapewords.js',
    './src/main.js'
  ];
  chrome.scripting.executeScript({
    target : injection_target,
    files : script_local_paths,
  })
  console.log("All scripts injected!");

  let css_local_paths = ['./src/styles.css'];
  chrome.scripting.insertCSS({
    target : injection_target,
    files : css_local_paths,
  })
  console.log("CSS injected!");
}


// tells main.js to change the character, restart infection
function chooseChar(e) {

  // choosing character does nothing if scripts aren't ready
  if (!ready || !localStorage.getItem('chars') || !localStorage.getItem('options')) return;

  clickedChar = e.target.className;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    let req = {
      "message": "update_char",
      "newChar": clickedChar,
      "chars": JSON.parse(localStorage.getItem('chars')),
      "options": JSON.parse(localStorage.getItem('options'))
    }
    chrome.tabs.sendMessage(activeTab.id, req);
  });
}

function retrieveChars() {
  fetch('./src/characters.json')
  .then(response => response.json())
  .then(res => {
    // chars = res;
    localStorage.setItem('chars', JSON.stringify(res));
    buildCharList();
    console.log('wrote to local chars');
  });
}

function retrieveOptions() {
  fetch('./src/options.json')
  .then(response => response.json())
  .then(res => {
    // options = res;
    localStorage.setItem('options', JSON.stringify(res));
    console.log('wrote to local options');
  });
}

function syncPreview(urlType) {
  let urlInput = document.getElementById(urlType);
  let url = urlInput.value || urlInput.getAttribute('placeholder');
  document.getElementById(`${urlType}Preview`).setAttribute('src', url);
}


function toggle(info) {
  if (info.expanded) {
    let innerForm = document.getElementById(info.innerForm)
    innerForm.style.display = 'none';
    document.getElementById(info.otherToggle).style.display = 'inline';
    info.expanded = false;
    return;
  }

  if (!localStorage.getItem(info.localStorageKey)) return;

  if (info.type === 'options') {
    let curr = JSON.parse(localStorage.getItem(info.type));
    let currKeys = Object.keys(curr);
    for (let key of currKeys) {
      let elem = document.getElementById(`${key}Input`);
      if (elem) {
        elem.setAttribute('placeholder', curr[key].toString());
        if (key === 'replace' || key === 'random') {elem.checked = curr[key];}
      }
    }
  }

  let innerForm = document.getElementById(info.innerForm)
  innerForm.style.display = 'inline';
  document.getElementById(info.otherToggle).style.display = 'none';
  info.expanded = true;
}


function changeOptions() {
  let extracted = extractFormData(optionsInfo);
  localStorage.setItem('options', JSON.stringify(extracted));
  toggle(optionsInfo);
}

function addChar() {
  let extracted = extractFormData(addCharInfo);
  console.log(extracted);
  let currChars = JSON.parse(localStorage.getItem('chars'));
  if (currChars[extracted.type]) return;
  extracted.popup = extracted.icon;
  extracted.words = [];
  extracted.wordOffset = 0;
  extracted.wordCutoff = 0;
  currChars[extracted.type] = extracted;
  localStorage.setItem('chars', JSON.stringify(currChars));
  toggle(addCharInfo);
  buildCharList();
}

function extractFormData(info) {
  let extractedData = {};
  for (let eKey of info.extractionKeys) {
    let elem = document.getElementById(`${eKey}Input`);
    if (elem) {
      if (eKey === 'replace' || eKey === 'random') {extractedData[eKey] = elem.checked;}
      else if (eKey === 'icon' || eKey === 'dead') {extractedData[eKey] = elem.value || elem.getAttribute('placeholder');}
      else if (eKey === 'type') {extractedData[eKey] = (elem.value || elem.getAttribute('placeholder')).replace(/\W/g, '');}
      else {extractedData[eKey] = parseInt(elem.value || elem.getAttribute('placeholder'));};
    }
  }
  return extractedData;
}

function buildCharList() {
  const charContainer = document.getElementById('characters');
  while (charContainer.firstChild) {
    charContainer.removeChild(charContainer.firstChild);
}

  const chars = JSON.parse(localStorage.getItem('chars'));
  if (!chars) return;
  const charList = Object.keys(chars);
  for (let i = 0; i < charList.length; i ++) {
    let character = charList[i];
    let characterInfo = chars[character];
    let charDiv = document.createElement('div');
    charDiv.setAttribute('id', character);
    charDiv.setAttribute('class', 'characterWrapper')
    let charImg = document.createElement('img');
    charImg.setAttribute('class', 'character');
    charImg.setAttribute('class', character);
    charImg.setAttribute('src', characterInfo.popup);
    charImg.style.height = 'auto';
    charImg.style.width = '55px';
    insertDelete(character, charDiv);
    charDiv.appendChild(charImg);
    charDiv.addEventListener('click', chooseChar);
    charContainer.appendChild(charDiv);
  }
}

function insertDelete(character, charDiv) {
  let del = document.createElement('input');
  del.type = 'button';
  del.value = 'X';
  del.setAttribute('class', 'delButton');
  del.addEventListener('click', (ev) => {
    let currChars = JSON.parse(localStorage.getItem('chars'));
    delete currChars[character];
    localStorage.setItem('chars', JSON.stringify(currChars));
    ev.stopPropagation();
    buildCharList();
  })
  charDiv.appendChild(del);
}

// adds click listener to each character div
document.addEventListener('DOMContentLoaded', function () {

  // keeps us in sync with injected scripts
  injectController().then(() => console.log("injected controller scripts"));
  document.getElementById('optionsToggle').addEventListener('click', () => {toggle(optionsInfo)});
  document.getElementById('addCharToggle').addEventListener('click', () => {toggle(addCharInfo)});

  document.getElementById('submitOptions').addEventListener('click', changeOptions);
  document.getElementById('submitAddChar').addEventListener('click', addChar);

  ['change', 'paste', 'keyup', 'keydown', 'mouseup'].forEach((myEvent) => {
      document.getElementById('iconInput').addEventListener(myEvent, () => {syncPreview('iconInput')});
      document.getElementById('deadInput').addEventListener(myEvent, () => {syncPreview('deadInput')});
  })

  if (!localStorage.getItem('options')) retrieveOptions();

  if (!localStorage.getItem('chars')) {retrieveChars();}
  else {buildCharList();};

});


// listens for controller script to determine if scripts need to be injected
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "ready_to_inject" ) {
      injectScripts().then(() => console.log("injected follow-up scripts"));
    }
  }
);

// waits for  scripts to be ready, changes state variable here so that new characters can be injected
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "ready_to_infect" ) {
      ready = true;
    }
  }
);
