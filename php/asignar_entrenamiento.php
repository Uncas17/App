<?php
// Archivo: asignar_entrenamiento.php

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

    // Obtener el contenido de la solicitud POST y decodificar el JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que se hayan enviado el entrenamiento y los usuarios
    if (!isset($data['entrenamiento_id']) || !isset($data['usuarios'])) {
        throw new Exception("Faltan datos: 'entrenamiento_id' o 'usuarios'");
    }

    $entrenamientoId = $data['entrenamiento_id'];
    $usuarios = $data['usuarios']; // Array de usuarios seleccionados

    // Asignar el entrenamiento a cada usuario
    foreach ($usuarios as $usuarioId) {
        // Verificar si el usuario ya tiene un entrenamiento activo y cambiar su estado a 'Completado'
        $stmtVerificar = $pdo->prepare("UPDATE usuarios_entrenamientos SET estado = 'Completado' WHERE usuario_id = :usuario_id AND estado = 'Activo'");
        $stmtVerificar->bindParam(':usuario_id', $usuarioId);
        $stmtVerificar->execute();

        // Insertar el nuevo entrenamiento para el usuario con estado 'Activo'
        $stmt = $pdo->prepare("
            INSERT INTO usuarios_entrenamientos (usuario_id, entrenamiento_id, estado, fecha_asignacion)
            VALUES (:usuario_id, :entrenamiento_id, 'Activo', datetime('now', 'localtime'))
        ");
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':entrenamiento_id', $entrenamientoId);
        $stmt->execute();
    }

    // Responder con éxito
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    // Manejar errores relacionados con la base de datos
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Manejar cualquier otro error
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
