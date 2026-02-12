/* ============================================
   VALENTINE'S DAY APP — APPLICATION LOGIC
   Harshil & Nidhi Edition
   ============================================ */

// ——— Configuration ———
const CAPTCHA_IMAGES = [
    { src: 'images/correct1.png', correct: true },
    { src: 'images/decoy_teddy.png', correct: false },
    { src: 'images/correct2.png', correct: true },
    { src: 'images/decoy_bunny.png', correct: false },
    { src: 'images/correct3.png', correct: true },
    { src: 'images/decoy_cat.png', correct: false },
    { src: 'images/correct1.png', correct: true },
    { src: 'images/decoy_fox.png', correct: false },
    { src: 'images/decoy1.png', correct: false },
];

const YES_MESSAGES = [
    "That's what I thought...",
    "Keep clicking, I dare you",
    "You really wanna say yes huh?",
    "One more time for good measure!",
    "YESSS!! Okay okay...",
];

const NO_MESSAGES = [
    "Nope!",
    "Can't catch me!",
    "Try again!",
    "Nice try!",
    "Haha!",
    "Not today!",
    "Too slow!",
    "Over here!",
    "Wrong way!",
    "Almost!",
];

const SCRAMBLE_WORDS = [
    {
        word: 'FOREVER',
        scrambled: 'OFREVER',
        hint: 'How long I want to be with you',
        message: 'Forever and always, my love',
        image: 'images/couple_cherry_blossom.jpg',
    },
    {
        word: 'SOULMATE',
        scrambled: 'SNOLUATEM',
        hint: 'What you are to me',
        message: 'Found my soulmate in you',
        image: 'images/couple_dinner.jpg',
    },
    {
        word: 'BELOVED',
        scrambled: 'DEVOLEB',
        hint: 'What you will always be to me',
        message: 'My most beloved person',
        image: 'images/couple_movie.jpg',
    },
    {
        word: 'NIDHI',
        scrambled: 'IDHNI',
        hint: 'The most beautiful name I know',
        message: 'The answer was you all along',
        image: 'images/couple_parasailing.jpg',
    },
];

// Memory card types
const MEMORY_CARDS = [
    { type: 'photo', src: 'images/couple_cherry_blossom.jpg', id: 'photo1' },
    { type: 'photo', src: 'images/couple_holding_hands.jpg', id: 'photo2' },
    { type: 'photo', src: 'images/couple_graduation.jpg', id: 'photo3' },
    { type: 'photo', src: 'images/couple_movie.jpg', id: 'photo4' },
    { type: 'photo', src: 'images/couple_parasailing.jpg', id: 'photo5' },
    { type: 'photo', src: 'images/couple_themepark.jpg', id: 'photo6' },
    { type: 'photo', src: 'images/couple_shopping.jpg', id: 'photo7' },
    { type: 'photo', src: 'images/couple_dinner.jpg', id: 'photo8' },
];

// ——— State ———
let selectedCells = new Set();
let envelopeOpened = false;
let yesClickCount = 0;
let yesBtnScale = 1;
let currentScreen = 0;

// Puzzle state
let puzzleTiles = [];
let emptyPos = 8; // bottom-right
let moveCount = 0;

// Scramble state
let scrambleRound = 0;
let selectedLetters = [];

// Memory state
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalFlips = 0;
let memoryLocked = false;

// Love Quiz questions
const QUIZ_QUESTIONS = [
    {
        question: 'What is Harshil\'s love language?',
        options: ['Words of Affirmation', 'Acts of Service', 'Quality Time', 'Physical Touch'],
        correct: 2,
        feedback: 'Every minute with you counts!',
        image: 'images/couple_movie.jpg',
    },
    {
        question: 'What would Harshil pick for a perfect date?',
        options: ['Fancy restaurant', 'Movie night at home', 'Parasailing adventure', 'Both B and C!'],
        correct: 3,
        feedback: 'As long as it\'s with you!',
        image: 'images/couple_parasailing.jpg',
    },
    {
        question: 'How does Harshil feel when Nidhi smiles?',
        options: ['Happy', 'Speechless', 'Like the whole world stops', 'All of the above'],
        correct: 3,
        feedback: 'Your smile is my favorite thing!',
        image: 'images/couple_cherry_blossom.jpg',
    },
    {
        question: 'What would Harshil do for Nidhi?',
        options: ['Anything', 'Everything', 'Literally anything', 'All of the above, obviously'],
        correct: 3,
        feedback: 'Every single answer was right!',
        image: 'images/couple_holding_hands.jpg',
    },
    {
        question: 'Harshil + Nidhi = ?',
        options: ['Cute', 'Adorable', 'Perfect', 'Forever'],
        correct: 3,
        feedback: 'Forever and always!',
        image: 'images/couple_graduation.jpg',
    },
];

