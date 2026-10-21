const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const size = 20;

// Cấu hình 5 màn chơi
// speed càng nhỏ thì rắn chạy càng nhanh
const LEVELS = [
    { speed: 150, target: 5,  label: "Chậm" },
    { speed: 125, target: 7,  label: "Vừa" },
    { speed: 105, target: 8,  label: "Nhanh" },
    { speed: 85,  target: 10, label: "Rất nhanh" },
    { speed: 65,  target: 12, label: "Siêu nhanh" }
];

let snake = [];
let dx = size;
let dy = 0;

let score = 0;
let levelIndex = 0;
let foodThisLevel = 0;

let food;
let gameOver = false;
let gameWon = false;
let gameInterval = null;

// Khởi tạo hoặc chơi lại game
function resetGame() {
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];

    dx = size;
    dy = 0;

    score = 0;
    levelIndex = 0;
    foodThisLevel = 0;

    gameOver = false;
    gameWon = false;

    food = createFood();

    drawGame();
    startGameLoop();
}

// Tạo thức ăn không trùng thân rắn
function createFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / size)) * size,
            y: Math.floor(Math.random() * (canvas.height / size)) * size
        };
    } while (
        snake.some(part =>
            part.x === newFood.x && part.y === newFood.y
        )
    );

    return newFood;
}

// Cập nhật điểm, màn chơi và thanh tốc độ
function updateHUD() {
    const currentLevel = LEVELS[levelIndex];

    document.getElementById("score").textContent = score;
    document.getElementById("level").textContent = levelIndex + 1;
    document.getElementById("levelFood").textContent = foodThisLevel;
    document.getElementById("targetFood").textContent = currentLevel.target;
    document.getElementById("speedLabel").textContent = currentLevel.label;

    // Thanh tăng dần theo tốc độ từng màn
    const progress = 20 + (levelIndex / (LEVELS.length - 1)) * 80;
    document.getElementById("speedBar").style.width = progress + "%";
}

// Vẽ game và thông báo khi kết thúc
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ thức ăn
    ctx.fillStyle = "#ff4757";
    ctx.fillRect(food.x, food.y, size - 2, size - 2);

    // Vẽ rắn
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#5ee678" : "#249447";
        ctx.fillRect(part.x, part.y, size - 2, size - 2);
    });

    updateHUD();

    // Màn hình kết thúc
    if (gameOver || gameWon) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "bold 30px Arial";

        ctx.fillText(
            gameWon ? "YOU WIN!" : "GAME OVER",
            canvas.width / 2,
            canvas.height / 2 - 10
        );

        ctx.font = "16px Arial";
        ctx.fillText(
            "Nhan Enter de choi lai",
            canvas.width / 2,
            canvas.height / 2 + 25
        );
    }
}

// Chuyển sang màn tiếp theo
function nextLevel() {
    if (levelIndex === LEVELS.length - 1) {
        gameWon = true;
        return;
    }

    levelIndex++;
    foodThisLevel = 0;

    // Tốc độ mới được áp dụng ngay
    startGameLoop();
}

// Di chuyển rắn và kiểm tra va chạm
function moveSnake() {
    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    const ateFood = head.x === food.x && head.y === food.y;

    // Đâm vào tường
    if (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height
    ) {
        gameOver = true;
        return;
    }

    // Đâm vào thân mình
    const body = ateFood ? snake : snake.slice(0, -1);

    if (
        body.some(part => part.x === head.x && part.y === head.y)
    ) {
        gameOver = true;
        return;
    }

    snake.unshift(head);

    if (ateFood) {
        score++;
        foodThisLevel++;
        food = createFood();

        // Đủ mồi thì qua màn
        if (foodThisLevel >= LEVELS[levelIndex].target) {
            nextLevel();
        }
    } else {
        snake.pop();
    }
}

// Điều khiển bằng phím mũi tên
document.addEventListener("keydown", function(event) {
    if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"]
            .includes(event.key)
    ) {
        event.preventDefault();
    }

    // Enter để chơi lại sau khi kết thúc
    if (event.key === "Enter" && (gameOver || gameWon)) {
        resetGame();
        return;
    }

    if (gameOver || gameWon) return;

    if (event.key === "ArrowUp" && dy === 0) {
        dx = 0;
        dy = -size;
    } else if (event.key === "ArrowDown" && dy === 0) {
        dx = 0;
        dy = size;
    } else if (event.key === "ArrowLeft" && dx === 0) {
        dx = -size;
        dy = 0;
    } else if (event.key === "ArrowRight" && dx === 0) {
        dx = size;
        dy = 0;
    }
});

// Vòng lặp game
function gameLoop() {
    if (!gameOver && !gameWon) {
        moveSnake();
    }

    drawGame();

    if (gameOver || gameWon) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}
// Điều khiển rắn bằng cách vuốt màn hình điện thoại
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", function(event) {
    const touch = event.changedTouches[0];

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

canvas.addEventListener("touchend", function(event) {
    if (gameOver || gameWon) return;

    const touch = event.changedTouches[0];

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Bỏ qua những lần vuốt quá ngắn
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 20) {
        return;
    }

    // Vuốt ngang
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && dx === 0) {
            dx = size;
            dy = 0;
        } else if (deltaX < 0 && dx === 0) {
            dx = -size;
            dy = 0;
        }
    }
    // Vuốt dọc
    else {
        if (deltaY < 0 && dy === 0) {
            dx = 0;
            dy = -size;
        } else if (deltaY > 0 && dy === 0) {
            dx = 0;
            dy = size;
        }
    }
}, { passive: true });

// Bắt đầu hoặc thay đổi tốc độ game
function startGameLoop() {
    if (gameInterval !== null) {
        clearInterval(gameInterval);
    }

    const currentSpeed = LEVELS[levelIndex].speed;
    gameInterval = setInterval(gameLoop, currentSpeed);
}

// Khởi động game
resetGame();
function changeDirection(direction) {
    if (gameOver || gameWon) return;

    if (direction === "up" && dy === 0) {
        dx = 0;
        dy = -size;
    } else if (direction === "down" && dy === 0) {
        dx = 0;
        dy = size;
    } else if (direction === "left" && dx === 0) {
        dx = -size;
        dy = 0;
    } else if (direction === "right" && dx === 0) {
        dx = size;
        dy = 0;
    }
}
.restart-button {
    display: block;
    margin: 12px auto 20px;
    padding: 12px 28px;
    border: none;
    border-radius: 12px;
    background: #ffb347;
    color: #202b36;
    font-size: 17px;
    font-weight: bold;
    cursor: pointer;
    touch-action: manipulation;
}

.restart-button:active {
    transform: scale(0.96);
}
document.getElementById("restartButton").addEventListener("click", function() {
    resetGame();
});
