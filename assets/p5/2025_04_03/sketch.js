let flock;
let scappate = false;

let scrollPercent = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  createP('Drag the mouse to generate new boids.');

      colorMode(HSB);
  
  flock = new Flock();

  // Add an initial set of boids into the system
  for (let i = 0; i < 10; i++) {
    let ranx = random(400);
    if (ranx > 200) {
    ranx += width;
      } else {
        ranx = - ranx;
        }
    let rany = random(height);
    let b = new Boid(ranx, rany);
    flock.addBoid(b);
  }

  describe(
    'A group of bird-like objects, represented by triangles, moving across the canvas, modeling flocking behavior.'
  );
}

function draw() {
  
    background(0, 0, 50);
  circle(width/2,height/2,width/2)
  
  text("Altezza della finestra: " + windowHeight, windowWidth/2, windowHeight/2);
  text("Altezza dello schermo: " + displayHeight, windowWidth/2, windowHeight/2+20);
  text("Altezza del documento: "+ Math.max( document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight), windowWidth/2, windowHeight/2+40);
  
    scrollYPos = window.scrollY; // Aggiorna la variabile di scorrimento
  
  text("Scroll Y: " + scrollYPos, windowWidth/2, windowHeight/2+60);
  
  let documentHeight = document.documentElement.scrollHeight - windowHeight; //altezza scrollabile
  scrollPercent = (window.scrollY / documentHeight) * 100;
  text("Scroll %: " + scrollPercent.toFixed(2) + "%", windowWidth/2, windowHeight/2+80);
  
  if (scrollPercent > 50 && scrollPercent < 70){
    scappate = true;
  } else {
   //scappate = false;
  }
  
  flock.run();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// On mouse drag, add a new boid to the flock
//function mouseDragged() {
//  flock.addBoid(new Boid(mouseX, mouseY));
//}

// On mouse drag, add a new boid to the flock
function mouseReleased() {
  scappate =! scappate;
}

// Flock class to manage the array of all the boids
class Flock {
  constructor() {
    // Initialize the array of boids
    this.boids = [];
  }

  run() {
    for (let boid of this.boids) {
      // Pass the entire list of boids to each boid individually
      boid.run(this.boids);
    }
  }

  addBoid(b) {
    this.boids.push(b);
  }

}

class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.size = random(8, 12);

    // Maximum speed
    this.maxSpeed = 1;

    // Maximum steering force
    this.maxForce = 0.01;

    this.color = color(random(256), 255, 255);
  }

  run(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
  }

  applyForce(force) {
    // We could add mass here if we want: A = F / M
    this.acceleration.add(force);
  }

  // We accumulate a new acceleration each time based on three rules
  flock(boids) {
    let separation = this.separate(boids);
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);

    // Arbitrarily weight these forces
    

    
    if (scappate == true) {
    separation.mult(100.0);
    alignment.mult(10.0);
    cohesion.mult(10.0);
    } else {
    separation.mult(2.0);
    alignment.mult(1.0);
    cohesion.mult(1.0);
      }
    //separation.mult(1);
    //alignment.mult(1);
    //cohesion.mult(1);

    // Add the force vectors to acceleration
    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);
  }

  // Method to update location
  update() {
    // Update velocity
    this.velocity.add(this.acceleration);

    // Limit speed

    
    
    if (scappate == true){
      this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity.mult(10));
    } else {  
      this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity.mult(1));
    }
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    // A vector pointing from the location to the target
    //let desired = p5.Vector.sub(target, this.position);

    
    let desired = p5.Vector.sub(target, this.position);

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxSpeed);
    
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);

          steer.limit(this.maxForce);
          
    return steer;
        
  }

  render() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + radians(90);
    fill(this.color);
    stroke(255);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.size * 2);
    vertex(-this.size, this.size * 2);
    vertex(this.size, this.size * 2);
    endShape(CLOSE);
    pop();
  }

  // Wraparound
  borders() {
    if (this.position.x < -this.size) {
      if (scappate == false){
        
      this.position.x = width + this.size;
      this.position.y = random(height);

          }
    }

    if (this.position.y < -this.size) {
       if (scappate == false){
      this.position.y = height + this.size;
         }
    }

    if (this.position.x > width + this.size) {
      if (scappate == false){
      this.position.x = -this.size;
      
        this.position.y = random(height);

        }
    }

    if (this.position.y > height + this.size) {
            if (scappate == false){

      this.position.y = -this.size;
              }
    }
  }

  
  // Separation
  // Method checks for nearby boids and steers away
  separate(boids) {
    let desiredSeparation = 30.0;
    let steer = createVector(0, 0);
    let count = 0;

    // For every boid in the system, check if it's too close
    for (let boid of boids) {
      let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boid.position);
        diff.normalize();

        // Scale by distance
        diff.div(distanceToNeighbor);
        steer.add(diff);

        // Keep track of how many
        count++;
      }
    }

    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  align(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  // Cohesion
  // For the average location (i.e., center) of all nearby boids, calculate steering vector towards that location
  cohesion(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      //return this.seek(sum); // Steer towards the location
      //let target = createVector(mouseX, mouseY);// Assegno il target che voglio io
      //let target = createVector(width/2, height/2);// Assegno il target che voglio io
      
     if(scappate == true){
         let target = createVector(width/2, height/2);
       //let target = this.position.add(-1,-1);

        return this.seek(target);
        
     } else {
       let target = createVector(width/2, height/2);
       return this.seek(target);
      }
      
    } else {
      return createVector(0, 0);
    }
  }
} // class Boid