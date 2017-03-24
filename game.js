

class BreakoutScene extends GameScene {
  constructor(...args){
    super(...args);
    this.player = null;
    this.balls = [];
    this.musicGenerator = null;
    this.brickWidth = 58;
    this.lives = 3;
    this.score = 0;
    this.destroyedBricks = 0;
    this.newBallPoints = 0;
    this.smallPaddle = false;
  }


  awake(){
    this.score = 0;
    this.destroyedBricks = 0;
    this.lives = 3;
    this.player = this.instantiate(Paddle, false);
    this.balls = [this.instantiate(Ball, false, [this.player.transform.x, this.player.transform.y - 30])];
    this.paddleDisplay = this.instantiate(PaddleDisplay, true);
    this.scoreDisplay = this.instantiate(ScoreDisplay, true);
    this.newBallPoints = 0;
    this.smallPaddle = false;
    this.buildBricks();
    this.ballSpeed = 300;
    window.GAME = this; // for debugging
  }

  onTransitionFrom(next){
    if(next == 1){
      this.balls[0].vector = new Vector(
        this.game.math.cos(45),
        this.game.math.sin(45)
      );
    }
    if(next == 5){
      this.gameObjects = [];
      this.staticGameObjects = [];
      this.awake();
    }
  }

  resetForNewLifeAndCountDown(){
    if(this.balls.length > 1) return;
    this.lives -= 1;
    this.destroyedBricks = 0;
    if(this.lives == 0){
      this.highScoreAndTransition();
    } else {
      this.player.transform.x = this.game.canvas.width / 2;
      this.balls[0].transform.x = this.player.transform.x;
      this.balls[0].transform.y = this.player.transform.y - 30;
      this.game.changeScene(1);
    }
  }

  highScoreAndTransition(){
    let scores = window.localStorage.getItem("highScores");
    if(!scores) scores = [];
    else scores = JSON.parse(scores);
    scores.push(this.score);
    scores = _.sortBy(scores).reverse().slice(0,5);
    window.localStorage.setItem("highScores", JSON.stringify(scores));
    this.game.changeScene(5);
  }

  buildBricks(){
    for(let i = 0; i < 8; i++){
      for(let j = 0; j < 14; j++){
        this.instantiate(
          Brick,
          true,
          [
            this.getColor(i),
            110 + (j*60), // xpos
            200 + (i*34) // ypos
          ]
        )
      }
    }
  }

  getColor(index){
    if(index < 2) return 'green';
    if(index < 4) return 'blue';
    if(index < 6) return 'orangered';
    return 'yellow';
  }

  addDestroyedBrick(){
    this.destroyedBricks += 1;
    if(this.destroyedBricks == 4) this.ballSpeed += 50;
    if(this.destroyedBricks == 12) this.ballSpeed += 50;
    if(this.destroyedBricks == 36) this.ballSpeed += 50;
    if(this.destroyedBricks == 62) this.ballSpeed += 50;
  }

  update(){
    _.each(this.game.readyInput, input => {
      if(input.key == "escape"){
        this.game.changeScene(3);
      }
    });
  }

}

class CountDown extends GameScene {
  constructor(...args){
    super(...args);
    this.transitionTime = 3000;
    this.changeTime = 1000;
    this.totalElapsed = 0;
    this.changeElapsed = 0;
    this.count = 3;
  }

  onTransitionTo(previous){
    this.count = 3;
    this.totalElapsed = 0;
    this.changeElapsed = 0;
  }

  update(elapsedTime){
    this.totalElapsed += elapsedTime;
    this.changeElapsed += elapsedTime;
    if(this.totalElapsed > this.transitionTime){
      this.game.changeScene(2);
    }
    if(this.changeElapsed > this.changeTime){
      this.changeElapsed = 0;
      this.count--;
    }
  }

  render(){
    _.each(this.game.scenes[2].staticGameObjects, gameObject => gameObject.render());
    _.each(this.game.scenes[2].gameObjects, gameObject => gameObject.render());
    this.game.graphics.drawText(
      {x: this.game.width/2, y:this.game.height/2},
      this.count,
      {
        textAlign: 'center',
        font: '500px Roboto',
        fillStyle: 'white'
      }
    )
  }
}

class MainMenu extends GameScene {
  constructor(...args){
    super(...args);
    this.menuOptions = [];
    this.currentOption = null;
    this.currentOptionIndex = 0;
  }

  awake(){
    _.each(["NEW GAME", "HIGH SCORES", "CREDITS", "RESET HIGH SCORES"], (text, index) => {
      const option = this.instantiate(MenuOption, false, [text]);
      option.transform.x = this.game.width/2;
      option.transform.y = 300 + (index * 100);
      option.onClick((obj)=>{
        if(text == "NEW GAME"){
          this.game.changeScene(1);
        } else if(text == "CREDITS"){
          this.game.changeScene(4);
        } else if(text == "HIGH SCORES"){
          this.game.changeScene(5);
        } else if (text == "RESET HIGH SCORES"){
          window.localStorage.removeItem("highScores");
          this.game.changeScene(5);
        }
      });
      this.menuOptions.push(option);
    });
    this.currentOption = this.menuOptions[this.currentOptionIndex];
    this.currentOption.isFocused = true;
  }

