let inputDir = { x: 0, y: 0 };

const bgMusic = new Audio("game-music-loop-6-144641.mp3");
const gameStart = new Audio("game-start-6104.mp3");
const snakeMove = new Audio("game-turn (mp3cut.net).mp3");
const eatFood = new Audio("game-eat-food.mp3");
const gameOver = new Audio("game-over-38511.mp3");

let speed = 3;
let score = 0;
let lastPaintTime = 0;

let snakeArr = [
  {
    x: 2,
    y: 2,
  },
];

let food = { x: 13, y: 6 };

function main(ctime) {
  let hs = localStorage.getItem("HighScore");
  if (hs === null) {
    val = 0;
    localStorage.setItem("HighScore", JSON.stringify(val));
  } else {
    val = JSON.parse(hs);
    highScore.innerHTML = "Highest Score: " + hs;
  }
  window.requestAnimationFrame(main);
  // console.log(ctime);
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
    return;
  }
  lastPaintTime = ctime;
  gameEngine();
}

// Snake Collide
function isCollide(snake) {
  // If Snake collides to it's body
  for (let i = 1; i < snakeArr.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true;
    }
  }
  // If Snake collides to the Wall
  if (
    snake[0].x >= 18 ||
    snake[0].x <= 0 ||
    snake[0].y >= 18 ||
    snake[0].y <= 0
  ) {
    return true;
  }
}

function gameEngine() {
  // countdown();
  bgMusic.play();
  if (isCollide(snakeArr)) {
    gameOver.play();
    bgMusic.pause();
    inputDir = { x: 0, y: 0 };
    snakeArr = [{ x: 2, y: 2 }];
    score = 0;
    ScoreBox.innerHTML = "Score: " + score;
    if(confirm("Game Over!! Would you like to play again?")){
      gameEngine();
    }
    else{
      window.close();
    }
    bgMusic.play();
  }

  // If Snake eat the FOOD then Increase Score and ReGenerate the FOOD
  if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
    eatFood.play();
    score += 1;
    if (score > val) {
      val = score;
      localStorage.setItem("HighScore", JSON.stringify(val));
      highScore.innerHTML = "Highest Score: " + val;
    }
    ScoreBox.innerHTML = "Score: " + score;
    snakeArr.unshift({
      x: snakeArr[0].x + inputDir.x,
      y: snakeArr[0].y + inputDir.y,
    });
    let a = 1;
    let b = 17;
    food = {
      x: Math.round(a + (b - a) * Math.random()),
      y: Math.round(a + (b - a) * Math.random()),
    };
  }
  // Move to Snake
  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }
  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  // display snake and food
  // display snake
  board.innerHTML = "";
  snakeArr.forEach((e, index) => {
    snakeElem = document.createElement("div");
    snakeElem.style.gridRowStart = e.y;
    snakeElem.style.gridColumnStart = e.x;

    if (index == 0) {
      snakeElem.classList.add("head");
    } else {
      snakeElem.classList.add("snakeBody");
    }
    board.appendChild(snakeElem);

    // display food
    foodElem = document.createElement("div");
    foodElem.style.gridRowStart = food.y;
    foodElem.style.gridColumnStart = food.x;
    board.appendChild(foodElem);
    foodElem.classList.add("food");
  });
}

window.requestAnimationFrame(main);

window.addEventListener("keydown", (e) => {
  inputDir = { x: 0, y: 0 };
  snakeMove.play();

  switch (e.key) {
    case "ArrowUp":
      inputDir.x = 0;
      inputDir.y = -1;
      break;

    case "ArrowDown":
      inputDir.x = 0;
      inputDir.y = 1;
      break;

    case "ArrowLeft":
      inputDir.x = -1;
      inputDir.y = 0;
      break;

    case "ArrowRight":
      inputDir.x = 1;
      inputDir.y = 0;
      break;

    default:
      break;
  }
});

// Countdown Function
/*
function countdown() {
  let cd = document.getElementById("countdown");
  let count = 3;
  let intervalId = setInterval(() => {
    cd.innerHTML = count;
    count--;
    if (count < 0) {
      cd.innerHTML = "GO!";
      cd.style.color = "green";
      clearInterval(this);
    }
  }, 1000);
}
*/
