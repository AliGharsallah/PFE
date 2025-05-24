// Configuration Ollama
const OLLAMA_CONFIG = {
  baseUrl: 'http://127.0.0.1:11434/api/generate',
  model: 'codellama',
  timeout: 300000, 
};

// Vérifier si Ollama est disponible
async function checkOllamaAvailability() {
  try {
    const response = await fetch('http://127.0.0.1:11434/api/tags', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.log('⚠️ Ollama non disponible, utilisation des questions par défaut');
    return false;
  }
}

// Générer des questions techniques
async function generateTechnicalTest(job, existingTests = [], attempt = 1) {
  console.log('🚀 === Début de génération de test technique ===');
  console.log(`🎲 Tentative ${attempt} avec ${existingTests.length} tests à éviter`);
  
  // Vérifier la disponibilité d'Ollama en premier
  const isOllamaAvailable = await checkOllamaAvailability();
  if (!isOllamaAvailable) {
    console.log('📋 Utilisation des questions par défaut (Ollama indisponible)');
    return getDefaultQuestions(job, existingTests, attempt);
  }

  // Créer un prompt avec demande de variété
  const varietyInstructions = existingTests.length > 0 
    ? `IMPORTANT: Génère des questions DIFFÉRENTES et UNIQUES. Évite les sujets trop communs. Sois créatif et original. Tentative ${attempt}.`
    : `Génère des questions variées et intéressantes. Tentative ${attempt}.`;

  const prompt = `Génère EXACTEMENT 5 questions techniques pour ce poste de développeur.
  ${varietyInstructions}
  
  POSTE: ${job.title}
  COMPÉTENCES: ${job.technicalSkills?.join(', ') || 'Générales'}

  RÈGLES CRITIQUES:
  1. Réponds UNIQUEMENT avec un tableau JSON valide
  2. Exactement 5 questions dans le tableau  
  3. Options courtes (max 80 caractères chacune)
  4. Pas de guillemets doubles dans les options
  5. Une seule phrase par option
  
  FORMAT EXACT (copie ce format):
  [
    {
      "questionText": "Question courte et claire?", 
      "type": "multiple_choice",
      "options": ["Option A courte", "Option B courte", "Option C courte", "Option D courte"],
      "correctAnswer": "Option A courte",
      "explanation": "Explication courte et claire."
    }
  ]
  
  IMPORTANT: Les options doivent être courtes, sans guillemets internes, et la correctAnswer doit être EXACTEMENT identique à une option.`;


  let controller;
  let timeoutId;

  try {
    console.log('📤 Envoi de la requête à Ollama...');
    
    // Créer un nouveau controller pour chaque requête
    controller = new AbortController();
    
    // Définir le timeout
    timeoutId = setTimeout(() => {
      console.log('⏰ Timeout atteint, annulation de la requête...');
      controller.abort();
    }, OLLAMA_CONFIG.timeout);
    
    const response = await fetch(OLLAMA_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: attempt > 2 ? 'llama2' : OLLAMA_CONFIG.model, // Changer de modèle après 2 échecs
        prompt: prompt,
        stream: false,
        format: "json",
        options: {
          temperature: Math.min(0.3 + (attempt * 0.2), 0.9), // Température plus basse pour plus de stabilité
          num_predict: 800, // Limiter la génération
          top_p: 0.8,
          seed: Math.floor(Math.random() * 1000000),
          stop: ["}]", "\n\n"] // Arrêter à la fin du JSON
        }
      }),
      signal: controller.signal,
    });
    
    // Nettoyer le timeout si la requête réussit
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    console.log('📨 Réponse reçue, status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    let generatedText = data.response || '';

    console.log('📥 Réponse brute (début):', generatedText.substring(0, 200) + '...');

    // Essayer de parser la réponse JSON
    try {
      // Chercher le JSON dans la réponse
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Valider que chaque question a la bonne structure
          const validQuestions = parsed.filter(q => 
            q && 
            typeof q === 'object' && 
            q.questionText && 
            q.type && 
            Array.isArray(q.options) && 
            q.correctAnswer &&
            q.explanation
          );
          
          if (validQuestions.length >= 5) {
            console.log('✅ Questions générées avec succès via Ollama');
            return validQuestions.slice(0, 5); // Prendre exactement 5 questions
          } else {
            console.log(`⚠️ Seulement ${validQuestions.length} questions valides trouvées`);
          }
        }
      }
      
      // Si pas de JSON array trouvé, essayer de parser comme objet unique
      try {
        const directParsed = JSON.parse(generatedText);
        if (directParsed && typeof directParsed === 'object') {
          // Si c'est un objet unique, le convertir en tableau
          if (directParsed.questionText && directParsed.options) {
            console.log('📋 Question unique détectée, utilisation des questions par défaut');
            return getDefaultQuestions(job, existingTests, attempt);
          }
          // Si c'est un tableau
          if (Array.isArray(directParsed) && directParsed.length > 0) {
            const validQuestions = directParsed.filter(q => 
              q && 
              typeof q === 'object' && 
              q.questionText && 
              q.type && 
              Array.isArray(q.options) && 
              q.correctAnswer &&
              q.explanation
            );
            
            if (validQuestions.length >= 5) {
              console.log('✅ Questions générées avec succès via Ollama (parsing direct)');
              // Nettoyer et valider les questions
              const cleanedQuestions = validateAndCleanQuestions(validQuestions);
              if (cleanedQuestions.length >= 5) {
                return cleanedQuestions.slice(0, 5);
              } else {
                console.log(`⚠️ Après nettoyage, seulement ${cleanedQuestions.length} questions valides`);
              }
            }
          }
        }
      } catch (directParseError) {
        console.log('⚠️ Échec du parsing direct');
      }
      
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError.message);
      console.log('📄 Contenu à parser:', generatedText.substring(0, 500));
    }

    // Si aucun parsing n'a fonctionné, utiliser les questions par défaut
    console.log('⚠️ Parsing échoué, utilisation des questions par défaut');
    return getDefaultQuestions(job, existingTests, attempt);

  } catch (error) {
    // Nettoyer le timeout en cas d'erreur
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (error.name === 'AbortError') {
      console.error('❌ Requête annulée (timeout):', error.message);
    } else {
      console.error('❌ Erreur génération test technique:', error.message);
    }
    
    console.log('📋 Utilisation des questions par défaut suite à l\'erreur');
    return getDefaultQuestions(job, existingTests, attempt);
  }
}

