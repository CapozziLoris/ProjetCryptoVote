document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const loginSection = document.getElementById("login");
    const signupSection = document.getElementById("signup");
    const voteSection = document.getElementById("vote");

    const loginMessage = document.getElementById("loginMessage");
    const signupMessage = document.getElementById("signupMessage");
    const voteMessage = document.getElementById("voteMessage");

    const showLoginButton = document.getElementById("showLogin");
    const showSignupButton = document.getElementById("showSignup");

    let currentUserId = null;

    // Gestion de la navigation
    showLoginButton.addEventListener("click", function (event) {
        event.preventDefault();
        loginSection.style.display = "block";
        signupSection.style.display = "none";
        voteSection.style.display = "none";
    });

    showSignupButton.addEventListener("click", function (event) {
        event.preventDefault();
        loginSection.style.display = "none";
        signupSection.style.display = "block";
        voteSection.style.display = "none";
    });

    // Chargement des candidats
    async function loadCandidates() {
        const response = await fetch("index.php?action=get_candidates");
        const candidates = await response.json();

        const candidatesList = document.getElementById("candidatesList");
        candidatesList.innerHTML = candidates
            .map((candidate) => `
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${candidate.name}</h5>
                            <input type="radio" name="candidate" value="${candidate.id}">
                        </div>
                    </div>
                </div>
            `)
            .join("");
    }

    // Inscription
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();

        try {
            const response = await fetch("index.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "signup",
                    name: name,
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                signupMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                signupForm.reset();
            } else {
                signupMessage.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch (error) {
            signupMessage.innerHTML = `<div class="alert alert-danger">Erreur de communication avec le serveur</div>`;
            console.error("Erreur :", error);
        }
    });

    // Connexion
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        try {
            const response = await fetch("index.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "login",
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                loginMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                loginForm.reset();

                // Passage à la section vote
                currentUserId = data.user_id;
                loginSection.style.display = "none";
                signupSection.style.display = "none";
                voteSection.style.display = "block";

                // Charger les candidats
                loadCandidates();
            } else {
                loginMessage.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch (error) {
            loginMessage.innerHTML = `<div class="alert alert-danger">Erreur de communication avec le serveur</div>`;
            console.error("Erreur :", error);
        }
    });

    // Soumission du vote
    voteForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const selectedCandidate = document.querySelector('input[name="candidate"]:checked');

        if (!selectedCandidate) {
            voteMessage.innerHTML = `<div class="alert alert-danger">Veuillez sélectionner un candidat.</div>`;
            return;
        }

        try {
            const response = await fetch("index.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "vote",
                    user_id: currentUserId,
                    candidate_id: selectedCandidate.value,
                }),
            });

            const data = await response.json();

            if (data.success) {
                voteMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            } else {
                voteMessage.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch (error) {
            voteMessage.innerHTML = `<div class="alert alert-danger">Erreur de communication avec le serveur</div>`;
            console.error("Erreur :", error);
        }
    });
});
