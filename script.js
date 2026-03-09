// ============================================================
// TĀLA EDUCATION — PD Page Redesign — Script
// ============================================================

// --- Pricing Tabs (Mobile)
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.pricing-tab');
  const cards = document.querySelectorAll('.p-card');

  const updatePricingDisplay = () => {
    const isMobile = window.innerWidth <= 1024;
    const activeTab = document.querySelector('.pricing-tab.active');
    const targetId = activeTab ? activeTab.getAttribute('data-target') : 'card-reserve';

    cards.forEach(card => {
      if (isMobile) {
        card.style.display = card.id === targetId ? 'flex' : 'none';
      } else {
        card.style.display = 'flex';
      }
    });
  };

  if (tabs.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updatePricingDisplay();
      });
    });

    window.addEventListener('resize', updatePricingDisplay);
    updatePricingDisplay(); // Initial call
  }

  // --- Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');
    });
  }

  // --- Payment Status Notifications (from URL)
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const orderId = urlParams.get('orderId');
  const msg = urlParams.get('msg');

  if (status) {
    if (status === 'success') {
      alert(`🎉 Payment Successful!\nOrder ID: ${orderId}\n\nThank you for registering. You will receive a confirmation email shortly.`);
    } else if (status === 'failed') {
      alert(`❌ Payment Failed!\nOrder ID: ${orderId}\nReason: ${msg || 'Unknown error'}\n\nPlease try again or contact support if the issue persists.`);
    } else if (status === 'cancelled') {
      alert(`⚠️ Payment Cancelled\n\nThe transaction was not completed. You can try again whenever you are ready.`);
    }
    // Clean up URL parameters without refreshing the page
    window.history.replaceState({}, document.title, "/");
  }
});


// --- Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// --- Sticky nav shadow on scroll
const nav = document.querySelector('.nav-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.12)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

// --- Intersection Observer for reveal animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});

// --- Video placeholder click
const videoPlaceholder = document.querySelector('.video-placeholder');
if (videoPlaceholder) {
  videoPlaceholder.addEventListener('click', () => {
    // Replace with actual YouTube/Vimeo embed if needed
    const url = 'https://www.youtube.com/@talaeducation';
    window.open(url, '_blank', 'noopener');
  });
}

// ---- Scroll-triggered counter for Stats
function animateCounter(el, target, duration = 2000) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    const currentCount = Math.floor(easedProgress * target);
    el.textContent = currentCount.toLocaleString() + '+';
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString() + '+';
    }
  };
  window.requestAnimationFrame(step);
}

const counterStats = document.querySelectorAll('.counter-stat');
if (counterStats.length > 0) {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        animateCounter(entry.target, target, 2000);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counterStats.forEach(stat => counterObs.observe(stat));
}

