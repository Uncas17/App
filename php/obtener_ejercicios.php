<?php
// Archivo: php/obtener_ejercicios.php

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Establecer el encabezado como JSON para la respuesta
header('Content-Type: application/json');

// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

try {
    // Conectar a la base de datos
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener todos los ejercicios
    $stmtEjercicios = $pdo->prepare("SELECT * FROM ejercicios");
    $stmtEjercicios->execute();
    $ejercicios = $stmtEjercicios->fetchAll(PDO::FETCH_ASSOC);

    // Devolver la lista de ejercicios
    echo json_encode(['success' => true, 'ejercicios' => $ejercicios]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
