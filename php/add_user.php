<?php
// Archivo: php/add_user.php

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON para la respuesta

// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

try {
    // Conectar a la base de datos
    $pdo = connectDB();

    // Establecer el modo de error de PDO para que lance excepciones en caso de error
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener el contenido de la solicitud y decodificarlo como JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que se han enviado todos los campos necesarios
    if (isset($data['nombre'], $data['email'], $data['contrasena'], $data['rol'])) {
        // Hashear la contraseña para almacenarla de forma segura
        $hashedPassword = password_hash($data['contrasena'], PASSWORD_BCRYPT);

        // Preparar la consulta de inserción con los campos del formulario
        $stmt = $pdo->prepare("
            INSERT INTO usuarios (nombre, email, contrasena, rol)
            VALUES (:nombre, :email, :contrasena, :rol)
        ");

        // Asignar los valores a los parámetros
        $stmt->bindParam(':nombre', $data['nombre']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':contrasena', $hashedPassword); // Almacenar la contraseña hasheada
        $stmt->bindParam(':rol', $data['rol']);

        // Ejecutar la consulta de inserción
        $stmt->execute();

        // Devolver una respuesta JSON de éxito
        echo json_encode(['success' => true]);
    } else {
        // Si faltan datos necesarios en la solicitud
        throw new Exception('Datos incompletos: Faltan "nombre", "email", "contrasena" o "rol".');
    }
} catch (PDOException $e) {
    // Capturar cualquier excepción relacionada con la base de datos y devolver un error JSON
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Capturar cualquier otra excepción y devolver un error JSON
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
