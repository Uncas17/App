// Archivo: js/modify_user.js

// Obtener el ID del usuario desde la URL
const urlParams = new URLSearchParams(window.location.search);
const idUsuario = urlParams.get('id');

// Cargar los datos del usuario para prellenar el formulario
function loadUserData(id) {
    fetch(`../php/get_user.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Poner los valores en el formulario
                document.getElementById('nombre').value = data.nombre;
                document.getElementById('email').value = data.email;
                document.getElementById('rol').value = data.rol;
            } else {
                alert('No se encontraron datos para este usuario.');
            }
        })
        .catch(error => console.error('Error al cargar los datos del usuario:', error));
}

// Llamar a la función para cargar los datos del usuario
loadUserData(idUsuario);

// Manejar el envío del formulario para modificar un usuario
document.getElementById('modifyUserForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evitar el envío predeterminado del formulario

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const rol = document.getElementById('rol').value;

    // Crear un objeto con los datos del usuario
    const updatedUser = { id: idUsuario, nombre, email, rol };

    // Enviar los datos al servidor para actualizar el usuario en la base de datos
    fetch('../php/modificar_usuario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Mostrar mensaje de confirmación
            document.getElementById('confirmationMessage').classList.remove('hidden');
        } else {
            alert('Error al modificar el usuario: ' + data.message);
        }
    })
    .catch(error => console.error('Error al modificar el usuario:', error));
});
