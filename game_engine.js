// Transform
// Handles motion and position


class Transform {
  constructor(x, y, rotation){
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }

  rotate(rotation){
    this.rotation += rotation;
  }

  translate(x, y){
    this.x += x;
    this.y += y;
  }
}

class Vector {
  constructor(x, y){
    // normal vector less than 1 corresponds to sin and cos functions.
    this.x = x;
    this.y = y;
  }

}

function multiple(parents){
  let GameObjectWithMixin = class extends GameObject{
    constructor(...args){
      super(...args);
    }
  };
  _.each(parents, (className)=>{
    _.each(Object.getOwnPropertyNames(className.prototype), (name)=>{
      if(name != "constructor"){
        GameObjectWithMixin.prototype[name] = className.prototype[name];
      }
    });
  });
  return GameObjectWithMixin;
}

// MIXINS
class Collider {

  _onCollision(other, dir){
    this.onCollision && this.onCollision(other, dir);
  }

  _checkCollision(other){
    if(other === this) {
      this._collider_opts.useWalls && this._checkWallCollision();
      return;
    }
    const {isBetween} = this.game.math;
    const {width:myWidth, height:myHeight} = this._collider_opts;
    const {width:otherWidth, height:otherHeight} = other._collider_opts;
    const {x:myX, y:myY} = this.transform;
    const {x:otherX, y:otherY} = other.transform;
    if( isBetween(otherX - (otherWidth/2), otherX+(otherWidth/2), myX + (myWidth/2)) &&
        (
          isBetween(otherY-(otherHeight/2), otherY+(otherHeight/2), myY - (myHeight/2)) ||
          isBetween(otherY-(otherHeight/2), otherY+(otherHeight/2), myY + (myHeight/2))
        ) && myX < otherX-(otherWidth/2)
      ){
      this._onCollision(other, 'right');
    }
    if( isBetween(otherX - (otherWidth/2), otherX+(otherWidth/2), myX - (myWidth/2)) &&
        (
          isBetween(otherY-(otherHeight/2), otherY+(otherHeight/2), myY - (myHeight/2)) ||
          isBetween(otherY-(otherHeight/2), otherY+(otherHeight/2), myY + (myHeight/2))
        ) && myX > otherX+(otherWidth/2)
      ){
      this._onCollision(other, 'left');
    }
    // on top

    if( isBetween(otherY - (otherHeight/2), otherY+(otherHeight/2), myY -(myHeight/2)) &&
        (
          isBetween(otherX-(otherWidth/2), otherX+(otherWidth/2), myX - (myWidth/2)) ||
          isBetween(otherX-(otherWidth/2), otherX+(otherWidth/2), myX + (myWidth/2))
        ) && myY > otherY+(otherHeight/2)
      ){
      this._onCollision(other, 'top');
    }

    // on bottom
    if( isBetween(otherY - (otherHeight/2), otherY+(otherHeight/2), myY + (myHeight/2)) &&
        (
          isBetween(otherX-(otherWidth/2), otherX+(otherWidth/2), myX - (myWidth/2)) ||
          isBetween(otherX-(otherWidth/2), otherX+(otherWidth/2), myX + (myWidth/2))
        ) && myY < otherY-(otherHeight/2)
      ){
      this._onCollision(other, 'bottom');
    }

  }
  _checkWallCollision(){
    if(this.transform.x - (this._collider_opts.width/2) < 0) this._onCollision({name: 'wall'}, 'left');
    if(this.transform.x + (this._collider_opts.width/2) > this.game.width) this._onCollision({name: 'wall'}, 'right');
    if(this.transform.y - (this._collider_opts.height/2) < 0 ) this._onCollision({name: 'wall'}, 'top');
    if(this.transform.y + (this._collider_opts.height/2) > this.game.height) this._onCollision({name: 'wall'}, 'bottom');
  }
  setColliderType(type, opts = {}){
    this._collider_type = type; // one of 'box' or 'circle'
    this._collider_opts = opts;
  }
}