// Catch game state
let catchScore = 0;
let catchTimer = 15;
let catchInterval = null;
let catchSpawnInterval = null;
let catchActive = false;

// Quiz state
let quizRound = 0;
let quizScore = 0;

// ——— Screen order ———
const SCREEN_ORDER = ['captcha', 'envelope', 'puzzle', 'scramble', 'memory', 'quiz', 'catch', 'question', 'celebration'];

// ——— DOM Elements ———
const screens = {};

// ——— Initialize ———
document.addEventListener('DOMContentLoaded', () => {
    // Populate screens object
    SCREEN_ORDER.forEach(name => {
        screens[name] = document.getElementById('screen-' + name);
    });

    initParticleCanvas();
    initCaptcha();
    initEnvelope();
    initPuzzle();
    initScramble();
    initMemory();
    initQuiz();
    initCatch();
    initQuestionButtons();
    initCelebrationHearts();
    updateProgress(0);
});

// ============================================
// PROGRESS BAR
// ============================================
function updateProgress(screenIndex) {
    currentScreen = screenIndex;
    const fill = document.getElementById('progress-bar-fill');
    const dots = document.querySelectorAll('.progress-dot');
    const pct = (screenIndex / (SCREEN_ORDER.length - 1)) * 100;
    fill.style.width = pct + '%';

    dots.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i === screenIndex) dot.classList.add('active');
        else if (i < screenIndex) dot.classList.add('completed');
    });
}

// ============================================
// CANVAS PARTICLE BACKGROUND
// ============================================
function initParticleCanvas() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const PARTICLE_COUNT = 30;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createBgParticle(canvas));
    }

    function createBgParticle(canvas) {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 100,
            size: 6 + Math.random() * 12,
            speedY: -(0.3 + Math.random() * 0.8),
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.15 + Math.random() * 0.4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 1.5,
            type: Math.random() < 0.5 ? 'heart' : Math.random() < 0.7 ? 'sparkle' : 'flower',
            color: ['#ec407a', '#f48fb1', '#f06292', '#ffd700', '#ff80ab', '#e91e63'][Math.floor(Math.random() * 6)],
        };
    }

    function drawParticleHeart(ctx, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        const s = size / 2;
        ctx.moveTo(0, s * 0.4);
        ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.4, s * 0.3, 0, s * 1.4);
        ctx.bezierCurveTo(s * 1.4, s * 0.3, s, -s * 0.5, 0, s * 0.4);
        ctx.fill();
    }

    function drawSparkle(ctx, size, color) {
        ctx.fillStyle = color;
        const s = size / 2;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle - 0.15) * s * 0.3, Math.sin(angle - 0.15) * s * 0.3);
            ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
            ctx.lineTo(Math.cos(angle + 0.15) * s * 0.3, Math.sin(angle + 0.15) * s * 0.3);
        }
        ctx.closePath();
        ctx.fill();
    }

    function drawFlower(ctx, size, color) {
        const s = size / 3;
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5;
            ctx.beginPath();
            ctx.ellipse(
                Math.cos(angle) * s,
                Math.sin(angle) * s,
                s * 0.7, s * 0.5,
                angle, 0, 2 * Math.PI
            );
            ctx.fill();
        }
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.4, 0, 2 * Math.PI);
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;

            if (p.y < -30) {
                Object.assign(p, createBgParticle(canvas));
                p.y = canvas.height + 20;
            }

            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);

            if (p.type === 'heart') {
                drawParticleHeart(ctx, p.size, p.color);
            } else if (p.type === 'sparkle') {
                drawSparkle(ctx, p.size, p.color);
            } else {
                drawFlower(ctx, p.size, p.color);
            }

            ctx.restore();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// ============================================
// SCREEN 1: CAPTCHA
// ============================================
function initCaptcha() {
    const grid = document.getElementById('captcha-grid');

    CAPTCHA_IMAGES.forEach((img, index) => {
        const cell = document.createElement('div');
        cell.className = 'captcha-cell';
        cell.dataset.index = index;
        cell.dataset.correct = img.correct;

        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.alt = 'CAPTCHA image';
        imgEl.draggable = false;
        cell.appendChild(imgEl);

        const check = document.createElement('div');
        check.className = 'check-mark';
        check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        cell.appendChild(check);

        cell.addEventListener('click', () => toggleCell(cell, index));
        grid.appendChild(cell);
    });
}

