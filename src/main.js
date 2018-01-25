// creates a constructor function - research ES6 classes
class Ant {

  // this is what's called when you use the "new" keyword
  constructor($el) {
    this.node = $('<div class="ant"></div>');
    this.currentDirection = 5;
    this.SPEED = 200;
    this.directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    $el.append(this.node);
    this.node.css({ top: 50, left: 50});
    this.dead = true;

    //this.node

    setTimeout(this.move.bind(this), this.SPEED);
  }

  move() {
    let position = this.node.position();
    let dir = Math.floor(Math.random() * 100);

    if (dir < 20) {
      this.currentDirection = (this.currentDirection + 7) % 8;
    } else if (dir < 40) {
      this.currentDirection = (this.currentDirection + 9) % 8;
    }

    let direction = this.directions[this.currentDirection];

    if (direction === 'n') {
      position.top += 10;
    } else if (direction === 'ne'){
      position.top += 5;
      position.left += 5;
    } else if (direction === 'e'){
      position.left += 10;
    } else if (direction === 'se'){
      position.top -= 5;
      position.left += 5;
    } else if (direction === 's'){
      position.top -= 10;
    } else if (direction === 'sw'){
      position.top -= 5;
      position.left -= 5;
    } else if (direction === 'w'){
      position.left -= 10;
    } else if (direction === 'nw'){
      position.top += 5;
      position.left -= 5;
    }


    //position.left >= 700 || position.left < 0 || position.top < 0 || position.top > 700
    this.node.offset(position);

    if (!this.dead) {
      console.log('you killed an ant');
    } else {
    setTimeout(this.move.bind(this), this.SPEED);

    }
  }
}

$(document).ready(function() {

  //setTimeout(function() {new Ant($('body'))}, 1000);

  let ant  = new Ant($('#board'));
  // apple = new Apple($('#board'));
  // levelup = new sound('src/assets/powerup.mp3')
  //const x = new Body($('#board'));
  // if(apple.position() === Head.position()){
  //   alert('EATEN')
  // }
  //console.log(positionAppleHead());
});
