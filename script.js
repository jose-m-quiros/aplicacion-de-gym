const API_URL = "https://script.google.com/macros/s/AKfycbyeHZ3OWA535iKpmP7zPVh5ilXQ_1WOk_1Wepf1O0pGJMTbdY3Td4MZtm0F8uT-Y67wkA/exec";

// ==================================================
// CONFIGURACIÓN DE LA RUTINA (EDITA ESTO CADA MES)
// ==================================================
const RUTINA_MENSUAL = [
    {
        id: 1,
        nombre: "Pierna",
        icono: "🦵",
        ejercicios: [
            { id: "ext_rodilla", nombre: "Ext. Rodilla", detalles: "1 x 20 / 3 x 12 (Pesado)" },
            { id: "belt_squat", nombre: "Belt Squat", detalles: "4 x 12 (Tempo 2.2.2)" },
            { id: "sentadilla_smith", nombre: "Sentadilla Smith", detalles: "4 x 8 (Pesado)" },
            { id: "rdl_barra", nombre: "RDL Barra", detalles: "3 x 12" },
            { id: "abduccion", nombre: "Abducción Máquina", detalles: "3 x 12" }
        ]
    },
    {
        id: 2,
        nombre: "Pecho / Bíceps",
        icono: "💪",
        ejercicios: [
            { id: "press_inclinado", nombre: "Press Inclinado Smith", detalles: "1 x 20 / 3 x 12" },
            { id: "press_plano", nombre: "Press Plano Mancuernas", detalles: "3 x 8-10-12 (drop set)" },
            { id: "push_ups", nombre: "Push Ups + Peso", detalles: "3 x Fallo" },
            { id: "curl_barra_z", nombre: "Curl Bíceps Barra Z", detalles: "3 x 12" }
        ]
    },
    {
        id: 3,
        nombre: "Espalda / Tríceps",
        icono: "🔥",
        ejercicios: [
            { id: "pull_ups", nombre: "Pull Ups + Peso", detalles: "4 x 4" },
            { id: "remo_maquina", nombre: "Remo Máquina", detalles: "3 x 12 (Tempo 1.2.2)" }
        ]
    },
    {
        id: 4,
        nombre: "Hombro",
        icono: "🏋️",
        ejercicios: [
            { id: "press_militar", nombre: "Press Militar Smith", detalles: "3 x 12" },
            { id: "elevacion_lateral", nombre: "Elevación Lateral", detalles: "1 x 20-20 / 3 x 12-12" }
        ]
    }
];



window.addEventListener("DOMContentLoaded", function () {
    renderUI();
    const savedUnit = localStorage.getItem("preferredUnit") || "lbs";
    document.querySelectorAll(".unit-selector").forEach((select) => {
        select.value = savedUnit;
        select.addEventListener("change", function () {
            localStorage.setItem("preferredUnit", this.value);
        });
    });
});

function renderUI() {
    const tabsContainer = document.getElementById('tabs-container');
    const contentContainer = document.getElementById('exercises-container');
    
    RUTINA_MENSUAL.forEach((dia, index) => {
        // Generar Tab
        const tab = document.createElement('div');
        tab.className = `tab ${index === 0 ? 'active' : ''}`;
        tab.onclick = () => showDay(dia.id);
        tab.innerText = `Día ${dia.id} - ${dia.nombre}`;
        tabsContainer.appendChild(tab);

        // Generar Sección del Día
        const section = document.createElement('div');
        section.id = `day${dia.id}`;
        section.className = `day-section ${index === 0 ? 'active' : ''}`;
        
        let htmlEjercicios = `<h2>${dia.icono} Día ${dia.id} - ${dia.nombre}</h2>`;
        
        dia.ejercicios.forEach(ex => {
            htmlEjercicios += `
                <div class="exercise-card" data-exercise="${ex.id}">
                    <div class="exercise-name">${ex.nombre}</div>
                    <div class="exercise-details">${ex.detalles}</div>
                    <div class="unit-selector-container">
                        <label>Unidad:</label>
                        <select id="${ex.id}_unit" class="unit-selector">
                            <option value="lbs">Libras (lbs)</option>
                            <option value="kg">Kilogramos (kg)</option>
                        </select>
                    </div>
                    <table class="exercise-table">
                        <thead>
                            <tr>
                                <th>Serie</th><th>Peso</th><th>Reps</th><th>Parciales</th><th>Descanso</th><th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="table-label">Serie 1</td>
                                <td><input type="number" id="${ex.id}_s1" placeholder="Peso" step="0.5"></td>
                                <td><input type="number" id="${ex.id}_reps1" placeholder="Reps"></td>
                                <td><input type="text" id="${ex.id}_partial1" placeholder="Parc."></td>
                                <td><input type="text" id="${ex.id}_rest1" placeholder="Desc."></td>
                                <td><button class="btn-remove" onclick="removeSeries(this)">🗑️</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="btn-add-series" onclick="addSeries('${ex.id}')">➕ Agregar Serie</button>
                    <button class="btn" onclick="saveExercise('Día ${dia.id} - ${dia.nombre}', '${ex.nombre}', '${ex.id}')">Guardar</button>
                </div>`;
        });
        
        section.innerHTML = htmlEjercicios;
        contentContainer.appendChild(section);
    });
}

