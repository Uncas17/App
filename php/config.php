<?php
// Definir la ruta de la base de datos SQLite
define('DB_PATH', '../data/proyecto_entrenamientos.db');

// Función para conectarse a la base de datos
function connectDB() {
    try {
        // Crear una conexión a la base de datos
        $pdo = new PDO("sqlite:" . DB_PATH);
        // Establecer el modo de errores a excepción
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (Exception $e) {
        // Mostrar mensaje de error y detener ejecución si la conexión falla
        echo "Error de conexión a la base de datos: " . $e->getMessage();
        exit();
    }
}
?>
