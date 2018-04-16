// stores state for script logic

if (typeof(state) !== 'undefined') {
  // scripts have already been injected
  if (state.ready) chrome.runtime.sendMessage({"message": "ready_to_infect"});
} else {
  chrome.runtime.sendMessage({"message": "ready_to_inject"});
  var state = {
    'ready': false,
  };
}