function toggleCell(cell, index) {
    if (selectedCells.has(index)) {
        selectedCells.delete(index);
        cell.classList.remove('selected');
    } else {
        selectedCells.add(index);
        cell.classList.add('selected');
    }

    document.getElementById('captcha-verify').disabled = selectedCells.size === 0;

    const statusText = document.getElementById('status-text');
    statusText.textContent = selectedCells.size > 0
        ? `${selectedCells.size} image${selectedCells.size > 1 ? 's' : ''} selected`
        : 'Select all matching images';
}

document.getElementById('captcha-verify').addEventListener('click', () => {
    const correctIndices = CAPTCHA_IMAGES
        .map((img, i) => img.correct ? i : -1)
        .filter(i => i !== -1);

    const selectedArr = Array.from(selectedCells);
    const isCorrect =
        selectedArr.length === correctIndices.length &&
        selectedArr.every(i => correctIndices.includes(i));

    document.querySelectorAll('.captcha-error, .captcha-success').forEach(el => el.remove());

    if (isCorrect) {
        const msg = document.createElement('p');
        msg.className = 'captcha-success';
        msg.textContent = "Verification passed! You clearly know your Valentine, Nidhi";
        document.querySelector('.captcha-container').appendChild(msg);
        document.getElementById('status-text').textContent = 'Verified';

        setTimeout(() => {
            switchScreen('captcha', 'envelope');
            updateProgress(1);
        }, 1500);
    } else {
        const msg = document.createElement('p');
        msg.className = 'captcha-error';
        msg.textContent = "Hmm that's not right... Do you even know your Valentine?";
        document.querySelector('.captcha-container').appendChild(msg);

        const grid = document.getElementById('captcha-grid');
        grid.style.animation = 'none';
        grid.offsetHeight;
        grid.style.animation = 'shake 0.5s ease';
    }
});

// ============================================
// SCREEN 2: ENVELOPE
// ============================================
function initEnvelope() {
    const wrapper = document.getElementById('envelope-wrapper');
    const envelope = document.getElementById('envelope');
    const continueBtn = document.getElementById('continue-to-puzzle');

    wrapper.addEventListener('click', () => {
        if (envelopeOpened) return;
        envelopeOpened = true;
        envelope.classList.add('opened');

        setTimeout(() => {
            continueBtn.style.display = 'flex';
        }, 1200);
    });

    continueBtn.addEventListener('click', () => {
        switchScreen('envelope', 'puzzle');
        updateProgress(2);
    });
}

// ============================================
// SCREEN 3: SLIDING TILE PUZZLE
// ============================================
function initPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    const hintBtn = document.getElementById('hint-btn');
    const continueBtn = document.getElementById('continue-to-scramble');

    // Create initial tile order (0-7 are image tiles, 8 is empty)
    puzzleTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // Shuffle until solvable and not already solved
    shufflePuzzle();

    renderPuzzle();

    // Hint button - briefly shows full image
    hintBtn.addEventListener('click', () => {
        const grid = document.getElementById('puzzle-grid');
        grid.style.opacity = '0.15';
        const overlay = document.createElement('img');
        overlay.src = 'images/couple_cherry_blossom.jpg';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:12px;z-index:10;animation:fadeInUp 0.3s ease;';
        grid.parentElement.style.position = 'relative';
        grid.parentElement.appendChild(overlay);

        setTimeout(() => {
            overlay.remove();
            grid.style.opacity = '1';
        }, 1500);
    });

    continueBtn.addEventListener('click', () => {
        switchScreen('puzzle', 'scramble');
        updateProgress(3);
    });
}

function shufflePuzzle() {
    // Perform random valid moves to ensure solvability
    let pos = 8; // empty starts at position 8
    const moves = 200;

    for (let i = 0; i < moves; i++) {
        const neighbors = getNeighbors(pos);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        // Swap
        puzzleTiles[pos] = puzzleTiles[randomNeighbor];
        puzzleTiles[randomNeighbor] = 8;
        pos = randomNeighbor;
    }

    emptyPos = pos;
}

function getNeighbors(pos) {
    const row = Math.floor(pos / 3);
    const col = pos % 3;
    const neighbors = [];
    if (row > 0) neighbors.push(pos - 3);
    if (row < 2) neighbors.push(pos + 3);
    if (col > 0) neighbors.push(pos - 1);
    if (col < 2) neighbors.push(pos + 1);
    return neighbors;
}

function renderPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    puzzleTiles.forEach((tileIndex, position) => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        tile.dataset.position = position;
        tile.dataset.tile = tileIndex;

        if (tileIndex === 8) {
            tile.classList.add('empty');
        } else {
            // Calculate background position for this tile piece
            const tileRow = Math.floor(tileIndex / 3);
            const tileCol = tileIndex % 3;
            tile.style.backgroundImage = "url('images/couple_cherry_blossom.jpg')";
            tile.style.backgroundPosition = `${tileCol * 50}% ${tileRow * 50}%`;
            tile.style.backgroundSize = '300% 300%';

            tile.addEventListener('click', () => slideTile(position));
        }

        grid.appendChild(tile);
    });
}

function slideTile(clickedPos) {
    // Check if the clicked tile is adjacent to the empty tile
    const neighbors = getNeighbors(emptyPos);
    if (!neighbors.includes(clickedPos)) return;

    // Swap tiles
    puzzleTiles[emptyPos] = puzzleTiles[clickedPos];
    puzzleTiles[clickedPos] = 8;
    emptyPos = clickedPos;

    moveCount++;
    document.getElementById('move-count').textContent = moveCount;

    renderPuzzle();

    // Check win
    if (isPuzzleSolved()) {
        setTimeout(() => {
            document.getElementById('puzzle-complete').style.display = 'flex';
        }, 400);
    }
}

function isPuzzleSolved() {
    for (let i = 0; i < 9; i++) {
        if (puzzleTiles[i] !== i) return false;
    }
    return true;
}

// ============================================
// SCREEN 4: WORD SCRAMBLE
// ============================================
function initScramble() {
    document.getElementById('scramble-total').textContent = SCRAMBLE_WORDS.length;
    loadScrambleRound();

    document.getElementById('scramble-clear').addEventListener('click', clearScramble);
    document.getElementById('scramble-submit').addEventListener('click', checkScramble);
    document.getElementById('scramble-next').addEventListener('click', nextScrambleRound);
}

function loadScrambleRound() {
    const round = SCRAMBLE_WORDS[scrambleRound];
    document.getElementById('scramble-round').textContent = scrambleRound + 1;
    document.getElementById('scramble-hint-text').textContent = round.hint;

    // Reset state
    selectedLetters = [];
    document.getElementById('scramble-reveal').style.display = 'none';
    document.getElementById('scramble-game').style.display = 'flex';
    document.getElementById('scramble-submit').disabled = true;

    // Scramble the letters
    const letters = round.scrambled.split('');
    const tilesContainer = document.getElementById('scramble-tiles');
    const answerContainer = document.getElementById('scramble-answer');
    tilesContainer.innerHTML = '';
    answerContainer.innerHTML = '';

    // Create letter tiles
    letters.forEach((letter, i) => {
        const tile = document.createElement('div');
        tile.className = 'scramble-letter';
        tile.textContent = letter;
        tile.dataset.index = i;
        tile.addEventListener('click', () => selectLetter(i, letter));
        tilesContainer.appendChild(tile);
    });

    // Create answer slots
    for (let i = 0; i < round.word.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'scramble-slot';
        slot.dataset.slot = i;
        slot.addEventListener('click', () => unselectLetter(i));
        answerContainer.appendChild(slot);
    }

    // Update button text for last round
    if (scrambleRound === SCRAMBLE_WORDS.length - 1) {
        document.getElementById('scramble-next-text').textContent = 'Next Challenge';
    }
}

function selectLetter(index, letter) {
    const tile = document.querySelectorAll('.scramble-letter')[index];
    if (tile.classList.contains('used')) return;

    const round = SCRAMBLE_WORDS[scrambleRound];
    if (selectedLetters.length >= round.word.length) return;

    tile.classList.add('used');
    selectedLetters.push({ index, letter });

    // Fill the next empty slot
    const slots = document.querySelectorAll('.scramble-slot');
    const slotIndex = selectedLetters.length - 1;
    slots[slotIndex].textContent = letter;
    slots[slotIndex].classList.add('filled');

    // Enable submit if all slots filled
    document.getElementById('scramble-submit').disabled =
        selectedLetters.length < round.word.length;
}

function unselectLetter(slotIndex) {
    if (slotIndex >= selectedLetters.length) return;

    const removed = selectedLetters.splice(slotIndex);

    // Un-use those letters
    removed.forEach(l => {
        const tile = document.querySelectorAll('.scramble-letter')[l.index];
        tile.classList.remove('used');
    });

    // Re-render slots
    const slots = document.querySelectorAll('.scramble-slot');
    for (let i = 0; i < slots.length; i++) {
        if (i < selectedLetters.length) {
            slots[i].textContent = selectedLetters[i].letter;
            slots[i].classList.add('filled');
        } else {
            slots[i].textContent = '';
            slots[i].classList.remove('filled');
        }
    }

    document.getElementById('scramble-submit').disabled = true;
}

