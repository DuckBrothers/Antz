// stores state for script logic

if (typeof(state) !== 'undefined') {
  // scripts have already been injected
  console.log("Scripts already injected!");
  if (state.ready) chrome.runtime.sendMessage({
    "message": "ready_to_infest",
    state: state,
  });
} else {
  chrome.runtime.sendMessage({"message": "ready_to_inject"});
  var state = {
    'ready': false,
    spawned: 0,
    total: 0,
  };
}
