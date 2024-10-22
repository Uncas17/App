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
