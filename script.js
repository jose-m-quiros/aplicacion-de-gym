const API_URL =
  "https://script.google.com/macros/s/AKfycbyeHZ3OWA535iKpmP7zPVh5ilXQ_1WOk_1Wepf1O0pGJMTbdY3Td4MZtm0F8uT-Y67wkA/exec";

window.addEventListener("DOMContentLoaded", function () {
  const savedUnit = localStorage.getItem("preferredUnit") || "lbs";
  document.querySelectorAll(".unit-selector").forEach((select) => {
    select.value = savedUnit;
    select.addEventListener("change", function () {
      localStorage.setItem("preferredUnit", this.value);
    });
  });
});

function showDay(dayNumber) {
  document
    .querySelectorAll(".day-section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
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
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")} ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function convertWeight(weight, fromUnit, toUnit) {
  if (fromUnit === toUnit) return weight;
  return fromUnit === "lbs"
    ? (weight * 0.453592).toFixed(2)
    : (weight * 2.20462).toFixed(2);
}

function addSeries(fieldPrefix) {
  const card = document.querySelector(`[data-exercise="${fieldPrefix}"]`);
  if (!card) return;

  const tbody = card.querySelector(".exercise-table tbody");
  const newSerieNumber = tbody.querySelectorAll("tr").length + 1;

  const newRow = document.createElement("tr");
  newRow.innerHTML = `
        <td class="table-label">Serie ${newSerieNumber}</td>
        <td><input type="number" id="${fieldPrefix}_s${newSerieNumber}" placeholder="Peso" step="0.5"></td>
        <td><input type="number" id="${fieldPrefix}_reps${newSerieNumber}" placeholder="Reps" min="0"></td>
        <td><input type="text" id="${fieldPrefix}_partial${newSerieNumber}" placeholder="3-3-3"></td>
        <td><input type="text" id="${fieldPrefix}_rest${newSerieNumber}" placeholder="60 seg"></td>
        <td><button class="btn-remove" onclick="removeSeries(this)">🗑️</button></td>
    `;

  tbody.appendChild(newRow);
  showMessage(`✅ Serie ${newSerieNumber} agregada`, "success");
}

function removeSeries(button) {
  const tbody = button.closest("tbody");
  if (tbody.querySelectorAll("tr").length <= 1) {
    showMessage("⚠️ Debe haber al menos una serie", "error");
    return;
  }
  button.closest("tr").remove();
  showMessage("🗑️ Serie eliminada", "success");
}

async function saveExercise(day, exerciseName, fieldPrefix) {
  const card = document.querySelector(`[data-exercise="${fieldPrefix}"]`);
  if (!card) {
    showMessage("❌ Error al encontrar ejercicio", "error");
    return;
  }

  const unitSelector = card.querySelector(".unit-selector");
  const selectedUnit = unitSelector ? unitSelector.value : "lbs";
  const tbody = card.querySelector(".exercise-table tbody");
  const rows = tbody.querySelectorAll("tr");

  const seriesData = [];

  rows.forEach((row, index) => {
    const serieNum = index + 1;
    const weightInput = document.getElementById(`${fieldPrefix}_s${serieNum}`);
    const repsInput = document.getElementById(`${fieldPrefix}_reps${serieNum}`);
    const partialInput = document.getElementById(
      `${fieldPrefix}_partial${serieNum}`
    );
    const restInput = document.getElementById(`${fieldPrefix}_rest${serieNum}`);
    const weight = weightInput?.value;

    if (weight) {
      const weightValue = parseFloat(weight);
      let weightLbs, weightKg;

      // Si el usuario ingresó en libras
      if (selectedUnit === "lbs") {
        weightLbs = weightValue;
        weightKg = parseFloat(convertWeight(weightValue, "lbs", "kg"));
      }
      // Si el usuario ingresó en kilogramos
      else {
        weightKg = weightValue;
        weightLbs = parseFloat(convertWeight(weightValue, "kg", "lbs"));
      }

      seriesData.push({
        serie: serieNum,
        unidad_usada: selectedUnit,
        peso_lbs: weightLbs,
        peso_kg: weightKg,
        reps: repsInput?.value || "N/A",
        parciales: partialInput?.value || "N/A",
        descanso: restInput?.value || "N/A",
      });
    }
  });

  if (seriesData.length === 0) {
    showMessage("⚠️ Ingresa al menos un peso", "error");
    return;
  }

  const dataToSend = {
    fecha: getCurrentDate(),
    dia: day,
    ejercicio: exerciseName,
    unidad_usada: selectedUnit,
    series: seriesData,
  };

  showMessage("⏳ Guardando...", "loading");

  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify(dataToSend));

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "success") {
      showMessage(
        `✅ ${exerciseName} guardado (${seriesData.length} series)`,
        "success"
      );

      // Limpiar los campos
      card
        .querySelectorAll('input[type="number"], input[type="text"]')
        .forEach((input) => {
          if (!input.classList.contains("unit-selector")) {
            input.value = "";
          }
        });
    } else {
      showMessage("❌ Error: " + result.error, "error");
    }
  } catch (error) {
    showMessage("❌ Error al guardar: " + error.message, "error");
    console.error("Error completo:", error);
  }
}
