const directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

const attachKillTrigger = (agent) => {
  $(agent.id).click(() => agent.kill());
}

const randCoords = () => {
  let coords = {};
  coords.top = Math.random() * ($(window).height());
  coords.left = Math.random() * ($(window).width());
  return coords;
}

const matchReplacementWord = (character, wordLength) => {
  if (wordLength < character.wordCutoff) {
    return character.words[wordLength];
  } else {
    return character.words[character.wordCutoff] +
      character.words[character.wordCutoff+1].repeat(wordLength-character.wordOffset) +
      character.words[character.wordCutoff+2];
  }
}


class Infestation {
  constructor(state, options, wave, character) {
    this.state = state;
    this.options = options;
    this.wave = wave;
    this.character = character;
    this.agents = 0;
    this.active = 0;
  }

  infest() {
    // stop generating agents if new wave started or existing waves cleared
    if (!this.state.infest) return;
    if (this.wave < this.state.waves) return;

    // skip generation if at max infestation agents or if frozen
    if ((this.active >= this.options.wave) || (this.state.total >= this.options.max) || this.state.freeze) {
      return setTimeout(() => this.infest(), this.options.frequency);
    }

    let spawnCenter = this.prepareAgentSpawnPosition();

    this.agents++;
    this.active++;
    this.state.total++;
    this.state.spawned++;
    new InfestationAgent($("body"), this, this.agents, spawnCenter);
    setTimeout(() => this.infest(), this.options.frequency);
  }

  // Gets the spawn coordinates (random, or from word) and manipulates word elem
  prepareAgentSpawnPosition() {
    if (!this.options.words) return randCoords();

    let words = this.state.words;
    if (this.options.random) words = this.state.shuffledWords;

    let nextWord = words[this.state.spawned % words.length];
    let spawnCenter = $(nextWord).offset();
    spawnCenter.left += Math.floor(nextWord.offsetWidth / 2);
    spawnCenter.top += Math.floor(nextWord.offsetHeight / 2);

    // highlight word that's changing, but store original background for later
    let bg = nextWord.style.backgroundColor;
    nextWord.style.backgroundColor = 'LightBlue';

    if (this.options.hide) {
      nextWord.style.opacity = 0;
    } else if (this.options.replace && this.character.words.length) {
      let replacementWord = matchReplacementWord(this.character, nextWord.innerText.length);
      console.log(`Replacing word "${nextWord}" with "${replacementWord}"`);
      nextWord.innerText = replacementWord;
    }

    setTimeout(() => nextWord.style.backgroundColor = bg, 500);
    return spawnCenter;
  }
}

class InfestationAgent {
  constructor($el, infestation, num, center) {
    const idTag = `${infestation.character.type}_${infestation.wave}_${num}`
    const idTagImg = `${idTag}_img`

    this.id = `#${idTag}`;
    this.img_id = `#${idTagImg}`;

    this.infestation = infestation;
    this.dead = false;

    // initialize DOM element with appropriate id/class
    this.node = $(`
      <div id="${idTag}" style="width:${infestation.options.killzone}px;height:${infestation.options.killzone}px;" class="character_node ${infestation.character.type}"></div>
    `);
    this.img =  $(`
      <img id="${idTagImg}" style="width:${infestation.options.size}px;height:${infestation.options.size}px;" class="character_img ${infestation.character.type}"></img>
    `);
    this.img.attr("src", infestation.character.icon);
    this.node.css({ position: 'absolute', 'border-radius': '50%', 'z-index': 99, 'background-color': 'transparent', display: 'flex', 'align-items': 'center', 'justify-content': 'center', 'cursor': infestation.character.cursor });
    this.img.css({ 'z-index': 100 });

    $el.append(this.node);
    $(this.id).append(this.img);
    attachKillTrigger(this);

    // place agent in initialization position
    this.movement = new AgentMovement()
    this.node.css(this.movement.calculateOriginalPosition(center, this.infestation.options, $(document).width(), $(document).height()));
    $(this.id).rotate(this.movement.calculateOrientation(infestation.character), infestation.character.rotate, infestation.character.reflect);

    // start movement recursion
    setTimeout(this.move.bind(this), this.infestation.options.speed);
  }

  move() {
    if (this.dead) return;
    if (!this.infestation.state.infest) this.kill();
    if (this.infestation.state.freeze) return setTimeout(this.move.bind(this), this.infestation.options.speed);

    this.movement.updateDirection();
    let position = this.movement.calculatePosition(
      this.node.offset(),
      infestation.options,
      $(document).width(),
      $(document).height());

    this.node.offset(position);
    $(this.id).rotate(this.movement.calculateOrientation(this.infestation.character), this.infestation.character.rotate, this.infestation.character.reflect);

    setTimeout(this.move.bind(this), this.infestation.options.speed);
  }

  kill() {
    if (this.dead) return; // already killed
    this.dead = true;
    this.infestation.active --;
    this.infestation.state.total --;
    console.log(`You got ${this.id}!`);
    $(this.img_id).attr("src", this.infestation.character.dead);
    $(this.id).rotate(0, false, false);
    $(this.id).fadeOut(2000, function(){
        $(this.id).remove();
    });
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

  calculateOrientation(character) {
    if (!character.rotate) return 0;
    return (540 + character.angle - this.direction * 45) % 360;
  }

  enforceLowerRightBuffer(position, options, width, height) {
    let lowerRightBuffer = Math.floor(Math.max(options.size, options.killzone) * 1.5);
    position.left = (position.left + width - lowerRightBuffer) % (width - lowerRightBuffer);
    position.top = (position.top + height - lowerRightBuffer) % (height - lowerRightBuffer);
    return position;
  }

  calculateOriginalPosition(center, options, width, height) {
    let position = {}
    position.top = center.top - (options.killzone / 2);
    position.left = center.left - (options.killzone / 2);
    return this.enforceLowerRightBuffer(position, options, width, height);
  }

  calculatePosition(position, options, width, height) {
    let direction = directions[this.direction];
    let dist = options.distance;
    let half = options.distance / 2;

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

    return this.enforceLowerRightBuffer(position, options, width, height);
  }
}
