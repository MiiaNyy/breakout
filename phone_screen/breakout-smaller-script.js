let startBtn = document.querySelector(".start-btn");
let startScreen = document.querySelector(".start");
let tipMessage = document.querySelector(".tip");
let navigation = document.querySelector('.navigation');

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let x = canvas.width / 2;
let y = canvas.height - 35;

let ballRadius = 8;
let ballOffset
let dx = 2;
let dy = -2;

let paddleHeight = 20;
let paddleWidth = 65;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleOffset = 5;

let rightPressed = false;
let leftPressed = false;

let brickWidth = 55;
let brickHeight = 20;
let brickPadding = 5;

let brickRowCount = 6;
let brickColumnCount = 4;
let brickOffsetTop = 30;
let brickOffsetLeft = 7;

let bricks = [];

let score = 0;
let lives = 3;

let isStartGameCountdownOn = false;

let paused = false;

let gameOver = false;
let playerWins = false;

let showMessage = false;
let powerUp = 0;

let gameStartTimer;

let messageX = 60;
let messageY = 130;
let messageWidth = 140;
let messageHeight = 140;

let messageBlurAmount = 6;
let messageClearOffset = 3;

function createBrickArray() {
    // This is two-dimensional array. It will contain the brick columns (c), 
    //which in turn contains the brick rows (r), which in turn will each contain 
    //an object containing the x and y position to paint each brick on the screen
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1
            };
        }
    }
}


function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowColor = "#9bf6ff";
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.strokeStyle = "#9bf6ff";
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#FE63F8';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "#fe63f8";
    ctx.stroke();
    ctx.closePath();

    //When the distance between the center of the ball and the edge of the wall 
    //is exactly the same as the radius of the ball, it will change the movement direction.
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx
    }

    //If the ball hits the bottom edge of the Canvas, check whether
    // it hit the paddle. If yes, then ball bounces off, if not then the take damage.
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - (ballRadius + paddleHeight + 5)) {

        if (x > paddleX + ballRadius && x < paddleX + paddleWidth) {
            dy = -dy;


        } else {
            takeDamage();
            console.log('paddleX is ' + paddleX + 'and x is ' + x);
            if (!gameOver) {
                x = canvas.width / 2;
                y = canvas.height - 35;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }

    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - (paddleHeight + 5), paddleWidth, paddleHeight);
    ctx.strokeStyle = '#EBC40E';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "#e4e432";
    ctx.stroke();
    ctx.closePath();

    //Paddle moves only boundaries of the canvas
    if (rightPressed) {
        paddleX += 6;
        if (paddleX + paddleWidth > canvas.width) {
            paddleX = canvas.width - paddleWidth;
        }
    } else if (leftPressed) {
        paddleX -= 6;
        if (paddleX < 0) {
            paddleX = 0;
        }
    }
}

function drawScore() {
    ctx.font = "15px VT323";
    ctx.fillStyle = "white";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "white";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
    ctx.font = "15px VT323";
    ctx.fillStyle = "white";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "white";
    ctx.fillText("Lives: " + lives, canvas.width - 60, 20);
}

function drawMessage(message) {

    ctx.clearRect(messageX - (messageBlurAmount + messageClearOffset), messageY - (messageBlurAmount + messageClearOffset), messageWidth + (messageBlurAmount + messageClearOffset) * 2, messageHeight + (messageBlurAmount + messageClearOffset) * 2);

    //background to the box, so it's not see through
    ctx.beginPath()
    ctx.fillStyle = '#2d2d2d';
    ctx.rect(messageX, messageY, messageWidth, messageHeight);
    ctx.fill();

    //Text style, color and shadow
    ctx.font = "13px Courier New";
    ctx.fillStyle = "white";
    ctx.shadowBlur = messageBlurAmount;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "white";

    //Border
    ctx.rect(messageX, messageY, messageWidth, messageHeight);
    ctx.strokeStyle = "#9bf6ff";
    ctx.stroke();

    //The messages text changes depending on the scenario
    if (message == 'gameOver') {
        drawGameOverMessage();
    } else if (message == 'lifeLost') {
        drawLifeLostMessage();
    } else if (message == 'startGame') {        
        drawStartGameMessage();
    } else if (message == 'playerWins') {
        drawPlayerWinsMessage();
    }
    ctx.closePath();

}

function drawLifeLostMessage() {
    ctx.fillText("Lives left " + lives, canvas.width / 2 - 40 , 150);
    ctx.font = "12px Courier New"
    ctx.fillText('Game continues in ', canvas.width / 2 - 55, 180)
    ctx.font = "60px Courier New";
    ctx.fillText(gameStartTimer, canvas.width / 2 - 15, canvas.height / 2 + 40)
}

function drawGameOverMessage() {
    ctx.font = "10px Courier New";
    ctx.fillText(gameStartTimer + ' seconds till start', canvas.width / 2 - 55, 150);
    ctx.font = "46px Courier New";
    ctx.fillText('Game ', canvas.width / 2 - 55, 200)
    ctx.fillText('over!', canvas.width / 2 - 60, 240)
}

function drawStartGameMessage() {
    ctx.fillStyle = "white";
    ctx.font = "100px Courier New";
    ctx.fillText(gameStartTimer, canvas.width / 2 -25, canvas.height / 2 + 30)
}

