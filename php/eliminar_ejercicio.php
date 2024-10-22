<?php
// Archivo: php/eliminar_ejercicio.php

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

    // Establecer el modo de error de PDO para que lance excepciones en caso de error
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener el ID del ejercicio de la solicitud GET
    if (isset($_GET['id'])) {
        $id = $_GET['id'];

        // Preparar la consulta para eliminar el ejercicio basado en el ID
        $stmt = $pdo->prepare("DELETE FROM ejercicios WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        // Ejecutar la consulta
        $stmt->execute();

        // Verificar si se eliminó alguna fila
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Ejercicio eliminado correctamente.']);
        } else {
            throw new Exception('No se encontró ningún ejercicio con el ID especificado.');
        }
    } else {
        throw new Exception('Falta el parámetro "id" en la solicitud.');
    }
} catch (PDOException $e) {
    // Capturar cualquier excepción relacionada con la base de datos y devolver un error JSON
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Capturar cualquier otra excepción y devolver un error JSON
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
