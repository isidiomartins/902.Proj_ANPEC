let questionsData = [];
let currentQuestionIndex = 0;
let currentItemIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  fetch('questions/questions.json')
    .then(response => response.json())
    .then(data => {
      questionsData = data.questions;
      populateYearFilter();
    })
    .catch(error => showError(`Erro ao carregar questões: ${error.message}`));

  document.getElementById('apply-filters').addEventListener('click', applyFilters);
  document.getElementById('prev-item').addEventListener('click', () => navigateItem(-1));
  document.getElementById('next-item').addEventListener('click', () => navigateItem(1));
});

function populateYearFilter() {
  const yearSelect = document.getElementById('year');
  const years = [...new Set(questionsData.map(q => q.year))].sort((a, b) => b - a);
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
}

function applyFilters() {
  const subject = document.getElementById('subject').value;
  const year = document.getElementById('year').value;

  const filtered = questionsData.filter(q =>
    (subject === 'all' || q.subject === subject) &&
    (year === 'all' || q.year == year)
  );

  if (filtered.length === 0) {
    showError('Nenhuma questão encontrada com os filtros selecionados.');
    return;
  }

  hideError();
  currentQuestionIndex = 0;
  loadQuestion(filtered);
}

function loadQuestion(filteredQuestions) {
  const question = filteredQuestions[currentQuestionIndex];
  document.getElementById('question-subject').textContent = `${question.subject} — ${question.year}`;
  document.getElementById('question-text').innerHTML = question.question;

  const container = document.getElementById('items-container');
  container.innerHTML = '';

  question.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';

    const statement = document.createElement('div');
    statement.className = 'item-statement';
    statement.innerHTML = item.statement;

    const buttons = document.createElement('div');
    buttons.className = 'answer-buttons';

    const trueBtn = document.createElement('button');
    trueBtn.className = 'btn-true';
    trueBtn.textContent = 'Verdadeiro';
    trueBtn.onclick = () => checkAnswer(true, item, card);

    const falseBtn = document.createElement('button');
    falseBtn.className = 'btn-false';
    falseBtn.textContent = 'Falso';
    falseBtn.onclick = () => checkAnswer(false, item, card);

    buttons.append(trueBtn, falseBtn);
    card.append(statement, buttons);
    container.appendChild(card);
  });

  document.getElementById('item-counter').textContent = `Questão ${currentQuestionIndex + 1} de ${filteredQuestions.length}`;
}

function checkAnswer(userAnswer, item, card) {
  const isCorrect = (userAnswer ? 'V' : 'F') === item.answer;
  card.classList.add(isCorrect ? 'correct' : 'incorrect');

  const explanation = document.createElement('div');
  explanation.className = 'explanation';
  explanation.textContent = item.explanation;

  card.querySelector('.answer-buttons').remove();
  card.appendChild(explanation);
}

function navigateItem(direction) {
  const subject = document.getElementById('subject').value;
  const year = document.getElementById('year').value;

  const filtered = questionsData.filter(q =>
    (subject === 'all' || q.subject === subject) &&
    (year === 'all' || q.year == year)
  );

  if (filtered.length === 0) return;

  currentQuestionIndex += direction;

  if (currentQuestionIndex < 0) currentQuestionIndex = filtered.length - 1;
  if (currentQuestionIndex >= filtered.length) currentQuestionIndex = 0;

  loadQuestion(filtered);
}

function showError(message) {
  const errorBox = document.getElementById('error-message');
  errorBox.style.display = 'block';
  errorBox.innerHTML = `<strong>Erro:</strong> ${message}`;
}

function hideError() {
  const errorBox = document.getElementById('error-message');
  errorBox.style.display = 'none';
}
