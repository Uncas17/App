// Archivo: js/add_exercise.js

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

// Cargar las opciones de la base de datos a los desplegables
function loadDropdownOptions() {
    // Realizar una llamada a listar_opciones.php
    fetch('../php/listar_opciones.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Procesar la respuesta como JSON
        })
        .then(data => {
            console.log('Opciones recibidas del servidor:', data); // Verificar el contenido del JSON en la consola
            
            // Verificar que data no sea null o undefined
            if (data) {
                populateDropdowns(data);  // Llenar los menús desplegables con los datos recibidos
            } else {
                console.error('Error: No se recibieron datos válidos del servidor.');
            }
        })
        .catch(error => console.error('Error al cargar las opciones:', error));
}

// Función para llenar los menús desplegables con las opciones únicas
function populateDropdowns(data) {
    // Verificar si la variable 'data' está correctamente definida antes de usarla
    if (!data || typeof data !== 'object') {
        console.error('Error: La variable "data" no está definida o no es un objeto:', data);
        return;
    }

    // Iterar sobre cada columna para llenar los desplegables
    Object.keys(filterColumns).forEach(id => {
        const dropdown = document.getElementById(id);
        if (data[id] && dropdown) {
            console.log(`Llenando el desplegable ${id} con las opciones:`, data[id]); // Mensaje para verificar las opciones de cada desplegable
            data[id].forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                dropdown.appendChild(optionElement);
            });
        } else {
            console.warn(`No se encontraron opciones para el campo ${id} o no existe el elemento con id ${id}`);
        }
    });
}

// Llamar a la función para cargar las opciones dinámicamente
loadDropdownOptions();

// Manejar el envío del formulario para añadir un nuevo ejercicio
document.getElementById('addExerciseForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada

    // Obtener los valores del formulario
    const nombreEjercicio = document.getElementById('nombre_ejercicio').value;
    const video = document.getElementById('video').value;
    const clasificacion = document.getElementById('clasificacion').value;
    const grupoMuscular = document.getElementById('grupo_muscular').value;
    const agonista = document.getElementById('agonista').value;
    const nivelDificultad = document.getElementById('nivel_dificultad').value;
    const equipamiento = document.getElementById('equipamiento').value;
    const patronMovimientos = document.getElementById('patron_movimientos').value;
    const planoEjecucion = document.getElementById('plano_ejecucion').value;
    const lateralidad = document.getElementById('lateralidad').value;

    // Crear un objeto con los datos del nuevo ejercicio
    const newExercise = {
        nombre_ejercicio: nombreEjercicio,
        video: video,
        clasificacion: clasificacion,
        grupo_muscular: grupoMuscular,
        agonista: agonista,
        nivel_dificultad: nivelDificultad,
        equipamiento: equipamiento,
        patron_movimientos: patronMovimientos,
        plano_ejecucion: planoEjecucion,
        lateralidad: lateralidad
    };

    // Enviar los datos al servidor para que se añadan a la base de datos
    fetch('../php/add_exercise.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExercise)
    })
    .then(response => response.json()) // Procesar la respuesta como JSON
    .then(data => {
        console.log('Respuesta del servidor:', data); // Verificar la respuesta del servidor
        if (data.success) {
            // Mostrar el mensaje de confirmación y restablecer el formulario
            document.getElementById('confirmationMessage').classList.remove('hidden');
            document.getElementById('addExerciseForm').reset();
        } else {
            console.error('Error al añadir el ejercicio:', data.message);
            alert(`Error al añadir el ejercicio: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error al realizar la solicitud:', error);
        alert('No se pudo realizar la solicitud. Por favor, verifica la configuración del servidor.');
    });
});
