// Archivo: js/usuarios.js

// Función para cargar la lista de usuarios y mostrarlos en la tabla
function loadUsers() {
    fetch('../php/listar_usuarios.php')
        .then(response => response.json())
        .then(data => {
            const usersTableBody = document.querySelector('#usersTable tbody');
            usersTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos usuarios

            data.forEach(user => {
                const tr = document.createElement('tr');

                // Crear celdas para cada columna de la tabla
                ['id_usuario', 'nombre', 'email', 'rol'].forEach(key => {
                    const td = document.createElement('td');
                    td.textContent = user[key];
                    tr.appendChild(td);
                });

                // Crear la celda de acciones (Modificar y Eliminar)
                const actionsTd = document.createElement('td');

                // Botón para modificar usuario
                const modifyButton = document.createElement('button');
                modifyButton.textContent = 'M';
                modifyButton.classList.add('button', 'button-modify'); // Clase CSS para el botón
                modifyButton.onclick = () => modifyUser(user.id_usuario);
                actionsTd.appendChild(modifyButton);

                // Botón para eliminar usuario
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.classList.add('button', 'button-delete'); // Clase CSS para el botón
                deleteButton.onclick = () => deleteUser(user.id_usuario);
                actionsTd.appendChild(deleteButton);

                // Añadir las acciones a la fila
                tr.appendChild(actionsTd);

                // Agregar la fila completa a la tabla
                usersTableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al cargar los usuarios:', error));
}

// Función para redirigir a la página de modificar usuario
function modifyUser(idUsuario) {
    window.location.href = `modify_user.html?id=${idUsuario}`;
}

// Función para eliminar un usuario
function deleteUser(idUsuario) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        fetch(`../php/eliminar_usuario.php?id=${idUsuario}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Usuario eliminado con éxito.');
                    loadUsers(); // Recargar la lista de usuarios
                } else {
                    alert('Error al eliminar el usuario: ' + data.message);
                }
            })
            .catch(error => console.error('Error al eliminar el usuario:', error));
    }
}

// Cargar la lista de usuarios cuando se cargue la página
document.addEventListener('DOMContentLoaded', loadUsers);