function drawPlayerWinsMessage() {
    ctx.fillStyle = "#9bf6ff";
    ctx.font = "11px Courier New";
    ctx.fillText(gameStartTimer + ' seconds till start', canvas.width / 2 - 60, 150);
    ctx.font = "14px Courier New";
    ctx.fillText('CONGRATULATIONS!', canvas.width / 2 - 63, 180);
    ctx.font = "16px Courier New";
    ctx.fillText('You ', canvas.width / 2 - 10, 200);
    ctx.fillText('destroyed ', canvas.width / 2 - 40, 220);
    ctx.fillText(' all the ', canvas.width / 2 - 40, 240);
    ctx.fillText('bricks!', canvas.width / 2 - 30, 260);

    ctx.rect(messageX, messageY, messageWidth, messageHeight);
    ctx.strokeStyle = '#EBC40E';
    ctx.shadowColor = '#EBC40E';
    ctx.stroke();
}

function drawPowerUpMessage(num) {
    if (num == 0) {
        return;
    }

    ctx.font = "15px VT323";

    if (num == 1) {
        ctx.fillStyle = "#e4e432";
    } else {
        ctx.fillStyle = "white";
    }
    ctx.fillText("Power-up x" + num, canvas.width / 2 - 30, 20);
}


function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];

            //If the center of the ball is inside the coordinates 
            //of one of the bricks, change status and the direction of the ball.
            //If status is 1 brick is visible, if status is 0 brick is invisible 
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0
                    score++;
                    //If player gets enough points, balls speed increses 
                    if (score === (brickRowCount * brickColumnCount / 2 - brickRowCount)) {
                        dx = 3;
                        dy = -3;
                        powerUp = 1;
                    } else if (score === (brickRowCount * brickColumnCount / 2) && powerUp == 1) {
                        dx = 4;
                        dy = -4;
                        powerUp = 2;
                        //When all of the bricks are destroyed player wins
                    } else if (score === brickRowCount * brickColumnCount) {
                        playerWins = true;
                        pauseGame();
                        countdown('gameEnd', 5);
                    }

                }
            }
        }
    }
}

function takeDamage() {
    lives--;
    pauseGame();

    //Checking if player has powerup, if so player loses powerup and balls speed goes back to normal
    if (powerUp == 1 || powerUp == 2) {
        powerUp = 0;
    }

    if (lives <= 0) {
        gameOver = true;
        countdown('gameEnd', 5);
    } else {
        displayLifeLostMessage();
    }
}

function pauseGame() {
    paused = true;
}


function countdown(state, sec) {
    gameStartTimer = sec;

    //Runs timerInterval sec times, ends loop and return to the normal gameLoop
    let timerInterval = setInterval(function () {

        gameStartTimer--;
        console.log(gameStartTimer);

        if (gameStartTimer <= 0) {
            if (state == 'lifeLost') {
                paused = false;
                showMessage = false;
            } else if (state == 'start') {
                isStartGameCountdownOn = false;
                paused = false;
            } else if (state == 'gameEnd') {
                document.location.reload();
            }

            clearInterval(timerInterval);

            console.log(sec + ' seconds has passed, since drawMessage');
        }
    }, 1000)
}



function displayLifeLostMessage() {
    showMessage = true;
    countdown('lifeLost', 5);
}


function keyDownHandler(e) {
    //e.key == 'Right'/'Left' is IE/Edge specific value
    if (e.key == 'ArrowRight' || e.key == 'Right') {
        rightPressed = true;
    } else if (e.key == 'ArrowLeft' || e.key == 'Left') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == 'ArrowRight' || e.key == 'Right') {
        rightPressed = false;
    } else if (e.key == 'ArrowLeft' || e.key == 'Left') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;  
    // 35 and 217 are edges of the canvas when mouse is in the middle of the paddle
    if (relativeX > 35 && relativeX < 217) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function touchHandler(e) {
    let touchX = e.touches[0].pageX;
    if(touchX > 33 && touchX < 217) {
        paddleX = touchX - paddleWidth / 2;
    }
}

function displayMessages() {

    if (isStartGameCountdownOn) {
        drawMessage('startGame');
    } else if (showMessage) {
        drawMessage('lifeLost');
    } else if (playerWins) {
        drawMessage('playerWins');
    } else if (gameOver) {
        drawMessage('gameOver');
    }
}


function runGameLoop() {
    //This causes the gameLoop() to call itself over and over again. 
    //Instead of using setInterval, this gives framerate to the browser.
    //It is more efficient, smoother animation loop
    requestAnimationFrame(gameLoop);
}

function gameLoop() {

    displayMessages();

    if (paused) {
        runGameLoop();
        return;
    }

    //Clears the canvas from previous frames before drawing a new one. 
    ctx.clearRect(0, 0, canvas.width, canvas.height)


    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();
    drawPowerUpMessage(powerUp);


    x += dx;
    y += dy;

    runGameLoop();
}

createBrickArray();

document.addEventListener("touchstart", touchHandler);
document.addEventListener("touchmove", touchHandler);

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

startBtn.addEventListener('click', function () {
    startScreen.style.display = 'none';
    navigation.style.display = 'none';
    canvas.style.display = 'block';
    tipMessage.style.display = 'block';
    //Run game loop once to draw the background
    gameLoop();
    pauseGame();
    isStartGameCountdownOn = true;
    countdown('start', 3);
})
