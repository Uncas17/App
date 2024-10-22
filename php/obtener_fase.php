<?php
// Archivo: php/obtener_fase.php

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Establecer el encabezado como JSON para la respuesta
header('Content-Type: application/json');

// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

try {
    if (!isset($_GET['faseId'])) {
        throw new Exception("Faltan datos: 'faseId'");
    }

    $faseId = $_GET['faseId'];

    // Conectar a la base de datos
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Preparar y ejecutar la consulta para obtener la fase
    $stmtFase = $pdo->prepare("SELECT * FROM fases_entrenamiento WHERE id = :fase_id");
    $stmtFase->bindParam(':fase_id', $faseId, PDO::PARAM_INT);
    $stmtFase->execute();

    $fase = $stmtFase->fetch(PDO::FETCH_ASSOC);

    if (!$fase) {
        throw new Exception("Fase no encontrada.");
    }

    // Devolver los detalles de la fase
    echo json_encode(['success' => true, 'fase' => ['id' => $fase['id'], 'nombre' => $fase['nombre']]]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
