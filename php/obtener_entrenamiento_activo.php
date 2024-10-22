<?php
// Archivo: obtener_entrenamiento_activo.php

header('Content-Type: application/json');
session_start();

// Simulación de conexión a la base de datos
include 'config.php';
$pdo = connectDB();

// ID de usuario (se debe obtener tras el login real)
$usuarioId = $_SESSION['usuario_id'];

try {
    // Obtener el entrenamiento activo del usuario
    $stmt = $pdo->prepare('SELECT * FROM entrenamientos WHERE usuario_id = :usuario_id AND estado = "Activo"');
    $stmt->bindParam(':usuario_id', $usuarioId);
    $stmt->execute();

    $entrenamiento = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($entrenamiento) {
        // Obtener los días del entrenamiento
        $stmtDias = $pdo->prepare('SELECT * FROM dias_entrenamiento WHERE entrenamiento_id = :entrenamiento_id ORDER BY dia');
        $stmtDias->bindParam(':entrenamiento_id', $entrenamiento['id']);
        $stmtDias->execute();
        $dias = $stmtDias->fetchAll(PDO::FETCH_ASSOC);

        foreach ($dias as &$dia) {
            // Obtener las fases del día
            $stmtFases = $pdo->prepare('SELECT * FROM fases_entrenamiento WHERE dia_id = :dia_id ORDER BY orden');
            $stmtFases->bindParam(':dia_id', $dia['id']);
            $stmtFases->execute();
            $dia['fases'] = $stmtFases->fetchAll(PDO::FETCH_ASSOC);

            foreach ($dia['fases'] as &$fase) {
                // Obtener los ejercicios de la fase
                $stmtEjercicios = $pdo->prepare('SELECT e.nombre_ejercicio AS nombre, df.sets, df.repeticiones, df.descanso FROM detalle_fase df JOIN ejercicios e ON df.ejercicio_id = e.id WHERE df.fase_id = :fase_id');
                $stmtEjercicios->bindParam(':fase_id', $fase['id']);
                $stmtEjercicios->execute();
                $fase['ejercicios'] = $stmtEjercicios->fetchAll(PDO::FETCH_ASSOC);
            }
        }

        // Enviar respuesta con el entrenamiento, sus días, fases y ejercicios
        echo json_encode([
            'nombre' => $entrenamiento['nombre'],
            'dias' => $dias
        ]);
    } else {
        echo json_encode(['error' => 'No hay entrenamiento activo.']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al obtener el entrenamiento activo.']);
}
?>
