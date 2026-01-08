const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const calculateBtn = document.getElementById('calculate-btn');
const bmiValueDisplay = document.getElementById('bmi-value');
const bmiCategoryDisplay = document.getElementById('bmi-category');
const arrowIndicator = document.querySelector('.arrow-indicator');
const bmiPointer = document.getElementById('bmi-pointer');
const tickLabels = document.querySelectorAll('.tick-label');
const bmiIndicator = document.querySelector('.bmi-indicator');
const guidanceCards = document.querySelectorAll('.guidance-card');
const guidanceSection = document.getElementById('guidance');
const MIN_ANGLE = -90;
const MAX_ANGLE = 150;
const ANGLE_SPAN = MAX_ANGLE - MIN_ANGLE;

function bmiToAngle(bmi) {
    if (bmi < 18.5) {
        return -90 + (bmi / 18.5) * 45;
    } else if (bmi < 24.9) {
        return -45 + ((bmi - 18.5) / (24.9 - 18.5)) * 70;
    } else if (bmi < 29.9) {
        return 25 + ((bmi - 24.9) / (29.9 - 24.9)) * 70;
    } else {
        return 95 + Math.min((bmi - 29.9) / 10 * 55, 55);
    }
}

function angleToPercent(angle){
    return ((angle - MIN_ANGLE) / ANGLE_SPAN) * 100;
}

function positionTickLabels(){
    tickLabels.forEach(label => {
        const bmiVal = parseFloat(label.dataset.bmi);
        if (!isNaN(bmiVal)){
            const angle = bmiToAngle(bmiVal);
            const pct = angleToPercent(angle);
            label.style.left = `${pct}%`;
        }
    });
}

document.addEventListener('DOMContentLoaded', function(){
    positionTickLabels();
    if (bmiPointer) bmiPointer.style.left = '0%';
});

calculateBtn.addEventListener('click', function(event) {
    bmiIndicator.style.display = 'block';
    event.preventDefault(); 
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value) / 100;
    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
        alert('Please enter valid positive numbers for weight and height.');
        return;
    }
    const bmi = weight / (height * height);
    const roundedBmi = bmi.toFixed(1);
    bmiValueDisplay.textContent = roundedBmi;
    let category = '';
    let angle = -90;
    if (bmi < 18.5) {
        category = 'Underweight';
        angle = -90 + (bmi / 18.5) * 45;
    } else if (bmi < 24.9) {
        category = 'Normal weight';
        angle = -45 + ((bmi - 18.5) / (24.9 - 18.5)) * 70;
    } else if (bmi < 29.9) {
        category = 'Overweight';
        angle = 25 + ((bmi - 24.9) / (29.9 - 24.9)) * 70;
    } else {
        category = 'Obesity';
        angle = 95 + Math.min((bmi - 29.9) / 10 * 55, 55);
    }
    bmiCategoryDisplay.textContent = category;
    arrowIndicator.style.transform = `rotate(${angle}deg)`;

    if (bmiPointer) {
        const percent = angleToPercent(angle);
        bmiPointer.style.left = `${percent}%`;
        const valEl = document.getElementById('bmi-pointer-value');
        if (valEl) valEl.textContent = roundedBmi;
    }

    // Highlight guidance card based on BMI
    if (guidanceCards && guidanceCards.length) {
        let guidanceKey = '';
        if (bmi < 18.5) guidanceKey = 'Underweight';
        else if (bmi < 25) guidanceKey = 'Healthy Weight';
        else if (bmi < 30) guidanceKey = 'Overweight';
        else guidanceKey = 'Obese';

        guidanceCards.forEach(c => c.classList.remove('active'));
        const match = document.querySelector(`.guidance-card[data-category="${guidanceKey}"]`);
        if (match) {
            match.classList.add('active');
            // bring into view gently
            match.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }
});