// Math
// basically just extentions of the math library
class JMath {
  sin(degrees){
    return Math.sin(this.degToRad(degrees));
  }

  cos(degrees){
    return Math.cos(this.degToRad(degrees));
  }

  degToRad(deg){
    return deg * (Math.PI/180);
  }

  radToDeg(rad){
    return rad * (180/Math.PI);
  }

  asin(val){
    return radToDeg(Math.asin(val));
  }

  acos(val){
    return radToDeg(Math.acos(val));
  }

  isBetween(lower, upper, target){
    return target >= lower && target <= upper;
  }

  random(top){
    return Math.floor((Math.random() * top));
  }
}

// GameInput
// handles axis and probably other stuff in the future

class GameInput {
  constructor(){
    this.axis = {
      x: 0,
      y: 0,
      fire: 0,
    }
    this.axisListener = this.axisListener.bind(this);
    window.addEventListener("keydown", this.axisListener);
    window.addEventListener("keyup", this.axisListener);
  }

  setAxis(axis, value){
    this.axis[axis] = value;
  }

  getAxis(axis){
    return this.axis[axis];
  }

  axisListener(e){
    e.preventDefault();
    switch(e.keyCode){
      case 38:
      case 87:
      case 73: {
        let val;
        if(e.type == "keydown"){
          val = -1;
        }
        if(e.type == "keyup"){
          if(this.getAxis('y') == -1){
            val = 0;
          } else {
            val = this.getAxis('y');
          }
        }
        this.setAxis('y', val);
        break;
      }
      case 40:
      case 83:
      case 75:{
        let val;
        if(e.type == "keydown"){
          val = 1;
        }
        if(e.type == "keyup"){
          if(this.getAxis('y') == 1){
            val = 0;
          } else {
            val = this.getAxis('y');
          }
        }
        this.setAxis('y', val);
        break;
      }
      case 37:
      case 65:
      case 74:{
        let val;
        if(e.type == "keydown"){
          val = -1;
        }
        if(e.type == "keyup"){
          if(this.getAxis('x') == -1){
            val = 0;
          } else {
            val = this.getAxis('x');
          }
        }
        this.setAxis('x', val);
        break;
      }
      case 39:
      case 68:
      case 76: {
        let val;
        if(e.type == "keydown"){
          val = 1;
        }
        if(e.type == "keyup"){
          if(this.getAxis('x') == 1){
            val = 0;
          } else {
            val = this.getAxis('x');
          }
        }
        this.setAxis('x', val);
        break;

      }
      case 32: {
        this.setAxis('fire', e.type == 'keydown' ? 1 : 0);
      }
      default:
        break;
    }
  }
}

// GameObject
// The base class for all game objects in the game

class GameObject {

  constructor(game, scene, parent){
    this.transform = new Transform(0,0);
    this.game = game;
    this.parent = parent;
    this.scene = scene;
  }

  awake(){}

  onDestroy(){}

  update(elapsedTime){}

  render(context){};
}

class MenuOption extends GameObject {
  constructor(text, ...args){
    super(...args);
    this.text = text;
    this._onClick = () => {};
    this.isFocused = false;
    this.focusedColor = "#4CAF50";
    this.standardColor = "white";
  }

  onClick(callback){
    this._onClick = callback;
  }

  update(){
    _.each(this.game.readyInput, input => {
      if(input.key == 'confirm' && this.isFocused){
        this._onClick(this);
      }
    });
  }

  render(){
    this.game.graphics.drawText(
      this.transform,
      this.text,
      {
        textAlign: 'center',
        font: '50px Roboto',
        fillStyle: this.isFocused ? this.focusedColor : this.standardColor
      }
    )
  }
}

class Particle extends GameObject {
  constructor(opts, ...args){
    super(...args);
    this.opts = opts;
  }

