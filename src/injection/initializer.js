/**
The initialization flow for this extension is multi-step:
1. When the popup opens, it injects this script
2. This script checks if we have already injected scripts into the webpage -
   this can happen since the popup will be closed and re-opened (restarted)
3. If scripts have already been injected, we don't want to run them again -
   so when this is the case (state var exists already) we tell the popup code
4. If the scripts haven't been injected, we create state + tell popup to inject
*/

if (typeof(state) !== 'undefined') {
  console.log("Scripts already injected!");
  if (state.ready) chrome.runtime.sendMessage({
    "message": "ready_to_infest",
    state: state,
  });
} else {
  console.log("Scripts not yet injected - initializing state.");
  // MUST use var here, to initialize globally outside of this conditional scope
  var state = {
    'ready': false,
    spawned: 0,
    total: 0,
  };
  // telling the popup to inject the scripts
  chrome.runtime.sendMessage({"message": "ready_to_inject"});
}
