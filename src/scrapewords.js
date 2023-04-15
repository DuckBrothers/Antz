//var allWords = getWords();
function getWords(state) {
    if (state.words) return;
    var allP = $('p').toArray();
    var allH = $(':header').toArray();

    // console.log(allP);
    // console.log(allH);
    let textContainers = allP.concat(allH);
    // console.log(textContainers);
    var $spans;

    // var headers = $('h1');
    // var textContainers = paras.concat(headers);
    var words = [];

    textContainers.forEach(function(container){
        // console.log(container);
        let text = container.innerText;
        //console.log(text);
        //console.log('text', text);
        let textArr = text.split(' ');
        let newText = '';
        for (t of textArr) {
          newText += ('<span class="nefarious">' + t + ' ' + '</span>');
        }
        // console.log(newText);
        container.innerHTML = newText;

    });
    var allS = $('.nefarious').toArray();

    //console.log(allS);
    //shuffleArray(allS);
    function shuffleArray(array) {
          for (var i = array.length - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1));
              var temp = array[i];
              array[i] = array[j];
              array[j] = temp;
          }
      }

    state.words = allS;
    state.shuffledWords = [...allS];
    shuffleArray(state.shuffledWords);
}