function clearScramble() {
    selectedLetters.forEach(l => {
        const tile = document.querySelectorAll('.scramble-letter')[l.index];
        tile.classList.remove('used');
    });
    selectedLetters = [];

    const slots = document.querySelectorAll('.scramble-slot');
    slots.forEach(slot => {
        slot.textContent = '';
        slot.classList.remove('filled', 'correct', 'wrong');
    });

    document.getElementById('scramble-submit').disabled = true;
}

function checkScramble() {
    const round = SCRAMBLE_WORDS[scrambleRound];
    const answer = selectedLetters.map(l => l.letter).join('');
    const slots = document.querySelectorAll('.scramble-slot');

    if (answer === round.word) {
        // Correct!
        slots.forEach(slot => slot.classList.add('correct'));

        setTimeout(() => {
            // Show reveal
            document.getElementById('scramble-game').style.display = 'none';
            const reveal = document.getElementById('scramble-reveal');
            reveal.style.display = 'block';
            document.getElementById('scramble-reveal-img').src = round.image;
            document.getElementById('scramble-reveal-msg').textContent = round.message;
        }, 600);
    } else {
        // Wrong - shake
        slots.forEach(slot => {
            slot.classList.add('wrong');
            setTimeout(() => slot.classList.remove('wrong'), 500);
        });
    }
}

function nextScrambleRound() {
    scrambleRound++;
    if (scrambleRound < SCRAMBLE_WORDS.length) {
        loadScrambleRound();
    } else {
        // Move to next screen
        switchScreen('scramble', 'memory');
        updateProgress(4);
    }
}

// ============================================
// SCREEN 5: MEMORY MATCH
// ============================================
function initMemory() {
    const grid = document.getElementById('memory-grid');
    const continueBtn = document.getElementById('continue-to-quiz');

    // Create pairs
    let cards = [];
    MEMORY_CARDS.forEach(card => {
        cards.push({ ...card, pairId: card.id });
        cards.push({ ...card, pairId: card.id });
    });

    // Shuffle
    cards = shuffleArray(cards);
    memoryCards = cards;

    // Render
    cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'memory-card';
        cardEl.dataset.index = index;
        cardEl.dataset.pairId = card.pairId;

        // Back face (what you see first — facedown)
        const back = document.createElement('div');
        back.className = 'memory-card-back';
        back.innerHTML = `
            <svg class="card-heart" viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ec407a" opacity="0.4"/>
            </svg>
            <span class="card-monogram">H+N</span>
        `;

        // Front face (revealed)
        const front = document.createElement('div');
        front.className = 'memory-card-front';

        if (card.type === 'photo') {
            front.innerHTML = `<img src="${card.src}" alt="Memory" draggable="false">`;
        } else {
            front.innerHTML = getIconSVG(card.icon);
        }

        cardEl.appendChild(back);
        cardEl.appendChild(front);

        cardEl.addEventListener('click', () => flipCard(index, cardEl));
        grid.appendChild(cardEl);
    });

    continueBtn.addEventListener('click', () => {
        switchScreen('memory', 'quiz');
        updateProgress(5);
        loadQuizQuestion();
    });
}

function getIconSVG(icon) {
    const svgs = {
        heart: `<svg class="card-svg-icon" viewBox="0 0 24 24" width="36" height="36">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ec407a"/>
        </svg>`,
        rose: `<svg class="card-svg-icon" viewBox="0 0 60 80" width="36" height="48">
            <ellipse cx="30" cy="22" rx="16" ry="14" fill="#e53935" opacity="0.9"/>
            <ellipse cx="26" cy="20" rx="10" ry="9" fill="#ec407a"/>
            <ellipse cx="34" cy="18" rx="8" ry="7" fill="#f06292"/>
            <ellipse cx="30" cy="22" rx="5" ry="5" fill="#c62828" opacity="0.7"/>
            <line x1="30" y1="36" x2="30" y2="70" stroke="#388e3c" stroke-width="3" stroke-linecap="round"/>
            <ellipse cx="22" cy="52" rx="8" ry="4" fill="#4caf50" transform="rotate(-30 22 52)"/>
            <ellipse cx="38" cy="60" rx="7" ry="3.5" fill="#4caf50" transform="rotate(25 38 60)"/>
        </svg>`,
        ring: `<svg class="card-svg-icon" viewBox="0 0 24 24" width="36" height="36">
            <circle cx="12" cy="14" r="7" fill="none" stroke="#ffd700" stroke-width="2.5"/>
            <circle cx="12" cy="14" r="5" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.5"/>
            <path d="M12 7 L9 3 M12 7 L15 3 M12 7 L12 2" stroke="#ffd700" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="2" r="2" fill="#ffd700"/>
        </svg>`,
        star: `<svg class="card-svg-icon" viewBox="0 0 24 24" width="36" height="36">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#ffd700" opacity="0.9"/>
        </svg>`,
        letter: `<svg class="card-svg-icon" viewBox="0 0 24 24" width="36" height="36">
            <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#f48fb1" stroke-width="1.5"/>
            <path d="M3 5l9 7 9-7" fill="none" stroke="#f48fb1" stroke-width="1.5"/>
            <path d="M3 19l6-6M21 19l-6-6" fill="none" stroke="#f48fb1" stroke-width="1" opacity="0.5"/>
        </svg>`,
    };
    return svgs[icon] || '';
}

