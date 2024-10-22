document.addEventListener('DOMContentLoaded', function () {
    loadEntrenamientos();
    loadUsuarios();

    // Evento para vista previa del entrenamiento
    document.getElementById('entrenamientoSelect').addEventListener('change', function () {
        const entrenamientoId = this.value;
        if (entrenamientoId) {
            fetchEntrenamiento(entrenamientoId);
        } else {
            clearEntrenamientoPreview();
        }
    });

    // Asignar el entrenamiento a los usuarios seleccionados
    document.getElementById('asignarButton').addEventListener('click', function () {
        asignarEntrenamiento();
    });
});

// Cargar lista de entrenamientos
function loadEntrenamientos() {
    fetch('../php/listar_entrenamientos.php')
        .then(response => response.json())
        .then(data => {
            populateEntrenamientoSelect(data);
        })
        .catch(error => console.error('Error al cargar entrenamientos:', error));
}

// Función para cargar la lista de usuarios
function loadUsuarios() {
    fetch('../php/listar_usuarios.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Usuarios cargados:', data.usuarios); // Depuración
                populateUsuariosTable(data.usuarios);
            } else {
                console.error('Error al cargar usuarios:', data.message);
            }
        })
        .catch(error => console.error('Error al cargar usuarios:', error));
}

// Función para llenar la tabla de usuarios
function populateUsuariosTable(usuarios) {
    const tableBody = document.querySelector('#usuariosTable tbody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos usuarios

    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');

        // Crear celda para el nombre
        const tdNombre = document.createElement('td');
        tdNombre.textContent = usuario.nombre;
        tr.appendChild(tdNombre);

        // Crear celda para el correo
        const tdEmail = document.createElement('td');
        tdEmail.textContent = usuario.email;
        tr.appendChild(tdEmail);

        // Crear checkbox para seleccionar el usuario, alineado con el título "Seleccionar"
        const tdSelect = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = usuario.id_usuario; // Usar id_usuario como valor del checkbox
        tdSelect.appendChild(checkbox);
        tr.appendChild(tdSelect);

        // Añadir la fila a la tabla
        tableBody.appendChild(tr);
    });
}

// Poblar el select con los entrenamientos
function populateEntrenamientoSelect(data) {
    const select = document.getElementById('entrenamientoSelect');
    data.forEach(entrenamiento => {
        const option = document.createElement('option');
        option.value = entrenamiento.id;
        option.textContent = entrenamiento.nombre;
        select.appendChild(option);
    });
}

// Función para asignar entrenamiento a los usuarios seleccionados
function asignarEntrenamiento() {
    const entrenamientoId = document.getElementById('entrenamientoSelect').value;
    const checkboxes = document.querySelectorAll('#usuariosTable tbody input[type="checkbox"]:checked');
    const usuariosSeleccionados = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (!entrenamientoId || usuariosSeleccionados.length === 0) {
        alert('Por favor selecciona un entrenamiento y al menos un usuario.');
        return;
    }

    // Enviar datos al servidor para asignación
    fetch('../php/asignar_entrenamiento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            entrenamiento_id: entrenamientoId,
            usuarios: usuariosSeleccionados
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Entrenamiento asignado con éxito.');
        } else {
            alert('Error al asignar entrenamiento: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al asignar entrenamiento:', error);
    });
}

// Función para obtener el entrenamiento seleccionado y mostrarlo en la vista previa
function fetchEntrenamiento(entrenamientoId) {
    fetch(`../php/obtener_entrenamiento.php?id=${entrenamientoId}`)
        .then(response => response.json())
        .then(data => {
            populateEntrenamientoPreview(data);
        })
        .catch(error => console.error('Error al cargar la vista previa del entrenamiento:', error));
}

// Mostrar la vista previa del entrenamiento con días y fases
function populateEntrenamientoPreview(data) {
    document.getElementById('nombreEntrenamientoPreview').textContent = data.nombre;
    document.getElementById('descripcionEntrenamientoPreview').textContent = data.descripcion;

    const fasesList = document.getElementById('fasesEntrenamientoPreview');
    fasesList.innerHTML = ''; // Limpiar lista

    // Crear una estructura para mostrar días y fases
    data.dias.forEach(dia => {
        const diaHeader = document.createElement('h4');
        diaHeader.textContent = `Día ${dia.dia}: ${dia.nombre_dia}`;  // Actualizado a dia.dia y dia.nombre_dia
        fasesList.appendChild(diaHeader);

        const fasesUl = document.createElement('ul');

        dia.fases.forEach(fase => {
            const li = document.createElement('li');
            li.textContent = `${fase.orden}. ${fase.nombre}`;
            fasesUl.appendChild(li);
        });

        fasesList.appendChild(fasesUl);
    });
}

// Limpiar la vista previa del entrenamiento
function clearEntrenamientoPreview() {
    document.getElementById('nombreEntrenamientoPreview').textContent = '';
    document.getElementById('descripcionEntrenamientoPreview').textContent = '';
    document.getElementById('fasesEntrenamientoPreview').innerHTML = '';
}
