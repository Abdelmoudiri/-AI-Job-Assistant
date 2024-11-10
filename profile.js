// profile.js - gestion du profil utilisateur

// éléments du DOM
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const locationInput = document.getElementById('location');
const experienceLevelSelect = document.getElementById('experienceLevel');
const jobTitleInput = document.getElementById('jobTitle');
const customSkillInput = document.getElementById('customSkillInput');
const addCustomSkillBtn = document.getElementById('addCustomSkillBtn');
const customSkillsContainer = document.getElementById('customSkillsContainer');
const contractTypeSelect = document.getElementById('contractType');
const remotePreferenceSelect = document.getElementById('remotePreference');
const bioTextarea = document.getElementById('bio');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const successMessage = document.getElementById('successMessage');
const skillCountEl = document.getElementById('skillCount');
const selectedSkillsList = document.getElementById('selectedSkillsList');

// tableau des compétences personnalisées
let customSkills = [];

// Templates de bio
const bioTemplates = {
  professional: "Je suis un développeur web fullstack passionné, maîtrisant les technologies modernes telles que Laravel, ReactJS, et Docker. Actuellement en recherche d'un stage, je souhaite mettre en pratique mes compétences en conception d'applications web performantes et évolutives, tout en continuant à apprendre dans un environnement collaboratif et innovant.",
  
  dynamic: "Développeur web fullstack motivé et curieux, j'aime transformer des idées en solutions digitales concrètes. Grâce à mes compétences en Java, PHP, JavaScript et frameworks modernes (Laravel, ReactJS, Spring Boot), je conçois des applications robustes et bien structurées. Je recherche un stage pour renforcer mes compétences techniques et contribuer activement à des projets innovants.",
  
  simple: "Étudiant en développement web, je maîtrise les langages Java, PHP, et JavaScript, ainsi que des frameworks tels que Laravel, ReactJS et Spring Boot. Je cherche un stage en développement fullstack afin de mettre mes compétences en pratique et participer à des projets réels.",
  
  experienced: "Développeur fullstack avec une solide expérience en conception et développement d'applications web. Expert en PHP (Laravel, Symfony), JavaScript (React, Vue.js) et bases de données (MySQL, MongoDB). Passionné par les nouvelles technologies et les méthodologies Agile, je recherche un poste où je pourrai apporter mon expertise tout en relevant de nouveaux défis techniques.",
  
  junior: "Jeune développeur motivé et passionné par le code, j'ai acquis de solides bases en développement web à travers mes études et projets personnels. Maîtrisant HTML, CSS, JavaScript, PHP et des frameworks modernes, je suis prêt à apprendre rapidement et à m'investir pleinement dans une équipe dynamique. Je recherche une première expérience professionnelle pour développer mes compétences et contribuer à des projets concrets."
};

// Gérer la sélection des templates de bio
document.querySelectorAll('.bio-template').forEach(template => {
  template.addEventListener('click', function() {
    // Retirer la sélection des autres templates
    document.querySelectorAll('.bio-template').forEach(t => {
      t.style.border = '2px solid transparent';
      t.style.background = '#f8f9fa';
    });
    
    // Marquer ce template comme sélectionné
    this.style.border = '2px solid #667eea';
    this.style.background = '#f0f4ff';
    
    // Remplir le textarea avec le texte du template
    const templateType = this.dataset.template;
    bioTextarea.value = bioTemplates[templateType];
    
    // Animation de feedback
    bioTextarea.style.border = '2px solid #667eea';
    setTimeout(() => {
      bioTextarea.style.border = '1px solid #ddd';
    }, 1000);
  });
  
  // Effet hover
  template.addEventListener('mouseenter', function() {
    if (this.style.border !== '2px solid #667eea') {
      this.style.background = '#e8ecf7';
    }
  });
  
  template.addEventListener('mouseleave', function() {
    if (this.style.border !== '2px solid #667eea') {
      this.style.background = '#f8f9fa';
    }
  });
});

// mettre à jour le résumé des compétences sélectionnées
function updateSkillsSummary() {
  const checkedBoxes = document.querySelectorAll('.skill-checkbox input[type="checkbox"]:checked');
  const selectedSkills = Array.from(checkedBoxes).map(cb => cb.value);
  const allSkills = [...selectedSkills, ...customSkills];
  
  skillCountEl.textContent = allSkills.length;
  
  selectedSkillsList.innerHTML = '';
  allSkills.forEach(skill => {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.textContent = skill;
    selectedSkillsList.appendChild(tag);
  });
}

