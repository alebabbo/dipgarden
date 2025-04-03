let scrollPercent = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(100);
  circle(width/2,height/2,width/2)
  
  text("Altezza della finestra: " + windowHeight, windowWidth/2, windowHeight/2);
  text("Altezza dello schermo: " + displayHeight, windowWidth/2, windowHeight/2+20);
  text("Altezza del documento: "+ Math.max( document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight), windowWidth/2, windowHeight/2+40);
  
    scrollYPos = window.scrollY; // Aggiorna la variabile di scorrimento
  
  text("Scroll Y: " + scrollYPos, windowWidth/2, windowHeight/2+60);
  
  let documentHeight = document.documentElement.scrollHeight - windowHeight; //altezza scrollabile
  scrollPercent = (window.scrollY / documentHeight) * 100;
  text("Scroll %: " + scrollPercent.toFixed(2) + "%", windowWidth/2, windowHeight/2+80);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}