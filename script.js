const loginSection = document.getElementById('login');
const signupSection = document.getElementById('signup');
const voteSection = document.getElementById('vote');
const navLinks = document.getElementById('navLinks');
const navLogin = document.getElementById('navLogin');
const navSignup = document.getElementById('navSignup');
let isAuthenticated = false;

document.getElementById('showLogin').addEventListener('click', () => {
    loginSection.style.display = 'block';
    signupSection.style.display = 'none';
    voteSection.style.display = 'none';
});

document.getElementById('showSignup').addEventListener('click', () => {
    signupSection.style.display = 'block';
    loginSection.style.display = 'none';
    voteSection.style.display = 'none';
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    isAuthenticated = true; // Simulate authentication
    alert('Connexion réussie !');
    loginSection.style.display = 'none';
    voteSection.style.display = 'block';

    // Update navbar
    navLogin.style.display = 'none';
    navSignup.style.display = 'none';
    const logoutLink = document.createElement('li');
    logoutLink.classList.add('nav-item');
    logoutLink.innerHTML = '<a class="nav-link" href="#" id="logout">Déconnexion</a>';
    navLinks.appendChild(logoutLink);

    document.getElementById('logout').addEventListener('click', () => {
        isAuthenticated = false;
        alert('Vous êtes déconnecté.');
        location.reload();
    });
});

document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    signupSection.style.display = 'none';
    loginSection.style.display = 'block';
});

document.getElementById('voteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedCandidate = document.querySelector('input[name="candidate"]:checked');
    if (!selectedCandidate) {
        alert('Veuillez sélectionner un candidat avant de voter.');
        return;
    }

    const confirmVote = confirm(`Vous êtes sur le point de voter pour le candidat ${selectedCandidate.value}. Confirmez-vous ce choix ?`);
    if (confirmVote) {
        alert('Votre vote a été enregistré avec succès. Merci pour votre participation !');
        document.getElementById('voteForm').reset(); // Réinitialiser le formulaire
    }
});
