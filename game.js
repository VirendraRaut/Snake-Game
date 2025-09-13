let inputDir = { x: 0, y: 0 };

const bgMusic = new Audio("game-music-loop-6-144641.mp3");
const gameStart = new Audio("game-start-6104.mp3");
const snakeMove = new Audio("game-turn (mp3cut.net).mp3");
const eatFood = new Audio("game-eat-food.mp3");
const gameOverSound = new Audio("game-over-38511.mp3");

bgMusic.loop = true;

let speed = 5;
let score = 0;
let lastPaintTime = 0;
let musicStarted = false;

let snakeArr = [{ x: 2, y: 2 }];
let food = { x: 13, y: 6 };

let board = document.getElementById("board");
let ScoreBox = document.getElementById("ScoreBox");
let highScoreBox = document.getElementById("highScore");

// High Score
let highScoreVal = localStorage.getItem("HighScore") || 0;
highScoreBox.innerHTML = "Highest Score: " + highScoreVal;

function main(ctime) {
  window.requestAnimationFrame(main);
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) return;
  lastPaintTime = ctime;
  gameEngine();
}

function isCollide(snake) {
  // Self collision
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  // Wall collision
  return (
    snake[0].x >= 18 || snake[0].x <= 0 || snake[0].y >= 18 || snake[0].y <= 0
  );
}

function resetGame() {
  gameOverSound.play();
  bgMusic.pause();
  alert("Game Over! Press OK to play again.");
  inputDir = { x: 0, y: 0 };
  snakeArr = [{ x: 2, y: 2 }];
  score = 0;
  ScoreBox.innerHTML = "Score: " + score;
  bgMusic.currentTime = 0;
  if (musicStarted) bgMusic.play().catch(() => {});
}

function randomFood() {
  let a = 2, b = 16;
  let newFood;
  do {
    newFood = {
      x: Math.floor(a + (b - a) * Math.random()),
      y: Math.floor(a + (b - a) * Math.random())
    };
  } while (snakeArr.some(seg => seg.x === newFood.x && seg.y === newFood.y));
  return newFood;
}

function gameEngine() {
  // Collide check
  if (isCollide(snakeArr)) {
    resetGame();
    return;
  }

  // If food eaten
  if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
    eatFood.play();
    score++;
    if (score > highScoreVal) {
      highScoreVal = score;
      localStorage.setItem("HighScore", highScoreVal);
      highScoreBox.innerHTML = "Highest Score: " + highScoreVal;
    }
    ScoreBox.innerHTML = "Score: " + score;
    snakeArr.unshift({
      x: snakeArr[0].x + inputDir.x,
      y: snakeArr[0].y + inputDir.y,
    });
    food = randomFood();
  }

  // Move snake
  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }
  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  // Display
  board.innerHTML = "";

  snakeArr.forEach((e, index) => {
    let snakeElem = document.createElement("div");
    snakeElem.style.gridRowStart = e.y;
    snakeElem.style.gridColumnStart = e.x;
    snakeElem.classList.add(index === 0 ? "head" : "snakeBody");
    board.appendChild(snakeElem);
  });

  let foodElem = document.createElement("div");
  foodElem.style.gridRowStart = food.y;
  foodElem.style.gridColumnStart = food.x;
  foodElem.classList.add("food");
  board.appendChild(foodElem);
}

window.requestAnimationFrame(main);

// Controls
let lastDir = { x: 0, y: 0 };
window.addEventListener("keydown", (e) => {
  // Start music and game sound on first key press
  if (!musicStarted) {
    bgMusic.play().catch(() => {});
    gameStart.play().catch(() => {});
    musicStarted = true;
  }

  let newDir = { ...inputDir };
  switch (e.key) {
    case "ArrowUp":    newDir = { x: 0, y: -1 }; break;
    case "ArrowDown":  newDir = { x: 0, y: 1 }; break;
    case "ArrowLeft":  newDir = { x: -1, y: 0 }; break;
    case "ArrowRight": newDir = { x: 1, y: 0 }; break;
  }
  // prevent reversing
  if (newDir.x !== -lastDir.x || newDir.y !== -lastDir.y) {
    inputDir = newDir;
    lastDir = newDir;
    snakeMove.play();
  }
});

// Mobile Controls
document.getElementById("btnUp").addEventListener("click", () => {
  if (lastDir.y !== 1) { inputDir = { x: 0, y: -1 }; lastDir = inputDir; snakeMove.play(); }
});

document.getElementById("btnDown").addEventListener("click", () => {
  if (lastDir.y !== -1) { inputDir = { x: 0, y: 1 }; lastDir = inputDir; snakeMove.play(); }
});

document.getElementById("btnLeft").addEventListener("click", () => {
  if (lastDir.x !== 1) { inputDir = { x: -1, y: 0 }; lastDir = inputDir; snakeMove.play(); }
});

document.getElementById("btnRight").addEventListener("click", () => {
  if (lastDir.x !== -1) { inputDir = { x: 1, y: 0 }; lastDir = inputDir; snakeMove.play(); }
});
