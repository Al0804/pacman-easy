let canvas, ctx;
        let pacman, ghosts, dots;
        let score = 0;
        let gameRunning = false;
        let keys = {};
        let hintIndex = 0;
        let currentDirection = null;
        let moveInterval = null;

        const hints = [
            "Gunakan tombol panah untuk bergerak!",
            "Makan titik-titik kuning!",
            "Hindari hantu merah!",
            "Cari titik di sudut-sudut!",
            "Hantu bergerak lambat di mode mudah!",
            "Hampir selesai, terus semangat!"
        ];

        function startGame() {
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            
            canvas = document.getElementById('gameCanvas');
            ctx = canvas.getContext('2d');
            
            resizeCanvas();
            initGame();
            gameLoop();
        }

        function initGame() {
            // Pac-Man initial position
            pacman = {
                x: 50,
                y: canvas.height / 2,
                size: 15,
                speed: 2
            };

            // Ghosts (only 2 for easy mode)
            ghosts = [
                { x: canvas.width / 2, y: canvas.height / 3, size: 15, speed: 0.8, dx: 1, dy: 0 },
                { x: canvas.width - 100, y: (canvas.height * 2) / 3, size: 15, speed: 0.8, dx: -1, dy: 0 }
            ];

            // Generate dots (fewer dots for easy mode)
            dots = [];
            for(let i = 0; i < 15; i++) {
                dots.push({
                    x: Math.random() * (canvas.width - 40) + 20,
                    y: Math.random() * (canvas.height - 40) + 20,
                    size: 5
                });
            }

            score = 0;
            gameRunning = true;
            updateScore();
            updateHints();
        }

        function gameLoop() {
            if (!gameRunning) return;

            update();
            draw();
            requestAnimationFrame(gameLoop);
        }

        function update() {
            // Move Pac-Man with keyboard
            if (keys['ArrowUp'] && pacman.y > pacman.size) pacman.y -= pacman.speed;
            if (keys['ArrowDown'] && pacman.y < canvas.height - pacman.size) pacman.y += pacman.speed;
            if (keys['ArrowLeft'] && pacman.x > pacman.size) pacman.x -= pacman.speed;
            if (keys['ArrowRight'] && pacman.x < canvas.width - pacman.size) pacman.x += pacman.speed;

            // Move Pac-Man with touch controls
            if (currentDirection) {
                switch(currentDirection) {
                    case 'up':
                        if (pacman.y > pacman.size) pacman.y -= pacman.speed;
                        break;
                    case 'down':
                        if (pacman.y < canvas.height - pacman.size) pacman.y += pacman.speed;
                        break;
                    case 'left':
                        if (pacman.x > pacman.size) pacman.x -= pacman.speed;
                        break;
                    case 'right':
                        if (pacman.x < canvas.width - pacman.size) pacman.x += pacman.speed;
                        break;
                }
            }

            // Move ghosts (simple movement)
            ghosts.forEach(ghost => {
                ghost.x += ghost.dx * ghost.speed;
                ghost.y += ghost.dy * ghost.speed;

                // Bounce off edges
                if (ghost.x <= ghost.size || ghost.x >= canvas.width - ghost.size) {
                    ghost.dx *= -1;
                }
                if (ghost.y <= ghost.size || ghost.y >= canvas.height - ghost.size) {
                    ghost.dy *= -1;
                }

                // Random direction change
                if (Math.random() < 0.005) {
                    ghost.dx = (Math.random() - 0.5) * 2;
                    ghost.dy = (Math.random() - 0.5) * 2;
                }
            });

            // Check collision with dots
            for (let i = dots.length - 1; i >= 0; i--) {
                if (distance(pacman, dots[i]) < pacman.size + dots[i].size) {
                    dots.splice(i, 1);
                    score += 10;
                    updateScore();
                    updateHints();
                }
            }

            // Check collision with ghosts
            ghosts.forEach(ghost => {
                if (distance(pacman, ghost) < pacman.size + ghost.size) {
                    gameRunning = false;
                    showGameOver();
                }
            });

            // Check victory
            if (dots.length === 0) {
                gameRunning = false;
                showWin();
            }
        }

        function draw() {
            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Pac-Man
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(pacman.x, pacman.y, pacman.size, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.lineTo(pacman.x, pacman.y);
            ctx.fill();

            // Draw ghosts
            ctx.fillStyle = '#ff0000';
            ghosts.forEach(ghost => {
                ctx.beginPath();
                ctx.arc(ghost.x, ghost.y, ghost.size, 0, 2 * Math.PI);
                ctx.fill();
                
                // Ghost eyes
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(ghost.x - 5, ghost.y - 5, 3, 0, 2 * Math.PI);
                ctx.arc(ghost.x + 5, ghost.y - 5, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#ff0000';
            });

            // Draw dots
            ctx.fillStyle = '#ffff00';
            dots.forEach(dot => {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        function distance(obj1, obj2) {
            return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
        }

        function updateScore() {
            document.getElementById('score').textContent = score;
        }

        function updateHints() {
            const hintsElement = document.getElementById('hints');
            if (score > 0 && score % 30 === 0 && hintIndex < hints.length - 1) {
                hintIndex++;
            }
            hintsElement.textContent = hints[hintIndex];
        }

        // Mobile touch controls
        function startMove(direction) {
            currentDirection = direction;
        }

        function stopMove() {
            currentDirection = null;
        }

        function showWin() {
            document.getElementById('winModal').style.display = 'block';
        }

        function showMessage() {
            document.getElementById('winModal').style.display = 'none';
            document.getElementById('messageModal').style.display = 'block';
        }

        function closeMessage() {
            document.getElementById('messageModal').style.display = 'none';
            resetToWelcome();
        }

        function showGameOver() {
            document.getElementById('gameOverModal').style.display = 'block';
        }

        function retryGame() {
            document.getElementById('gameOverModal').style.display = 'none';
            hintIndex = 0;
            initGame();
            gameLoop();
        }

        function resetToWelcome() {
            document.getElementById('gameScreen').style.display = 'none';
            document.getElementById('welcomeScreen').style.display = 'block';
            hintIndex = 0;
        }

        // Event listeners
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        // Prevent touch scrolling
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('control-btn')) {
                e.preventDefault();
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('control-btn')) {
                e.preventDefault();
            }
        });

        // Responsive canvas
        function resizeCanvas() {
            const canvas = document.getElementById('gameCanvas');
            if (window.innerWidth <= 480) {
                canvas.width = 300;
                canvas.height = 250;
            } else if (window.innerWidth <= 768) {
                canvas.width = 400;
                canvas.height = 300;
            } else {
                canvas.width = 600;
                canvas.height = 400;
            }
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('load', resizeCanvas);