// Questions par défaut améliorées avec variété
function getDefaultQuestions(job, existingTests = [], attempt = 1) {
  console.log('📋 Génération des questions par défaut pour:', job.title);
  console.log(`🎲 Variété basée sur la tentative ${attempt}`);
  
  // Pool étendu de questions variées
  const questionPools = {
    general: [
      {
        questionText: "Qu'est-ce que l'héritage en programmation orientée objet ?",
        type: "multiple_choice",
        options: [
          "Un mécanisme permettant à une classe d'hériter des propriétés d'une autre",
          "Une méthode pour diviser le code en modules",
          "Un système de versioning",
          "Une technique d'optimisation"
        ],
        correctAnswer: "Un mécanisme permettant à une classe d'hériter des propriétés d'une autre",
        explanation: "L'héritage permet à une classe fille d'hériter des attributs et méthodes d'une classe parente."
      },
      {
        questionText: "Quelle est la différence entre let et var en JavaScript ?",
        type: "multiple_choice",
        options: [
          "var a une portée de fonction, let a une portée de bloc",
          "let a une portée de fonction, var a une portée de bloc",
          "Ils sont identiques",
          "var est plus rapide que let"
        ],
        correctAnswer: "var a une portée de fonction, let a une portée de bloc",
        explanation: "let a une portée de bloc, ce qui le rend plus prévisible que var."
      },
      {
        questionText: "Qu'est-ce qu'une API REST ?",
        type: "multiple_choice",
        options: [
          "Un type de base de données",
          "Une architecture pour les services web basée sur HTTP",
          "Un langage de programmation",
          "Un framework frontend"
        ],
        correctAnswer: "Une architecture pour les services web basée sur HTTP",
        explanation: "REST est une architecture web populaire utilisant HTTP."
      },
      {
        questionText: "Quel est le rôle d'un index dans une base de données ?",
        type: "multiple_choice",
        options: [
          "Sauvegarder la base de données",
          "Accélérer les requêtes de lecture",
          "Crypter les données",
          "Créer des backups automatiques"
        ],
        correctAnswer: "Accélérer les requêtes de lecture",
        explanation: "Les index améliorent les performances de lecture des bases de données."
      },
      {
        questionText: "Qu'est-ce que le versioning sémantique ?",
        type: "multiple_choice",
        options: [
          "Un système pour nommer les branches Git",
          "Un format de versioning avec MAJOR.MINOR.PATCH",
          "Une technique de déploiement",
          "Un outil de documentation"
        ],
        correctAnswer: "Un format de versioning avec MAJOR.MINOR.PATCH",
        explanation: "Le versioning sémantique suit le format MAJOR.MINOR.PATCH."
      },
      {
        questionText: "Quelle est la différence entre un processus et un thread ?",
        type: "multiple_choice",
        options: [
          "Un processus est plus léger qu'un thread",
          "Un thread partage la mémoire avec d'autres threads du même processus",
          "Il n'y a pas de différence",
          "Un thread est plus sécurisé qu'un processus"
        ],
        correctAnswer: "Un thread partage la mémoire avec d'autres threads du même processus",
        explanation: "Les threads d'un même processus partagent le même espace mémoire."
      },
      {
        questionText: "Qu'est-ce que la récursion en programmation ?",
        type: "multiple_choice",
        options: [
          "Une boucle infinie",
          "Une fonction qui s'appelle elle-même",
          "Une technique de tri",
          "Un type de variable"
        ],
        correctAnswer: "Une fonction qui s'appelle elle-même",
        explanation: "La récursion est quand une fonction s'appelle elle-même avec des paramètres modifiés."
      },
      {
        questionText: "Qu'est-ce que l'encapsulation en POO ?",
        type: "multiple_choice",
        options: [
          "Le fait de cacher les détails d'implémentation",
          "L'héritage multiple",
          "La surcharge des méthodes",
          "L'instanciation des objets"
        ],
        correctAnswer: "Le fait de cacher les détails d'implémentation",
        explanation: "L'encapsulation permet de cacher les détails internes d'un objet."
      },
      {
        questionText: "Qu'est-ce qu'un algorithme de tri ?",
        type: "multiple_choice",
        options: [
          "Un moyen de rechercher des données",
          "Une méthode pour organiser des éléments dans un ordre",
          "Un type de base de données",
          "Une technique de cryptage"
        ],
        correctAnswer: "Une méthode pour organiser des éléments dans un ordre",
        explanation: "Les algorithmes de tri permettent d'organiser des données selon un critère."
      },
      {
        questionText: "Qu'est-ce que la complexité algorithmique ?",
        type: "multiple_choice",
        options: [
          "La difficulté à comprendre un algorithme",
          "La mesure de l'efficacité d'un algorithme",
          "Le nombre de lignes de code",
          "La vitesse d'exécution seulement"
        ],
        correctAnswer: "La mesure de l'efficacité d'un algorithme",
        explanation: "La complexité mesure les ressources nécessaires (temps, mémoire) pour exécuter un algorithme."
      }
    ],
    react: [
      {
        questionText: "Quelle est la différence entre state et props dans React ?",
        type: "multiple_choice",
        options: [
          "State est mutable, props est immutable",
          "Props est mutable, state est immutable",
          "Ils sont identiques",
          "State est plus rapide que props"
        ],
        correctAnswer: "State est mutable, props est immutable",
        explanation: "Le state est interne au composant, les props sont passées par le parent."
      },
      {
        questionText: "Qu'est-ce que le Virtual DOM dans React ?",
        type: "multiple_choice",
        options: [
          "Une copie en mémoire du DOM réel",
          "Un nouveau navigateur web",
          "Un framework CSS",
          "Une base de données"
        ],
        correctAnswer: "Une copie en mémoire du DOM réel",
        explanation: "Le Virtual DOM est une représentation en mémoire du DOM pour optimiser les updates."
      },
      {
        questionText: "Qu'est-ce qu'un Hook dans React ?",
        type: "multiple_choice",
        options: [
          "Une fonction qui permet d'utiliser l'état dans les composants fonctionnels",
          "Un type de composant",
          "Une librairie externe",
          "Un événement du DOM"
        ],
        correctAnswer: "Une fonction qui permet d'utiliser l'état dans les composants fonctionnels",
        explanation: "Les Hooks permettent d'utiliser l'état et d'autres fonctionnalités React dans les composants fonctionnels."
      }
    ],
    python: [
      {
        questionText: "Quelle est la différence entre une liste et un tuple en Python ?",
        type: "multiple_choice",
        options: [
          "Les tuples sont immuables, les listes sont mutables",
          "Les listes sont immuables, les tuples sont mutables",
          "Ils sont identiques",
          "Les tuples sont plus lents"
        ],
        correctAnswer: "Les tuples sont immuables, les listes sont mutables",
        explanation: "Les tuples ne peuvent pas être modifiés après leur création."
      },
      {
        questionText: "Qu'est-ce qu'un décorateur en Python ?",
        type: "multiple_choice",
        options: [
          "Une fonction qui modifie le comportement d'une autre fonction",
          "Un type de variable",
          "Une boucle spéciale",
          "Un module d'importation"
        ],
        correctAnswer: "Une fonction qui modifie le comportement d'une autre fonction",
        explanation: "Les décorateurs permettent de modifier ou étendre le comportement des fonctions."
      },
      {
        questionText: "Qu'est-ce que la compréhension de liste en Python ?",
        type: "multiple_choice",
        options: [
          "Une façon concise de créer des listes",
          "Un type de boucle",
          "Une méthode de tri",
          "Un algorithme de recherche"
        ],
        correctAnswer: "Une façon concise de créer des listes",
        explanation: "La compréhension de liste permet de créer des listes de manière concise et lisible."
      }
    ],
    nodejs: [
      {
        questionText: "Qu'est-ce que le modèle événementiel de Node.js ?",
        type: "multiple_choice",
        options: [
          "Un système de gestion des erreurs",
          "Une architecture non-bloquante basée sur les événements",
          "Un framework pour les interfaces utilisateur",
          "Un système de base de données"
        ],
        correctAnswer: "Une architecture non-bloquante basée sur les événements",
        explanation: "Node.js utilise une boucle d'événements pour gérer les opérations asynchrones."
      },
      {
        questionText: "Qu'est-ce que npm dans l'écosystème Node.js ?",
        type: "multiple_choice",
        options: [
          "Un gestionnaire de paquets",
          "Un framework web",
          "Un compilateur",
          "Un serveur web"
        ],
        correctAnswer: "Un gestionnaire de paquets",
        explanation: "npm est le gestionnaire de paquets par défaut pour Node.js."
      }
    ]
  };

  // Créer une combinaison unique basée sur l'attempt et les compétences
  let allQuestions = [...questionPools.general];
  
  // Ajouter des questions spécifiques selon les compétences
  if (job.technicalSkills && Array.isArray(job.technicalSkills)) {
    if (job.technicalSkills.some(skill => ['React', 'react'].includes(skill))) {
      allQuestions.push(...questionPools.react);
    }
    if (job.technicalSkills.some(skill => ['Python', 'python'].includes(skill))) {
      allQuestions.push(...questionPools.python);
    }
    if (job.technicalSkills.some(skill => ['Node.js', 'nodejs', 'node'].includes(skill))) {
      allQuestions.push(...questionPools.nodejs);
    }
  }

  // Utiliser l'attempt pour créer de la variété
  const seed = attempt * 137 + (job.title ? job.title.length : 0);
  const startIndex = Math.abs(seed) % Math.max(1, allQuestions.length - 5);
  
  // Sélectionner 5 questions avec rotation
  const selectedQuestions = [];
  for (let i = 0; i < 5; i++) {
    const index = (startIndex + i) % allQuestions.length;
    selectedQuestions.push({ ...allQuestions[index] });
  }

  // Mélanger les options pour plus de variété selon l'attempt
  selectedQuestions.forEach((question, qIndex) => {
    if (question.options && attempt > 1) {
      const shouldShuffle = (attempt + qIndex) % 3 === 0;
      if (shouldShuffle && question.options.length >= 2) {
        // Échanger deux options aléatoirement
        const idx1 = (attempt + qIndex) % question.options.length;
        const idx2 = (attempt + qIndex + 1) % question.options.length;
        
        const temp = question.options[idx1];
        question.options[idx1] = question.options[idx2];
        question.options[idx2] = temp;
        
        // Ajuster la bonne réponse
        if (question.correctAnswer === question.options[idx2]) {
          question.correctAnswer = question.options[idx1];
        } else if (question.correctAnswer === question.options[idx1]) {
          question.correctAnswer = question.options[idx2];
        }
      }
    }
  });

  console.log(`✅ Questions par défaut générées avec variété (attempt ${attempt})`);
  return selectedQuestions;
}

