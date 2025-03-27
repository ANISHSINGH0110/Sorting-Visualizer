// Main variables
let array = [];
let arrayBars = [];
let isSorting = false;
let isPaused = false;
let algorithmSteps = [];
let currentStepIndex = 0;
let animationSpeed = 50;
let selectedBarColor = '#3498db';
let comparisonCount = 0;
let swapCount = 0;
let arrayAccessCount = 0;
let timeoutId = null;

// Algorithm descriptions for the info section
const algorithmInfo = {
    'Selection Sort': {
        description: 'Selection sort divides the array into a sorted and an unsorted region. It repeatedly finds the minimum element from the unsorted region and moves it to the sorted region.',
        bestCase: 'O(n²) - Always makes n(n-1)/2 comparisons',
        averageCase: 'O(n²)',
        worstCase: 'O(n²)',
        space: 'O(1) - In-place sorting algorithm',
        whenToUse: 'Selection sort works well for small arrays. Its main advantage is that it minimizes the number of swaps compared to other algorithms.',
    },
    'Bubble Sort': {
        description: 'Bubble sort repeatedly steps through the array, compares adjacent elements, and swaps them if they are in the wrong order.',
        bestCase: 'O(n) - If the array is already sorted',
        averageCase: 'O(n²)',
        worstCase: 'O(n²)',
        space: 'O(1) - In-place sorting algorithm',
        whenToUse: 'Bubble sort is simple but inefficient for large arrays. It performs well when the array is nearly sorted.',
    },
    'Insertion Sort': {
        description: 'Insertion sort builds the final sorted array one item at a time. It takes each element from the unsorted part and inserts it into its correct position in the sorted part.',
        bestCase: 'O(n) - If the array is already sorted',
        averageCase: 'O(n²)',
        worstCase: 'O(n²)',
        space: 'O(1) - In-place sorting algorithm',
        whenToUse: 'Insertion sort is efficient for small arrays and is often used as part of more complex algorithms. It works well with arrays that are already partially sorted.',
    },
    'Merge Sort': {
        description: 'Merge sort is a divide and conquer algorithm that divides the array into halves, sorts them recursively, and then merges the sorted halves.',
        bestCase: 'O(n log n)',
        averageCase: 'O(n log n)',
        worstCase: 'O(n log n)',
        space: 'O(n) - Requires additional memory for the merged arrays',
        whenToUse: 'Merge sort is stable and reliable for large datasets. It guarantees O(n log n) time complexity regardless of input data, making it suitable for applications that need predictable performance.',
    },
    'Quick Sort': {
        description: 'Quick sort is a divide and conquer algorithm that selects a pivot element and partitions the array around the pivot.',
        bestCase: 'O(n log n)',
        averageCase: 'O(n log n)',
        worstCase: 'O(n²) - When the pivot selection consistently results in highly unbalanced partitions',
        space: 'O(log n) - Due to the recursive call stack',
        whenToUse: 'Quick sort is very efficient on average and is often the fastest sorting algorithm in practice for large data sets. However, its worst-case performance can be a concern.',
    },
    'Heap Sort': {
        description: 'Heap sort converts the array into a heap data structure, and then repeatedly extracts the maximum element from the heap.',
        bestCase: 'O(n log n)',
        averageCase: 'O(n log n)',
        worstCase: 'O(n log n)',
        space: 'O(1) - In-place sorting algorithm',
        whenToUse: 'Heap sort is useful when you need guaranteed O(n log n) time with O(1) space. It\'s not stable but works well when memory is a constraint.',
    }
};

// DOM selectors
const arrayContainer = document.getElementById('array-container');
const algorithmSelect = document.getElementById('algorithm-select');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const sizeSlider = document.getElementById('size-slider');
const sizeValue = document.getElementById('size-value');
const arrayTypeSelect = document.getElementById('array-type-select');
const randomizeBtn = document.getElementById('randomize-btn');
const sortBtn = document.getElementById('sort-btn');
const pauseBtn = document.getElementById('pause-btn');
const stepBtn = document.getElementById('step-btn');
const resumeBtn = document.getElementById('resume-btn');
const barColorSelect = document.getElementById('bar-color');
const comparisonCountElement = document.getElementById('comparison-count');
const swapCountElement = document.getElementById('swap-count');
const arrayAccessCountElement = document.getElementById('array-access-count');
const currentAlgorithmInfo = document.getElementById('current-algorithm-info');
const customArrayInput = document.getElementById('custom-array-input');
const customArrayText = document.getElementById('custom-array-text');

// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
    });
});

// Comparison tab setup
const compareArrayTypeSelect = document.getElementById('compare-array-type');
const compareSizeSlider = document.getElementById('compare-size-slider');
const compareSizeValue = document.getElementById('compare-size-value');
const compareSpeedSlider = document.getElementById('compare-speed-slider');
const compareSpeedValue = document.getElementById('compare-speed-value');
const compareNewArrayBtn = document.getElementById('compare-new-array-btn');
const compareStartBtn = document.getElementById('compare-start-btn');
const comparisonContainer = document.getElementById('comparison-container');
const algoCheckboxes = document.querySelectorAll('.algo-checkbox');

// Initialize the app
function init() {
    // Set up event listeners
    randomizeBtn.addEventListener('click', generateNewArray);
    sortBtn.addEventListener('click', startSorting);
    pauseBtn.addEventListener('click', pauseSorting);
    stepBtn.addEventListener('click', performSingleStep);
    resumeBtn.addEventListener('click', resumeSorting);
    
    sizeSlider.addEventListener('input', () => {
        sizeValue.textContent = sizeSlider.value;
        generateNewArray();
    });
    
    speedSlider.addEventListener('input', updateSpeed);
    
    arrayTypeSelect.addEventListener('change', () => {
        if (arrayTypeSelect.value === 'Custom') {
            customArrayInput.style.display = 'flex';
        } else {
            customArrayInput.style.display = 'none';
            generateNewArray();
        }
    });
    
    customArrayText.addEventListener('change', () => {
        if (arrayTypeSelect.value === 'Custom') {
            generateCustomArray();
        }
    });
    
    barColorSelect.addEventListener('change', updateBarColor);
    
    algorithmSelect.addEventListener('change', updateAlgorithmInfo);
    
    // Comparison tab event listeners
    compareNewArrayBtn.addEventListener('click', generateComparisonArrays);
    compareStartBtn.addEventListener('click', startComparison);
    
    compareSizeSlider.addEventListener('input', () => {
        compareSizeValue.textContent = compareSizeSlider.value;
        generateComparisonArrays();
    });
    
    compareSpeedSlider.addEventListener('input', () => {
        const value = compareSpeedSlider.value;
        let speedText;
        
        if (value < 25) speedText = 'Slow';
        else if (value < 50) speedText = 'Medium-Slow';
        else if (value < 75) speedText = 'Medium';
        else if (value < 90) speedText = 'Fast';
        else speedText = 'Very Fast';
        
        compareSpeedValue.textContent = speedText;
    });
    
    // Initial array generation
    generateNewArray();
    updateAlgorithmInfo();
    generateComparisonArrays();
}

