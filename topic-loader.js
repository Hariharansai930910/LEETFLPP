// Topic configuration
const topicConfig = [
  { id: 'advancedgraphs', name: 'Advanced Graphs', path: 'Advanced Graphs.txt' },
  { id: 'arraysandstrings', name: 'Arrays and Strings', path: 'Arrays and Strings.txt' },
  { id: 'backtracking', name: 'Backtracking', path: 'Backtracking.txt' },
  { id: 'binarysearch', name: 'Binary Search', path: 'Binary search.txt' },
  { id: 'bitmanipulation', name: 'Bit Manipulation', path: 'bit-manipulation-solutions.py' },
  { id: 'dp1d', name: '1-D Dynamic Programming', path: '1-D Dynamic Programming.txt' },
  { id: 'dp2d', name: '2-D Dynamic Programming', path: '2-dp.txt' },
  { id: 'graphs', name: 'Graphs', path: 'Graphs.txt' },
  { id: 'greedy', name: 'Greedy', path: 'Greedy.txt' },
  { id: 'heap', name: 'Heap/Priority Queue', path: 'Heap Priority Queue.txt' },
  { id: 'intervals', name: 'Intervals', path: 'Intervals.txt' },
  { id: 'linkedlist', name: 'Linked List', path: 'Linked List.txt' },
  { id: 'mathgeometry', name: 'Math & Geometry', path: 'Math & Geometry.txt' },
  { id: 'slidingwindow', name: 'Sliding Window', path: 'Sliding Window.txt' },
  { id: 'stack', name: 'Stack', path: 'Stack.txt' },
  { id: 'trees', name: 'Trees', path: 'Trees.txt' },
  { id: 'trie', name: 'Trie', path: 'Trie.txt' },
  { id: 'twopointers', name: 'Two Pointers', path: 'two pointers.txt' },
];

// Cache for loaded topics
const topicCache = {};

/**
 * Parse text content into problem objects
 * @param {string} content - Raw text content
 * @returns {Array} - Array of problem objects
 */
