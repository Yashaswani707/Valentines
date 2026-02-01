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

  // Move the 'No' button away from the Yes button (keeps it within the container)
  function moveNoButton() {
    if (shyCount >= maxShy) return; // stops moving after enough tries

    const areaRect = buttonArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const padding = 8; // small padding so it doesn't touch edge
    const smallScreen = areaRect.width < 420;

    // Centers relative to the buttonArea (so we can position using left/top inside it)
    const yesCenter = {
      x: yesRect.left + yesRect.width / 2 - areaRect.left,
      y: yesRect.top + yesRect.height / 2 - areaRect.top
    };

    const noCenter = {
      x: btnRect.left + btnRect.width / 2 - areaRect.left,
      y: btnRect.top + btnRect.height / 2 - areaRect.top
    };

    // Vector from yes -> no. If too small, pick a random direction so it can run.
    let vx = noCenter.x - yesCenter.x;
    let vy = noCenter.y - yesCenter.y;
    if (Math.hypot(vx, vy) < 8) {
      const ang = Math.random() * Math.PI * 2;
      vx = Math.cos(ang);
      vy = Math.sin(ang);
    }

    // Normalize vector
    const len = Math.hypot(vx, vy);
    vx /= len; vy /= len;

    // How far to jump (smaller on small screens)
    const moveDist = Math.min(areaRect.width, areaRect.height) * (smallScreen ? 0.35 : 0.6);
    let targetX = noCenter.x + vx * moveDist;
    let targetY = noCenter.y + vy * moveDist;

    // Clamp so the center stays within the area boundaries (account for half button size)
    const halfW = btnRect.width / 2;
    const halfH = btnRect.height / 2;
    targetX = Math.max(halfW + padding, Math.min(areaRect.width - halfW - padding, targetX));
    targetY = Math.max(halfH + padding, Math.min(areaRect.height - halfH - padding, targetY));

    // Ensure it's at a safe distance from the Yes button; otherwise push to the farthest corner
    const minDist = Math.min(areaRect.width, areaRect.height) * (smallScreen ? 0.25 : 0.35);
    const dToYes = Math.hypot(targetX - yesCenter.x, targetY - yesCenter.y);
    if (dToYes < minDist) {
      const corners = [
        {x: halfW + padding, y: halfH + padding},
        {x: areaRect.width - halfW - padding, y: halfH + padding},
        {x: halfW + padding, y: areaRect.height - halfH - padding},
        {x: areaRect.width - halfW - padding, y: areaRect.height - halfH - padding}
      ];
      corners.sort((a,b)=> Math.hypot(b.x - yesCenter.x, b.y - yesCenter.y) - Math.hypot(a.x - yesCenter.x, a.y - yesCenter.y));
      targetX = corners[0].x;
      targetY = corners[0].y;
    }

    // Apply position (we set left to targetX - halfW so the button's left aligns correctly)
    noBtn.style.left = `${Math.round(targetX - halfW)}px`;
    // Store the center Y position directly; CSS translateY(-50%) will center the button vertically
    noBtn.style.top = `${Math.round(targetY)}px`;

    // Add shy wobble animation and bump the counter
    noBtn.classList.remove('shy');
    void noBtn.offsetWidth;
    noBtn.classList.add('shy');

    shyCount++;
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

  // Make the No button run away when the pointer/finger is near the Yes button
  buttonArea.addEventListener('mousemove', (e) => {
    if (celebrationOpen) return;
    const yesRect = yesBtn.getBoundingClientRect();
    const yesCenterX = yesRect.left + yesRect.width / 2;
    const yesCenterY = yesRect.top + yesRect.height / 2;
    const dist = Math.hypot(e.clientX - yesCenterX, e.clientY - yesCenterY);
    const tolerance = 120; // px
    if (dist < tolerance) {
      moveNoButton();
    }
  });

  // For touch devices: if a touch starts near the Yes button, make the No button run away
  buttonArea.addEventListener('touchstart', (e) => {
    if (celebrationOpen) return;
    const touch = e.touches[0];
    if (!touch) return;
    const yesRect = yesBtn.getBoundingClientRect();
    const yesCenterX = yesRect.left + yesRect.width / 2;
    const yesCenterY = yesRect.top + yesRect.height / 2;
    const dist = Math.hypot(touch.clientX - yesCenterX, touch.clientY - yesCenterY);
    const tolerance = 120;
    if (dist < tolerance) {
      e.preventDefault();
      moveNoButton();
    }
  }, {passive:false});

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