// Update animation speed based on slider
function updateSpeed() {
    const value = speedSlider.value;
    animationSpeed = value;
    
    let speedText;
    if (value < 25) speedText = 'Slow';
    else if (value < 50) speedText = 'Medium-Slow';
    else if (value < 75) speedText = 'Medium';
    else if (value < 90) speedText = 'Fast';
    else speedText = 'Very Fast';
    
    speedValue.textContent = speedText;
}

function updateBarColor() {
    const colorMap = {
        'Blue': '#3498db',
        'Red': '#e74c3c',
        'Green': '#2ecc71',
        'Purple': '#9b59b6',
        'Orange': '#e67e22'
    };
    
    selectedBarColor = colorMap[barColorSelect.value];
    
    // Update existing bars that don't have special states
    arrayBars.forEach(bar => {
        if (!bar.classList.contains('comparing') && 
            !bar.classList.contains('selected') && 
            !bar.classList.contains('sorted') && 
            !bar.classList.contains('swapping')) {
            bar.style.backgroundColor = selectedBarColor;
        }
    });
    
    // Update CSS variable
    document.documentElement.style.setProperty('--bar-default', selectedBarColor);
}

// Update algorithm information in the info section
function updateAlgorithmInfo() {
    const algorithm = algorithmSelect.value;
    const info = algorithmInfo[algorithm];
    
    currentAlgorithmInfo.innerHTML = `
        <h3>${algorithm}</h3>
        <p><strong>Description:</strong> ${info.description}</p>
        <p><strong>Time Complexity:</strong></p>
        <ul>
            <li><strong>Best case:</strong> ${info.bestCase}</li>
            <li><strong>Average case:</strong> ${info.averageCase}</li>
            <li><strong>Worst case:</strong> ${info.worstCase}</li>
        </ul>
        <p><strong>Space Complexity:</strong> ${info.space}</p>
        <p><strong>When to use:</strong> ${info.whenToUse}</p>
    `;
}

// Generate a new array based on selected type
function generateNewArray() {
    resetCounters();
    array = [];
    
    const size = parseInt(sizeSlider.value);
    const type = arrayTypeSelect.value;
    
    switch (type) {
        case 'Random':
            for (let i = 0; i < size; i++) {
                array.push(randomIntFromInterval(5, 100));
            }
            break;
        case 'Nearly Sorted':
            for (let i = 0; i < size; i++) {
                array.push(i + 1 + Math.floor(Math.random() * 10) - 5);
            }
            break;
        case 'Reversed':
            for (let i = size; i > 0; i--) {
                array.push(i);
            }
            break;
        case 'Few Unique':
            const uniqueValues = [10, 30, 50, 70, 90];
            for (let i = 0; i < size; i++) {
                array.push(uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
            }
            break;
        case 'Custom':
            // Custom array is handled separately
            return;
    }
    
    updateArrayDisplay();
}

function generateCustomArray() {
    try {
        const inputText = customArrayText.value;
        const inputArray = inputText.split(',').map(item => {
            const num = parseInt(item.trim());
            if (isNaN(num)) throw new Error('Invalid input: not a number');
            
            // Add additional validation
            if (num < 5 || num > 100) {
                throw new Error('Numbers must be between 5 and 100');
            }
            
            return num;
        });
        
        if (inputArray.length < 2) {
            alert('Please enter at least 2 numbers separated by commas');
            return;
        }
        
        if (inputArray.length > 100) {
            alert('Maximum array size is 100 elements');
            return;
        }
        
        resetCounters();
        array = inputArray;
        updateArrayDisplay();
        
        // Update size slider to match custom array
        sizeSlider.value = inputArray.length;
        sizeValue.textContent = inputArray.length;
    } catch (error) {
        alert(error.message);
        customArrayText.value = ''; // Clear invalid input
    }
}
// function updateArrayDisplay() {
//     arrayContainer.innerHTML = '';
//     arrayBars = [];

//     const maxValue = Math.max(...array);
//     const minValue = Math.min(...array);
//     const range = maxValue - minValue;

//     for (let i = 0; i < array.length; i++) {
//         const bar = document.createElement('div');
//         bar.classList.add('array-bar');

//         // Handle case when all values are the same
//         let heightPercentage;
//         if (range === 0) {
//             // If all values are identical, set to middle height
//             heightPercentage = 50;
//         } else {
//             // Normalize height to be between 10% and 95% of container height
//             heightPercentage = 10 + 85 * ((array[i] - minValue) / range);
//         }

//         bar.style.height = `${heightPercentage}%`;
//         bar.style.backgroundColor = selectedBarColor;

//         if (array.length <= 50) {
//             const valueLabel = document.createElement('span');
//             valueLabel.classList.add('value');
//             valueLabel.textContent = array[i];
//             bar.appendChild(valueLabel);
//         }

//         arrayContainer.appendChild(bar);
//         arrayBars.push(bar);
//     }
// }
// function updateArrayDisplay() {
//     arrayContainer.innerHTML = '';
//     arrayBars = [];

//     const maxValue = Math.max(...array);
//     const minValue = Math.min(...array);
//     const range = maxValue - minValue;

//     for (let i = 0; i < array.length; i++) {
//         const bar = document.createElement('div');
//         bar.classList.add('array-bar');

//         // Handle case when all values are the same
//         let heightPercentage;
//         if (range === 0) {
//             heightPercentage = 50; // Middle height for equal values
//         } else {
//             // Normalize height and ensure it is between 10% and 95%
//             heightPercentage = Math.max(10, Math.min(95, 10 + 85 * ((array[i] - minValue) / range)));
//         }

//         bar.style.height = `${heightPercentage}%`;
//         bar.style.backgroundColor = selectedBarColor;

//         // Show values if array size <= 50
//         if (array.length <= 50) {
//             const valueLabel = document.createElement('span');
//             valueLabel.classList.add('value');
//             valueLabel.textContent = array[i];
//             bar.appendChild(valueLabel);
//         }

//         arrayContainer.appendChild(bar);
//         arrayBars.push(bar);
//     }
// }

// function updateArrayDisplay() {
//     arrayContainer.innerHTML = '';
//     arrayBars = [];

//     const maxValue = Math.max(...array);
//     const minValue = Math.min(...array);
//     const range = maxValue - minValue || 1; // Prevent division by zero

//     for (let i = 0; i < array.length; i++) {
//         const bar = document.createElement('div');
//         bar.classList.add('array-bar');

//         // Ensure bars scale proportionally
//         let heightPercentage = ((array[i] - minValue) / range) * 85 + 10;
//         bar.style.height = `${heightPercentage}%`;
//         bar.style.backgroundColor = selectedBarColor;

//         if (array.length <= 50) {
//             const valueLabel = document.createElement('span');
//             valueLabel.classList.add('value');
//             valueLabel.textContent = array[i];
//             bar.appendChild(valueLabel);
//         }

//         arrayContainer.appendChild(bar);
//         arrayBars.push(bar);
//     }
// }

function updateArrayDisplay() {
    arrayContainer.innerHTML = '';
    arrayBars = [];
    
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement('div');
        bar.classList.add('array-bar');
        
        const heightPercentage = calculateBarHeight(array[i], array);
        bar.style.height = `${heightPercentage}%`;
        bar.style.backgroundColor = selectedBarColor;
        
        if (array.length <= 50) {
            const valueLabel = document.createElement('span');
            valueLabel.classList.add('value');
            valueLabel.textContent = array[i];
            bar.appendChild(valueLabel);
        }
        
        arrayContainer.appendChild(bar);
        arrayBars.push(bar);
    }
}




