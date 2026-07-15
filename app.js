document.addEventListener("DOMContentLoaded", function() {
    // Configuración Inicial
    const GRAVEDAD = 9.81; // m/s^2
    const totalJoulesText = document.getElementById("txt-total-joules");
    let totalJoulesHoy = 0;
    let serieCount = 0;
    let historial = [];

    // Referencias a elementos DOM
    const imagenEjercicio = document.getElementById("ejercicio-imagen");
    const ejercicioSelect = document.getElementById("ejercicio");
    const inputs = ["genero", "edad", "masa", "ejercicio", "distancia", "repeticiones"].map(id => document.getElementById(id));
    const msgError = document.getElementById("mensaje-error");
    const tbodyHistorial = document.getElementById("tbody-historial");
    const canvasGrafico = document.getElementById("graficoJoules");
    const btnCalcular = document.getElementById("btn-calcular");
    const btnLimpiar = document.getElementById("btn-limpiar");
    let graficoBarra;

    // --- LÓGICA DE CAMBIO DE IMAGEN DINÁMICA ---
    const imagenesPorEjercicio = {
        default: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Push-up-01.gif",
        flexiones: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Push-up-01.gif",
        sentadillas: "https://upload.wikimedia.org/wikipedia/commons/d/df/Squat.gif",
        dominadas: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Chin-up-01.gif",
        burpees: "https://upload.wikimedia.org/wikipedia/commons/1/18/Burpee.gif"
    };

    // Inicializar imagen por defecto (o flexiones si ya está seleccionado)
    actualizarImagenEjercicio();

    // Evento change para el selector de ejercicio
    ejercicioSelect.addEventListener("change", actualizarImagenEjercicio);

    function actualizarImagenEjercicio() {
        const opcionSeleccionada = ejercicioSelect.options[ejercicioSelect.selectedIndex].text;
        
        if (opcionSeleccionada.includes("Flexiones")) {
            imagenEjercicio.src = imagenesPorEjercicio.flexiones;
            imagenEjercicio.alt = "Animación de Flexiones de Pecho";
        } else if (opcionSeleccionada.includes("Sentadillas")) {
            imagenEjercicio.src = imagenesPorEjercicio.sentadillas;
            imagenEjercicio.alt = "Animación de Sentadillas";
        } else if (opcionSeleccionada.includes("Dominadas")) {
            imagenEjercicio.src = imagenesPorEjercicio.dominadas;
            imagenEjercicio.alt = "Animación de Dominadas";
        } else if (opcionSeleccionada.includes("Saltos / Burpees")) {
            imagenEjercicio.src = imagenesPorEjercicio.burpees;
            imagenEjercicio.alt = "Animación de Burpees";
        } else {
            // Imagen por defecto si no se ha seleccionado nada aún
            imagenEjercicio.src = imagenesPorEjercicio.default;
            imagenEjercicio.alt = "Calistenia";
        }
    }
    // --- FIN LÓGICA DE CAMBIO DE IMAGEN ---


    // --- LÓGICA DE CÁLCULO Y GESTIÓN DE RUTINA ---

    btnCalcular.addEventListener("click", calcularYCargarSerie);
    btnLimpiar.addEventListener("click", limpiarRutina);

    function calcularYCargarSerie() {
        let hayError = false;

        // Validar inputs y limpiar estilos anteriores
        inputs.forEach(input => {
            if (!input.value || input.value === "") {
                input.classList.add("input-error");
                hayError = true;
            } else {
                input.classList.remove("input-error");
            }
        });

        if (hayError) {
            msgError.style.display = "block";
            return;
        }

        msgError.style.display = "none";

        // Obtener valores
        const masa = parseFloat(document.getElementById("masa").value);
        const opcionEjercicio = ejercicioSelect.options[ejercicioSelect.selectedIndex];
        const porcentajeMasa = parseFloat(opcionEjercicio.value);
        const tiempoEstimadoRep = parseFloat(opcionEjercicio.dataset.tiempo);
        const distanciaCm = parseFloat(document.getElementById("distancia").value);
        const repeticiones = parseInt(document.getElementById("repeticiones").value);

        // Convertir unidades
        const distanciaM = distanciaCm / 100;

        // CÁLCULOS FÍSICOS
        // Fuerza (peso efectivo en Newton) = masa * % de masa movida * gravedad
        const fuerzaN = masa * porcentajeMasa * GRAVEDAD;

        // Trabajo por repetición (Joules) = Fuerza * Distancia
        const trabajoPorRepJ = fuerzaN * distanciaM;

        // Trabajo total de la serie (Joules) = Trabajo por rep * repeticiones
        const trabajoTotalSerieJ = trabajoPorRepJ * repeticiones;

        // Tiempo total de la serie (segundos)
        const tiempoTotalSerieS = tiempoEstimadoRep * repeticiones;

        // Potencia (Watts) = Trabajo Total / Tiempo Total
        const potenciaSerieW = trabajoTotalSerieJ / tiempoTotalSerieS;

        // --- ACTUALIZAR UI Y DATOS ---
        totalJoulesHoy += trabajoTotalSerieJ;
        serieCount++;
        
        const nombreEjercicio = opcionEjercicio.text.split(" (~")[0]; // Nombre corto

        // Guardar en historial
        historial.push({
            # : serieCount,
            ejercicio: nombreEjercicio,
            trabajo: trabajoTotalSerieJ,
            potencia: potenciaSerieW
        });

        // Actualizar Tabla de Historial
        actualizarTabla();

        // Actualizar Total Energía
        totalJoulesText.textContent = totalJoulesHoy.toFixed(2);

        // Actualizar Gráfico
        actualizarGrafico();

        // Mostrar resultados inmediatos
        document.getElementById("resultado").innerHTML = 
            `Serie #${serieCount}: ${nombreEjercicio}<br>` +
            `Trabajo: ${trabajoTotalSerieJ.toFixed(2)} Joules<br>` +
            `Potencia Promedio: ${potenciaSerieW.toFixed(2)} Watts`;

        // Pequeña equivalencia nutricional (aprox 1 kcal = 4184 Joules)
        const kcal = trabajoTotalSerieJ / 4184;
        document.getElementById("equivalencia").textContent = 
            `(Equivale aprox a energía mecánica de mover el peso. No confundir con gasto calórico total real). Aprox: ${kcal.toFixed(4)} Kcal.`;

        limpiarInputsCarga();
    }

    function actualizarTabla() {
        tbodyHistorial.innerHTML = ""; // Limpiar tabla
        
        historial.forEach(serie => {
            const fila = `<tr>
                <td>${serie.#}</td>
                <td>${serie.ejercicio}</td>
                <td>${serie.trabajo.toFixed(2)}</td>
                <td>${serie.potencia.toFixed(2)}</td>
            </tr>`;
            tbodyHistorial.insertAdjacentHTML('beforeend', fila);
        });
    }

    function actualizarGrafico() {
        // Preparar datos para el gráfico
        const etiquetas = historial.map(s => `Serie #${s.#} (${s.ejercicio})`);
        const datosJoules = historial.map(s => s.trabajo.toFixed(2));

        if (graficoBarra) {
            graficoBarra.destroy(); // Destruir gráfico anterior para renderizar de nuevo
        }

        graficoBarra = new Chart(canvasGrafico, {
            type: 'bar',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Trabajo Mecánico por Serie (Joules)',
                    data: datosJoules,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Joules (J)'
                        }
                    }
                }
            }
        });
    }

    function limpiarInputsCarga() {
        // Limpiar solo los inputs de carga de serie, no los datos fijos (genero, masa)
        document.getElementById("distancia").value = "";
        document.getElementById("repeticiones").value = "";
        // No reiniciar select ejercicio, a menos que se quiera forzar
    }

    function limpiarRutina() {
        // Reiniciar variables
        totalJoulesHoy = 0;
        serieCount = 0;
        historial = [];

        // Reiniciar UI
        totalJoulesText.textContent = "0.00";
        tbodyHistorial.innerHTML = "";
        document.getElementById("resultado").innerHTML = "";
        document.getElementById("equivalencia").innerHTML = "";
        
        if (graficoBarra) {
            graficoBarra.destroy();
        }

        // Limpiar inputs
        inputs.forEach(input => {
            input.value = "";
            input.classList.remove("input-error");
        });
        document.getElementById("genero").selectedIndex = 0;
        document.getElementById("ejercicio").selectedIndex = 0;
        actualizarImagenEjercicio(); // Volver a imagen por defecto
    }
});
