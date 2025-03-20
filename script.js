// DOM Elements
const arrayContainer = document.getElementById('array-container');
const randomizeBtn = document.getElementById('randomize-btn');
const sortBtn = document.getElementById('sort-btn');
const algorithmSelect = document.getElementById('algorithm-select');
const speedSelect = document.getElementById('speed-select');
const sizeSelect = document.getElementById('size-select');
const barColorSelect = document.getElementById('bar-color');
const arrayTypeSelect = document.getElementById('array-type-select');
const customArrayInput = document.getElementById('custom-array-input');
const customArrayText = document.getElementById('custom-array-text');

// State
let array = [];
let isSorting = false;
let currentBarColor = 'blue';
let maxValue = 0;
const CONTAINER_HEIGHT = 300;

// Performance tracking
let algorithmOperations = {
    'Selection Sort': null,
    'Bubble Sort': null,
    'Insertion Sort': null
};

// Helper function to get bar color
function getBarColor(color) {
    switch (color.toLowerCase()) {
        case 'red': return '#E53935';
        case 'green': return '#43A047';
        case 'blue': return '#1E88E5';
        default: return '#1E88E5';
    }
}

// Helper color functions
function getComparedColor() {
    return '#FFC107'; // Amber for compared elements
}

function getSelectedColor() {
    return '#9C27B0'; // Purple for selected elements
}

function getSortedColor() {
    return '#4CAF50'; // Green for sorted elements
}

// Delay function with speed control
function delay(speedSelect) {
    const speedMap = {
        'Very Slow': 800,
        'Slow': 500,
        'Medium': 150,
        'Fast': 75
    };
    return new Promise(resolve => setTimeout(resolve, speedMap[speedSelect.value]));
}

// Helper function to create bars
function createBars(inputArray) {
    arrayContainer.innerHTML = '';
    
    // Find max value for scaling
    maxValue = Math.max(...inputArray);

    inputArray.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('array-bar');
        
        // Calculate proportional height based on max value
        const scaledHeight = (value / maxValue) * CONTAINER_HEIGHT;
        
        bar.style.height = `${scaledHeight}px`;
        bar.textContent = value;
        
        // Set initial bar color
        bar.style.backgroundColor = getBarColor(currentBarColor);
        
        arrayContainer.appendChild(bar);
    });
}

// Generate Array (for both random and custom)
function generateArray(type = 'Random') {
    array = [];

    if (type === 'Random') {
        const size = Number(sizeSelect.value);
        for (let i = 0; i < size; i++) {
            const value = Math.floor(Math.random() * 91) + 10;
            array.push(value);
        }
    } else {
        // Custom Array
        const input = customArrayText.value.trim();
        array = input.split(',')
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== '')
            .map(num => parseInt(num))
            .filter(num => num >= 10 && num <= 100);
    }

    // Validate array
    if (array.length === 0) {
        alert('Please enter valid numbers between 10 and 100');
        return false;
    }

    // Create bars with correct sizing
    createBars(array);

    // Reset algorithm operations when a new array is generated
    resetAlgorithmOperations();

    return true;
}

// Reset algorithm operations
function resetAlgorithmOperations() {
    algorithmOperations = {
        'Selection Sort': null,
        'Bubble Sort': null,
        'Insertion Sort': null
    };
    
    // Hide performance info if it exists
    const existingInfo = document.getElementById('performance-info');
    if (existingInfo) {
        existingInfo.remove();
    }
}

// Update bar heights during sorting
function updateBarHeight(index, value) {
    const bars = document.getElementsByClassName('array-bar');
    const scaledHeight = (value / maxValue) * CONTAINER_HEIGHT;
    
    bars[index].style.height = `${scaledHeight}px`;
    bars[index].textContent = value;
}

