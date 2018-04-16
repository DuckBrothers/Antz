// (function() {

  var character;
  var wave = 0;
  var options;
  var active = 0;

  class Ant {
    // this is what's called when you use the "new" keyword
    constructor($el, num, top, left, thisWave) {
      // this.id = (("#" + character.type) + num);
      console.log(thisWave);
      this.id = `#${character.type}_${thisWave}_${num}`;
      // this.id = `#${character.type}${num}`;

      console.log(this.id);
      // this.node = $('<img id="' + (character.type + num) + '" class="character ' + character.type + '"></img>');
      // this.node = $(`<img id="${character.type}${num}" class="character ${character.type}"></img>`);

      this.node = $(`
        <img id="${character.type}_${thisWave}_${num}" style="width:${options.size}px;height:${options.size}px;" class="character ${character.type}"></img>
      `);

      this.node.attr("src", character.icon);
      this.currentDirection = Math.floor(Math.random() * 8);
      this.SPEED = options.speed;
      this.DIST = options.distance;
      this.HALF = Math.floor(options.distance / 2);
      this.directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
      $el.append(this.node);
      this.node.css({ top: top, left: left });
      this.dead = false;
      this.killAnt(this);
      this.angle = (this.currentDirection * 45 + character.angle) % 360;
      $(this.id).rotate(this.angle);
      setTimeout(this.move.bind(this), this.SPEED);
    }

    killAnt(ant) {
      $(ant.id).click(function(event) {
        console.log(`${ant.id} was killed!`);
        $(ant.id).attr("src", character.dead);
        active --;
        ant.dead = true;
        $(ant.id).fadeOut(1000);
        //event.stopPropegation();
      });
    }



    move() {
      let position = this.node.offset();
      let dir = Math.floor(Math.random() * 100);

      //$(this.id).rotate(this.angle);

      if (dir < 15) {
        this.currentDirection = (this.currentDirection + 7) % 8;
        this.angle = (this.angle + 315) % 360;
        $(this.id).rotate(this.angle);
      } else if (dir < 30) {
        this.currentDirection = (this.currentDirection + 9) % 8;
        this.angle = (this.angle + 45) % 360;
        $(this.id).rotate(this.angle);
      }

      let direction = this.directions[this.currentDirection];

      if (direction === "n") {
        position.top -= this.DIST;
      } else if (direction === "ne") {
        position.top -= this.HALF;
        position.left += this.HALF;
      } else if (direction === "e") {
        position.left += this.DIST;
      } else if (direction === "se") {
        position.top += this.HALF;
        position.left += this.HALF;
      } else if (direction === "s") {
        position.top += this.DIST;
      } else if (direction === "sw") {
        position.top += this.HALF;
        position.left -= this.HALF;
      } else if (direction === "w") {
        position.left -= this.DIST;
      } else if (direction === "nw") {
        position.top -= this.HALF;
        position.left -= this.HALF;
      }

      position.left =
        (position.left + $(document).width() - 50) % ($(document).width() - 50);
      position.top =
        (position.top + $(document).height() - 50) % ($(document).height() - 50);

      this.node.offset(position);

      if (this.dead) {
        console.log("you got one!");
        this.dead = true;
      } else {
        setTimeout(this.move.bind(this), this.SPEED);
      }
    }
  }

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
          infect(wave);
        }
      }
    );
    state.ready = true;
    chrome.runtime.sendMessage({"message": "ready_to_infect"});
  });

  function infect() {
    var thisWave = wave;
    var wordsDeleted = 0;
    let ants = 0;

    var allWords = getWords();
    //console.log(allWords);

    wordToAnt(thisWave);

    function wordToAnt(thisWave) {
      if (thisWave < wave) return;
      if (options.max && active >= options.max) {
        return setTimeout(function() {
          wordToAnt(thisWave);
        }, options.frequency);
      }
      let curr = allWords[wordsDeleted % allWords.length];
      if (options.random) {
        console.log(Math.floor(Math.random() * allWords.length))
        curr = allWords[Math.floor(Math.random() * allWords.length)]
        console.log('curr' + curr);
      }
      //console.log(curr);
      ants++;
      active ++;
      let newPosition = {};
      newPosition.left = Math.floor($(curr).offset().left + (curr.offsetWidth / 2));
      newPosition.top = Math.floor($(curr).offset().top + (curr.offsetHeight / 2));
      let bg = curr.style.backgroundColor;
      curr.style.backgroundColor = 'LightBlue';

      if (options.replace && character.words.length) {
        let newWord = pickWord(curr.innerText.length-1);
        curr.innerText = newWord;
      }
      new Ant($("body"), ants, newPosition.top, newPosition.left, thisWave);
      // if (wordsDeleted < allWords.length-1) {
        wordsDeleted ++;
        setTimeout(function() {
          wordToAnt(thisWave);
        }, options.frequency);
        setTimeout(function() {
          curr.style.backgroundColor = bg;
        }, 500);
      // } else {
        // setInterval(function() {
        //   ants++;
        //   let newPosition = randCoords();
        //   new Ant($("body"), ants, newPosition.top, newPosition.left);
        // }, 2000);
      // }
    }

    function pickWord(wordLength) {
      if (wordLength < character.wordCutoff) {
        return character.words[wordLength];
      } else {
        return character.words[9] +
          character.words[10].repeat(wordLength-character.wordOffset) +
          character.words[11];
      }
    }

    function randCoords() {
      let coords = {};
      coords.top = Math.random() * ($(window).height() - 50);
      coords.left = Math.random() * ($(window).width() - 50);
      return coords;
    }
  }
// })();
