const selectGenero = document.getElementById('genero');
const inputEdad = document.getElementById('edad');
const inputMasa = document.getElementById('masa');
const selectEjercicio = document.getElementById('ejercicio');
const inputDistancia = document.getElementById('distancia');
const inputRepeticiones = document.getElementById('repeticiones');

const btnCalcular = document.getElementById('btn-calcular');
const btnLimpiar = document.getElementById('btn-limpiar');
const pError = document.getElementById('mensaje-error');

const pResultado = document.getElementById('resultado');
const pEquivalencia = document.getElementById('equivalencia');
const pMensajePromedio = document.getElementById('mensajePromedio');
const canvasGrafico = document.getElementById('graficoJoules');
const canvasPotencia = document.getElementById('graficoPotencia'); // NUEVO: Canvas de potencia

const tbodyHistorial = document.getElementById('tbody-historial');
const txtTotalJoules = document.getElementById('txt-total-joules');

// ==================== VARIABLES Y VECTORES ====================
let chartInstance = null;
let chartPotenciaInstance = null; // NUEVO: Instancia para el gráfico de potencia

let vectorEjercicios = [];
let vectorJoules = [];
let vectorWatts = [];

const equivalencias = [
    { costo: 333, texto: "subir [N] pisos por las escaleras" },
    { costo: 196, texto: "levantar [N] cajas de 10 kg del suelo" },
    { costo: 147, texto: "levantar a un niño de 15 kg [N] veces" },
    { costo: 196, texto: "subir [N] botellones de agua de 20 litros" },
    { costo: 294, texto: "cargar [N] tanques de gas llenos (30 kg)" }
];

window.onload = function() {
    cargarDatosLocales();
};

// ==================== EVENTOS ====================
btnCalcular.addEventListener('click', function () {
    if (validarCamposVisulamente()) {
        fnCalcularYAgregarSerie();
    }
});

btnLimpiar.addEventListener('click', function () {
    vectorEjercicios = [];
    vectorJoules = [];
    vectorWatts = [];
    guardarDatosLocales();
    presentarVectores();
    
    pResultado.innerText = "";
    pEquivalencia.innerText = "";
    pMensajePromedio.innerText = "";
    if (chartInstance) chartInstance.destroy();
    if (chartPotenciaInstance) chartPotenciaInstance.destroy(); // NUEVO: Limpiar gráfico de potencia
});

// ==================== FUNCIONES LÓGICAS ====================
function validarCamposVisulamente() {
    // Retiramos el inputTiempo del arreglo de validación
    let inputsArray = [selectGenero, inputEdad, inputMasa, selectEjercicio, inputDistancia, inputRepeticiones];
    let hayError = false;

    for (let i = 0; i < inputsArray.length; i++) {
        let campo = inputsArray[i];
        if (!campo.value || parseFloat(campo.value) <= 0) {
            campo.classList.add("input-error");
            hayError = true;
        } else {
            campo.classList.remove("input-error");
        }
    }

    if (hayError) {
        pError.style.display = "block";
        return false;
    } else {
        pError.style.display = "none";
        return true;
    }
}

function fnCalcularYAgregarSerie() {
    const masa = parseFloat(inputMasa.value);
    const distanciaM = parseFloat(inputDistancia.value) / 100;
    const repeticiones = parseInt(inputRepeticiones.value);
    
    // Extracción del multiplicador y del tiempo estimado desde el <option>
    const opcionSeleccionada = selectEjercicio.options[selectEjercicio.selectedIndex];
    const porcentajeMasa = parseFloat(opcionSeleccionada.value);
    const tiempoPorRepeticion = parseFloat(opcionSeleccionada.getAttribute('data-tiempo'));
    const nombreEjercicio = opcionSeleccionada.text.split('(')[0].trim();

    const gravedad = 9.81;
    const masaEfectiva = masa * porcentajeMasa;

    // Fórmulas físicas
    const trabajoTotal = (masaEfectiva * gravedad) * distanciaM * repeticiones;
    
    // Cálculo automático: tiempo de 1 repetición * cantidad de repeticiones
    const tiempoEstimadoTotal = tiempoPorRepeticion * repeticiones;
    const potencia = trabajoTotal / tiempoEstimadoTotal;

    // Almacenar y actualizar
    vectorEjercicios.push(nombreEjercicio);
    vectorJoules.push(trabajoTotal);
    vectorWatts.push(potencia);

    guardarDatosLocales();
    presentarVectores();

    pResultado.innerText = `Serie completada: ${trabajoTotal.toFixed(2)} Joules | ${potencia.toFixed(2)} Watts`;

    const eqRandom = equivalencias[Math.floor(Math.random() * equivalencias.length)];
    const cantidadEq = Math.max(1, Math.round(trabajoTotal / eqRandom.costo));
    pEquivalencia.innerText = "Solo en esta serie moviste el equivalente a " + eqRandom.texto.replace('[N]', cantidadEq) + ".";
}

