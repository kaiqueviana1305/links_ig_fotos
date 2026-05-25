const STORAGE_KEY = 'link-studio-v2';
const OLD_STORAGE_KEY = 'link-foto-builder-v1';

const fallbackImages = {
  avatar:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"%3E%3Crect width="240" height="240" fill="%230f766e"/%3E%3Ccircle cx="120" cy="96" r="43" fill="%23ccfbf1"/%3E%3Cpath d="M48 214c10-45 38-68 72-68s62 23 72 68" fill="%23ccfbf1"/%3E%3C/svg%3E',
  card:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"%3E%3Crect width="900" height="560" fill="%23101828"/%3E%3Cpath d="M0 392 210 228l158 116 126-88 406 304H0z" fill="%230f766e"/%3E%3Ccircle cx="690" cy="126" r="72" fill="%23facc15"/%3E%3C/svg%3E'
};

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const defaultProfile = (name = 'Meu perfil') => ({
  id: createId(),
  name,
  bio: 'Escreva uma frase curta sobre voce ou sua marca.',
  footerText: '© 2026 Laboratório Labollife',
  avatar: fallbackImages.avatar,
  profileShadow: true,
  fontFamily: 'Inter',
  backgroundType: 'solid',
  backgroundColor: '#090b10',
  gradientColor: '#182032',
  textColor: '#ffffff',
  nameColor: '#ffffff',
  bioColor: '#d8dde8',
  footerColor: '#aab4c6',
  blocks: [
    {
      id: createId(),
      title: 'Fale comigo no WhatsApp',
      url: 'https://wa.me/',
      image: fallbackImages.card,
      titleColor: '#ffffff'
    }
  ]
});

let state = loadState();
let currentId = state.profiles[0].id;

const el = {
  profileList: document.getElementById('profileList'),
  profileName: document.getElementById('profileName'),
  profileBio: document.getElementById('profileBio'),
  footerText: document.getElementById('footerText'),
  profileAvatarUpload: document.getElementById('profileAvatarUpload'),
  avatarThumb: document.getElementById('avatarThumb'),
  profileShadow: document.getElementById('profileShadow'),
  fontFamily: document.getElementById('fontFamily'),
  backgroundType: document.getElementById('backgroundType'),
  backgroundColor: document.getElementById('backgroundColor'),
  backgroundColorHex: document.getElementById('backgroundColorHex'),
  gradientColor: document.getElementById('gradientColor'),
  gradientColorHex: document.getElementById('gradientColorHex'),
  gradientColorField: document.getElementById('gradientColorField'),
  textColor: document.getElementById('textColor'),
  textColorHex: document.getElementById('textColorHex'),
  nameColor: document.getElementById('nameColor'),
  nameColorHex: document.getElementById('nameColorHex'),
  bioColor: document.getElementById('bioColor'),
  bioColorHex: document.getElementById('bioColorHex'),
  footerColor: document.getElementById('footerColor'),
  footerColorHex: document.getElementById('footerColorHex'),
  blocks: document.getElementById('blocks'),
  preview: document.getElementById('preview'),
  previewName: document.getElementById('previewName'),
  downloadLink: document.getElementById('downloadLink'),
  blockTemplate: document.getElementById('blockTemplate')
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return normalizeState(JSON.parse(saved));
    } catch {
      return { profiles: [defaultProfile('Perfil 1')] };
    }
  }

  const old = localStorage.getItem(OLD_STORAGE_KEY);
  if (old) {
    try {
      return normalizeState(JSON.parse(old));
    } catch {
      return { profiles: [defaultProfile('Perfil 1')] };
    }
  }

  return { profiles: [defaultProfile('Perfil 1')] };
}

function normalizeState(raw) {
  const profiles = Array.isArray(raw.profiles) ? raw.profiles : [];
  const normalized = profiles.map((profile, index) => ({
    id: profile.id || createId(),
    name: profile.name || `Perfil ${index + 1}`,
    bio: profile.bio || '',
    footerText: profile.footerText || '© 2026 Laboratório Labollife',
    avatar: profile.avatar || fallbackImages.avatar,
    profileShadow: profile.profileShadow !== false,
    fontFamily: getAllowedFont(profile.fontFamily),
    backgroundType: profile.backgroundType === 'gradient' ? 'gradient' : 'solid',
    backgroundColor: coerceHex(profile.backgroundColor, '#0f766e'),
    gradientColor: coerceHex(profile.gradientColor, '#101828'),
    textColor: coerceHex(profile.textColor, '#ffffff'),
    nameColor: coerceHex(profile.nameColor || profile.textColor, '#ffffff'),
    bioColor: coerceHex(profile.bioColor || profile.textColor, '#d8dde8'),
    footerColor: coerceHex(profile.footerColor || profile.textColor, '#aab4c6'),
    blocks: Array.isArray(profile.blocks) && profile.blocks.length ? profile.blocks.map(normalizeBlock) : []
  }));

  return { profiles: normalized.length ? normalized : [defaultProfile('Perfil 1')] };
}

