// creates a constructor function - research ES6 classes
class Ant {

  // this is what's called when you use the "new" keyword
  constructor($el) {
    this.node = $('<div id="head", class="ant"></div>');
    this.currentDirection = 'right';
    this.SPEED = 200;
    $el.append(this.node);
    this.node.css({ top: 0, left: 0});
    setTimeout(this.move.bind(this), this.SPEED);
  }


  // same as Head.prototype.move = function() {...}
  move() {
    let direction = this.currentDirection;
    //console.log(this.node);
    let position = this.node.position();

    this.lastTop = position.top;
    this.lastLeft = position.left;

    // randomly choses direction

    if (direction === 'right') {
      position.left += 50;
      console.log(position.left);

    }
    if (direction === 'down'){
      position.top += 50;
    }

    if (direction === 'left'){
      position.left -= 50;
    }
    if (direction === 'up'){
      position.top -= 50;
    }

    this.node.offset(position);

    if (position.left >= 700 || position.left < 0 || position.top < 0 || position.top > 700) {
      alert('you suck');
    } else {
    setTimeout(this.move.bind(this), this.SPEED);

    }
  }
}

$(document).ready(function() {
  head = new Head($('#board'), "player1");
  apple = new Apple($('#board'));
  levelup = new sound('src/assets/powerup.mp3')
  //const x = new Body($('#board'));
  // if(apple.position() === Head.position()){
  //   alert('EATEN')
  // }
  //console.log(positionAppleHead());
});

function extend() {
  console.log("extending");
  let position = head.node.position();
  let nextSegment = new Body($('#board'));

  let temp = head.next;
  nextSegment.next = temp;
  head.next = nextSegment;
  let pos = nextSegment.node.position();
  pos.top = head.lastTop;
  pos.left = head.lastLeft;
  nextSegment.node.offset(pos);
  console.log(head);
  console.log(nextSegment);
  console.log(nextSegment.node.position());

  console.log('next segment ' + JSON.stringify(nextSegment));
  //nextSegment.magic();
}


function positionAppleHead (){
  const appPosition = apple.node.position();
  const headPosition = head.node.position();
  if(headPosition.left+50 > appPosition.left && headPosition.left < appPosition.left + 50) {
    if (headPosition.top+50 > appPosition.top && headPosition.top < appPosition.top + 50) {
      apple.reset();
      extend();
      levelup.play();
      head.SPEED = Math.ceil(head.SPEED * 0.95);
      return true;
    }
  }

}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}
