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
