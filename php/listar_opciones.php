<?php
// Archivo: php/listar_opciones.php

// Habilitar la visualización de errores para depuración (opcional)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // Establecer el encabezado como JSON

// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

try {
    // Conectar a la base de datos
$pdo = connectDB();

    // Establecer el modo de error de PDO para que lance excepciones en caso de error
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Definir las columnas de las que se quieren obtener opciones únicas
    $columns = [
        'clasificacion',
        'grupo_muscular',
        'agonista',
        'nivel_dificultad',
        'equipamiento',
        'patron_movimientos',
        'plano_ejecucion',
        'lateralidad'
    ];

    $options = [];

    // Recorrer cada columna y obtener valores únicos
    foreach ($columns as $column) {
        // Realizar la consulta para obtener valores únicos
        $stmt = $pdo->prepare("SELECT DISTINCT $column FROM ejercicios WHERE $column IS NOT NULL AND $column != '' ORDER BY $column ASC");
        $stmt->execute();


        // Almacenar los valores únicos en el array $options
        $result = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if ($result) {
            $options[$column] = $result;
        } else {
            $options[$column] = []; // Si no hay valores, definir un array vacío
        }
    }

    // Mostrar las opciones obtenidas en formato JSON para depuración
    echo json_encode($options);

} catch (PDOException $e) {
    // Mensaje de error si ocurre un problema con la base de datos
    echo json_encode(['error' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Mensaje de error si ocurre cualquier otro problema
    echo json_encode(['error' => $e->getMessage()]);
}
?>
