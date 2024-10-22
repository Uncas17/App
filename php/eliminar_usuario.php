<?php
// Archivo: php/eliminar_usuario.php

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON para la respuesta

// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

try {
    // Verificar que se ha enviado un parámetro de ID
    if (!isset($_GET['id'])) {
        throw new Exception('ID de usuario no especificado.');
    }

    // Conectar a la base de datos
    $pdo = connectDB();

    // Preparar la consulta de eliminación
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = :id");
    $stmt->bindParam(':id', $_GET['id'], PDO::PARAM_INT);

    // Ejecutar la consulta de eliminación
    $stmt->execute();

    // Devolver una respuesta JSON de éxito
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    // Capturar cualquier excepción relacionada con la base de datos y devolver un error JSON
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Capturar cualquier otra excepción y devolver un error JSON
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
