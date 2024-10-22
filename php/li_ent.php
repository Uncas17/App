<?php
// Archivo: php/listar_entrenamientos.php

include 'config.php';

header('Content-Type: application/json');

try {
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener la lista de entrenamientos
    $stmt = $pdo->prepare("SELECT id, nombre FROM entrenamientos");
    $stmt->execute();
    $entrenamientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'entrenamientos' => $entrenamientos]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>