// Analyser un CV (.txt ou .pdf)
async function analyzeResume(resumePath, job) {
  console.log('🔍 === Début de l\'analyse CV ===');
  console.log('📂 Fichier:', resumePath);
  console.log('💼 Poste:', job.title);

  const fs = require('fs').promises;
  const path = require('path');
  const pdfParse = require('pdf-parse');

  let resumeText = '';

  try {
    const ext = path.extname(resumePath).toLowerCase();

    if (ext === '.txt') {
      resumeText = await fs.readFile(resumePath, 'utf-8');
    } else if (ext === '.pdf') {
      const pdfBuffer = await fs.readFile(resumePath);
      const pdfData = await pdfParse(pdfBuffer);
      resumeText = pdfData.text;
    } else {
      resumeText = 'CV simulé pour test. Expérience en développement web, React, Node.js. 3 ans d\'expérience.';
      console.log('📄 Format non pris en charge, utilisation du texte simulé.');
    }

    console.log('📑 Texte extrait (début):', resumeText.substring(0, 100) + '...');

    // Vérifier la disponibilité d'Ollama
    const isOllamaAvailable = await checkOllamaAvailability();
    if (!isOllamaAvailable) {
      // Analyse basique sans IA
      return analyzeResumeBasic(resumeText, job);
    }

    const prompt = `Analyse ce CV pour le poste suivant. Sois bref et direct.

POSTE: ${job.title}
Compétences requises: ${job.technicalSkills?.join(', ') || 'Aucune spécifiée'}

CV: ${resumeText}

Score le candidat sur 100 et détermine s'il est qualifié (>= 75 points).

Réponds UNIQUEMENT en JSON valide:
{"score": [nombre], "match": [true/false], "feedback": "[phrase courte]", "missingSkills": []}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.timeout);

    const response = await fetch(OLLAMA_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_CONFIG.model,
        prompt: prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.3,
          num_predict: 200,
          top_p: 0.8,
          stop: ['\n\n\n']
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('📨 Réponse reçue, status:', response.status);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const analysisResult = data.response || '';
    console.log('📥 Réponse brute:', analysisResult);

    try {
      let parsed = JSON.parse(analysisResult);
      const score = typeof parsed.score === 'number' ? parsed.score : parseInt(parsed.score) || 0;
      const match = score >= 75;
      return { ...parsed, score, match };
    } catch {
      const jsonMatch = analysisResult.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const score = typeof parsed.score === 'number' ? parsed.score : parseInt(parsed.score) || 0;
        const match = score >= 75;
        return { ...parsed, score, match };
      } else {
        throw new Error('Impossible de parser la réponse JSON.');
      }
    }

  } catch (err) {
    console.error('❌ Erreur analyse CV:', err);
    return analyzeResumeBasic(resumeText, job);
  }
}

// Analyse basique du CV sans IA
function analyzeResumeBasic(resumeText, job) {
  console.log('📋 Analyse basique du CV (sans IA)');
  
  let score = 50; // Score de base
  const foundSkills = [];
  const missingSkills = [];
  
  // Vérifier les compétences techniques
  if (job.technicalSkills && Array.isArray(job.technicalSkills)) {
    job.technicalSkills.forEach(skill => {
      const skillRegex = new RegExp(skill, 'gi');
      if (skillRegex.test(resumeText)) {
        foundSkills.push(skill);
        score += 10;
      } else {
        missingSkills.push(skill);
      }
    });
  }
  
  // Vérifier l'expérience
  const experienceKeywords = ['expérience', 'experience', 'ans', 'années', 'years'];
  const hasExperience = experienceKeywords.some(keyword => 
    resumeText.toLowerCase().includes(keyword)
  );
  
  if (hasExperience) {
    score += 15;
  }
  
  // Limiter le score à 100
  score = Math.min(score, 100);
  
  const match = score >= 75;
  const feedback = match 
    ? `Profil intéressant avec ${foundSkills.length} compétences correspondantes`
    : `Profil à développer, ${missingSkills.length} compétences manquantes`;
  
  return {
    score,
    match,
    feedback,
    missingSkills
  };
}

// Nouvelle méthode pour évaluer les solutions de code
async function evaluateCodeSolution(question, answer) {
  try {
    // Vérifier la disponibilité d'Ollama
    const isOllamaAvailable = await checkOllamaAvailability();
    if (!isOllamaAvailable) {
      // Évaluation basique sans IA
      return {
        correct: answer.trim().length > 20, // Au moins 20 caractères
        feedback: "Évaluation basique: solution présente",
        score: answer.trim().length > 20 ? 80 : 20
      };
    }

    const prompt = `Évalue cette solution de code:

QUESTION: ${question.questionText}
SOLUTION: ${answer}

Réponds UNIQUEMENT en JSON:
{"correct": [true/false], "feedback": "[commentaire bref]", "score": [0-100]}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(OLLAMA_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_CONFIG.model,
        prompt: prompt,
        stream: false,
        format: "json"
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return JSON.parse(data.response || '{"correct": false, "feedback": "Erreur évaluation", "score": 0}');

  } catch (error) {
    console.error('Erreur évaluation code:', error);
    return {
      correct: answer.trim().length > 0,
      feedback: "Évaluation de base effectuée",
      score: answer.trim().length > 0 ? 50 : 0
    };
  }
}

// Fonction pour valider et nettoyer les questions
function validateAndCleanQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }
  
  return questions.map(q => {
    // Vérifier la structure de base
    if (!q || typeof q !== 'object') {
      return null;
    }
    
    // Extraire et nettoyer les champs
    const questionText = q.questionText || q.question || '';
    const type = q.type || 'multiple_choice';
    const options = q.options || q.choices || [];
    const correctAnswer = q.correctAnswer || q.correct || q.answer || '';
    const explanation = q.explanation || q.explain || q.description || 'Pas d\'explication fournie.';
    
    // Nettoyer le texte de la question
    const cleanQuestionText = String(questionText).trim().replace(/\s+/g, ' ');
    
    // Nettoyer les options
    let cleanOptions = [];
    if (Array.isArray(options)) {
      cleanOptions = options
        .map(opt => String(opt).trim().replace(/\s+/g, ' '))
        .filter(opt => opt.length > 0 && opt.length < 500) // Limiter la longueur
        .slice(0, 6); // Max 6 options
    }
    
    // Si pas assez d'options, essayer de les extraire du texte
    if (cleanOptions.length < 2 && cleanQuestionText.includes('A)') || cleanQuestionText.includes('1.')) {
      const extractedOptions = extractOptionsFromText(cleanQuestionText);
      if (extractedOptions.length >= 2) {
        cleanOptions = extractedOptions;
      }
    }
    
    // Nettoyer la réponse correcte
    const cleanCorrectAnswer = String(correctAnswer).trim().replace(/\s+/g, ' ');
    
    // Nettoyer l'explication
    const cleanExplanation = String(explanation).trim().replace(/\s+/g, ' ').substring(0, 500);
    
    // Vérifications finales
    if (cleanQuestionText.length < 10 || 
        cleanOptions.length < 2 || 
        cleanCorrectAnswer.length === 0 ||
        cleanExplanation.length === 0) {
      return null;
    }
    
    // Vérifier que la bonne réponse est dans les options (ou similaire)
    let validCorrectAnswer = cleanCorrectAnswer;
    if (!cleanOptions.includes(cleanCorrectAnswer)) {
      // Chercher une option similaire
      const similarOption = cleanOptions.find(opt => 
        opt.toLowerCase().includes(cleanCorrectAnswer.toLowerCase()) ||
        cleanCorrectAnswer.toLowerCase().includes(opt.toLowerCase())
      );
      if (similarOption) {
        validCorrectAnswer = similarOption;
      } else {
        // Prendre la première option par défaut
        validCorrectAnswer = cleanOptions[0];
      }
    }
    
    return {
      questionText: cleanQuestionText,
      type: type,
      options: cleanOptions,
      correctAnswer: validCorrectAnswer,
      explanation: cleanExplanation
    };
  }).filter(q => q !== null);
}

// Fonction pour extraire les options d'un texte mal formaté
function extractOptionsFromText(text) {
  const options = [];
  
  // Patterns pour A) B) C) D)
  const letterPattern = /[A-D]\)\s*([^A-D\)]+?)(?=[A-D]\)|$)/g;
  let match;
  while ((match = letterPattern.exec(text)) !== null) {
    const option = match[1].trim();
    if (option && option.length > 0) {
      options.push(option);
    }
  }
  
  // Si pas trouvé, essayer 1. 2. 3. 4.
  if (options.length === 0) {
    const numberPattern = /\d+\.\s*([^1-9\.]+?)(?=\d+\.|$)/g;
    while ((match = numberPattern.exec(text)) !== null) {
      const option = match[1].trim();
      if (option && option.length > 0) {
        options.push(option);
      }
    }
  }
  
  return options.slice(0, 4); // Max 4 options
}

module.exports = {
  analyzeResume,
  generateTechnicalTest,
  evaluateCodeSolution,
  checkOllamaAvailability,
  validateAndCleanQuestions
};