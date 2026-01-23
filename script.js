const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const calculateBtn = document.getElementById('calculate-btn');
const bmiValueDisplay = document.getElementById('bmi-value');
const bmiCategoryDisplay = document.getElementById('bmi-category');
const bmiResultContainer = document.getElementById('bmi-result-container');
const arrowIndicator = document.querySelector('.arrow-indicator');
const bmiPointer = document.getElementById('bmi-pointer');
const tickLabels = document.querySelectorAll('.tick-label');
const bmiIndicator = document.querySelector('.bmi-indicator');
const guidanceCards = document.querySelectorAll('.guidance-card');
const guidanceSection = document.getElementById('guidance');
const bmiMessageDisplay = document.getElementById('bmi-message');
const MIN_ANGLE = -90;
const MAX_ANGLE = 150;
const ANGLE_SPAN = MAX_ANGLE - MIN_ANGLE;


const categoryColors = {
    'Underweight': 'var(--bmi-underweight)',
    'Normal weight': 'var(--bmi-normal)',
    'Overweight': 'var(--bmi-overweight)',
    'Obesity': 'var(--bmi-obesity)'
};

const bmiMessages = [
  { range: "Under 18.5", status: "Underweight", message: "Consider a nutrition plan to reach a healthy weight." },
  { range: "18.5 – 24.9", status: "Healthy Weight", message: "Great job! Your BMI is within the ideal range." },
  { range: "25.0 – 29.9", status: "Overweight", message: "Slightly above range; focus on balanced diet and exercise." },
  { range: "30.0 or higher", status: "Obese", message: "Consult a healthcare provider for weight management advice." }
];



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
    const color = categoryColors[category];
    bmiCategoryDisplay.style.color = color;
    bmiCategoryDisplay.textContent = category;
    arrowIndicator.style.transform = `rotate(${angle}deg)`;


    if (bmiPointer) {
        const percent = angleToPercent(angle);
        bmiPointer.style.left = `${percent}%`;
        const valEl = document.getElementById('bmi-pointer-value');
        if (valEl) valEl.textContent = roundedBmi;
    }

  
    bmiCategoryDisplay.scrollIntoView({ behavior: 'smooth', block: 'end' });
 bmiMessageDisplay.textContent = bmiMessages.find(msg => msg.status === category).message;

});