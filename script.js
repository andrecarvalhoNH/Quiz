let questions = [];
let quiz = [];
let current = 0;
let score = 0;
let selected = null;
const LS_KEY = "nutrihouse-ranking";

const statusEl = document.getElementById("status");
const quizEl = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const progressEl = document.getElementById("progress");
const confirmBtn = document.getElementById("confirm");
const nextBtn = document.getElementById("next");
const resultEl = document.getElementById("result");
const scoreText = document.getElementById("scoreText");
const nameInput = document.getElementById("nameInput");
const saveScoreBtn = document.getElementById("saveScore");
const playAgainBtn = document.getElementById("playAgain");
const rankingEl = document.getElementById("ranking");
const rankingList = document.getElementById("rankingList");
const resetRankingBtn = document.getElementById("resetRanking");

loadRanking();

async function loadQuestions() {
  try {
    const res = await fetch("assets/Quiz_Comportamento_Seguro_100perguntas.xlsx");
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws);
    questions = json.map(r => ({
      pergunta: r.Pergunta,
      A: r.A,
      B: r.B,
      C: r.C,
      correta: String(r.Correta).trim().toUpperCase()
    })).filter(q => q.pergunta && q.A && q.B && q.C && ["A","B","C"].includes(q.correta));

    statusEl.textContent = `${questions.length} perguntas carregadas.`;
    const startBtn = document.createElement("button");
    startBtn.textContent = "Iniciar Quiz";
    startBtn.onclick = startQuiz;
    statusEl.appendChild(startBtn);
  } catch (err) {
    statusEl.textContent = "Erro ao carregar perguntas.";
    console.error(err);
  }
}

function startQuiz() {
  quiz = shuffle(questions).slice(0, 5);
  current = 0;
  score = 0;
  selected = null;
  statusEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  rankingEl.classList.remove("hidden");
  quizEl.classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  const q = quiz[current];
  questionEl.textContent = q.pergunta;
  progressEl.textContent = `Pergunta ${current + 1} de ${quiz.length}`;
  optionsEl.innerHTML = "";
  ["A", "B", "C"].forEach(k => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.textContent = `${k}) ${q[k]}`;
    btn.onclick = () => selectOption(k, btn);
    optionsEl.appendChild(btn);
  });
  selected = null;
  confirmBtn.disabled = true;
  nextBtn.disabled = true;
}

function selectOption(opt, btn) {
  selected = opt;
  document.querySelectorAll(".option").forEach(el => el.classList.remove("selected"));
  btn.classList.add("selected");
  confirmBtn.disabled = false;
}

confirmBtn.onclick = () => {
  if (!selected) return;
  const q = quiz[current];
  const correct = q.correta;
  document.querySelectorAll(".option").forEach(el => {
    if (el.textContent.startsWith(correct)) el.classList.add("correct");
    if (el.textContent.startsWith(selected) && selected !== correct) el.classList.add("wrong");
    el.style.pointerEvents = "none";
  });
  if (selected === correct) score++;
  confirmBtn.disabled = true;
  nextBtn.disabled = false;
};

nextBtn.onclick = () => {
  current++;
  if (current >= quiz.length) showResult();
  else {
    selected = null;
    showQuestion();
  }
};

function showResult() {
  quizEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  scoreText.textContent = `Você acertou ${score} de ${quiz.length}`;
}

saveScoreBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (!name) return alert("Digite seu nome!");
  const entry = { name, score, date: new Date().toLocaleDateString() };
  const ranking = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  ranking.push(entry);
  ranking.sort((a,b) => b.score - a.score);
  localStorage.setItem(LS_KEY, JSON.stringify(ranking.slice(0,10)));
  loadRanking();
  nameInput.value = "";
};

function loadRanking() {
  const ranking = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  rankingList.innerHTML = "";
  ranking.forEach((r,i) => {
    const li = document.createElement("li");
    li.textContent = `${r.name} — ${r.score} pts (${r.date})`;
    rankingList.appendChild(li);
  });
  rankingEl.classList.remove("hidden");
}

resetRankingBtn.onclick = () => {
  if (confirm("Deseja resetar o ranking?")) {
    localStorage.removeItem(LS_KEY);
    loadRanking();
  }
};

playAgainBtn.onclick = startQuiz;

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

loadQuestions();