  disable(){
    this.parent.readyForDisable.push(this);
  }
}

class ParticleEffect extends GameObject {
  constructor(opts = {}, ...args) {
    super(...args);
    this.opts = opts;
    this.activeParticles = [];
    this.waitingParticles = [];
    this.readyForDisable = [];
    this.playing = false;
    this.spawnTime = 0;
    this.timePlaying = 0;
    this.spawnElapsed = 0;
  }

  awake(){
    this.buildParticles();
  }

  buildParticles(){
    for(let i = 0; i < this.opts.particleCount; i++){
      this.waitingParticles.push(new this.opts.particleClass(this.opts.particleOpts, this.game, this.scene, this));
    }
  }

  play(){
    if(this.playing) return;
    this.playing = true;
    if(this.opts.allAtOnce){
      this.activeParticles = [...this.waitingParticles];
      this.waitingParticles = [];
      _.each(this.activeParticles, particle => particle.awake());
    } else {
      this.spawnTime = this.opts.spawnTime || (1000 / this.opts.particleCount);
    }
  }

  stop(){
    if(!this.playing) return;
    this.timePlaying = 0;
    this.playing = false;
    this.waitingParticles = [...this.waitingParticles, ...this.activeParticles, ...this.readyForDisable];
    this.readyForDisable = [];
    this.activeParticles = [];
  }

  update(elapsedTime){
    if(!this.playing) return;
    this.timePlaying += elapsedTime;
    this.spawnElapsed += elapsedTime;
    if(this.opts.lifetime && this.timePlaying > this.opts.lifetime){
      this.stop();
      return;
    }
    if (this.opts.allAtOnce) {
      _.each(this.activeParticles, particle => particle.update(elapsedTime));
    } else {
      if(this.spawnElapsed > this.spawnTime){
        this.spawnElapsed = 0;
        if(this.waitingParticles.length){
          const next = this.waitingParticles.shift();
          next.awake();
          this.activeParticles.push(next);
        }
      }
      _.each(this.activeParticles, particle => particle.update(elapsedTime));
    }
    _.each(this.readyForDisable, particle => _.remove(this.activeParticles, particle));
    this.waitingParticles = [...this.waitingParticles, ...this.readyForDisable];
    this.readyForDisable = [];
  }

  render(){
    if(!this.playing) return;
    _.each(this.activeParticles, particle => particle.render());
  }
}

class GameSounds extends GameObject {
  constructor(soundFiles, format, source, ...args){
    super(...args);
    this.soundFiles = soundFiles;
    this.sounds = {};
    this.source = source;
    this.format = format;
    this._initializeSounds();
  }
  _initializeSounds(){
    _.each(this.soundFiles, (fileName) => {
      let sound = new Audio();
      sound.src = `${this.source}/${fileName}.${this.format}`;
      this.sounds[fileName] = sound;
    });
  }
}

// Game
// The base class for the game.

class Game {
  constructor(canvas){
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext('2d');
    this.graphics = new JdCanvasApi(this.context);
    this.pendingInput = [];
    this.readyInput = [];
    this.elapsedTime = 0;
    this.math = new JMath();
    this.input = new GameInput();
    this.shouldContinue = true;
    this.gameLoop = this.gameLoop.bind(this);
    this.menuInput = this.menuInput.bind(this);
    this.resetTimestamp = true;
    this.scenes = [];
    this.currentScene = 0;
    this.nextScene = null;
    window.addEventListener('keydown', this.menuInput);
  }

  awake(){
    this.start();
  }

  start(){
    requestAnimationFrame(this.gameLoop);
  }

  stop(){
    this.shouldContinue = false;
  }

  addScene(scene){
    scene.awake()
    this.scenes.push(scene);
  }

  changeScene(scene){
    console.log("change scene", scene);
    this.nextScene = scene;
  }

