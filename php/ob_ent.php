<?php
// Archivo: php/ob_ent.php

include 'config.php';

header('Content-Type: application/json');

try {
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (!isset($_GET['id'])) {
        throw new Exception("ID de entrenamiento no especificado");
    }

    $entrenamientoId = $_GET['id'];

    // Obtener los detalles del entrenamiento
    $stmtEntrenamiento = $pdo->prepare("SELECT * FROM entrenamientos WHERE id = :id");
    $stmtEntrenamiento->bindParam(':id', $entrenamientoId);
    $stmtEntrenamiento->execute();
    $entrenamiento = $stmtEntrenamiento->fetch(PDO::FETCH_ASSOC);

    if (!$entrenamiento) {
        throw new Exception("Entrenamiento no encontrado");
    }

    // Obtener los días del entrenamiento
    $stmtDias = $pdo->prepare("SELECT * FROM dias_entrenamiento WHERE entrenamiento_id = :id");
    $stmtDias->bindParam(':id', $entrenamientoId);
    $stmtDias->execute();
    $dias = $stmtDias->fetchAll(PDO::FETCH_ASSOC);

    foreach ($dias as &$dia) {
        // Obtener las fases del día
        $stmtFases = $pdo->prepare("SELECT * FROM fases_entrenamiento WHERE dia_id = :dia_id");
        $stmtFases->bindParam(':dia_id', $dia['id']);
        $stmtFases->execute();
        $fases = $stmtFases->fetchAll(PDO::FETCH_ASSOC);

        foreach ($fases as &$fase) {
            // Obtener los ejercicios de la fase
            $stmtEjercicios = $pdo->prepare("SELECT * FROM detalle_fase WHERE fase_id = :fase_id");
            $stmtEjercicios->bindParam(':fase_id', $fase['id']);
            $stmtEjercicios->execute();
            $ejercicios = $stmtEjercicios->fetchAll(PDO::FETCH_ASSOC);

            $fase['ejercicios'] = $ejercicios;
        }

        $dia['fases'] = $fases;
    }

    $entrenamiento['dias'] = $dias;

    echo json_encode(['success' => true, 'entrenamiento' => $entrenamiento]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>