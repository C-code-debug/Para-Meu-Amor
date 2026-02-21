// Declarado aqui pois o visualizador precisa antes
const audio = document.getElementById("audio");

/* =============================================
   FRASES
============================================= */
const mensagens = [
  "Eu nunca vou te deixar 💕",
  "Você é a melhor parte do meu dia 😁",
  "Meu coração é todo seu 🥺",
  "Mesmo longe, eu te amo 💖",
  "Você é meu lugar seguro 🥰",
  "Eu sorrio só de pensar em você 🤍",
  "Entre todas as pessoas do mundo, eu escolheria você de novo.",
  "Seu jeito faz meu coração ficar em paz 💫",
  "Eu amo a forma como você existe na minha vida.",
  "Você é meu pensamento favorito todos os dias.",
  "Mesmo no silêncio, penso em você.",
  "Meu amor por você só cresce 🌙",
  "Não importa a distância, você sempre está comigo.",
  "Você é o motivo dos meus melhores sorrisos.",
  "Eu escolheria você em qualquer vida.",
  "Meu mundo ficou melhor depois de você.",
  "Você é meu ponto de calma em meio ao caos.",
  "Meu coração sorri quando lembra de você 💜",
  "Eu amo cada detalhe seu.",
  "Você é meu abrigo, mesmo de longe.",
  "Meu carinho por você não cabe em palavras.",
  "Você é meu pensamento antes de dormir.",
  "Eu te amo mais do que consigo explicar.",
  "Você é o meu sempre.",
  "Eu gosto de você mais do que ontem, menos que amanhã.",
  "Você é a melhor parte da minha história.",
  "Meu coração escolheu você.",
  "Eu me sinto em casa quando penso em você.",
  "Você é tudo o que eu queria 💖"
];

let ultimaMensagem = -1;

function mostrarMensagem() {
  let nova;
  do { nova = Math.floor(Math.random() * mensagens.length); }
  while (nova === ultimaMensagem);
  ultimaMensagem = nova;

  const el = document.getElementById("mensagemExtra");
  el.style.opacity = "0";
  setTimeout(() => { el.textContent = mensagens[nova]; el.style.opacity = "1"; }, 200);
  criarCoracoes(5);
}

/* =============================================
   CORAÇÕES
============================================= */
function criarCoracoes(qtd = 1) {
  for (let i = 0; i < qtd; i++) {
    setTimeout(() => {
      const h = document.createElement("div");
      h.className = "heart";
      h.innerText = "💖";
      h.style.left = (10 + Math.random() * 80) + "vw";
      h.style.bottom = "10vh";
      h.style.animationDuration = (3.5 + Math.random() * 1.5) + "s";
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 5000);
    }, i * 100);
  }
}

/* =============================================
   CANVAS BACKGROUND + VISUALIZADOR DE ONDA
============================================= */
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
const waveCanvas = document.getElementById("waveCanvas");
const wCtx = waveCanvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  waveCanvas.width = window.innerWidth;
  waveCanvas.height = 120;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ---- Web Audio API ---- */
let audioCtx = null;
let analyser = null;
let sourceNode = null;
let dataArray = null;
let audioConectado = false;

function conectarAudio() {
  if (audioConectado) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    audioConectado = true;
  } catch(e) {
    console.warn("Web Audio API indisponivel:", e);
  }
}

/* ---- Estado reativo ---- */
let energiaAtual = 0;
let hueAtual = 280;
let brilhoAtual = 0.14;
let hueAlvo = 280;
let brilhoAlvo = 0.14;

const paletas = [
  { baixo: 280, alto: 320 },
  { baixo: 200, alto: 260 },
  { baixo: 320, alto: 360 },
  { baixo: 260, alto: 300 },
];
let paletaAtual = 0;
let tempoNaPaleta = 0;

/* ---- Onda ---- */
let ondaFase = 0;
let ondaAmplitude = 8;
let ondaAmplitudeAlvo = 8;

function calcularEnergia() {
  if (!analyser || !dataArray) return 0;
  analyser.getByteFrequencyData(dataArray);
  let soma = 0;
  for (let i = 0; i < dataArray.length; i++) soma += dataArray[i];
  return soma / (dataArray.length * 255);
}

