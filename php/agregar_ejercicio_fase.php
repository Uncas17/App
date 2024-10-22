<?php
// Archivo: php/agregar_ejercicio_fase.php

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Establecer el encabezado como JSON para la respuesta
header('Content-Type: application/json');

// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

try {
    // Obtener el contenido de la solicitud y decodificar el JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que se hayan enviado todos los campos necesarios
    if (!isset($data['fase_id']) || !isset($data['ejercicio_id']) || !isset($data['sets']) || !isset($data['repeticiones']) || !isset($data['descanso'])) {
        throw new Exception("Faltan datos: 'fase_id', 'ejercicio_id', 'sets', 'repeticiones' o 'descanso'");
    }

    $faseId = $data['fase_id'];
    $ejercicioId = $data['ejercicio_id'];
    $sets = $data['sets'];
    $repeticiones = $data['repeticiones'];
    $descanso = $data['descanso'];
    $comentarios = isset($data['comentarios']) ? $data['comentarios'] : '';

    // Validar que los IDs existen en sus respectivas tablas
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar que la fase existe
    $stmtFase = $pdo->prepare("SELECT * FROM fases_entrenamiento WHERE id = :fase_id");
    $stmtFase->bindParam(':fase_id', $faseId, PDO::PARAM_INT);
    $stmtFase->execute();
    if ($stmtFase->rowCount() === 0) {
        throw new Exception("Fase no encontrada.");
    }

    // Verificar que el ejercicio existe
    $stmtEjercicio = $pdo->prepare("SELECT * FROM ejercicios WHERE id = :ejercicio_id");
    $stmtEjercicio->bindParam(':ejercicio_id', $ejercicioId, PDO::PARAM_INT);
    $stmtEjercicio->execute();
    if ($stmtEjercicio->rowCount() === 0) {
        throw new Exception("Ejercicio no encontrado.");
    }

    // Preparar la inserción en la tabla 'detalle_fase'
    $stmtDetalle = $pdo->prepare("
        INSERT INTO detalle_fase (fase_id, ejercicio_id, sets, repeticiones, descanso, comentarios)
        VALUES (:fase_id, :ejercicio_id, :sets, :repeticiones, :descanso, :comentarios)
    ");

    // Asignar los valores
    $stmtDetalle->bindParam(':fase_id', $faseId, PDO::PARAM_INT);
    $stmtDetalle->bindParam(':ejercicio_id', $ejercicioId, PDO::PARAM_INT);
    $stmtDetalle->bindParam(':sets', $sets, PDO::PARAM_INT);
    $stmtDetalle->bindParam(':repeticiones', $repeticiones, PDO::PARAM_INT);
    $stmtDetalle->bindParam(':descanso', $descanso, PDO::PARAM_INT);
    $stmtDetalle->bindParam(':comentarios', $comentarios);

    // Ejecutar la inserción
    $stmtDetalle->execute();

    // Devolver una respuesta de éxito
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
