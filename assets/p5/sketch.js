function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  circle(width/2,height/2,width/2)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}