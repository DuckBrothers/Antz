$(document).ready(function() {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if( request.message === "update_char" ) {
        console.log('Changing char to ' + request.newChar);
        characters = request.chars;
        options = request.options;
        character = characters[request.newChar];
        console.log(character);
        console.log(options);
        wave ++;
        words = getWords();
        infection = new Infection(wave, words);
        infection.start();
      }
    }
  );
  state.ready = true;
  chrome.runtime.sendMessage({"message": "ready_to_infect"});
});
