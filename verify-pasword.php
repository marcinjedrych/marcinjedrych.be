<?php

// Get the password from the POST request
$data = json_decode(file_get_contents('php://input'), true);
$password = $data['password'];

// Your actual password for comparison
$correctPassword = "pils2000";

// Check if the password is correct
if ($password === $correctPassword) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}

?>
