const bmiForm = document.getElementById('bmi-form');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const weightLbInput = document.getElementById('weight-lb');
const heightFtInput = document.getElementById('height-ft');
const heightInInput = document.getElementById('height-in');
const unitSystemInputs = document.querySelectorAll('input[name="unit-system"]');
const metricInputs = document.getElementById('metric-inputs');
const imperialInputs = document.getElementById('imperial-inputs');
const formError = document.getElementById('form-error');
const resetBtn = document.getElementById('reset-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const historyList = document.getElementById('history-list');

const bmiValueDisplay = document.getElementById('bmi-value');
const bmiCategoryDisplay = document.getElementById('bmi-category');
const bmiMessageDisplay = document.getElementById('bmi-message');
const bmiTargetDisplay = document.getElementById('bmi-target');
const bmiPrimeDisplay = document.getElementById('bmi-prime');
const healthyRangeDisplay = document.getElementById('healthy-range');
const calculatedAtDisplay = document.getElementById('calculated-at');

const arrowIndicator = document.querySelector('.arrow-indicator');
const bmiPointer = document.getElementById('bmi-pointer');
const bmiPointerValue = document.getElementById('bmi-pointer-value');
const tickLabels = document.querySelectorAll('.tick-label');
const bmiIndicator = document.querySelector('.bmi-indicator');
const guidanceCards = document.querySelectorAll('.guidance-card');

const MIN_ANGLE = -90;
const MAX_ANGLE = 150;
const ANGLE_SPAN = MAX_ANGLE - MIN_ANGLE;
const LB_PER_KG = 2.2046226218;
const HISTORY_STORAGE_KEY = 'bmi-calculator-history';
const MAX_HISTORY_ITEMS = 8;

const categoryConfig = [
    {
        limit: 18.5,
        name: 'Underweight',
        guidanceCategory: 'Underweight',
        color: 'var(--bmi-underweight)',
        message: 'You are below the healthy BMI range. Focus on nutrient-dense meals and gradual strength training.'
    },
    {
        limit: 25,
        name: 'Healthy Weight',
        guidanceCategory: 'Healthy Weight',
        color: 'var(--bmi-normal)',
        message: 'Great result—your BMI is in the healthy range. Maintain your routine with balanced nutrition and activity.'
    },
    {
        limit: 30,
        name: 'Overweight',
        guidanceCategory: 'Overweight',
        color: 'var(--bmi-overweight)',
        message: 'You are above the healthy range. Small sustainable changes in diet and activity can make a big impact.'
    },
    {
        limit: Infinity,
        name: 'Obese',
        guidanceCategory: 'Obese',
        color: 'var(--bmi-obese-iii)',
        message: 'Your BMI is in the obesity range. Consider professional guidance and a structured gradual health plan.'
    }
];

function bmiToAngle(bmi) {
    if (bmi <= 0) {
        return MIN_ANGLE;
    }
    if (bmi < 18.5) {
        return -90 + (bmi / 18.5) * 45;
    }
    if (bmi < 24.9) {
        return -45 + ((bmi - 18.5) / (24.9 - 18.5)) * 70;
    }
    if (bmi < 29.9) {
        return 25 + ((bmi - 24.9) / (29.9 - 24.9)) * 70;
    }
    return Math.min(95 + ((bmi - 29.9) / 10) * 55, MAX_ANGLE);
}

function angleToPercent(angle) {
    return ((angle - MIN_ANGLE) / ANGLE_SPAN) * 100;
}

function positionTickLabels() {
    tickLabels.forEach((label) => {
        const bmiVal = parseFloat(label.dataset.bmi);
        if (Number.isFinite(bmiVal)) {
            const angle = bmiToAngle(bmiVal);
            label.style.left = `${angleToPercent(angle)}%`;
        }
    });
}

function getSelectedUnit() {
    const active = document.querySelector('input[name="unit-system"]:checked');
    return active ? active.value : 'metric';
}

function setFormError(message) {
    formError.textContent = message || '';
}

function setUnitVisibility(unit) {
    const isMetric = unit === 'metric';

    metricInputs.classList.toggle('hidden', !isMetric);
    imperialInputs.classList.toggle('hidden', isMetric);

    weightInput.required = isMetric;
    heightInput.required = isMetric;
    weightLbInput.required = !isMetric;
    heightFtInput.required = !isMetric;
    heightInInput.required = !isMetric;

    setFormError('');
}

function getCategoryDetails(bmi) {
    return categoryConfig.find((category) => bmi < category.limit) || categoryConfig[categoryConfig.length - 1];
}

function formatHealthyWeightRange(heightM, unit) {
    const minKg = 18.5 * heightM * heightM;
    const maxKg = 24.9 * heightM * heightM;

    if (unit === 'metric') {
        return `${minKg.toFixed(1)} – ${maxKg.toFixed(1)} kg`;
    }
    return `${(minKg * LB_PER_KG).toFixed(1)} – ${(maxKg * LB_PER_KG).toFixed(1)} lb`;
}

function formatTargetGuidance(bmi, heightM, unit) {
    if (bmi >= 18.5 && bmi <= 24.9) {
        return 'Target guidance: You are already in the healthy BMI range.';
    }

    const targetBmi = bmi < 18.5 ? 18.5 : 24.9;
    const targetKg = targetBmi * heightM * heightM;
    const targetWeight = unit === 'metric'
        ? `${targetKg.toFixed(1)} kg`
        : `${(targetKg * LB_PER_KG).toFixed(1)} lb`;

    if (bmi < 18.5) {
        return `Target guidance: Aim to reach at least ${targetWeight}.`;
    }

    return `Target guidance: Aim to reduce toward ${targetWeight} or below.`;
}

function highlightGuidanceCard(guidanceCategory) {
    guidanceCards.forEach((card) => {
        card.classList.toggle('active', card.dataset.category === guidanceCategory);
    });
}

function loadHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (!saved) {
            return [];
        }
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function saveHistory(history) {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function renderHistory(history = loadHistory()) {
    historyList.innerHTML = '';

    if (!history.length) {
        const emptyRow = document.createElement('li');
        emptyRow.className = 'history-empty';
        emptyRow.textContent = 'No calculations yet.';
        historyList.appendChild(emptyRow);
        return;
    }

    history.forEach((item) => {
        const row = document.createElement('li');
        row.className = 'history-item';

        const title = document.createElement('p');
        title.className = 'history-title';
        title.textContent = `BMI ${item.bmi} • ${item.category}`;

        const meta = document.createElement('p');
        meta.className = 'history-meta';
        meta.textContent = `${item.measurements} • ${item.calculatedAt}`;

        row.appendChild(title);
        row.appendChild(meta);
        historyList.appendChild(row);
    });
}

function addHistoryEntry(entry) {
    const history = loadHistory();
    const updated = [entry, ...history].slice(0, MAX_HISTORY_ITEMS);
    saveHistory(updated);
    renderHistory(updated);
}

function resetResult() {
    bmiValueDisplay.textContent = '--';
    bmiCategoryDisplay.textContent = 'Category: --';
    bmiCategoryDisplay.style.color = '';
    bmiMessageDisplay.textContent = 'Enter your details to see personalized feedback.';
    bmiTargetDisplay.textContent = 'Target guidance: --';
    bmiPrimeDisplay.textContent = '--';
    healthyRangeDisplay.textContent = '--';
    calculatedAtDisplay.textContent = '--';

    if (arrowIndicator) {
        arrowIndicator.style.transform = `rotate(${MIN_ANGLE}deg)`;
    }
    if (bmiPointer) {
        bmiPointer.style.left = '0%';
    }
    if (bmiPointerValue) {
        bmiPointerValue.textContent = '--';
    }

    if (bmiIndicator) {
        bmiIndicator.style.display = 'none';
    }
    guidanceCards.forEach((card) => card.classList.remove('active'));
    setFormError('');
}

function extractMeasurementData() {
    const unit = getSelectedUnit();

    if (unit === 'metric') {
        const weightKg = parseFloat(weightInput.value);
        const heightCm = parseFloat(heightInput.value);

        if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) {
            return { error: 'Please enter valid positive numbers for weight and height.' };
        }

        const heightM = heightCm / 100;
        return {
            unit,
            weightKg,
            heightM,
            measurementLabel: `${weightKg.toFixed(1)} kg, ${heightCm.toFixed(1)} cm`
        };
    }

    const weightLb = parseFloat(weightLbInput.value);
    const heightFt = parseFloat(heightFtInput.value);
    const heightIn = parseFloat(heightInInput.value);

    if (!Number.isFinite(weightLb) || weightLb <= 0 || !Number.isFinite(heightFt) || heightFt < 0 || !Number.isFinite(heightIn) || heightIn < 0) {
        return { error: 'Please enter valid positive numbers for weight and height.' };
    }

    const totalInches = (heightFt * 12) + heightIn;
    if (totalInches <= 0) {
        return { error: 'Height must be greater than zero.' };
    }
    if (heightIn >= 12) {
        return { error: 'Inches should be less than 12. Example: 5 ft 8 in.' };
    }

    return {
        unit,
        weightKg: weightLb / LB_PER_KG,
        heightM: totalInches * 0.0254,
        measurementLabel: `${weightLb.toFixed(1)} lb, ${heightFt.toFixed(0)} ft ${heightIn.toFixed(0)} in`
    };
}

function handleCalculation(event) {
    event.preventDefault();
    setFormError('');

    const measurementData = extractMeasurementData();
    if (measurementData.error) {
        setFormError(measurementData.error);
        return;
    }

    const bmi = measurementData.weightKg / (measurementData.heightM * measurementData.heightM);
    const roundedBmi = bmi.toFixed(1);
    const category = getCategoryDetails(bmi);
    const angle = bmiToAngle(bmi);
    const nowText = new Date().toLocaleString();

    bmiValueDisplay.textContent = roundedBmi;
    bmiCategoryDisplay.textContent = `Category: ${category.name}`;
    bmiCategoryDisplay.style.color = category.color;
    bmiMessageDisplay.textContent = category.message;
    bmiTargetDisplay.textContent = formatTargetGuidance(bmi, measurementData.heightM, measurementData.unit);
    bmiPrimeDisplay.textContent = (bmi / 25).toFixed(2);
    healthyRangeDisplay.textContent = formatHealthyWeightRange(measurementData.heightM, measurementData.unit);
    calculatedAtDisplay.textContent = nowText;

    if (arrowIndicator) {
        arrowIndicator.style.transform = `rotate(${angle}deg)`;
    }
    if (bmiPointer) {
        bmiPointer.style.left = `${angleToPercent(angle)}%`;
    }
    if (bmiPointerValue) {
        bmiPointerValue.textContent = roundedBmi;
    }
    if (bmiIndicator) {
        bmiIndicator.style.display = 'block';
    }

    highlightGuidanceCard(category.guidanceCategory);

    addHistoryEntry({
        bmi: roundedBmi,
        category: category.name,
        measurements: measurementData.measurementLabel,
        calculatedAt: nowText
    });
}

function initializeCalculator() {
    if (!bmiForm) {
        return;
    }

    positionTickLabels();
    resetResult();
    setUnitVisibility(getSelectedUnit());
    renderHistory();

    bmiForm.addEventListener('submit', handleCalculation);
    unitSystemInputs.forEach((input) => {
        input.addEventListener('change', () => setUnitVisibility(getSelectedUnit()));
    });

    resetBtn.addEventListener('click', () => {
        bmiForm.reset();
        setUnitVisibility('metric');
        resetResult();
    });

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        renderHistory([]);
    });
}

document.addEventListener('DOMContentLoaded', initializeCalculator);
