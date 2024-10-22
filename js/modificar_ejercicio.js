// Archivo: js/modificar_ejercicio.js

// Definir las columnas que se van a usar en los menús desplegables
const filterColumns = {
    clasificacion: 'Clasificación',
    grupo_muscular: 'Grupo Muscular',
    agonista: 'Agonista',
    nivel_dificultad: 'Nivel de Dificultad',
    equipamiento: 'Equipamiento',
    patron_movimientos: 'Patrón de Movimientos',
    plano_ejecucion: 'Plano de Ejecución',
    lateralidad: 'Lateralidad'
};

// Obtener el ID del ejercicio desde la URL
const urlParams = new URLSearchParams(window.location.search);
const exerciseId = urlParams.get('id');

// Cargar las opciones de la base de datos a los desplegables
function loadDropdownOptions() {
    fetch('../php/listar_opciones.php')
        .then(response => response.json())
        .then(data => {
            populateDropdowns(data);
            if (exerciseId) {
                loadExerciseDetails(exerciseId); // Cargar detalles del ejercicio una vez se carguen las opciones
            }
        })
        .catch(error => console.error('Error al cargar las opciones:', error));
}

// Función para llenar los menús desplegables con las opciones únicas
function populateDropdowns(data) {
    Object.keys(filterColumns).forEach(id => {
        const dropdown = document.getElementById(id);
        if (data[id] && dropdown) {
            data[id].forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                dropdown.appendChild(optionElement);
            });
        }
    });
}

// Cargar los detalles del ejercicio en el formulario según su ID
function loadExerciseDetails(id) {
    fetch(`../php/obtener_ejercicio.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            // Rellenar el formulario con los valores actuales del ejercicio
            document.getElementById('nombre_ejercicio').value = data.nombre_ejercicio || '';
            document.getElementById('video').value = data.video || '';

            // Seleccionar los valores actuales en cada menú desplegable
            Object.keys(filterColumns).forEach(column => {
                const dropdown = document.getElementById(column);
                if (dropdown && data[column]) {
                    dropdown.value = data[column];
                }
            });
        })
        .catch(error => console.error('Error al cargar detalles del ejercicio:', error));
}

// Función para manejar la modificación del ejercicio
document.getElementById('modifyExerciseForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Obtener los valores del formulario
    const updatedExercise = {
        id: exerciseId,
        nombre_ejercicio: document.getElementById('nombre_ejercicio').value,
        video: document.getElementById('video').value,
        clasificacion: document.getElementById('clasificacion').value,
        grupo_muscular: document.getElementById('grupo_muscular').value,
        agonista: document.getElementById('agonista').value,
        nivel_dificultad: document.getElementById('nivel_dificultad').value,
        equipamiento: document.getElementById('equipamiento').value,
        patron_movimientos: document.getElementById('patron_movimientos').value,
        plano_ejecucion: document.getElementById('plano_ejecucion').value,
        lateralidad: document.getElementById('lateralidad').value
    };

    // Enviar los datos actualizados al servidor
    fetch('../php/modificar_ejercicio.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedExercise)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('confirmationMessage').classList.remove('hidden');
            document.getElementById('modifyExerciseForm').reset();
        } else {
            alert('Error al modificar el ejercicio: ' + data.message);
        }
    })
    .catch(error => console.error('Error al modificar el ejercicio:', error));
});

// Llamar a la función para cargar las opciones dinámicamente y los detalles del ejercicio
loadDropdownOptions();
