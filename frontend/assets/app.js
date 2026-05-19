const API = "/api";
const state = {
  user: JSON.parse(localStorage.getItem("sahil_user") || "null"),
  filters: { category: "", city: "", q: "" },
};

const app = document.getElementById("app");
const modalRoot = document.getElementById("modal-root");
const toastRoot = document.getElementById("toast-root");
const authBtn = document.getElementById("auth-btn");

const ICONS = {
  scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
  razor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="6" rx="1"/><path d="M7 9v3M12 9v3M17 9v3"/><rect x="9" y="14" width="6" height="8" rx="1"/></svg>',
  lotus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4c-2 3-2 6 0 9 2-3 2-6 0-9z"/><path d="M5 12c1-3 3-4 5-3-1 2-2 4-5 3z"/><path d="M19 12c-1-3-3-4-5-3 1 2 2 4 5 3z"/><path d="M4 18c2-2 6-3 8-2 2-1 6 0 8 2-4 2-12 2-16 0z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 16l.7 2L22 19l-2.3 1L19 22l-.7-2L16 19l2.3-1z"/></svg>',
  stethoscope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v6a4 4 0 008 0V2"/><path d="M8 12v4a4 4 0 008 0v-2"/><circle cx="16" cy="10" r="2"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h2M6 8v8M10 6v12M14 6v12M18 8v8M22 12h-2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16a2 2 0 002 2h14V6a2 2 0 00-2-2H4z"/><path d="M4 4a2 2 0 012-2h12"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17l1.5-6h11L19 17M5 17H3M19 17h2"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
};

/* -------- utilities -------- */
const $ = (sel, root = document) => root.querySelector(sel);
const fmtPKR = (n) => "Rs " + n.toLocaleString("en-PK");
const fmtMins = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim() : `${m} min`);
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" });

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    method: opts.method || (opts.body ? "POST" : "GET"),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

function toast(message, type = "") {
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = message;
  toastRoot.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.3s"; }, 2200);
  setTimeout(() => el.remove(), 2600);
}

function setUser(user) {
  state.user = user;
  if (user) localStorage.setItem("sahil_user", JSON.stringify(user));
  else localStorage.removeItem("sahil_user");
  renderAuthBtn();
}

function renderAuthBtn() {
  if (state.user) {
    authBtn.textContent = state.user.full_name.split(" ")[0];
    authBtn.title = "Click to sign out";
  } else {
    authBtn.textContent = "Sign in";
    authBtn.title = "";
  }
}

authBtn.addEventListener("click", () => {
  if (state.user) {
    if (confirm("Sign out?")) setUser(null);
  } else {
    openAuthModal();
  }
});

/* -------- modal -------- */
function openModal(html, onMount) {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal">${html}</div></div>`;
  const backdrop = $(".modal-backdrop", modalRoot);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  if (onMount) onMount($(".modal", modalRoot));
}
function closeModal() { modalRoot.innerHTML = ""; }

function openAuthModal(then) {
  openModal(
    `
    <h2>Sign in to Sahil</h2>
    <p class="small">Quick sign in — we'll save your bookings to your email.</p>
    <form id="auth-form" style="margin-top:18px">
      <div class="field"><label>Full name</label><input name="full_name" required placeholder="e.g. Ahmed Khan"/></div>
      <div class="field"><label>Email</label><input name="email" type="email" required placeholder="you@example.com"/></div>
      <div class="field"><label>Phone <span class="small">(optional)</span></label><input name="phone" placeholder="+92 300 1234567"/></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" id="auth-cancel">Cancel</button>
        <button type="submit" class="btn btn-primary">Continue</button>
      </div>
    </form>
    `,
    (modal) => {
      $("#auth-cancel", modal).addEventListener("click", closeModal);
      $("#auth-form", modal).addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const body = Object.fromEntries(fd);
        try {
          const user = await api("/auth", { body });
          setUser(user);
          closeModal();
          toast("Welcome, " + user.full_name.split(" ")[0] + "!", "success");
          if (then) then(user);
        } catch (err) {
          toast(err.message, "error");
        }
      });
    }
  );
}

