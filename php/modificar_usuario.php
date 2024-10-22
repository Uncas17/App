<?php
// Archivo: php/modificar_usuario.php

// Habilitar la visualización de errores para depuración (opcional)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON para la respuesta

// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

try {
    // Conectar a la base de datos
    $pdo = connectDB();

    // Obtener el contenido de la solicitud y decodificarlo como JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que se han enviado todos los campos necesarios
    if (isset($data['id'], $data['nombre'], $data['email'], $data['rol'])) {
        // Preparar la consulta de actualización
        $stmt = $pdo->prepare("
            UPDATE usuarios 
            SET nombre = :nombre, email = :email, rol = :rol
            WHERE id_usuario = :id
        ");

        // Asignar los valores a los parámetros
        $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
        $stmt->bindParam(':nombre', $data['nombre']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':rol', $data['rol']);

        // Ejecutar la consulta de actualización
        $stmt->execute();

        // Devolver una respuesta JSON de éxito
        echo json_encode(['success' => true]);
    } else {
        // Si faltan datos necesarios en la solicitud
        throw new Exception('Datos incompletos: Faltan "id", "nombre", "email" o "rol".');
    }
} catch (PDOException $e) {
    // Capturar cualquier excepción relacionada con la base de datos y devolver un error JSON
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Capturar cualquier otra excepción y devolver un error JSON
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
