document.addEventListener('DOMContentLoaded', function() {
    loadActiveTraining();
});

// Función para cargar el entrenamiento activo del usuario
function loadActiveTraining() {
    fetch('../php/entrenamiento_activo.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderTrainingDetails(data);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error al cargar el entrenamiento:', error));
}

// Función para renderizar los detalles del entrenamiento (Días, Fases, Ejercicios)
function renderTrainingDetails(data) {
    const trainingContainer = document.getElementById('trainingDetails');
    trainingContainer.innerHTML = ''; // Limpiar el contenedor

    // Añadir nombre y descripción del entrenamiento
    const title = document.createElement('h2');
    title.textContent = data.nombre;
    title.classList.add('training-title');
    const description = document.createElement('p');
    description.textContent = data.descripcion;
    description.classList.add('training-description');
    trainingContainer.appendChild(title);
    trainingContainer.appendChild(description);

    // Iterar sobre los días del entrenamiento
    data.dias.forEach(dia => {
        const diaDiv = document.createElement('div');
        diaDiv.classList.add('dia-container');

        // Mostrar el nombre del día
        const diaTitle = document.createElement('h3');
        diaTitle.textContent = `${dia.nombre_dia}`;
        diaTitle.classList.add('day-title');
        diaDiv.appendChild(diaTitle);

        // Iterar sobre las fases del día
        dia.fases.forEach(fase => {
            const faseDiv = document.createElement('div');
            faseDiv.classList.add('fase-container');

            // Mostrar el nombre de la fase
            const faseTitle = document.createElement('h4');
            faseTitle.textContent = `${fase.nombre}`;
            faseTitle.classList.add('phase-title');
            faseDiv.appendChild(faseTitle);

            // Iterar sobre los ejercicios de la fase
            fase.ejercicios.forEach(ejercicio => {
                const exerciseName = document.createElement('div');
                exerciseName.classList.add('exercise-name');
                exerciseName.textContent = ejercicio.nombre_ejercicio;
                faseDiv.appendChild(exerciseName);

                const exerciseInfo = document.createElement('div');
                exerciseInfo.classList.add('exercise-info');
                exerciseInfo.textContent = `${ejercicio.sets} x ${ejercicio.repeticiones} / ${ejercicio.descanso} descanso`;
                faseDiv.appendChild(exerciseInfo);

                if (ejercicio.video) {
                    const videoLink = document.createElement('a');
                    videoLink.href = '#';
                    videoLink.textContent = 'Ver Video';
                    videoLink.classList.add('video-link');

                    // Añadir evento para abrir el video en una nueva ventana emergente
                    videoLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        openVideoInPopup(ejercicio.video);
                    });

                    faseDiv.appendChild(videoLink);
                }

                // Separador entre ejercicios
                const divider = document.createElement('div');
                divider.classList.add('exercise-divider');
                faseDiv.appendChild(divider);
            });

            // Añadir la fase al contenedor del día
            diaDiv.appendChild(faseDiv);
        });

        // Añadir el día completo al contenedor principal
        trainingContainer.appendChild(diaDiv);
    });
}

// Función para abrir el video en una ventana emergente
function openVideoInPopup(videoUrl) {
    const popupWidth = 360;
    const popupHeight = 220;
    const left = (screen.width - popupWidth) / 2;
    const top = (screen.height - popupHeight) / 2;
    const popupWindow = window.open(
        videoUrl,
        'popup',
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no`
    );
    
    if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
        alert('Por favor, permite las ventanas emergentes para poder ver el video.');
    }
}
