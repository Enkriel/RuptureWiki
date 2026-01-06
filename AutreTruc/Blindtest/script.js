let data = [];
let currentQuestion = 0;
let difficultyIndex = 0; // 0 = dur, 1 = moyen, 2 = facile
let score = 0;

const difficulties = [
    { name: "dur", points: 3, label: "Passer en moyen (2 pts)" },
    { name: "moyen", points: 2, label: "Passer en facile (1 pt)" },
    { name: "facile", points: 1, label: "Skip" }
];

// Chargement du JSON
fetch("musiques.json")
    .then(response => response.json())
    .then(json => {
        data = json;
        loadQuestion();
    })
    .catch(err => console.error("Erreur chargement JSON", err));

// Prépare une question (DUR chargé mais non joué)
function loadQuestion() {
    difficultyIndex = 0;

    const audio = document.getElementById("audio");
    audio.src = data[currentQuestion].dur;
    audio.pause();
    audio.currentTime = 0;

    document.getElementById("difficultyBtn").textContent =
        difficulties[0].label;

    document.getElementById("answer").value = "";
    document.getElementById("feedback").textContent = "";
}

// Bouton Moyen → Facile → Skip
function nextDifficulty() {
    if (difficultyIndex < 2) {
        difficultyIndex++;

        const audio = document.getElementById("audio");
        const diffName = difficulties[difficultyIndex].name;
        audio.src = data[currentQuestion][diffName];
        audio.pause();
        audio.currentTime = 0;

        document.getElementById("difficultyBtn").textContent =
            difficulties[difficultyIndex].label;
    } else {
        nextQuestion(); // Skip
    }
}

// Normalisation texte
function normalize(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Distance de Levenshtein
function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1)
            );
        }
    }
    return matrix[b.length][a.length];
}

// Validation réponse
function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim();
    const correct = data[currentQuestion].reponse;

    // Vérification stricte des chiffres
    const userNumbers = userAnswer.match(/\d+/g);
    const correctNumbers = correct.match(/\d+/g);

    if (JSON.stringify(userNumbers) !== JSON.stringify(correctNumbers)) {
        fail();
        return;
    }

    const distance = levenshtein(
        normalize(userAnswer),
        normalize(correct)
    );

    if (distance <= 3) {
        const points = difficulties[difficultyIndex].points;
        score += points;

        document.getElementById("score").textContent = score;
        document.getElementById("feedback").textContent =
            `Bonne réponse ! +${points} points`;

        nextQuestion();
    } else {
        fail();
    }
}

// Mauvaise réponse
function fail() {
    document.getElementById("feedback").textContent = "Mauvaise réponse";
}

// Question suivante
function nextQuestion() {
    currentQuestion = (currentQuestion + 1) % data.length;
    loadQuestion();
}
