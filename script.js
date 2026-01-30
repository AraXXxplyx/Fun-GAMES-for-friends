// ACTIVITIES AND RARITY CONFIGURATION
const activities = [
    { name: 'Online Quiz', rarity: 'white' },
    { name: 'Truth or Dare', rarity: 'green' },
    { name: 'Watch Party', rarity: 'green' },
    { name: 'Guess the Song', rarity: 'blue' },
    { name: 'Would You Rather', rarity: 'blue' },
    { name: 'Rapid Fire Q&A', rarity: 'yellow' },
    { name: 'Numerology', rarity: 'red' }
];

// STATE MANAGEMENT
let isSpinning = false;
let currentSpinCount = 0;

// DOM ELEMENTS
const homePage = document.getElementById('home-page');
const openingPage = document.getElementById('opening-page');
const openBtn = document.getElementById('open-btn');
const spinBtn = document.getElementById('spin-btn');
const rollingBar = document.getElementById('rolling-bar');
const resultModal = document.getElementById('result-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalClose = document.querySelector('.modal-close');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initializeRollingBar();
    setupEventListeners();
});

// SETUP EVENT LISTENERS
function setupEventListeners() {
    openBtn.addEventListener('click', goToOpeningPage);
    spinBtn.addEventListener('click', handleSpin);
    modalCloseBtn.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
}

// PAGE TRANSITIONS
function goToOpeningPage() {
    homePage.classList.remove('active');
    openingPage.classList.add('active');
    currentSpinCount = 0;
    resetRollingBar();
}

function goToHomePage() {
    openingPage.classList.remove('active');
    homePage.classList.add('active');
}

// INITIALIZE ROLLING BAR WITH DUPLICATE ITEMS FOR INFINITE SCROLL EFFECT
function initializeRollingBar() {
    rollingBar.innerHTML = '';
    
    // Create 8 complete sets of activities for smooth continuous animation
    for (let set = 0; set < 8; set++) {
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = `rolling-item rarity-${activity.rarity}`;
            item.textContent = activity.name;
            rollingBar.appendChild(item);
        });
    }
}

// RESET ROLLING BAR POSITION
function resetRollingBar() {
    rollingBar.style.transition = 'none';
    rollingBar.style.transform = 'translateX(0)';
    // Force reflow
    rollingBar.offsetHeight;
}

// ============================================
// PHASE 1: ANIMATION (Purely Visual)
// ============================================

// HANDLE SPIN LOGIC
function handleSpin() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    currentSpinCount++;
    
    // Calculate target position to land on "Numerology"
    const result = calculateNumerologyPosition();
    
    // Simulate multiple spins with decreasing speed
    performSpinAnimation(result.targetPosition, result.resetPosition);
}

// CALCULATE POSITION TO LAND ON NUMEROLOGY
function calculateNumerologyPosition() {
    const itemWidth = 155; // 140px item + 15px gap
    const numerologyIndex = activities.findIndex(a => a.name === 'Numerology');
    const totalItems = activities.length;
    
    // Get the viewport width (the rolling-bar-track container)
    const container = document.querySelector('.rolling-bar-track');
    const containerWidth = container.offsetWidth;
    
    // One complete cycle of all items
    const cycleDistance = itemWidth * totalItems;
    
    // RANDOMNESS: Vary the number of complete loops (3-6 cycles)
    // This makes the animation look different each time while maintaining deterministic landing
    const extraLoops = 3 + (currentSpinCount % 4);
    
    // DETERMINISTIC: Calculate exact centered position of Numerology
    // Center the item under the pointer using the formula:
    // finalTranslateX = (numerologyIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2)
    const centeredNumerologyOffset = (numerologyIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
    
    // Target position for animation: multiple full cycles + centered Numerology offset
    const totalScrollDistance = (extraLoops * cycleDistance) + centeredNumerologyOffset;
    const targetPosition = -totalScrollDistance;
    
    // Reset position: same visual alignment, but within first cycle (no extra loops)
    // This will be visually identical to the target but without the extra rotations
    const resetPosition = -centeredNumerologyOffset;
    
    return { targetPosition, resetPosition };
}

// PHASE 1: PERFORM SPIN ANIMATION
function performSpinAnimation(targetPosition, resetPosition) {
    const duration = 4000; // 4 seconds spin
    const startTime = Date.now();
    const startPosition = 0;
    
    function easeOut(t) {
        // Ease-out function for smooth deceleration
        return 1 - Math.pow(1 - t, 3);
    }
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Apply easing for smooth deceleration
        const easedProgress = easeOut(progress);
        const currentPosition = startPosition + (targetPosition - startPosition) * easedProgress;
        
        rollingBar.style.transition = 'none';
        rollingBar.style.transform = `translateX(${currentPosition}px)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete - the roller is now at targetPosition (centered on Numerology)
            // Now reset to equivalent position for infinite loop behavior
            
            // Ensure transition is disabled before reset
            rollingBar.style.transition = 'none';
            
            // Snap to the reset position (same visual item, earlier in the sequence)
            rollingBar.style.transform = `translateX(${resetPosition}px)`;
            
            // Force reflow to ensure the snap happens instantly and invisibly
            rollingBar.offsetHeight;
            
            // Re-enable transition for next spin
            rollingBar.style.transition = '';
            
            isSpinning = false;
            spinBtn.disabled = false;
            
            // Show result modal after spin
            // The modal ALWAYS shows Numerology because the calculation guaranteed we landed on it
            setTimeout(() => {
                showResultModal();
            }, 500);
        }
    }
    
    animate();
}

// ============================================
// PHASE 2: RESULT REVEAL (Instant Display)
// ============================================

// PHASE 2: REVEAL NUMEROLOGY RESULT
function revealNumerologyResult() {
    // Hide animation roller and show result roller
    // No transform, no animation, no drift
    // Result roller already has Numerology centered
    
    resultRollerWrapper.classList.remove('result-roller-hidden');
    resultRollerWrapper.classList.add('result-roller-visible');
    
    isSpinning = false;
    spinBtn.disabled = false;
    
    // Show the result popup
    setTimeout(() => {
        showResultModal();
    }, 300);
}

// SHOW RESULT MODAL
function showResultModal() {
    resultModal.classList.add('active');
}

// CLOSE RESULT MODAL
function closeModal() {
    resultModal.classList.remove('active');
}

// PREVENT MODAL CLOSE ON BACKGROUND CLICK (ONLY close on button/X click)
resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        // Allow closing by clicking outside if desired, or comment this out to prevent it
        // closeModal();
    }
});
