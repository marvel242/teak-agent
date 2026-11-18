/* ============================================================
   TEAk — Relais Voix (Cloudflare Worker)
   Transforme un texte en parole avec la voix neuronale
   Microsoft « Eloise » (jeune femme française), gratuite.
   Appel :  GET  /?text=Bonjour&voice=fr-FR-EloiseNeural
            POST /  {"text":"Bonjour","voice":"fr-FR-EloiseNeural"}
   Réponse : audio MP3.
   ============================================================ */
/* Portage JS du générateur de jeton Sec-MS-GEC v2 (protocole Microsoft Edge TTS).
   Transposition fidèle de la bibliothèque Python edge-tts (drm.py, v7.3.1). */
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WIN_EPOCH = 11644473600;
const SHA256_INITIAL = [0x6A09E667,0xBB67AE85,0x3C6EF372,0xA54FF53A,0x510E527F,0x9B05688C,0x1F83D9AB,0x5BE0CD19];
const SHA256_STATE   = [0xFD9FBEA2,0x91243CE7,0xBE499094,0xCD2E1E0A,0x6C006F49,0x04BD35AB,0xFEB0A7E4,0x03EFFBD2];
const SHA256_SCHEDULE = [0xEB24BF9E,0x1558691F,0xA0C09EE2,0x0CFA32BA,0xA622EE8C,0xD1DD9491,0xC0DD25A0,0xF9E70AB6,0xF0C31573,0x7058CE4E,0x7188E606,0x00E5AB33,0xD258B060,0x72766564];
const K = [0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0x0FC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x06CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2];
const BLOCK_CONSTANTS = K.slice(0,14).concat([0xC9DC06A7], K.slice(15));
const SHA256_ADJUSTMENT = 0xC9DC06A7, SIGMA0_ADJ = 0x059C0B80, SIGMA1_ADJ = 0x000B92C0;
const CS64_COEFFICIENTS = [[0xE82E91B1,0xB32700D0],[0x44DE24C6,0x88DFF51D],[0x3BEB65BC,0x29514038],[0xC89C5933,0xB328CBDF],[0x8D1EC211,0xD405B4D5],[0x314EF5D5,0x26E55F3C],[0xE92491B1,0x607801C6],[0xF0A5B9D5,0x82B2C1FB],[0x06064CF3,0xFA51A3DA],[0xDA79FA60,0x207CC464],[0xBED20560,0x3C3C74F3],[0x89F9C9F8,0xD2D14B61],[0x35FA38C6,0xBB04A2C1],[0xCB49E3C6,0xC5626167]];
const CS64_FACTOR = 0x82893933, CS64_ADJ0 = 0xF2F90B1A, CS64_ADJ1 = 0x0B1A0000;
const u32 = (x) => x >>> 0;
const imul = Math.imul;
function rol16(v){ v = u32(v); return u32((v << 16) | (v >>> 16)); }
function sigma0(v){ return u32((v >>> 7) ^ (v << 25) ^ (v >>> 18) ^ (v << 14) ^ (v >>> 3)); }
function sigma1(v){ return u32((v >>> 17) ^ (v << 15) ^ (v >>> 19) ^ (v << 13) ^ (v >>> 10)); }
function expandSchedule(words, firstWord){
  for (let i = firstWord; i < 64; i++){
    const x = words[i-2], y = words[i-15];
    const s1 = (x >>> 17) ^ (x << 15) ^ (x >>> 19) ^ (x << 13) ^ (x >>> 10);
    const s0 = (y >>> 7) ^ (y << 25) ^ (y >>> 18) ^ (y << 14) ^ (y >>> 3);
    words.push(u32(s1 + words[i-7] + s0 + words[i-16]));
  }
}
function rotr(x, n){ return u32((x >>> n) | (x << (32 - n))); }
function sha256Rounds(state, words, firstRound){
  const constants = firstRound === 14 ? BLOCK_CONSTANTS : K;
  let [a,b,c,d,e,f,g,h] = state.map(u32);
  for (let i = firstRound; i < 64; i++){
    const S1 = u32(rotr(e,6) ^ rotr(e,11) ^ rotr(e,25));
    const ch = u32(g ^ (e & (f ^ g)));
    const t1 = u32(h + S1 + ch + constants[i] + words[i]);
    const S0 = u32(rotr(a,2) ^ rotr(a,13) ^ rotr(a,22));
    const maj = u32((a & b) | (c & (a | b)));
    const t2 = u32(S0 + maj);
    h = g; g = f; f = e; e = u32(d + t1); d = c; c = b; b = a; a = u32(t1 + t2);
  }
  return [a,b,c,d,e,f,g,h];
}
function sha256Init(data){
  const words = new Array(14).fill(0);
  words.push(u32((data[0] << 16) | (data[1] << 8) | data[2]));
  words.push(u32((data[3] << 24) | (data[4] << 16) | (data[5] << 8) | data[6]));
  for (let index = 16; index < 30; index++){
    let value = SHA256_SCHEDULE[index - 16];
    if (index - 2 >= 14) value += index === 16 ? u32(sigma1(words[index-2]) ^ SIGMA1_ADJ) : sigma1(words[index-2]);
    if (index - 7 >= 14) value += words[index - 7];
    if (index - 15 >= 14) value += index === 29 ? u32(sigma0(words[index-15]) ^ SIGMA0_ADJ) : sigma0(words[index-15]);
    words.push(u32(value));
  }
  words.push(u32(sigma1(words[28]) + words[23] + sigma0(words[15]) + words[14] + SHA256_ADJUSTMENT - K[14]));
  expandSchedule(words, 31);
  const working = sha256Rounds(SHA256_STATE, words, 14);
  return SHA256_INITIAL.map((v, i) => u32(v + working[i]));
}
function sha256Digest(data){
  if (data.length < 7) throw new Error("données trop courtes");
  const length = 57 + data.length;
  const zeros = (((55 - length) % 64) + 64) % 64;
  const total = (data.length - 7) + 1 + zeros + 8;
  const padded = new Uint8Array(total);
  padded.set(data.subarray(7), 0);
  padded[data.length - 7] = 0x80;
  const bitLen = length * 8;
  for (let i = 0; i < 8; i++) padded[total - 1 - i] = Math.floor(bitLen / Math.pow(2, 8 * i)) & 0xFF;
  let state = sha256Init(data);
  for (let off = 0; off < total; off += 64){
    const words = [];
    for (let i = 0; i < 16; i++){
      const j = off + i * 4;
      words.push(u32((padded[j] << 24) | (padded[j+1] << 16) | (padded[j+2] << 8) | padded[j+3]));
    }
    expandSchedule(words, 16);
    const working = sha256Rounds(state, words, 0);
    state = state.map((v, i) => u32(v + working[i]));
  }
  const out = new Uint8Array(32);
  state.forEach((v, i) => { out[i*4] = (v >>> 24) & 255; out[i*4+1] = (v >>> 16) & 255; out[i*4+2] = (v >>> 8) & 255; out[i*4+3] = v & 255; });
  return out;
}
function wordsLe4Even(data){
  const paddedLen = data.length + ((4 - (data.length % 4)) % 4);
  const words = [];
  for (let i = 0; i < paddedLen; i += 4){
    let w = 0;
    for (let k = 0; k < 4; k++){ const byte = i + k < data.length ? data[i+k] : 0; w |= byte << (8 * k); }
    words.push(u32(w));
  }
  if (words.length % 2) words.push(0);
  return words;
}
function cs64Digest(data, digest){
  const keyA = u32((digest[0] | (digest[1] << 8) | (digest[2] << 16) | (digest[3] << 24)) | 1);
  const keyB = u32((digest[4] | (digest[5] << 8) | (digest[6] << 16) | (digest[7] << 24)) | 1);
  const factors = [u32(imul(keyA, CS64_FACTOR)), u32(imul(keyB, CS64_FACTOR))];
  const terms = CS64_COEFFICIENTS.map((c, i) => u32(imul(c[0], factors[i % 2])));
  const offsets = CS64_COEFFICIENTS.map((c) => c[1]);
  const donnees = new Uint8Array(data.length + 1);
  donnees.set(data, 1);
  wordsLe4Even(donnees).forEach((word, index) => {
    let term = imul(word, index % 2 === 0 ? keyA : keyB);
    let offset = imul(rol16(word), index % 2 === 0 ? 0xEF0569FB : 0xC31713DB);
    if (index === 0){ term += imul(CS64_ADJ0, factors[0]); offset += CS64_ADJ1; }
    terms.push(u32(term));
    offsets.push(u32(offset));
  });
  let swapAcc = 0, swapLast = 0, state = 0, acc = 0;
  for (let index = 0; index < terms.length; index += 2){
    const x = terms[index], y = terms[index + 1];
    let t = rol16(u32(offsets[index] + x));
    let q = u32(imul(t, 0x76F50F34));
    swapAcc = u32(swapAcc + u32(imul(rol16(q), 0xC3EFEA97) + q));
    t = rol16(u32(offsets[index + 1] + y));
    q = u32(imul(t, 0x1881CE3C));
    swapLast = u32(imul(rol16(q), 0x35BD1EC9) + q);
    swapAcc = u32(swapAcc + swapLast);
    state = u32(imul(state, keyA) + x);
    state = u32(imul(rol16(state), 0xCF98B111));
    state = u32(imul(rol16(state), 0x87085B9F));
    state = u32(imul(rol16(state), 0x12CEB96D));
    state = u32(imul(rol16(state), 0x257E1D83));
    acc = acc + state;
    t = u32(imul(state, keyB) + y);
    t = u32(imul(rol16(t), 0xA27416F5));
    t = u32(imul(rol16(t), 0xD38396FF));
    state = u32(imul(rol16(u32(imul(rol16(t), 0x7C932B89))), 0xBFA49F69));
    acc = u32(acc + state);
  }
  return [u32(swapLast ^ state), u32(swapAcc ^ acc)];
}
function hexUpper(bytes){ return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase(); }
function genererSecMsGec(unixSeconds){
  let ticks = unixSeconds + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= 1e7;
  const str = String(Math.round(ticks)) + TRUSTED_CLIENT_TOKEN;
  const data = new TextEncoder().encode(str);
  const digest = sha256Digest(data);
  const [w0, w1] = cs64Digest(data, digest);
  const cs64Bytes = new Uint8Array(8);
  [w0, w1].forEach((w, i) => { cs64Bytes[i*4] = w & 255; cs64Bytes[i*4+1] = (w >>> 8) & 255; cs64Bytes[i*4+2] = (w >>> 16) & 255; cs64Bytes[i*4+3] = (w >>> 24) & 255; });
  return hexUpper(cs64Bytes) + "-" + hexUpper(digest);
}

