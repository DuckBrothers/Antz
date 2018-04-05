// (function() {

  var characters = {
    ant: {
      icon:  "http://moziru.com/images/shaow-clipart-ant-7.png",
      dead: "https://adiospests.com/wp-content/uploads/sites/10/2016/04/deadbug.png",
      type: "ant",
      words: [
        '', '! ', 'ew ', 'ant ', 'hill ', 'queen ', 'picnic ',
        'insects ', 'crawling ', 'sm', 'o', 'sh '
      ],
      wordOffset: 4,
      wordCutoff: 9,
      angle: 0
    },
    bulbasaur: {
      icon:  "http://78.media.tumblr.com/8f3d84d35802ef4681ff96f69fa187b1/tumblr_n6bu3cJbUA1raoul2o1_500.gif",
      dead: "https://archive-media-1.nyafuu.org/vp/image/1401/17/1401170820123.png",
      type: "bulba",
      words: [
        '', '! ', 'go ', 'ivy ', 'vine ', 'bulba ', 'plants ',
        'ivysaur ', 'venusaur ', 'bulbasa', 'a', 'ur '
      ],
      wordOffset: 9,
      wordCutoff: 9,
      angle: 90,
    },
    charmander: {
      icon:  "https://thumbs.gfycat.com/PhysicalFrayedArmyant-max-1mb.gif",
      dead: "https://i.pinimg.com/originals/a2/b9/88/a2b988c7dd0bad762e5f19e994e35f3b.jpg",
      type: "char",
      words: [
        '', '! ', 'go ', 'hot ', 'char ', 'ember ', 'mander ', 'inferno ',
        'evolving ', 'chariza', 'a', 'rd '
      ],
      wordOffset: 9,
      wordCutoff: 9,
      angle: 90
    },
    finger: { // node
      icon:  "https://nodejs.org/static/images/logos/nodejs-new-pantone-black.png",
      dead: "https://cdn.shopify.com/s/files/1/1061/1924/files/Middle_Finger_Emoji.png?9898922749706957214",
      type: "ant",
      words: [
        '', '! ', 'ew ', 'die ', 'node ', 'sucks ', 'nodejs ', 'node.js ', 'theworst ', 'f', 'u', 'ck '
      ],
      wordOffset: 3,
      wordCutoff: 9,
      angle: 0
    },
    antGIF: {
      icon: "http://www.illustrationweb.us/imagebase/media/102-101608.gif",
      dead: "https://adiospests.com/wp-content/uploads/sites/10/2016/04/deadbug.png",
      type: "ant",
      words: [
        '', '! ', 'ew ', 'ant ', 'hill ', 'queen ', 'picnic ',
        'insects ', 'crawling ', 'sm', 'o', 'sh '
      ],
      wordOffset: 4,
      wordCutoff: 9,
      angle: 0
    },
  }

  var character = characters.bulbasaur;

  class Ant {
    // this is what's called when you use the "new" keyword
    constructor($el, num, top, left) {
      this.id = (("#" + character.type) + num);
      this.node = $('<img id="' + (character.type + num) + '" class="character ' + character.type + '"></img>');
      this.node.attr("src", character.icon);
      this.currentDirection = Math.floor(Math.random() * 8);
      this.SPEED = 100;
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
      console.log(ant.id);
      console.log('asdasd');
      $(ant.id).click(function(event) {
        console.log("hit");
        $(ant.id).attr("src", character.dead);
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
        position.top -= 10;
      } else if (direction === "ne") {
        position.top -= 5;
        position.left += 5;
      } else if (direction === "e") {
        position.left += 10;
      } else if (direction === "se") {
        position.top += 5;
        position.left += 5;
      } else if (direction === "s") {
        position.top += 10;
      } else if (direction === "sw") {
        position.top += 5;
        position.left -= 5;
      } else if (direction === "w") {
        position.left -= 10;
      } else if (direction === "nw") {
        position.top -= 5;
        position.left -= 5;
      }

      position.left =
        (position.left + $(document).width() - 50) % ($(document).width() - 50);
      position.top =
        (position.top + $(document).height() - 50) % ($(document).height() - 50);

      //position.left >= 700 || position.left < 0 || position.top < 0 || position.top > 700
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
          character = characters[request.newChar];
          infect();
        }
      }
    );

    chrome.runtime.sendMessage({"message": "ready_to_infect"});
  });

  function infect() {
    var wordsDeleted = 0;
    let ants = 0;

    var allWords = getWords();
    //console.log(allWords);

    wordToAnt();

    function wordToAnt() {
      let curr = allWords[wordsDeleted];
      //console.log(curr);
      ants++;
      let newPosition = {};
      newPosition.left = Math.floor($(curr).offset().left + (curr.offsetWidth / 2));
      newPosition.top = Math.floor($(curr).offset().top + (curr.offsetHeight / 2));

      let newWord = pickWord(curr.innerText.length-1);
      let bg = curr.style.backgroundColor;
      curr.style.backgroundColor = 'LightBlue';
      curr.innerText = newWord;
      setTimeout(wordToAnt, 1000);
      new Ant($("body"), ants, newPosition.top, newPosition.left);
      if (wordsDeleted < allWords.length-1) {
        wordsDeleted ++;
        setTimeout(function() {
          curr.style.backgroundColor = bg;
        }, 500);
      } else {
        setInterval(function() {
          ants++;
          let newPosition = randCoords();
          new Ant($("body"), ants, newPosition.top, newPosition.left);
        }, 2000);
      }
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
