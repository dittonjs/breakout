class Paddle extends multiple([Collider]) {
  constructor(game){
    super(game);
    this.name = 'paddle';
    this.transform = new Transform(
      (game.canvas.width / 2),
      (game.canvas.height) - (game.canvas.height / 6)
    );
    this.width = 100;
    this.height = 20;
    this.setColliderType(
      'box',
      {
        width: this.width,
        height: this.height,
        useWalls: true
      }
    );
    this.speed = 600;
  }

  setWidth(width){
    this.width = width;
    this.setColliderType(
      'box',
      {
        width: this.width, height: this.height,
        useWalls: true
      }
    );
  }

  onCollision(other, dir){
    if(other.name == 'wall'){
      if(dir == 'right') this.transform.x = this.game.width - (this.width / 2) - 1;
      if(dir == 'left') this.transform.x = (this.width / 2) + 1;
    }
  }

  update(deltaTime){
    this.transform.translate(
      deltaTime / 1000 * this.speed * (this.game.input.getAxis('x')),
      0
    );
  }

  render(){
    this.game.graphics.drawRect(
      this.transform,
      this.width,
      this.height,
      {
        fillStyle: "#4CAF50",
        strokeStyle: null,
      }
    );
  }
}

class PaddleDisplay extends GameObject {
  render(){
    for(let i = 0; i < this.scene.lives; i++){
      this.game.graphics.drawRect(
        {x: 50+(i*60), y: 20},
        50,
        10,
        {
          fillStyle: "#4CAF50",
          strokeStyle: null,
        }
      );
    }
  }
}

class ScoreDisplay extends GameObject {
  render(){
    this.game.graphics.drawText(
      {x: 20, y: this.game.height - 20},
      this.scene.score,
      {
        textAlign: 'center',
        font: '20px Roboto',
        fillStyle: 'white'
      }
    )
  }
}

class BrickParticle extends Particle {
  constructor(...args){
    super(...args);
    this.transform = new Transform(
      this.parent.transform.x + _.random(-20, 20),
      this.parent.transform.y + _.random(-20, 20)
    );
    this.transform.rotation = (this.transform.x - this.parent.transform.x);
    this.angularVelocity = this.transform.rotation > 0 ? _.random(90, 1080) : _.random(-90, 1080);
    this.xVelocity = 10 * (this.transform.x - this.parent.transform.x);
    this.yVelocity = 10 * (this.transform.y - this.parent.transform.y);
    this.gravity = 0;
  }
  update(elapsedTime){
    this.gravity += (9.8 * 100 * (elapsedTime/1000)*(elapsedTime/1000));
    this.transform.rotate(this.angularVelocity * (elapsedTime/1000));
    this.transform.translate(
      this.xVelocity * (elapsedTime/1000) + (this.parent.ballVector.x * 500 * (elapsedTime/1000)),
      (this.yVelocity * (elapsedTime/1000)) + (-this.parent.ballVector.y * 500 * (elapsedTime/1000)) + this.gravity
    );
  }
  render(){
    this.game.graphics.drawRect(
      this.transform,
      10,
      10,
      {
        fillStyle: this.opts.color,
        strokeStyle: null,
      }
    );
  }
}

class BrickParticleEffect extends ParticleEffect {
  constructor(...args){
    super(...args);
    this.transform = this.parent.transform; // this links them together
    this.ballVector = null;
  }
}

class BallParticle extends Particle {
  constructor(...args){
    super(...args);
    this.transform.x = this.parent.transform.x;
    this.transform.y = this.parent.transform.y;
    this.radius = this.parent.parent.radius;
    this.lifetime = 500;
    this.totalElapsed = 0;
  }
  awake(){
    this.transform.y = this.parent.transform.y;
    this.transform.x = this.parent.transform.x;
    this.totalElapsed = 0;
  }
  update(elapsedTime){
    this.totalElapsed += elapsedTime;
    if(this.totalElapsed > this.lifetime){
      this.disable();
    }
  }
  render(){
    const radius = this.radius - (10/(this.lifetime/this.totalElapsed));
    if(radius < 0) return;
    this.game.graphics.drawCircle(
      this.transform,
      radius,
      {
        fillStyle: 'lightgrey',
        shouldStroke: false,
      }
    )
  }
}

class BallParticleEffect extends ParticleEffect {
  constructor(...args){
    super(...args);
    this.transform = this.parent.transform; // this links them together
  }

  update(elapsedTime){
    this.transform = this.parent.transform;
    super.update(elapsedTime);
  }
}

class Brick extends multiple([Collider]){
  constructor(color, x, y, ...args){
    super(...args);
    this.name = 'brick';
    this.setColliderType(
      'box',
      {
        width: this.scene.brickWidth, height: 30
      }
    );
    this.particleEffect = null;
    this.color = color;
    this.transform.x = x;
    this.transform.y = y;
  }

