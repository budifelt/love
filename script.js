// ====== ELEMENT REFERENSI KALENDER ======
const monthDisplay = document.getElementById("monthDisplay");
const calendarGrid = document.getElementById("calendarGrid");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Layer animasi
const heartLayer = document.getElementById("heartLayer");
const sparkleLayer = document.getElementById("sparkleLayer");

const monthNames = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

const weekdayNames = [
  "Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"
];

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// ====== HELPER DATE ======
function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ====== RENDER KALENDER ======
function renderCalendar(year, month) {
  calendarGrid.innerHTML = "";
  monthDisplay.textContent = `${monthNames[month]} ${year}`;

  const firstDayOfMonth = new Date(year, month, 1);
  const startingWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // sel kosong sebelum tanggal 1
  for (let i = 0; i < startingWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "day-card empty";
    calendarGrid.appendChild(empty);
  }

  // tanggal 1 s/d akhir bulan
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const w = date.getDay();

    const card = document.createElement("div");
    card.classList.add("day-card");

    // weekend: Minggu (0) dan Sabtu (6)
    if (w === 0 || w === 6) {
      card.classList.add("weekend");
    }

    // monthsary & anniversary (semua 19 dengan efek anniversary)
    let tagHTML = "";
    
if (d === 19) {
  if (month === 9) {
    card.classList.add("anniversary");
    tagHTML = '<div class="day-tag day-tag--anniversary">Anniversary ♥</div>';
  } else {
    card.classList.add("monthsary");
    tagHTML = '<div class="day-tag day-tag--monthsary">Monthsary ♥</div>';
  }
}

if (isSameDate(date, today)) {
  card.classList.add("today");
}


    card.innerHTML = `
      <div class="day-number">${d}</div>
      <div class="day-name">${weekdayNames[w]}</div>
      ${tagHTML}
    `;

    calendarGrid.appendChild(card);
  }
}


// ====== NAVIGASI BULAN ======
prevBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
});

nextBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
});

// ====== ANIMASI ======
function createHeart() {
  if (!heartLayer) return;

  const heart = document.createElement("div");
  heart.classList.add("heart");
  heart.textContent = "♥";

  const size = 14 + Math.random() * 18;
  const left = Math.random() * 100;
  const duration = 7 + Math.random() * 4;

  heart.style.fontSize = `${size}px`;
  heart.style.left = `${left}%`;
  heart.style.bottom = "-10vh";
  heart.style.animationDuration = `${duration}s`;
  heart.style.opacity = (0.5 + Math.random() * 0.5).toString();

  heartLayer.appendChild(heart);

  setTimeout(() => heart.remove(), duration * 1000 + 500);
}

function createSparkle() {
  if (!sparkleLayer) return;

  const s = document.createElement("div");
  s.classList.add("sparkle");

  const size = 3 + Math.random() * 7;
  const left = Math.random() * 100;
  const duration = 4 + Math.random() * 3;

  s.style.width = `${size}px`;
  s.style.height = `${size}px`;
  s.style.left = `${left}%`;
  s.style.bottom = "-15vh";
  s.style.animationDuration = `${duration}s`;

  sparkleLayer.appendChild(s);

  setTimeout(() => s.remove(), duration * 1000 + 500);
}

function startRomanticAnimations() {
  setInterval(() => {
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) setTimeout(createHeart, i * 200);
  }, 1300);

  setInterval(() => {
    const n = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) setTimeout(createSparkle, i * 250);
  }, 1100);
}

// ====== MODAL MOMENT FEED ======
const noteModal = document.getElementById("noteModal");
const modalDateTitle = document.getElementById("modalDateTitle");
const closeModal = document.getElementById("closeModal");

const postsContainer = document.getElementById("postsContainer");
const addMomentBtn = document.getElementById("addMomentBtn");
const createPanel = document.getElementById("createPanel");
const postTitleInput = document.getElementById("postTitle");
const postLovedByInput = document.getElementById("postLovedBy");
const editor = document.getElementById("editor");
const imageInput = document.getElementById("imageInput");
const emojiPicker = document.getElementById("emojiPicker");
const colorPicker = document.getElementById("colorPicker");
const postBtn = document.getElementById("postBtn");
const cancelCreateBtn = document.getElementById("cancelCreate");