// --- Horizontal Scroll Logic for Testimonials
function scrollTestimonials(direction) {
  const grid = document.querySelector('.testimonials-grid');
  if (grid) {
    const scrollAmount = 400 * direction;
    grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}



// --- 1. Custom Pricing Variables & Logic ---

const PRICING_DATA = {
  'Bangalore': { 'Non-Residential': 15999, 'Residential': 18999 },
  'Pune': { 'Non-Residential': 15999 }
};

const GROUP_PRICES = {
  'Bangalore': {
    'Non-Residential': { 'up-to-4': 15999, '5-teachers': 15199, '6-plus': 14879 },
    'Residential': { 'up-to-4': 18999, '5-teachers': 18049, '6-plus': 17669 }
  },
  'Pune': {
    'Non-Residential': { 'up-to-4': 15999, '5-teachers': 15199, '6-plus': 14879 }
  }
};

/* ── Mobile: Tab Switcher ── */
const TABS = ['reserve', 'flexible', 'group'];
const ACTIVE_CLS = ['active-reserve', 'active-flexible', 'active-group'];

window.switchTab = function (tab) {
  TABS.forEach((id, i) => {
    const btn = document.getElementById('m-tab-' + id);
    const panel = document.getElementById('m-panel-' + id);
    const on = id === tab;
    if (btn) btn.className = 'tab-btn' + (on ? ' ' + ACTIVE_CLS[i] : '');
    if (panel) {
      panel.classList.toggle('hidden', !on);
      if (on) { panel.style.animation = 'none'; panel.offsetHeight; panel.style.animation = ''; }
    }
  });
};

/* ── Card 1: Reserve Now Logic ── */
window.qty = { d: 1, m: 1 };
window.changeQty = function (p, delta) {
  window.qty[p] = Math.max(1, Math.min(10, window.qty[p] + delta));
  const qtyNum = document.getElementById(p + '-qtyNum');
  const qtyTotal = document.getElementById(p + '-qtyTotal');
  if (qtyNum) qtyNum.textContent = window.qty[p];
  if (qtyTotal) qtyTotal.textContent = '₹' + (window.qty[p] * 999).toLocaleString();
};

window.reserveNow = function (p) {
  currentOrderData.amount = window.qty[p] * 999;
  window.openRegisterModal();
};

/* ── Card 2: Individual Teacher Logic ── */
window.switchCity = function (p, cityShort) {
  const panels = { blr: p + '-flex-blr', pun: p + '-flex-pun' };
  const btns = { blr: p + '-btn-blr', pun: p + '-btn-pun' };

  Object.keys(panels).forEach(key => {
    const panel = document.getElementById(panels[key]);
    const btn = document.getElementById(btns[key]);
    if (panel) panel.classList.toggle('hidden', key !== cityShort);
    if (btn) btn.classList.toggle('active', key === cityShort);
  });
};

window.selectPlan = function (containerId, activeBtn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const buttons = container.querySelectorAll('.plan-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');

  const parts = containerId.split('-'); // e.g., "d-plan-blr"
  const prefix = parts[0];
  const cityShort = parts[2];
  updateFlexiblePrices(prefix, cityShort, activeBtn.textContent);
};

function updateFlexiblePrices(prefix, cityShort, planText) {
  const months = planText === 'Full Pay' ? 1 : parseInt(planText);
  const cityFull = cityShort === 'blr' ? 'Bangalore' : 'Pune';
  const cityData = PRICING_DATA[cityFull];

  const nrPriceEl = document.getElementById(prefix + '-price-' + cityShort + '-nonres');
  if (nrPriceEl) {
    const amt = Math.ceil(cityData['Non-Residential'] / months);
    nrPriceEl.textContent = '₹' + amt.toLocaleString();
  }

  if (cityData['Residential']) {
    const rPriceEl = document.getElementById(prefix + '-price-' + cityShort + '-res');
    if (rPriceEl) {
      const amt = Math.ceil(cityData['Residential'] / months);
      rPriceEl.textContent = '₹' + amt.toLocaleString();
    }
  }
}

/* ── Card 3: School / Group Logic ── */
window.gState = {
  d: { city: 'Bangalore', acc: 'Non-Residential', qty: 6 },
  m: { city: 'Bangalore', acc: 'Non-Residential', qty: 6 }
};

window.switchGroupCity = function (p, cityShort) {
  const cityFull = cityShort === 'blr' ? 'Bangalore' : 'Pune';
  window.gState[p].city = cityFull;

  const blrPanel = document.getElementById(p + '-g-blr');
  const punPanel = document.getElementById(p + '-g-pun');
  if (blrPanel) blrPanel.classList.toggle('hidden', cityShort !== 'blr');
  if (punPanel) punPanel.classList.toggle('hidden', cityShort !== 'pun');

  const blrBtn = document.getElementById(p + '-g-btn-blr');
  const punBtn = document.getElementById(p + '-g-btn-pun');
  if (blrBtn) blrBtn.classList.toggle('active', cityShort === 'blr');
  if (punBtn) punBtn.classList.toggle('active', cityShort === 'pun');

  if (cityFull === 'Pune' && window.gState[p].acc === 'Residential') {
    window.gState[p].acc = 'Non-Residential';
  }
  window.refreshGroup(p, cityShort);
};

window.toggleGroupAccom = function (p) {
  const cityFull = window.gState[p].city;
  if (cityFull === 'Pune') return;

  window.gState[p].acc = (window.gState[p].acc === 'Non-Residential') ? 'Residential' : 'Non-Residential';
  const cityShort = cityFull === 'Bangalore' ? 'blr' : 'pun';
  window.refreshGroup(p, cityShort);
};

window.changeGroup = function (p, delta) {
  window.gState[p].qty = Math.max(6, Math.min(10, window.gState[p].qty + delta));

  // Use gCount for Bangalore, pCount for Pune
  const cityFull = window.gState[p].city;
  const isPune = cityFull === 'Pune';
  const qtyElId = isPune ? p + '-pCount' : p + '-gCount';

  const qtyEl = document.getElementById(qtyElId);
  if (qtyEl) qtyEl.textContent = window.gState[p].qty;

  const cityShort = isPune ? 'pun' : 'blr';
  window.refreshGroup(p, cityShort);
};

window.refreshGroup = function (p, cityShort) {
  const cityFull = window.gState[p].city;
  const acc = window.gState[p].acc;
  const qtyVal = window.gState[p].qty;
  const data = GROUP_PRICES[cityFull][acc];

  const labelEl = document.getElementById(p + '-g-accom-title');
  if (labelEl) labelEl.textContent = (acc === 'Non-Residential' ? 'NON-RES' : 'RES');

  const nrCols = document.querySelectorAll('.' + p + '-g-col-nonres');
  const rCols = document.querySelectorAll('.' + p + '-g-col-res');
  nrCols.forEach(c => c.classList.toggle('hidden', acc !== 'Non-Residential'));
  rCols.forEach(c => c.classList.toggle('hidden', acc !== 'Residential'));

  // Highlight active tier and update 6+ prices
  const basePrice = (acc === 'Non-Residential' ? 15999 : 18999);
  const headPrice = data['6-plus'];
  const totalSave = (basePrice - headPrice) * qtyVal;

  if (cityShort === 'blr') {
    const hEl = document.getElementById(p + (acc === 'Non-Residential' ? '-gHeadNonRes' : '-gHeadRes'));
    const sEl = document.getElementById(p + (acc === 'Non-Residential' ? '-gSaveNonRes' : '-gSaveRes'));
    if (hEl) hEl.innerHTML = `₹${headPrice.toLocaleString()}<small>/head</small>`;
    if (sEl) sEl.textContent = `You save ₹${totalSave.toLocaleString()}`;
  }
};

// --- Registration Modal & Payment Flow ---
let currentOrderData = { amount: 0 };
const modal = document.getElementById("registerModal");
const registerForm = document.querySelector(".register-form");

const closeBtn = document.querySelector(".close");

window.openRegisterModal = function () {
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
};

const payButtons = document.querySelectorAll(".pay-now");
payButtons.forEach(button => {
  button.addEventListener('click', () => {
    // If it was already handled by reserveNow, skip amount calculation here
    if (button.hasAttribute('onclick') && button.getAttribute('onclick').includes('reserveNow')) return;

    const card = button.closest('.p-card');
    if (!card) return;

    if (card.id.includes('individual') || card.id.includes('flexible')) {
      const prefix = card.id.startsWith('m-') ? 'm' : 'd';
      const cityShort = document.getElementById(prefix + '-btn-blr').classList.contains('active') ? 'blr' : 'pun';
      const radio = document.querySelector(`input[name="${prefix}-accom-${cityShort}"]:checked`);
      const priceStr = radio.closest('.accom-option').querySelector('.accom-price').textContent;
      currentOrderData.amount = parseInt(priceStr.replace(/[₹,]/g, ''));
    } else if (card.id.includes('group')) {
      const p = card.id.startsWith('m-') ? 'm' : 'd';
      const cityFull = window.gState[p].city;
      const acc = window.gState[p].acc;
      const gq = window.gState[p].qty;
      const data = GROUP_PRICES[cityFull][acc];

      if (gq <= 4) currentOrderData.amount = data['up-to-4'] * gq;
      else if (gq === 5) currentOrderData.amount = data['5-teachers'] * 5;
      else currentOrderData.amount = data['6-plus'] * gq;
    }

    window.openRegisterModal();
  });
});

if (closeBtn) {
  closeBtn.onclick = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  };
}

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
};

