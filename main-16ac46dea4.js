/**
 * 
 * @param {string} password 
 * @param {string} saltB64 
 * @param {number|string} iterations 
 * @returns {object}
 */
function getKey(password, saltB64, iterations) {
    let salt = CryptoJS.enc.Base64.parse(saltB64);
    let key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: Number(iterations),
    });
    return key;
}

/**
 * 
 * @returns {string}
 */
function generateSaltB64() {
    let salt = CryptoJS.lib.WordArray.random(32);
    let saltB64 = CryptoJS.enc.Base64.stringify(salt);
    return saltB64;
}

/**
 * 
 * @param {string} plaintext 
 * @param {object} key 
 * @returns {[string, string]}
 */
function encryptText(plaintext, key) {
    let iv = CryptoJS.lib.WordArray.random(16);
    let encrypted = CryptoJS.AES.encrypt(plaintext, key, {iv: iv});
    let ivB64 = CryptoJS.enc.Base64.stringify(iv);
    let ciphertextB64 = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    return [ivB64, ciphertextB64];
}

/**
 * 
 * @param {string} ivB64 
 * @param {string} ciphertextB64 
 * @param {object} key 
 * @returns {string}
 */
function decryptText(ivB64, ciphertextB64, key) {
    let iv = CryptoJS.enc.Base64.parse(ivB64);
    let decrypted = CryptoJS.AES.decrypt(ciphertextB64, key, {iv: iv});
    let plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    return plaintext;
}

function resizeTextarea() {
    let textarea = document.getElementById('text');
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 1 + 'px';
    window.scrollTo(0, document.body.scrollHeight);
}

document.getElementById('encrypt').addEventListener('click', function() {
    let password = document.getElementById('password').value;
    let iterations = document.getElementById('iterations').value;
    let text = document.getElementById('text').value;
    let loader = this.querySelector('.loader');
    loader.classList.remove('hidden');
    let salt = generateSaltB64();
    setTimeout(() => {
        let key = getKey(password, salt, iterations);
        let [iv, ciphertext] = encryptText(text, key);
        let encrypted = [iterations, salt, iv, ciphertext].join('_');
        document.getElementById('text').value = encrypted;
        loader.classList.add('hidden');
        resizeTextarea();
    }, 1);
});

document.getElementById('decrypt').addEventListener('click', function() {
    let password = document.getElementById('password').value;
    let text = document.getElementById('text').value;
    let loader = this.querySelector('.loader');
    loader.classList.remove('hidden');
    let textArray = text.split('_');
    let iterations = textArray[0];
    let salt = textArray[1];
    let iv = textArray[2];
    let ciphertext = textArray[3];
    setTimeout(() => {
        let key = getKey(password, salt, iterations);
        let plaintext = decryptText(iv, ciphertext, key);
        document.getElementById('text').value = plaintext;
        document.getElementById('iterations').value = iterations;
        loader.classList.add('hidden');
        resizeTextarea();
    }, 1);
});

document.getElementById('copy').addEventListener('click', function() {
    let text = document.getElementById('text').value;
    navigator.clipboard.writeText(text).then(() => {
        this.innerText = 'Copied';
        setTimeout(() => {
            this.innerText = 'Copy';
        }, 1000);
    });
});

document.getElementById('toggle-password').addEventListener('click', function() {
    let img = this.querySelector('img');
    let password = document.getElementById('password');
    if (password.type === 'password') {
        password.type = 'text';
        img.src = 'img/visibility.svg';
    } else {
        password.type = 'password';
        img.src = 'img/visibility_off.svg';
    }
});

document.getElementById('text').addEventListener('input', resizeTextarea);