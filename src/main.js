// creates a constructor function - research ES6 classes
class Ant {
  // this is what's called when you use the "new" keyword
  constructor($el) {
    this.node = $('<img class="ant"></img>');
    this.currentDirection = "right";
    this.SPEED = 200;
    $el.append(this.node);
    this.node.css({ top: 0, left: 0 });
    setTimeout(this.move.bind(this), this.SPEED);

    this.node.onclick = function() {
      $(".ant").src = "../img/deadbug.jpg";
    };
  }
