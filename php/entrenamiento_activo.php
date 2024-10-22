<?php
session_start();
header('Content-Type: application/json');

// Conectar a la base de datos
include 'config.php';
$pdo = connectDB();

$usuarioId = $_SESSION['usuario_id']; // Asegurarse de que el usuario esté logueado

try {
    // Verificar si el usuario tiene un entrenamiento activo en la tabla usuarios_entrenamientos
    $stmt = $pdo->prepare('
        SELECT e.* 
        FROM usuarios_entrenamientos ue
        JOIN entrenamientos e ON ue.entrenamiento_id = e.id
        WHERE ue.usuario_id = :usuario_id
        AND ue.estado = "Activo"
    ');
    $stmt->bindParam(':usuario_id', $usuarioId);
    $stmt->execute();
    $entrenamiento = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($entrenamiento) {
        // Obtener los días del entrenamiento
        $stmtDias = $pdo->prepare('SELECT * FROM dias_entrenamiento WHERE entrenamiento_id = :entrenamiento_id ORDER BY dia ASC');
        $stmtDias->bindParam(':entrenamiento_id', $entrenamiento['id']);
        $stmtDias->execute();
        $dias = $stmtDias->fetchAll(PDO::FETCH_ASSOC);

        // Para cada día, obtener las fases y ejercicios
        foreach ($dias as &$dia) {
            $stmtFases = $pdo->prepare('SELECT * FROM fases_entrenamiento WHERE dia_id = :dia_id ORDER BY orden ASC');
            $stmtFases->bindParam(':dia_id', $dia['id']);
            $stmtFases->execute();
            $fases = $stmtFases->fetchAll(PDO::FETCH_ASSOC);

            foreach ($fases as &$fase) {
                $stmtEjercicios = $pdo->prepare('
                    SELECT e.*, df.sets, df.repeticiones, df.descanso 
                    FROM detalle_fase df 
                    JOIN ejercicios e ON df.ejercicio_id = e.id 
                    WHERE df.fase_id = :fase_id
                ');
                $stmtEjercicios->bindParam(':fase_id', $fase['id']);
                $stmtEjercicios->execute();
                $fase['ejercicios'] = $stmtEjercicios->fetchAll(PDO::FETCH_ASSOC);
            }

            // Asignar las fases a cada día
            $dia['fases'] = $fases;
        }

        // Respuesta en formato JSON con los días, fases y ejercicios
        echo json_encode([
            'success' => true,
            'nombre' => $entrenamiento['nombre'],
            'descripcion' => $entrenamiento['descripcion'],
            'dias' => $dias
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No hay un entrenamiento activo asignado a este usuario.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>
