var character;
var wave = 0;
var options;

const directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

const attachKillTrigger = (infection, agent) => {
  $(agent.id).click(function(event) {
    if (agent.dead) return; // already killed
    // console.log(`${agent.id} was killed!`);
    $(agent.id).attr("src", character.dead);
    infection.active --;
    agent.dead = true;
    $(agent.id).fadeOut(1000);
    // event.stopPropegation();
  });
}

const randCoords = () => {
  let coords = {};
  coords.top = Math.random() * ($(window).height() - 50);
  coords.left = Math.random() * ($(window).width() - 50);
  return coords;
}

const matchReplacementWord = (character, wordLength) => {
  if (wordLength < character.wordCutoff) {
    return character.words[wordLength];
  } else {
    return character.words[9] +
      character.words[10].repeat(wordLength-character.wordOffset) +
      character.words[11];
  }
}


class Infection {
  constructor(wave, words) {
    this.wave = wave;
    this.agents = 0;
    this.active = 0;
    this.words = words;
  }

  start() {
    this.infect();
  }

  end() {}

  infect() {
    if (this.wave < wave) return; // stop generating agents if new wave started
    // skip generation if at max infection agents
    if (options.max && this.active >= options.max) {
      return setTimeout(() => this.infect(), options.frequency);
    }

    // let allWords = getWords();
    let nextWord = this.words[this.agents % this.words.length];
    if (options.random) {
      nextWord = this.words[Math.floor(Math.random() * this.words.length)]
    }
    console.log(nextWord)
    let newPosition = {};
    newPosition.left = Math.floor($(nextWord).offset().left + (nextWord.offsetWidth / 2));
    newPosition.top = Math.floor($(nextWord).offset().top + (nextWord.offsetHeight / 2));

    // highlight word that's changing, but store original background for later
    let bg = nextWord.style.backgroundColor;
    nextWord.style.backgroundColor = 'LightBlue';

    if (options.replace && character.words.length) {
      let replacementWord = matchReplacementWord(character, nextWord.innerText.length-1);
      console.log(`Replacing word "${nextWord}" with "${replacementWord}"`);
      nextWord.innerText = replacementWord;
    }

    this.agents++;
    this.active++;
    new InfectionAgent($("body"), this, this.agents, newPosition.top, newPosition.left);
    // if (wordsDeleted < allWords.length-1) {
      setTimeout(() => this.infect(), options.frequency);
      // return background color to normal
      setTimeout(() => nextWord.style.backgroundColor = bg, 500);
    // } else {
      // setInterval(function() {
      //   ants++;
      //   let newPosition = randCoords();
      //   new Ant($("body"), ants, newPosition.top, newPosition.left);
      // }, 2000);
    // }
  }
}

class InfectionAgent {
  // this is what's called when you use the "new" keyword
  constructor($el, infection, num, top, left) {
    const idTag = `${character.type}_${infection.wave}_${num}`
    this.id = `#${idTag}`;
    console.log(this.id);

    this.SPEED = options.speed;
    this.DIST = options.distance;
    this.HALF = Math.floor(options.distance / 2);
    this.dead = false;

    // this.node = $('<img id="' + (character.type + num) + '" class="character ' + character.type + '"></img>');
    // this.node = $(`<img id="${character.type}${num}" class="character ${character.type}"></img>`);
    // initialize DOM element with appropriate id/class
    this.node = $(`
      <img id="${idTag}" style="width:${options.size}px;height:${options.size}px;" class="character ${character.type}"></img>
    `);
    this.node.attr("src", character.icon);
    // this.node.css({'cursor': 'url(chrome-extension://nmbgndaiokpfjgphpaaoaejfljgkgkmp/img/pokeball.gif), default'});
    $el.append(this.node);
    attachKillTrigger(infection, this);

    // place agent in initialization position
    this.movement = new AgentMovement()
    this.node.css({ top: top, left: left });
    $(this.id).rotate(this.movement.calculateOrientation(character.angle));

    // start movement recursion
    setTimeout(this.move.bind(this), this.SPEED);
  }

  move() {
    this.movement.updateDirection();
    let position = this.movement.calculatePosition(
      this.node.offset(),
      this.DIST,
      this.HALF,
      $(document).width(),
      $(document).height());

    this.node.offset(position);
    $(this.id).rotate(this.movement.calculateOrientation(character.angle));

    if (this.dead) {
      console.log("you got one!");
      this.dead = true;
    } else {
      setTimeout(this.move.bind(this), this.SPEED);
    }
  }
}

class AgentMovement {
  constructor() {
    this.direction =  Math.floor(Math.random() * 8);
  }

  updateDirection() {
    const turnPercentage = 15;
    let directionRoll = Math.floor(Math.random() * 100);

    if (directionRoll < 15) {
      this.direction = (this.direction + 7) % 8;
    } else if (directionRoll < 30) {
      this.direction = (this.direction + 1) % 8;
    }
  }

  calculateOrientation(characterOrientation) {
    return (540 + characterOrientation - this.direction * 45) % 360;
  }

  calculatePosition(position, dist, half, width, height) {
    let direction = directions[this.direction];

    switch (directions[this.direction]) {
      case 'n':
        position.top += dist;
        break;
      case 'ne':
        position.top += half;
        position.left += half;
        break;
      case 'e':
        position.left += dist;
        break;
      case 'se':
        position.top -= half;
        position.left += half;
        break;
      case 's':
        position.top -= dist;
        break;
      case 'sw':
        position.top -= half;
        position.left -= half;
        break;
      case 'w':
        position.left -= dist;
        break;
      case 'nw':
        position.top += half;
        position.left -= half;
        break;
    }

    position.left = (position.left + width - 50) % (width - 50);
    position.top = (position.top + height - 50) % (height - 50);

    return position;
  }
}