// Display algorithm performance information
function displayPerformanceInfo(algorithm, operations) {
    // Update algorithm operations
    algorithmOperations[algorithm] = operations;
    
    // Remove existing performance info if it exists
    const existingInfo = document.getElementById('performance-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // Create new performance info element
    const infoDiv = document.createElement('div');
    infoDiv.id = 'performance-info';
    infoDiv.classList.add('performance-info');
    
    // Add algorithm operations
    const timeInfo = document.createElement('p');
    timeInfo.textContent = `${algorithm} completed with ${operations} operations`;
    infoDiv.appendChild(timeInfo);
    
    // Check if we should display best algorithm
    const validOps = Object.entries(algorithmOperations).filter(([_, ops]) => ops !== null);
    
    if (validOps.length > 1) {
        // Find best algorithm (minimum operations)
        const bestAlgorithm = validOps.reduce((min, current) => 
            current[1] < min[1] ? current : min
        );
        
        const bestInfo = document.createElement('p');
        bestInfo.classList.add('best-algorithm');
        bestInfo.textContent = `Most efficient algorithm: ${bestAlgorithm[0]} (${bestAlgorithm[1]} operations)`;
        infoDiv.appendChild(bestInfo);
    }
    
    // Add to container
    document.querySelector('.container').appendChild(infoDiv);
}

// Sorting Algorithms
async function selectionSort() {
    const bars = document.getElementsByClassName('array-bar');
    let operations = 0; // Counter for operations
    
    for (let i = 0; i < array.length - 1; i++) {
        let minIndex = i;
        
        // Highlight the current selected element
        bars[i].style.backgroundColor = getSelectedColor();
        
        for (let j = i + 1; j < array.length; j++) {
            operations++; // Count comparison
            
            // Highlight the element being compared
            bars[j].style.backgroundColor = getComparedColor();
            
            // Delay to visualize comparison
            await delay(speedSelect);
            
            if (array[j] < array[minIndex]) {
                // Reset previous minimum index bar
                if (minIndex !== i) {
                    bars[minIndex].style.backgroundColor = getBarColor(currentBarColor);
                }
                minIndex = j;
                
                // Highlight new minimum
                bars[minIndex].style.backgroundColor = getSelectedColor();
            }
            
            // Reset comparison bar
            bars[j].style.backgroundColor = getBarColor(currentBarColor);
        }
        
        // Swap if needed
        if (minIndex !== i) {
            operations++; // Count swap
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            
            // Update bar heights and text
            updateBarHeight(i, array[i]);
            updateBarHeight(minIndex, array[minIndex]);
        }
        
        // Mark as sorted
        bars[i].style.backgroundColor = getSortedColor();
    }
    
    // Mark the last element as sorted
    bars[array.length - 1].style.backgroundColor = getSortedColor();
    
    displayPerformanceInfo('Selection Sort', operations);
}

async function bubbleSort() {
    const bars = document.getElementsByClassName('array-bar');
    let operations = 0; // Counter for operations
    
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            operations++; // Count comparison
            
            // Highlight elements being compared
            bars[j].style.backgroundColor = getSelectedColor();
            bars[j + 1].style.backgroundColor = getComparedColor();
            
            // Delay to visualize comparison
            await delay(speedSelect);
            
            if (array[j] > array[j + 1]) {
                operations++; // Count swap
                // Swap
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                
                // Update bar heights and text
                updateBarHeight(j, array[j]);
                updateBarHeight(j + 1, array[j + 1]);
            }
            
            // Reset bar colors
            bars[j].style.backgroundColor = getBarColor(currentBarColor);
            bars[j + 1].style.backgroundColor = getBarColor(currentBarColor);
        }
        
        // Mark the last unsorted element as sorted
        bars[array.length - i - 1].style.backgroundColor = getSortedColor();
    }
    
    // Mark the first element as sorted
    bars[0].style.backgroundColor = getSortedColor();
    
    displayPerformanceInfo('Bubble Sort', operations);
}

async function insertionSort() {
    const bars = document.getElementsByClassName('array-bar');
    let operations = 0; // Counter for operations
    
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        
        // Highlight the current element being inserted
        bars[i].style.backgroundColor = getSelectedColor();
        
        while (j >= 0) {
            operations++; // Count comparison
            
            // Highlight element being compared
            bars[j].style.backgroundColor = getComparedColor();
            
            // Delay to visualize comparison
            await delay(speedSelect);
            
            if (array[j] > key) {
                operations++; // Count move
                array[j + 1] = array[j];
                
                // Update bar heights and text
                updateBarHeight(j + 1, array[j + 1]);
                
                j--;
            } else {
                break;
            }
            
            // Reset comparison bar
            if (j >= 0) {
                bars[j].style.backgroundColor = getBarColor(currentBarColor);
            }
        }
        
        operations++; // Count insertion
        array[j + 1] = key;
        updateBarHeight(j + 1, key);
        
        // Reset inserted element color to sorted
        bars[j + 1].style.backgroundColor = getSortedColor();
    }
    
    displayPerformanceInfo('Insertion Sort', operations);
}

// Event Listeners
arrayTypeSelect.addEventListener('change', () => {
    customArrayInput.style.display = 
        arrayTypeSelect.value === 'Custom' ? 'flex' : 'none';
});

randomizeBtn.addEventListener('click', () => {
    if (!isSorting) {
        generateArray(arrayTypeSelect.value);
    }
});

sortBtn.addEventListener('click', async () => {
    if (isSorting) return;
    
    isSorting = true;
    sortBtn.disabled = true;
    randomizeBtn.disabled = true;
    
    const algorithm = algorithmSelect.value;
    const arrayType = arrayTypeSelect.value;
    
    try {
        // Generate array based on type
        const isValidArray = generateArray(arrayType);
        if (!isValidArray) {
            isSorting = false;
            sortBtn.disabled = false;
            randomizeBtn.disabled = false;
            return;
        }
        
        switch (algorithm) {
            case 'Selection Sort':
                await selectionSort();
                break;
            case 'Bubble Sort':
                await bubbleSort();
                break;
            case 'Insertion Sort':
                await insertionSort();
                break;
        }
    } catch (error) {
        console.error('Sorting error:', error);
    } finally {
        isSorting = false;
        sortBtn.disabled = false;
        randomizeBtn.disabled = false;
        
        // Reset all bar colors after sorting
        const bars = document.getElementsByClassName('array-bar');
        for (let bar of bars) {
            bar.style.backgroundColor = getBarColor(currentBarColor);
        }
    }
});

// Color Selection
barColorSelect.addEventListener('change', () => {
    const bars = document.getElementsByClassName('array-bar');
    currentBarColor = barColorSelect.value;
    
    for (let bar of bars) {
        bar.style.backgroundColor = getBarColor(currentBarColor);
    }
});

// Initial Setup
generateArray();