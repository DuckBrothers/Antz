// this background code defines the logic for the popup and injects our scripts

// keeps track of which character we want to infect the page
var clickedChar = "ant";

// list of char data from JSON file
var chars;

// list of option data from JSON file
var options;

// keeps track of whether scripts have been injected
var ready = false;

// called when popup loads, sends out initial script to determine if our program has already been sent down
function injectController() {
  chrome.tabs.executeScript(null,
    {file: "./src/controller.js"});
}

// for writing to json:

// function download(content, fileName, contentType) {
//     var a = document.createElement("a");
//     var file = new Blob([content], {type: contentType});
//     a.href = URL.createObjectURL(file);
//     a.download = fileName;
//     a.click();
// }
// download(jsonData, 'json.txt', 'text/plain');


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
  chrome.tabs.insertCSS(tabId, {
     file : "./src/styles.css"
    });
  // window.close();
}


// tells main.js to change the character, restart infection
function chooseChar(e) {
  if (!ready || !chars || !options) return; // choosing character does nothing if scripts aren't ready

  clickedChar = e.path[0].className;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    let req = {
      "message": "update_char",
      "newChar": clickedChar,
      "chars": chars,
      "options": options
    }
    chrome.tabs.sendMessage(activeTab.id, req);
  });
}

function retrieveChars() {
  fetch('./src/characters.json')
  .then(response => response.json())
  .then(res => {
    chars = res;
    console.log(chars);
  });
}

function retrieveOptions() {
  fetch('./src/options.json')
  .then(response => response.json())
  .then(res => {
    options = res;
    console.log(options);
  });
}

function addChar () {

}

// adds click listener to each character div
document.addEventListener('DOMContentLoaded', function () {

  // keeps us in sync with injected scripts
  injectController();

  retrieveChars();
  retrieveOptions();

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