function presentarVectores() {
    let strFilas = '';
    let totalJoulesAcumulados = 0;

    for (let i = 0; i < vectorEjercicios.length; i++) {
        strFilas += '<tr>';
        strFilas += `<td>${i + 1}</td>`;
        strFilas += `<td>${vectorEjercicios[i]}</td>`;
        strFilas += `<td>${vectorJoules[i].toFixed(2)}</td>`;
        strFilas += `<td>${vectorWatts[i].toFixed(2)}</td>`;
        strFilas += '</tr>';

        totalJoulesAcumulados += vectorJoules[i];
    }

    tbodyHistorial.innerHTML = strFilas;
    txtTotalJoules.innerText = totalJoulesAcumulados.toFixed(2);

    if (vectorEjercicios.length > 0) {
        const genero = selectGenero.value;
        const edad = parseInt(inputEdad.value);
        const promedioHumanoUnaSerie = calcularPromedioHumano(genero, edad);
        const metaAcumulada = promedioHumanoUnaSerie * vectorEjercicios.length;

        if (totalJoulesAcumulados >= metaAcumulada) {
            pMensajePromedio.style.color = "#28a745";
            pMensajePromedio.innerText = "¡Brutal! Tu energía total supera la media para la cantidad de series que llevas.";
        } else {
            pMensajePromedio.style.color = "#dc3545";
            pMensajePromedio.innerText = "Sigue dándole, tu ritmo global está un poco por debajo de la media.";
        }

        actualizarGrafico(totalJoulesAcumulados, metaAcumulada);
        actualizarGraficoPotencia(); // NUEVO: Actualizar la gráfica de potencia con la nueva serie
    }
}

function calcularPromedioHumano(genero, edad) {
    let pesoPromedio = (genero === 'm') ? 60 : (genero === 'f') ? 50 : 55;
    let repsPromedio = (genero === 'm') ? 15 : (genero === 'f') ? 8 : 11.5;
    let distanciaPromedio = 0.20;
    
    let factorEdad = 1;
    if (edad < 15) factorEdad = 0.6;
    else if (edad >= 35 && edad < 45) factorEdad = 0.75;
    else if (edad >= 45) factorEdad = 0.5;
    
    return (pesoPromedio * 0.70 * 9.81) * distanciaPromedio * (repsPromedio * factorEdad);
}

function actualizarGrafico(joulesUsuario, promedioHumano) {
    const ctx = canvasGrafico.getContext("2d");
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Acumulado', 'Meta Sugerida (Acumulada)'],
            datasets: [{
                label: 'Energía (Joules)',
                data: [joulesUsuario, promedioHumano],
                backgroundColor: ['#007bff', '#6c757d'],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// NUEVA FUNCIÓN: Genera la gráfica de picos para la Potencia
function actualizarGraficoPotencia() {
    const ctx = canvasPotencia.getContext("2d");
    if (chartPotenciaInstance) chartPotenciaInstance.destroy();

    // Generar labels automáticos según la cantidad de series que haya (Serie 1, Serie 2, etc.)
    const labelsSeries = vectorWatts.map((_, index) => `Serie ${index + 1}`);

    chartPotenciaInstance = new Chart(ctx, {
        type: 'line', // Tipo línea para los picos
        data: {
            labels: labelsSeries,
            datasets: [{
                label: 'Potencia (Watts)',
                data: vectorWatts,
                borderColor: '#ffc107', // Color de la línea (amarillo)
                backgroundColor: 'rgba(255, 193, 7, 0.2)', // Fondo semitransparente debajo de la línea
                borderWidth: 2,
                pointBackgroundColor: '#dc3545', // Color de los puntos/picos (rojo)
                pointRadius: 5, // Tamaño de los picos
                tension: 0, // Esto es clave: 0 hace que las líneas sean rectas de un punto a otro formando "picos"
                fill: true
            }]
        },
        options: { 
            responsive: true, 
            plugins: { 
                legend: { display: true } 
            },
            scales: {
                y: {
                    beginAtZero: true // Obliga a que el gráfico arranque desde cero en el eje Y
                }
            }
        }
    });
}

function guardarDatosLocales() {
    const datos = {
        ejercicios: vectorEjercicios,
        joules: vectorJoules,
        watts: vectorWatts
    };
    localStorage.setItem('historialRutina', JSON.stringify(datos));
}

function cargarDatosLocales() {
    const datosGuardados = localStorage.getItem('historialRutina');
    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        vectorEjercicios = datos.ejercicios || [];
        vectorJoules = datos.joules || [];
        vectorWatts = datos.watts || [];
        
        if (vectorEjercicios.length > 0) {
            presentarVectores();
        }
    }
}
