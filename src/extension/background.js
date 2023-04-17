/**
This background code defines the logic for the popup and injects our scripts
*/

// object specs for generating UI for option config and adding new characters
const optionsInfo = {
  type: 'options',
  extractionKeys: ['frequency', 'speed', 'size', 'killzone', 'wave', 'max', 'distance', 'words', 'hide', 'random', 'replace', 'snap'],
  localStorageKey: 'options',
  innerForm: 'innerOptions',
  otherToggle: 'addCharToggle',
  expanded: false,
}
const addCharInfo = {
  type: 'chars',
  extractionKeys: ['icon', 'dead', 'cursor', 'type', 'angle', 'rotate', 'reflect'],
  localStorageKey: 'chars',
  innerForm: 'innerAddChar',
  otherToggle: 'optionsToggle',
  expanded: false,
}

// stores state and logic related to which UI elements and text snippets should render
class UIController {
  constructor() {
    this.tab_content = '';
    this.tablist = ['infest', 'configure'];
    this.infestInstructions = '';
    this.configInstructions = '';
  }

  displayInfest() {
    this.displayTabContent('infest', 'configure');
    this.setInfestInstructions();
  }

  displayConfigure() {
    this.displayTabContent('configure', 'infest');
    this.setConfigInstructions();
  }

  setInfestInstructions(instructions) {
    if (instructions) this.infestInstructions = instructions;
    document.getElementById('instructions').innerHTML = this.infestInstructions;
  }

  specifyInfestInstructions(infest) {
    if (infest) return this.setInfestInstructions('Freeze or Clear infestation.<br><br>Or choose another Character to start a new wave!');
    this.setInfestInstructions('Choose a Character to start an infestation!<br><br>Or remove a Custom Character via right click.');
  }

  setConfigInstructions(instructions) {
    if (instructions) this.configInstructions = instructions;
    document.getElementById('instructions').innerHTML = this.configInstructions;
  }

  specifyOverallConfigInstructions() {
    this.setConfigInstructions('Add a new Custom Character - or select spawn and movement behavior options.');
  }

  specifyConfigTabInstructions(info) {
    if (info.type == 'chars') this.setConfigInstructions('Create a new Custom Character.<br><br>Images work best with transparent backgrounds & square dimensions.');
    if (info.type == 'options') this.setConfigInstructions('Specify movement behavior and character spawn options.<br><br>Changes take effect on next wave after Save!');
  }


  displayTabContent(display, hide) {
    if (!this.tablist.includes(display) || !this.tablist.includes(hide)) return;
    if (display == this.tab_content) return;

    this.tab_content = display;
    let tabToDisplay = document.getElementById(display);
    let tabToHide = document.getElementById(hide);
    tabToDisplay.style.display = 'inherit';
    tabToHide.style.display = 'none';
  }

  toggleClearButton(enable) {
    this.toggleInfestButton('clear-button', enable);
  }

  toggleFreezeButton(enable) {
    this.toggleInfestButton('freeze-button', enable);
  }

  toggleUnfreezeText(frozen) {
    let freezeText = frozen ? 'UNFREEZE' : 'FREEZE';
    document.getElementById('freeze-button').innerText = freezeText;
  }

  toggleInfestButton(button, enable) {
    let toggled = document.getElementById(button);
    let addClass = enable ? 'enabled-infest-button' : 'disabled-infest-button';
    let remClass = (!enable) ? 'enabled-infest-button' : 'disabled-infest-button';
    toggled.classList.remove(remClass);
    toggled.classList.add(addClass);
  }
}

class InfestationLifecycle {
  constructor() {
    this.state = {
      options: null,
      ready: false,
      infest: false,
      freeze: false,
      waves: 0,
      character: null,
    }
  }

  sync(ui) {
    ui.toggleClearButton(this.state.infest);
    ui.toggleFreezeButton(this.state.infest);
    ui.specifyOverallConfigInstructions();
    ui.specifyInfestInstructions(this.state.infest);
  }

