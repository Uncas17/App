<?php
include 'config.php';

try {
    $pdo = connectDB();
    $stmt = $pdo->query("SELECT id, nombre FROM entrenamientos WHERE estado = 'Activo'");
    $entrenamientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($entrenamientos);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al cargar los entrenamientos.']);
}
?>
