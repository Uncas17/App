<?php
// Habilitar la visualización de errores para depuración (opcional)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON

// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

try {
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener el contenido de la solicitud y decodificarlo como JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que los datos necesarios están presentes
    if (isset($data['fase_id'], $data['ejercicio_id'])) {
        // Preparar la consulta para insertar el ejercicio en la fase
        $stmt = $pdo->prepare("
            INSERT INTO detalle_fase (fase_id, ejercicio_id, sets, repeticiones, descanso, comentarios)
            VALUES (:fase_id, :ejercicio_id, :sets, :repeticiones, :descanso, :comentarios)
        ");
        
        // Asignar los valores a los parámetros
        $stmt->bindParam(':fase_id', $data['fase_id']);
        $stmt->bindParam(':ejercicio_id', $data['ejercicio_id']);
        $stmt->bindParam(':sets', $data['sets']);
        $stmt->bindParam(':repeticiones', $data['repeticiones']);
        $stmt->bindParam(':descanso', $data['descanso']);
        $stmt->bindParam(':comentarios', $data['comentarios']);
        
        // Ejecutar la consulta
        $stmt->execute();

        // Devolver una respuesta JSON de éxito
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Datos incompletos.');
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