// Reset counters for a new sort
function resetCounters() {
    comparisonCount = 0;
    swapCount = 0;
    arrayAccessCount = 0;
    updateCounters();
}

// Update counter displays
function updateCounters() {
    comparisonCountElement.textContent = comparisonCount;
    swapCountElement.textContent = swapCount;
    arrayAccessCountElement.textContent = arrayAccessCount;
}

// Helper function for random integer generation
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Start the sorting animation
function startSorting() {
    if (isSorting) return;
    
    isSorting = true;
    isPaused = false;
    algorithmSteps = [];
    currentStepIndex = 0;
    resetCounters();
    
    // Enable control buttons
    pauseBtn.disabled = false;
    stepBtn.disabled = false;
    resumeBtn.disabled = true;
    
    // Disable other controls during sorting
    randomizeBtn.disabled = true;
    sortBtn.disabled = true;
    sizeSlider.disabled = true;
    algorithmSelect.disabled = true;
    arrayTypeSelect.disabled = true;
    customArrayText.disabled = true;
    
    // Create a copy of the array for sorting
    const arrayCopy = [...array];
    
    // Generate steps for the selected algorithm
    const algorithm = algorithmSelect.value;
    switch (algorithm) {
        case 'Selection Sort':
            generateSelectionSortSteps(arrayCopy);
            break;
        case 'Bubble Sort':
            generateBubbleSortSteps(arrayCopy);
            break;
        case 'Insertion Sort':
            generateInsertionSortSteps(arrayCopy);
            break;
        case 'Merge Sort':
            generateMergeSortSteps(arrayCopy, 0, arrayCopy.length - 1);
            break;
        case 'Quick Sort':
            generateQuickSortSteps(arrayCopy, 0, arrayCopy.length - 1);
            break;
        case 'Heap Sort':
            generateHeapSortSteps(arrayCopy);
            break;
    }
    
    // Start animation
    animateSort();
}

// Animation function for executing steps
function animateSort() {
    if (!isSorting || isPaused) return;
    
    if (currentStepIndex < algorithmSteps.length) {
        const step = algorithmSteps[currentStepIndex];
        executeStep(step);
        currentStepIndex++;
        
        // Calculate delay based on speed slider
        // Transform the 1-100 scale to a more useful range for timeouts (1ms - 500ms)
        const delay = Math.max(1, Math.floor(500 - animationSpeed * 5));
        
        timeoutId = setTimeout(animateSort, delay);
    } else {
        // Sorting complete
        finishSorting();
    }
}
// function executeStep(step) {
//     const { type, indices, values } = step;
    
//     // Reset all non-sorted bars to default color
//     for (let i = 0; i < arrayBars.length; i++) {
//         if (!arrayBars[i].classList.contains('sorted')) {
//             arrayBars[i].classList.remove('comparing', 'selected', 'swapping');
//             arrayBars[i].style.backgroundColor = ''; // Remove inline style
//         }
//     }
    
//     // Update counters
//     if (type === 'compare') {
//         comparisonCount++;
//         arrayAccessCount += 2;
        
//         // Highlight bars being compared
//         indices.forEach(index => {
//             arrayBars[index].classList.add('comparing');
//             arrayBars[index].style.backgroundColor = ''; // Remove inline style
//         });
//     } 
//     else if (type === 'swap') {
//         swapCount++;
//         arrayAccessCount += 2;
        
//         // Update array and display for swap
//         indices.forEach((index, i) => {
//             array[index] = values[i];
//             arrayBars[index].style.height = `${getHeightPercentage(values[i])}%`;
//             arrayBars[index].classList.add('swapping');
//             arrayBars[index].style.backgroundColor = ''; // Remove inline style
            
//             // Update value label if present
//             const valueLabel = arrayBars[index].querySelector('.value');
//             if (valueLabel) {
//                 valueLabel.textContent = values[i];
//             }
//         });
//     } 
//     else if (type === 'select') {
//         arrayAccessCount += 1;
        
//         // Highlight selected bar
//         arrayBars[indices[0]].classList.add('selected');
//         arrayBars[indices[0]].style.backgroundColor = ''; // Remove inline style
//     } 
//     else if (type === 'mark-sorted') {
//         // Mark elements as sorted
//         indices.forEach(index => {
//             arrayBars[index].classList.add('sorted');
//             arrayBars[index].style.backgroundColor = ''; // Remove inline style
//         });
//     }
    
//     updateCounters();
// }
function executeStep(step) {
    const { type, indices, values } = step;
    
    // Reset all non-sorted bars to default color
    for (let i = 0; i < arrayBars.length; i++) {
        if (!arrayBars[i].classList.contains('sorted')) {
            arrayBars[i].classList.remove('comparing', 'selected', 'swapping');
            arrayBars[i].style.backgroundColor = '';
        }
    }
    
    // Update counters
    if (type === 'compare') {
        comparisonCount++;
        arrayAccessCount += 2;
        
        // Highlight bars being compared
        indices.forEach(index => {
            arrayBars[index].classList.add('comparing');
        });
    } 
    else if (type === 'swap') {
        swapCount++;
        arrayAccessCount += 2;
        
        // Update array and display for swap
        indices.forEach((index, i) => {
            array[index] = values[i];
            const heightPercentage = calculateBarHeight(values[i], array);
            arrayBars[index].style.height = `${heightPercentage}%`;
            arrayBars[index].classList.add('swapping');
            
            // Update value label if present
            const valueLabel = arrayBars[index].querySelector('.value');
            if (valueLabel) {
                valueLabel.textContent = values[i];
            }
        });
    } 
    else if (type === 'select') {
        arrayAccessCount += 1;
        
        // Highlight selected bar
        arrayBars[indices[0]].classList.add('selected');
    } 
    // else if (type === 'mark-sorted') {
    //     // Mark elements as sorted and ensure correct heights
    //     indices.forEach(index => {
    //         const heightPercentage = calculateBarHeight(array[index], array);
    //         arrayBars[index].style.height = `${heightPercentage}%`;
    //         arrayBars[index].classList.add('sorted');
    //     });
    // }
    else if (type === 'mark-sorted') {
        // Mark elements as sorted and ensure correct heights
        indices.forEach(index => {
            const heightPercentage = calculateBarHeight(array[index], array);
            arrayBars[index].style.height = `${heightPercentage}%`;
            arrayBars[index].classList.add('sorted');
            arrayBars[index].style.backgroundColor = ''; // Remove inline color
        });
    }
    
    updateCounters();
}
function calculateBarHeight(value, array) {
    const maxValue = Math.max(...array);
    const minValue = Math.min(...array);
    const range = maxValue - minValue;
    
    // Use 10% minimum height and 95% maximum height for better visibility
    return 10 + 85 * ((value - minValue) / (range || 1)); // Add || 1 to avoid division by zero
}
// function getHeightPercentage(value) {
//     const maxValue = Math.max(...array);
//     const minValue = Math.min(...array);
    
