const infectElement = (element) => {
  const regex = new RegExp("<\/?[^>]*>", 'g') // matches all element tag
  let texts = element.innerHTML.split(regex);
  let tags =  element.innerHTML.match(regex);

  // console.log('texts')
  // console.log(texts)
  // console.log('tags')
  // console.log(tags)

  texts = texts.map((text) => {
    return text.split(' ').map((word) => {
      if (!word) return word;
      return `<span class="nefarious">${word}</span>`;
    }).join(' ');
  });

  let html = texts[0];
  if (!tags) return element.innerHTML = html;
  for (let i = 0; i < tags.length; i++) {
    html += tags[i] + texts[i+1];
  }
  element.innerHTML = html;
}

//var allWords = getWords();
function getWords(state) {
    if (state.words) return;
    var allP = $('p').toArray();
    var allH = $(':header').toArray();

    // console.log(allP);
    // console.log(allH);
    let textContainers = allP.concat(allH);
    textContainers.forEach(function(container){
        infectElement(container);
    });
    var allS = $('.nefarious').toArray();

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
