// Quiz questions data for demo quizzes
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct answer
  explanation?: string;
}

export interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
}

// General Knowledge Questions
const generalKnowledgeQuestions: Question[] = [
  {
    id: 'gk1',
    question: 'What is the capital of India?',
    options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
    correctAnswer: 1,
    explanation: 'Delhi is the capital city of India.'
  },
  {
    id: 'gk2',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    explanation: 'Mars is known as the Red Planet due to its reddish appearance.'
  },
  {
    id: 'gk3',
    question: 'Who wrote the Indian national anthem?',
    options: ['Rabindranath Tagore', 'Mahatma Gandhi', 'Sardar Vallabhbhai Patel', 'Jawaharlal Nehru'],
    correctAnswer: 0,
    explanation: 'Rabindranath Tagore wrote the Indian national anthem, Jana Gana Mana.'
  },
  {
    id: 'gk4',
    question: 'What is the largest ocean in the world?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswer: 3,
    explanation: 'The Pacific Ocean is the largest ocean in the world.'
  },
  {
    id: 'gk5',
    question: 'Which is the longest river in India?',
    options: ['Ganges', 'Yamuna', 'Brahmaputra', 'Godavari'],
    correctAnswer: 0,
    explanation: 'The Ganges is the longest river in India.'
  },
  {
    id: 'gk6',
    question: 'What is the currency of Japan?',
    options: ['Won', 'Yen', 'Ringgit', 'Baht'],
    correctAnswer: 1,
    explanation: 'The currency of Japan is Yen.'
  },
  {
    id: 'gk7',
    question: 'Who was the first Prime Minister of India?',
    options: ['Mahatma Gandhi', 'Sardar Vallabhbhai Patel', 'Jawaharlal Nehru', 'Rajguru'],
    correctAnswer: 2,
    explanation: 'Jawaharlal Nehru was the first Prime Minister of India.'
  },
  {
    id: 'gk8',
    question: 'Which continent is known as the Dark Continent?',
    options: ['Asia', 'Africa', 'South America', 'Australia'],
    correctAnswer: 1,
    explanation: 'Africa is known as the Dark Continent.'
  },
  {
    id: 'gk9',
    question: 'What is the national animal of India?',
    options: ['Lion', 'Tiger', 'Elephant', 'Leopard'],
    correctAnswer: 1,
    explanation: 'The national animal of India is the Tiger.'
  },
  {
    id: 'gk10',
    question: 'Which gas do plants absorb from the atmosphere?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
    correctAnswer: 1,
    explanation: 'Plants absorb Carbon Dioxide from the atmosphere during photosynthesis.'
  }
];

// Science & Technology Questions
const scienceTechQuestions: Question[] = [
  {
    id: 'st1',
    question: 'What is the chemical symbol for water?',
    options: ['H2O', 'CO2', 'O2', 'NaCl'],
    correctAnswer: 0,
    explanation: 'H2O is the chemical formula for water.'
  },
  {
    id: 'st2',
    question: 'Which vitamin is produced when skin is exposed to sunlight?',
    options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'],
    correctAnswer: 3,
    explanation: 'Vitamin D is produced when skin is exposed to sunlight.'
  },
  {
    id: 'st3',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum'],
    correctAnswer: 2,
    explanation: 'Mitochondria is known as the powerhouse of the cell.'
  },
  {
    id: 'st4',
    question: 'Which programming language is known as the mother of all languages?',
    options: ['Python', 'Java', 'C', 'Assembly'],
    correctAnswer: 2,
    explanation: 'C is often called the mother of all programming languages.'
  },
  {
    id: 'st5',
    question: 'What does CPU stand for?',
    options: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Computer Program Unit'],
    correctAnswer: 0,
    explanation: 'CPU stands for Central Processing Unit.'
  },
  {
    id: 'st6',
    question: 'Which element has atomic number 1?',
    options: ['Helium', 'Hydrogen', 'Lithium', 'Beryllium'],
    correctAnswer: 1,
    explanation: 'Hydrogen has atomic number 1.'
  },
  {
    id: 'st7',
    question: 'What is the speed of light?',
    options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
    correctAnswer: 0,
    explanation: 'The speed of light is approximately 300,000 km/s.'
  },
  {
    id: 'st8',
    question: 'Which device converts chemical energy into electrical energy?',
    options: ['Motor', 'Generator', 'Battery', 'Transformer'],
    correctAnswer: 2,
    explanation: 'A battery converts chemical energy into electrical energy.'
  },
  {
    id: 'st9',
    question: 'What is the unit of electric current?',
    options: ['Volt', 'Watt', 'Ampere', 'Ohm'],
    correctAnswer: 2,
    explanation: 'Ampere is the unit of electric current.'
  },
  {
    id: 'st10',
    question: 'Which gas is most abundant in Earth\'s atmosphere?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
    correctAnswer: 2,
    explanation: 'Nitrogen is the most abundant gas in Earth\'s atmosphere.'
  },
  {
    id: 'st11',
    question: 'What does HTML stand for?',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management Language'],
    correctAnswer: 0,
    explanation: 'HTML stands for Hyper Text Markup Language.'
  },
  {
    id: 'st12',
    question: 'Which planet has the most moons?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    correctAnswer: 1,
    explanation: 'Saturn has the most moons among the planets.'
  },
  {
    id: 'st13',
    question: 'What is the process by which plants make their own food?',
    options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Translocation'],
    correctAnswer: 2,
    explanation: 'Photosynthesis is the process by which plants make their own food.'
  },
  {
    id: 'st14',
    question: 'Which type of memory is volatile?',
    options: ['ROM', 'SSD', 'RAM', 'Hard Disk'],
    correctAnswer: 2,
    explanation: 'RAM (Random Access Memory) is volatile memory.'
  },
  {
    id: 'st15',
    question: 'What is the chemical formula for table salt?',
    options: ['HCl', 'NaOH', 'NaCl', 'KCl'],
    correctAnswer: 2,
    explanation: 'NaCl is the chemical formula for table salt.'
  }
];