let t = 0;
(function loop() {
  const energia = (!audio.paused && audioConectado) ? calcularEnergia() : 0;
  energiaAtual += (energia - energiaAtual) * 0.08;

  tempoNaPaleta += 0.002 + energiaAtual * 0.01;
  if (tempoNaPaleta > 1) { tempoNaPaleta = 0; paletaAtual = (paletaAtual + 1) % paletas.length; }
  const p = paletas[paletaAtual];
  hueAlvo = p.baixo + (p.alto - p.baixo) * (0.5 + Math.sin(t * 0.3) * 0.5);
  hueAtual += (hueAlvo - hueAtual) * 0.02;

  brilhoAlvo = 0.10 + energiaAtual * 0.55;
  brilhoAtual += (brilhoAlvo - brilhoAtual) * 0.06;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#06000f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width * 0.5, cy = canvas.height * 0.4;
  const g1 = ctx.createRadialGradient(cx + Math.sin(t * 0.4) * 80, cy + Math.cos(t * 0.3) * 50, 0, cx, cy, canvas.width * (0.6 + energiaAtual * 0.2));
  g1.addColorStop(0, `hsla(${hueAtual}, 100%, 55%, ${brilhoAtual})`);
  g1.addColorStop(0.5, `hsla(${hueAtual + 30}, 100%, 50%, ${brilhoAtual * 0.4})`);
  g1.addColorStop(1, "rgba(6,0,15,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const g2 = ctx.createRadialGradient(canvas.width * 0.8 + Math.cos(t * 0.5) * 50, canvas.height * 0.7 + Math.sin(t * 0.4) * 40, 0, canvas.width * 0.8, canvas.height * 0.7, canvas.width * (0.4 + energiaAtual * 0.15));
  g2.addColorStop(0, `hsla(${hueAtual + 50}, 100%, 60%, ${brilhoAtual * 0.7})`);
  g2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (energiaAtual > 0.35) {
    const pulso = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.9);
    pulso.addColorStop(0, `hsla(${hueAtual - 20}, 100%, 70%, ${(energiaAtual - 0.35) * 0.3})`);
    pulso.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pulso;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  desenharOnda(energia);
  t += 0.007;
  requestAnimationFrame(loop);
})();

function desenharOnda(energia) {
  const w = waveCanvas.width;
  const h = waveCanvas.height;
  wCtx.clearRect(0, 0, w, h);

  ondaAmplitudeAlvo = (!audioConectado || audio.paused) ? 8 : 12 + energia * 80;
  ondaAmplitude += (ondaAmplitudeAlvo - ondaAmplitude) * 0.1;
  ondaFase += 0.025 + (audioConectado && !audio.paused ? energia * 0.12 : 0);

  let freqs = null;
  if (audioConectado && dataArray) {
    analyser.getByteFrequencyData(dataArray);
    freqs = dataArray;
  }

  for (let camada = 0; camada < 2; camada++) {
    wCtx.beginPath();
    const baseY = h * (camada === 0 ? 0.65 : 0.55);
    const faseOffset = camada * 0.8;
    const ampMult = camada === 0 ? 1 : 0.6;

    for (let x = 0; x <= w; x += 2) {
      const progresso = x / w;
      let distorcao = 0;
      if (freqs) {
        const idx = Math.floor(progresso * (freqs.length * 0.6));
        distorcao = (freqs[idx] / 255) * ondaAmplitude * 0.8;
      }
      const y = baseY
        + Math.sin(progresso * Math.PI * 4 + ondaFase + faseOffset) * ondaAmplitude * ampMult
        + Math.sin(progresso * Math.PI * 7 + ondaFase * 1.3 + faseOffset) * ondaAmplitude * 0.4 * ampMult
        + distorcao;
      x === 0 ? wCtx.moveTo(x, y) : wCtx.lineTo(x, y);
    }

    wCtx.lineTo(w, h);
    wCtx.lineTo(0, h);
    wCtx.closePath();

    if (camada === 0) {
      const grad = wCtx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0,   `hsla(${hueAtual},      100%, 65%, 0.18)`);
      grad.addColorStop(0.3, `hsla(${hueAtual + 20}, 100%, 65%, 0.28)`);
      grad.addColorStop(0.6, `hsla(${hueAtual + 40}, 100%, 70%, 0.22)`);
      grad.addColorStop(1,   `hsla(${hueAtual + 60}, 100%, 65%, 0.15)`);
      wCtx.fillStyle = grad;
      wCtx.fill();
    } else {
      const gradLinha = wCtx.createLinearGradient(0, 0, w, 0);
      gradLinha.addColorStop(0,   `hsla(${hueAtual},      100%, 80%, 0.5)`);
      gradLinha.addColorStop(0.5, `hsla(${hueAtual + 40}, 100%, 85%, 0.8)`);
      gradLinha.addColorStop(1,   `hsla(${hueAtual + 70}, 100%, 80%, 0.5)`);
      wCtx.strokeStyle = gradLinha;
      wCtx.lineWidth = 1.5;
      wCtx.stroke();
    }
  }
}