//     if (maxValue === minValue) {
//         return 50; // Middle height if all values are the same
//     }
    
//     // Normalize and ensure heights remain between 10% and 95%
//     const heightPercentage = Math.max(10, Math.min(95, 10 + ((value - minValue) / (maxValue - minValue)) * 85));
//     return heightPercentage;
    

// }
// function getHeightPercentage(value) {
//     const maxValue = Math.max(...array);
//     const minValue = Math.min(...array);
//     // const range = maxValue - minValue || 1; // Avoid division by zero
    
//     // // Ensure a minimum spread between 5% and 95%
//     // return 5 + 90 * ((value - minValue) / range);

//     // Avoid division by zero
//     const range = maxValue - minValue;
//     if (range === 0) {
//         return 5; // Minimum height if all values are the same
//     }
    
//     // Scale height between 5% and 95% of the container
//     const heightPercentage = 5 + ((value - minValue) / range) * 90;
//     return Math.max(5, Math.min(heightPercentage, 95));
// }

// Perform a single step in paused mode
function performSingleStep() {
    if (isSorting && isPaused && currentStepIndex < algorithmSteps.length) {
        const step = algorithmSteps[currentStepIndex];
        executeStep(step);
        currentStepIndex++;
        
        // If this was the last step, finish sorting
        if (currentStepIndex >= algorithmSteps.length) {
            finishSorting();
        }
    }
}

// Pause the sorting animation
function pauseSorting() {
    if (isSorting && !isPaused) {
        isPaused = true;
        pauseBtn.disabled = true;
        stepBtn.disabled = false;
        resumeBtn.disabled = false;
        
        // Clear any pending timeouts
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }
}

// Resume sorting after pause
function resumeSorting() {
    if (isSorting && isPaused) {
        isPaused = false;
        pauseBtn.disabled = false;
        stepBtn.disabled = false;
        resumeBtn.disabled = true;
        
        animateSort();
    }
}

// Finish sorting and reset controls
// function finishSorting() {
//     isSorting = false;
//     isPaused = false;
    
//     // Mark all elements as sorted
//     arrayBars.forEach(bar => {
//         bar.classList.add('sorted');
//     });
    
//     // Reset control buttons
//     pauseBtn.disabled = true;
//     stepBtn.disabled = true;
//     resumeBtn.disabled = true;
    
//     // Re-enable other controls
//     randomizeBtn.disabled = false;
//     sortBtn.disabled = false;
//     sizeSlider.disabled = false;
//     algorithmSelect.disabled = false;
//     arrayTypeSelect.disabled = false;
//     customArrayText.disabled = false;
// }

// function finishSorting() {
//     isSorting = false;
//     isPaused = false;
    
//     // Ensure all elements have correct heights and are marked as sorted
//     arrayBars.forEach((bar, index) => {
//         const heightPercentage = calculateBarHeight(array[index], array);
//         bar.style.height = `${heightPercentage}%`;
//         bar.classList.add('sorted');
//     });
    
//     // Reset control buttons
//     pauseBtn.disabled = true;
//     stepBtn.disabled = true;
//     resumeBtn.disabled = true;
    
//     // Re-enable other controls
//     randomizeBtn.disabled = false;
//     sortBtn.disabled = false;
//     sizeSlider.disabled = false;
//     algorithmSelect.disabled = false;
//     arrayTypeSelect.disabled = false;
//     customArrayText.disabled = false;
// }

function finishSorting() {
    isSorting = false;
    isPaused = false;
    
    // Ensure all elements have correct heights and are marked as sorted
    arrayBars.forEach((bar, index) => {
        const heightPercentage = calculateBarHeight(array[index], array);
        bar.style.height = `${heightPercentage}%`;
        bar.classList.add('sorted');
        bar.style.backgroundColor = ''; // Remove inline color
    });
    
    // Reset control buttons
    pauseBtn.disabled = true;
    stepBtn.disabled = true;
    resumeBtn.disabled = true;
    
    // Re-enable other controls
    randomizeBtn.disabled = false;
    sortBtn.disabled = false;
    sizeSlider.disabled = false;
    algorithmSelect.disabled = false;
    arrayTypeSelect.disabled = false;
    customArrayText.disabled = false;
}
// --- Algorithm Step Generation Functions ---

