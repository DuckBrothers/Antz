// this background code defines the logic for the popup and injects our scripts

// keeps track of which character we want to infect the page
var clickedChar = "ant";

// keeps track of whether scripts have been injected
var ready = false;

var optionsInfo = {
  localStorageKey: 'options',
  innerForm: 'innerOptions',
  otherToggle: 'addCharToggle',
  expanded: false,
}

var addCharInfo = {
  localStorageKey: 'chars',
  innerForm: 'innerAddChar',
  otherToggle: 'optionsToggle',
  expanded: false,
}

// called when popup loads, sends out initial script to determine if our program has already been sent down
function injectController() {
  chrome.tabs.executeScript(null,
    {file: "./src/controller.js"});
}

// injects all our scripts - only called the first time popup loads per page
function injectScripts() {
  chrome.tabs.executeScript(null,
    {file: "jquery-3.3.1.min.js"});
  chrome.tabs.executeScript(null,
    {file: "./src/rotate.js"});
    chrome.tabs.executeScript(null,
      {file: "./src/scrapewords.js"});
  chrome.tabs.executeScript(null,
    {file: "./src/main.js"});
  chrome.tabs.insertCSS(null, {
     file : "./src/styles.css"
    });
  // window.close();
}


// tells main.js to change the character, restart infection
function chooseChar(e) {

  // choosing character does nothing if scripts aren't ready
  if (!ready || !localStorage.getItem('chars') || !localStorage.getItem('options')) return;

  clickedChar = e.path[0].className;
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


function toggle(info) {
  if (info.expanded) {
    let innerForm = document.getElementById(info.innerForm)
    innerForm.style.display = 'none';
    document.getElementById(info.otherToggle).style.display = 'inline';
    info.expanded = false;
    return;
  }

  if (!localStorage.getItem(info.localStorageKey)) return;

  let innerForm = document.getElementById(info.innerForm)
  innerForm.style.display = 'inline';
  document.getElementById(info.otherToggle).style.display = 'none';
  info.expanded = true;
}


function changeOptions() {

}

function addChar () {

}

function buildCharList() {
  const charContainer = document.getElementById('characters');
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
    charDiv.appendChild(charImg);
    charDiv.addEventListener('click', chooseChar);
    charContainer.appendChild(charDiv);
  }
}

// adds click listener to each character div
document.addEventListener('DOMContentLoaded', function () {

  // keeps us in sync with injected scripts
  injectController();
  document.getElementById('optionsToggle').addEventListener('click', () => {toggle(optionsInfo)});
  document.getElementById('addCharToggle').addEventListener('click', () => {toggle(addCharInfo)});


  if (!localStorage.getItem('options')) retrieveOptions();

  if (!localStorage.getItem('chars')) {retrieveChars();}
  else {buildCharList();};

});


// listens for controller script to determine if scripts need to be injected
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "ready_to_inject" ) {
      injectScripts();
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
