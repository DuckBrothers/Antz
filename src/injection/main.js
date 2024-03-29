/**
Captures messages from the popup background code to trigger webpage behavior
*/

$(document).ready(function() {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if( request.message === "infest" ) {
        Object.assign(state, request);
        char = request.chars[request.character];
        console.log(`Changing character to: ${JSON.stringify(char)}`);
        console.log(`Updating options to: ${JSON.stringify(request.options)}`);
        if (request.options.words) getWords(state);
        infestation = new Infestation(state, request.options, request.waves, char);
        infestation.infest();
        return;
      }
      if( request.message === "update_state" ) {
        Object.assign(state, request);
        console.log(`Recieved state update: ${JSON.stringify(state)}`);
        return;
      }
    }
  );
  state.ready = true;
  chrome.runtime.sendMessage({
    "message": "ready_to_infest",
    state: state,
  });
});
