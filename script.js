// script.js - behavior for the Valentine app

document.addEventListener('DOMContentLoaded', () => {
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const buttonArea = document.getElementById('buttonArea');
  const card = document.getElementById('card');
  const celebration = document.getElementById('celebration');

  // Settings for "shy" behavior
  let shyCount = 0;
  const maxShy = 10; // After 10 tries it calms down and becomes clickable

  // Helper: get a random integer between min and max
  function rnd(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Moves the 'No' button to a random position inside buttonArea without going off-screen
  function moveNoButton() {
    if (shyCount >= maxShy) return; // stops moving after enough tries

    const areaRect = buttonArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // Calculate available space inside button area where the button can be placed
    const padding = 8; // small padding so it doesn't touch edge
    const maxLeft = Math.max(areaRect.width - btnRect.width - padding, padding);
    const maxTop = Math.max(areaRect.height - btnRect.height - padding, padding);

    // On small screens, make movements more subtle (less jumpy)
    const smallScreen = areaRect.width < 420;
    const left = rnd(padding, Math.max(padding, Math.floor(maxLeft * (smallScreen ? 0.8 : 1))));
    const top = rnd(padding, Math.max(padding, Math.floor(maxTop * (smallScreen ? 0.55 : 0.9))));

    // Apply position - we use absolute positioning set in CSS
    noBtn.style.left = `${left}px`;
    noBtn.style.top = `${top + (btnRect.height/2)}px`; // we store top as centered offset in CSS transform
    // Because CSS positions from top:50% and transform translateY(-50%), we normalize by adding half of height

    // Add a short shy wobble animation
    noBtn.classList.remove('shy');
    // Force reflow to restart animation
    void noBtn.offsetWidth;
    noBtn.classList.add('shy');

    shyCount++;

    // If it's calmed down, show subtle hint after last try
    if (shyCount === maxShy) {
      noBtn.setAttribute('title', 'Okay, you can click me now 😌');
    }
  }

  // Attach events for mouse and touch
  noBtn.addEventListener('mouseenter', (e) => {
    // ignore if game already ended
    if (celebrationOpen) return;
    moveNoButton();
  });

  // For touch devices: move away on touchstart to avoid immediate tap
  noBtn.addEventListener('touchstart', (e) => {
    if (celebrationOpen) return;
    // prevent the first tap from also triggering a click
    e.preventDefault();
    moveNoButton();
  }, {passive:false});

  // As a fallback, also make the entire buttonArea chase the finger a bit when pointer moves close
  buttonArea.addEventListener('mousemove', (e) => {
    if (celebrationOpen) return;
    // If cursor is very near the No button, move it
    const rect = noBtn.getBoundingClientRect();
    const tolerance = 90; // px
    if (Math.abs(e.clientX - (rect.left + rect.width / 2)) < tolerance && Math.abs(e.clientY - (rect.top + rect.height / 2)) < tolerance) {
      moveNoButton();
    }
  });

  // Allow keyboard users to activate No (important for accessibility) - after shyCount reached, the button becomes clickable
  noBtn.addEventListener('click', (e) => {
    if (shyCount < maxShy) {
      // Prevent click if still shy; move away instead
      e.preventDefault();
      moveNoButton();
    } else {
      // If it calmed down, let the click happen (for completeness we just show a tiny message)
      showSoftNoResponse();
    }
  });

  function showSoftNoResponse(){
    celebration.innerHTML = '<p class="subtext">Oh no... maybe next time 💜</p>';
    celebration.hidden = false;
    // hide buttons to avoid further interaction
    buttonArea.style.display = 'none';
  }

  // Celebration when Yes is clicked
  let celebrationOpen = false;
  yesBtn.addEventListener('click', () => {
    if (celebrationOpen) return;
    celebrationOpen = true;

    // Replace the card content with celebration message
    card.innerHTML = `
      <h1>yessss ayayyyy</h1>
      <p class="subtext">You made my day — I'm so happy 💕</p>
      <div class="big-heart" id="bigHeart" aria-hidden="true"></div>
    `;

    const bigHeart = document.getElementById('bigHeart');
    // Bounce heart
    bigHeart.classList.add('bounce');

    // Add confetti
    launchConfetti();
  });

  // Confetti generator - creates colorful falling pieces and cleans up
  function launchConfetti(){
    const colors = ['#ff4d7e','#ff90b3','#ffd3e0','#ffd36b','#ff6f91'];
    const count = 40;
    for (let i = 0; i < count; i++){
      const el = document.createElement('div');
      el.className = 'confetti';
      const size = rnd(6,14);
      el.style.width = `${size}px`;
      el.style.height = `${Math.max(8, size-2)}px`;
      el.style.left = `${rnd(5,95)}vw`;
      el.style.background = colors[Math.floor(Math.random()*colors.length)];
      el.style.top = `${-rnd(5,20)}vh`;
      const delay = (Math.random()*0.8).toFixed(2);
      const duration = (rnd(1400,2600)/1000).toFixed(2);
      el.style.animation = `confettiFall ${duration}s linear ${delay}s forwards`;
      el.style.transform = `rotate(${rnd(0,360)}deg)`;
      document.body.appendChild(el);

      // Remove after animation
      setTimeout(()=> el.remove(), (parseFloat(delay)+parseFloat(duration))*1000 + 300);
    }
  }

});