function flipCard(index, cardEl) {
    if (memoryLocked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;

    cardEl.classList.add('flipped');
    totalFlips++;
    document.getElementById('flip-count').textContent = totalFlips;
    flippedCards.push({ index, element: cardEl, pairId: memoryCards[index].pairId });

    if (flippedCards.length === 2) {
        memoryLocked = true;
        const [card1, card2] = flippedCards;

        if (card1.pairId === card2.pairId) {
            // Match!
            matchedPairs++;
            document.getElementById('match-count').textContent = `${matchedPairs} / 8`;

            card1.element.classList.add('matched', 'match-anim');
            card2.element.classList.add('matched', 'match-anim');

            flippedCards = [];
            memoryLocked = false;

            if (matchedPairs === 8) {
                setTimeout(() => {
                    document.getElementById('memory-complete').style.display = 'flex';
                }, 800);
            }
        } else {
            // No match — flip back after delay
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                flippedCards = [];
                memoryLocked = false;
            }, 1000);
        }
    }
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ============================================
// SCREEN 6: LOVE QUIZ
// ============================================
function initQuiz() {
    const continueBtn = document.getElementById('continue-to-catch');
    continueBtn.addEventListener('click', () => {
        switchScreen('quiz', 'catch');
        updateProgress(6);
    });
}

function loadQuizQuestion() {
    if (quizRound >= QUIZ_QUESTIONS.length) {
        showQuizComplete();
        return;
    }

    const q = QUIZ_QUESTIONS[quizRound];
    document.getElementById('quiz-round').textContent = quizRound + 1;
    document.getElementById('quiz-total').textContent = QUIZ_QUESTIONS.length;
    document.getElementById('quiz-question').textContent = q.question;
    document.getElementById('quiz-feedback').style.display = 'none';

    const optionsEl = document.getElementById('quiz-options');
    optionsEl.innerHTML = '';

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => handleQuizAnswer(i, q, optionsEl));
        optionsEl.appendChild(btn);
    });

    // Animate card
    const card = document.getElementById('quiz-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'fadeInUp 0.5s ease';
}

function handleQuizAnswer(selected, q, optionsEl) {
    const buttons = optionsEl.querySelectorAll('.quiz-option');
    buttons.forEach((btn, i) => {
        btn.classList.add('quiz-option-disabled');
        if (i === q.correct) btn.classList.add('quiz-option-correct');
        else if (i === selected && selected !== q.correct) btn.classList.add('quiz-option-wrong');
    });

    if (selected === q.correct) {
        quizScore++;
        document.getElementById('quiz-score').textContent = quizScore;
    }

    // Show feedback
    const feedbackEl = document.getElementById('quiz-feedback');
    document.getElementById('quiz-feedback-img').src = q.image;
    document.getElementById('quiz-feedback-text').textContent = q.feedback;
    feedbackEl.style.display = 'block';

    // Auto-advance after delay
    setTimeout(() => {
        quizRound++;
        loadQuizQuestion();
    }, 2200);
}

function showQuizComplete() {
    const overlay = document.getElementById('quiz-complete');
    const msg = document.getElementById('quiz-complete-msg');

    if (quizScore === QUIZ_QUESTIONS.length) {
        msg.textContent = 'Perfect score! You really know us!';
    } else if (quizScore >= 3) {
        msg.textContent = 'You know us so well!';
    } else {
        msg.textContent = `${quizScore} out of ${QUIZ_QUESTIONS.length} — we have more memories to make!`;
    }

    overlay.style.display = 'flex';
}

// ============================================
// SCREEN 7: CATCH THE HEARTS
// ============================================
function initCatch() {
    const startBtn = document.getElementById('catch-start-btn');
    const continueBtn = document.getElementById('continue-to-question');

    startBtn.addEventListener('click', () => {
        document.getElementById('catch-start').style.display = 'none';
        startCatchGame();
    });

    continueBtn.addEventListener('click', () => {
        switchScreen('catch', 'question');
        updateProgress(7);
    });
}