/* -------- router -------- */
function route() {
  const hash = location.hash.replace(/^#/, "") || "/";
  document.querySelectorAll(".topnav a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-route") === hash || (hash.startsWith("/biz/") && a.getAttribute("data-route") === "/"));
  });
  if (hash === "/") return renderDiscover();
  if (hash === "/bookings") return renderBookings();
  if (hash.startsWith("/biz/")) return renderBusiness(hash.split("/")[2]);
  app.innerHTML = `<section class="section container"><h2>Page not found</h2></section>`;
}
window.addEventListener("hashchange", route);

/* -------- pages -------- */
function loadingCards(n = 6) {
  return `<div class="grid-cards">${Array.from({ length: n }, () => `<div class="skeleton skeleton-card"></div>`).join("")}</div>`;
}

async function renderDiscover() {
  app.innerHTML = `
    <section class="hero">
      <div class="container hero-inner">
        <div>
          <div class="hero-eyebrow"><span class="dot"></span>Made for Pakistan</div>
          <h1>Book the <span class="accent">best</span> of Pakistan,<br/>without a single phone call.</h1>
          <p class="lede">Discover and instantly book salons, barbers, spas, clinics, gyms and tutors across Karachi, Lahore and Islamabad.</p>
          <form class="search-card" id="search-form">
            <div class="search-field">
              <div>
                <label>What</label>
                <input name="q" placeholder="Salon, gym, tutor…" value="${state.filters.q}"/>
              </div>
            </div>
            <div class="search-field">
              <div style="flex:1">
                <label>Where</label>
                <select name="city" id="city-select"><option value="">Any city</option></select>
              </div>
            </div>
            <button class="btn btn-primary" type="submit">Search</button>
          </form>
          <div class="hero-stats">
            <div class="stat"><strong>12+</strong><span>Curated businesses</span></div>
            <div class="stat"><strong>3</strong><span>Major cities</span></div>
            <div class="stat"><strong>24/7</strong><span>Booking, instantly</span></div>
          </div>
        </div>
        <div class="hero-collage">
          <img class="tall" src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80" alt=""/>
          <img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80" alt=""/>
          <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80" alt=""/>
        </div>
      </div>
    </section>

    <section class="section container">
      <div class="section-head">
        <h2>Browse by category</h2>
      </div>
      <div class="cats" id="cats-row"></div>
    </section>

    <section class="section container">
      <div class="section-head">
        <h2 id="results-title">Featured businesses</h2>
        <span class="small" id="results-count"></span>
      </div>
      <div id="results">${loadingCards()}</div>
    </section>
  `;

  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.filters.q = fd.get("q") || "";
    state.filters.city = fd.get("city") || "";
    loadResults();
  });

  const [cats, cities] = await Promise.all([api("/categories"), api("/cities")]);
  const citySel = $("#city-select");
  cities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    if (state.filters.city === c) opt.selected = true;
    citySel.appendChild(opt);
  });

  $("#cats-row").innerHTML =
    `<button class="cat-chip ${!state.filters.category ? "active" : ""}" data-cat="">All</button>` +
    cats.map((c) =>
      `<button class="cat-chip ${state.filters.category === c.slug ? "active" : ""}" data-cat="${c.slug}">
        ${ICONS[c.icon] || ICONS.sparkle}<span>${c.name}</span>
      </button>`
    ).join("");

  $("#cats-row").addEventListener("click", (e) => {
    const chip = e.target.closest(".cat-chip");
    if (!chip) return;
    state.filters.category = chip.dataset.cat || "";
    document.querySelectorAll(".cat-chip").forEach((c) => c.classList.toggle("active", c === chip));
    loadResults();
  });

  loadResults();
}

async function loadResults() {
  const params = new URLSearchParams();
  if (state.filters.category) params.set("category", state.filters.category);
  if (state.filters.city) params.set("city", state.filters.city);
  if (state.filters.q) params.set("q", state.filters.q);
  const list = await api("/businesses?" + params.toString());
  $("#results-count").textContent = `${list.length} ${list.length === 1 ? "result" : "results"}`;
  if (state.filters.category || state.filters.city || state.filters.q) {
    $("#results-title").textContent = "Results";
  }
  if (!list.length) {
    $("#results").innerHTML = `
      <div class="empty">
        <h3>No matches</h3>
        <p>Try a different category or city.</p>
      </div>`;
    return;
  }
  $("#results").innerHTML = `<div class="grid-cards">${list.map(bizCard).join("")}</div>`;
}

