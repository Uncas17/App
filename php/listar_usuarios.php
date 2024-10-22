<?php
// Archivo: php/listar_usuarios.php

// Habilitar la visualización de errores para depuración (opcional)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON

include 'config.php'; // Incluir el archivo de configuración para la base de datos

try {
    // Conectar a la base de datos
    $pdo = connectDB();

    // Consultar los usuarios
    $stmt = $pdo->prepare("SELECT id_usuario, nombre, email, rol FROM usuarios");
    $stmt->execute();
    
    // Obtener los resultados
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Verificar si se obtuvieron usuarios
    if ($usuarios) {
        // Devolver los usuarios en formato JSON con éxito
        echo json_encode(['success' => true, 'usuarios' => $usuarios]);
    } else {
        // Devolver error si no hay usuarios
        echo json_encode(['success' => false, 'message' => 'No se encontraron usuarios.']);
    }
} catch (PDOException $e) {
    // Manejar errores de base de datos
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Manejar cualquier otro tipo de error
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
