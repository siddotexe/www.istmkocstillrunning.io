// Function to format the date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

// Function to check if the show is still airing
function isAiring(endDate) {
    const currentDate = new Date();
    return currentDate <= new Date(endDate);
}

// Function to fetch the end date from the TVmaze API
async function fetchEndDate() {
    try {
        const response = await fetch('https://api.tvmaze.com/singlesearch/shows?q=taarak-mehta-ka-ooltah-chashmah');
        const data = await response.json();
        
        if (data.status === "Ended") {
            return data.ended;
        }
        
        return "2025-12-31";  // Adjust as necessary
    } catch (error) {
        console.error('Error fetching end date:', error);
        return null;
    }
}

// Function to update the status message
async function updateStatus() {
    const endDate = await fetchEndDate();

    if (endDate) {
        const statusElement = document.getElementById("status");

        if (isAiring(endDate)) {
            statusElement.textContent = `Taarak Mehta is still airing as of ${formatDate(new Date())}. So Taarak Mehta is a popular show which is not ending anytime soon.`;
        } else {
            statusElement.textContent = `Taarak Mehta stopped airing as of ${formatDate(endDate)}.`;
            checkPredictions(endDate);
        }
    } else {
        console.error('Failed to retrieve end date.');
    }
}

// Function to check predictions and update the correct predictors list
async function checkPredictions(actualEndDate) {
    try {
        const response = await fetch(`http://localhost:3000/correct-predictions/${actualEndDate}`);
        const correctPredictions = await response.json();
        const predictorsList = document.getElementById('predictors-list');
        predictorsList.innerHTML = correctPredictions.map(predictor => `<li>${predictor.name}</li>`).join('');
    } catch (error) {
        console.error('Error fetching correct predictions:', error);
    }
}

// Function to handle form submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const predictedDate = document.getElementById('predicted-date').value;
    
    try {
        await fetch('http://localhost:3000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, date: predictedDate })
        });
        document.getElementById('prediction-form').reset();
    } catch (error) {
        console.error('Error submitting prediction:', error);
    }
}

// Function to calculate the running time
function calculateRunningTime(startDate) {
    const now = new Date();
    const start = new Date(startDate);

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}

// Function to update the running time display
function updateRunningTime() {
    const startDate = '2008-07-28';
    const runningTime = calculateRunningTime(startDate);
    const runningTimeElement = document.getElementById('running-time');

    runningTimeElement.textContent = `Taarak Mehta has been running for ${runningTime.years} years, ${runningTime.months} months, and ${runningTime.days} days.`;
}

document.getElementById('prediction-form').addEventListener('submit', handleFormSubmission);

// Call the updateStatus function to fetch and display the end date
updateStatus();

// Update the running time display
updateRunningTime();

// Update the running time display every day
setInterval(updateRunningTime, 24 * 60 * 60 * 1000);