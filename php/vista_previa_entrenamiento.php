<?php
include 'config.php';

$id = $_GET['id'];

try {
    $pdo = connectDB();

    // Obtener descripción del entrenamiento
    $stmt = $pdo->prepare("SELECT descripcion FROM entrenamientos WHERE id = ?");
    $stmt->execute([$id]);
    $descripcion = $stmt->fetchColumn();

    // Obtener las fases del entrenamiento
    $stmtFases = $pdo->prepare("SELECT nombre FROM fases_entrenamiento WHERE entrenamiento_id = ?");
    $stmtFases->execute([$id]);
    $fases = $stmtFases->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['descripcion' => $descripcion, 'fases' => $fases]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al cargar los detalles del entrenamiento.']);
}
?>