// Mini modal elements (title view-only)
const miniModal = document.getElementById("miniModal");
const miniTitleEl = document.getElementById("miniTitle");
const miniMetaEl = document.getElementById("miniMeta");
const miniContentEl = document.getElementById("miniContent");
const miniCloseBtn = document.getElementById("miniClose");
const miniEditBtn = document.getElementById("miniEdit");
const miniDeleteBtn = document.getElementById("miniDelete");
let miniCurrentIndex = null;



// Storage & Sync configuration
const STORAGE_PREFIX = "loveCalendarPosts:"; // legacy prefix (tidak dipakai lagi untuk localStorage)
const GAS_URL = "https://script.google.com/macros/s/AKfycbzXLWAmHqCPch3zKIBcaeok6V547GcsA0y61MW6pTkmw1JXsGqFTpyOJPjjIbvVyExmrA/exec";

const DB_NAME = "LoveCalendarDB";
const DB_VERSION = 1;
const POSTS_STORE = "posts";
const QUEUE_STORE = "syncQueue";

let selectedDateKey = "";
let currentPosts = [];
let editingIndex = null;
let isPlaceholderActive = false;

const PLACEHOLDER_HTML =
  '<span class="placeholder-text"><i>Ceritakan momen…</i></span>';

// ====== INDEXEDDB SETUP ======
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(POSTS_STORE)) {
        const postsStore = db.createObjectStore(POSTS_STORE, { keyPath: "id" });
        postsStore.createIndex("dateKey", "dateKey", { unique: false });
      }

      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const dbPromise = openDatabase();

// Helper: dateKey "YYYY-MM-DD"
function getStorageKey(year, month, day) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

// Load posts for selectedDateKey from IndexedDB
async function loadPosts() {
  const db = await dbPromise;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(POSTS_STORE, "readonly");
    const store = tx.objectStore(POSTS_STORE);
    const index = store.index("dateKey");
    const req = index.getAll(selectedDateKey);

    req.onsuccess = () => {
      currentPosts = req.result || [];
      resolve(currentPosts);
    };
    req.onerror = () => {
      currentPosts = [];
      reject(req.error);
    };
  });
}