// Selection Sort
function generateSelectionSortSteps(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        
        // Find the minimum element in unsorted array
        algorithmSteps.push({
            type: 'select',
            indices: [i],
            values: [arr[i]]
        });
        
        for (let j = i + 1; j < n; j++) {
            algorithmSteps.push({
                type: 'compare',
                indices: [minIndex, j],
                values: [arr[minIndex], arr[j]]
            });
            
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        // Swap the found minimum element with the first element
        if (minIndex !== i) {
            algorithmSteps.push({
                type: 'swap',
                indices: [i, minIndex],
                values: [arr[minIndex], arr[i]]
            });
            
            const temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
        
        // Mark current position as sorted
        algorithmSteps.push({
            type: 'mark-sorted',
            indices: [i],
            values: [arr[i]]
        });
    }
    
    // Mark the last element as sorted
    algorithmSteps.push({
        type: 'mark-sorted',
        indices: [n - 1],
        values: [arr[n - 1]]
    });
}

// Bubble Sort
function generateBubbleSortSteps(arr) {
    const n = arr.length;
    let swapped;
    
    for (let i = 0; i < n; i++) {
        swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            algorithmSteps.push({
                type: 'compare',
                indices: [j, j + 1],
                values: [arr[j], arr[j + 1]]
            });
            
            if (arr[j] > arr[j + 1]) {
                algorithmSteps.push({
                    type: 'swap',
                    indices: [j, j + 1],
                    values: [arr[j + 1], arr[j]]
                });
                
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        
        // Mark the last element of this pass as sorted
        algorithmSteps.push({
            type: 'mark-sorted',
            indices: [n - i - 1],
            values: [arr[n - i - 1]]
        });
        
        // If no swapping occurred in this pass, array is sorted
        if (!swapped) {
            // Mark all remaining elements as sorted
            const sortedIndices = [];
            for (let k = 0; k <= n - i - 2; k++) {
                sortedIndices.push(k);
            }
            
            if (sortedIndices.length > 0) {
                algorithmSteps.push({
                    type: 'mark-sorted',
                    indices: sortedIndices,
                    values: sortedIndices.map(idx => arr[idx])
                });
            }
            
            break;
        }
    }
}


// Insertion Sort
// function generateInsertionSortSteps(arr) {
//     const n = arr.length;
    
//     // Mark first element as initially sorted
//     algorithmSteps.push({
//         type: 'mark-sorted',
//         indices: [0],
//         values: [arr[0]]
//     });
    
//     for (let i = 1; i < n; i++) {
//         // Select current element to insert
//         algorithmSteps.push({
//             type: 'select',
//             indices: [i],
//             values: [arr[i]]
//         });
        
//         const key = arr[i];
//         let j = i - 1;
        
//         // Move elements greater than key to one position ahead
//         while (j >= 0) {
//             algorithmSteps.push({
//                 type: 'compare',
//                 indices: [j, j + 1],
//                 values: [arr[j], key]
//             });
            
//             if (arr[j] > key) {
//                 algorithmSteps.push({
//                     type: 'swap',
//                     indices: [j + 1],
//                     values: [arr[j]]
//                 });
                
//                 arr[j + 1] = arr[j];
//                 j--;
//             } else {
//                 break;
//             }
//         }
        
//         // Place key at its correct position
//         if (arr[j + 1] !== key) {
//             algorithmSteps.push({
//                 type: 'swap',
//                 indices: [j + 1],
//                 values: [key]
//             });
//         }
        
//         arr[j + 1] = key;
        
//         // Mark elements up to current position as sorted
//         const sortedIndices = [];
//         for (let k = 0; k <= i; k++) {
//             sortedIndices.push(k);
//         }
//         algorithmSteps.push({
//             type: 'mark-sorted',
//             indices: sortedIndices,
//             values: sortedIndices.map(idx => arr[idx])
//         });
//     }
// }

// Insertion Sort
// function generateInsertionSortSteps(arr) {
//     const n = arr.length;
    
//     // Mark first element as initially sorted
//     algorithmSteps.push({
//         type: 'mark-sorted',
//         indices: [0],
//         values: [arr[0]]
//     });
    
//     for (let i = 1; i < n; i++) {
//         // Select current element to insert
//         algorithmSteps.push({
//             type: 'select',
//             indices: [i],
//             values: [arr[i]]
//         });
        
//         const key = arr[i];
//         let j = i - 1;
        
//         // Move elements greater than key to one position ahead
//         while (j >= 0) {
//             algorithmSteps.push({
//                 type: 'compare',
//                 indices: [j, j + 1],
//                 values: [arr[j], key]
//             });
            
//             if (arr[j] > key) {
//                 algorithmSteps.push({
//                     type: 'swap',
//                     indices: [j + 1],
//                     values: [arr[j]]
//                 });
                
//                 arr[j + 1] = arr[j];
//                 j--;
//             } else {
//                 break;
//             }
//         }
        
//         // Place key at its correct position
//         if (arr[j + 1] !== key) {
//             algorithmSteps.push({
//                 type: 'swap',
//                 indices: [j + 1],
//                 values: [key]
//             });
//         }
        
//         arr[j + 1] = key;
        
//         // Mark only the newly inserted element as sorted
//         algorithmSteps.push({
//             type: 'mark-sorted',
//             indices: [j + 1],
//             values: [arr[j + 1]]
//         });
//     }
    
//     // At the end, ensure all elements are marked as sorted
//     const allIndices = [];
//     for (let k = 0; k < n; k++) {
//         allIndices.push(k);
//     }
    
//     algorithmSteps.push({
//         type: 'mark-sorted',
//         indices: allIndices,
//         values: allIndices.map(idx => arr[idx])
//     });
// }

// function generateInsertionSortSteps(arr) {
//     const n = arr.length;
    
//     // Mark first element as initially sorted
//     algorithmSteps.push({
//         type: 'mark-sorted',
//         indices: [0],
//         values: [arr[0]]
//     });

//     for (let i = 1; i < n; i++) {
//         // Select current element to insert
//         algorithmSteps.push({
//             type: 'select',
//             indices: [i],
//             values: [arr[i]]
//         });

//         const key = arr[i];
//         let j = i - 1;

//         // Move elements greater than key to one position ahead
//         while (j >= 0) {
//             algorithmSteps.push({
//                 type: 'compare',
//                 indices: [j, j + 1],
//                 values: [arr[j], key]
//             });

//             if (arr[j] > key) {
//                 algorithmSteps.push({
//                     type: 'swap',
//                     indices: [j, j + 1],
//                     values: [arr[j], key]
//                 });

//                 // Swap the actual elements
//                 [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
//                 j--;
//             } else {
//                 break;
//             }
//         }

//         // Mark the correctly positioned elements as sorted up to this point
//         const sortedIndices = [];
//         for (let k = 0; k <= i; k++) {
//             sortedIndices.push(k);
//         }
        
//         algorithmSteps.push({
//             type: 'mark-sorted',
//             indices: sortedIndices,
//             values: sortedIndices.map(idx => arr[idx])
//         });
//     }

//     // Ensure all elements are marked as sorted at the end
//     const allIndices = Array.from({length: n}, (_, k) => k);
//     algorithmSteps.push({
//         type: 'mark-sorted',
//         indices: allIndices,
//         values: allIndices.map(idx => arr[idx])
//     });
// }
function generateInsertionSortSteps(arr) {
    const n = arr.length;
    const arrCopy = [...arr]; // Work with a copy to avoid modifying the original array
    
    // Mark first element as initially sorted
    algorithmSteps.push({
        type: 'mark-sorted',
        indices: [0],
        values: [arrCopy[0]]
    });
    
    for (let i = 1; i < n; i++) {
        const key = arrCopy[i];
        let j = i - 1;
        
        // Select current element to insert
        algorithmSteps.push({
            type: 'select',
            indices: [i],
            values: [key]
        });
        
        // Move elements greater than key to one position ahead
        while (j >= 0) {
            algorithmSteps.push({
                type: 'compare',
                indices: [j, j + 1],
                values: [arrCopy[j], key]
            });
            
            if (arrCopy[j] > key) {
                algorithmSteps.push({
                    type: 'swap',
                    indices: [j, j + 1],
                    values: [key, arrCopy[j]]
                });
                
                // Perform the swap
                arrCopy[j + 1] = arrCopy[j];
                j--;
            } else {
                break;
            }
        }
        
        // Place key at its correct position
        if (arrCopy[j + 1] !== key) {
            algorithmSteps.push({
                type: 'swap',
                indices: [j + 1],
                values: [key]
            });
            arrCopy[j + 1] = key;
        }
        
        // Mark elements up to current position as sorted
        const sortedIndices = [];
        for (let k = 0; k <= i; k++) {
            sortedIndices.push(k);
        }
        algorithmSteps.push({
            type: 'mark-sorted',
            indices: sortedIndices,
            values: sortedIndices.map(idx => arrCopy[idx])
        });
    }
    
    // Final step to ensure all bars are marked as sorted
    const allIndices = Array.from({length: n}, (_, i) => i);
    algorithmSteps.push({
        type: 'mark-sorted',
        indices: allIndices,
        values: [...arrCopy] // Spread operator to create a new array
    });
}
// Merge Sort
function generateMergeSortSteps(arr, left, right) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        // Sort first and second halves
        generateMergeSortSteps(arr, left, mid);
        generateMergeSortSteps(arr, mid + 1, right);
        
        // Merge the sorted halves
        mergeSortMerge(arr, left, mid, right);
    }
}