  onDestroy(){
    if(!_.find(this.scene.staticGameObjects, obj=>obj.name=='brick' && obj!=this)){
      this.scene.highScoreAndTransition();
    }
    if(!this.scene.smallPaddle && this.transform.y == 200){
      this.scene.smallPaddle = true;
      this.scene.player.setWidth(60);
    }
    this.scene.addDestroyedBrick()
    this.addScore();
    this.particleEffect.play();
  }

  addScore(){
    this.checkIfLineCleared();
    if(this.color == 'yellow'){
      this.scene.score += 1;
      this.addBallScore(1);
    }
    if(this.color == 'orangered'){
      this.scene.score += 2;
      this.addBallScore(2);
    }
    if(this.color == 'blue'){
      this.scene.score += 3;
      this.addBallScore(3);
    }
    if(this.color == 'green'){
      this.scene.score += 4;
      this.addBallScore(4);
    }
  }

  checkIfLineCleared(){
    const thisRow = _.filter(this.scene.staticGameObjects, (obj) =>(
      obj.name == 'brick' && obj.transform.y == this.transform.y && obj != this
    ));
    if(!thisRow.length){
      this.scene.score += 25;
      this.addBallScore(25);
    }
  }

  addBallScore(score){
    this.scene.newBallPoints += score;
    if(this.scene.newBallPoints > 100){
      this.scene.newBallPoints = this.scene.newBallPoints - 100;
      const newBall = this.scene.instantiate(Ball, false, [this.scene.player.transform.x, this.scene.player.transform.y - 30])
      this.scene.balls.push(newBall);
    }
  }

  awake(){
    const particleEffectOpts = {
      allAtOnce: true,
      particleCount: 10,
      particleClass: BrickParticle,
      lifetime: 2000,
      particleOpts: {
        color: this.color
      }
    }
    this.particleEffect = this.scene.instantiate(BrickParticleEffect, false, [particleEffectOpts], this);
  }

  render(){
    this.game.graphics.drawRect(
      this.transform,
      this.scene.brickWidth,
      30,
      {
        fillStyle: this.color,
        strokeStyle: null,
      }
    );
  }
}

class Ball extends multiple([Collider]){
  constructor(x,y,...args){
    super(...args);
    this.name = 'ball';
    const startAngle = 45;//80 + this.game.math.random(20);
    this.radius = 10;
    this.vector = new Vector(
      this.game.math.cos(startAngle),
      this.game.math.sin(startAngle)
    );
    this.setColliderType(
      'box',
      {
        width: this.radius,
        height: this.radius,
        useWalls: true,
      }
    );
    this.transform.x = x;
    this.transform.y = y;
  }

  awake(){
    const particleEffectOpts = {
      particleCount: 100,
      particleClass: BallParticle
    }
    this.particleEffect = this.scene.instantiate(BallParticleEffect, false, [particleEffectOpts], this);
    this.particleEffect.play();
  }

  onCollision(other, dir){
    if(other.name == 'paddle'){
      const diff = this.transform.x - other.transform.x;
      this.vector.x = this.game.math.cos(90 - (1.5*diff));
      this.vector.y = this.game.math.sin(90 - (1.5*diff));
      // this.game.musicGenerator.addToQueue()
      return;
    }
    if(other.name == 'brick') {
      this.scene.destroy(other);
      other.particleEffect.ballVector = new Vector(
        this.vector.x,
        this.vector.y
      );
      if(dir == 'left') this.vector.x = Math.abs(this.vector.x);
      if(dir == 'right') this.vector.x = -1*Math.abs(this.vector.x);
      if(dir == 'top') this.vector.y = -1*Math.abs(this.vector.y);
      if(dir == 'bottom') this.vector.y = Math.abs(this.vector.y);
    }
    if(other.name == 'wall') {
      if(dir == 'left') this.vector.x = Math.abs(this.vector.x);
      if(dir == 'right') this.vector.x = -1*Math.abs(this.vector.x);
      if(dir == 'top') this.vector.y = -1*Math.abs(this.vector.y);
      if(dir == 'bottom') {
        if(this.scene.balls.length > 1){
          this.particleEffect.stop();
          this.scene.destroy(this);
          _.remove(this.scene.balls, this);
        } else {
          // stops particles from remaining after death
          this.particleEffect.stop();
          this.particleEffect.play();
          this.scene.smallPaddle = false;
          this.scene.player.setWidth(100);
          this.scene.resetForNewLifeAndCountDown();
        }
      }
    }
    // this.game.musicGenerator.addToQueue();
  }

  update(deltaTime){
    this.transform.translate(
      this.vector.x * this.scene.ballSpeed * deltaTime / 1000,
      -1 * (this.vector.y * this.scene.ballSpeed * deltaTime / 1000)
    );
  }

  render(){
    this.game.graphics.drawCircle(
      this.transform,
      this.radius,
      {
        fillStyle: 'white',
        shouldStroke: false,
      }
    )
  }
}
