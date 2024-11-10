// content.js - scanner pour Indeed qui détecte les offres et extrait les tags tech

// fonction pour effacer les offres et attendre que ce soit terminé
async function clearJobsAndWait() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'clearJobs' }, () => {
      resolve();
    });
  });
}

async function scanIndeedJobs() {
  try {
    const jobs = [];

    function extractTags(text) {
      if (!text) return [];
      const s = text.toLowerCase();
      const keywords = {
        java: ['java'],
        php: ['php','laravel','symfony'],
        javascript: ['javascript','js','node','node.js'],
        react: ['react','react.js','reactjs'],
        python: ['python','django','flask'],
        csharp: ['c#','c sharp','.net','dotnet'],
        ruby: ['ruby','rails','ruby on rails'],
        sql: ['sql','mysql','postgres','postgresql'],
      };
      const tags = [];
      for (const tag in keywords) {
        for (const kw of keywords[tag]) {
          if (s.includes(kw)) { tags.push(tag); break; }
        }
      }
      // ajouter un tag générique developer si titre/desc contient des mots de développeur
      if (s.includes('develop') || s.includes('développeur') || s.includes('developer')) {
        if (!tags.includes('developer')) tags.unshift('developer');
      }
      return tags;
    }

    // calculer le score de match (0-100) basé sur le profil utilisateur
    async function calculateMatchScore(text, tags) {
      if (!text) return 0;
      const lowerText = text.toLowerCase();
      
      // récupérer le profil utilisateur
      const profile = await new Promise(resolve => {
        chrome.storage.local.get(['userProfile'], (result) => {
          resolve(result.userProfile || null);
        });
      });
      
      let score = 40; // score de base plus bas si pas de profil
      
      // si profil existe, calculer score personnalisé
      if (profile) {
        score = 50; // score de base avec profil
        
        // +10 points par compétence de l'utilisateur trouvée dans l'offre
        const userSkills = profile.skills || [];
        let matchingSkills = 0;
        
        for (const skill of userSkills) {
          if (lowerText.includes(skill.toLowerCase())) {
            matchingSkills++;
          }
        }
        
        // bonus progressif pour les compétences matchées (max +35 points)
        if (matchingSkills > 0) {
          score += Math.min(matchingSkills * 10, 35);
        }
        
        // ajustement selon le niveau de l'utilisateur vs offre
        const userLevel = profile.experienceLevel || 'junior';
        const levelAdjustments = {
          stage: { stage: 15, junior: 5, intermediate: -10, senior: -15 },
          junior: { stage: 10, junior: 15, intermediate: 5, senior: -5 },
          intermediate: { stage: -5, junior: 5, intermediate: 15, senior: 5 },
          senior: { stage: -10, junior: 0, intermediate: 10, senior: 15 }
        };
        
        // détecter le niveau demandé dans l'offre
        const offerLevelKeywords = {
          stage: ['stage', 'stagiaire', 'intern'],
          junior: ['junior', 'débutant', '0-2 ans', 'junior'],
          intermediate: ['intermédiaire', 'confirmé', '2-5 ans', '3 ans'],
          senior: ['senior', 'lead', 'expert', '5+ ans', '5 ans']
        };
        
        let detectedLevel = 'junior'; // par défaut
        for (const [level, keywords] of Object.entries(offerLevelKeywords)) {
          if (keywords.some(kw => lowerText.includes(kw))) {
            detectedLevel = level;
            break;
          }
        }
        
        // appliquer l'ajustement de niveau
        if (levelAdjustments[userLevel] && levelAdjustments[userLevel][detectedLevel]) {
          score += levelAdjustments[userLevel][detectedLevel];
        }
        
        // bonus si le type de contrat correspond
        if (profile.contractType && profile.contractType !== 'all') {
          const contractKeywords = {
            cdi: ['cdi', 'contrat indéterminé'],
            cdd: ['cdd', 'contrat déterminé'],
            stage: ['stage', 'stagiaire'],
            alternance: ['alternance', 'apprentissage'],
            freelance: ['freelance', 'indépendant', 'consultant']
          };
          
          const userContractKeys = contractKeywords[profile.contractType] || [];
          if (userContractKeys.some(kw => lowerText.includes(kw))) {
            score += 5;
          }
        }
        
        // bonus si localisation correspond
        if (profile.location && lowerText.includes(profile.location.toLowerCase())) {
          score += 5;
        }
      } else {
        // pas de profil - score générique basé sur mots-clés techniques
        const skillKeywords = [
          'java', 'javascript', 'python', 'php', 'react', 'node', 'angular', 'vue',
          'sql', 'mysql', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'aws',
          'git', 'agile', 'scrum', 'api', 'rest', 'graphql', 'typescript'
        ];
        
        let skillsFound = 0;
        for (const skill of skillKeywords) {
          if (lowerText.includes(skill)) {
            skillsFound++;
          }
        }
        score += Math.min(skillsFound * 4, 25);
      }
      
      // +5 si tags détectés
      if (tags && tags.length > 0) {
        score += Math.min(tags.length * 2, 10);
      }
      
      // limiter entre 0 et 100
      return Math.max(0, Math.min(100, Math.round(score)));
    }

    async function pushJob(title, company, description, url) {
      if (!title) return;
      const text = (title + '\n' + (company||'') + '\n' + (description||'')).trim();
      const tags = extractTags(text);
      const matchScore = await calculateMatchScore(text, tags);
      jobs.push({ 
        title: title.trim(), 
        company: company?.trim(), 
        description: description?.trim?.() || description, 
        url, 
        source: 'indeed', 
        tags, 
        matchScore,
        detectedAt: Date.now() 
      });
    }

    // sélecteurs Indeed pour résultats de recherche et détails d'offre
    // liste de résultats
    const jobPromises = [];
    
    document.querySelectorAll('.jobsearch-SerpJobCard, .result, .slider_item, .job_seen_beacon').forEach(card => {
      const title = card.querySelector('h2.jobTitle, h2.title, .jobTitle, a.jobtitle')?.innerText || card.querySelector('a')?.innerText;
      const company = card.querySelector('.companyName, .company, .company')?.innerText;
      const url = card.querySelector('a')?.href || location.href;
      const desc = card.querySelector('.summary, .job-snippet')?.innerText || '';
      jobPromises.push(pushJob(title, company, desc, url));
    });

    // page de détails d'offre
    const detTitle = document.querySelector('h1.jobsearch-JobInfoHeader-title, h1')?.innerText;
    if (detTitle) {
      const detCompany = document.querySelector('.jobsearch-InlineCompanyRating div, .jobsearch-CompanyInfoWithoutHeaderImage div')?.innerText || document.querySelector('.company')?.innerText;
      const detDesc = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText, .job-description')?.innerText || '';
      jobPromises.push(pushJob(detTitle, detCompany, detDesc, location.href));
    }

    // attendre que tous les jobs soient traités
    await Promise.all(jobPromises);

    if (jobs.length) {
      // dédupliquer par title+company+url
      const uniq = [];
      const seen = new Set();
      for (const j of jobs) {
        const key = (j.title||'') + '|' + (j.company||'') + '|' + (j.url||'');
        if (seen.has(key)) continue;
        seen.add(key); uniq.push(j);
      }
      chrome.runtime.sendMessage({ type: 'addJobs', jobs: uniq }, () => {});
    }
  } catch (e) {
    console.error('erreur content.js scanIndeedJobs', e);
  }
}

// scan initial au chargement de la page
(async () => {
  await clearJobsAndWait();
  await scanIndeedJobs();
})();

// écouter les demandes de rescan depuis le popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'rescan') {
    console.log('🔄 Rescan demandé par le popup');
    
    // effacer les offres d'abord et attendre
    (async () => {
      await clearJobsAndWait();
      await scanIndeedJobs();
      sendResponse({ ok: true });
    })();
    
    return true; // garder le canal ouvert pour sendResponse asynchrone
  }
  return false;
});