  gameLoop(timestamp) {
    if(this.resetTimestamp){
      this.elapsedTime = timestamp;
      this.resetTimestamp = false;
      requestAnimationFrame(this.gameLoop);
      return;
    }
    const timeSinceLastUpdate = timestamp - this.elapsedTime;
    this.elapsedTime = timestamp;

    if(this.nextScene != null){
      this.scenes[this.currentScene].onTransitionFrom(this.nextScene);
      this.scenes[this.nextScene].onTransitionTo(this.currentScene);
      this.currentScene = this.nextScene;
      this.nextScene = null;
    }

    this.getInput();
    this.update(timeSinceLastUpdate);
    this.render();
    this.clearInput();
    this.shouldContinue && requestAnimationFrame(this.gameLoop);
  }

  getInput(){
    this.readyInput = [...this.pendingInput];
    this.pendingInput = [];
  }

  menuInput(e){
    e.preventDefault();

    switch (e.keyCode) {
      case 38:
      case 87:
      case 73:
        this.pendingInput.push({key: 'up'});
        break;
      case 40:
      case 83:
      case 75:
        this.pendingInput.push({key: 'down'});
        break;
      case 37:
      case 65:
      case 74:
        this.pendingInput.push({key: 'left'});
        break;
      case 39:
      case 68:
      case 76:
        this.pendingInput.push({key: 'right'});
        break;
      case 13:
        this.pendingInput.push({key: 'confirm'});
        break;
      case 27:
        this.pendingInput.push({key: 'escape'});
        break;
      default:
        break;
    }
  }

  checkCollisions(){
    _.each(this.scenes[this.currentScene].gameObjects, (obj)=>{
      _.each(this.scenes[this.currentScene].gameObjects, (other)=>{
        obj._checkCollision && other._checkCollision && obj._checkCollision(other);
      });
      _.each(this.scenes[this.currentScene].staticGameObjects, (other)=>{
        obj._checkCollision && other._checkCollision && obj._checkCollision(other);
      });
    });
  }

  update(timeSinceLastUpdate){
    if(this.scenes[this.currentScene]){
      this.scenes[this.currentScene].update(timeSinceLastUpdate);
      _.each(this.scenes[this.currentScene].gameObjects, gameObject => gameObject.update(timeSinceLastUpdate));
      this.checkCollisions();
      this.scenes[this.currentScene]._destroyQueue();
    }
  }

  render(){
    if(this.scenes[this.currentScene]){
      this.clearForRerender();
      this.scenes[this.currentScene].render();
      _.each(this.scenes[this.currentScene].staticGameObjects, gameObject => gameObject.render(this.context));
      _.each(this.scenes[this.currentScene].gameObjects, gameObject => gameObject.render(this.context));
    }
  }

  clearForRerender(){
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
  }

  clearInput(){
    this.readyInput = [];
  }
}

class GameScene {
  constructor(name, game){
    this.gameObjects = [];
    this.staticGameObjects = [];
    this.game = game;
    this._toBeDestroyed = [];
    this.name = name;
  }

  awake(){}
  update(){}
  render(){}
  onTransitionTo(){}
  onTransitionFrom(){}

  instantiate(gameObject, isStatic, constructArgs = [], parent){
    const obj = new gameObject(...constructArgs, this.game, this, parent);
    if(isStatic){
      this.staticGameObjects.push(obj);
      obj.awake();
    } else {
      this.gameObjects.push(obj);
      obj.awake();
    }
    return obj;
  }

  destroy(obj){
    obj.onDestroy();
    this._queueDestroy(obj)
  }

  _queueDestroy(obj){
    this._toBeDestroyed.push(obj);
  };

  _destroyQueue(){
    _.each(this._toBeDestroyed, (obj) => {
      _.remove(this.gameObjects, obj);
      _.remove(this.staticGameObjects, obj);
    })
    this._toBeDestroyed = [];
  }
}