// Save currentPosts for selectedDateKey into IndexedDB
async function savePosts() {
  const db = await dbPromise;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(POSTS_STORE, "readwrite");
    const store = tx.objectStore(POSTS_STORE);
    const index = store.index("dateKey");

    // 1) Hapus semua post lama utk dateKey ini
    const getKeysReq = index.getAllKeys(selectedDateKey);
    getKeysReq.onsuccess = () => {
      const keys = getKeysReq.result || [];
      keys.forEach((key) => store.delete(key));

      // 2) Simpan semua post sekarang
      currentPosts.forEach((p) => {
        if (!p.id) {
          p.id = `${selectedDateKey}-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;
        }
        const record = { ...p, dateKey: selectedDateKey };
        store.put(record);
      });
    };
    getKeysReq.onerror = () => reject(getKeysReq.error);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ====== SYNC STATUS UI ======
let syncStatusEl = null;

function initSyncStatus() {
  const modalHeader = document.querySelector("#noteModal .modal-header");
  const closeBtn = document.getElementById("closeModal");
  if (!modalHeader) return;

  // inject CSS
  if (!document.getElementById("syncStatusStyle")) {
    const style = document.createElement("style");
    style.id = "syncStatusStyle";
    style.textContent = `
      .sync-status {
        font-size: 11px;
        color: #b84071;
        opacity: 0.85;
        margin-left: auto;
        margin-right: 8px;
      }
      .sync-status.success { color: #2f855a; }
      .sync-status.error { color: #e53e3e; }
    `;
    document.head.appendChild(style);
  }

  syncStatusEl = document.createElement("div");
  syncStatusEl.id = "syncStatus";
  syncStatusEl.className = "sync-status";
  syncStatusEl.textContent = "Ready";

  if (closeBtn) {
    modalHeader.insertBefore(syncStatusEl, closeBtn);
  } else {
    modalHeader.appendChild(syncStatusEl);
  }
}

function setSyncStatus(text, type = "") {
  if (!syncStatusEl) return;
  syncStatusEl.textContent = text;
  syncStatusEl.className = "sync-status";
  if (type) syncStatusEl.classList.add(type);
}

// ====== QUEUE & SYNC TO GAS ======
async function queueSync(post) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    store.put({ id: post.id, payload: post });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllQueued() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const store = tx.objectStore(QUEUE_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteQueued(id) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// low-level sender (tidak queue ulang)
async function sendToGAS(post) {
  if (!GAS_URL) return { status: "skip" };

  const res = await fetch( GAS_URL, { mode: "no-cors", 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post)
  });

  const data = await res.json().catch(() => null) || {};
  return data;
}

// dipanggil saat user Post / Repost
async function syncPostToGAS(post) {
  if (!syncStatusEl) initSyncStatus();

  try {
    setSyncStatus("Syncing…");
    const data = await sendToGAS(post);

    if (data.status === "ok" || data.result === "success") {
      setSyncStatus("Synced ✓", "success");
      return { status: "ok" };
    } else {
      // treat as failure
      await queueSync(post);
      setSyncStatus("Offline — queued 🔄", "error");
      return { status: "queued" };
    }
  } catch (err) {
    await queueSync(post);
    setSyncStatus("Offline — queued 🔄", "error");
    return { status: "queued", error: err };
  }
}

// proses seluruh queue ketika online / saat load
async function processSyncQueue() {
  if (!navigator.onLine) return;
  if (!syncStatusEl) initSyncStatus();

  const queued = await getAllQueued();
  if (!queued.length) return;

  setSyncStatus("Syncing queued…");

  for (const item of queued) {
    try {
      const res = await sendToGAS(item.payload);
      if (res.status === "ok" || res.result === "success") {
        await deleteQueued(item.id);
      }
    } catch (err) {
      // kalau masih gagal, biarkan di queue
    }
  }

  setSyncStatus("Synced ✓", "success");
}

// trigger saat online
window.addEventListener("online", () => {
  processSyncQueue();
});

// panggil juga sekali di awal
processSyncQueue();
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPostTime(iso) {
  const d = new Date(iso);
  if (!d) return "";
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const mon = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${day} ${mon[month]} ${year}, ${hh}:${mm}`;
}


// ===============================
//       MINI MODAL HANDLERS
// ===============================
function openMiniModal(index) {
  const post = currentPosts[index];
  if (!post || !miniModal) return;

  miniCurrentIndex = index;
  miniTitleEl.textContent = post.title || "";

  let meta = formatPostTime(post.createdAt);
  if (post.lovedBy) meta += " · Loved by " + escapeHtml(post.lovedBy);
  if (post.pinned) meta += " · 📌";
  miniMetaEl.innerHTML = meta;

  miniContentEl.innerHTML = post.content || "";
  miniModal.classList.remove("hidden");
}

function closeMiniModal() {
  if (!miniModal) return;
  miniModal.classList.add("hidden");
  miniCurrentIndex = null;
}

if (miniCloseBtn) {
  miniCloseBtn.addEventListener("click", closeMiniModal);
}

if (miniEditBtn) {
  miniEditBtn.addEventListener("click", () => {
    if (miniCurrentIndex === null) return;
    const post = currentPosts[miniCurrentIndex];
    if (!post) return;

    closeMiniModal();

    editingIndex = miniCurrentIndex;
    postTitleInput.value = post.title || "";
    postLovedByInput.value = post.lovedBy || "";
    editor.innerHTML = post.content || "";
    isPlaceholderActive = false;
    editor.classList.remove("empty");

    enterCreateMode(true);
  });
}

if (miniDeleteBtn) {
  miniDeleteBtn.addEventListener("click", async () => {
    if (miniCurrentIndex === null) return;
    if (!confirm("Hapus momen ini?")) return;

    currentPosts.splice(miniCurrentIndex, 1);
    await savePosts();
    closeMiniModal();

    if (!currentPosts.length) {
      enterCreateMode(false);
    } else {
      renderPostsList();
    }
  });
}

// ===============================
//        RENDER POST LIST
// ===============================
function renderPostsList() {
  postsContainer.innerHTML = "";

  if (!currentPosts.length) {
    postsContainer.innerHTML =
      '<p class="no-posts">Belum ada momen. Yuk tulis yang pertama 💕</p>';
    return;
  }

  // Sort pinned dulu, lalu berdasarkan createdAt desc
  const sorted = [
    ...currentPosts
      .map((p, i) => ({ ...p, _i: i }))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
  ];

  sorted.forEach((post) => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.dataset.index = post._i;

    const lovedBy = post.lovedBy ? `Loved by ${escapeHtml(post.lovedBy)}` : "";

    card.innerHTML = `
      <div class="post-header">
        <div>
          <div class="post-title">${escapeHtml(post.title)}</div>
          <div class="post-meta">
            ${formatPostTime(post.createdAt)}
            ${lovedBy ? " · " + lovedBy : ""}
            ${post.pinned ? " · 📌" : ""}
          </div>
        </div>
        <div class="post-actions">
          <button class="post-pin">${post.pinned ? "💖" : "📌"}</button><span class="post-sync-indicator" data-id="${post.id || ""}">•</span>
          <button class="post-edit">Edit</button>
          <button class="post-delete">Hapus</button>
        </div>
      </div>

      <div class="post-content-wrapper">
        <div class="post-content">${post.content}</div>
        <button class="toggle-post hidden">Show More…</button>
      </div>
    `;

    postsContainer.appendChild(card);

    const contentEl = card.querySelector(".post-content");
    const toggleBtn = card.querySelector(".toggle-post");

    // Delay supaya DOM sempat render → scrollHeight akurat
    setTimeout(() => {
      if (contentEl.scrollHeight > 150) {
        contentEl.classList.add("collapsed");
        toggleBtn.classList.remove("hidden");
        toggleBtn.textContent = "Show More…";
      } else {
        toggleBtn.classList.add("hidden");
      }
    }, 0);
  });
}

// ===============================
//   SWITCH MODE (FEED / CREATE)
// ===============================
function enterFeedMode() {
  editingIndex = null;
  postsContainer.classList.remove("hidden");
  createPanel.classList.add("hidden");
  addMomentBtn.classList.remove("hidden");
  emojiPicker.classList.add("hidden");
  renderPostsList();
}

function enterCreateMode(isEdit) {
  createPanel.classList.remove("hidden");
  postsContainer.classList.add("hidden");
  addMomentBtn.classList.add("hidden");
  emojiPicker.classList.add("hidden");

  if (isEdit) {
    postBtn.textContent = "Re-Post";
  } else {
    postBtn.textContent = "Post";
    postTitleInput.value = "";
    postLovedByInput.value = "";
    setPlaceholder();
  }
}

function setPlaceholder() {
  editor.innerHTML = PLACEHOLDER_HTML;
  editor.classList.add("empty");
  isPlaceholderActive = true;
}

function clearPlaceholderIfNeeded() {
  if (isPlaceholderActive) {
    editor.innerHTML = "";
    editor.classList.remove("empty");
    isPlaceholderActive = false;
  }
}

editor.addEventListener("blur", () => {
  if (editor.textContent.trim() === "") {
    setPlaceholder();
  }
});

editor.addEventListener("focus", clearPlaceholderIfNeeded);
editor.addEventListener("keydown", clearPlaceholderIfNeeded);

// ===============================
//         OPEN MODAL
// ===============================
calendarGrid.addEventListener("click", async (e) => {
  const card = e.target.closest(".day-card");
  if (!card || card.classList.contains("empty")) return;

  const day = Number(card.querySelector(".day-number").textContent);
  const month = currentMonth + 1;
  const year = currentYear;

  selectedDateKey = getStorageKey(year, month, day);
  modalDateTitle.textContent = `Momen ${day}/${month}/${year}`;

  await loadPosts();

  if (!currentPosts.length) {
    postsContainer.classList.add("hidden");
    addMomentBtn.classList.add("hidden");
    createPanel.classList.remove("hidden");
    postBtn.textContent = "Post";
    postTitleInput.value = "";
    postLovedByInput.value = "";
    setPlaceholder();
  } else {
    enterFeedMode();
  }

  noteModal.classList.remove("hidden");
});

// ===============================
//         CLOSE MODAL
// ===============================
closeModal.addEventListener("click", () => {
  noteModal.classList.add("hidden");
});

// ===============================
//    FEED BUTTON ACTIONS
// ===============================
postsContainer.addEventListener("click", async (e) => {
  const del = e.target.closest(".post-delete");
  const edt = e.target.closest(".post-edit");
  const tog = e.target.closest(".toggle-post");
  const pin = e.target.closest(".post-pin");
  const titleEl = e.target.closest(".post-title");

  // Title click -> open mini modal
  if (titleEl) {
    const card = titleEl.closest(".post-card");
    const idx = Number(card.dataset.index);
    openMiniModal(idx);
    return;
  }

  // Delete
  if (del) {
    const card = del.closest(".post-card");
    const idx = Number(card.dataset.index);
    if (!confirm("Hapus momen ini?")) return;
    currentPosts.splice(idx, 1);
    await savePosts();

    if (!currentPosts.length) {
      enterCreateMode(false);
    } else {
      renderPostsList();
    }
    return;
  }

  // Edit
  if (edt) {
    const card = edt.closest(".post-card");
    const idx = Number(card.dataset.index);
    const post = currentPosts[idx];

    editingIndex = idx;

    postTitleInput.value = post.title;
    postLovedByInput.value = post.lovedBy || "";
    editor.innerHTML = post.content;
    isPlaceholderActive = false;
    editor.classList.remove("empty");

    enterCreateMode(true);
    return;
  }

  // Toggle Show More / Less
  if (tog) {
    const card = tog.closest(".post-card");
    const contentEl = card.querySelector(".post-content");

    if (contentEl.classList.contains("collapsed")) {
      contentEl.classList.remove("collapsed");
      tog.textContent = "Show Less";
    } else {
      contentEl.classList.add("collapsed");
      tog.textContent = "Show More…";
    }
    return;
  }

  // PIN / UNPIN
  if (pin) {
    const card = pin.closest(".post-card");
    const idx = Number(card.dataset.index);
    currentPosts[idx].pinned = !currentPosts[idx].pinned;
    await savePosts();
    renderPostsList();
    return;
  }
});

// ===============================
//         ADD MOMENT BTN
// ===============================
addMomentBtn.addEventListener("click", () => {
  editingIndex = null;
  postBtn.textContent = "Post";
  postTitleInput.value = "";
  postLovedByInput.value = "";
  setPlaceholder();
  enterCreateMode(false);
});

// ===============================
//         CANCEL
// ===============================
cancelCreateBtn.addEventListener("click", () => {
  if (currentPosts.length) enterFeedMode();
  else noteModal.classList.add("hidden");
});

// ===============================
//         EDITOR TOOLS
// ===============================
function formatText(cmd) {
  clearPlaceholderIfNeeded();
  document.execCommand(cmd, false, null);
  editor.focus();
}


function applyFontSize() {
  clearPlaceholderIfNeeded();
  const select = document.getElementById("fontSizeSelect");
  if (!select) return;
  let val = select.value;
  if (val === "custom") {
    const custom = prompt("Font size? contoh: 18px atau 1.2em", "16px");
    if (!custom) return;
    val = custom;
  }
  document.execCommand("fontSize", false, "7");
  const spans = editor.querySelectorAll("font[size='7']");
  spans.forEach((s) => {
    s.removeAttribute("size");
    s.style.fontSize = val;
  });
  editor.focus();
}

function applyFontFamily() {
  clearPlaceholderIfNeeded();
  const select = document.getElementById("fontFamilySelect");
  if (!select) return;
  const family = select.value;
  if (!family) return;
  if (family === "inherit") {
    document.execCommand("removeFormat", false, null);
  } else {
    document.execCommand("fontName", false, family);
  }
  editor.focus();
}

colorPicker.addEventListener("input", (e) => {
  clearPlaceholderIfNeeded();
  document.execCommand("foreColor", false, e.target.value);
  editor.focus();
});

function toggleEmojiPicker() {
  emojiPicker.classList.toggle("hidden");
}

function insertEmoji(e) {
  clearPlaceholderIfNeeded();
  try {
    document.execCommand("insertText", false, e);
  } catch {
    editor.innerHTML += e;
  }
  editor.focus();
}

function insertImage() {
  imageInput.value = "";
  imageInput.click();
}

function changeFontSize() {
  clearPlaceholderIfNeeded();
  const size = prompt("Font size? contoh: 18px atau 1.2em","");
  if (!size) return;
  document.execCommand("fontSize", false, "7"); // temporary hack
  const spans = editor.querySelectorAll("font[size='7']");
  spans.forEach(s => {
      s.removeAttribute("size");
      s.style.fontSize = size;
  });
  editor.focus();
}


imageInput.addEventListener("change", () => {
  const files = Array.from(imageInput.files || []);
  if (!files.length) return;

  clearPlaceholderIfNeeded();

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      editor.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  editor.focus();
});

function clearEditor() {
  if (!confirm("Bersihkan semua isi editor?")) return;
  editor.innerHTML = "";
  setPlaceholder();
}

// ===============================
//          POST / RE-POST
// ===============================
postBtn.addEventListener("click", async () => {
  const title = postTitleInput.value.trim();
  const lovedBy = postLovedByInput.value.trim();
  const html = editor.innerHTML.trim();

  if (!lovedBy) {
  alert("Loved by wajib diisi ya 💗");
  postLovedByInput.focus();
  return;
}

  if (!title) {
    alert("Title momen wajib ya 💗");
    postTitleInput.focus();
    return;
  }

  if (!html || isPlaceholderActive || editor.textContent.trim() === "") {
    alert("Isi momennya juga ya 🥹");
    editor.focus();
    return;
  }

  const now = new Date().toISOString();

  if (editingIndex !== null) {
    const p = currentPosts[editingIndex];
    p.title = title;
    p.content = editor.innerHTML;
    p.lovedBy = lovedBy;
    p.updatedAt = now;
  } else {
    currentPosts.push({
      title,
      content: editor.innerHTML,
      lovedBy,
      createdAt: now,
      pinned: false
    });
  }

  await savePosts();

  // Auto sync post ke GAS
  const lastPost = currentPosts[currentPosts.length - 1];
  if (lastPost) {
    await syncPostToGAS(lastPost);
  }
  editingIndex = null;

  enterFeedMode();
});

// ===============================
//            INIT
// ===============================
renderCalendar(currentYear, currentMonth);
startRomanticAnimations();

// Pin hover
postsContainer.addEventListener("mouseover", (e)=>{
  const pin = e.target.closest(".post-pin");
  if(!pin) return;
  const card = pin.closest(".post-card");
  if(!card) return;
  const idx = Number(card.dataset.index);
  const post = currentPosts[idx];
  pin.dataset.originalIcon = post.pinned ? "💖" : "📌";
  pin.textContent = "💞";
});
postsContainer.addEventListener("mouseout", (e)=>{
  const pin = e.target.closest(".post-pin");
  if(!pin) return;
  const card = pin.closest(".post-card");
  const idx = Number(card.dataset.index);
  const post = currentPosts[idx];
  const orig = pin.dataset.originalIcon || (post.pinned?"💖":"📌");
  pin.textContent = orig;
});
