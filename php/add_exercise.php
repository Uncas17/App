<?php
// Archivo: php/add_exercise.php

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

    // Obtener el contenido de la solicitud y decodificarlo como JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar qué datos están llegando
    error_log('Datos recibidos: ' . print_r($data, true));

    // Verificar que se han enviado todos los campos necesarios (mínimo nombre y video)
    if (isset($data['nombre_ejercicio'], $data['video'])) {
        // Preparar la consulta de inserción con los campos del formulario
        $stmt = $pdo->prepare("
            INSERT INTO ejercicios (
                nombre_ejercicio, clasificacion, grupo_muscular, agonista, nivel_dificultad, 
                equipamiento, patron_movimientos, plano_ejecucion, lateralidad, video
            ) VALUES (
                :nombre_ejercicio, :clasificacion, :grupo_muscular, :agonista, :nivel_dificultad, 
                :equipamiento, :patron_movimientos, :plano_ejecucion, :lateralidad, :video
            )
        ");

        // Asignar los valores a los parámetros
        $stmt->bindParam(':nombre_ejercicio', $data['nombre_ejercicio']);
        $stmt->bindParam(':clasificacion', $data['clasificacion']);
        $stmt->bindParam(':grupo_muscular', $data['grupo_muscular']);
        $stmt->bindParam(':agonista', $data['agonista']);
        $stmt->bindParam(':nivel_dificultad', $data['nivel_dificultad']);
        $stmt->bindParam(':equipamiento', $data['equipamiento']);
        $stmt->bindParam(':patron_movimientos', $data['patron_movimientos']);
        $stmt->bindParam(':plano_ejecucion', $data['plano_ejecucion']);
        $stmt->bindParam(':lateralidad', $data['lateralidad']);
        $stmt->bindParam(':video', $data['video']);

        // Ejecutar la consulta de inserción
        $stmt->execute();
        error_log('Ejercicio añadido correctamente.'); // Confirmar que la consulta se ejecutó correctamente

        // Devolver una respuesta JSON de éxito
        echo json_encode(['success' => true]);
    } else {
        // Si faltan datos necesarios en la solicitud
        error_log('Datos incompletos: Faltan "nombre_ejercicio" o "video".');
        throw new Exception('Datos incompletos: Faltan "nombre_ejercicio" o "video".');
    }
} catch (PDOException $e) {
    // Capturar cualquier excepción relacionada con la base de datos y devolver un error JSON
    error_log('Error de base de datos: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Capturar cualquier otra excepción y devolver un error JSON
    error_log('Error general: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
