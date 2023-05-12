// Include Axios library using a script tag
const script = document.createElement('script');
script.src = chrome.extension.getURL('axios.min.js');
(document.head || document.documentElement).appendChild(script);

chrome.alarms.onAlarm.addListener(() => {
  const URL = 'https://www.oref.org.il//Shared/Ajax/GetAlarmsHistory.aspx?lang=en&mode=1'; // Replace with your API endpoint

  fetchData(URL)
  .then(result => {
    let message;
    if (result.length > 0) {
      message = result.map(item => `${item.alertDate}: ${item.data}`).join('\n');
    } else {
      message = 'null';
    }
    if (message !== 'null') {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'alarm.jpg',
        title: 'Rockets Alert!',
        message: message,
        silent: false
      }, () => {});
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });


});

function formatDate(dateString) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-GB');
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  return `${formattedDate} - ${formattedTime}`;
}

function isAlertDateTimeInRange(alertDate) {
  const currentDate = new Date();
  const formatCurrentDate = formatDate(currentDate);

  const [alertDateString, alertTimeString] = alertDate.split(' - ');
  const [currentDateString, currentTimeString] = formatCurrentDate.split(' - ');

  const alertDateTime = new Date(`${alertDateString} ${alertTimeString}`);
  const currentDateTime = new Date(`${currentDateString} ${currentTimeString}`);

  const diffInMinutes = Math.abs(alertDateTime - currentDateTime) / (1000 * 60);
  return diffInMinutes <= 6;
}

function fetchData(URL) {
  return new Promise((resolve, reject) => {
    axios.get(URL)
      .then(response => {
        const data = response.data;

        let result = [];

        if (data.length > 0) {
          result = data
            .slice(0, 10)
            .map(item => ({
              data: item.data,
              alertDate: formatDate(item.alertDate)
            }))
            .filter(item => isAlertDateTimeInRange(item.alertDate));
        }
        resolve(result);
      })
      .catch(error => {
        console.error('Error:', error.response.status);
        reject(error);
      });
  });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(request);
    if (request.time)
      createAlarm();

    sendResponse(true);
  }
);

function createAlarm() {
  chrome.alarms.create(
    "Rockets Alert!",
    {
      delayInMinutes: 0.33,
      periodInMinutes: 0.33
    }
  );
}
