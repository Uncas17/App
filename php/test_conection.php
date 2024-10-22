<?php
// Incluir el archivo de configuración
include 'config.php';

// Intentar conectarse a la base de datos
$pdo = connectDB();
if ($pdo) {
    echo "Conexión a la base de datos establecida correctamente.";
} else {
    echo "Error al conectar a la base de datos.";
}
?>
