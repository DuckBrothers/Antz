// this is the background code...

// listen for our browerAction to be clicked


var clickedChar = "ant";

function click(e) {
  clickedChar = e.path[0].className;

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
  window.close();
}

// function injectScripts() {
//   chrome.tabs.executeScript(null,
//     {file: "jquery-3.3.1.min.js"});
//   chrome.tabs.executeScript(null,
//     {file: "./src/rotate.js"});
//     chrome.tabs.executeScript(null,
//       {file: "./src/scrapewords.js"});
//   chrome.tabs.executeScript(null,
//     {file: "./src/main.js"});
//   chrome.tabs.insertCSS(tabId, {
//      file : "./src/styles.css"
//     });
// }

function chooseChar(e) {
  console.log(e.path[0].className);
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    let req = {
      "message": "update_char",
      "newChar": ''
    }
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
}

// this is unique to our popup
document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "ready_to_infect" ) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        let req = {
          "message": "update_char",
          "newChar": clickedChar
        }
        chrome.tabs.sendMessage(activeTab.id, req);
      });
    }
  }
);
