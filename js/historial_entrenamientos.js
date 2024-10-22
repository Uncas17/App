document.addEventListener('DOMContentLoaded', function() {
    // Cargar usuarios y asignarlos al selector
    loadUsuarios();

    // Asignar evento para cuando se seleccione un usuario
    document.getElementById('userSelect').addEventListener('change', function() {
        const usuarioId = this.value;
        if (usuarioId) {
            loadHistorialEntrenamientos(usuarioId);
        } else {
            clearHistorialTable();
        }
    });

    // Cargar la lista de usuarios
    function loadUsuarios() {
        fetch('../php/listar_usuarios.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Usuarios cargados:', data.usuarios); // Depuración
                    populateUserSelect(data.usuarios);
                } else {
                    console.error('Error al cargar los usuarios:', data.message);
                }
            })
            .catch(error => console.error('Error al cargar los usuarios:', error));
    }

    // Llenar el selector con los usuarios
    function populateUserSelect(usuarios) {
        const select = document.getElementById('userSelect');
        select.innerHTML = '<option value="">Seleccionar Usuario</option>';

        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id_usuario;
            option.textContent = usuario.nombre;
            select.appendChild(option);
        });
    }

    // Cargar el historial de entrenamientos de un usuario
    function loadHistorialEntrenamientos(usuarioId) {
        fetch(`../php/listar_historial.php?usuario_id=${usuarioId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    populateHistorialTable(data.entrenamientos);
                } else {
                    console.error('Error al cargar el historial:', data.message);
                }
            })
            .catch(error => console.error('Error al cargar el historial:', error));
    }

    // Llenar la tabla con el historial de entrenamientos
    function populateHistorialTable(entrenamientos) {
        const tableBody = document.querySelector('#historialTable tbody');
        tableBody.innerHTML = ''; // Limpiar la tabla

        entrenamientos.forEach(entrenamiento => {
            const tr = document.createElement('tr');

            // Nombre del entrenamiento
            const tdNombre = document.createElement('td');
            tdNombre.textContent = entrenamiento.nombre;
            tr.appendChild(tdNombre);

            // Fecha de asignación
            const tdFecha = document.createElement('td');
            tdFecha.textContent = entrenamiento.fecha;
            tr.appendChild(tdFecha);

            // Estado del entrenamiento
            const tdEstado = document.createElement('td');
            tdEstado.textContent = entrenamiento.estado;
            tr.appendChild(tdEstado);

            // Fases
            const tdFases = document.createElement('td');
            const fasesList = entrenamiento.fases.map(fase => `${fase.nombre}`).join(', ');
            tdFases.textContent = fasesList;
            tr.appendChild(tdFases);

            // Ejercicios
            const tdEjercicios = document.createElement('td');
            const ejerciciosList = entrenamiento.fases.map(fase => 
                fase.ejercicios.map(ej => `${ej.nombre_ejercicio} (${ej.sets} sets x ${ej.repeticiones} reps)`).join(', ')
            ).join('; ');
            tdEjercicios.textContent = ejerciciosList;
            tr.appendChild(tdEjercicios);

            tableBody.appendChild(tr);
        });
    }

    // Limpiar la tabla de historial
    function clearHistorialTable() {
        const tableBody = document.querySelector('#historialTable tbody');
        tableBody.innerHTML = ''; // Limpiar la tabla
    }
});