function bizCard(b) {
  return `
    <a class="biz-card" href="#/biz/${b.slug}">
      <div class="biz-cover">
        <img src="${b.cover_image}" alt="${b.name}" loading="lazy"/>
        <span class="biz-rating">${ICONS.star} ${b.rating.toFixed(1)}</span>
      </div>
      <div class="biz-body">
        <span class="biz-cat">${b.category_slug}</span>
        <h3 class="biz-name">${b.name}</h3>
        <p class="biz-meta">${ICONS.pin} ${b.city} · ${b.tagline}</p>
      </div>
    </a>
  `;
}

/* -------- business detail -------- */
const detailState = { service: null, staff: null, date: today(), time: null };

async function renderBusiness(slug) {
  app.innerHTML = `<section class="container section"><div class="skeleton" style="height:380px;"></div></section>`;
  let data;
  try {
    data = await api("/businesses/" + slug);
  } catch {
    app.innerHTML = `<section class="container section"><h2>Business not found</h2></section>`;
    return;
  }
  const { business: b, services, staff, reviews } = data;
  Object.assign(detailState, { service: services[0]?.id || null, staff: null, date: today(), time: null });

  app.innerHTML = `
    <section class="container">
      <div class="detail-cover">
        <img src="${b.cover_image}" alt="${b.name}"/>
        <div class="detail-cover-text">
          <div>
            <span class="biz-cat" style="color:rgba(255,255,255,0.9)">${b.category_slug}</span>
            <h1>${b.name}</h1>
            <p>${b.tagline}</p>
          </div>
          <span class="biz-rating">${ICONS.star} ${b.rating.toFixed(1)} <span style="color:var(--muted);font-weight:500;margin-left:4px;">· ${b.review_count} reviews</span></span>
        </div>
      </div>

      <div class="detail-grid">
        <div>
          <div class="card">
            <h3>About</h3>
            <p style="margin-bottom:14px">${b.description}</p>
            <div class="kv">${ICONS.pin} <span>${b.address}, ${b.city}</span></div>
            <div class="kv">${ICONS.phone} <span>${b.phone}</span></div>
            <div class="kv">${ICONS.clock} <span>${b.open_time} – ${b.close_time} daily</span></div>
          </div>

          <div class="card">
            <h3>Services</h3>
            ${services.map((s) => `
              <div class="service-row">
                <div>
                  <strong>${s.name}</strong>
                  <div class="meta">${s.description} · ${fmtMins(s.duration_minutes)}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span class="price">${s.price_pkr === 0 ? "Free" : fmtPKR(s.price_pkr)}</span>
                  <button class="btn btn-outline" data-service="${s.id}">Book</button>
                </div>
              </div>`).join("")}
          </div>

          ${staff.length ? `
          <div class="card">
            <h3>Our team</h3>
            ${staff.map((m) => `
              <div class="staff-row">
                <img src="${m.avatar}" alt="${m.name}"/>
                <div><strong>${m.name}</strong><div class="small">${m.role}</div></div>
              </div>`).join("")}
          </div>` : ""}

          <div class="card">
            <h3>Reviews</h3>
            ${reviews.length ? reviews.map((r) => `
              <div class="review-row">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <strong>${r.author_name}</strong>
                  <span class="stars">${"★".repeat(r.rating)}<span style="color:var(--line)">${"★".repeat(5 - r.rating)}</span></span>
                </div>
                <p>${r.comment}</p>
              </div>`).join("") : `<p class="small">No reviews yet — be the first.</p>`}
            <button class="btn btn-link" id="add-review" style="margin-top:8px">Write a review →</button>
          </div>
        </div>

        <aside>
          <div class="card" style="position:sticky;top:88px">
            <h3>Book a visit</h3>
            <div class="field">
              <label>Service</label>
              <select id="svc-select">
                ${services.map((s) => `<option value="${s.id}">${s.name} — ${s.price_pkr === 0 ? "Free" : fmtPKR(s.price_pkr)}</option>`).join("")}
              </select>
            </div>
            ${staff.length ? `
            <div class="field">
              <label>Staff <span class="small">(optional)</span></label>
              <select id="staff-select">
                <option value="">Any available</option>
                ${staff.map((m) => `<option value="${m.id}">${m.name} — ${m.role}</option>`).join("")}
              </select>
            </div>` : ""}
            <div class="field">
              <label>Date</label>
              <input type="date" id="date-input" min="${today()}" max="${addDays(60)}" value="${detailState.date}"/>
            </div>
            <div>
              <label class="small" style="font-weight:600;color:var(--ink-2)">Available times</label>
              <div class="slot-grid" id="slot-grid">${Array.from({length: 8}, () => `<div class="skeleton" style="height:38px"></div>`).join("")}</div>
            </div>
            <button class="btn btn-secondary" id="confirm-book" style="margin-top:18px;width:100%;justify-content:center" disabled>Confirm booking</button>
            <p class="small" style="margin-top:8px;text-align:center">Instant confirmation · No prepayment required</p>
          </div>
        </aside>
      </div>
    </section>
  `;

  const svcSel = $("#svc-select");
  const staffSel = $("#staff-select");
  const dateIn = $("#date-input");
  const confirmBtn = $("#confirm-book");

  svcSel.addEventListener("change", () => { detailState.service = +svcSel.value; updateConfirm(); });
  if (staffSel) staffSel.addEventListener("change", () => { detailState.staff = staffSel.value ? +staffSel.value : null; });
  dateIn.addEventListener("change", () => { detailState.date = dateIn.value; detailState.time = null; loadSlots(slug); updateConfirm(); });

  document.querySelectorAll("[data-service]").forEach((btn) =>
    btn.addEventListener("click", () => {
      svcSel.value = btn.dataset.service;
      detailState.service = +btn.dataset.service;
      document.querySelector("aside .card").scrollIntoView({ behavior: "smooth", block: "center" });
      updateConfirm();
    })
  );

  $("#add-review").addEventListener("click", () => openReviewModal(b.slug));
  confirmBtn.addEventListener("click", () => confirmBooking(b, services.find((s) => s.id === detailState.service)));

  loadSlots(slug);
}

