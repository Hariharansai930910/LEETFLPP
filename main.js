// Import the topic loader functions
import { loadTopicProblems, checkTopicExists, topicConfig } from './topic-loader.js';

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const topicSection = document.getElementById('topic-section');
  const topicGrid = document.getElementById('topic-grid');
  const flashcardSection = document.getElementById('flashcard-section');
  const backButton = document.getElementById('back-button');
  const currentTopic = document.getElementById('current-topic');
  const problemCounter = document.getElementById('problem-counter');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  const flashcard = document.getElementById('flashcard');
  
  // State variables
  let selectedTopicId = null;
  let currentProblemIndex = 0;
  let currentProblems = [];

  // Initialize the application
  async function initialize() {
    await populateTopics();

    // Add event listeners
    backButton.addEventListener('click', goBackToTopics);
    prevButton.addEventListener('click', goToPreviousProblem);
    nextButton.addEventListener('click', goToNextProblem);
    
    // Card flipping
    flashcard.addEventListener('click', (e) => {
      // Don't flip when clicking tabs
      if (e.target.closest('button')) return;
      flashcard.classList.toggle('flipped');
    });
    
    // Tab switching - front
    document.getElementById('question-tab').addEventListener('click', () => {
      document.getElementById('question-tab').classList.add('border-blue-500', 'text-blue-600');
      document.getElementById('hint-tab').classList.remove('border-blue-500', 'text-blue-600');
      document.getElementById('question-content').classList.remove('hidden');
      document.getElementById('hint-content').classList.add('hidden');
    });
    
    document.getElementById('hint-tab').addEventListener('click', () => {
      document.getElementById('hint-tab').classList.add('border-blue-500', 'text-blue-600');
      document.getElementById('question-tab').classList.remove('border-blue-500', 'text-blue-600');
      document.getElementById('hint-content').classList.remove('hidden');
      document.getElementById('question-content').classList.add('hidden');
    });
    
    // Tab switching - back
    document.getElementById('one-liner-tab').addEventListener('click', () => {
      document.getElementById('one-liner-tab').classList.add('border-blue-300', 'text-blue-300');
      document.getElementById('three-liner-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('mnemonic-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('code-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('one-liner-content').classList.remove('hidden');
      document.getElementById('three-liner-content').classList.add('hidden');
      document.getElementById('mnemonic-content').classList.add('hidden');
      document.getElementById('code-content').classList.add('hidden');
    });
    
    document.getElementById('three-liner-tab').addEventListener('click', () => {
      document.getElementById('three-liner-tab').classList.add('border-blue-300', 'text-blue-300');
      document.getElementById('one-liner-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('mnemonic-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('code-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('three-liner-content').classList.remove('hidden');
      document.getElementById('one-liner-content').classList.add('hidden');
      document.getElementById('mnemonic-content').classList.add('hidden');
      document.getElementById('code-content').classList.add('hidden');
    });
    
    document.getElementById('mnemonic-tab').addEventListener('click', () => {
      document.getElementById('mnemonic-tab').classList.add('border-blue-300', 'text-blue-300');
      document.getElementById('one-liner-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('three-liner-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('code-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('mnemonic-content').classList.remove('hidden');
      document.getElementById('one-liner-content').classList.add('hidden');
      document.getElementById('three-liner-content').classList.add('hidden');
      document.getElementById('code-content').classList.add('hidden');
    });
    
    document.getElementById('code-tab').addEventListener('click', () => {
      document.getElementById('code-tab').classList.add('border-blue-300', 'text-blue-300');
      document.getElementById('one-liner-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('three-liner-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('mnemonic-tab').classList.remove('border-blue-300', 'text-blue-300');
      document.getElementById('code-content').classList.remove('hidden');
      document.getElementById('one-liner-content').classList.add('hidden');
      document.getElementById('three-liner-content').classList.add('hidden');
      document.getElementById('mnemonic-content').classList.add('hidden');
    });
  }

  // Populate topic grid
  async function populateTopics() {
    console.log("Populating topics...");
    topicGrid.innerHTML = '';
    
    // Create a card for each topic
    for (const topic of topicConfig) {
      const card = document.createElement('div');
      card.className = 'bg-white hover:bg-blue-50 border border-gray-200 rounded-lg p-4 shadow-sm transition-colors';
      card.innerHTML = `
        <h3 class="font-medium text-gray-900">${topic.name}</h3>
        <p class="text-gray-500 text-sm mt-1 problem-count">Loading...</p>
      `;
      
      try {
        // Check if topic exists
        const exists = await checkTopicExists(topic.id);
        if (exists) {
          // Load problem count
          const problems = await loadTopicProblems(topic.id);
          const countElement = card.querySelector('.problem-count');
          const count = problems.length;
          
          countElement.textContent = count > 0 ? `${count} problems` : 'No problems yet';
          
          if (count > 0) {
            card.style.cursor = 'pointer';
            card.dataset.topicId = topic.id;
            card.addEventListener('click', () => selectTopic(topic.id));
          } else {
            card.classList.add('opacity-60');
            card.style.cursor = 'not-allowed';
          }
        } else {
          card.classList.add('opacity-60');
          card.style.cursor = 'not-allowed';
          card.querySelector('.problem-count').textContent = 'Coming soon';
        }
      } catch (error) {
        console.error(`Error loading topic ${topic.id}:`, error);
        card.classList.add('opacity-60');
        card.style.cursor = 'not-allowed';
        card.querySelector('.problem-count').textContent = 'Error loading';
      }
      
      topicGrid.appendChild(card);
    }
  }

  // Select a topic and load its problems
  async function selectTopic(topicId) {
    try {
      // Show loading state
      flashcardSection.classList.add('opacity-50');
      topicSection.classList.add('hidden');
      flashcardSection.classList.remove('hidden');
      
      selectedTopicId = topicId;
      currentProblemIndex = 0;
      
      // Get the topic name
      const topic = topicConfig.find(t => t.id === topicId);
      currentTopic.textContent = topic.name;
      
      // Load the problems
      currentProblems = await loadTopicProblems(topicId);
      
      // Load the first problem
      loadProblem();
      
      // Remove loading state
      flashcardSection.classList.remove('opacity-50');
    } catch (error) {
      console.error("Error selecting topic:", error);
      alert("Failed to load topic. Please try again.");
      goBackToTopics();
    }
  }

  // Load the current problem
  function loadProblem() {
    if (!currentProblems || currentProblems.length === 0) {
      console.error("No problems available");
      return;
    }
    
    console.log("Loading problem...");
    const problem = currentProblems[currentProblemIndex];
    console.log("Current problem:", problem);
    
    // Update counter and navigation
    problemCounter.textContent = `Problem ${currentProblemIndex + 1} of ${currentProblems.length}`;
    prevButton.disabled = currentProblemIndex === 0;
    nextButton.disabled = currentProblemIndex === currentProblems.length - 1;
    
    // Reset card state
    flashcard.classList.remove('flipped');
    
    // Update front of card
    document.getElementById('card-title').textContent = problem.title;
    document.getElementById('card-title-back').textContent = `${problem.title} - Solution`;
    
    // Set difficulty badge
    const difficultyBadge = document.getElementById('card-difficulty');
    difficultyBadge.textContent = problem.difficulty;
    difficultyBadge.className = 'px-2 py-1 rounded-full text-xs font-semibold text-white';
    
    if (problem.difficulty === 'Easy') {
      difficultyBadge.classList.add('bg-green-500');
    } else if (problem.difficulty === 'Medium') {
      difficultyBadge.classList.add('bg-yellow-500');
    } else {
      difficultyBadge.classList.add('bg-red-500');
    }
    
    // Update content
    document.getElementById('question-content').textContent = problem.question;
    document.getElementById('hint-content').textContent = problem.hint;
    
    // Update solution fields
    document.getElementById('one-liner-content').textContent = problem.oneLiner || '';
    document.getElementById('three-liner-content').textContent = problem.threeLiner || '';
    document.getElementById('mnemonic-content').textContent = problem.mnemonic || '';
    document.getElementById('code-block').textContent = problem.code || '';
    
    // Reset tabs
    document.getElementById('question-tab').click();
    document.getElementById('one-liner-tab').click();
  }

  // Navigate back to topics
  function goBackToTopics() {
    flashcardSection.classList.add('hidden');
    topicSection.classList.remove('hidden');
  }

  // Go to previous problem
  function goToPreviousProblem() {
    if (currentProblemIndex > 0) {
      currentProblemIndex--;
      loadProblem();
    }
  }

  // Go to next problem
  function goToNextProblem() {
    if (currentProblemIndex < currentProblems.length - 1) {
      currentProblemIndex++;
      loadProblem();
    }
  }

  // Start the application
  initialize();
});