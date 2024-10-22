<?php
// Archivo: php/listar_historial.php

// Habilitar la visualización de errores para depuración (opcional)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON

include 'config.php'; // Incluir la configuración de la base de datos

try {
    // Conectar a la base de datos
    $pdo = connectDB();

    // Obtener el ID del usuario
    $usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : null;

    if (!$usuario_id) {
        throw new Exception("ID de usuario no proporcionado.");
    }

    // Consultar los entrenamientos asignados a este usuario
    $query = "SELECT e.id, e.nombre, e.descripcion, e.fecha, e.estado
              FROM entrenamientos e
              JOIN usuarios_entrenamientos ue ON ue.entrenamiento_id = e.id
              WHERE ue.usuario_id = :usuario_id
              ORDER BY e.fecha DESC";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
    $stmt->execute();

    $entrenamientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ahora por cada entrenamiento, consultar las fases y ejercicios
    foreach ($entrenamientos as &$entrenamiento) {
        // Obtener las fases del entrenamiento
        $queryFases = "SELECT f.id, f.nombre, f.orden 
                       FROM fases_entrenamiento f 
                       WHERE f.entrenamiento_id = :entrenamiento_id
                       ORDER BY f.orden";

        $stmtFases = $pdo->prepare($queryFases);
        $stmtFases->bindParam(':entrenamiento_id', $entrenamiento['id'], PDO::PARAM_INT);
        $stmtFases->execute();

        $fases = $stmtFases->fetchAll(PDO::FETCH_ASSOC);

        // Para cada fase, obtener sus ejercicios
        foreach ($fases as &$fase) {
            $queryEjercicios = "SELECT e.nombre_ejercicio, df.sets, df.repeticiones, df.descanso
                                FROM detalle_fase df
                                JOIN ejercicios e ON e.id = df.ejercicio_id
                                WHERE df.fase_id = :fase_id";

            $stmtEjercicios = $pdo->prepare($queryEjercicios);
            $stmtEjercicios->bindParam(':fase_id', $fase['id'], PDO::PARAM_INT);
            $stmtEjercicios->execute();

            $fase['ejercicios'] = $stmtEjercicios->fetchAll(PDO::FETCH_ASSOC);
        }

        // Añadir las fases con ejercicios al entrenamiento
        $entrenamiento['fases'] = $fases;
    }

    // Enviar los entrenamientos con fases y ejercicios como JSON
    echo json_encode(['success' => true, 'entrenamientos' => $entrenamientos]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
