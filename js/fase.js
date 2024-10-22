document.addEventListener('DOMContentLoaded', function () {
    const diaId = new URLSearchParams(window.location.search).get('diaId'); // Obtener diaId
    const faseId = new URLSearchParams(window.location.search).get('faseId'); 
    let ejerciciosAñadidos = JSON.parse(localStorage.getItem(`fase_${diaId}_${faseId}_ejercicios`)) || []; // Clave actualizada

    // Cargar ejercicios y filtros
    loadExercisesAndFilters();
    renderAddedExercises();

    // Asignar evento al botón de aplicar filtros
    document.getElementById('applyFilters').addEventListener('click', function () {
        applyFilters();
    });

    // Asignar evento al botón "Guardar y Volver"
    document.getElementById('saveAndBackButton').addEventListener('click', function () {
        localStorage.setItem(`fase_${diaId}_${faseId}_ejercicios`, JSON.stringify(ejerciciosAñadidos)); // Guardar ejercicios en localStorage
        window.location.href = 'crear_entrenamiento.html'; // Volver a la página anterior
    });

    // Cargar ejercicios desde la base de datos y generar los filtros
    function loadExercisesAndFilters() {
        fetch('../php/listar_ejercicios.php')
            .then(response => response.json())
            .then(data => {
                createFilters(data);
                displayResults(data);
            })
            .catch(error => console.error('Error al cargar los ejercicios:', error));
    }

    // Función para generar los menús desplegables de los filtros
    function createFilters(data) {
        const uniqueValues = {};
    
        // Definir las columnas que quieres filtrar
        const filterColumns = [
            'clasificacion', 'grupo_muscular', 'agonista', 'nivel_dificultad',
            'equipamiento', 'patron_movimientos', 'plano_ejecucion', 'lateralidad'
        ];
    
        // Recopilar valores únicos para los filtros
        filterColumns.forEach(column => {
            uniqueValues[column] = [...new Set(data.map(item => item[column]).filter(Boolean))];
        });
    
        // Crear los selectores para cada filtro, mostrando los nombres de los filtros encima
        filterColumns.forEach(column => {
            const divFilterGroup = document.createElement('div'); // Agrupador del filtro
            divFilterGroup.classList.add('filter-group'); // Añadimos una clase para estilos
    
            const label = document.createElement('label');
            label.textContent = column.replace('_', ' ').toUpperCase(); // Colocamos el texto del filtro
            label.htmlFor = `filter-${column}`;
    
            const select = document.createElement('select');
            select.id = `filter-${column}`;
            select.classList.add('filter-select'); // Añadimos una clase para estilo
            select.innerHTML = '<option value="">Todos</option>';
    
            uniqueValues[column].forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
    
            // Añadimos el label y el select al div contenedor
            divFilterGroup.appendChild(label);
            divFilterGroup.appendChild(select);
            
            // Añadir el contenedor a la tabla de filtros
            document.getElementById('filters').appendChild(divFilterGroup);
        });
    }

    // Mostrar los resultados en la tabla
    function displayResults(data) {
        const tableBody = document.querySelector('#resultsTable tbody');
        tableBody.innerHTML = ''; // Limpiar la tabla

        data.forEach(row => {
            const tr = document.createElement('tr');

            // Añadir el ID, nombre y grupo muscular
            ['id', 'nombre_ejercicio', 'grupo_muscular'].forEach(key => {
                const td = document.createElement('td');
                td.textContent = row[key];
                tr.appendChild(td);
            });

            // Añadir el video
            const videoTd = document.createElement('td');
            if (row.video) {
                const videoLink = document.createElement('a');
                videoLink.href = row.video;
                videoLink.target = '_blank'; // Abrir en una nueva pestaña
                videoLink.textContent = 'Ver Video';
                videoTd.appendChild(videoLink);
            } else {
                videoTd.textContent = 'No disponible';
            }
            tr.appendChild(videoTd);

            // Botón para añadir el ejercicio a la fase
            const actionTd = document.createElement('td');
            const addButton = document.createElement('button');
            addButton.textContent = 'Añadir';
            addButton.classList.add('button');
            addButton.onclick = function () {
                const sets = prompt("Número de sets:");
                const repeticiones = prompt("Número de repeticiones:");
                const descanso = prompt("Descanso (en segundos):");

                if (sets && repeticiones && descanso) {
                    const ejercicioAñadido = {
                        id: row.id,
                        nombre: row.nombre_ejercicio,
                        sets: sets,
                        repeticiones: repeticiones,
                        descanso: descanso,
                        video: row.video
                    };
                    ejerciciosAñadidos.push(ejercicioAñadido);
                    renderAddedExercises();
                }
            };

            actionTd.appendChild(addButton);
            tr.appendChild(actionTd);
            tableBody.appendChild(tr);
        });

        document.getElementById('resultsCount').textContent = `Ejercicios encontrados: ${data.length}`;
    }

    // Renderizar la lista de ejercicios añadidos
    function renderAddedExercises() {
        const addedExercisesList = document.getElementById('addedExercisesList');
        addedExercisesList.innerHTML = ''; // Limpiar la lista

        ejerciciosAñadidos.forEach((ejercicio, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${ejercicio.nombre} - ${ejercicio.sets} sets de ${ejercicio.repeticiones} reps, descanso ${ejercicio.descanso}s
                <br>
                ${ejercicio.video ? `<a href="${ejercicio.video}" target="_blank">Ver Video</a>` : 'Sin video disponible'}
            `;

            // Botón para eliminar el ejercicio
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('button', 'delete-button');
            deleteButton.onclick = function () {
                ejerciciosAñadidos.splice(index, 1); // Eliminar ejercicio de la lista
                renderAddedExercises(); // Volver a renderizar
            };

            li.appendChild(deleteButton);
            addedExercisesList.appendChild(li);
        });
    }

    // Función para aplicar los filtros seleccionados por el usuario
    function applyFilters() {
        fetch('../php/listar_ejercicios.php')
            .then(response => response.json())
            .then(data => {
                const filters = {};

                ['clasificacion', 'grupo_muscular', 'agonista', 'nivel_dificultad',
                 'equipamiento', 'patron_movimientos', 'plano_ejecucion', 'lateralidad'].forEach(column => {
                    const selectedValue = document.getElementById(`filter-${column}`).value;
                    if (selectedValue) {
                        filters[column] = selectedValue;
                    }
                });

                const filteredData = data.filter(row => {
                    return Object.keys(filters).every(column => row[column] === filters[column]);
                });

                displayResults(filteredData);
            })
            .catch(error => console.error('Error al aplicar los filtros:', error));
    }
});
