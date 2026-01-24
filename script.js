/* FRASES */
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
    "Estar com você, mesmo assim, é especial.",
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
    do {
        nova = Math.floor(Math.random() * mensagens.length);
    } while (nova === ultimaMensagem);

    ultimaMensagem = nova;
    document.getElementById("mensagemExtra").innerText = mensagens[nova];
    criarCoracao();
}


/* CORAÇÕES */
function criarCoracao() {
    const h = document.createElement("div");
    h.className = "heart";
    h.innerText = "💖";
    h.style.left = Math.random() * 100 + "vw";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 4000);
}

/* ESTRELAS */
setInterval(() => {
    const s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random() * window.innerWidth + "px";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3000);
}, 150);

/* PLAYER */
const musicas = [
    "musicas/Someone To You.mp3",
    "musicas/The First Time.mp3",
    "musicas/Her.mp3",
    "musicas/505.mp3",
    "musicas/Arabella.mp3",
    "musicas/Menina Veneno.mp3",
    "musicas/Céu Azul.mp3",
    "musicas/Chalé em Alaska.mp3",
    "musicas/Foreigner.mp3",
    "musicas/Guns N' Roses.mp3",
    "musicas/Heaven.mp3",
    "musicas/Every Breath You Take.mp3",
    "musicas/Lana.mp3",
    "musicas/LET ME SEE YA MOVE!.mp3",
    "musicas/Ma Meilleure Ennemie.mp3",
    "musicas/Making Love Out of Nothing at All.mp3",
    "musicas/R U Mine.mp3",
    "musicas/Sweater Weather.mp3",
    "musicas/Sweet Child O' Mine.mp3",
    "musicas/Tempo Perdido.mp3",
    "musicas/Until I Found You.mp3",
    "musicas/You Give Love A Bad Name.mp3",
];

let atual = Math.floor(Math.random() * musicas.length);
const audio = document.getElementById("audio");
const nome = document.getElementById("nomeMusica");
const barra = document.getElementById("progressBar");
const tempoAtual = document.getElementById("tempoAtual");
const tempoTotal = document.getElementById("tempoTotal");

function carregar() {
    audio.src = musicas[atual];

    nome.innerText = "🎵 " + musicas[atual]
        .replace("musicas/", "")
        .replace(".mp3", "");

    atualizarMediaSession();
}

function playPause() {
    audio.paused ? audio.play() : audio.pause();
}

function proxima() {
    atual = (atual + 1) % musicas.length;
    carregar();
    audio.play();
}

function voltar() {
    atual = (atual - 1 + musicas.length) % musicas.length;
    carregar();
    audio.play();
}

audio.addEventListener("timeupdate", () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    barra.style.width = percent + "%";

    tempoAtual.textContent = formatarTempo(audio.currentTime);
    tempoTotal.textContent = formatarTempo(audio.duration);
});

audio.addEventListener("ended", proxima);

function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const sec = Math.floor(segundos % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
}

function mudarTempo(e) {
    const largura = e.currentTarget.clientWidth;
    const click = e.offsetX;
    audio.currentTime = (click / largura) * audio.duration;
}

carregar();


//fundo animado
function criarParticula() {
    const p = document.createElement("span");
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = (3 + Math.random() * 5) + "s";

    document.querySelector(".particles").appendChild(p);

    setTimeout(() => {
        p.remove();
    }, 7000);
}

setInterval(criarParticula, 200);

function atualizarMediaSession() {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: nome.innerText.replace("🎵 ", ""),
            artist: "Para Ana 💖",
            album: "Playlist Especial",
            artwork: [
                { src: "icon.png", sizes: "512x512", type: "image/png" }
            ]
        });

        navigator.mediaSession.setActionHandler("play", () => {
            audio.play();
        });

        navigator.mediaSession.setActionHandler("pause", () => {
            audio.pause();
        });

        navigator.mediaSession.setActionHandler("previoustrack", () => {
            voltar();
        });

        navigator.mediaSession.setActionHandler("nexttrack", () => {
            proxima();
        });
    }
}

audio.addEventListener("play", atualizarMediaSession);
