<?php
session_start();
header('Content-Type: application/json');

// Conectar a la base de datos
include 'config.php'; // Ajustar la ruta según sea necesario
$pdo = connectDB();

// Obtener los datos del formulario de inicio de sesión
$data = json_decode(file_get_contents('php://input'), true);
$nombre = $data['nombre'];
$contrasena = $data['contrasena'];

try {
    // Comprobar si el usuario existe
    $stmt = $pdo->prepare('SELECT id_usuario, contrasena, rol FROM usuarios WHERE nombre = :nombre');
    $stmt->bindParam(':nombre', $nombre);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        // Verificar la contraseña
        if (password_verify($contrasena, $usuario['contrasena'])) {
            // Si es correcto, iniciar la sesión y devolver el rol del usuario
            $_SESSION['usuario_id'] = $usuario['id_usuario']; // Guardar el ID del usuario en la sesión

            echo json_encode([
                'success' => true,
                'role' => $usuario['rol'] // Puede ser 'root' o 'usuario'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Contraseña incorrecta'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Nombre de usuario no encontrado'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectarse a la base de datos: ' . $e->getMessage()
    ]);
}
?>