  // tells main.js to change the character, restart infestation
  infest(e, ui) {
    // choosing character does nothing if scripts aren't ready
    if (!this.state.ready || !localStorage.getItem('chars') || !localStorage.getItem('options')) return;

    this.state.infest = true;
    this.state.freeze = false;
    this.state.character = e.target.className;
    this.state.waves++;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      let activeTab = tabs[0];
      let req = {
        "message": "infest",
        "chars": retrieveCharacters(),
        "options": JSON.parse(localStorage.getItem('options'))
      };
      chrome.tabs.sendMessage(activeTab.id, {...this.state, ...req});
    });

    ui.toggleClearButton(true);
    ui.toggleFreezeButton(true);
    ui.toggleUnfreezeText(this.state.freeze);
    ui.specifyInfestInstructions(this.state.infest);
  }

  freeze(ui) {
    if (!this.state.infest) return;
    this.state.freeze = !this.state.freeze;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      let activeTab = tabs[0];
      let req = {
        "message": "update_state",
        "chars": retrieveCharacters(),
        "options": JSON.parse(localStorage.getItem('options'))
      };
      chrome.tabs.sendMessage(activeTab.id, {...this.state, ...req});
    });

    ui.toggleUnfreezeText(this.state.freeze);
  }

  clear(ui) {
    if (!this.state.infest) return;
    this.state.infest = false;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      let activeTab = tabs[0];
      let req = {
        "message": "update_state",
        "chars": retrieveCharacters(),
        "options": JSON.parse(localStorage.getItem('options'))
      };
      chrome.tabs.sendMessage(activeTab.id, {...this.state, ...req});
    });

    ui.toggleClearButton(false);
    ui.toggleFreezeButton(false);
    ui.specifyInfestInstructions(this.state.infest);
  }
}


let ui = new UIController();
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
    target : {tabId : await getTabId(), allFrames : false},
    files : [ "src/injection/initializer.js" ],
  })
  console.log("Controller injected!");
}

// injects all our scripts - only called the first time popup loads per page
async function injectScripts() {
  let injection_target = { tabId : await getTabId(), allFrames : false };

  let script_local_paths = [
    'jquery-3.3.1.min.js',
    'src/injection/transformations.js',
    'src/injection/scrapewords.js',
    'src/injection/infestation_agent.js',
    'src/injection/main.js'
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

function retrieveChars(lifecycle, ui) {
  fetch('./data/characters.json')
  .then(response => response.json())
  .then(res => {
    // chars = res;
    localStorage.setItem('chars', JSON.stringify(res));
    buildCharList(lifecycle, ui);
    console.log('wrote to local chars');
  });
}

function retrieveOptions() {
  fetch('./data/options.json')
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

// TODO: add toggle and other configuration logic fully into UIController
function toggle(info, ui) {
  if (info.expanded) {
    let innerForm = document.getElementById(info.innerForm)
    innerForm.style.display = 'none';
    document.getElementById(info.otherToggle).style.display = 'inline';
    info.expanded = false;
    ui.specifyOverallConfigInstructions();
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
        if (key === 'replace' || key === 'random' || key === 'snap' || key === 'hide' || key === 'words' || key === 'rotate' || key === 'reflect') {elem.checked = curr[key];}
      }
    }
  }

  let innerForm = document.getElementById(info.innerForm)
  innerForm.style.display = 'inline';
  document.getElementById(info.otherToggle).style.display = 'none';
  info.expanded = true;
  ui.specifyConfigTabInstructions(info);
}


function changeOptions(lifecycle, ui) {
  let extracted = extractFormData(optionsInfo);
  lifecycle.state.options = extracted;
  localStorage.setItem('options', JSON.stringify(extracted));
  toggle(optionsInfo, ui);
}

function addChar(lifecycle, ui) {
  let extracted = processCustomCharacter(extractFormData(addCharInfo));
  console.log(`Received new Character specs: ${JSON.stringify(extracted)}`);
  let currChars = JSON.parse(localStorage.getItem('chars'));
  currChars[extracted.type] = extracted;
  localStorage.setItem('chars', JSON.stringify(currChars));
  toggle(addCharInfo, ui);
  buildCharList(lifecycle, ui);
}

function processCustomCharacter(specs) {
  let r = (Math.random() + 1).toString(36).substring(7); // random digits
  specs.type = `${specs.type}_${r}`;
  specs.words = ['', 'x', 'xx', 'x', 'x', 'x'];
  specs.wordOffset = 2;
  specs.wordCutoff = 3;
  specs.cursor = `url(${specs.cursor}), default`;
  return specs;
}

function extractFormData(info) {
  let extractedData = {};
  for (let eKey of info.extractionKeys) {
    let elem = document.getElementById(`${eKey}Input`);
    if (elem) {
      if (eKey === 'replace' || eKey === 'random' || eKey === 'snap' || eKey === 'hide' || eKey === 'words' || eKey === 'rotate' || eKey === 'reflect') {extractedData[eKey] = elem.checked;}
      else if (eKey === 'icon' || eKey === 'dead') {extractedData[eKey] = elem.value || elem.getAttribute('placeholder');}
      else if (eKey === 'type') {extractedData[eKey] = (elem.value || elem.getAttribute('placeholder')).replace(/\W/g, '');}
      else {extractedData[eKey] = parseInt(elem.value || elem.getAttribute('placeholder'));};
    }
  }
  return extractedData;
}

function buildCharList(lifecycle, ui) {
  const charContainer = document.getElementById('characters');
  while (charContainer.firstChild) {
    charContainer.removeChild(charContainer.firstChild);
  }

  const chars = retrieveCharacters(lifecycle);
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
    insertDelete(character, charDiv, lifecycle, ui);
    charDiv.appendChild(charImg);
    charDiv.addEventListener('click', (e) => lifecycle.infest(e, ui));
    charContainer.appendChild(charDiv);
  }
}

