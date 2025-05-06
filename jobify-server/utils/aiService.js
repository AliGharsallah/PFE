// utils/aiService.js
const fs = require('fs');
const path = require('path');

// Fonction simulée pour extraire le texte d'un CV
async function extractTextFromResume(filePath) {
  try {
    // Simuler l'extraction de texte
    return `Candidat avec expérience en développement web, JavaScript, React, Node.js.
    Compétences: HTML, CSS, MongoDB, Express.
    3 ans d'expérience dans le développement web.`;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du texte du CV:', error);
    throw error;
  }
}

// Fonction simulée pour analyser un CV
async function analyzeResume(resumePath, job) {
  try {
    // Simuler une correspondance entre le CV et l'offre d'emploi
    const requirements = job.requirements || [];
    const technicalSkills = job.technicalSkills || [];
    
    // Simuler une analyse basique
    const matchScore = Math.floor(Math.random() * 30) + 70; // Score entre 70 et 100
    const match = matchScore >= 75;
    
    return {
      match: match,
      score: matchScore,
      feedback: match 
        ? "Le candidat possède les compétences requises pour ce poste."
        : "Le candidat manque de certaines compétences essentielles pour ce poste.",
      missingSkills: match ? [] : ['Une compétence aléatoire']
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse du CV:', error);
    return {
      match: false,
      score: 0,
      feedback: "Une erreur s'est produite lors de l'analyse du CV.",
      missingSkills: []
    };
  }
}

// Fonction simulée pour générer un test technique
async function generateTechnicalTest(job) {
  try {
    // Test prédéfini
    return [
      {
        questionText: "Quelle est la définition d'une promesse en JavaScript?",
        type: "multiple_choice",
        options: [
          "Un objet qui peut produire une valeur à l'avenir",
          "Une fonction qui s'exécute immédiatement",
          "Un type de boucle en JavaScript",
          "Une méthode de manipulation du DOM"
        ],
        correctAnswer: "Un objet qui peut produire une valeur à l'avenir",
        explanation: "Une promesse (Promise) est un objet qui représente l'achèvement ou l'échec d'une opération asynchrone."
      },
      {
        questionText: "Qu'est-ce que le hoisting en JavaScript?",
        type: "multiple_choice",
        options: [
          "Le déplacement des variables et fonctions au début de leur portée",
          "La création d'un nouvel objet",
          "L'optimisation du code par le navigateur",
          "L'exécution de code asynchrone"
        ],
        correctAnswer: "Le déplacement des variables et fonctions au début de leur portée",
        explanation: "Le hoisting est le comportement par défaut de JavaScript qui consiste à déplacer les déclarations au sommet de leur portée."
      },
      {
        questionText: "Comment déclarer une variable qui ne peut pas être réassignée en JavaScript?",
        type: "multiple_choice",
        options: [
          "var x = 5;",
          "let x = 5;",
          "const x = 5;",
          "static x = 5;"
        ],
        correctAnswer: "const x = 5;",
        explanation: "La déclaration 'const' crée une variable dont la valeur est fixe (constante)."
      },
      {
        questionText: "Quelle méthode est utilisée pour ajouter un élément à la fin d'un tableau?",
        type: "multiple_choice",
        options: [
          "push()",
          "pop()",
          "shift()",
          "unshift()"
        ],
        correctAnswer: "push()",
        explanation: "La méthode push() ajoute un ou plusieurs éléments à la fin d'un tableau."
      },
      {
        questionText: "Quel framework JavaScript est basé sur le concept de composants réutilisables?",
        type: "multiple_choice",
        options: [
          "jQuery",
          "React",
          "Express",
          "Lodash"
        ],
        correctAnswer: "React",
        explanation: "React est une bibliothèque JavaScript pour créer des interfaces utilisateur basées sur des composants."
      }
    ];
  } catch (error) {
    console.error('Erreur lors de la génération du test technique:', error);
    return [];
  }
}

module.exports = {
  analyzeResume,
  generateTechnicalTest
};