async function loadSlots(slug) {
  const grid = $("#slot-grid");
  if (!grid) return;
  grid.innerHTML = Array.from({length: 8}, () => `<div class="skeleton" style="height:38px"></div>`).join("");
  const data = await api(`/businesses/${slug}/availability?booking_date=${detailState.date}`);
  grid.innerHTML = data.slots.map((s) =>
    `<button class="slot ${detailState.time === s.time ? "selected" : ""}" data-time="${s.time}" ${!s.available ? "disabled" : ""}>${s.time}</button>`
  ).join("");
  grid.addEventListener("click", (e) => {
    const slot = e.target.closest(".slot");
    if (!slot || slot.disabled) return;
    detailState.time = slot.dataset.time;
    document.querySelectorAll(".slot").forEach((s) => s.classList.toggle("selected", s === slot));
    updateConfirm();
  });
}

function updateConfirm() {
  const btn = $("#confirm-book");
  if (btn) btn.disabled = !(detailState.service && detailState.date && detailState.time);
}

async function confirmBooking(b, service) {
  if (!state.user) return openAuthModal(() => confirmBooking(b, service));
  try {
    const res = await api("/bookings", {
      body: {
        user_id: state.user.id,
        business_slug: b.slug,
        service_id: detailState.service,
        staff_id: detailState.staff,
        booking_date: detailState.date,
        booking_time: detailState.time,
      },
    });
    openModal(
      `
      <h2>You're booked! ✓</h2>
      <p>We've reserved your slot at <strong>${b.name}</strong>.</p>
      <div class="card" style="background:var(--primary-soft);border:none;margin-top:18px;padding:18px">
        <div class="kv">${ICONS.calendar} <span><strong>${fmtDate(res.booking.booking_date)}</strong> at <strong>${res.booking.booking_time}</strong></span></div>
        <div class="kv">${ICONS.pin} <span>${res.business.address}</span></div>
        <div class="kv">${ICONS.phone} <span>${res.business.phone}</span></div>
        <div class="kv" style="margin-top:8px"><strong>${service.name}</strong> — ${service.price_pkr === 0 ? "Free" : fmtPKR(service.price_pkr)}</div>
      </div>
      <div class="modal-actions">
        <a href="#/bookings" class="btn btn-ghost" id="view-bookings">View my bookings</a>
        <button class="btn btn-primary" id="ok-btn">Done</button>
      </div>
      `,
      (modal) => {
        $("#ok-btn", modal).addEventListener("click", closeModal);
        $("#view-bookings", modal).addEventListener("click", closeModal);
      }
    );
  } catch (err) {
    toast(err.message, "error");
  }
}

