const toastContainer = document.getElementById('toastContainer');
const themeToggle = document.getElementById('themeToggle');

const railFencePlaintext = document.getElementById('railFencePlaintext');
const railFenceRailsEncrypt = document.getElementById('railFenceRailsEncrypt');
const railFenceEncryptBtn = document.getElementById('railFenceEncryptBtn');
const railFenceCiphertext = document.getElementById('railFenceCiphertext');
const railFenceMatrix = document.getElementById('railFenceMatrix');
const railFenceSteps = document.getElementById('railFenceSteps');
const railFenceCipherInput = document.getElementById('railFenceCipherInput');
const railFenceRailsDecrypt = document.getElementById('railFenceRailsDecrypt');
const railFenceDecryptBtn = document.getElementById('railFenceDecryptBtn');
const railFencePlainResult = document.getElementById('railFencePlainResult');

const rsaGenerateBtn = document.getElementById('rsaGenerateBtn');
const rsaPublicKey = document.getElementById('rsaPublicKey');
const rsaPrivateKey = document.getElementById('rsaPrivateKey');
const rsaSteps = document.getElementById('rsaSteps');
const rsaMessage = document.getElementById('rsaMessage');
const rsaEncryptPublicKey = document.getElementById('rsaEncryptPublicKey');
const rsaEncryptBtn = document.getElementById('rsaEncryptBtn');
const rsaCiphertext = document.getElementById('rsaCiphertext');
const rsaCipherInput = document.getElementById('rsaCipherInput');
const rsaDecryptPrivateKey = document.getElementById('rsaDecryptPrivateKey');
const rsaDecryptBtn = document.getElementById('rsaDecryptBtn');
const rsaPlaintext = document.getElementById('rsaPlaintext');

const registerUsername = document.getElementById('registerUsername');
const registerPassword = document.getElementById('registerPassword');
const registerAlgorithm = document.getElementById('registerAlgorithm');
const registerBtn = document.getElementById('registerBtn');
const registerHashFlow = document.getElementById('registerHashFlow');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const loginResult = document.getElementById('loginResult');
const verifyUsername = document.getElementById('verifyUsername');
const verifyPassword = document.getElementById('verifyPassword');
const verifyBtn = document.getElementById('verifyBtn');
const verifyResult = document.getElementById('verifyResult');
const passwordStrengthBar = document.getElementById('passwordStrengthBar');
const passwordStrengthLabel = document.getElementById('passwordStrengthLabel');

function showToast(message, variant = 'info') {
  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-bg-dark border-0 mb-2';
  toast.id = toastId;
  toast.role = 'alert';
  toast.ariaLive = 'assertive';
  toast.ariaAtomic = 'true';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body border-start border-3 ps-3 ${variant === 'success' ? 'border-success' : variant === 'danger' ? 'border-danger' : 'border-info'}">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  const instance = bootstrap.Toast.getOrCreateInstance(toast, { delay: 2400 });
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  instance.show();
}

function copyText(value) {
  navigator.clipboard.writeText(value).then(() => {
    showToast('Copied to clipboard', 'success');
  }).catch(() => {
    showToast('Copy failed', 'danger');
  });
}

function getElementText(id) {
  const element = document.getElementById(id);
  return element ? element.innerText.trim() : '';
}

function renderMatrix(container, matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    container.innerHTML = '<div class="result-box">No matrix data available.</div>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'matrix-table';

  matrix.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.className = cell ? '' : 'empty';
      td.textContent = cell || '.';
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.innerHTML = '';
  container.appendChild(table);
}

function formatObjectLines(object) {
  return Object.entries(object).map(([key, value]) => `${key}: ${value}`).join('\n');
}

function setStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const width = Math.min(score * 20, 100);
  passwordStrengthBar.style.width = `${width}%`;

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  passwordStrengthLabel.textContent = labels[Math.max(0, score - 1)] || 'Weak';
}

function applyTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');
  localStorage.setItem('cryptography-theme', theme);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('cryptography-theme') || 'dark';
  applyTheme(savedTheme);
}

