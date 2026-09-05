const $ = id => document.getElementById(id);

let snippets = [];
let settings = {
  universalSnippets: true
};

async function load() {
  const state = await chrome.storage.local.get(['snippets', 'settings']);
  snippets = Array.isArray(state.snippets) ? state.snippets : [];
  settings = { ...settings, ...(state.settings || {}) };

  $('universalSnippets').checked = settings.universalSnippets !== false;
  render();
}

async function saveSnippets() {
  await chrome.storage.local.set({ snippets });
  render();
}

async function saveSettings() {
  await chrome.storage.local.set({ settings });
}

function normalize(v) {
  v = String(v || '').trim();
  return v.startsWith('/') ? v : '/' + v;
}

function render() {
  $('list').innerHTML = '';

  if (!snippets.length) {
    $('list').innerHTML = '<p class="muted">Nenhum snippet criado.</p>';
    return;
  }

  snippets.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'snippet';

    const cmd = document.createElement('input');
    cmd.value = s.command;

    const rep = document.createElement('textarea');
    rep.value = s.replacement;

    const del = document.createElement('button');
    del.textContent = 'Excluir';
    del.className = 'secondary';

    cmd.addEventListener('change', async () => {
      snippets[i].command = normalize(cmd.value);
      await saveSnippets();
    });

    rep.addEventListener('change', async () => {
      snippets[i].replacement = rep.value;
      await saveSnippets();
    });

    del.addEventListener('click', async () => {
      snippets.splice(i, 1);
      await saveSnippets();
    });

    row.append(cmd, rep, del);
    $('list').append(row);
  });
}

$('add').addEventListener('click', async () => {
  const command = normalize($('command').value);
  const replacement = $('replacement').value;

  if (command === '/' || !replacement) return;

  snippets.push({
    command,
    replacement,
    enabled: true
  });

  $('command').value = '';
  $('replacement').value = '';

  await saveSnippets();
});

$('universalSnippets').addEventListener('change', async () => {
  settings.universalSnippets = $('universalSnippets').checked;
  await saveSettings();
});

load();
