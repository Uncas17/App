// Archivo: js/add_user.js

// Función para manejar el envío del formulario y agregar el usuario
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evitar el envío predeterminado del formulario

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const contrasena = document.getElementById('contrasena').value;
    const rol = document.getElementById('rol').value;

    // Crear un objeto con los datos del nuevo usuario
    const newUser = {
        nombre: nombre,
        email: email,
        contrasena: contrasena,
        rol: rol
    };

    // Enviar los datos al servidor para que se añadan a la base de datos
    fetch('../php/add_user.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Mostrar el mensaje de confirmación y limpiar el formulario
            document.getElementById('confirmationMessage').classList.remove('hidden');
            document.getElementById('addUserForm').reset();
        } else {
            alert('Error al añadir el usuario: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al realizar la solicitud:', error);
        alert('No se pudo realizar la solicitud. Por favor, verifica la configuración del servidor.');
    });
});
