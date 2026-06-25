// ========== AUDIO (Optional - graceful fallback) ==========
const bgMusic = new Audio("game-music-loop-6-144641.mp3");
const gameStart = new Audio("game-start-6104.mp3");
const eatFood = new Audio("game-eat-food.mp3");
const gameOverSound = new Audio("game-over-38511.mp3");
const snakeMove = new Audio("game-turn (mp3cut.net).mp3");

// Enable audio looping
bgMusic.loop = true;
bgMusic.volume = 0.3;

// ========== GAME STATE ==========
let inputDir = { x: 0, y: 0 };
let lastDir = { x: 0, y: 0 };
let speed = 3;
let score = 0;
let lastPaintTime = 0;
let musicStarted = false;
let gamePaused = false;
let gameOver = false;
let gameLoopId = null;

let snakeArr = [{ x: 8, y: 8 }];
let food = { x: 13, y: 8 };

// ========== DOM ELEMENTS ==========
const board = document.getElementById("board");
const ScoreBox = document.getElementById("ScoreBox");
const highScoreBox = document.getElementById("highScore");
const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const finalScore = document.getElementById("finalScore");
const finalHighScore = document.getElementById("finalHighScore");

// ========== HIGH SCORE ==========
let highScoreVal = parseInt(localStorage.getItem("SnakeProHighScore")) || 0;
highScoreBox.innerHTML = highScoreVal;

// ========== SCREEN MANAGEMENT ==========
function showScreen(screen) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

function showHome() {
  showScreen(homeScreen);
  gameOver = true;
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
  }
  bgMusic.pause();
  bgMusic.currentTime = 0;
  musicStarted = false;
}

function showGame() {
  showScreen(gameScreen);
  resetGame();
  startGame();
}

// ========== GAME ENGINE ==========
function main(ctime) {
  if (gameOver || gamePaused) {
    gameLoopId = requestAnimationFrame(main);
    return;
  }

  if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
    gameLoopId = requestAnimationFrame(main);
    return;
  }
  lastPaintTime = ctime;
  gameEngine();
  gameLoopId = requestAnimationFrame(main);
}

function startGame() {
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  gameOver = false;
  gamePaused = false;
  gameLoopId = requestAnimationFrame(main);
}

function gameEngine() {
  // Collision check
  if (isCollide(snakeArr)) {
    handleGameOver();
    return;
  }

  // Food eaten
  if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
    playSound(eatFood);
    score++;
    updateScore();
    snakeArr.unshift({
      x: snakeArr[0].x + inputDir.x,
      y: snakeArr[0].y + inputDir.y,
    });
    food = randomFood();
    // Speed up slightly
    if (score % 5 === 0 && speed < 15) {
      speed = Math.min(speed + 0.5, 15);
    }
  }

  // Move snake
  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }
  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  // Render
  renderBoard();
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

