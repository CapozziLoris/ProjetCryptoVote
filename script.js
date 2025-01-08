document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const loginSection = document.getElementById("login");
    const signupSection = document.getElementById("signup");
    const voteSection = document.getElementById("vote");

    const loginMessage = document.getElementById("loginMessage");
    const signupMessage = document.getElementById("signupMessage");

    const showLoginButton = document.getElementById("showLogin");
    const showSignupButton = document.getElementById("showSignup");

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

                // Affichage de la section vote après connexion
                loginSection.style.display = "none";
                signupSection.style.display = "none";
                voteSection.style.display = "block";
            } else {
                loginMessage.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch (error) {
            loginMessage.innerHTML = `<div class="alert alert-danger">Erreur de communication avec le serveur</div>`;
            console.error("Erreur :", error);
        }
    });
});