function mergeSortMerge(arr, left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;
    
    // Create temp arrays
    const L = new Array(n1);
    const R = new Array(n2);
    
    // Copy data to temp arrays
    for (let i = 0; i < n1; i++) {
        L[i] = arr[left + i];
    }
    for (let j = 0; j < n2; j++) {
        R[j] = arr[mid + 1 + j];
    }
    
    // Merge the temp arrays back
    let i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
        algorithmSteps.push({
            type: 'compare',
            indices: [left + i, mid + 1 + j],
            values: [L[i], R[j]]
        });
        
        if (L[i] <= R[j]) {
            algorithmSteps.push({
                type: 'swap',
                indices: [k],
                values: [L[i]]
            });
            
            arr[k] = L[i];
            i++;
        } else {
            algorithmSteps.push({
                type: 'swap',
                indices: [k],
                values: [R[j]]
            });
            
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    
    // Copy remaining elements of L[]
    while (i < n1) {
        algorithmSteps.push({
            type: 'swap',
            indices: [k],
            values: [L[i]]
        });
        
        arr[k] = L[i];
        i++;
        k++;
    }
    
    // Copy remaining elements of R[]
    while (j < n2) {
        algorithmSteps.push({
            type: 'swap',
            indices: [k],
            values: [R[j]]
        });
        
        arr[k] = R[j];
        j++;
        k++;
    }
    
    // Mark the merged portion as being in progress
    const mergedIndices = [];
    for (let idx = left; idx <= right; idx++) {
        mergedIndices.push(idx);
    }
    
    // Only mark as fully sorted if this is a complete subarray
    if (left === 0 && right === arr.length - 1) {
        algorithmSteps.push({
            type: 'mark-sorted',
            indices: mergedIndices,
            values: mergedIndices.map(idx => arr[idx])
        });
    }
}

// Quick Sort
function generateQuickSortSteps(arr, low, high) {
    if (low < high) {
        // Find pivot element such that
        // elements smaller than pivot are on the left
        // elements greater than pivot are on the right
        const pivotIndex = quickSortPartition(arr, low, high);
        
        // Mark pivot as in its final position
        algorithmSteps.push({
            type: 'mark-sorted',
            indices: [pivotIndex],
            values: [arr[pivotIndex]]
        });
        
        // Recursively sort elements before and after pivot
        generateQuickSortSteps(arr, low, pivotIndex - 1);
        generateQuickSortSteps(arr, pivotIndex + 1, high);
    } else if (low === high) {
        // Single element is sorted
        algorithmSteps.push({
            type: 'mark-sorted',
            indices: [low],
            values: [arr[low]]
        });
    }
}
// Completion of quickSortPartition function
function quickSortPartition(arr, low, high) {
    // Select the rightmost element as pivot
    const pivot = arr[high];
    algorithmSteps.push({
        type: 'select',
        indices: [high],
        values: [pivot]
    });
    
    let i = low - 1;
    
    for (let j = low; j <= high - 1; j++) {
        algorithmSteps.push({
            type: 'compare',
            indices: [j, high],
            values: [arr[j], pivot]
        });
        
        // If current element is smaller than pivot
        if (arr[j] < pivot) {
            i++;
            
            // Swap arr[i] and arr[j]
            algorithmSteps.push({
                type: 'swap',
                indices: [i, j],
                values: [arr[j], arr[i]]
            });
            
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    // Swap arr[i+1] and arr[high] (put pivot in its correct position)
    algorithmSteps.push({
        type: 'swap',
        indices: [i + 1, high],
        values: [pivot, arr[i + 1]]
    });
    
    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    return i + 1;
}

// Heap Sort
function generateHeapSortSteps(arr) {
    const n = arr.length;
    
    // Build heap (rearrange array)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        algorithmSteps.push({
            type: 'swap',
            indices: [0, i],
            values: [arr[i], arr[0]]
        });
        
        const temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        
        // Mark this position as sorted
        algorithmSteps.push({
            type: 'mark-sorted',
            indices: [i],
            values: [arr[i]]
        });
        
        // Call max heapify on the reduced heap
        heapify(arr, i, 0);
    }
    
    // Mark the first element as sorted
    algorithmSteps.push({
        type: 'mark-sorted',
        indices: [0],
        values: [arr[0]]
    });
}

// Heapify subtree rooted at index i
function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    // Compare with left child
    if (left < n) {
        algorithmSteps.push({
            type: 'compare',
            indices: [largest, left],
            values: [arr[largest], arr[left]]
        });
        
        if (arr[left] > arr[largest]) {
            largest = left;
        }
    }
    
    // Compare with right child
    if (right < n) {
        algorithmSteps.push({
            type: 'compare',
            indices: [largest, right],
            values: [arr[largest], arr[right]]
        });
        
        if (arr[right] > arr[largest]) {
            largest = right;
        }
    }
    
    // If largest is not root
    if (largest !== i) {
        algorithmSteps.push({
            type: 'swap',
            indices: [i, largest],
            values: [arr[largest], arr[i]]
        });
        
        const temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        
        // Recursively heapify the affected sub-tree
        heapify(arr, n, largest);
    }
}

