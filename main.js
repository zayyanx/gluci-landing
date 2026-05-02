// ===== Gluci Landing Page — main.js =====

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll animations (IntersectionObserver) ---
  const animatedEls = document.querySelectorAll('.animate-on-scroll');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animatedEls.forEach((el) => scrollObserver.observe(el));

  // --- Sticky mobile CTA visibility ---
  const stickyCta = document.getElementById('sticky-cta');
  const heroCtaGrid = document.getElementById('hero-cta-grid');
  const finalCtaGrid = document.getElementById('final-cta-grid');

  if (stickyCta && heroCtaGrid && finalCtaGrid) {
    const stickyObserver = new IntersectionObserver((entries) => {
      const heroVisible = entries.find(e => e.target === heroCtaGrid)?.isIntersecting;
      const finalVisible = entries.find(e => e.target === finalCtaGrid)?.isIntersecting;

      // Re-check both targets each time
      checkStickyVisibility();
    }, { threshold: 0.1 });

    let heroInView = true;
    let finalInView = false;

    const heroObs = new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      checkStickyVisibility();
    }, { threshold: 0.1 });

    const finalObs = new IntersectionObserver(([entry]) => {
      finalInView = entry.isIntersecting;
      checkStickyVisibility();
    }, { threshold: 0.1 });

    heroObs.observe(heroCtaGrid);
    finalObs.observe(finalCtaGrid);

    function checkStickyVisibility() {
      if (heroInView || finalInView) {
        stickyCta.classList.remove('visible');
      } else {
        stickyCta.classList.add('visible');
      }
    }
  }

  // --- Bottom sheet ---
  const scanBtn = document.getElementById('sticky-scan-btn');
  const sheet = document.getElementById('bottom-sheet');
  const overlay = document.getElementById('bottom-sheet-overlay');

  function openSheet() {
    overlay.style.display = 'block';
    sheet.style.display = 'block';
    // Force reflow for transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('open');
        sheet.classList.add('open');
      });
    });
  }

  function closeSheet() {
    overlay.classList.remove('open');
    sheet.classList.remove('open');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }

  if (scanBtn) scanBtn.addEventListener('click', openSheet);
  if (overlay) overlay.addEventListener('click', closeSheet);

  // Swipe-down to close the sheet
  let touchStartY = 0;
  if (sheet) {
    sheet.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    sheet.addEventListener('touchmove', (e) => {
      const deltaY = e.touches[0].clientY - touchStartY;
      if (deltaY > 60) closeSheet();
    }, { passive: true });
  }

  // --- Creator wall: ?ref= reordering ---
  const params = new URLSearchParams(window.location.search);
  const refCreator = params.get('ref');
  if (refCreator) {
    const grid = document.querySelector('.creator-grid');
    if (grid) {
      const cards = Array.from(grid.children);
      const match = cards.find(card => {
        const name = card.querySelector('.name');
        return name && name.textContent.replace('@', '').toLowerCase() === refCreator.toLowerCase();
      });
      if (match) {
        grid.prepend(match);
      }
    }
  }

  // --- iMessage button: device-gating ---
  const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const imessageButtons = document.querySelectorAll('[id^="btn-imessage"]');

  imessageButtons.forEach(btn => {
    if (isApple) {
      btn.href = 'sms:&body=Hi%20Gluci';
    } else {
      btn.style.opacity = '0.5';
      btn.style.cursor = 'default';
      btn.title = 'iMessage opens on Apple devices';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSheet();
      });
    }
  });

  // --- Telegram deeplink with fallback ---
  const telegramButtons = document.querySelectorAll('[id^="btn-telegram"]');
  telegramButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Try native app first
      const start = Date.now();
      window.location.href = 'tg://resolve?domain=gluci_bot';
      setTimeout(() => {
        // If still on page after 250ms, app probably not installed — fallback to web
        if (Date.now() - start < 400) {
          window.location.href = 'https://t.me/gluci_bot';
        }
      }, 250);
    });
  });

});
