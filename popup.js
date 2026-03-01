document.addEventListener('DOMContentLoaded', () => {
  const siteInput = document.getElementById('siteInput');
  const addBtn = document.getElementById('addBtn');
  const blockList = document.getElementById('blockList');
  const applyModeBtn = document.getElementById('applyModeBtn');
  
  // Setup Elements
  const passwordSetupForm = document.getElementById('passwordSetupForm');
  const passwordInput = document.getElementById('passwordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const showPwdSetup = document.getElementById('showPwdSetup');
  const setupError = document.getElementById('setupError');
  const setupSuccess = document.getElementById('setupSuccess');
  const savePasswordBtn = document.getElementById('savePasswordBtn');
  const passwordActiveState = document.getElementById('passwordActiveState');
  const openChangePwdBtn = document.getElementById('openChangePwdBtn');
  
  // Remove Site Modal Elements
  const passwordModal = document.getElementById('passwordModal');
  const modalPasswordInput = document.getElementById('modalPasswordInput');
  const showPwdRemove = document.getElementById('showPwdRemove');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalSiteText = document.getElementById('modalSiteText');
  const modalErrorText = document.getElementById('modalErrorText');

  // Change Password Modal Elements
  const changePwdModal = document.getElementById('changePwdModal');
  const oldPwdInput = document.getElementById('oldPwdInput');
  const newPwdInput = document.getElementById('newPwdInput');
  const confirmNewPwdInput = document.getElementById('confirmNewPwdInput');
  const showPwdChange = document.getElementById('showPwdChange');
  const confirmChangePwdBtn = document.getElementById('confirmChangePwdBtn');
  const cancelChangePwdBtn = document.getElementById('cancelChangePwdBtn');
  const changePwdError = document.getElementById('changePwdError');
  const changePwdSuccess = document.getElementById('changePwdSuccess');
  
  let currentPassword = null;
  let sitePendingRemoval = null;
  let liPendingRemoval = null;

  // --- Show Password Toggles ---
  showPwdSetup.addEventListener('change', (e) => {
    const type = e.target.checked ? 'text' : 'password';
    passwordInput.type = type;
    confirmPasswordInput.type = type;
  });

  showPwdChange.addEventListener('change', (e) => {
    const type = e.target.checked ? 'text' : 'password';
    oldPwdInput.type = type;
    newPwdInput.type = type;
    confirmNewPwdInput.type = type;
  });

  showPwdRemove.addEventListener('change', (e) => {
    modalPasswordInput.type = e.target.checked ? 'text' : 'password';
  });

  // --- 1. Initialization ---
  chrome.storage.local.get(['blockedSites', 'mode', 'appPassword'], (result) => {
    const sites = result.blockedSites || [];
    sites.forEach(site => addSiteToUI(site));
    
    const savedMode = result.mode || 'blacklist';
    document.querySelector(`input[name="mode"][value="${savedMode}"]`).checked = true;

    currentPassword = result.appPassword || null;
    if (currentPassword) lockPasswordUI();
  });

  // --- 2. Draft Mode Listener ---
  applyModeBtn.addEventListener('click', () => {
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    chrome.storage.local.set({ mode: selectedMode }, () => {
      const originalText = applyModeBtn.textContent;
      applyModeBtn.textContent = 'Settings Applied!';
      setTimeout(() => applyModeBtn.textContent = originalText, 1500);
    });
  });

  // --- 3. Set Initial Password ---
  savePasswordBtn.addEventListener('click', () => {
    const pwd = passwordInput.value.trim();
    const confirmPwd = confirmPasswordInput.value.trim();
    
    if (!pwd) {
      setupError.textContent = 'Password cannot be empty!';
      setupError.style.display = 'block';
      setupSuccess.style.display = 'none';
      return;
    }
    
    if (pwd !== confirmPwd) {
      setupError.textContent = 'Passwords do not match!';
      setupError.style.display = 'block';
      setupSuccess.style.display = 'none';
      return;
    }

    // Success! Show message and delay the UI lock
    setupError.style.display = 'none';
    chrome.storage.local.set({ appPassword: pwd }, () => {
      currentPassword = pwd;
      setupSuccess.style.display = 'block';
      savePasswordBtn.disabled = true; // Prevent double clicks
      
      // Wait 1.5 seconds so the user can read the success message
      setTimeout(() => {
        lockPasswordUI();
        
        // Clean up the form in the background
        savePasswordBtn.disabled = false;
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        setupSuccess.style.display = 'none';
        showPwdSetup.checked = false;
        passwordInput.type = 'password';
        confirmPasswordInput.type = 'password';
      }, 1500);
    });
  });

  function lockPasswordUI() {
    passwordSetupForm.style.display = 'none';
    passwordActiveState.style.display = 'flex';
  }

  // --- 4. Change Password Logic ---
  openChangePwdBtn.addEventListener('click', () => {
    oldPwdInput.value = '';
    newPwdInput.value = '';
    confirmNewPwdInput.value = '';
    showPwdChange.checked = false;
    oldPwdInput.type = 'password';
    newPwdInput.type = 'password';
    confirmNewPwdInput.type = 'password';
    
    changePwdError.style.display = 'none';
    changePwdSuccess.style.display = 'none';
    
    passwordModal.style.display = 'none'; 
    changePwdModal.style.display = 'block';
  });

  cancelChangePwdBtn.addEventListener('click', () => {
    changePwdModal.style.display = 'none';
  });

  confirmChangePwdBtn.addEventListener('click', () => {
    const oldAttempt = oldPwdInput.value;
    const newPwd = newPwdInput.value.trim();
    const confirmNew = confirmNewPwdInput.value.trim();

    if (oldAttempt !== currentPassword) {
      showChangeError('Incorrect current password!');
      return;
    }
    if (!newPwd) {
      showChangeError('New password cannot be empty!');
      return;
    }
    if (newPwd !== confirmNew) {
      showChangeError('New passwords do not match!');
      return;
    }

    // Success! Show message and delay modal close
    chrome.storage.local.set({ appPassword: newPwd }, () => {
      currentPassword = newPwd;
      changePwdError.style.display = 'none';
      changePwdSuccess.style.display = 'block';
      confirmChangePwdBtn.disabled = true; // Prevent double clicks
      
      // Wait 1.5 seconds, then close modal and clean up
      setTimeout(() => {
        changePwdModal.style.display = 'none';
        changePwdSuccess.style.display = 'none'; // Reset for next time
        confirmChangePwdBtn.disabled = false;
      }, 1500);
    });
  });

  function showChangeError(msg) {
    changePwdError.textContent = msg;
    changePwdError.style.display = 'block';
    changePwdSuccess.style.display = 'none';
  }

  // --- 5. Add and Remove Site Logic ---
  addBtn.addEventListener('click', () => {
    let rawInput = siteInput.value.trim().toLowerCase();
    if (rawInput) {
      try {
        if (rawInput.startsWith('http')) {
          rawInput = new URL(rawInput).hostname.replace('www.', '');
        } else {
          rawInput = rawInput.split('/')[0].replace('www.', '');
        }
      } catch (e) { console.log("Error parsing URL"); }

      const newSite = rawInput;
      chrome.storage.local.get(['blockedSites'], (result) => {
        const sites = result.blockedSites || [];
        if (!sites.includes(newSite)) {
          sites.push(newSite);
          chrome.storage.local.set({ blockedSites: sites }, () => {
            addSiteToUI(newSite);
            siteInput.value = ''; 
          });
        }
      });
    }
  });

  function addSiteToUI(site) {
    const li = document.createElement('li');
    const textSpan = document.createElement('span');
    textSpan.className = 'site-text';
    textSpan.textContent = site;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.className = 'delete-btn';
    
    deleteBtn.onclick = () => {
      if (currentPassword) {
        sitePendingRemoval = site;
        liPendingRemoval = li;
        modalSiteText.textContent = `Unlock to remove ${site}:`;
        modalPasswordInput.value = '';
        modalPasswordInput.type = 'password';
        showPwdRemove.checked = false;
        modalErrorText.style.display = 'none';
        
        changePwdModal.style.display = 'none'; 
        passwordModal.style.display = 'block';
      } else {
        removeSite(site, li);
      }
    };

    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    blockList.appendChild(li);
  }

  modalConfirmBtn.addEventListener('click', () => {
    if (modalPasswordInput.value === currentPassword) {
      removeSite(sitePendingRemoval, liPendingRemoval);
      passwordModal.style.display = 'none';
    } else {
      modalErrorText.style.display = 'block';
    }
  });

  modalCancelBtn.addEventListener('click', () => {
    passwordModal.style.display = 'none';
    sitePendingRemoval = null;
    liPendingRemoval = null;
  });

  function removeSite(siteToRemove, listItemElement) {
    chrome.storage.local.get(['blockedSites'], (result) => {
      let sites = result.blockedSites || [];
      sites = sites.filter(site => site !== siteToRemove);
      chrome.storage.local.set({ blockedSites: sites }, () => {
        listItemElement.remove(); 
      });
    });
  }
});