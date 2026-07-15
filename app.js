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

const tbodyHistorial = document.getElementById('tbody-historial');
const txtTotalJoules = document.getElementById('txt-total-joules');

// Referencia a la imagen en el HTML
const imagenEjercicio = document.getElementById('ejercicio-imagen');

// Estructura para tus imágenes locales. Reemplaza las rutas con las de tu repositorio.
const rutasImagenes = {
    "default": "./assets/img/calistenia_default.jpg",
    "0.68": "./assets/img/flexiones.gif",    // Valor del option de flexiones
    "0.88": "./assets/img/sentadillas.gif",  // Valor del option de sentadillas
    "0.95": "./assets/img/dominadas.gif",    // Valor del option de dominadas
    "1.00": "./assets/img/burpees.gif"       // Valor del option de burpees
};

// ==================== VARIABLES Y VECTORES ====================
let chartInstance = null;

let vectorEjercicios = [];
let vectorJoules = [];
let vectorWatts = [];

// 40 equivalencias calculadas con aproximaciones físicas de Fuerza x Distancia
const equivalencias = [
    { costo: 333, texto: "subir [N] pisos por las escaleras" },
    { costo: 196, texto: "levantar [N] cajas de 10 kg del suelo" },
    { costo: 147, texto: "levantar a un niño de 15 kg [N] veces" },
    { costo: 196, texto: "subir [N] botellones de agua de 20 litros" },
    { costo: 294, texto: "cargar [N] tanques de gas llenos (30 kg)" },
    { costo: 441, texto: "levantar [N] quintales de arroz (45 kg) a 1 metro" },
    { costo: 490, texto: "cargar [N] sacos de cemento (50 kg)" },
    { costo: 98,  texto: "levantar [N] mochilas universitarias pesadas (10 kg)" },
    { costo: 58,  texto: "alzar [N] gatos gordos (6 kg) desde el piso" },
    { costo: 245, texto: "levantar [N] fundas grandes de comida de perro (25 kg)" },
    { costo: 117, texto: "elevar [N] llantas de automóvil pequeñas (12 kg)" },
    { costo: 147, texto: "cargar [N] baldes de pintura de un galón (15 kg)" },
    { costo: 39,  texto: "levantar [N] sillas de madera comunes (4 kg)" },
    { costo: 78,  texto: "alzar [N] televisores medianos antiguos (8 kg)" },
    { costo: 49,  texto: "levantar [N] resmas de papel de 500 hojas (5 kg)" },
    { costo: 686, texto: "empujar [N] refrigeradoras pequeñas 1 metro" },
    { costo: 882, texto: "mover [N] motocicletas de 90 kg un metro de distancia" },
    { costo: 19,  texto: "levantar [N] botellas de cola de 2 litros" },
    { costo: 14,  texto: "alzar [N] laptops estándar (1.5 kg)" },
    { costo: 24,  texto: "levantar [N] sandías grandes (2.5 kg)" },
    { costo: 88,  texto: "cargar [N] canastos de ropa mojada (9 kg)" },
    { costo: 137, texto: "levantar [N] bicicletas montañeras (14 kg)" },
    { costo: 343, texto: "cargar [N] sacos de papas de 35 kg" },
    { costo: 176, texto: "alzar [N] microondas estándar (18 kg)" },
    { costo: 29,  texto: "levantar [N] bloques de ladrillo (3 kg)" },
    { costo: 215, texto: "cargar [N] maletas de viaje llenas (22 kg)" },
    { costo: 490, texto: "levantar [N] yunques de herrería pequeños (50 kg)" },
    { costo: 156, texto: "alzar [N] cajas de herramientas llenas (16 kg)" },
    { costo: 588, texto: "levantar [N] personas de 60 kg un metro del suelo" },
    { costo: 735, texto: "cargar [N] personas de 75 kg un metro del suelo" },
    { costo: 107, texto: "levantar [N] cajas de cervezas o colas (11 kg)" },
    { costo: 392, texto: "alzar [N] sacos de arena para entrenamiento (40 kg)" },
    { costo: 784, texto: "levantar [N] lavadoras modernas (80 kg) un metro" },
    { costo: 274, texto: "cargar [N] colchones de dos plazas (28 kg)" },
    { costo: 980, texto: "mover [N] roperos llenos de ropa (100 kg)" },
    { costo: 127, texto: "levantar [N] carretillas vacías (13 kg)" },
    { costo: 441, texto: "cargar [N] carretillas llenas de tierra (45 kg)" },
    { costo: 68,  texto: "alzar [N] guitarras con su estuche duro (7 kg)" },
    { costo: 313, texto: "levantar [N] motores pequeños fuera de borda (32 kg)" },
    { costo: 8,   texto: "alzar [N] tazas de café llenas 1 metro hacia tu boca" }
];

window.onload = function() {
    cargarDatosLocales();
    // Iniciar con la imagen por defecto si existe
    if(imagenEjercicio) imagenEjercicio.src = rutasImagenes["default"];
};

// ==================== EVENTOS ====================

// Evento para cambiar la imagen al seleccionar el ejercicio
selectEjercicio.addEventListener('change', function() {
    const valorSeleccionado = selectEjercicio.value; 
    
    // Si el valor seleccionado coincide con alguna ruta en nuestro objeto, la cambiamos
    if (rutasImagenes[valorSeleccionado]) {
        imagenEjercicio.src = rutasImagenes[valorSeleccionado];
    } else {
        imagenEjercicio.src = rutasImagenes["default"];
    }
});

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
    
    // Regresar a la imagen por defecto al limpiar
    selectEjercicio.selectedIndex = 0;
    if(imagenEjercicio) imagenEjercicio.src = rutasImagenes["default"];
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
