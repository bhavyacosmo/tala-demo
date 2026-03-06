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

// --- Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(
  '.card, .testimonial-card, .session-card, .include-item, .step-item, .faq-item, .feature-list li, .pricing-card, .section-tag, .section-title, .section-subtitle, .facilitator-grid'
).forEach(el => {
  el.classList.add('fade-in-up');
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

// ---- Scroll-triggered counter for the 1700+ banner
function animateCounter(el, target, duration) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start) + '+';
  }, 16);
}

const proofNumber = document.querySelector('.proof-number');
if (proofNumber) {
  const counterObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounter(proofNumber, 1700, 2000);
      counterObs.unobserve(proofNumber);
    }
  }, { threshold: 0.5 });
  counterObs.observe(proofNumber);
}

// --- Horizontal Scroll Logic for Testimonials & Sessions
function scrollTestimonials(direction) {
  const grid = document.getElementById('testimonials-grid');
  if (grid) {
    const scrollAmount = 300 * direction;
    grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}
function scrollSessions(direction) {
  const grid = document.getElementById('sessions-grid');
  if (grid) {
    const scrollAmount = 300 * direction;
    grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}



// --- 1. Pricing Configuration ---
const PRICES = {
  RESERVE: 999,
  INDIVIDUAL: {
    'Bangalore': { 'Non-Residential': 15999, 'Residential': 18999 },
    'Pune': { 'Non-Residential': 15999 }
  },
  GROUP: {
    'Bangalore': {
      'Non-Residential': { 'up-to-4': 15999, '5-teachers': 15199, '6-plus': 14879 },
      'Residential': { 'up-to-4': 18999, '5-teachers': 18049, '6-plus': 17669 }
    },
    'Pune': {
      'Non-Residential': { 'up-to-4': 15999, '5-teachers': 15199, '6-plus': 14879 }
    }
  }
};


let currentOrderData = {
  amount: 0,
  type: 'reserve'
};

// --- 2. Interactive Pricing Logic ---

// --- Card 1: Reserve Logic ---
const cardReserve = document.getElementById('card-reserve');
if (cardReserve) {
  const qtyInput = cardReserve.querySelector('.qty-input');
  const totalPriceEl = cardReserve.querySelector('.total-price');
  const update = () => {
    const qty = parseInt(qtyInput.value) || 1;
    totalPriceEl.textContent = `₹${(qty * PRICES.RESERVE).toLocaleString()}`;
  };

  cardReserve.querySelector('.qty-btn.plus').onclick = () => {
    let qty = parseInt(qtyInput.value);
    if (qty < 10) {
      qtyInput.value = qty + 1;
      update();
    }
  };
  cardReserve.querySelector('.qty-btn.minus').onclick = () => {
    let qty = parseInt(qtyInput.value);
    if (qty > 1) {
      qtyInput.value = qty - 1;
      update();
    }
  };
}

// --- Card 2: Individual Logic ---
const cardIndividual = document.getElementById('card-individual');
if (cardIndividual) {
  const cityBtns = cardIndividual.querySelectorAll('.city-btn');

  const planPills = cardIndividual.querySelectorAll('.plan-pill');
  const accOptions = cardIndividual.querySelectorAll('.radio-label');
  const emiAlert = cardIndividual.querySelector('.emi-only-alert');

  let state = { city: 'Bangalore', months: 1, accType: 'Non-Residential' };

  const updateIndividual = () => {
    const cityData = PRICES.INDIVIDUAL[state.city];

    // Hide/Show Residential option for Pune
    const resOption = cardIndividual.querySelector('[data-type="Residential"]');
    if (state.city === 'Pune') {
      resOption.style.display = 'none';
      if (state.accType === 'Residential') {
        state.accType = 'Non-Residential';
        accOptions.forEach(opt => opt.classList.remove('active'));
        cardIndividual.querySelector('[data-type="Non-Residential"]').classList.add('active');
      }
    } else {
      resOption.style.display = 'flex';
    }

    const baseRate = cityData[state.accType];
    const monthly = Math.ceil(baseRate / state.months);

    // Update prices for all options in the card based on EMI selection
    accOptions.forEach(opt => {
      const type = opt.getAttribute('data-type');
      const priceDisp = opt.querySelector('.acc-price-display');
      if (cityData[type]) {
        const rate = cityData[type];
        const mon = Math.ceil(rate / state.months);
        priceDisp.textContent = `₹${mon.toLocaleString()}${state.months > 1 ? '/mo' : ''}`;
      }
    });

    emiAlert.style.display = 'block'; // Always show as per user request
  };


  cityBtns.forEach(btn => btn.onclick = () => {
    cityBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.city = btn.getAttribute('data-city');
    btn.closest('.city-toggle').setAttribute('data-city', state.city);
    updateIndividual();
  });



  planPills.forEach(pill => pill.onclick = () => {
    planPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.months = parseInt(pill.getAttribute('data-months'));
    updateIndividual();
  });

  accOptions.forEach(opt => opt.onclick = () => {
    accOptions.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    opt.querySelector('input').checked = true;
    state.accType = opt.getAttribute('data-type');
    updateIndividual();
  });
}


// --- Card 3: Group Logic ---
const cardGroup = document.getElementById('card-group');
if (cardGroup) {
  const cityBtns = cardGroup.querySelectorAll('.city-btn');
  const accPills = cardGroup.querySelectorAll('.acc-pill');
  const tiers = cardGroup.querySelectorAll('.p-table-row');
  const qtyInput = cardGroup.querySelector('.qty-input');

  let groupState = { city: 'Bangalore', acc: 'Non-Residential', qty: 6 };

  const updateGroup = () => {
    const cityData = PRICES.GROUP[groupState.city];

    // Manage Residential pill visibility
    const resPill = document.getElementById('group-res-pill');
    if (groupState.city === 'Pune') {
      resPill.style.display = 'none';
      if (groupState.acc === 'Residential') {
        groupState.acc = 'Non-Residential';
        accPills.forEach(p => p.classList.remove('active'));
        cardGroup.querySelector('[data-acc="Non-Residential"]').classList.add('active');
      }
    } else {
      resPill.style.display = 'inline-block';
    }

    const tierData = cityData[groupState.acc];

    // Update tier prices in the table
    tiers.forEach(t => {
      const tierId = t.getAttribute('data-tier');
      const priceEl = t.querySelector('.tier-price');
      if (tierData[tierId]) {
        const headPrice = tierData[tierId];
        // Only 6+ teachers tier shows the dynamic total based on quantity
        if (tierId === '6-plus' && groupState.qty > 1) {
          const totalPrice = headPrice * groupState.qty;
          priceEl.innerHTML = `₹${totalPrice.toLocaleString()} <span class="sub-detail">(₹${headPrice.toLocaleString()}/head)</span>`;
        } else {
          priceEl.textContent = `₹${headPrice.toLocaleString()}/head`;
        }
      }
    });



    // Update active tier class
    tiers.forEach(t => t.classList.remove('active'));
    let selectedTier;
    if (groupState.qty <= 4) selectedTier = 'up-to-4';
    else if (groupState.qty === 5) selectedTier = '5-teachers';
    else selectedTier = '6-plus';

    const activeTier = cardGroup.querySelector(`[data-tier="${selectedTier}"]`);
    activeTier.classList.add('active');
    activeTier.querySelector('input').checked = true;
  };

  accPills.forEach(pill => pill.onclick = () => {
    accPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    groupState.acc = pill.getAttribute('data-acc');
    updateGroup();
  });


  cardGroup.querySelector('.qty-btn.plus').onclick = () => {
    let q = parseInt(qtyInput.value);
    if (q < 10) {
      qtyInput.value = q + 1;
      groupState.qty = q + 1;
      updateGroup();
    }
  };
  cardGroup.querySelector('.qty-btn.minus').onclick = () => {
    let q = parseInt(qtyInput.value);
    if (q > 6) { // Min quantity set to 6
      qtyInput.value = q - 1;
      groupState.qty = q - 1;
      updateGroup();
    }
  };


  cityBtns.forEach(btn => btn.onclick = () => {
    cityBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    groupState.city = btn.getAttribute('data-city');
    btn.closest('.city-toggle').setAttribute('data-city', groupState.city);
    updateGroup();
  });
}





// --- 3. Registration Modal & Payment Flow ---
const modal = document.getElementById("registerModal");
const payButtons = document.querySelectorAll(".pay-now");
const closeBtn = document.querySelector(".close");
const registerForm = document.querySelector(".register-form");

payButtons.forEach(button => {
  button.onclick = () => {
    // Find which card it is and set the amount
    const card = button.closest('.p-card');
    if (card.id === 'card-reserve') {
      const qty = parseInt(card.querySelector('.qty-input').value);
      currentOrderData.amount = qty * PRICES.RESERVE;
    } else if (card.id === 'card-individual') {
      const activeDisplay = card.querySelector('.radio-label.active .acc-price-display');
      const rateStr = activeDisplay.textContent.replace(/[₹,]/g, '');
      currentOrderData.amount = parseInt(rateStr);
    } else if (card.id === 'card-group') {
      const qty = parseInt(card.querySelector('.qty-input').value);
      const activeTier = card.querySelector('.p-table-row.active');
      const priceStr = activeTier.querySelector('.tier-price').textContent.split('/')[0].replace(/[₹,]/g, '');
      currentOrderData.amount = qty * parseInt(priceStr);
    }


    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };
});


closeBtn.onclick = () => {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
};

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
    const response = await fetch('/paytm/initiate', {
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

      // 3. Load Paytm JS Checkout Script dynamically 
      // USING STAGING SCRIPT AS REQUIRED BY THE EMAIL
      const scriptPath = `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${data.mid}.js`;

      const script = document.createElement('script');
      script.type = 'application/javascript';
      script.src = scriptPath;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        // 4. Initialize Paytm Checkout JS
        var config = {
          "root": "", // Leave blank for PayTM's default overlay
          "flow": "DEFAULT",
          "data": {
            "orderId": data.orderId,
            "token": data.txnToken,
            "tokenType": "TXN_TOKEN",
            "amount": data.amount
          },
          "handler": {
            "notifyMerchant": function (eventName, data) {
              console.log("notifyMerchant handler function called");
              console.log("eventName => ", eventName);
              console.log("data => ", data);
            }
          }
        };

        if (window.Paytm && window.Paytm.CheckoutJS) {
          window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
            // after successfully updating configuration, invoke JS Checkout
            window.Paytm.CheckoutJS.invoke();
          }).catch(function onError(error) {
            console.log("error => ", error);
            alert("Error initializing payment. Please try again.");
          });
        }
      };

      document.body.appendChild(script);

    } else {
      console.error(data);
      alert("Payment initiation failed. Please try again.");
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