function normalizeBlock(block) {
  return {
    id: block.id || createId(),
    title: block.title || 'Novo link',
    url: block.url || '',
    image: block.image || fallbackImages.card,
    titleColor: coerceHex(block.titleColor, '#ffffff')
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getProfile() {
  return state.profiles.find(profile => profile.id === currentId) || state.profiles[0];
}

function renderProfileList() {
  el.profileList.innerHTML = '';

  state.profiles.forEach(profile => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `profile-pill${profile.id === currentId ? ' active' : ''}`;
    button.innerHTML = `
      <img src="${escapeHtml(profile.avatar || fallbackImages.avatar)}" alt="">
      <span>${escapeHtml(profile.name)}</span>
    `;
    button.addEventListener('click', () => {
      currentId = profile.id;
      renderEditor();
      renderPreview();
    });
    el.profileList.appendChild(button);
  });
}

function renderEditor() {
  const profile = getProfile();
  currentId = profile.id;

  renderProfileList();
  el.profileName.value = profile.name;
  el.profileBio.value = profile.bio;
  el.footerText.value = profile.footerText;
  el.avatarThumb.src = profile.avatar || fallbackImages.avatar;
  el.profileShadow.checked = profile.profileShadow;
  el.fontFamily.value = profile.fontFamily;
  el.backgroundType.value = profile.backgroundType;
  el.backgroundColor.value = profile.backgroundColor;
  el.backgroundColorHex.value = profile.backgroundColor;
  el.gradientColor.value = profile.gradientColor;
  el.gradientColorHex.value = profile.gradientColor;
  el.textColor.value = profile.textColor;
  el.textColorHex.value = profile.textColor;
  el.nameColor.value = profile.nameColor;
  el.nameColorHex.value = profile.nameColor;
  el.bioColor.value = profile.bioColor;
  el.bioColorHex.value = profile.bioColor;
  el.footerColor.value = profile.footerColor;
  el.footerColorHex.value = profile.footerColor;
  el.gradientColorField.classList.toggle('hidden', profile.backgroundType !== 'gradient');
  el.blocks.innerHTML = '';

  profile.blocks.forEach(block => {
    const node = el.blockTemplate.content.firstElementChild.cloneNode(true);
    const thumb = node.querySelector('[data-role="thumb"]');
    const titleInput = node.querySelector('[data-field="title"]');
    const urlInput = node.querySelector('[data-field="url"]');
    const titleColor = node.querySelector('[data-field="titleColor"]');
    const titleColorHex = node.querySelector('[data-field="titleColorHex"]');
    const imageUpload = node.querySelector('[data-field="imageUpload"]');

    thumb.src = block.image || fallbackImages.card;
    titleInput.value = block.title;
    urlInput.value = block.url;
    titleColor.value = block.titleColor;
    titleColorHex.value = block.titleColor;

    titleInput.addEventListener('input', event => {
      block.title = event.target.value;
      saveState();
      renderPreview();
    });

    urlInput.addEventListener('input', event => {
      block.url = event.target.value;
      saveState();
      renderPreview();
    });

    titleColor.addEventListener('input', event => {
      block.titleColor = event.target.value;
      titleColorHex.value = event.target.value;
      saveState();
      renderPreview();
    });

    titleColorHex.addEventListener('input', event => {
      const color = normalizeHex(event.target.value);
      titleColorHex.value = color;
      if (!isHexColor(color)) return;

      block.titleColor = color;
      titleColor.value = color;
      saveState();
      renderPreview();
    });

    imageUpload.addEventListener('change', async event => {
      await updateImageFromFile(event.target.files[0], image => {
        block.image = image;
        thumb.src = image;
      });
    });

    node.querySelector('[data-action="remove"]').addEventListener('click', () => {
      profile.blocks = profile.blocks.filter(item => item.id !== block.id);
      saveState();
      renderEditor();
      renderPreview();
    });

    el.blocks.appendChild(node);
  });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[char]));
}

function getSafeUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '#';
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
}

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '').trim());
}

