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

// Charger les clés RSA
function load_rsa_keys() {
    $public_key = file_get_contents('public_key.pem');
    $private_key = file_get_contents('private_key.pem');
    return [$public_key, $private_key];
}

// Chiffrement AES
function encrypt_aes($data, $aes_key) {
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
    $encrypted_data = openssl_encrypt($data, 'aes-256-cbc', $aes_key, 0, $iv);
    return $iv . $encrypted_data;
}

// Déchiffrement AES
function decrypt_aes($encrypted_data, $aes_key) {
    $iv = substr($encrypted_data, 0, openssl_cipher_iv_length('aes-256-cbc'));
    $ciphertext = substr($encrypted_data, openssl_cipher_iv_length('aes-256-cbc'));
    return openssl_decrypt($ciphertext, 'aes-256-cbc', $aes_key, 0, $iv);
}

// Chiffrement de la clé AES avec RSA
function encrypt_rsa_key($aes_key, $public_key) {
    openssl_public_encrypt($aes_key, $encrypted_key, $public_key);
    return $encrypted_key;
}

// Déchiffrement de la clé AES avec RSA
function decrypt_rsa_key($encrypted_key, $private_key) {
    openssl_private_decrypt($encrypted_key, $aes_key, $private_key);
    return $aes_key;
}

// HMAC
function generate_hmac($data, $secret_key) {
    return hash_hmac('sha256', $data, $secret_key, true);
}

function verify_hmac($data, $hmac_received, $secret_key) {
    $hmac_calculated = generate_hmac($data, $secret_key);
    return hash_equals($hmac_calculated, $hmac_received);
}

// Actions
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
    // Récupérer les données du vote
    $userId = $data['user_id'];
    $candidateId = $data['candidate_id'];
    $secret_key = 'your-secret-key'; // Clé secrète partagée pour HMAC

    // Vérifier si l'utilisateur a déjà voté
    $stmt = $pdo->prepare("SELECT * FROM votes WHERE user_id = ?");
    $stmt->execute([$userId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Vous avez déjà voté']);
    } else {
        // Chiffrer les données du vote avec AES
        $vote_data = "Vote for candidate: " . $candidateId;
        $aes_key = openssl_random_pseudo_bytes(32); // Générer une clé AES unique
        $encrypted_data = encrypt_aes($vote_data, $aes_key);

        // Chiffrer la clé AES avec la clé publique RSA
        list($public_key, $private_key) = load_rsa_keys();
        $encrypted_aes_key = encrypt_rsa_key($aes_key, $public_key);

        // Calculer le HMAC pour l'intégrité
        $hmac_value = generate_hmac($encrypted_data, $secret_key);

        // Insérer le vote dans la base de données
        $stmt = $pdo->prepare("INSERT INTO votes (user_id, candidate_id, encrypted_vote_data, encrypted_aes_key, hmac_value) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $candidateId, $encrypted_data, $encrypted_aes_key, $hmac_value]);

        echo json_encode(['success' => true, 'message' => 'Votre vote a été enregistré']);
    }
}
?>