// inserts delete functionality (right click -> delete menu) for custom chars
function insertDelete(character, charDiv, lifecycle, ui) {
  // cannot delete default cast
  if (new Array('pikachu', 'bulba', 'squirtle', 'char', 'ant', 'ghost').includes(character)) return;
  let del = document.createElement('div');
  del.id = 'deleteMenu';

  let removeChar = document.createElement('input');
  removeChar.value = 'remove'
  let cancelChar = document.createElement('input');
  cancelChar.value = 'cancel';

  [removeChar, cancelChar].forEach((button) => {
    button.type = 'button';
    button.setAttribute('class', 'delButton');
  });

  charDiv.addEventListener("contextmenu",function(event){
      console.log("Say hello!");
      event.preventDefault();
      del.style.display = "flex";
  },false);

  removeChar.addEventListener('click', (ev) => {
    let currChars = JSON.parse(localStorage.getItem('chars'));
    delete currChars[character];
    localStorage.setItem('chars', JSON.stringify(currChars));
    ev.stopPropagation();
    buildCharList(lifecycle, ui);
  })

  cancelChar.addEventListener('click', (ev) => {
    ev.stopPropagation();
    del.style.display = "none";
  })

  charDiv.appendChild(del);
  del.appendChild(removeChar);
  del.appendChild(cancelChar);
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
      // pulls in state from injected scripts to sync with popup state
      Object.keys(lifecycle.state).forEach((key) => {
        if (key in request.state) lifecycle.state[key] = request.state[key]
      });
      lifecycle.sync(ui);
    }
  }
);

// kicks off script injection handshake and initializes user input lisetners
// all code that runs to initialize listeners may happen before script injection
document.addEventListener('DOMContentLoaded', async function () {

  // kicks off script injection handshake
  // - acual injection will happen asynchronously via onMessage listeners above
  injectController().then(() => console.log("injected controller scripts"));

  ui.displayInfest();
  document.getElementById('infest-tab').addEventListener('click', () => ui.displayInfest());
  document.getElementById('configure-tab').addEventListener('click', () => ui.displayConfigure());

  document.getElementById('clear-button').addEventListener('click', () => lifecycle.clear(ui));
  document.getElementById('freeze-button').addEventListener('click', () => lifecycle.freeze(ui));

  document.getElementById('optionsToggle').addEventListener('click', () => {toggle(optionsInfo, ui)});
  document.getElementById('addCharToggle').addEventListener('click', () => {toggle(addCharInfo, ui)});

  document.getElementById('submitOptions').addEventListener('click', () => changeOptions(lifecycle, ui));
  document.getElementById('submitAddChar').addEventListener('click', () => addChar(lifecycle, ui));

  document.getElementById('backOptions').addEventListener('click', () => {toggle(optionsInfo, ui)});
  document.getElementById('backAddChar').addEventListener('click', () => {toggle(addCharInfo, ui)});

  ['change', 'paste', 'keyup', 'keydown', 'mouseup'].forEach((myEvent) => {
      document.getElementById('iconInput').addEventListener(myEvent, () => {syncPreview('iconInput')});
      document.getElementById('deadInput').addEventListener(myEvent, () => {syncPreview('deadInput')});
      document.getElementById('cursorInput').addEventListener(myEvent, () => {syncPreview('cursorInput')});
  })

  // usually options will be read from local storage - but if new, get from src
  if (!localStorage.getItem('options')) retrieveOptions();
  if (!localStorage.getItem('chars')) {
    retrieveChars(lifecycle, ui);
  } else {
    buildCharList(lifecycle, ui);
  }

  // to always load from source config (during development), comment out above
  // retrieveOptions();
  // retrieveChars(lifecycle, ui);
});