function normalizeHex(value) {
  const clean = String(value || '').trim();
  const withHash = clean.startsWith('#') ? clean : `#${clean}`;
  return withHash.toLowerCase();
}

function coerceHex(value, fallback) {
  const color = normalizeHex(value);
  return isHexColor(color) ? color : fallback;
}

function getAllowedFont(value) {
  const fonts = ['Inter', 'Montserrat', 'Arial', 'Georgia'];
  return fonts.includes(value) ? value : 'Inter';
}

function getFontStack(profile) {
  const stacks = {
    Inter: 'Inter, Arial, sans-serif',
    Montserrat: 'Montserrat, Arial, sans-serif',
    Arial: 'Arial, Helvetica, sans-serif',
    Georgia: 'Georgia, Times, serif'
  };

  return stacks[getAllowedFont(profile.fontFamily)];
}

function getBackground(profile) {
  if (profile.backgroundType === 'gradient') {
    return `linear-gradient(160deg, ${profile.backgroundColor}, ${profile.gradientColor})`;
  }

  return profile.backgroundColor;
}

function getProfileShadow(profile) {
  if (!profile.profileShadow) return 'none';
  return '0 18px 0 rgba(0,0,0,.2), 0 24px 42px rgba(0,0,0,.38), inset 0 2px 0 rgba(255,255,255,.35)';
}

function publicPage(profile) {
  const blocks = profile.blocks.map(block => `
    <a class="link-card" href="${escapeHtml(getSafeUrl(block.url))}" target="_blank" rel="noopener noreferrer">
      <img src="${escapeHtml(block.image || fallbackImages.card)}" alt="${escapeHtml(block.title)}">
      <span class="overlay" style="color:${escapeHtml(block.titleColor)}">${escapeHtml(block.title || 'Link')}</span>
    </a>
  `).join('');

  return `<div class="public-page" style="background:${escapeHtml(getBackground(profile))};color:${escapeHtml(profile.textColor)};font-family:${escapeHtml(getFontStack(profile))}">
<header>
<img src="${escapeHtml(profile.avatar || fallbackImages.avatar)}" alt="Foto do perfil" style="box-shadow:${escapeHtml(getProfileShadow(profile))}">
<h1 style="color:${escapeHtml(profile.nameColor)}">${escapeHtml(profile.name)}</h1>
<p style="color:${escapeHtml(profile.bioColor)}">${escapeHtml(profile.bio)}</p>
</header>
<main>${blocks}</main>
<footer style="color:${escapeHtml(profile.footerColor)}">${escapeHtml(profile.footerText)}</footer>
</div>`;
}

