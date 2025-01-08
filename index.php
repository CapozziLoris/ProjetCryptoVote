<?php
// Configuration de la connexion à la base de données
$host = 'localhost';
$dbname = 'DBVote';
$username = 'root';
$password = 'phpmyadmin';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données']);
    exit();
}

// Lecture des données JSON depuis la requête
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Données JSON invalides']);
    exit();
}

// Extraction des champs de la requête
$action = $data['action'] ?? null;
$name = $data['name'] ?? null;
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;

if ($action === 'signup') {
    // Vérification que les champs ne sont pas vides
    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Tous les champs sont requis']);
        exit();
    }

    try {
        // Insertion dans la table user
        $stmt = $pdo->prepare("INSERT INTO user (name, email, password) VALUES (:name, :email, :password)");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password); // Pas de hachage du mot de passe ici
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Inscription réussie']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'inscription']);
    }
} elseif ($action === 'login') {
    // Vérification que les champs ne sont pas vides
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Tous les champs sont requis']);
        exit();
    }

    try {
        // Vérification des informations de connexion
        $stmt = $pdo->prepare("SELECT * FROM user WHERE email = :email AND password = :password");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password); // Pas de hachage du mot de passe ici
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            echo json_encode(['success' => true, 'message' => 'Connexion réussie']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la connexion']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
}