async function callApi(url, payload) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };

  const pathsToTry = [`/api${url}`, url];
  let lastError = null;

  for (const requestUrl of pathsToTry) {
    try {
      const response = await fetch(requestUrl, requestOptions);
      const data = await response.json();

      if (response.ok) {
        return data;
      }

      if (requestUrl.startsWith('/api') && response.status === 404) {
        lastError = new Error(data.error || 'Request failed');
        continue;
      }

      throw new Error(data.error || 'Request failed');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Request failed');
}

railFenceEncryptBtn.addEventListener('click', async () => {
  try {
    const data = await callApi('/railfence/encrypt', {
      plaintext: railFencePlaintext.value,
      rails: railFenceRailsEncrypt.value
    });

    railFenceCiphertext.textContent = data.ciphertext;
    railFenceCipherInput.value = data.ciphertext;
    railFenceRailsDecrypt.value = data.rails;
    railFencePlainResult.textContent = data.ciphertext;
    railFenceSteps.textContent = `${data.steps.note}\nTraversal: ${data.pattern.join(' → ')}`;
    renderMatrix(railFenceMatrix, data.matrix);
    showToast('Rail Fence encryption complete', 'success');
  } catch (error) {
    showToast(error.message, 'danger');
  }
});

railFenceDecryptBtn.addEventListener('click', async () => {
  try {
    const data = await callApi('/railfence/decrypt', {
      ciphertext: railFenceCipherInput.value,
      rails: railFenceRailsDecrypt.value
    });

    railFencePlainResult.textContent = data.plaintext;
    renderMatrix(railFenceMatrix, data.matrix);
    railFenceSteps.textContent = data.steps.note;
    showToast('Rail Fence decryption complete', 'success');
  } catch (error) {
    showToast(error.message, 'danger');
  }
});

rsaGenerateBtn.addEventListener('click', async () => {
  try {
    const data = await callApi('/rsa/generate', {});
    rsaPublicKey.textContent = `${data.publicKey.e}, ${data.publicKey.n}`;
    rsaPrivateKey.textContent = `${data.privateKey.d}, ${data.privateKey.n}`;
    rsaEncryptPublicKey.value = `${data.publicKey.e}, ${data.publicKey.n}`;
    rsaDecryptPrivateKey.value = `${data.privateKey.d}, ${data.privateKey.n}`;
    rsaSteps.textContent = formatObjectLines(data.steps);
    showToast('RSA keys generated', 'success');
  } catch (error) {
    showToast(error.message, 'danger');
  }
});

rsaEncryptBtn.addEventListener('click', async () => {
  try {
    const data = await callApi('/rsa/encrypt', {
      message: rsaMessage.value,
      publicKey: rsaEncryptPublicKey.value
    });

    rsaCiphertext.textContent = data.ciphertext;
    rsaCipherInput.value = data.ciphertext;
    showToast('RSA encryption complete', 'success');
  } catch (error) {
    showToast(error.message, 'danger');
  }
});

rsaDecryptBtn.addEventListener('click', async () => {
  try {
    const data = await callApi('/rsa/decrypt', {
      ciphertext: rsaCipherInput.value,
      privateKey: rsaDecryptPrivateKey.value
    });

    rsaPlaintext.textContent = data.plaintext;
    showToast('RSA decryption complete', 'success');
  } catch (error) {
    showToast(error.message, 'danger');
  }
});

registerPassword.addEventListener('input', () => {
  setStrength(registerPassword.value);
  registerHashFlow.textContent = `${registerPassword.value || 'Plaintext'} → ${registerAlgorithm.value.toUpperCase()} hash → Store in database`;
});

registerAlgorithm.addEventListener('change', () => {
  registerHashFlow.textContent = `${registerPassword.value || 'Plaintext'} → ${registerAlgorithm.value.toUpperCase()} hash → Store in database`;
});

registerBtn.addEventListener('click', async () => {
  try {
    const data = await callApi('/auth/register', {
      username: registerUsername.value,
      password: registerPassword.value,
      algorithm: registerAlgorithm.value
    });

    registerHashFlow.textContent = `Plaintext: ${data.hashPreview.plaintext}\n${data.hashPreview.algorithm.toUpperCase()} digest: ${data.hashPreview.digest}\nStored: ${data.hashPreview.storedValue}`;
    loginUsername.value = registerUsername.value;
    verifyUsername.value = registerUsername.value;
    showToast('Registration successful', 'success');
  } catch (error) {
    showToast(error.message, 'danger');
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    const data = await callApi('/auth/login', {
      username: loginUsername.value,
      password: loginPassword.value
    });

    loginResult.textContent = `${data.message}\nUser: ${data.user.username}\nHash comparison: ${data.verification.candidateHash} === ${data.verification.storedHash}`;
    showToast('Login successful', 'success');
  } catch (error) {
    loginResult.textContent = error.message;
    showToast(error.message, 'danger');
  }
});

verifyBtn.addEventListener('click', async () => {
  try {
    const data = await callApi('/auth/verify', {
      username: verifyUsername.value,
      password: verifyPassword.value
    });

    verifyResult.textContent = `Plaintext → ${data.algorithm.toUpperCase()} → Hash\nCandidate: ${data.candidateHash}\nStored: ${data.storedHash}\nMatch: ${data.match ? 'Yes' : 'No'}`;
    showToast(data.match ? 'Password verified' : 'Password does not match', data.match ? 'success' : 'danger');
  } catch (error) {
    verifyResult.textContent = error.message;
    showToast(error.message, 'danger');
  }
});

document.querySelectorAll('.copy-btn').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-copy-target');
    if (!target) {
      return;
    }

    copyText(getElementText(target));
  });
});

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.contains('light-theme');
  applyTheme(isLight ? 'dark' : 'light');
});

initializeTheme();
setStrength('');
