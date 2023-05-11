const axios = require('axios');

function fetchData(URL) {
  return new Promise((resolve, reject) => {
    axios.get(URL)
      .then(response => {
        const data = response.data;

        let result = [];

        if (data.length > 0) {
          result = data
            .slice(0, 10) // Use the slice method to retrieve the first 10 items
            .map(item => ({
              data: item.data,
              alertDate: formatDate(item.alertDate)
            }))
            .filter(item => isAlertDateTimeInRange(item.alertDate));
        }
        resolve(result); // Resolve the promise with the fetched data
      })
      .catch(error => {
        console.error('Error:', error.response.status);
        reject(error); // Reject the promise with the error
      });
  });
}

function isAlertDateTimeInRange(alertDate) {
  const currentDate = new Date();
  const formatCurrentDate = formatDate(currentDate);

  const [alertDateString, alertTimeString] = alertDate.split(' - ');
  const [currentDateString, currentTimeString] = formatCurrentDate.split(' - ');

  const alertDateTime = new Date(`${alertDateString} ${alertTimeString}`);
  const currentDateTime = new Date(`${currentDateString} ${currentTimeString}`);

  const diffInMinutes = Math.abs(alertDateTime - currentDateTime) / (1000 * 60);
  return diffInMinutes <= 20;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-GB');
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  return `${formattedDate} - ${formattedTime}`;
}

const Last24HoursURL = 'https://www.oref.org.il//Shared/Ajax/GetAlarmsHistory.aspx?lang=en&mode=1'
// Initial request

let lastFetchedData = null;

// Remove the setInterval block and modify the code as follows:

// Define a function to handle the fetched data
function handleFetchedData(newData) {
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  console.log('Trying Fetching data... Time:' + formattedDate);

  if (newData.length > 0 && (lastFetchedData === null || (newData >= lastFetchedData&& JSON.stringify(newData) !== JSON.stringify(lastFetchedData)))) {
    console.log('Fetched data:', newData);
    lastFetchedData = newData;
    // Trigger an alert or notification here
  } else if (newData.length === 0) {
    console.log('There are no new alerts');
    lastFetchedData = null; // Treat it as new data since newData is empty
  } else {
    console.log('There are no new alerts');
  }
}

// Call the fetchData function once
function getAndFetchData(){
  fetchData(Last24HoursURL)
  .then(handleFetchedData)
  .catch(error => {
    console.error('Error:', error);
  });
}
  
  // Initial fetch
  getAndFetchData();
  
  // Fetch every 5 seconds
  setInterval(getAndFetchData, 10000);
  







