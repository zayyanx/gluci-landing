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

  // --- Waitlist form submissions ---
  async function submitWaitlist(form, successEl) {
    const email = form.querySelector('.email-input').value;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Joining...';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        form.hidden = true;
        successEl.hidden = false;
      } else {
        btn.disabled = false;
        btn.textContent = 'Join Waitlist';
        alert('Something went wrong. Please try again.');
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Join Waitlist';
      alert('Something went wrong. Please try again.');
    }
  }

  const formFinal = document.getElementById('form-final');
  const successFinal = document.getElementById('success-final');
  if (formFinal) formFinal.addEventListener('submit', (e) => {
    e.preventDefault();
    submitWaitlist(formFinal, successFinal);
  });

  const formSheet = document.getElementById('form-sheet');
  const successSheet = document.getElementById('success-sheet');
  if (formSheet) formSheet.addEventListener('submit', (e) => {
    e.preventDefault();
    submitWaitlist(formSheet, successSheet);
  });

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

});
