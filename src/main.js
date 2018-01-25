// creates a constructor function - research ES6 classes
class Ant {
  // this is what's called when you use the "new" keyword
  constructor($el, antNum, top, left) {
    this.id = antNum;
    this.node = $('<img id="'+antNum+'" class="ant"></img>');
    this.node.attr("src", "./img/movingAnt.gif");
    this.currentDirection = Math.floor(Math.random() * 8);
    this.SPEED = 200;
    this.directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
    $el.append(this.node);
    this.node.css({ top: top, left: left });
    this.dead = false;
    this.killAnt(this);
    this.angle = this.currentDirection * 45;
    $(('#' + this.id)).rotate(this.angle);
    setTimeout(this.move.bind(this), this.SPEED);
  }

  killAnt(ant) {
    console.log(ant.id);
    let x = '#' + ant.id;
    //x = '#ant';
    console.log(x);
    $(x).click(function() {
      console.log("hit");
      $(x).attr("src", "./img/deadbug.png");
      ant.dead = true;
      $(x).fadeOut(1000);
    });
  }

  move() {
    let position = this.node.position();
    let dir = Math.floor(Math.random() * 100);


    let x = '#' + this.id;
    //$(x).rotate(this.angle);


    if (dir < 20) {
      this.currentDirection = (this.currentDirection + 7) % 8;
      this.angle = (this.angle + 315) % 360;
      $(x).rotate(this.angle);
    } else if (dir < 40) {
      this.currentDirection = (this.currentDirection + 9) % 8;
      this.angle = (this.angle + 45) % 360;
      $(x).rotate(this.angle);
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

    position.left = (position.left + $(window).width()-50) % ($(window).width()-50);
    position.top = (position.top + $(window).height()-50) % ($(window).height()-50);

    //position.left >= 700 || position.left < 0 || position.top < 0 || position.top > 700
    this.node.offset(position);

    if (this.dead) {
      console.log("you killed an ant");
      this.dead = true;
    } else {
      setTimeout(this.move.bind(this), this.SPEED);
    }
  }
}

$(document).ready(function() {
  //setTimeout(function() {new Ant($('body'))}, 1000);
  console.log($(window).height());
  console.log($(window).width());

  let ants = 0;
  //let ant = new Ant($("body"), 'ant');
  setInterval(function() {
    ants ++;
    let x = randCoords();
    new Ant($("body"), ('ant' + ants), x.top, x.left);
  }, 2000);

  function randCoords() {
    let coords = {};
    coords.top = Math.random() * ($(window).height()-50);
    coords.left = Math.random() * ($(window).width()-50);
    return coords;
  }

  // function antClosure() {
  //   let ants = 0;
  //   return function() {
  //
  //   }
  // }

  // apple = new Apple($('#board'));
  // levelup = new sound('src/assets/powerup.mp3')
  //const x = new Body($('#board'));
  // if(apple.position() === Head.position()){
  //   alert('EATEN')
  // }
  //console.log(positionAppleHead());
});