audio.addEventListener("play", () => {
  conectarAudio();
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  waveCanvas.classList.add("ativo");
});
audio.addEventListener("pause", () => {
  setTimeout(() => { if (audio.paused) waveCanvas.classList.remove("ativo"); }, 800);
});

/* =============================================
   PARTÍCULAS
============================================= */
const particlesEl = document.getElementById("particles");
setInterval(() => {
  const p = document.createElement("div");
  p.className = "particle";
  p.style.left = Math.random() * 100 + "vw";
  const dur = 5 + Math.random() * 6;
  p.style.setProperty("--dur", dur + "s");
  particlesEl.appendChild(p);
  setTimeout(() => p.remove(), dur * 1000 + 500);
}, 260);

/* =============================================
   INDEXEDDB — salva arquivos MP3 permanentemente
============================================= */
let db = null;

function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("ParaAnaDB", 1);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains("arquivos"))
        d.createObjectStore("arquivos", { keyPath: "id" });
    };
    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

function salvarArquivoDB(id, blob) {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    const tx = db.transaction("arquivos", "readwrite");
    tx.objectStore("arquivos").put({ id, blob });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function buscarArquivoDB(id) {
  return new Promise((resolve) => {
    if (!db) return resolve(null);
    const tx = db.transaction("arquivos", "readonly");
    const req = tx.objectStore("arquivos").get(id);
    req.onsuccess = () => resolve(req.result?.blob || null);
    req.onerror = () => resolve(null);
  });
}

function deletarArquivoDB(id) {
  return new Promise((resolve) => {
    if (!db) return resolve();
    const tx = db.transaction("arquivos", "readwrite");
    tx.objectStore("arquivos").delete(id);
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}

/* =============================================
   LOCALSTORAGE — metadados e letras
============================================= */
const STORAGE_KEY = "playlist_para_ana_v2";

function salvarStorage() {
  const dados = playlist.map(m => ({
    id: m.id, nome: m.nome,
    src: m.tipo === "blob" ? null : m.src,
    tipo: m.tipo, letra: m.letra || ""
  }));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dados)); } catch(e) {}
}

function carregarStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const dados = JSON.parse(raw);
      if (Array.isArray(dados) && dados.length > 0) return dados;
    }
  } catch(e) {}
  return null;
}

