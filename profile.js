// profile.js - gestion du profil utilisateur

// éléments du DOM
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const locationInput = document.getElementById('location');
const experienceLevelSelect = document.getElementById('experienceLevel');
const jobTitleInput = document.getElementById('jobTitle');
const skillInput = document.getElementById('skillInput');
const addSkillBtn = document.getElementById('addSkillBtn');
const skillsContainer = document.getElementById('skillsContainer');
const contractTypeSelect = document.getElementById('contractType');
const remotePreferenceSelect = document.getElementById('remotePreference');
const bioTextarea = document.getElementById('bio');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const successMessage = document.getElementById('successMessage');

// tableau des compétences
let skills = [];

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
      
      skills = profile.skills || [];
      renderSkills();
    }
  });
}

// afficher les compétences
function renderSkills() {
  skillsContainer.innerHTML = '';
  
  if (skills.length === 0) {
    skillsContainer.innerHTML = '<p style="color: #999; font-size: 13px;">Aucune compétence ajoutée</p>';
    return;
  }
  
  skills.forEach((skill, index) => {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      <span>${skill}</span>
      <span class="remove" data-index="${index}">×</span>
    `;
    skillsContainer.appendChild(tag);
  });
  
  // ajouter les événements de suppression
  document.querySelectorAll('.skill-tag .remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      skills.splice(index, 1);
      renderSkills();
    });
  });
}

// ajouter une compétence
function addSkill() {
  const skill = skillInput.value.trim();
  
  if (!skill) {
    skillInput.focus();
    return;
  }
  
  // vérifier si la compétence existe déjà
  if (skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
    alert('Cette compétence existe déjà!');
    return;
  }
  
  skills.push(skill);
  skillInput.value = '';
  skillInput.focus();
  renderSkills();
}

// événement: ajouter compétence avec bouton
addSkillBtn.addEventListener('click', addSkill);

// événement: ajouter compétence avec Enter
skillInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addSkill();
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
  
  if (skills.length === 0) {
    const confirm = window.confirm('⚠️ Tu n\'as ajouté aucune compétence. Le score de match sera moins précis. Continuer?');
    if (!confirm) return;
  }
  
  const profile = {
    fullName: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    location: locationInput.value.trim(),
    experienceLevel: experienceLevelSelect.value,
    jobTitle: jobTitleInput.value.trim(),
    skills: skills,
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
