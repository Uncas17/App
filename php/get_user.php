<?php
// Archivo: php/get_user.php

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

    // Verificar que se ha proporcionado un ID de usuario en la solicitud
    if (isset($_GET['id'])) {
        $idUsuario = $_GET['id'];

        // Preparar la consulta para obtener los datos del usuario
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id_usuario = :id");
        $stmt->bindParam(':id', $idUsuario, PDO::PARAM_INT);
        $stmt->execute();

        // Obtener los datos del usuario como un array asociativo
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Si se encuentran datos, devolverlos en formato JSON
        if ($user) {
            echo json_encode($user);
        } else {
            echo json_encode(['error' => 'No se encontraron datos para este usuario.']);
        }
    } else {
        throw new Exception('ID de usuario no proporcionado.');
    }
} catch (PDOException $e) {
    // Capturar cualquier excepción relacionada con la base de datos y devolver un error JSON
    echo json_encode(['error' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Capturar cualquier otra excepción y devolver un error JSON
    echo json_encode(['error' => $e->getMessage()]);
}
?>