  update(){
    _.each(this.game.readyInput, input => {
      if(input.key == 'up' && this.currentOptionIndex > 0){
        console.log("up")
        this.currentOptionIndex -= 1;
        this.currentOption.isFocused = false;
        this.currentOption = this.menuOptions[this.currentOptionIndex];
        this.currentOption.isFocused = true;
      }
      if(input.key == 'down' && this.currentOptionIndex < this.menuOptions.length - 1){
        console.log("down");
        this.currentOptionIndex += 1;
        this.currentOption.isFocused = false;
        this.currentOption = this.menuOptions[this.currentOptionIndex];
        this.currentOption.isFocused = true;
      }
    });
  }

}

class Credits extends GameScene {

  update(elapsedTime){
    _.each(this.game.readyInput, input => {
      if(input.key == "escape"){
        this.game.changeScene(0);
      }
    });
  }

  render(){
    this.game.graphics.drawText(
      {x: this.game.width/2, y:this.game.height/2 - 50},
      "CREATED BY",
      {
        textAlign: 'center',
        font: '100px Roboto',
        fillStyle: 'white'
      }
    )
    this.game.graphics.drawText(
      {x: this.game.width/2, y:this.game.height/2 + 50},
      "JOSEPH DITTON",
      {
        textAlign: 'center',
        font: '100px Roboto',
        fillStyle: 'white'
      }
    )
  }
}

class HighScores extends GameScene {

  update(elapsedTime){
    _.each(this.game.readyInput, input => {
      if(input.key == "escape"){
        this.game.changeScene(0);
      }
    });
  }
  onTransitionTo(){
    this.highScores = this.parseHighScores();
  }
  parseHighScores(){
    const scores = window.localStorage.getItem("highScores");
    if(scores){
      return JSON.parse(scores);
    }
    return [];
  }
  render(){
    this.game.graphics.drawText(
      {x: this.game.width/2, y:this.game.height/2 - 300},
      "HIGHSCORES",
      {
        textAlign: 'center',
        font: '150px Roboto',
        fillStyle: 'white'
      }
    );
    _.each(this.highScores, (score, i)=>{
      this.game.graphics.drawText(
        {x: this.game.width/2, y:(this.game.height/2 - 150) + (i*150)},
        `${score}`,
        {
          textAlign: 'center',
          font: '100px Roboto',
          fillStyle: 'white'
        }
      );
    });
  }
}

class PauseMenu extends GameScene {
  constructor(...args){
    super(...args);
    this.menuOptions = [];
    this.currentOption = null;
    this.currentOptionIndex = 0;
  }

  awake(){
    _.each(["RESUME", "QUIT"], (text, index) => {
      const option = this.instantiate(MenuOption, false, [text]);
      option.transform.x = this.game.width/2;
      option.transform.y = 300 + (index * 70);
      option.onClick((obj)=>{
        if(text == "RESUME"){
          this.game.changeScene(2);
        } else {
          this.game.changeScene(0);
        }
      });
      this.menuOptions.push(option);
    });
    this.currentOption = this.menuOptions[this.currentOptionIndex];
    this.currentOption.isFocused = true;
  }
  onTransitionFrom(next){
    if(next == 0){
      this.game.scenes[2].gameObjects = [];
      this.game.scenes[2].staticGameObjects = [];
      this.game.scenes[2].awake();
    }
  }
  update(){
    _.each(this.game.readyInput, input => {
      if(input.key == 'up' && this.currentOptionIndex > 0){
        console.log("up")
        this.currentOptionIndex -= 1;
        this.currentOption.isFocused = false;
        this.currentOption = this.menuOptions[this.currentOptionIndex];
        this.currentOption.isFocused = true;
      }
      if(input.key == 'down' && this.currentOptionIndex < this.menuOptions.length - 1){
        console.log("down");
        this.currentOptionIndex += 1;
        this.currentOption.isFocused = false;
        this.currentOption = this.menuOptions[this.currentOptionIndex];
        this.currentOption.isFocused = true;
      }
    });
  }

  render(){
    _.each(this.game.scenes[2].staticGameObjects, gameObject => gameObject.render());
    _.each(this.game.scenes[2].gameObjects, gameObject => gameObject.render());
  }
}

function startGame(){
  const canvas = document.getElementById('main-canvas');
  const game = new Game(canvas);
  const coundDownScene = new CountDown("coundDown", game);
  const breakoutScene = new BreakoutScene("breakoutScene", game);
  const mainMenu = new MainMenu("mainMenu", game);
  const pauseMenu = new PauseMenu("pauseMenu", game);
  const credits = new Credits("credits", game);
  const highScores = new HighScores("highScores", game);
  game.addScene(mainMenu);
  game.addScene(coundDownScene);
  game.addScene(breakoutScene);
  game.addScene(pauseMenu);
  game.addScene(credits);
  game.addScene(highScores);
  game.start();
  return game;
};

(function(){
  let game = startGame();
})();