function startCatchGame() {
    catchScore = 0;
    catchTimer = 15;
    catchActive = true;
    document.getElementById('catch-score').textContent = '0';
    document.getElementById('catch-timer').textContent = '15';

    // Timer countdown
    catchInterval = setInterval(() => {
        catchTimer--;
        document.getElementById('catch-timer').textContent = catchTimer;

        if (catchTimer <= 0) {
            endCatchGame();
        }
    }, 1000);

    // Spawn hearts
    catchSpawnInterval = setInterval(() => {
        if (catchActive) spawnCatchHeart();
    }, 400);
}

function spawnCatchHeart() {
    const area = document.getElementById('catch-area');
    const areaWidth = area.offsetWidth;

    const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const size = 24 + Math.random() * 20;
    heart.setAttribute('viewBox', '0 0 24 24');
    heart.setAttribute('width', size);
    heart.setAttribute('height', size);
    heart.classList.add('catch-heart');

    const colors = ['#ec407a', '#e91e63', '#f06292', '#d81b60', '#ff80ab', '#e53935'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
    path.setAttribute('fill', color);
    heart.appendChild(path);

    const x = Math.random() * (areaWidth - size);
    heart.style.left = x + 'px';
    heart.style.top = '-60px';

    // Random fall speed
    const fallDuration = 2 + Math.random() * 2;
    heart.style.animationDuration = fallDuration + 's';

    // Click/tap to catch
    const catchHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!catchActive) return;
        heart.classList.add('caught');
        heart.removeEventListener('click', catchHandler);
        heart.removeEventListener('touchstart', catchHandler);

        catchScore++;
        document.getElementById('catch-score').textContent = catchScore;

        // Burst particles
        const rect = heart.getBoundingClientRect();
        const areaRect = area.getBoundingClientRect();
        const cx = rect.left - areaRect.left + rect.width / 2;
        const cy = rect.top - areaRect.top + rect.height / 2;
        createCatchBurst(area, cx, cy, color);

        setTimeout(() => heart.remove(), 300);

        // Check if reached goal early
        if (catchScore >= 15) {
            endCatchGame();
        }
    };

    heart.addEventListener('click', catchHandler);
    heart.addEventListener('touchstart', catchHandler, { passive: false });

    area.appendChild(heart);

    // Remove after animation ends
    setTimeout(() => {
        if (heart.parentNode && !heart.classList.contains('caught')) {
            heart.remove();
        }
    }, fallDuration * 1000 + 100);
}

function createCatchBurst(container, x, y, color) {
    const burstCount = 6;
    for (let i = 0; i < burstCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'catch-burst';
        const angle = (Math.PI * 2 / burstCount) * i;
        const dist = 15 + Math.random() * 20;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;
        particle.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
        particle.style.setProperty('--by', Math.sin(angle) * dist + 'px');
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
    }
}

function endCatchGame() {
    catchActive = false;
    clearInterval(catchInterval);
    clearInterval(catchSpawnInterval);

    // Remove remaining hearts
    document.querySelectorAll('.catch-heart').forEach(h => h.remove());

    const overlay = document.getElementById('catch-complete');
    const msg = document.getElementById('catch-complete-msg');

    if (catchScore >= 15) {
        msg.textContent = 'You caught ALL the love! Amazing!';
    } else if (catchScore >= 10) {
        msg.textContent = `${catchScore} hearts caught! So much love!`;
    } else {
        msg.textContent = `${catchScore} hearts — every bit of love counts!`;
    }

    setTimeout(() => {
        overlay.style.display = 'flex';
    }, 500);
}

// ============================================
// SCREEN 8: THE QUESTION (YES / NO)
// ============================================
function initQuestionButtons() {
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');
    const hint = document.getElementById('yes-hint');

    btnNo.addEventListener('mouseenter', () => {
        runawayButton(btnNo);
    });

    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        runawayButton(btnNo);
    });

    btnYes.addEventListener('click', () => {
        yesClickCount++;
        yesBtnScale += 0.12;

        btnYes.style.transform = `scale(${yesBtnScale})`;

        if (yesClickCount < YES_MESSAGES.length) {
            hint.style.display = 'block';
            hint.textContent = YES_MESSAGES[yesClickCount - 1];

            const yesTexts = ["Yes!!", "YESSS!", "ABSOLUTELY!", "FOREVER YES!", "SAY IT LOUDER!"];
            btnYes.textContent = yesTexts[Math.min(yesClickCount, yesTexts.length - 1)];
        } else {
            btnNo.style.display = 'none';
            switchScreen('question', 'celebration');
            updateProgress(8);
            startCelebration();
        }
    });
}

