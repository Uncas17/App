<?php
// Archivo: php/obtener_ejercicio.php

header('Content-Type: application/json'); // Establecer el encabezado como JSON

include 'config.php'; // Incluir la configuración de la base de datos

try {
    $pdo = connectDB(); // Conectar a la base de datos

    // Verificar si el ID del ejercicio se envía como parámetro
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']); // Obtener el ID y asegurarse de que sea un número entero

        // Preparar la consulta para obtener los detalles del ejercicio
        $stmt = $pdo->prepare("SELECT * FROM ejercicios WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        // Obtener los detalles del ejercicio
        $exercise = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($exercise) {
            // Devolver los detalles en formato JSON
            echo json_encode($exercise);
        } else {
            // Si no se encuentra el ejercicio, devolver un mensaje de error
            echo json_encode(['error' => 'Ejercicio no encontrado.']);
        }
    } else {
        // Si no se envía un ID, devolver un mensaje de error
        echo json_encode(['error' => 'ID no proporcionado.']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
}
