const fileInput = document.getElementById('file-input');
const feed = document.getElementById('feed');
const viewer = document.getElementById('viewer');
const viewerScroll = document.getElementById('viewer-scroll');
const viewerClose = document.getElementById('viewer-close');
const emptyState = document.getElementById('empty-state');

const DB_NAME = 'FavPhotosDB';
const STORE_NAME = 'photos';
let db = null;

// --- IndexedDB setup ---

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function addPhoto(blob) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = { blob, addedAt: Date.now() };
    const request = store.add(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function deletePhoto(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
}

function getAllPhotos() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// --- Rendering ---

function updateEmptyState(count) {
  emptyState.classList.toggle('hidden', count > 0);
}

function createTile(photo) {
  const div = document.createElement('div');
  div.className = 'photo-tile';
  div.dataset.id = photo.id;

  const img = document.createElement('img');
  img.src = URL.createObjectURL(photo.blob);
  img.alt = 'Favorite photo';
  img.loading = 'lazy';

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.textContent = '\u00d7';
  delBtn.title = 'Remove';
  delBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await deletePhoto(photo.id);
    URL.revokeObjectURL(img.src);
    div.remove();
    updateEmptyState(feed.children.length);
  });

  div.addEventListener('click', () => openViewer(photo.id));

  div.appendChild(img);
  div.appendChild(delBtn);
  return div;
}

async function renderFeed() {
  const photos = await getAllPhotos();
  feed.innerHTML = '';
  photos.reverse().forEach((photo) => {
    feed.appendChild(createTile(photo));
  });
  updateEmptyState(photos.length);
}

// --- Viewer (Instagram-style full-screen scroll) ---

async function openViewer(startId) {
  const photos = await getAllPhotos();
  photos.reverse();

  viewerScroll.innerHTML = '';
  let scrollToEl = null;

  photos.forEach((photo) => {
    const slide = document.createElement('div');
    slide.className = 'viewer-slide';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(photo.blob);
    img.alt = 'Photo';

    slide.appendChild(img);
    viewerScroll.appendChild(slide);

    if (photo.id === startId) {
      scrollToEl = slide;
    }
  });

  viewer.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (scrollToEl) {
    scrollToEl.scrollIntoView({ behavior: 'instant' });
  }
}

function closeViewer() {
  viewer.classList.add('hidden');
  document.body.style.overflow = '';
  // Clean up object URLs
  viewerScroll.querySelectorAll('img').forEach((img) => {
    URL.revokeObjectURL(img.src);
  });
  viewerScroll.innerHTML = '';
}

viewerClose.addEventListener('click', closeViewer);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !viewer.classList.contains('hidden')) {
    closeViewer();
  }
});

// --- Upload ---

fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  for (const file of files) {
    const id = await addPhoto(file);
    const photo = { id, blob: file, addedAt: Date.now() };
    const tile = createTile(photo);
    feed.prepend(tile);
  }

  updateEmptyState(feed.children.length);
  fileInput.value = '';
});

// --- Init ---

(async () => {
  db = await openDB();
  await renderFeed();
})();
