const subjectSelect = document.getElementById("subject");
const mcqRangeInput = document.getElementById("mcq-range");
const startQuizButton = document.getElementById("start-quiz-btn");
const questionElement = document.querySelector(".question");
const answersElement = document.querySelector(".answers");
const nextButton = document.getElementById("next-btn");
const scoreboardElement = document.getElementById("scoreboard");
const userScoreElement = document.getElementById("user-score");
const leaderboardElement = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboard-list");
const usernameInput = document.getElementById("username");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let username = "";

// Function to fetch questions from the Open Trivia Database API
async function fetchQuestions(subject, amount) {
    try {
        const apiUrl = `https://opentdb.com/api.php?amount=${amount}&category=${getCategoryId(subject)}&type=multiple`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        questions = data.results.map((questionObj) => {
            return {
                question: questionObj.question,
                answers: shuffleAnswers([
                    questionObj.correct_answer,
                    ...questionObj.incorrect_answers,
                ]),
                correct: questionObj.correct_answer,
            };
        });
        loadQuestion();
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

// Helper function to get category ID based on the selected subject
function getCategoryId(subject) {
    const categoryMap = {
        "c++": 18,
        "java": 19,
        "javascript": 20,
    };
    return categoryMap[subject] || 18;
}

// Helper function to shuffle the answers array
function shuffleAnswers(answers) {
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
}

function loadQuestion() {
    resetState();
    if (questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        questionElement.innerHTML = currentQuestion.question;

        currentQuestion.answers.forEach((answer) => {
            const button = document.createElement("button");
            button.textContent = answer;
            button.classList.add("btn");
            button.addEventListener("click", selectAnswer);
            answersElement.appendChild(button);
        });
    } else {
        questionElement.textContent = "No questions available. Please try again later.";
    }
}

function resetState() {
    nextButton.disabled = true;
    answersElement.innerHTML = "";
}

function selectAnswer(event) {
    const selectedAnswer = event.target.textContent;
    const correctAnswer = questions[currentQuestionIndex].correct;

    if (selectedAnswer === correctAnswer) {
        score++;
    }

    Array.from(answersElement.children).forEach((button) => {
        button.disabled = true;
    });

    nextButton.disabled = false;
}

function showScore() {
    document.getElementById("quiz").classList.add("hidden");
    scoreboardElement.classList.remove("hidden");
    userScoreElement.textContent = `${username}, Your Score: ${score}`;
    updateLeaderboard();
}

function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    scores.push({ username, score });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(scores));

    leaderboardList.innerHTML = scores
        .map((entry) => `<li>${entry.username}: <span>${entry.score}</span></li>`)
        .join("");
    leaderboardElement.classList.remove("hidden");
}

startQuizButton.addEventListener("click", () => {
    username = usernameInput.value.trim();
    if (!username) {
        alert("Please enter your name!");
        return;
    }
    const subject = subjectSelect.value;
    const amount = parseInt(mcqRangeInput.value, 10);
    score = 0;
    currentQuestionIndex = 0;
    scoreboardElement.classList.add("hidden");
    leaderboardElement.classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");
    fetchQuestions(subject, amount);
});

nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showScore();
    }
});

document.getElementById("restart-btn").addEventListener("click", () => {
    currentQuestionIndex = 0;
    score = 0;
    scoreboardElement.classList.add("hidden");
    leaderboardElement.classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");
    fetchQuestions(subjectSelect.value, parseInt(mcqRangeInput.value, 10));
});