function renderBoard() {
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

function randomFood() {
  const a = 1,
    b = 17;
  let newFood;
  let attempts = 0;
  do {
    newFood = {
      x: Math.floor(a + (b - a) * Math.random()),
      y: Math.floor(a + (b - a) * Math.random()),
    };
    attempts++;
  } while (
    snakeArr.some((seg) => seg.x === newFood.x && seg.y === newFood.y) &&
    attempts < 100
  );
  return newFood;
}

// ========== SCORE MANAGEMENT ==========
function updateScore() {
  ScoreBox.innerHTML = score;
  if (score > highScoreVal) {
    highScoreVal = score;
    localStorage.setItem("SnakeProHighScore", highScoreVal);
    highScoreBox.innerHTML = highScoreVal;
  }
}

// ========== GAME OVER ==========
function handleGameOver() {
  gameOver = true;
  playSound(gameOverSound);
  bgMusic.pause();
  finalScore.innerHTML = score;
  finalHighScore.innerHTML = highScoreVal;
  gameOverOverlay.classList.remove("hidden");
}

function resetGame() {
  inputDir = { x: 0, y: 0 };
  lastDir = { x: 0, y: 0 };
  snakeArr = [{ x: 8, y: 8 }];
  food = randomFood();
  score = 0;
  speed = 3;
  gameOver = false;
  gamePaused = false;
  gameOverOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  ScoreBox.innerHTML = score;
  highScoreBox.innerHTML = highScoreVal;
  renderBoard();
}

// ========== AUDIO HELPERS ==========
function playSound(audio) {
  try {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {}
}

function startMusic() {
  if (!musicStarted) {
    try {
      bgMusic.play().catch(() => {});
      playSound(gameStart);
      musicStarted = true;
    } catch (e) {}
  }
}

// ========== CONTROLS ==========
function changeDirection(newDir) {
  if (gameOver || gamePaused) return;

  // Prevent reversing
  if (newDir.x !== -lastDir.x || newDir.y !== -lastDir.y) {
    // Prevent moving when stationary
    if (inputDir.x === 0 && inputDir.y === 0) {
      // First move
      inputDir = newDir;
      lastDir = newDir;
    } else if (newDir.x !== 0 || newDir.y !== 0) {
      inputDir = newDir;
      lastDir = newDir;
    }
    playSound(snakeMove);
  }
}

// Keyboard Controls
document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Space") {
    e.preventDefault();
    togglePause();
    return;
  }

  if (gameOver) return;

  // Start music on first key press
  if (!musicStarted && !gameOver) {
    startMusic();
  }

  let newDir = { x: 0, y: 0 };
  switch (e.key) {
    case "ArrowUp":
      newDir = { x: 0, y: -1 };
      e.preventDefault();
      break;
    case "ArrowDown":
      newDir = { x: 0, y: 1 };
      e.preventDefault();
      break;
    case "ArrowLeft":
      newDir = { x: -1, y: 0 };
      e.preventDefault();
      break;
    case "ArrowRight":
      newDir = { x: 1, y: 0 };
      e.preventDefault();
      break;
    default:
      return;
  }
  changeDirection(newDir);
});

// Mobile Controls
function setupMobileButton(id, dir) {
  const btn = document.getElementById(id);
  if (!btn) return;

  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!musicStarted && !gameOver) startMusic();
    changeDirection(dir);
  });

  btn.addEventListener("mousedown", (e) => {
    if (!musicStarted && !gameOver) startMusic();
    changeDirection(dir);
  });
}

setupMobileButton("btnUp", { x: 0, y: -1 });
setupMobileButton("btnDown", { x: 0, y: 1 });
setupMobileButton("btnLeft", { x: -1, y: 0 });
setupMobileButton("btnRight", { x: 1, y: 0 });

// ========== PAUSE ==========
function togglePause() {
  if (gameOver) return;
  gamePaused = !gamePaused;
  pauseOverlay.classList.toggle("hidden", !gamePaused);
  if (!gamePaused) {
    lastPaintTime = 0; // Reset timer to prevent speed burst
  }
}

// Click on board to pause
board.addEventListener("click", togglePause);

// ========== UI BUTTONS ==========
document.getElementById("startGameBtn").addEventListener("click", () => {
  showGame();
  startMusic();
});

document.getElementById("restartBtn").addEventListener("click", () => {
  gameOverOverlay.classList.add("hidden");
  resetGame();
  startMusic();
  startGame();
});

document.getElementById("homeBtn").addEventListener("click", () => {
  gameOverOverlay.classList.add("hidden");
  showHome();
});

// ========== INITIAL SETUP ==========
showHome();
renderBoard();

// Keyboard shortcut: Press 'H' for home
document.addEventListener("keydown", (e) => {
  if (e.key === "h" || e.key === "H") {
    if (gameOver || confirm("Go back to home screen?")) {
      showHome();
    }
  }
});

// Prevent scrolling on mobile
document.addEventListener(
  "touchmove",
  (e) => {
    if (e.target.closest("#controls")) {
      e.preventDefault();
    }
  },
  { passive: false },
);

console.log("🐍 Snake Pro initialized!");
console.log("🎮 Controls: Arrow Keys | Space to Pause | H for Home");