// --- 4. Paytm JS Checkout Integration ---
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = registerForm.querySelector('input[placeholder="Name *"]').value;
  const phone = registerForm.querySelector('input[placeholder="Phone Number *"]').value;
  const email = registerForm.querySelector('input[placeholder="Official email *"]').value;

  const amount = currentOrderData.amount;
  const customerId = 'CUST_' + phone.replace(/\s+/g, '');

  const submitBtn = registerForm.querySelector('.submit-btn');
  submitBtn.textContent = 'Processing...';
  submitBtn.disabled = true;


  try {
    // 2. Call our backend to initiate the transaction
    const response = await fetch('./paytm/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        customerId: customerId,
        customerEmail: email,
        customerPhone: phone
      })
    });

    const data = await response.json();

    if (data.success) {
      // Close our registration modal
      modal.style.display = "none";
      document.body.style.overflow = "auto";

      // Redirect to Paytm Standard Checkout Page
      const paytmUrl = `https://${data.environment}/theia/api/v1/showPaymentPage?mid=${data.mid}&orderId=${data.orderId}`;

      // Create a hidden form to submit the request
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paytmUrl;

      // Add the txnToken as a hidden input
      const txnTokenInput = document.createElement('input');
      txnTokenInput.type = 'hidden';
      txnTokenInput.name = 'txnToken';
      txnTokenInput.value = data.txnToken;
      form.appendChild(txnTokenInput);

      // Add the mid as a hidden input
      const midInput = document.createElement('input');
      midInput.type = 'hidden';
      midInput.name = 'mid';
      midInput.value = data.mid;
      form.appendChild(midInput);

      // Add the orderId as a hidden input
      const orderIdInput = document.createElement('input');
      orderIdInput.type = 'hidden';
      orderIdInput.name = 'orderId';
      orderIdInput.value = data.orderId;
      form.appendChild(orderIdInput);

      document.body.appendChild(form);
      form.submit();

    } else {
      console.error("Payment Error Details:", data);
      const errorMsg = data.details?.body?.resultInfo?.resultMsg || "Payment initiation failed.";
      alert("Error: " + errorMsg + "\n\nPlease check the terminal for more details.");
      submitBtn.textContent = 'Submit';
      submitBtn.disabled = false;
    }

  } catch (err) {
    console.error("Error connecting to server:", err);
    alert("An error occurred. Please ensure the server is running.");
    submitBtn.textContent = 'Submit';
    submitBtn.disabled = false;
  }
});
