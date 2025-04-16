// Estado da aplicação
const state = {
  questions: [],
  filteredQuestions: [],
  currentIndex: 0,
  activeFilters: {
    subject: 'all',
    year: 'all'
  }
};

// Elementos do DOM
const DOM = {
  subjectSelect: document.getElementById('subject'),
  yearSelect: document.getElementById('year'),
  applyFiltersBtn: document.getElementById('apply-filters'),
  questionSubject: document.getElementById('question-subject'),
  questionText: document.getElementById('question-text'),
  itemsContainer: document.getElementById('items-container'),
  prevBtn: document.getElementById('prev-item'),
  nextBtn: document.getElementById('next-item'),
  itemCounter: document.getElementById('item-counter'),
  errorBox: document.getElementById('error-message'),
  loadingIndicator: document.getElementById('loading-indicator'),
  currentYear: document.getElementById('current-year')
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  // Atualiza ano no footer
  DOM.currentYear.textContent = new Date().getFullYear();

  try {
    showLoading();
    await loadQuestions();
    populateYearFilter();
    hideLoading();
  } catch (error) {
    showError(`Erro ao carregar questões: ${error.message}`);
    hideLoading();
  }

  // Event listeners
  DOM.applyFiltersBtn.addEventListener('click', applyFilters);
  DOM.prevBtn.addEventListener('click', () => navigateQuestion(-1));
  DOM.nextBtn.addEventListener('click', () => navigateQuestion(1));
});

// Carrega questões do JSON
async function loadQuestions() {
  try {
    const response = await fetch('questions/questions.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    validateQuestions(data.questions);
    
    state.questions = data.questions;
    state.filteredQuestions = data.questions;
  } catch (error) {
    throw new Error(`Falha ao carregar questões: ${error.message}`);
  }
}

// Valida estrutura das questões
function validateQuestions(questions) {
  if (!Array.isArray(questions)) {
    throw new Error('Formato inválido: questions deve ser um array');
  }

  questions.forEach((q, i) => {
    if (!q.id || !q.year || !q.subject || !q.question || !q.items) {
      throw new Error(`Questão ${i + 1} está incompleta ou mal formatada`);
    }

    if (!Array.isArray(q.items)) {
      throw new Error(`Itens da questão ${q.id} devem ser um array`);
    }
  });
}

/**
 * Preenche os filtros de ano e matéria com base nas questões disponíveis
 */
function populateYearFilter() {
  const yearSelect = document.getElementById('year');
  const subjectSelect = document.getElementById('subject');
  
  // Limpa e mantém a primeira opção
  yearSelect.innerHTML = '<option value="all">Todos</option>';
  subjectSelect.innerHTML = '<option value="all">Todas</option>';
  
  // Obtém valores únicos
  const years = [...new Set(state.questions.map(q => q.year))].sort((a, b) => b - a);
  const subjects = [...new Set(state.questions.map(q => q.subject))].sort();

  // Preenche anos (mantendo o nome original da função por compatibilidade)
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  // Adiciona o preenchimento de matérias (novo)
  subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject;
    option.textContent = subject;
    subjectSelect.appendChild(option);
  });
}

// E no evento DOMContentLoaded, substitua a chamada para populateYearFilter por:
document.addEventListener('DOMContentLoaded', async () => {
  // ... código existente ...
  
  try {
    showLoading();
    await loadQuestions();
    populateYearFilter(); // Continua chamando com o mesmo nome
    hideLoading();
  } catch (error) {
    showError(`Erro ao carregar questões: ${error.message}`);
    hideLoading();
  }
  
  // ... resto do código ...
  });
  
// Aplica filtros
function applyFilters() {
  state.activeFilters = {
    subject: DOM.subjectSelect.value,
    year: DOM.yearSelect.value
  };

  state.filteredQuestions = state.questions.filter(q =>
    (state.activeFilters.subject === 'all' || q.subject === state.activeFilters.subject) &&
    (state.activeFilters.year === 'all' || q.year == state.activeFilters.year)
  );

  if (state.filteredQuestions.length === 0) {
    showError('Nenhuma questão encontrada com os filtros selecionados.');
    return;
  }

  state.currentIndex = 0;
  hideError();
  renderQuestion();
}

// Renderiza questão atual
function renderQuestion() {
  if (state.filteredQuestions.length === 0) return;

  const question = state.filteredQuestions[state.currentIndex];
  DOM.questionSubject.textContent = `${question.subject} — ${question.year}`;
  DOM.questionText.innerHTML = question.question;

  // Renderiza KaTeX após atualizar o conteúdo
  setTimeout(() => {
    renderMathInElement(DOM.questionText, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });
  }, 0);

  renderItems(question.items);
  updateCounter();
}

// Renderiza itens da questão
function renderItems(items) {
  DOM.itemsContainer.innerHTML = items.map(item => `
    <div class="item-card" data-item-id="${item.number}">
      <div class="item-statement">${item.statement}</div>
      <div class="answer-buttons">
        <button class="btn-true" onclick="checkAnswer(true, ${item.number}, this.parentElement.parentElement)">
          Verdadeiro
        </button>
        <button class="btn-false" onclick="checkAnswer(false, ${item.number}, this.parentElement.parentElement)">
          Falso
        </button>
      </div>
    </div>
  `).join('');

  // Renderiza KaTeX nos itens
  setTimeout(() => {
    renderMathInElement(DOM.itemsContainer, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });
  }, 0);
}

// Verifica resposta do usuário
function checkAnswer(userAnswer, itemNumber, cardElement) {
  const question = state.filteredQuestions[state.currentIndex];
  const item = question.items.find(i => i.number === itemNumber);
  
  if (!item) return;

  const isCorrect = (userAnswer ? 'V' : 'F') === item.answer;
  
  cardElement.classList.add(isCorrect ? 'correct' : 'incorrect');
  cardElement.querySelector('.answer-buttons').remove();
  
  const explanation = document.createElement('div');
  explanation.className = 'explanation';
  explanation.textContent = item.explanation;
  cardElement.appendChild(explanation);
}

// Navega entre questões
function navigateQuestion(direction) {
  if (state.filteredQuestions.length === 0) return;

  state.currentIndex += direction;

  if (state.currentIndex < 0) {
    state.currentIndex = state.filteredQuestions.length - 1;
  } else if (state.currentIndex >= state.filteredQuestions.length) {
    state.currentIndex = 0;
  }

  renderQuestion();
}

// Atualiza contador
function updateCounter() {
  DOM.itemCounter.textContent = 
    `Questão ${state.currentIndex + 1} de ${state.filteredQuestions.length}`;
}

// Mostra erro
function showError(message) {
  DOM.errorBox.style.display = 'block';
  DOM.errorBox.innerHTML = `<strong>Erro:</strong> ${message}`;
}

// Esconde erro
function hideError() {
  DOM.errorBox.style.display = 'none';
}

// Mostra loading
function showLoading() {
  DOM.loadingIndicator.style.display = 'flex';
}

// Esconde loading
function hideLoading() {
  DOM.loadingIndicator.style.display = 'none';
}
