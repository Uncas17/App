<?php
// Archivo: php/guardar_entrenamiento.php

// Habilitar la visualización de errores para depuración (opcional)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON para la respuesta

// Incluir archivo de configuración para la conexión a la base de datos
include 'config.php';

try {
    // Conectar a la base de datos
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener el contenido de la solicitud POST y decodificar el JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que se hayan enviado el nombre y la descripción del entrenamiento
    if (!isset($data['nombre']) || !isset($data['descripcion'])) {
        throw new Exception("Faltan datos: 'nombre' o 'descripcion'");
    }

    // Preparar la inserción del entrenamiento en la tabla "entrenamientos"
    $stmtEntrenamiento = $pdo->prepare("
        INSERT INTO entrenamientos (nombre, descripcion, fecha, estado, comentarios)
        VALUES (:nombre, :descripcion, :fecha, :estado, :comentarios)
    ");

    // Asignar los valores a variables
    $nombreEntrenamiento = $data['nombre'];
    $descripcionEntrenamiento = $data['descripcion'];
    $fechaEntrenamiento = date('Y-m-d'); // Fecha actual
    $estadoEntrenamiento = "Activo"; // Estado inicial: "Activo"
    $comentariosEntrenamiento = ""; // Comentarios vacíos

    // Vincular parámetros
    $stmtEntrenamiento->bindParam(':nombre', $nombreEntrenamiento);
    $stmtEntrenamiento->bindParam(':descripcion', $descripcionEntrenamiento);
    $stmtEntrenamiento->bindParam(':fecha', $fechaEntrenamiento);
    $stmtEntrenamiento->bindParam(':estado', $estadoEntrenamiento);
    $stmtEntrenamiento->bindParam(':comentarios', $comentariosEntrenamiento);

    // Ejecutar la inserción del entrenamiento
    $stmtEntrenamiento->execute();

    // Obtener el ID del entrenamiento insertado
    $entrenamientoId = $pdo->lastInsertId();

    // Guardar los días del entrenamiento
    if (isset($data['dias']) && is_array($data['dias'])) {
        foreach ($data['dias'] as $diaIndex => $dia) {
            if (!isset($dia['dia'])) {
                throw new Exception("Faltan datos en el día: 'dia'");
            }

            // Preparar la inserción del día en la tabla "dias_entrenamiento"
            $stmtDia = $pdo->prepare("
                INSERT INTO dias_entrenamiento (entrenamiento_id, dia, nombre_dia)
                VALUES (:entrenamiento_id, :dia, :nombre_dia)
            ");

            // Asignar valores del día
            $nombreDia = $dia['dia'];
            $diaIndexReal = $diaIndex + 1; // El índice del día comienza en 1

            // Vincular parámetros
            $stmtDia->bindParam(':entrenamiento_id', $entrenamientoId);
            $stmtDia->bindParam(':dia', $diaIndexReal);
            $stmtDia->bindParam(':nombre_dia', $nombreDia);

            // Ejecutar la inserción del día
            $stmtDia->execute();

            // Obtener el ID del día insertado
            $diaId = $pdo->lastInsertId();

            // Guardar las fases del día
            if (isset($dia['fases']) && is_array($dia['fases'])) {
                foreach ($dia['fases'] as $ordenFase => $fase) {
                    if (!isset($fase['nombre'])) {
                        throw new Exception("Faltan datos en la fase: 'nombre'");
                    }

                    // Preparar la inserción de la fase en la tabla "fases_entrenamiento"
                    $stmtFase = $pdo->prepare("
                        INSERT INTO fases_entrenamiento (nombre, entrenamiento_id, dia_id, orden, comentarios)
                        VALUES (:nombre, :entrenamiento_id, :dia_id, :orden, :comentarios)
                    ");

                    // Asignar los valores de la fase
                    $nombreFase = $fase['nombre'];
                    $ordenFaseReal = $ordenFase + 1; // El índice de la fase comienza en 1
                    $comentariosFase = "";

                    // Vincular parámetros
                    $stmtFase->bindParam(':nombre', $nombreFase);
                    $stmtFase->bindParam(':entrenamiento_id', $entrenamientoId);
                    $stmtFase->bindParam(':dia_id', $diaId);
                    $stmtFase->bindParam(':orden', $ordenFaseReal);
                    $stmtFase->bindParam(':comentarios', $comentariosFase);

                    // Ejecutar la inserción de la fase
                    $stmtFase->execute();

                    // Obtener el ID de la fase insertada
                    $faseId = $pdo->lastInsertId();

                    // Guardar los ejercicios de la fase
                    if (isset($fase['ejercicios']) && is_array($fase['ejercicios'])) {
                        foreach ($fase['ejercicios'] as $ejercicio) {
                            if (!isset($ejercicio['id']) || !isset($ejercicio['sets']) || !isset($ejercicio['repeticiones']) || !isset($ejercicio['descanso'])) {
                                throw new Exception("Faltan datos del ejercicio");
                            }

                            // Preparar la inserción del ejercicio en la tabla "detalle_fase"
                            $stmtEjercicio = $pdo->prepare("
                                INSERT INTO detalle_fase (fase_id, ejercicio_id, sets, repeticiones, descanso, comentarios)
                                VALUES (:fase_id, :ejercicio_id, :sets, :repeticiones, :descanso, :comentarios)
                            ");

                            // Asignar los valores del ejercicio
                            $ejercicioId = $ejercicio['id'];
                            $sets = $ejercicio['sets'];
                            $repeticiones = $ejercicio['repeticiones'];
                            $descanso = $ejercicio['descanso'];
                            $comentariosEjercicio = ""; // Comentarios vacíos

                            // Vincular parámetros
                            $stmtEjercicio->bindParam(':fase_id', $faseId);
                            $stmtEjercicio->bindParam(':ejercicio_id', $ejercicioId);
                            $stmtEjercicio->bindParam(':sets', $sets);
                            $stmtEjercicio->bindParam(':repeticiones', $repeticiones);
                            $stmtEjercicio->bindParam(':descanso', $descanso);
                            $stmtEjercicio->bindParam(':comentarios', $comentariosEjercicio);

                            // Ejecutar la inserción del ejercicio
                            $stmtEjercicio->execute();
                        }
                    }
                }
            }
        }
    }

    // Enviar respuesta de éxito
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    // Manejar errores relacionados con la base de datos
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Manejar cualquier otro error
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
