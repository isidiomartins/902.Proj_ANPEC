let currentQuestion = null;
let currentItemIndex = 0;
let userAnswers = {};

document.addEventListener('DOMContentLoaded', function() {
  // Garante que o DOM está completamente carregado
  setTimeout(() => {
    fetchQuestions();
    document.getElementById('prev-item').addEventListener('click', prevItem);
    document.getElementById('next-item').addEventListener('click', nextItem);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    populateYearFilter();
  }, 100);
});

async function fetchQuestions() {
  try {
    // Caminho corrigido para o JSON (relativo ao arquivo HTML)
    const response = await fetch('./questions/questions.json');
    if (!response.ok) throw new Error('Erro ao carregar arquivo');
    
    const data = await response.json();
    if (!data.questions || data.questions.length === 0) throw new Error('Nenhuma questão encontrada');
    
    currentQuestion = data.questions[0];
    displayQuestion();
    
    // Debug: verifica se a questão foi carregada
    console.log('Questão carregada:', currentQuestion);
  } catch (error) {
    console.error('Erro:', error);
    document.getElementById('question-container').innerHTML = `
      <div class="error">
        <p>Erro ao carregar questões. Verifique:</p>
        <ul>
          <li>O arquivo questions.json existe na pasta /questions?</li>
          <li>O servidor está rodando localmente?</li>
        </ul>
        <p>Detalhes: ${error.message}</p>
      </div>
    `;
  }
}

function displayQuestion() {
  document.getElementById('question-subject').textContent = 
    `${currentQuestion.subject} (${currentQuestion.year}) - Questão #${currentQuestion.id}`;
  
  document.getElementById('question-text').innerHTML = currentQuestion.question;
  displayCurrentItem();
}

function displayCurrentItem() {
  const container = document.getElementById('items-container');
  container.innerHTML = '';
  
  const item = currentQuestion.items[currentItemIndex];
  
  const itemElement = document.createElement('div');
  itemElement.className = 'item-card';
  itemElement.innerHTML = `
    <div class="item-statement">${item.statement}</div>
    <div class="answer-buttons">
      <button class="btn-true ${getButtonClass('V', item.answer)}">Verdadeiro</button>
      <button class="btn-false ${getButtonClass('F', item.answer)}">Falso</button>
    </div>
    ${userAnswers[currentItemIndex] ? `<div class="explanation">${item.explanation}</div>` : ''}
  `;
  
  itemElement.querySelector('.btn-true').addEventListener('click', () => checkAnswer('V', item.answer, item.explanation));
  itemElement.querySelector('.btn-false').addEventListener('click', () => checkAnswer('F', item.answer, item.explanation));
  
  container.appendChild(itemElement);
  updateCounter();
  renderMathInElement(container); // Renderiza equações matemáticas
}

function getButtonClass(userAnswer, correctAnswer) {
  if (userAnswers[currentItemIndex] === userAnswer) {
    return correctAnswer === userAnswer ? 'correct' : 'incorrect';
  }
  return '';
}

function checkAnswer(userAnswer, correctAnswer, explanation) {
  userAnswers[currentItemIndex] = userAnswer;
  displayCurrentItem(); // Atualiza a visualização
}

function prevItem() {
  if (currentItemIndex > 0) {
    currentItemIndex--;
    displayCurrentItem();
  }
}

function nextItem() {
  if (currentItemIndex < currentQuestion.items.length - 1) {
    currentItemIndex++;
    displayCurrentItem();
  }
}

function updateCounter() {
  document.getElementById('item-counter').textContent = 
    `Item ${currentItemIndex + 1}/${currentQuestion.items.length}`;
}

function populateYearFilter() {
  const yearSelect = document.getElementById('year');
  yearSelect.innerHTML = '<option value="all">Todos</option>';
  
  for (let year = 2024; year >= 1993; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
}

function applyFilters() {
  const subject = document.getElementById('subject').value;
  const year = document.getElementById('year').value;
  
  // Simulação de filtro (substitua pela lógica real quando tiver mais questões)
  if (subject !== 'all' || year !== 'all') {
    alert("Filtro aplicado! Lógica completa será implementada com mais questões no banco de dados.");
  }
  
  // Reinicia a navegação
  currentItemIndex = 0;
  userAnswers = {};
  displayCurrentItem();
}