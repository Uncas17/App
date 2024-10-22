document.addEventListener('DOMContentLoaded', function () {
    let dias = [];
    const isReturningFromPhase = localStorage.getItem('returningFromPhase') === 'true';

    if (!isReturningFromPhase) {
        localStorage.removeItem('dias');
        localStorage.removeItem('nombreEntrenamiento');
        localStorage.removeItem('descripcionEntrenamiento');
    }

    const nombreEntrenamiento = localStorage.getItem('nombreEntrenamiento') || '';
    const descripcionEntrenamiento = localStorage.getItem('descripcionEntrenamiento') || '';

    document.getElementById('nombreEntrenamiento').value = nombreEntrenamiento;
    document.getElementById('descripcionEntrenamiento').value = descripcionEntrenamiento;

    if (localStorage.getItem('dias')) {
        dias = JSON.parse(localStorage.getItem('dias'));
    }

    renderDias();

    document.getElementById('nombreEntrenamiento').addEventListener('input', function () {
        localStorage.setItem('nombreEntrenamiento', this.value);
    });

    document.getElementById('descripcionEntrenamiento').addEventListener('input', function () {
        localStorage.setItem('descripcionEntrenamiento', this.value);
    });

    document.getElementById('addDayButton').addEventListener('click', function () {
        const dayNumber = prompt("Introduce el número del día (1, 2, 3, etc.):");

        if (dayNumber) {
            const newDay = {
                id: dias.length + 1,
                dia: `Día ${dayNumber}`,
                fases: []
            };

            dias.push(newDay);
            localStorage.setItem('dias', JSON.stringify(dias));
            renderDias();
        }
    });

    function renderDias() {
        const diasContainer = document.getElementById('diasContainer');
        diasContainer.innerHTML = '';

        dias.forEach((dia, index) => {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day-item');

            const dayTitle = document.createElement('h3');
            dayTitle.textContent = `${dia.dia}`;
            dayDiv.appendChild(dayTitle);

            const addPhaseButton = document.createElement('button');
            addPhaseButton.textContent = 'Añadir Fase';
            addPhaseButton.classList.add('button');
            addPhaseButton.onclick = function () {
                const phaseName = prompt("Introduce el nombre de la fase (p.ej. Calentamiento, Parte Principal, etc.)");

                if (phaseName) {
                    const newPhase = {
                        id: dia.fases.length + 1,
                        nombre: phaseName,
                        ejercicios: []
                    };

                    dia.fases.push(newPhase);
                    localStorage.setItem('dias', JSON.stringify(dias));
                    renderDias();
                }
            };
            dayDiv.appendChild(addPhaseButton);

            dia.fases.forEach((fase, phaseIndex) => {
                const phaseDiv = document.createElement('div');
                phaseDiv.classList.add('phase-item');

                const phaseTitle = document.createElement('h4');
                phaseTitle.textContent = `Fase ${phaseIndex + 1}: ${fase.nombre}`;
                phaseDiv.appendChild(phaseTitle);

                const addedExercises = JSON.parse(localStorage.getItem(`fase_${dia.id}_${fase.id}_ejercicios`)) || [];
                if (addedExercises.length > 0) {
                    const exerciseSummary = document.createElement('ul');
                    addedExercises.forEach(ejercicio => {
                        const li = document.createElement('li');
                        li.textContent = `${ejercicio.nombre} - ${ejercicio.sets} sets de ${ejercicio.repeticiones} reps, descanso ${ejercicio.descanso}s`;
                        exerciseSummary.appendChild(li);
                    });
                    phaseDiv.appendChild(exerciseSummary);
                }

                const addExerciseButton = document.createElement('button');
                addExerciseButton.textContent = 'Añadir Ejercicio';
                addExerciseButton.classList.add('button');
                addExerciseButton.onclick = function () {
                    localStorage.setItem('returningFromPhase', 'true');
                    window.location.href = `fase.html?diaId=${dia.id}&faseId=${fase.id}`;
                };
                phaseDiv.appendChild(addExerciseButton);

                const deletePhaseButton = document.createElement('button');
                deletePhaseButton.textContent = 'Eliminar Fase';
                deletePhaseButton.classList.add('button', 'delete-button');
                deletePhaseButton.onclick = function () {
                    dia.fases = dia.fases.filter(f => f.id !== fase.id);
                    localStorage.setItem('dias', JSON.stringify(dias));
                    localStorage.removeItem(`fase_${dia.id}_${fase.id}_ejercicios`);
                    renderDias();
                };
                phaseDiv.appendChild(deletePhaseButton);

                dayDiv.appendChild(phaseDiv);
            });

            const deleteDayButton = document.createElement('button');
            deleteDayButton.textContent = 'Eliminar Día';
            deleteDayButton.classList.add('button', 'delete-button');
            deleteDayButton.onclick = function () {
                dias = dias.filter(d => d.id !== dia.id);
                localStorage.setItem('dias', JSON.stringify(dias));
                renderDias();
            };
            dayDiv.appendChild(deleteDayButton);

            diasContainer.appendChild(dayDiv);
        });
    }

    document.getElementById('saveEntrenamientoButton').addEventListener('click', function () {
        const nombreEntrenamiento = document.getElementById('nombreEntrenamiento').value;
        const descripcionEntrenamiento = document.getElementById('descripcionEntrenamiento').value;

        if (nombreEntrenamiento && descripcionEntrenamiento) {
            const entrenamiento = {
                nombre: nombreEntrenamiento,
                descripcion: descripcionEntrenamiento,
                dias: dias.map(dia => ({
                    dia: dia.dia,
                    fases: dia.fases.map(fase => ({
                        nombre: fase.nombre,
                        ejercicios: JSON.parse(localStorage.getItem(`fase_${dia.id}_${fase.id}_ejercicios`)) || []
                    }))
                }))
            };

            fetch('../php/guardar_entrenamiento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entrenamiento)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Entrenamiento guardado con éxito');
                        localStorage.clear();
                        window.location.href = 'menuroot.html';
                    } else {
                        alert('Error al guardar el entrenamiento: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error al guardar el entrenamiento:', error);
                });
        } else {
            alert('Por favor, completa todos los campos del entrenamiento');
        }
    });

    document.getElementById('backButton').addEventListener('click', function () {
        localStorage.clear();
        window.location.href = 'menuroot.html';
    });

    // Nueva función para clonar entrenamiento
        window.clonarEntrenamiento = function() {
        const entrenamientoId = document.getElementById('entrenamientoLista').value;
        if (!entrenamientoId) {
            alert('Por favor selecciona un entrenamiento para clonar');
            return;
        }
    
        fetch('../php/clonar_entrenamiento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ entrenamiento_id: entrenamientoId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Rellenar el formulario con los datos obtenidos
                document.getElementById('nombre').value = data.entrenamiento.nombre + ' (Copia)';
                document.getElementById('descripcion').value = data.entrenamiento.descripcion;
                document.getElementById('estado').value = data.entrenamiento.estado;
                document.getElementById('comentarios').value = data.entrenamiento.comentarios;
    
                // Aquí puedes añadir lógica para rellenar los días, fases y detalles en el formulario
                // Esto dependerá de la estructura de tu formulario en crear_entrenamiento.html
            } else {
                alert('Error al clonar el entrenamiento: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            alert('Error al clonar el entrenamiento');
        });
    }

    // Cargar la lista de entrenamientos existentes
    function cargarListaEntrenamientos() {
        fetch('../php/listar_entrenamientos.php')
            .then(response => response.json())
            .then(data => {
                const entrenamientoLista = document.getElementById('entrenamientoLista');
                entrenamientoLista.innerHTML = '';
                data.forEach(entrenamiento => {
                    const option = document.createElement('option');
                    option.value = entrenamiento.id;
                    option.textContent = entrenamiento.nombre;
                    entrenamientoLista.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar la lista de entrenamientos:', error);
            });
    }

    // Llamar a la función para cargar la lista de entrenamientos al cargar la página
    cargarListaEntrenamientos();
});