// Comparison functionality
function generateComparisonArrays() {
    const size = parseInt(compareSizeSlider.value);
    const type = compareArrayTypeSelect.value;
    
    comparisonContainer.innerHTML = '';
    
    // Create a shared array for all algorithms to use
    let sharedArray = [];
    
    switch (type) {
        case 'Random':
            for (let i = 0; i < size; i++) {
                sharedArray.push(randomIntFromInterval(5, 100));
            }
            break;
        case 'Nearly Sorted':
            for (let i = 0; i < size; i++) {
                sharedArray.push(i + 1 + Math.floor(Math.random() * 10) - 5);
            }
            break;
        case 'Reversed':
            for (let i = size; i > 0; i--) {
                sharedArray.push(i);
            }
            break;
        case 'Few Unique':
            const uniqueValues = [10, 30, 50, 70, 90];
            for (let i = 0; i < size; i++) {
                sharedArray.push(uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
            }
            break;
    }
    
    // Create algorithm containers
    const algorithms = Array.from(algoCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    algorithms.forEach(algo => {
        const algoContainer = document.createElement('div');
        algoContainer.classList.add('compare-algo-container');
        algoContainer.innerHTML = `
            <h3>${algo}</h3>
            <div class="compare-metrics">
                <div>Comparisons: <span class="compare-comparison-count">0</span></div>
                <div>Swaps: <span class="compare-swap-count">0</span></div>
                <div>Array Access: <span class="compare-access-count">0</span></div>
                <div>Status: <span class="compare-status">Ready</span></div>
            </div>
            <div class="compare-array-container" id="${algo.replace(/\s+/g, '-').toLowerCase()}-container"></div>
        `;
        
        comparisonContainer.appendChild(algoContainer);
        
        // Create array visualization
        const arrayContainer = algoContainer.querySelector('.compare-array-container');
        const arrayCopy = [...sharedArray];
        
        const maxValue = Math.max(...arrayCopy);
        const minValue = Math.min(...arrayCopy);
        const range = maxValue - minValue;
        
        for (let i = 0; i < arrayCopy.length; i++) {
            const bar = document.createElement('div');
            bar.classList.add('compare-array-bar');
            
            const heightPercentage = 10 + 85 * ((arrayCopy[i] - minValue) / range);
            bar.style.height = `${heightPercentage}%`;
            
            arrayContainer.appendChild(bar);
        }
    });
}

// Start comparison of algorithms
function startComparison() {
    const algorithms = Array.from(algoCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    if (algorithms.length === 0) {
        alert('Please select at least one algorithm to compare.');
        return;
    }
    
    
    // Disable UI controls
    compareNewArrayBtn.disabled = true;
    compareStartBtn.disabled = true;
    compareArrayTypeSelect.disabled = true;
    compareSizeSlider.disabled = true;
    algoCheckboxes.forEach(checkbox => checkbox.disabled = true);
    
    // Start each algorithm in its own container
    algorithms.forEach(algo => {
        runComparisonAlgorithm(algo);
    });
}

// Run a specific algorithm for comparison
function runComparisonAlgorithm(algorithm) {
    const containerId = `${algorithm.replace(/\s+/g, '-').toLowerCase()}-container`;
    const container = document.getElementById(containerId);
    const bars = container.querySelectorAll('.compare-array-bar');
    
    // Get metrics elements
    const parent = container.parentElement;
    const comparisonCountEl = parent.querySelector('.compare-comparison-count');
    const swapCountEl = parent.querySelector('.compare-swap-count');
    const accessCountEl = parent.querySelector('.compare-access-count');
    const statusEl = parent.querySelector('.compare-status');
    
    // Get array data from bars
    const arr = [];
    for (let i = 0; i < bars.length; i++) {
        const height = parseFloat(bars[i].style.height);
        arr.push(height);
    }
    
    // Initialize counters
    let comparisons = 0;
    let swaps = 0;
    let accesses = 0;
    
    // Set status to running
    statusEl.textContent = 'Running...';
    
    // Choose algorithm and run it
    const startTime = performance.now();
    let steps = [];
    
    switch (algorithm) {
        case 'Selection Sort':
            steps = compareSelectionSort(arr, bars, comparisonCountEl, swapCountEl, accessCountEl);
            break;
        case 'Bubble Sort':
            steps = compareBubbleSort(arr, bars, comparisonCountEl, swapCountEl, accessCountEl);
            break;
        case 'Insertion Sort':
            steps = compareInsertionSort(arr, bars, comparisonCountEl, swapCountEl, accessCountEl);
            break;
        case 'Merge Sort':
            steps = compareMergeSort(arr, 0, arr.length - 1, bars, comparisonCountEl, swapCountEl, accessCountEl);
            break;
        case 'Quick Sort':
            steps = compareQuickSort(arr, 0, arr.length - 1, bars, comparisonCountEl, swapCountEl, accessCountEl);
            break;
        case 'Heap Sort':
            steps = compareHeapSort(arr, bars, comparisonCountEl, swapCountEl, accessCountEl);
            break;
    }
    
    // Execute steps with animation
    const delay = Math.max(1, Math.floor(500 - compareSpeedSlider.value * 5));
    let stepIndex = 0;
    
    function executeNextStep() {
        if (stepIndex < steps.length) {
            const step = steps[stepIndex];
            
            // Apply the step
            if (step.type === 'compare') {
                comparisons++;
                comparisonCountEl.textContent = comparisons;
                accesses += 2;
                accessCountEl.textContent = accesses;
                
                // Highlight compared bars
                step.indices.forEach(index => {
                    bars[index].style.backgroundColor = 'var(--compare-color)';
                });
            } 
            else if (step.type === 'swap') {
                swaps++;
                swapCountEl.textContent = swaps;
                accesses += step.indices.length;
                accessCountEl.textContent = accesses;
                
                // Update bars with correct heights
                step.indices.forEach((index, i) => {
                    // Calculate height based on current array state
                    const height = step.values[i];
                    bars[index].style.height = `${height}%`;
                    bars[index].style.backgroundColor = 'var(--swap-color)';
                });
            }
            else if (step.type === 'mark-sorted') {
                step.indices.forEach(index => {
                    bars[index].style.backgroundColor = 'var(--sorted-color)';
                    // Ensure correct height for sorted bars
                    bars[index].style.height = `${step.values[0]}%`;
                });
            }
            
            stepIndex++;
            setTimeout(() => {
                // Reset non-sorted bars
                for (let i = 0; i < bars.length; i++) {
                    if (bars[i].style.backgroundColor !== 'var(--sorted-color)') {
                        bars[i].style.backgroundColor = 'var(--bar-default)';
                    }
                }
                executeNextStep();
            }, delay);
        } else {
            // All steps completed
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            statusEl.textContent = `Completed in ${duration}s`;
            
            // Mark all bars as sorted
            for (let i = 0; i < bars.length; i++) {
                bars[i].style.backgroundColor = 'var(--sorted-color)';
            }
            
            // Check if all algorithms are done
            const statuses = document.querySelectorAll('.compare-status');
            const allDone = Array.from(statuses).every(el => 
                el.textContent === 'Completed in ' + duration + 's' || 
                el.textContent.includes('Completed in '));
                
            if (allDone) {
                // Re-enable controls
                compareNewArrayBtn.disabled = false;
                compareStartBtn.disabled = false;
                compareArrayTypeSelect.disabled = false;
                compareSizeSlider.disabled = false;
                algoCheckboxes.forEach(checkbox => checkbox.disabled = false);
            }
        }
    }
    
    // Start the animation
    executeNextStep();
}

// Comparison algorithm implementations
// These are similar to the main algorithms but return steps instead of using the global steps array

function compareSelectionSort(arr, bars, comparisonEl, swapEl, accessEl) {
    const steps = [];
    const n = arr.length;
    const arrCopy = [...arr];
    
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        
        for (let j = i + 1; j < n; j++) {
            steps.push({
                type: 'compare',
                indices: [minIndex, j],
                values: [arrCopy[minIndex], arrCopy[j]]
            });
            
            if (arrCopy[j] < arrCopy[minIndex]) {
                minIndex = j;
            }
        }
        
        if (minIndex !== i) {
            steps.push({
                type: 'swap',
                indices: [i, minIndex],
                values: [arrCopy[minIndex], arrCopy[i]]
            });
            
            const temp = arrCopy[i];
            arrCopy[i] = arrCopy[minIndex];
            arrCopy[minIndex] = temp;
        }
        
        steps.push({
            type: 'mark-sorted',
            indices: [i],
            values: [arrCopy[i]]
        });
    }
    
    steps.push({
        type: 'mark-sorted',
        indices: [n - 1],
        values: [arrCopy[n - 1]]
    });
    
    return steps;
}

function compareBubbleSort(arr, bars, comparisonEl, swapEl, accessEl) {
    const steps = [];
    const n = arr.length;
    const arrCopy = [...arr];
    let swapped;
    
    for (let i = 0; i < n; i++) {
        swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            steps.push({
                type: 'compare',
                indices: [j, j + 1],
                values: [arrCopy[j], arrCopy[j + 1]]
            });
            
            if (arrCopy[j] > arrCopy[j + 1]) {
                steps.push({
                    type: 'swap',
                    indices: [j, j + 1],
                    values: [arrCopy[j + 1], arrCopy[j]]
                });
                
                const temp = arrCopy[j];
                arrCopy[j] = arrCopy[j + 1];
                arrCopy[j + 1] = temp;
                swapped = true;
            }
        }
        
        steps.push({
            type: 'mark-sorted',
            indices: [n - i - 1],
            values: [arrCopy[n - i - 1]]
        });
        
        if (!swapped) {
            const sortedIndices = [];
            for (let k = 0; k <= n - i - 2; k++) {
                sortedIndices.push(k);
            }
            
            if (sortedIndices.length > 0) {
                steps.push({
                    type: 'mark-sorted',
                    indices: sortedIndices,
                    values: sortedIndices.map(idx => arrCopy[idx])
                });
            }
            
            break;
        }
    }
    
    return steps;
}

function compareInsertionSort(arr, bars, comparisonEl, swapEl, accessEl) {
    const steps = [];
    const n = arr.length;
    const arrCopy = [...arr];
    
    steps.push({
        type: 'mark-sorted',
        indices: [0],
        values: [arrCopy[0]]
    });
    
    for (let i = 1; i < n; i++) {
        const key = arrCopy[i];
        let j = i - 1;
        
        while (j >= 0) {
            steps.push({
                type: 'compare',
                indices: [j, j + 1],
                values: [arrCopy[j], key]
            });
            
            if (arrCopy[j] > key) {
                steps.push({
                    type: 'swap',
                    indices: [j + 1],
                    values: [arrCopy[j]]
                });
                
                arrCopy[j + 1] = arrCopy[j];
                j--;
            } else {
                break;
            }
        }
        
        if (arrCopy[j + 1] !== key) {
            steps.push({
                type: 'swap',
                indices: [j + 1],
                values: [key]
            });
        }
        
        arrCopy[j + 1] = key;
        
        const sortedIndices = [];
        for (let k = 0; k <= i; k++) {
            sortedIndices.push(k);
        }
        
        steps.push({
            type: 'mark-sorted',
            indices: sortedIndices,
            values: sortedIndices.map(idx => arrCopy[idx])
        });
    }
    
    return steps;
}

function compareMergeSort(arr, left, right, bars, comparisonEl, swapEl, accessEl) {
    const steps = [];
    const arrCopy = [...arr];
    
    function mergeSortRecursive(l, r) {
        if (l < r) {
            const mid = Math.floor((l + r) / 2);
            
            mergeSortRecursive(l, mid);
            mergeSortRecursive(mid + 1, r);
            
            merge(l, mid, r);
        }
    }
    
    function merge(l, mid, r) {
        const n1 = mid - l + 1;
        const n2 = r - mid;
        
        const L = new Array(n1);
        const R = new Array(n2);
        
        for (let i = 0; i < n1; i++) {
            L[i] = arrCopy[l + i];
        }
        for (let j = 0; j < n2; j++) {
            R[j] = arrCopy[mid + 1 + j];
        }
        
        let i = 0, j = 0, k = l;
        
        while (i < n1 && j < n2) {
            steps.push({
                type: 'compare',
                indices: [l + i, mid + 1 + j],
                values: [L[i], R[j]]
            });
            
            if (L[i] <= R[j]) {
                steps.push({
                    type: 'swap',
                    indices: [k],
                    values: [L[i]]
                });
                
                arrCopy[k] = L[i];
                i++;
            } else {
                steps.push({
                    type: 'swap',
                    indices: [k],
                    values: [R[j]]
                });
                
                arrCopy[k] = R[j];
                j++;
            }
            k++;
        }
        
        while (i < n1) {
            steps.push({
                type: 'swap',
                indices: [k],
                values: [L[i]]
            });
            
            arrCopy[k] = L[i];
            i++;
            k++;
        }
        
        while (j < n2) {
            steps.push({
                type: 'swap',
                indices: [k],
                values: [R[j]]
            });
            
            arrCopy[k] = R[j];
            j++;
            k++;
        }
        
        const mergedIndices = [];
        for (let idx = l; idx <= r; idx++) {
            mergedIndices.push(idx);
        }
        
        if (l === 0 && r === arrCopy.length - 1) {
            steps.push({
                type: 'mark-sorted',
                indices: mergedIndices,
                values: mergedIndices.map(idx => arrCopy[idx])
            });
        }
    }
    
    mergeSortRecursive(left, right);
    return steps;
}

function compareQuickSort(arr, low, high, bars, comparisonEl, swapEl, accessEl) {
    const steps = [];
    const arrCopy = [...arr];
    
    function quickSortRecursive(l, h) {
        if (l < h) {
            const pivotIndex = partition(l, h);
            
            steps.push({
                type: 'mark-sorted',
                indices: [pivotIndex],
                values: [arrCopy[pivotIndex]]
            });
            
            quickSortRecursive(l, pivotIndex - 1);
            quickSortRecursive(pivotIndex + 1, h);
        } else if (l === h) {
            steps.push({
                type: 'mark-sorted',
                indices: [l],
                values: [arrCopy[l]]
            });
        }
    }
    
    function partition(l, h) {
        const pivot = arrCopy[h];
        
        let i = l - 1;
        
        for (let j = l; j <= h - 1; j++) {
            steps.push({
                type: 'compare',
                indices: [j, h],
                values: [arrCopy[j], pivot]
            });
            
            if (arrCopy[j] < pivot) {
                i++;
                
                steps.push({
                    type: 'swap',
                    indices: [i, j],
                    values: [arrCopy[j], arrCopy[i]]
                });
                
                const temp = arrCopy[i];
                arrCopy[i] = arrCopy[j];
                arrCopy[j] = temp;
            }
        }
        
        steps.push({
            type: 'swap',
            indices: [i + 1, h],
            values: [pivot, arrCopy[i + 1]]
        });
        
        const temp = arrCopy[i + 1];
        arrCopy[i + 1] = arrCopy[h];
        arrCopy[h] = temp;
        
        return i + 1;
    }
    
    quickSortRecursive(low, high);
    return steps;
}

function compareHeapSort(arr, bars, comparisonEl, swapEl, accessEl) {
    const steps = [];
    const n = arr.length;
    const arrCopy = [...arr];
    
    function heapify(size, rootIndex) {
        let largest = rootIndex;
        const left = 2 * rootIndex + 1;
        const right = 2 * rootIndex + 2;
        
        if (left < size) {
            steps.push({
                type: 'compare',
                indices: [largest, left],
                values: [arrCopy[largest], arrCopy[left]]
            });
            
            if (arrCopy[left] > arrCopy[largest]) {
                largest = left;
            }
        }
        
        if (right < size) {
            steps.push({
                type: 'compare',
                indices: [largest, right],
                values: [arrCopy[largest], arrCopy[right]]
            });
            
            if (arrCopy[right] > arrCopy[largest]) {
                largest = right;
            }
        }
        
        if (largest !== rootIndex) {
            steps.push({
                type: 'swap',
                indices: [rootIndex, largest],
                values: [arrCopy[largest], arrCopy[rootIndex]]
            });
            
            const temp = arrCopy[rootIndex];
            arrCopy[rootIndex] = arrCopy[largest];
            arrCopy[largest] = temp;
            
            heapify(size, largest);
        }
    }
    
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
    }
    
    for (let i = n - 1; i > 0; i--) {
        steps.push({
            type: 'swap',
            indices: [0, i],
            values: [arrCopy[i], arrCopy[0]]
        });
        
        const temp = arrCopy[0];
        arrCopy[0] = arrCopy[i];
        arrCopy[i] = temp;
        
        steps.push({
            type: 'mark-sorted',
            indices: [i],
            values: [arrCopy[i]]
        });
        
        heapify(i, 0);
    }
    
    steps.push({
        type: 'mark-sorted',
        indices: [0],
        values: [arrCopy[0]]
    });
    
    return steps;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);