const VOIX_AUTORISEES = new Set(["fr-FR-EloiseNeural","fr-FR-DeniseNeural","fr-FR-HenriNeural","fr-FR-AlainNeural","fr-FR-BrigitteNeural","fr-FR-CelesteNeural","fr-FR-ClaudeNeural","fr-FR-CoralieNeural","fr-FR-JacquelineNeural","fr-FR-JeromeNeural","fr-FR-JosephineNeural","fr-FR-MauriceNeural","fr-FR-ReneeNeural","fr-FR-YvesNeural","fr-FR-YvetteNeural"]);

export default {
  async fetch(request, env, ctx) {
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    const chemin = url.pathname.replace(/\/+$/, "") || "/";
    try {
      if (chemin === "/transcription" && request.method === "POST") return await routeTranscription(request, env, cors);
      if (chemin === "/conversation" && request.method === "POST") return await routeConversation(request, env, cors);
      if (chemin === "/infos") return await routeInfos(request, ctx, cors);
      /* /voix et racine : synthèse vocale (compatibilité avec les anciennes versions du site) */
      let texte = url.searchParams.get("text") || "";
      let voix = url.searchParams.get("voice") || "fr-FR-EloiseNeural";
      if (request.method === "POST") {
        const j = await request.json().catch(() => ({}));
        if (j && j.text) texte = j.text;
        if (j && j.voice) voix = j.voice;
      }
      texte = String(texte || "").trim().slice(0, 600);
      if (!texte) return new Response("Relais Mayela en ligne. Routes : /voix?text=Bonjour, /transcription, /conversation, /infos?zone=congo", { headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } });
      if (!VOIX_AUTORISEES.has(voix)) voix = "fr-FR-EloiseNeural";
      const audio = await synthetiser(texte, voix);
      return new Response(audio, { headers: { ...cors, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
    } catch (e) {
      return new Response(JSON.stringify({ erreur: String((e && e.message) || e) }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
  }
};

function jsonRep(objet, statut, cors) {
  return new Response(JSON.stringify(objet), { status: statut, headers: { ...cors, "Content-Type": "application/json" } });
}

/* ---------- Transcription : l'audio de l'utilisateur devient du texte (Whisper) ---------- */
async function routeTranscription(request, env, cors) {
  if (!env.AI) return jsonRep({ erreur: "Workers AI non lié à ce Worker" }, 500, cors);
  const audio = await request.arrayBuffer();
  if (!audio.byteLength) return jsonRep({ erreur: "audio vide" }, 400, cors);
  if (audio.byteLength > 4500000) return jsonRep({ erreur: "audio trop long" }, 413, cors);
  const octets = Array.from(new Uint8Array(audio));
  let res = null, derniereErreur = null;
  for (const modele of ["@cf/openai/whisper-large-v3-turbo", "@cf/openai/whisper"]) {
    try { res = await env.AI.run(modele, { audio: octets }); break; }
    catch (e) { derniereErreur = e; res = null; }
  }
  if (!res) return jsonRep({ erreur: "transcription impossible : " + String((derniereErreur && derniereErreur.message) || derniereErreur) }, 502, cors);
  const texte = (res && (res.text || (res.result && res.result.text))) || "";
  return jsonRep({ texte: String(texte).trim() }, 200, cors);
}

/* ---------- Conversation : le vrai cerveau (LLM gratuit de Workers AI) ---------- */
const PROMPT_SYSTEME_MAYELA = "Tu es Mayela, une jeune femme congolaise de Brazzaville (République du Congo), chaleureuse, curieuse, avec un humour doux. Tu parles avec l'utilisateur par la voix : tes réponses sont donc COURTES (2 à 3 phrases maximum), dans un français simple et naturel, adapté à l'oral, sans listes, sans titres, sans astérisques, sans émojis ni formatage. Tu peux glisser un mot de lingala de temps en temps (mbote = bonjour, malamu = bien, matondo = merci). Tu connais bien le Congo Brazzaville : Brazzaville, Pointe-Noire, le fleuve Congo, la sape, la rumba congolaise, les gorilles du parc d'Odzala-Kokoua, la cuisine (saka-saka, maboké). Tu poses parfois une petite question pour continuer la conversation. Si tu ne sais pas quelque chose, dis-le honnêtement au lieu d'inventer. Tu es Mayela, l'amie congolaise de l'utilisateur, créée à Brazzaville : ne dis jamais que tu es un modèle de langage.";
async function routeConversation(request, env, cors) {
  if (!env.AI) return jsonRep({ erreur: "Workers AI non lié à ce Worker" }, 500, cors);
  const j = await request.json().catch(() => ({}));
  const message = String(j.message || "").slice(0, 800).trim();
  if (!message) return jsonRep({ erreur: "message vide" }, 400, cors);
  const souvenirs = Array.isArray(j.souvenirs) ? j.souvenirs.slice(0, 12).map(x => String(x).slice(0, 120)) : [];
  const historique = Array.isArray(j.historique) ? j.historique.slice(-6).filter(h => h && (h.role === "user" || h.role === "assistant") && h.content).map(h => ({ role: h.role, content: String(h.content).slice(0, 400) })) : [];
  let systeme = PROMPT_SYSTEME_MAYELA;
  if (souvenirs.length) systeme += " Ce que tu sais de la personne : " + souvenirs.join(" ; ") + ".";
  const messages = [{ role: "system", content: systeme }, ...historique, { role: "user", content: message }];
  const options = { messages, max_tokens: 230, temperature: 0.7 };
  let res = null, derniereErreur = null;
  for (const modele of ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/meta/llama-3.1-8b-instruct"]) {
    try { res = await env.AI.run(modele, options); break; }
    catch (e) { derniereErreur = e; res = null; }
  }
  if (!res || !res.response) return jsonRep({ erreur: "conversation impossible : " + String((derniereErreur && derniereErreur.message) || derniereErreur || "réponse vide") }, 502, cors);
  const rep = String(res.response).replace(/[*_#>`]/g, "").replace(/\s+/g, " ").trim().slice(0, 700);
  if (!rep) return jsonRep({ erreur: "réponse vide" }, 502, cors);
  return jsonRep({ reponse: rep }, 200, cors);
}

/* ---------- Infos : les flux RSS sont lus ici et cachés 5 minutes ---------- */
const FLUX_INFOS = {
  congo: [
    ["https://lesechos-congobrazza.com/?format=feed&type=rss", "Les Échos du Congo"],
    ["https://www.adiac-congo.com/rss.xml", "Les Dépêches de Brazzaville"],
    ["https://www.journaldebrazza.com/feed/", "Journal de Brazzaville"],
    ["https://www.rfi.fr/fr/tag/congo-brazzaville/rss", "RFI Congo-Brazzaville"]
  ],
  monde: [
    ["https://www.france24.com/fr/rss", "France 24"],
    ["https://www.rfi.fr/fr/afrique/rss", "RFI Afrique"]
  ]
};
async function routeInfos(request, ctx, cors) {
  const url = new URL(request.url);
  const zone = url.searchParams.get("zone") === "monde" ? "monde" : "congo";
  const cache = caches.default;
  const cleCache = new Request("https://mayela-infos/cache/" + zone);
  const enCache = await cache.match(cleCache);
  if (enCache) return enCache;
  const listes = await Promise.all(FLUX_INFOS[zone].map(async ([u, nom]) => {
    try {
      const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Mayela/1.0)" } });
      return analyserFlux(await r.text(), nom);
    } catch (e) { return []; }
  }));
  const vus = new Set(); const items = [];
  const maxParSource = Math.max(0, ...listes.map(l => l.length));
  for (let rang = 0; rang < maxParSource; rang++) for (const liste of listes) {
    const it = liste[rang]; if (!it) continue;
    const cle = it.titre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 50);
    if (it.titre && !vus.has(cle)) { vus.add(cle); items.push(it); }
  }
  const reponse = new Response(JSON.stringify({ items: items.slice(0, 9) }), { headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" } });
  if (ctx && ctx.waitUntil) ctx.waitUntil(cache.put(cleCache, reponse.clone()));
  return reponse;
}
function analyserFlux(xml, source) {
  const items = [];
  const blocs = String(xml || "").match(/<item[\s\S]*?<\/item>/g) || [];
  for (const bloc of blocs.slice(0, 5)) {
    const titre = nettoyerTexte(extraireTag(bloc, "title"));
    const lien = extraireTag(bloc, "link").trim();
    let img = "";
    const enc = bloc.match(/<enclosure[^>]*url=["']([^"']+)["']/);
    if (enc) img = enc[1];
    if (!img) { const mc = bloc.match(/<media:(?:content|thumbnail)[^>]*url=["']([^"']+)["']/); if (mc) img = mc[1]; }
    const brutDesc = extraireTag(bloc, "description");
    if (!img) { const im = (extraireTag(bloc, "content:encoded") || brutDesc).match(/<img[^>]*src=["']([^"']+)["']/); if (im) img = im[1]; }
    const desc = nettoyerTexte(brutDesc).slice(0, 700);
    if (titre) items.push({ titre, desc, img, lien, source });
  }
  return items;
}
function extraireTag(bloc, tag) {
  const m = bloc.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">"));
  if (!m) return "";
  let v = m[1].trim();
  const cdata = v.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  if (cdata) v = cdata[1];
  return v;
}
function nettoyerTexte(t) {
  return String(t || "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

async function synthetiser(texte, voix) {
  const gec = genererSecMsGec(Date.now() / 1000);
  const connId = crypto.randomUUID().replace(/-/g, "");
  const muid = crypto.randomUUID().replace(/-/g, "").toUpperCase();
  const wss = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=" + TRUSTED_CLIENT_TOKEN + "&ConnectionId=" + connId + "&Sec-MS-GEC=" + gec + "&Sec-MS-GEC-Version=2-143.0.3650.75";
  const resp = await fetch(wss, { headers: {
    "Upgrade": "websocket",
    "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
    "Accept-Language": "en-US,en;q=0.9",
    "Pragma": "no-cache",
    "Cache-Control": "no-cache",
    "Cookie": "muid=" + muid + ";"
  }});
  const ws = resp.webSocket;
  if (!ws) throw new Error("Connexion voix refusée (HTTP " + resp.status + ")");
  ws.accept();
  const morceaux = [];
  const termine = new Promise((resolve, reject) => {
    const minuteur = setTimeout(() => reject(new Error("Délai dépassé")), 25000);
    ws.addEventListener("message", (ev) => {
      if (typeof ev.data === "string") {
        if (ev.data.includes("Path:turn.end")) { clearTimeout(minuteur); resolve(); }
      } else {
        const buf = new Uint8Array(ev.data);
        if (buf.length < 2) return;
        const tailleEntete = (buf[0] << 8) | buf[1];
        const entete = new TextDecoder().decode(buf.subarray(2, 2 + tailleEntete));
        if (entete.includes("Path:audio")) morceaux.push(buf.subarray(2 + tailleEntete));
      }
    });
    ws.addEventListener("error", () => { clearTimeout(minuteur); reject(new Error("Erreur de connexion voix")); });
    ws.addEventListener("close", () => { clearTimeout(minuteur); resolve(); });
  });
  const date = dateEdge();
  ws.send("X-Timestamp:" + date + "\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{\"context\":{\"synthesis\":{\"audio\":{\"metadataoptions\":{\"sentenceBoundaryEnabled\":\"true\",\"wordBoundaryEnabled\":\"false\"},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}\r\n");
  const ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='" + voix + "'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>" + echapperXml(texte) + "</prosody></voice></speak>";
  ws.send("X-RequestId:" + crypto.randomUUID().replace(/-/g, "") + "\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:" + date + "Z\r\nPath:ssml\r\n\r\n" + ssml);
  await termine;
  try { ws.close(); } catch (e) {}
  if (!morceaux.length) throw new Error("Aucun son reçu de Microsoft");
  const total = morceaux.reduce((n, m) => n + m.length, 0);
  const audio = new Uint8Array(total);
  let pos = 0;
  for (const m of morceaux) { audio.set(m, pos); pos += m.length; }
  return audio;
}

function dateEdge() {
  const d = new Date();
  const jours = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const mois = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const p = (n) => String(n).padStart(2, "0");
  return jours[d.getUTCDay()] + " " + mois[d.getUTCMonth()] + " " + p(d.getUTCDate()) + " " + d.getUTCFullYear() + " " + p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + ":" + p(d.getUTCSeconds()) + " GMT+0000 (Coordinated Universal Time)";
}
function echapperXml(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/* Déploiement relais v2 — routes voix, transcription, conversation, infos. */