function openReviewModal(slug) {
  if (!state.user) return openAuthModal(() => openReviewModal(slug));
  openModal(
    `
    <h2>Write a review</h2>
    <form id="review-form" style="margin-top:12px">
      <div class="field">
        <label>Rating</label>
        <select name="rating" required>
          <option value="5">★★★★★ — Excellent</option>
          <option value="4">★★★★☆ — Very good</option>
          <option value="3">★★★☆☆ — Good</option>
          <option value="2">★★☆☆☆ — Okay</option>
          <option value="1">★☆☆☆☆ — Poor</option>
        </select>
      </div>
      <div class="field">
        <label>Your review</label>
        <textarea name="comment" rows="4" required placeholder="Share your experience…"></textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" id="rev-cancel">Cancel</button>
        <button type="submit" class="btn btn-primary">Post review</button>
      </div>
    </form>
    `,
    (modal) => {
      $("#rev-cancel", modal).addEventListener("click", closeModal);
      $("#review-form", modal).addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await api("/reviews", {
            body: { user_id: state.user.id, business_slug: slug, rating: +fd.get("rating"), comment: fd.get("comment") },
          });
          closeModal();
          toast("Thanks for the review!", "success");
          renderBusiness(slug);
        } catch (err) {
          toast(err.message, "error");
        }
      });
    }
  );
}

/* -------- bookings page -------- */
async function renderBookings() {
  if (!state.user) {
    app.innerHTML = `
      <section class="container section">
        <div class="empty">
          <h3>Sign in to view your bookings</h3>
          <p>Your bookings are linked to your email.</p>
          <button class="btn btn-primary" style="margin-top:14px" id="sign-in-cta">Sign in</button>
        </div>
      </section>`;
    $("#sign-in-cta").addEventListener("click", () => openAuthModal(renderBookings));
    return;
  }
  app.innerHTML = `<section class="container section"><h2>My bookings</h2><div id="my-bookings" style="margin-top:20px">${loadingCards(3)}</div></section>`;
  const items = await api("/bookings?user_id=" + state.user.id);
  if (!items.length) {
    $("#my-bookings").innerHTML = `
      <div class="empty">
        <h3>No bookings yet</h3>
        <p>Discover and book your next appointment.</p>
        <a class="btn btn-primary" href="#/" style="margin-top:14px">Browse businesses</a>
      </div>`;
    return;
  }
  $("#my-bookings").innerHTML = items.map((it) => `
    <div class="booking-card">
      <div>
        <span class="status-chip status-${it.booking.status}">${it.booking.status}</span>
        <div class="when" style="margin-top:6px">${fmtDate(it.booking.booking_date)} · ${it.booking.booking_time}</div>
        <p style="margin-top:4px"><strong>${it.service.name}</strong> at <a href="#/biz/${it.business.slug}" style="color:var(--primary);font-weight:600">${it.business.name}</a></p>
        <p class="small">${it.business.address} · ${fmtPKR(it.service.price_pkr)} · ${fmtMins(it.service.duration_minutes)}</p>
      </div>
      <div>
        ${it.booking.status === "confirmed"
          ? `<button class="btn btn-ghost" data-cancel="${it.booking.id}">Cancel</button>`
          : ""}
      </div>
    </div>
  `).join("");
  document.querySelectorAll("[data-cancel]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Cancel this booking?")) return;
      try {
        await api(`/bookings/${btn.dataset.cancel}/cancel?user_id=${state.user.id}`, { method: "POST" });
        toast("Booking cancelled", "success");
        renderBookings();
      } catch (err) { toast(err.message, "error"); }
    })
  );
}

/* -------- boot -------- */
renderAuthBtn();
route();
