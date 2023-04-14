// this background code defines the logic for the popup and injects our scripts

// object specs for generating UI for option config and adding new characters
const optionsInfo = {
  type: 'options',
  extractionKeys: ['frequency', 'speed', 'size', 'max', 'distance', 'random', 'replace'],
  localStorageKey: 'options',
  innerForm: 'innerOptions',
  otherToggle: 'addCharToggle',
  expanded: false,
}
const addCharInfo = {
  type: 'chars',
  extractionKeys: ['icon', 'dead', 'type', 'angle'],
  localStorageKey: 'chars',
  innerForm: 'innerAddChar',
  otherToggle: 'optionsToggle',
  expanded: false,
}

class TabController {
  constructor() {
    this.displayed = '';
    this.tablist = ['infest', 'configure'];
  }

  displayInfest() {
    this.setTabContent('infest', 'configure');
  }

  displayConfigure() {
    this.setTabContent('configure', 'infest');
  }

  setTabContent(display, hide) {
    if (!this.tablist.includes(display) || !this.tablist.includes(hide)) return;
    if (display == this.displayed) return;

    this.displayed = display;
    let tabToDisplay = document.getElementById(display);
    let tabToHide = document.getElementById(hide);
    tabToDisplay.style.display = 'inherit';
    tabToHide.style.display = 'none';
  }
}

class InfestationLifecycle {
  constructor() {
    this.state = {
      options: null,
      ready: false,
      infest: false,
      frozen: false,
      waves: 0,
      character: null,
    }
  }

  infest(character) {
    this.state.character = character
    console.log('INFEST');
  }

  freeze() {
    console.log('FREEZE');
  }

  clear() {
    this.state.infest = false;
    print(this.state)
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      var activeTab = tabs[0];
      let req = {
        "message": "update_state",
      };
      chrome.tabs.sendMessage(activeTab.id, {...this.state, ...req});
    });

    // ALSO DO UI CHANGES
  }
}


let tabController = new TabController();
let lifecycle = new InfestationLifecycle();

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
    'src/transformations.js',
    'src/scrapewords.js',
    'src/infestation_agent.js',
    'src/main.js'
  ];
  chrome.scripting.executeScript({
    target : injection_target,
    files : script_local_paths,
  })
  console.log("All scripts injected!");
}

const getExtensionExecutionLocation = () => {
  return String(window.location.href).split(String(window.location.pathname))[0];
}

const retrieveCharacters = () => {
  let characters = JSON.parse(localStorage.getItem('chars'));
  let extensionExecutionLocation = getExtensionExecutionLocation();
  console.log('ABCDEF');
  console.log(extensionExecutionLocation);
  Object.values(characters).forEach((character) => {
    character.icon = String(character.icon).replace('SWAP_ME', extensionExecutionLocation);
    character.dead = String(character.dead).replace('SWAP_ME', extensionExecutionLocation);
    character.cursor = String(character.cursor).replace('SWAP_ME', extensionExecutionLocation);
  });
  return characters;
}


// tells main.js to change the character, restart infestation
function chooseChar(e, lifecycle) {

  // choosing character does nothing if scripts aren't ready
  if (!lifecycle.state.ready || !localStorage.getItem('chars') || !localStorage.getItem('options')) return;

  lifecycle.state.infest = true;
  lifecycle.state.character = e.target.className;
  lifecycle.state.waves++;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    let req = {
      "message": "infest",
      "chars": retrieveCharacters(),
      "options": JSON.parse(localStorage.getItem('options'))
    };
    chrome.tabs.sendMessage(activeTab.id, {...lifecycle.state, ...req});
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

  const chars = retrieveCharacters();
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
    charImg.setAttribute('src', characterInfo.icon);
    charImg.style.height = 'auto';
    charImg.style.width = '55px';
    insertDelete(character, charDiv);
    charDiv.appendChild(charImg);
    charDiv.addEventListener('click', (e) => chooseChar(e, lifecycle));
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
    if( request.message === "ready_to_infest" ) {
      lifecycle.state.ready = true;
    }
  }
);

// adds click listener to each character div
document.addEventListener('DOMContentLoaded', async function () {

  // keeps us in sync with injected scripts
  injectController().then(() => console.log("injected controller scripts"));

  tabController.displayInfest();
  document.getElementById('infest-tab').addEventListener('click', () => tabController.displayInfest());
  document.getElementById('configure-tab').addEventListener('click', () => tabController.displayConfigure());

  document.getElementById('clear-button').addEventListener('click', () => lifecycle.clear());
  document.getElementById('freeze-button').addEventListener('click', () => console.log('FREEZE'));

  document.getElementById('optionsToggle').addEventListener('click', () => {toggle(optionsInfo)});
  document.getElementById('addCharToggle').addEventListener('click', () => {toggle(addCharInfo)});

  document.getElementById('submitOptions').addEventListener('click', changeOptions);
  document.getElementById('submitAddChar').addEventListener('click', addChar);

  ['change', 'paste', 'keyup', 'keydown', 'mouseup'].forEach((myEvent) => {
      document.getElementById('iconInput').addEventListener(myEvent, () => {syncPreview('iconInput')});
      document.getElementById('deadInput').addEventListener(myEvent, () => {syncPreview('deadInput')});
  })

  // if (!localStorage.getItem('options')) retrieveOptions();
  // if (!localStorage.getItem('chars')) {
  //   retrieveChars();
  // } else {
  //   buildCharList();
  // }

  // always load from source for now...
  retrieveOptions();
  retrieveChars();

});
