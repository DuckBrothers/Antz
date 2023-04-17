/**
Methods that facilitate word-by-word code injection.
*/

// takes an element and wraps each of its nested text words in its own span
// leaves HTML tags intact
const infectElement = (element) => {
  const regex = new RegExp("<\/?[^>]*>", 'g') // matches all element tag
  // using the same regex for split and match gives us altenating groups:
  // 1. texts has the out groups (sections of non-tag text)
  // 2. tags has the in-groups
  let texts = element.innerHTML.split(regex);
  let tags =  element.innerHTML.match(regex);

  texts = texts.map((text) => {
    return text.split(' ').map((word) => {
      if (!word) return word; // leave space characters unwrapped
      return `<span class="nefarious">${word}</span>`;
    }).join(' ');
  });

  // there will be exactly one more element in texts than tags, so...
  // we stitch back together the innerHTML by alternatingly appending
  let html = texts[0]; // always at least one element in texts...
  if (!tags) return element.innerHTML = html; // but tags can be empty
  for (let i = 0; i < tags.length; i++) {
    html += tags[i] + texts[i+1];
  }
  element.innerHTML = html;
}

// Gets all inner text under <p> and <h> tags, and wraps word-by-word in spans
// Returns the list of span element wrappers, so we can manipulate words
function getWords(state) {
    if (state.words) return;
    var allP = $('p').toArray();
    var allH = $(':header').toArray();

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
