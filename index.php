<?php
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

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? $_GET['action'] ?? null;

if ($action === 'signup') {
    $name = $data['name'];
    $email = $data['email'];
    $password = $data['password'];

    $stmt = $pdo->prepare("INSERT INTO user (name, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $password]);
    echo json_encode(['success' => true, 'message' => 'Inscription réussie']);
} elseif ($action === 'login') {
    $email = $data['email'];
    $password = $data['password'];

    $stmt = $pdo->prepare("SELECT id FROM user WHERE email = ? AND password = ?");
    $stmt->execute([$email, $password]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        echo json_encode(['success' => true, 'user_id' => $user['id'], 'message' => 'Connexion réussie']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Identifiants incorrects']);
    }
} elseif ($action === 'get_candidates') {
    $stmt = $pdo->query("SELECT * FROM candidates");
    $candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($candidates);
} elseif ($action === 'vote') {
    $userId = $data['user_id'];
    $candidateId = $data['candidate_id'];

    $stmt = $pdo->prepare("SELECT * FROM votes WHERE user_id = ?");
    $stmt->execute([$userId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Vous avez déjà voté']);
    } else {
        $stmt = $pdo->prepare("INSERT INTO votes (user_id, candidate_id) VALUES (?, ?)");
        $stmt->execute([$userId, $candidateId]);
        echo json_encode(['success' => true, 'message' => 'Votre vote a été enregistré']);
    }
}