function template(profile) {
  const page = publicPage(profile);

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(profile.name)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}body{margin:0;font-family:${escapeHtml(getFontStack(profile))};background:${escapeHtml(getBackground(profile))}}.public-page{min-height:100vh;padding:34px 20px 22px;display:flex;flex-direction:column;align-items:center;color:${escapeHtml(profile.textColor)}}header{width:100%;text-align:center}header img{width:104px;height:104px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.58)}h1{margin:14px 0 8px;font-size:30px;line-height:1.1;letter-spacing:.04em;text-transform:uppercase}p{max-width:340px;margin:0 auto;opacity:.9;line-height:1.45;letter-spacing:0}main{width:100%;max-width:430px;display:grid;gap:14px;margin-top:28px}.link-card{position:relative;min-height:124px;overflow:hidden;border-radius:14px;background:rgba(255,255,255,.14);color:inherit;text-decoration:none;box-shadow:0 12px 30px rgba(0,0,0,.18)}.link-card img{width:100%;height:100%;min-height:124px;object-fit:cover;display:block}.overlay{position:absolute;inset:0;display:flex;align-items:flex-end;padding:16px;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72));font-weight:800;font-size:17px;line-height:1.2;text-shadow:0 1px 12px rgba(0,0,0,.45)}footer{margin-top:auto;padding-top:24px;font-size:12px;font-weight:700;text-align:center;opacity:.86}
</style>
</head>
<body>
${page}
</body>
</html>`;
}

function renderPreview() {
  const profile = getProfile();
  el.preview.innerHTML = publicPage(profile);
  el.previewName.textContent = profile.name;
}

async function updateImageFromFile(file, onReady) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Escolha um arquivo de imagem.');
    return;
  }

  try {
    const dataUrl = await resizeImage(file);
    onReady(dataUrl);
    saveState();
    renderPreview();
  } catch {
    alert('Nao consegui carregar essa imagem. Tente outro arquivo.');
  }
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxSize = 1100;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function bindEvents() {
  el.profileName.addEventListener('input', event => {
    const profile = getProfile();
    profile.name = event.target.value || 'Sem nome';
    saveState();
    renderProfileList();
    renderPreview();
  });

  el.profileBio.addEventListener('input', event => {
    getProfile().bio = event.target.value;
    saveState();
    renderPreview();
  });

  el.footerText.addEventListener('input', event => {
    getProfile().footerText = event.target.value;
    saveState();
    renderPreview();
  });

  el.profileAvatarUpload.addEventListener('change', async event => {
    await updateImageFromFile(event.target.files[0], image => {
      const profile = getProfile();
      profile.avatar = image;
      el.avatarThumb.src = image;
      renderProfileList();
    });
  });

  el.profileShadow.addEventListener('change', event => {
    getProfile().profileShadow = event.target.checked;
    saveState();
    renderPreview();
  });

  el.fontFamily.addEventListener('change', event => {
    getProfile().fontFamily = getAllowedFont(event.target.value);
    saveState();
    renderPreview();
  });

  el.backgroundType.addEventListener('change', event => {
    const profile = getProfile();
    profile.backgroundType = event.target.value;
    el.gradientColorField.classList.toggle('hidden', profile.backgroundType !== 'gradient');
    saveState();
    renderPreview();
  });

  el.backgroundColor.addEventListener('input', event => {
    updateColor('backgroundColor', event.target.value);
  });

  el.backgroundColorHex.addEventListener('input', event => {
    updateColorFromHex('backgroundColor', event.target.value);
  });

  el.gradientColor.addEventListener('input', event => {
    updateColor('gradientColor', event.target.value);
  });

  el.gradientColorHex.addEventListener('input', event => {
    updateColorFromHex('gradientColor', event.target.value);
  });

  el.textColor.addEventListener('input', event => {
    updateColor('textColor', event.target.value);
  });

  el.textColorHex.addEventListener('input', event => {
    updateColorFromHex('textColor', event.target.value);
  });

  el.nameColor.addEventListener('input', event => {
    updateColor('nameColor', event.target.value);
  });

  el.nameColorHex.addEventListener('input', event => {
    updateColorFromHex('nameColor', event.target.value);
  });

  el.bioColor.addEventListener('input', event => {
    updateColor('bioColor', event.target.value);
  });

  el.bioColorHex.addEventListener('input', event => {
    updateColorFromHex('bioColor', event.target.value);
  });

  el.footerColor.addEventListener('input', event => {
    updateColor('footerColor', event.target.value);
  });

  el.footerColorHex.addEventListener('input', event => {
    updateColorFromHex('footerColor', event.target.value);
  });

  function updateColor(field, value) {
    const profile = getProfile();
    profile[field] = value;
    el[`${field}Hex`].value = value;
    saveState();
    renderPreview();
  }

  function updateColorFromHex(field, value) {
    const color = normalizeHex(value);
    el[`${field}Hex`].value = color;

    if (!isHexColor(color)) return;

    const profile = getProfile();
    profile[field] = color;
    el[field].value = color;
    saveState();
    renderPreview();
  }

  document.getElementById('addBlock').addEventListener('click', () => {
    const profile = getProfile();
    profile.blocks.push({
      id: createId(),
      title: 'Novo link',
      url: '',
      image: fallbackImages.card,
      titleColor: '#ffffff'
    });
    saveState();
    renderEditor();
    renderPreview();
  });

  document.getElementById('newProfile').addEventListener('click', () => {
    const profile = defaultProfile(`Perfil ${state.profiles.length + 1}`);
    state.profiles.push(profile);
    currentId = profile.id;
    saveState();
    renderEditor();
    renderPreview();
  });

  document.getElementById('deleteProfile').addEventListener('click', () => {
    if (state.profiles.length === 1) {
      alert('Mantenha pelo menos 1 perfil.');
      return;
    }

    state.profiles = state.profiles.filter(profile => profile.id !== currentId);
    currentId = state.profiles[0].id;
    saveState();
    renderEditor();
    renderPreview();
  });

  document.getElementById('exportHtml').addEventListener('click', () => {
    const profile = getProfile();
    const blob = new Blob([template(profile)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    el.downloadLink.href = url;
    el.downloadLink.download = `${profile.name.replace(/\s+/g, '-').toLowerCase() || 'perfil'}.html`;
    el.downloadLink.textContent = 'Baixar arquivo';
    el.downloadLink.classList.remove('hidden');
  });
}

bindEvents();
saveState();
renderEditor();
renderPreview();