// Las funciones showDay, addSeries, removeSeries y saveExercise se mantienen igual a tu código original
function showDay(dayNumber) {
    document.querySelectorAll(".day-section").forEach((s) => s.classList.remove("active"));
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.getElementById("day" + dayNumber).classList.add("active");
    document.querySelectorAll(".tab")[dayNumber - 1].classList.add("active");
}

function showMessage(text, type = "success") {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.className = "message " + type + " show";
    setTimeout(() => msg.classList.remove("show"), 3000);
}

function getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function convertWeight(weight, fromUnit, toUnit) {
    if (fromUnit === toUnit) return weight;
    return fromUnit === "lbs" ? (weight * 0.453592).toFixed(2) : (weight * 2.20462).toFixed(2);
}

function addSeries(fieldPrefix) {
    const card = document.querySelector(`[data-exercise="${fieldPrefix}"]`);
    const tbody = card.querySelector(".exercise-table tbody");
    const newSerieNumber = tbody.querySelectorAll("tr").length + 1;
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td class="table-label">Serie ${newSerieNumber}</td>
        <td><input type="number" id="${fieldPrefix}_s${newSerieNumber}" placeholder="Peso" step="0.5"></td>
        <td><input type="number" id="${fieldPrefix}_reps${newSerieNumber}" placeholder="Reps" min="0"></td>
        <td><input type="text" id="${fieldPrefix}_partial${newSerieNumber}" placeholder="Parc."></td>
        <td><input type="text" id="${fieldPrefix}_rest${newSerieNumber}" placeholder="Desc."></td>
        <td><button class="btn-remove" onclick="removeSeries(this)">🗑️</button></td>`;
    tbody.appendChild(newRow);
}

function removeSeries(button) {
    const tbody = button.closest("tbody");
    if (tbody.querySelectorAll("tr").length <= 1) return;
    button.closest("tr").remove();
}

async function saveExercise(day, exerciseName, fieldPrefix) {
    const card = document.querySelector(`[data-exercise="${fieldPrefix}"]`);
    const unitSelector = card.querySelector(".unit-selector");
    const selectedUnit = unitSelector.value;
    const rows = card.querySelectorAll(".exercise-table tbody tr");
    const seriesData = [];

    rows.forEach((row, index) => {
        const serieNum = index + 1;
        const weight = document.getElementById(`${fieldPrefix}_s${serieNum}`)?.value;
        if (weight) {
            const weightValue = parseFloat(weight);
            let weightLbs = selectedUnit === "lbs" ? weightValue : parseFloat(convertWeight(weightValue, "kg", "lbs"));
            let weightKg = selectedUnit === "kg" ? weightValue : parseFloat(convertWeight(weightValue, "lbs", "kg"));
            
            seriesData.push({
                serie: serieNum,
                unidad_usada: selectedUnit,
                peso_lbs: weightLbs,
                peso_kg: weightKg,
                reps: document.getElementById(`${fieldPrefix}_reps${serieNum}`)?.value || "N/A",
                parciales: document.getElementById(`${fieldPrefix}_partial${serieNum}`)?.value || "N/A",
                descanso: document.getElementById(`${fieldPrefix}_rest${serieNum}`)?.value || "N/A"
            });
        }
    });

    if (seriesData.length === 0) { showMessage("⚠️ Ingresa peso", "error"); return; }

    const dataToSend = { fecha: getCurrentDate(), dia: day, ejercicio: exerciseName, unidad_usada: selectedUnit, series: seriesData };

    try {
        const formData = new FormData();
        formData.append("data", JSON.stringify(dataToSend));
        const response = await fetch(API_URL, { method: "POST", body: formData });
        const result = await response.json();
        if (result.status === "success") {
            showMessage(`✅ Guardado`, "success");
            card.querySelectorAll('input').forEach(i => i.value = "");
        }
    } catch (e) { showMessage("❌ Error", "error"); }
}