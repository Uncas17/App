<?php
// Incluir el archivo de configuración para conectar a la base de datos
include 'config.php';

// Conectar a la base de datos
$pdo = connectDB();

// Realizar la consulta para obtener todos los ejercicios
$stmt = $pdo->query("SELECT * FROM ejercicios");
$ejercicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Devolver los ejercicios en formato JSON para ser consumidos por la interfaz
echo json_encode($ejercicios);
?>
