document.addEventListener('DOMContentLoaded', function () {
    let dias = [];
    const isReturningFromPhase = localStorage.getItem('returningFromPhase') === 'true';

    // Limpiar localStorage si estamos entrando desde menuroot.html
    if (!isReturningFromPhase) {
        localStorage.removeItem('dias');
        localStorage.removeItem('nombreEntrenamiento');
        localStorage.removeItem('descripcionEntrenamiento');
    }

    // Cargar nombre y descripción del entrenamiento desde localStorage si existen
    const nombreEntrenamiento = localStorage.getItem('nombreEntrenamiento') || '';
    const descripcionEntrenamiento = localStorage.getItem('descripcionEntrenamiento') || '';

    document.getElementById('nombreEntrenamiento').value = nombreEntrenamiento;
    document.getElementById('descripcionEntrenamiento').value = descripcionEntrenamiento;

    // Cargar días desde localStorage si ya existen
    if (localStorage.getItem('dias')) {
        dias = JSON.parse(localStorage.getItem('dias'));
    }

    // Renderizar los días y fases en la página
    renderDias();

    // Guardar título y descripción cuando se modifiquen
    document.getElementById('nombreEntrenamiento').addEventListener('input', function () {
        localStorage.setItem('nombreEntrenamiento', this.value);
    });

    document.getElementById('descripcionEntrenamiento').addEventListener('input', function () {
        localStorage.setItem('descripcionEntrenamiento', this.value);
    });

    // Añadir día al presionar el botón
    document.getElementById('addDayButton').addEventListener('click', function () {
        const dayNumber = prompt("Introduce el número del día (1, 2, 3, etc.):");

        if (dayNumber) {
            // Crear nuevo día
            const newDay = {
                id: dias.length + 1,
                dia: `Día ${dayNumber}`,
                fases: []  // Inicialmente vacío
            };

            // Añadir día al array de días
            dias.push(newDay);
            localStorage.setItem('dias', JSON.stringify(dias));

            // Renderizar los días nuevamente
            renderDias();
        }
    });

    // Función para renderizar los días y fases en el DOM
    function renderDias() {
        const diasContainer = document.getElementById('diasContainer');
        diasContainer.innerHTML = ''; // Limpiar el contenedor

        dias.forEach((dia, index) => {
            // Crear div para el día
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day-item');

            // Mostrar el nombre del día
            const dayTitle = document.createElement('h3');
            dayTitle.textContent = `${dia.dia}`;
            dayDiv.appendChild(dayTitle);

            // Botón para añadir fase dentro de este día
            const addPhaseButton = document.createElement('button');
            addPhaseButton.textContent = 'Añadir Fase';
            addPhaseButton.classList.add('button');
            addPhaseButton.onclick = function () {
                const phaseName = prompt("Introduce el nombre de la fase (p.ej. Calentamiento, Parte Principal, etc.)");

                if (phaseName) {
                    const newPhase = {
                        id: dia.fases.length + 1,
                        nombre: phaseName,
                        ejercicios: []  // Inicialmente vacío
                    };

                    // Añadir fase al día específico
                    dia.fases.push(newPhase);
                    localStorage.setItem('dias', JSON.stringify(dias));

                    // Renderizar los días nuevamente
                    renderDias();
                }
            };
            dayDiv.appendChild(addPhaseButton);

            // Renderizar las fases del día
            dia.fases.forEach((fase, phaseIndex) => {
                const phaseDiv = document.createElement('div');
                phaseDiv.classList.add('phase-item');

                const phaseTitle = document.createElement('h4');
                phaseTitle.textContent = `Fase ${phaseIndex + 1}: ${fase.nombre}`;
                phaseDiv.appendChild(phaseTitle);

                // Mostrar resumen de ejercicios de la fase
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

                // Botón para añadir ejercicios
                const addExerciseButton = document.createElement('button');
                addExerciseButton.textContent = 'Añadir Ejercicio';
                addExerciseButton.classList.add('button');
                addExerciseButton.onclick = function () {
                    localStorage.setItem('returningFromPhase', 'true'); // Marcar que estamos volviendo de una fase
                    window.location.href = `fase.html?diaId=${dia.id}&faseId=${fase.id}`;
                };
                phaseDiv.appendChild(addExerciseButton);

                // Botón para eliminar fase
                const deletePhaseButton = document.createElement('button');
                deletePhaseButton.textContent = 'Eliminar Fase';
                deletePhaseButton.classList.add('button', 'delete-button');
                deletePhaseButton.onclick = function () {
                    dia.fases = dia.fases.filter(f => f.id !== fase.id);
                    localStorage.setItem('dias', JSON.stringify(dias));
                    localStorage.removeItem(`fase_${dia.id}_${fase.id}_ejercicios`);  // Eliminar los ejercicios asociados
                    renderDias();  // Volver a renderizar
                };
                phaseDiv.appendChild(deletePhaseButton);

                dayDiv.appendChild(phaseDiv); // Añadir fase al día
            });

            // Botón para eliminar día
            const deleteDayButton = document.createElement('button');
            deleteDayButton.textContent = 'Eliminar Día';
            deleteDayButton.classList.add('button', 'delete-button');
            deleteDayButton.onclick = function () {
                dias = dias.filter(d => d.id !== dia.id);
                localStorage.setItem('dias', JSON.stringify(dias));
                renderDias();  // Volver a renderizar
            };
            dayDiv.appendChild(deleteDayButton);

            diasContainer.appendChild(dayDiv); // Añadir día al contenedor
        });
    }

    // Guardar el entrenamiento completo
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

            // Enviar entrenamiento al servidor
            fetch('../php/guardar_entrenamiento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entrenamiento)
            })
                .then(response => response.text()) // Cambiado a .text() temporalmente para depurar
                .then(data => {
                    console.log("Raw response data:", data); // Ver la respuesta exacta
                    try {
                        const jsonData = JSON.parse(data); // Intenta convertir en JSON
                        if (jsonData.success) {
                            alert('Entrenamiento guardado con éxito');
                            localStorage.clear();  // Limpiar todo el localStorage
                            window.location.href = 'menuroot.html'; // Redirigir tras guardar
                        } else {
                            console.error(jsonData);
                            alert('Error al guardar el entrenamiento');
                        }
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                        alert('Error en la respuesta del servidor');
                    }
                })
                .catch(error => {
                    console.error('Error al guardar el entrenamiento:', error);
                });
        } else {
            alert('Por favor, completa todos los campos del entrenamiento');
        }
    });

    // Botón para volver al menú principal
    document.getElementById('backButton').addEventListener('click', function () {
        localStorage.clear();  // Limpiar el localStorage
        window.location.href = 'menuroot.html'; // Redirigir al menú principal
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Cargar entrenamientos en el desplegable
    fetch('../php/li_ent.php')
        .then(response => response.json())
        .then(data => {
            const selectEntrenamiento = document.getElementById('selectEntrenamiento');
            data.entrenamientos.forEach(entrenamiento => {
                const option = document.createElement('option');
                option.value = entrenamiento.id;
                option.textContent = entrenamiento.nombre;
                selectEntrenamiento.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar los entrenamientos:', error));

    // Botón para clonar un entrenamiento
    document.getElementById('cloneEntrenamientoButton').addEventListener('click', function () {
        const entrenamientoId = document.getElementById('selectEntrenamiento').value;

        if (entrenamientoId) {
            fetch(`../php/ob_ent.php?id=${entrenamientoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('nombreEntrenamiento').value = data.entrenamiento.nombre;
                        document.getElementById('descripcionEntrenamiento').value = data.entrenamiento.descripcion;
                        localStorage.setItem('dias', JSON.stringify(data.entrenamiento.dias));
                        renderDias();
                    } else {
                        alert('Error al obtener el entrenamiento');
                    }
                })
                .catch(error => console.error('Error al clonar el entrenamiento:', error));
        }
    });

    // Función renderDias
    function renderDias() {
        const dias = JSON.parse(localStorage.getItem('dias')) || [];
        const diasContainer = document.getElementById('diasContainer');
        diasContainer.innerHTML = '';

        dias.forEach((dia, diaIndex) => {
            const diaDiv = document.createElement('div');
            diaDiv.classList.add('dia');
            diaDiv.innerHTML = `
                <h3>Día ${diaIndex + 1}: ${dia.dia}</h3>
                <button onclick="addFase(${diaIndex})" class="button">Añadir Fase</button>
                <button onclick="deleteDia(${diaIndex})" class="button delete-button">Eliminar Día</button>
            `;

            dia.fases.forEach((fase, faseIndex) => {
                const faseDiv = document.createElement('div');
                faseDiv.classList.add('fase');
                faseDiv.innerHTML = `
                    <h4>Fase ${faseIndex + 1}: ${fase.nombre}</h4>
                    <button onclick="window.location.href='fase.html';" class="button">Añadir Ejercicio</button>
                    <button onclick="deleteFase(${diaIndex}, ${faseIndex})" class="button delete-button">Eliminar Fase</button>
                    <ul id="ejerciciosList-${diaIndex}-${faseIndex}"></ul>
                `;

                const ejerciciosList = faseDiv.querySelector(`#ejerciciosList-${diaIndex}-${faseIndex}`);
                fase.ejercicios.forEach((ejercicio, ejercicioIndex) => {
                    const ejercicioItem = document.createElement('li');
                    ejercicioItem.innerHTML = `
                        ${ejercicio.nombre || 'Nombre no disponible'} - ${ejercicio.sets || 0} sets de ${ejercicio.repeticiones || 0} reps, descanso ${ejercicio.descanso || 0}s
                    `;
                    ejerciciosList.appendChild(ejercicioItem);
                });

                diaDiv.appendChild(faseDiv);
            });

            diasContainer.appendChild(diaDiv);
        });
    }

    // Función para añadir una nueva fase
    window.addFase = function(diaIndex) {
        const dias = JSON.parse(localStorage.getItem('dias')) || [];
        const nombreFase = prompt('Nombre de la nueva fase:');

        if (nombreFase) {
            const nuevaFase = {
                nombre: nombreFase,
                ejercicios: []
            };
            dias[diaIndex].fases.push(nuevaFase);
            localStorage.setItem('dias', JSON.stringify(dias));
            renderDias();
        }
    };

    // Función para añadir un nuevo ejercicio
    window.addEjercicio = function(diaIndex, faseIndex) {
        const dias = JSON.parse(localStorage.getItem('dias')) || [];
        const nombreEjercicio = prompt('Nombre del ejercicio:');
        const sets = prompt('Número de sets:');
        const repeticiones = prompt('Número de repeticiones:');
        const descanso = prompt('Descanso (en segundos):');

        if (nombreEjercicio && sets && repeticiones && descanso) {
            const nuevoEjercicio = {
                nombre: nombreEjercicio,
                sets: sets,
                repeticiones: repeticiones,
                descanso: descanso
            };
            dias[diaIndex].fases[faseIndex].ejercicios.push(nuevoEjercicio);
            localStorage.setItem('dias', JSON.stringify(dias));
            renderDias();
        }
    };

    // Función para eliminar un día
    window.deleteDia = function(diaIndex) {
        const dias = JSON.parse(localStorage.getItem('dias')) || [];
        dias.splice(diaIndex, 1);
        localStorage.setItem('dias', JSON.stringify(dias));
        renderDias();
    };

    // Función para eliminar una fase
    window.deleteFase = function(diaIndex, faseIndex) {
        const dias = JSON.parse(localStorage.getItem('dias')) || [];
        dias[diaIndex].fases.splice(faseIndex, 1);
        localStorage.setItem('dias', JSON.stringify(dias));
        renderDias();
    };

    // Función para eliminar un ejercicio
    window.deleteEjercicio = function(diaIndex, faseIndex, ejercicioIndex) {
        const dias = JSON.parse(localStorage.getItem('dias')) || [];
        dias[diaIndex].fases[faseIndex].ejercicios.splice(ejercicioIndex, 1);
        localStorage.setItem('dias', JSON.stringify(dias));
        renderDias();
    };

    // Llamar a renderDias() después de obtener los datos del entrenamiento clonado
});