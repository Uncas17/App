<?php
// Archivo: php/obtener_ejercicios_fase.php

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

    // Preparar y ejecutar la consulta para obtener los ejercicios de la fase
    $stmtEjerciciosFase = $pdo->prepare("
        SELECT e.nombre_ejercicio, df.sets, df.repeticiones, df.descanso, df.comentarios
        FROM detalle_fase df
        JOIN ejercicios e ON df.ejercicio_id = e.id
        WHERE df.fase_id = :fase_id
    ");
    $stmtEjerciciosFase->bindParam(':fase_id', $faseId, PDO::PARAM_INT);
    $stmtEjerciciosFase->execute();

    $ejercicios = $stmtEjerciciosFase->fetchAll(PDO::FETCH_ASSOC);

    // Devolver la lista de ejercicios añadidos a la fase
    echo json_encode(['success' => true, 'ejercicios' => $ejercicios]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