/* =============================================
   PLAYLIST — estado
============================================= */
const musicasPadrao = [
  { id: "p1",  nome: "Someone To You",                  src: "musicas/Someone To You.mp3",                  tipo: "arquivo", letra: "" },
  { id: "p2",  nome: "The First Time",                  src: "musicas/The First Time.mp3",                  tipo: "arquivo", letra: "" },
  { id: "p3",  nome: "Her",                             src: "musicas/Her.mp3",                             tipo: "arquivo", letra: "" },
  { id: "p4",  nome: "505",                             src: "musicas/505.mp3",                             tipo: "arquivo", letra: "" },
  { id: "p5",  nome: "Arabella",                        src: "musicas/Arabella.mp3",                        tipo: "arquivo", letra: "" },
  { id: "p6",  nome: "Menina Veneno",                   src: "musicas/Menina Veneno.mp3",                   tipo: "arquivo", letra: "" },
  { id: "p7",  nome: "Ceu Azul",                        src: "musicas/Céu Azul.mp3",                        tipo: "arquivo", letra: "" },
  { id: "p8",  nome: "Chale em Alaska",                 src: "musicas/Chalé em Alaska.mp3",                 tipo: "arquivo", letra: "" },
  { id: "p9",  nome: "Foreigner",                       src: "musicas/Foreigner.mp3",                       tipo: "arquivo", letra: "" },
  { id: "p10", nome: "Guns N Roses",                    src: "musicas/Guns N' Roses.mp3",                   tipo: "arquivo", letra: "" },
  { id: "p11", nome: "Heaven",                          src: "musicas/Heaven.mp3",                          tipo: "arquivo", letra: "" },
  { id: "p12", nome: "Every Breath You Take",           src: "musicas/Every Breath You Take.mp3",           tipo: "arquivo", letra: "" },
  { id: "p13", nome: "Lana",                            src: "musicas/Lana.mp3",                            tipo: "arquivo", letra: "" },
  { id: "p14", nome: "LET ME SEE YA MOVE!",             src: "musicas/LET ME SEE YA MOVE!.mp3",             tipo: "arquivo", letra: "" },
  { id: "p15", nome: "Ma Meilleure Ennemie",            src: "musicas/Ma Meilleure Ennemie.mp3",            tipo: "arquivo", letra: "" },
  { id: "p16", nome: "Making Love Out of Nothing at All", src: "musicas/Making Love Out of Nothing at All.mp3", tipo: "arquivo", letra: "" },
  { id: "p17", nome: "R U Mine",                        src: "musicas/R U Mine.mp3",                        tipo: "arquivo", letra: "" },
  { id: "p18", nome: "Sweater Weather",                 src: "musicas/Sweater Weather.mp3",                 tipo: "arquivo", letra: "" },
  { id: "p19", nome: "Sweet Child O Mine",              src: "musicas/Sweet Child O' Mine.mp3",             tipo: "arquivo", letra: "" },
  { id: "p20", nome: "Tempo Perdido",                   src: "musicas/Tempo Perdido.mp3",                   tipo: "arquivo", letra: "" },
  { id: "p21", nome: "Until I Found You",               src: "musicas/Until I Found You.mp3",               tipo: "arquivo", letra: "" },
  { id: "p22", nome: "You Give Love A Bad Name",        src: "musicas/You Give Love A Bad Name.mp3",        tipo: "arquivo", letra: "" },
];

function montarPlaylistInicial() {
  const salvo = carregarStorage();
  if (!salvo) return [...musicasPadrao];

  const mapaLetras = {};
  salvo.forEach(m => { mapaLetras[m.id] = m.letra || ""; });
  const padrao = musicasPadrao.map(m => ({ ...m, letra: mapaLetras[m.id] || "" }));

  const idsDefault = new Set(musicasPadrao.map(m => m.id));
  const extras = salvo.filter(m => !idsDefault.has(m.id));

  return [...padrao, ...extras];
}

let playlist = montarPlaylistInicial();
let atual = Math.floor(Math.random() * playlist.length);
let shuffleAtivo = false;

const nomeMusica   = document.getElementById("nomeMusica");
const progressBar  = document.getElementById("progressBar");
const progressThumb= document.getElementById("progressThumb");
const tempoAtualEl = document.getElementById("tempoAtual");
const tempoTotalEl = document.getElementById("tempoTotal");
const playIcon     = document.getElementById("playIcon");

function gerarId() {
  return "m" + Date.now() + Math.floor(Math.random() * 1000);
}

/* =============================================
   LETRA — SCROLL SUAVE
============================================= */
let letraLinhas = [];
let letraScrollRaf = null;
let letraScrollOffset = 0;

function iniciarLetra() {
  const musica = playlist[atual];
  const letraBox = document.getElementById("letraBox");
  const letraBoxNome = document.getElementById("letraBoxNome");
  const letraScrollInner = document.getElementById("letraScrollInner");

  pararLetraScroll();

  if (!musica.letra || musica.letra.trim() === "") {
    letraBox.style.display = "none";
    return;
  }

  letraBox.style.display = "";
  letraBoxNome.textContent = musica.nome;

  letraLinhas = musica.letra.split("\n");
  letraScrollInner.innerHTML = "";
  letraLinhas.forEach((linha, i) => {
    const el = document.createElement("div");
    el.className = "letra-linha";
    el.textContent = linha;
    el.dataset.index = i;
    letraScrollInner.appendChild(el);
  });

  letraScrollOffset = 0;
  letraScrollInner.style.transform = "translateY(0px)";
  destacarLinha(0);
}

