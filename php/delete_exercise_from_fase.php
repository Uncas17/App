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

    // Obtener los parámetros de la solicitud
    $faseId = $_GET['fase_id'] ?? null;
    $exerciseId = $_GET['ejercicio_id'] ?? null;

    if ($faseId && $exerciseId) {
        // Eliminar el ejercicio de la fase
        $stmt = $pdo->prepare("
            DELETE FROM detalle_fase WHERE fase_id = :fase_id AND ejercicio_id = :ejercicio_id
        ");
        $stmt->bindParam(':fase_id', $faseId);
        $stmt->bindParam(':ejercicio_id', $exerciseId);
        $stmt->execute();

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