function parseProblems(content) {
  const problems = [];
  let currentProblem = null;
  let currentSection = null;
  
  // Split by line
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Problem title/number detection (various formats found in your files)
    if (line.match(/^\d+\.\s/) || line.match(/^Problem:/) || line.match(/^Question:/) || 
        line.match(/^###\s+\d+\.\s/) || line.match(/^###\s+\*\*\d+\.\s/)) {
      
      // Save previous problem if exists
      if (currentProblem && currentProblem.title) {
        problems.push(currentProblem);
      }
      
      // Extract title
      let title = line.replace(/^###\s+\*\*\d+\.\s+/, '').replace(/^###\s+\d+\.\s+/, '')
                    .replace(/^\d+\.\s+/, '').replace(/^Problem:\s+/, '').replace(/^Question:\s+/, '')
                    .replace(/\*\*$/, '').trim();
      
      // Initialize new problem
      currentProblem = {
        title: title,
        difficulty: detectDifficulty(line, lines.slice(i, i + 10).join(' ')),
        question: '',
        hint: '',
        oneLiner: '',
        threeLiner: '',
        mnemonic: '',
        code: ''
      };
      currentSection = 'question';
      continue;
    }
    
    // Section markers
    if (line.match(/✅\s*One-liner:/) || line.match(/^**✅\s*One-liner:**$/)) {
      currentSection = 'oneLiner';
      // Extract content if on same line
      const match = line.match(/One-liner:(.*)/);
      if (match && match[1].trim() && currentProblem) {
        currentProblem.oneLiner = match[1].trim();
      }
      continue;
    } else if (line.match(/👶\s*3-liner/) || line.match(/^**👶\s*3-liner for kids:**$/)) {
      currentSection = 'threeLiner';
      continue;
    } else if (line.match(/🧠\s*Mnemonics:/) || line.match(/^**🧠\s*Mnemonics:**$/)) {
      currentSection = 'mnemonic';
      continue;
    } else if (line.match(/^```python/) || line.match(/^python\s*$/) || line.match(/^class Solution:/)) {
      currentSection = 'code';
      continue;
    } else if (line.match(/^Hint:/) || line.match(/Optimized Approach:/) || line.match(/^**Hint:**$/)) {
      currentSection = 'hint';
      // Extract hint if on same line
      const match = line.match(/(?:Hint:|Optimized Approach:)(.*)/);
      if (match && match[1].trim() && currentProblem) {
        currentProblem.hint = match[1].trim();
      }
      continue;
    } else if (line.match(/^```$/) && currentSection === 'code') {
      currentSection = 'question';
      continue;
    }
    
    // Add content to current section if problem exists
    if (currentProblem) {
      switch (currentSection) {
        case 'question':
          if (!line.match(/^Time Complexity/) && !line.match(/^Space Complexity/)) {
            currentProblem.question += line + '\n';
          }
          break;
        case 'hint':
          currentProblem.hint += line + '\n';
          break;
        case 'oneLiner':
          if (!currentProblem.oneLiner.includes(line)) {
            currentProblem.oneLiner += line + '\n';
          }
          break;
        case 'threeLiner':
          currentProblem.threeLiner += line + '\n';
          break;
        case 'mnemonic':
          if (line.startsWith('-')) {
            line = line.substring(1).trim();
          }
          currentProblem.mnemonic += line + '\n';
          break;
        case 'code':
          if (!line.match(/^Time Complexity/) && !line.match(/^Space Complexity/)) {
            currentProblem.code += line + '\n';
          }
          break;
      }
    }
  }
  
  // Add the last problem
  if (currentProblem && currentProblem.title) {
    problems.push(currentProblem);
  }
  
  // Clean up problem data
  return problems.map(problem => ({
    title: problem.title.trim(),
    difficulty: problem.difficulty,
    question: problem.question.trim(),
    hint: problem.hint.trim(),
    oneLiner: problem.oneLiner.trim(),
    threeLiner: problem.threeLiner.trim(),
    mnemonic: problem.mnemonic.trim(),
    code: problem.code.trim()
  }));
}

/**
 * Try to detect problem difficulty from content
 */
function detectDifficulty(title, context) {
  // Check for explicit difficulty markers
  if (context.includes('Difficulty: Easy') || context.includes('(Easy)') || 
      context.includes('**Difficulty:** Easy') || context.includes('Easy')) {
    return 'Easy';
  } else if (context.includes('Difficulty: Medium') || context.includes('(Medium)') ||
             context.includes('**Difficulty:** Medium') || context.includes('Medium')) {
    return 'Medium';
  } else if (context.includes('Difficulty: Hard') || context.includes('(Hard)') ||
             context.includes('**Difficulty:** Hard') || context.includes('Hard')) {
    return 'Hard';
  }
  
  // Default to Medium if can't determine
  return 'Medium';
}

/**
 * Load a topic's problems from the corresponding text file
 * @param {string} topicId - The ID of the topic to load
 * @returns {Promise<Array>} - Array of problem objects
 */
async function loadTopicProblems(topicId) {
  // If already cached, return from cache
  if (topicCache[topicId]) {
    return topicCache[topicId];
  }

  // Find the topic configuration
  const topic = topicConfig.find(t => t.id === topicId);
  if (!topic) {
    throw new Error(`Topic not found: ${topicId}`);
  }

  try {
    // Fetch the topic file
    const response = await fetch(topic.path);
    if (!response.ok) {
      throw new Error(`Failed to load topic: ${topic.name}`);
    }

    const text = await response.text();
    
    // Parse the text content into problem objects
    const problems = parseProblems(text);
    
    // Cache the results
    topicCache[topicId] = problems;
    return problems;
  } catch (error) {
    console.error(`Error loading topic ${topicId}:`, error);
    return [];
  }
}

/**
 * Check if a topic file exists
 * @param {string} topicId - The ID of the topic to check
 * @returns {Promise<boolean>} - Whether the topic exists
 */
async function checkTopicExists(topicId) {
  const topic = topicConfig.find(t => t.id === topicId);
  if (!topic) return false;
  
  try {
    const response = await fetch(topic.path, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Export the functions and config
export { loadTopicProblems, checkTopicExists, topicConfig };