// Entertainment Questions
const entertainmentQuestions: Question[] = [
  {
    id: 'ent1',
    question: 'Which movie won the Oscar for Best Picture in 2023?',
    options: ['Oppenheimer', 'Everything Everywhere All at Once', 'The Banshees of Inisherin', 'Top Gun: Maverick'],
    correctAnswer: 0,
    explanation: 'Oppenheimer won the Oscar for Best Picture in 2023.'
  },
  {
    id: 'ent2',
    question: 'Who played the character of Iron Man in the Marvel Cinematic Universe?',
    options: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'],
    correctAnswer: 1,
    explanation: 'Robert Downey Jr. played Iron Man in the Marvel Cinematic Universe.'
  },
  {
    id: 'ent3',
    question: 'Which singer is known as the "Queen of Pop"?',
    options: ['Britney Spears', 'Madonna', 'Lady Gaga', 'Beyoncé'],
    correctAnswer: 1,
    explanation: 'Madonna is known as the Queen of Pop.'
  },
  {
    id: 'ent4',
    question: 'What is the highest-grossing film of all time (unadjusted for inflation)?',
    options: ['Titanic', 'Avatar', 'Avengers: Endgame', 'Star Wars: The Force Awakens'],
    correctAnswer: 1,
    explanation: 'Avatar is the highest-grossing film of all time.'
  },
  {
    id: 'ent5',
    question: 'Which TV show features the character Walter White?',
    options: ['The Sopranos', 'Breaking Bad', 'The Wire', 'Game of Thrones'],
    correctAnswer: 1,
    explanation: 'Walter White is a character in Breaking Bad.'
  },
  {
    id: 'ent6',
    question: 'Who directed the movie "Inception"?',
    options: ['Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'Quentin Tarantino'],
    correctAnswer: 1,
    explanation: 'Christopher Nolan directed Inception.'
  },
  {
    id: 'ent7',
    question: 'Which Bollywood actor is known as "King Khan"?',
    options: ['Aamir Khan', 'Salman Khan', 'Shah Rukh Khan', 'Akshay Kumar'],
    correctAnswer: 2,
    explanation: 'Shah Rukh Khan is known as King Khan in Bollywood.'
  },
  {
    id: 'ent8',
    question: 'What is the name of the first book in the Harry Potter series?',
    options: ['Harry Potter and the Chamber of Secrets', 'Harry Potter and the Philosopher\'s Stone', 'Harry Potter and the Goblet of Fire', 'Harry Potter and the Prisoner of Azkaban'],
    correctAnswer: 1,
    explanation: 'Harry Potter and the Philosopher\'s Stone is the first book in the series.'
  },
  {
    id: 'ent9',
    question: 'Which music artist has won the most Grammy Awards?',
    options: ['Beyoncé', 'Taylor Swift', 'Adele', 'Quincy Jones'],
    correctAnswer: 3,
    explanation: 'Quincy Jones has won the most Grammy Awards.'
  },
  {
    id: 'ent10',
    question: 'What is the highest-rated TV show on IMDb?',
    options: ['Breaking Bad', 'Planet Earth II', 'Band of Brothers', 'Chernobyl'],
    correctAnswer: 1,
    explanation: 'Planet Earth II has the highest IMDb rating.'
  },
  {
    id: 'ent11',
    question: 'Which actor played the Joker in "The Dark Knight"?',
    options: ['Joaquin Phoenix', 'Heath Ledger', 'Jared Leto', 'Jack Nicholson'],
    correctAnswer: 1,
    explanation: 'Heath Ledger played the Joker in The Dark Knight.'
  },
  {
    id: 'ent12',
    question: 'What is the longest-running animated TV show?',
    options: ['The Simpsons', 'South Park', 'Family Guy', 'American Dad'],
    correctAnswer: 0,
    explanation: 'The Simpsons is the longest-running animated TV show.'
  }
];

// Function to get random questions from a pool
export function getRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Demo quiz data
export const demoQuizzes: QuizData[] = [
  {
    id: 'general-knowledge',
    title: 'General Knowledge Demo',
    description: 'Test your basic knowledge with this demo quiz',
    questions: getRandomQuestions(generalKnowledgeQuestions, 10),
    timeLimit: 1,
    difficulty: 'easy'
  },
  {
    id: 'science-tech',
    title: 'Science & Technology Demo',
    description: 'Explore science questions in demo mode',
    questions: getRandomQuestions(scienceTechQuestions, 15),
    timeLimit: 1,
    difficulty: 'medium'
  },
  {
    id: 'entertainment',
    title: 'Entertainment Demo',
    description: 'Movies, music, and pop culture questions',
    questions: getRandomQuestions(entertainmentQuestions, 12),
    timeLimit: 1,
    difficulty: 'easy'
  }
];

// Function to get quiz by ID
export function getQuizById(id: string): QuizData | undefined {
  return demoQuizzes.find(quiz => quiz.id === id);
}
