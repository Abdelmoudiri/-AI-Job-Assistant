// content.js - scanner pour Indeed qui détecte les offres et extrait les tags tech

// effacer les anciennes offres quand la page se charge/navigue
chrome.runtime.sendMessage({ type: 'clearJobs' }, () => {});

function scanIndeedJobs() {
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

    // calculer le score de match (0-100)
    function calculateMatchScore(text, tags) {
      if (!text) return 0;
      const lowerText = text.toLowerCase();
      
      // mots-clés importants pour le score
      const skillKeywords = [
        'java', 'javascript', 'python', 'php', 'react', 'node', 'angular', 'vue',
        'sql', 'mysql', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'aws',
        'git', 'agile', 'scrum', 'api', 'rest', 'graphql', 'typescript'
      ];
      
      const levelKeywords = {
        junior: 10,
        'débutant': 10,
        'junior': 10,
        'stage': 15,
        'alternance': 15,
        'intermédiaire': -5,
        'confirmé': -10,
        'senior': -15,
        'lead': -20,
        '5 ans': -10,
        '3 ans': -5
      };
      
      let score = 50; // score de base
      
      // +5 points par compétence technique trouvée
      let skillsFound = 0;
      for (const skill of skillKeywords) {
        if (lowerText.includes(skill)) {
          skillsFound++;
        }
      }
      score += Math.min(skillsFound * 5, 30); // max +30 pour les compétences
      
      // ajustement selon le niveau demandé
      for (const [keyword, adjustment] of Object.entries(levelKeywords)) {
        if (lowerText.includes(keyword)) {
          score += adjustment;
          break; // un seul ajustement de niveau
        }
      }
      
      // +10 si tags détectés
      if (tags && tags.length > 0) {
        score += Math.min(tags.length * 3, 15);
      }
      
      // limiter entre 0 et 100
      return Math.max(0, Math.min(100, Math.round(score)));
    }

    function pushJob(title, company, description, url) {
      if (!title) return;
      const text = (title + '\n' + (company||'') + '\n' + (description||'')).trim();
      const tags = extractTags(text);
      const matchScore = calculateMatchScore(text, tags);
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
    document.querySelectorAll('.jobsearch-SerpJobCard, .result, .slider_item, .job_seen_beacon').forEach(card => {
      const title = card.querySelector('h2.jobTitle, h2.title, .jobTitle, a.jobtitle')?.innerText || card.querySelector('a')?.innerText;
      const company = card.querySelector('.companyName, .company, .company')?.innerText;
      const url = card.querySelector('a')?.href || location.href;
      const desc = card.querySelector('.summary, .job-snippet')?.innerText || '';
      pushJob(title, company, desc, url);
    });

    // page de détails d'offre
    const detTitle = document.querySelector('h1.jobsearch-JobInfoHeader-title, h1')?.innerText;
    if (detTitle) {
      const detCompany = document.querySelector('.jobsearch-InlineCompanyRating div, .jobsearch-CompanyInfoWithoutHeaderImage div')?.innerText || document.querySelector('.company')?.innerText;
      const detDesc = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText, .job-description')?.innerText || '';
      pushJob(detTitle, detCompany, detDesc, location.href);
    }

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
scanIndeedJobs();

// écouter les demandes de rescan depuis le popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'rescan') {
    console.log('🔄 Rescan demandé par le popup');
    
    // effacer les offres d'abord
    chrome.runtime.sendMessage({ type: 'clearJobs' }, () => {});
    
    // rescanner immédiatement
    setTimeout(() => {
      scanIndeedJobs();
    }, 100);
    
    sendResponse({ ok: true });
  }
  return true;
});
