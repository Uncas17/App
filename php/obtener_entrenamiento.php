<?php
// Archivo: obtener_entrenamiento.php

// Habilitar la visualización de errores para depuración (opcional)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON para la respuesta

// Incluir archivo de configuración para la conexión a la base de datos
include 'config.php';

try {
    // Conectar a la base de datos
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener el ID del entrenamiento a través del parámetro GET
    if (!isset($_GET['id'])) {
        throw new Exception("ID de entrenamiento no proporcionado");
    }
    $entrenamientoId = $_GET['id'];

    // Consultar el entrenamiento
    $stmtEntrenamiento = $pdo->prepare("SELECT * FROM entrenamientos WHERE id = :id");
    $stmtEntrenamiento->bindParam(':id', $entrenamientoId);
    $stmtEntrenamiento->execute();
    $entrenamiento = $stmtEntrenamiento->fetch(PDO::FETCH_ASSOC);

    // Consultar los días asociados al entrenamiento
    $stmtDias = $pdo->prepare("
        SELECT id AS id_dia, dia, nombre_dia 
        FROM dias_entrenamiento 
        WHERE entrenamiento_id = :entrenamiento_id 
        ORDER BY dia ASC
    ");
    $stmtDias->bindParam(':entrenamiento_id', $entrenamientoId);
    $stmtDias->execute();
    $dias = $stmtDias->fetchAll(PDO::FETCH_ASSOC);

    // Consultar las fases para cada día
    foreach ($dias as &$dia) {
        $stmtFases = $pdo->prepare("
            SELECT id AS id_fase, orden, nombre 
            FROM fases_entrenamiento 
            WHERE dia_id = :dia_id 
            ORDER BY orden ASC
        ");
        $stmtFases->bindParam(':dia_id', $dia['id_dia']);
        $stmtFases->execute();
        $dia['fases'] = $stmtFases->fetchAll(PDO::FETCH_ASSOC);
    }

    // Devolver el entrenamiento con sus días y fases
    echo json_encode([
        'nombre' => $entrenamiento['nombre'],
        'descripcion' => $entrenamiento['descripcion'],
        'dias' => $dias
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