function pararLetraScroll() {
  if (letraScrollRaf) { cancelAnimationFrame(letraScrollRaf); letraScrollRaf = null; }
}

function iniciarScrollLetra() {
  pararLetraScroll();
  const musica = playlist[atual];
  if (!musica.letra || musica.letra.trim() === "") return;

  const inner = document.getElementById("letraScrollInner");
  if (!inner || !inner.children.length) return;

  const alturaTotal = inner.scrollHeight - 120;
  const duracao = audio.duration || 200;
  const pxPorSegundo = alturaTotal / duracao;
  let ultimoTimestamp = null;

  function tick(ts) {
    if (!ultimoTimestamp) ultimoTimestamp = ts;
    const delta = (ts - ultimoTimestamp) / 1000;
    ultimoTimestamp = ts;

    if (!audio.paused && !audio.ended) {
      letraScrollOffset += pxPorSegundo * delta;
      letraScrollOffset = Math.min(letraScrollOffset, Math.max(0, alturaTotal));
      inner.style.transform = `translateY(-${letraScrollOffset}px)`;
      atualizarLinhaSelecionada();
    }
    letraScrollRaf = requestAnimationFrame(tick);
  }
  letraScrollRaf = requestAnimationFrame(tick);
}

function atualizarLinhaSelecionada() {
  const inner = document.getElementById("letraScrollInner");
  if (!inner) return;
  const linhas = inner.querySelectorAll(".letra-linha");
  if (!linhas.length) return;
  const alturaLinha = inner.scrollHeight / linhas.length;
  const centroVisivel = letraScrollOffset + 60;
  const indice = Math.min(Math.floor(centroVisivel / alturaLinha), linhas.length - 1);
  linhas.forEach((el, i) => el.classList.toggle("ativa", i === indice));
}

function destacarLinha(index) {
  const inner = document.getElementById("letraScrollInner");
  if (!inner) return;
  inner.querySelectorAll(".letra-linha").forEach((el, i) => el.classList.toggle("ativa", i === index));
}

function sincronizarScrollComTempo() {
  const musica = playlist[atual];
  if (!musica.letra || !audio.duration) return;
  const inner = document.getElementById("letraScrollInner");
  if (!inner || !inner.children.length) return;
  const alturaTotal = inner.scrollHeight - 120;
  letraScrollOffset = alturaTotal * (audio.currentTime / audio.duration);
  inner.style.transform = `translateY(-${letraScrollOffset}px)`;
  atualizarLinhaSelecionada();
}

/* =============================================
   PLAYER — CONTROLES
============================================= */
function carregar() {
  if (!playlist.length) return;
  const m = playlist[atual];
  audio.src = m.src;
  nomeMusica.textContent = "🎵 " + m.nome;
  atualizarMediaSession();
  renderizarPlaylist();
  iniciarLetra();
}

function tocarMusica(index) {
  atual = index;
  carregar();
  audio.play();
}

function playPause() {
  audio.paused ? audio.play() : audio.pause();
}

function proxima() {
  if (!playlist.length) return;
  atual = shuffleAtivo ? Math.floor(Math.random() * playlist.length) : (atual + 1) % playlist.length;
  carregar();
  audio.play();
}

function voltar() {
  if (!playlist.length) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  atual = (atual - 1 + playlist.length) % playlist.length;
  carregar();
  audio.play();
}

function toggleShuffle() {
  shuffleAtivo = !shuffleAtivo;
  document.getElementById("shuffleBtn").classList.toggle("active", shuffleAtivo);
  mostrarToast(shuffleAtivo ? "Modo aleatório ativado" : "Modo aleatório desativado");
}

/* ---- Eventos de áudio ---- */
audio.addEventListener("play", () => {
  playIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
  renderizarPlaylist();
  atualizarMediaSession();
  sincronizarScrollComTempo();
  iniciarScrollLetra();
});
audio.addEventListener("pause", () => {
  playIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
  renderizarPlaylist();
  pararLetraScroll();
});
audio.addEventListener("ended", proxima);
audio.addEventListener("seeked", () => {
  sincronizarScrollComTempo();
  if (!audio.paused) iniciarScrollLetra();
});
audio.addEventListener("timeupdate", () => {
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progressBar.style.width = pct + "%";
  progressThumb.style.left = pct + "%";
  tempoAtualEl.textContent = formatarTempo(audio.currentTime);
  tempoTotalEl.textContent = formatarTempo(audio.duration);
});