function runawayButton(btn) {
    const padding = 20;
    const btnWidth = btn.offsetWidth;
    const btnHeight = btn.offsetHeight;

    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;

    let newX = padding + Math.random() * (maxX - padding);
    let newY = padding + Math.random() * (maxY - padding);

    btn.style.left = newX + 'px';
    btn.style.top = newY + 'px';
    btn.style.bottom = 'auto';
    btn.style.transform = 'none';

    btn.textContent = NO_MESSAGES[Math.floor(Math.random() * NO_MESSAGES.length)];
}

// ============================================
// CELEBRATION SVG HEARTS
// ============================================
function initCelebrationHearts() {
    const container = document.getElementById('celebration-hearts');
    const colors = ['#ec407a', '#e91e63', '#f06292', '#d81b60', '#ff80ab'];

    colors.forEach(color => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '40');
        svg.setAttribute('height', '40');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
        path.setAttribute('fill', color);

        svg.appendChild(path);
        container.appendChild(svg);
    });
}

// ============================================
// SCREEN 7: CELEBRATION
// ============================================
function startCelebration() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = ['#ec407a', '#f48fb1', '#e53935', '#ffd700', '#ff6090', '#ff80ab', '#f50057', '#ff4081', '#ffffff', '#ffb6c1'];
    const shapes = ['confetti', 'heart', 'circle'];

    for (let i = 0; i < 200; i++) {
        particles.push(createConfettiParticle(canvas, colors, shapes, true));
    }

    let addInterval = setInterval(() => {
        for (let i = 0; i < 5; i++) {
            particles.push(createConfettiParticle(canvas, colors, shapes, false));
        }
    }, 100);

    setTimeout(() => clearInterval(addInterval), 8000);

    createHeartBalloons();

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.002;

            if (p.opacity <= 0 || p.y > canvas.height + 50) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);

            if (p.shape === 'heart') {
                drawHeart(ctx, p.size, p.color);
            } else if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            } else {
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            }

            ctx.restore();
        }

        if (particles.length > 0) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

function createConfettiParticle(canvas, colors, shapes, burst) {
    return {
        x: burst ? canvas.width / 2 + (Math.random() - 0.5) * 100 : Math.random() * canvas.width,
        y: burst ? canvas.height / 2 : -20,
        vx: burst ? (Math.random() - 0.5) * 16 : (Math.random() - 0.5) * 4,
        vy: burst ? Math.random() * -18 - 4 : Math.random() * 2 + 1,
        gravity: 0.12,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
    };
}

function drawHeart(ctx, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size / 2;
    ctx.moveTo(0, s / 2);
    ctx.bezierCurveTo(-s, -s / 2, -s * 2, s / 3, 0, s * 1.5);
    ctx.bezierCurveTo(s * 2, s / 3, s, -s / 2, 0, s / 2);
    ctx.fill();
}

function createHeartBalloons() {
    const container = document.getElementById('screen-celebration');
    const heartColors = ['#ec407a', '#e91e63', '#f06292', '#d81b60', '#ff80ab', '#e53935', '#f48fb1', '#ff4081', '#c2185b'];

    for (let i = 0; i < 30; i++) {
        const balloon = document.createElement('div');
        const size = 1.5 + Math.random() * 2.5;
        const color = heartColors[Math.floor(Math.random() * heartColors.length)];

        balloon.style.cssText = `
            position: fixed;
            bottom: -80px;
            left: ${Math.random() * 100}%;
            width: ${size}rem;
            height: ${size}rem;
            animation: balloonRise ${5 + Math.random() * 8}s linear ${Math.random() * 3}s forwards;
            z-index: 6;
            pointer-events: none;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        `;

        balloon.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
            2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 
            14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
            6.86-8.55 11.54L12 21.35z" fill="${color}" opacity="0.85"/>
        </svg>`;

        container.appendChild(balloon);
    }

    if (!document.getElementById('balloon-keyframes')) {
        const style = document.createElement('style');
        style.id = 'balloon-keyframes';
        style.textContent = `
            @keyframes balloonRise {
                0% {
                    transform: translateY(0) rotate(0deg) scale(0.5);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                    transform: translateY(-10vh) rotate(5deg) scale(1);
                }
                50% {
                    transform: translateY(-50vh) rotate(-5deg) scale(1.1);
                }
                100% {
                    transform: translateY(-120vh) rotate(10deg) scale(0.8);
                    opacity: 0.8;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// SCREEN TRANSITIONS
// ============================================
function switchScreen(from, to) {
    screens[from].classList.remove('active');
    screens[to].classList.add('active');
}
