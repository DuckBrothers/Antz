// this background code defines the logic for the popup and injects our scripts

// keeps track of which character we want to infect the page
var clickedChar = "ant";

// keeps track of whether scripts have been injected
var ready = false;

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

function addChar () {

}

// adds click listener to each character div
document.addEventListener('DOMContentLoaded', function () {

  // keeps us in sync with injected scripts
  injectController();

  if (!localStorage.getItem('chars')) retrieveChars();
  if (!localStorage.getItem('options')) retrieveOptions();

  // adds logic to popup dom
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', chooseChar);
  }
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