function formatarTempo(s) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

function mudarTempo(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  if (audio.duration) audio.currentTime = pct * audio.duration;
}

/* ---- Media Session ---- */
function atualizarMediaSession() {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: playlist[atual]?.nome || "Musica",
    artist: "Para Ana 💖", album: "Playlist Especial",
    artwork: [{ src: "icon.png", sizes: "512x512", type: "image/png" }]
  });
  navigator.mediaSession.setActionHandler("play", () => audio.play());
  navigator.mediaSession.setActionHandler("pause", () => audio.pause());
  navigator.mediaSession.setActionHandler("previoustrack", voltar);
  navigator.mediaSession.setActionHandler("nexttrack", proxima);
}

/* =============================================
   PLAYLIST — RENDERIZAÇÃO
============================================= */
function renderizarPlaylist() {
  const lista = document.getElementById("sidebarList");
  lista.innerHTML = "";

  if (!playlist.length) {
    lista.innerHTML = `<div style="text-align:center;padding:28px;color:var(--muted);font-size:0.88rem;">Nenhuma musica ainda.<br>Adicione uma! 🎵</div>`;
    return;
  }

  playlist.forEach((m, i) => {
    const isAtual = i === atual;
    const isPlaying = isAtual && !audio.paused;
    const item = document.createElement("div");
    item.className = "pl-item" + (isAtual ? " active" : "");

    item.innerHTML = `
      <div class="${isPlaying ? "pl-playing" : "pl-num"}">
        ${isPlaying
          ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c84bff" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="19" y1="5" x2="19" y2="19"/><line x1="5" y1="5" x2="5" y2="19"/></svg>`
          : (i + 1)
        }
      </div>
      <span class="pl-nome" title="${m.nome}">${m.nome}</span>
      <div class="pl-actions">
        <button class="pl-btn ${m.letra ? "has-letra" : ""}" onclick="abrirLetraModal(event,${i})" title="${m.letra ? "Editar letra" : "Adicionar letra"}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </button>
        <button class="pl-btn del" onclick="removerMusica(event,${i})" title="Remover">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      </div>
    `;

    item.addEventListener("click", e => {
      if (!e.target.closest(".pl-actions")) tocarMusica(i);
    });
    lista.appendChild(item);
  });

  const ativo = lista.querySelector(".active");
  if (ativo) ativo.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function removerMusica(e, index) {
  e.stopPropagation();
  const musica = playlist[index];
  if (musica.tipo === "blob") deletarArquivoDB(musica.id);
  playlist.splice(index, 1);
  if (atual >= playlist.length) atual = Math.max(0, playlist.length - 1);
  salvarStorage();
  renderizarPlaylist();
  if (playlist.length > 0 && index === atual) carregar();
  mostrarToast("Música removida");
}

/* =============================================
   SIDEBAR
============================================= */
function togglePlaylist() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const aberta = sidebar.classList.toggle("open");
  overlay.classList.toggle("show", aberta);
  if (aberta) renderizarPlaylist();
}

/* =============================================
   MODAL ADICIONAR MÚSICA
============================================= */
function abrirModal() {
  document.getElementById("modalOverlay").classList.add("show");
  document.getElementById("modal").classList.add("show");
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

function fecharModal() {
  document.getElementById("modalOverlay").classList.remove("show");
  document.getElementById("modal").classList.remove("show");
  document.getElementById("inputNome").value = "";
  document.getElementById("inputLink").value = "";
  document.getElementById("fileInput").value = "";
}

function trocarAba(aba) {
  document.getElementById("contentUpload").classList.toggle("hidden", aba !== "upload");
  document.getElementById("contentLink").classList.toggle("hidden", aba !== "link");
  document.getElementById("tabUpload").classList.toggle("active", aba === "upload");
  document.getElementById("tabLink").classList.toggle("active", aba === "link");
}

/* ---- Upload — salva no IndexedDB ---- */
async function processarArquivos(files) {
  if (!files || !files.length) return;
  const validos = Array.from(files).filter(f => f.type.startsWith("audio/") || f.name.endsWith(".mp3"));
  if (!validos.length) return;

  mostrarToast("Salvando músicas...");

  for (const f of validos) {
    const id = gerarId();
    const nome = f.name.replace(/\.[^/.]+$/, "");
    await salvarArquivoDB(id, f);
    const blobUrl = URL.createObjectURL(f);
    playlist.push({ id, nome, src: blobUrl, tipo: "blob", letra: "" });
  }

  salvarStorage();
  renderizarPlaylist();
  fecharModal();
  mostrarToast(`${validos.length} música${validos.length > 1 ? "s" : ""} adicionada${validos.length > 1 ? "s" : ""}! 🎵`);
  if (audio.paused) { atual = playlist.length - validos.length; carregar(); }
}

// Drag & Drop
const uploadArea = document.getElementById("uploadArea");
uploadArea.addEventListener("dragover", e => { e.preventDefault(); uploadArea.style.borderColor = "var(--primary)"; });
uploadArea.addEventListener("dragleave", () => { uploadArea.style.borderColor = ""; });
uploadArea.addEventListener("drop", e => { e.preventDefault(); uploadArea.style.borderColor = ""; processarArquivos(e.dataTransfer.files); });

/* ---- Link direto ---- */
function adicionarPorLink() {
  const nome = document.getElementById("inputNome").value.trim();
  const src  = document.getElementById("inputLink").value.trim();
  if (!src) { mostrarToast("Cole um link de MP3 válido"); return; }
  const nomeReal = nome || src.split("/").pop().split("?")[0].replace(/\.[^/.]+$/, "") || "Nova musica";
  playlist.push({ id: gerarId(), nome: nomeReal, src, tipo: "link", letra: "" });
  salvarStorage();
  renderizarPlaylist();
  mostrarToast(`"${nomeReal}" adicionada! 🎵`);
  fecharModal();
  if (audio.paused) { atual = playlist.length - 1; carregar(); }
}

/* =============================================
   MODAL LETRA
============================================= */
let letraEditandoIndex = -1;

function abrirLetraModal(e, index) {
  e.stopPropagation();
  letraEditandoIndex = index;
  const m = playlist[index];
  document.getElementById("letraModalNome").textContent = m.nome;
  document.getElementById("letraTextarea").value = m.letra || "";
  document.getElementById("letraOverlay").classList.add("show");
  document.getElementById("letraModal").classList.add("show");
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
  setTimeout(() => document.getElementById("letraTextarea").focus(), 100);
}

function fecharLetraModal() {
  document.getElementById("letraOverlay").classList.remove("show");
  document.getElementById("letraModal").classList.remove("show");
  letraEditandoIndex = -1;
}

function salvarLetra() {
  if (letraEditandoIndex < 0) return;
  const letra = document.getElementById("letraTextarea").value;
  playlist[letraEditandoIndex].letra = letra;
  salvarStorage();
  mostrarToast("Letra salva! 🎵");
  fecharLetraModal();
  if (letraEditandoIndex === atual) iniciarLetra();
}

/* =============================================
   TOAST
============================================= */
let toastTimer;
function mostrarToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

/* =============================================
   TECLADO
============================================= */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    fecharModal();
    fecharLetraModal();
    if (document.getElementById("sidebar").classList.contains("open")) togglePlaylist();
  }
  if (e.key === " " && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "INPUT") {
    e.preventDefault();
    playPause();
  }
});

/* =============================================
   INICIALIZAR — abre IndexedDB e restaura blobs
============================================= */
async function inicializar() {
  await abrirDB();

  // Restaura blob URLs das músicas salvas no IndexedDB
  for (const m of playlist) {
    if (m.tipo === "blob" && !m.src) {
      const blob = await buscarArquivoDB(m.id);
      if (blob) {
        m.src = URL.createObjectURL(blob);
      } else {
        m._remover = true; // arquivo sumiu do DB
      }
    }
  }

  playlist = playlist.filter(m => !m._remover);
  if (atual >= playlist.length) atual = 0;
  carregar();
}

inicializar();