// gérer les changements de checkboxes
document.querySelectorAll('.skill-checkbox input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', updateSkillsSummary);
});

// charger le profil existant
function loadProfile() {
  chrome.storage.local.get(['userProfile'], (result) => {
    if (result.userProfile) {
      const profile = result.userProfile;
      
      fullNameInput.value = profile.fullName || '';
      emailInput.value = profile.email || '';
      phoneInput.value = profile.phone || '';
      locationInput.value = profile.location || '';
      experienceLevelSelect.value = profile.experienceLevel || 'junior';
      jobTitleInput.value = profile.jobTitle || '';
      contractTypeSelect.value = profile.contractType || 'all';
      remotePreferenceSelect.value = profile.remotePreference || 'all';
      bioTextarea.value = profile.bio || '';
      
      // charger les compétences cochées
      const skills = profile.skills || [];
      document.querySelectorAll('.skill-checkbox input[type="checkbox"]').forEach(checkbox => {
        if (skills.includes(checkbox.value)) {
          checkbox.checked = true;
        }
      });
      
      // charger les compétences personnalisées
      customSkills = profile.customSkills || [];
      renderCustomSkills();
      
      updateSkillsSummary();
    }
  });
}

// afficher les compétences personnalisées
function renderCustomSkills() {
  customSkillsContainer.innerHTML = '';
  
  if (customSkills.length === 0) {
    customSkillsContainer.innerHTML = '<p style="color: #999; font-size: 13px; margin-top: 10px;">Aucune compétence personnalisée</p>';
    return;
  }
  
  customSkills.forEach((skill, index) => {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      <span>${skill}</span>
      <span class="remove" data-index="${index}">×</span>
    `;
    customSkillsContainer.appendChild(tag);
  });
  
  // ajouter les événements de suppression
  document.querySelectorAll('#customSkillsContainer .skill-tag .remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      customSkills.splice(index, 1);
      renderCustomSkills();
      updateSkillsSummary();
    });
  });
}

// ajouter une compétence personnalisée
function addCustomSkill() {
  const skill = customSkillInput.value.trim();
  
  if (!skill) {
    customSkillInput.focus();
    return;
  }
  
  // vérifier si la compétence existe déjà
  if (customSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
    alert('Cette compétence existe déjà!');
    return;
  }
  
  customSkills.push(skill);
  customSkillInput.value = '';
  customSkillInput.focus();
  renderCustomSkills();
  updateSkillsSummary();
}

// événement: ajouter compétence personnalisée avec bouton
addCustomSkillBtn.addEventListener('click', addCustomSkill);

// événement: ajouter compétence personnalisée avec Enter
customSkillInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addCustomSkill();
  }
});

// sauvegarder le profil
function saveProfile() {
  // valider les champs obligatoires
  if (!fullNameInput.value.trim()) {
    alert('⚠️ Le nom complet est obligatoire!');
    fullNameInput.focus();
    return;
  }
  
  // récupérer toutes les compétences cochées
  const checkedBoxes = document.querySelectorAll('.skill-checkbox input[type="checkbox"]:checked');
  const selectedSkills = Array.from(checkedBoxes).map(cb => cb.value);
  const allSkills = [...selectedSkills, ...customSkills];
  
  if (allSkills.length === 0) {
    const confirm = window.confirm('⚠️ Tu n\'as sélectionné aucune compétence. Le score de match sera moins précis. Continuer?');
    if (!confirm) return;
  }
  
  const profile = {
    fullName: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    location: locationInput.value.trim(),
    experienceLevel: experienceLevelSelect.value,
    jobTitle: jobTitleInput.value.trim(),
    skills: allSkills,
    customSkills: customSkills,
    contractType: contractTypeSelect.value,
    remotePreference: remotePreferenceSelect.value,
    bio: bioTextarea.value.trim(),
    updatedAt: Date.now()
  };
  
  // sauvegarder dans le storage
  chrome.storage.local.set({ userProfile: profile }, () => {
    console.log('✅ Profil sauvegardé:', profile);
    
    // afficher le message de succès
    successMessage.style.display = 'block';
    
    // masquer après 3 secondes
    setTimeout(() => {
      successMessage.style.display = 'none';
      // fermer la page
      window.close();
    }, 2000);
  });
}

// événement: sauvegarder
saveBtn.addEventListener('click', saveProfile);

// événement: annuler
cancelBtn.addEventListener('click', () => {
  window.close();
});

// charger le profil au démarrage
loadProfile();
