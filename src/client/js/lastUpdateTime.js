const time = document.getElementById('lastUpdateTime__converted').innerText;
const dateObj = new Date()
const currentEpochTime = dateObj.getTime();
console.log('time from html', Number(time));
console.log('currentEpochTime', currentEpochTime);
const difference = currentEpochTime - Number(time);
console.log('difference: ', difference);

// const halfSecond = 500;
const oneSecond = 1000;
const oneMinute = oneSecond*60;
// const halfHour = oneMinute*30;
const oneHour = oneMinute*60;
// const halfDay = oneHour*12
const oneDay = oneHour*24;
// const halfMonth = oneDay*15
const oneMonth = oneDay*30;

const generateLastUpdateText = (timeWithUnit) => {
    return `last update: ${timeWithUnit} ago`;
};

window.addEventListener('load', (event) => {
    if(difference >= oneMonth){
        let months = Math.round(difference/oneMonth);
        // months = (difference%oneMonth > halfMonth) ? months+1 : months;
        const timeWithUnit = (months > 1) ? months.toString()+' months' : months.toString()+' month';
        document.getElementById('lastUpdateTime__converted').innerText = generateLastUpdateText(timeWithUnit);
    }else if(difference >= oneDay){
        console.log('day executed');
        let days = Math.round(difference/oneDay);
        // days = (difference%oneDay > halfDay) ? days+1 : days;
        const timeWithUnit = (days > 1) ? days.toString()+' days' : days.toString()+' day';
        document.getElementById('lastUpdateTime__converted').innerText = generateLastUpdateText(timeWithUnit);
    }else if(difference >= oneHour){
        console.log('executed');
        let hours = Math.round(difference/oneHour);
        // hours = (difference%oneHour > halfHour) ? hours+1 : hours;
        const timeWithUnit = (hours > 1) ? hours.toString()+' hours' : hours.toString()+' hour';
        document.getElementById('lastUpdateTime__converted').innerText = generateLastUpdateText(timeWithUnit);
    }else if(difference >= oneMinute){
        let minutes = Math.round(difference/oneMinute);
        // minutes = (difference%oneMinute > halfMinoneMinute) ? minutes+1 : minutes;
        const timeWithUnit = (minutes > 1) ? minutes.toString()+' minutes' : minutes.toString()+' minute';
        document.getElementById('lastUpdateTime__converted').innerText = generateLastUpdateText(timeWithUnit);
    }else{
        let seconds = Math.round(difference/oneSecond);
        // seconds = (difference%oneSecond > halfSecond) ? seconds+1 : seconds;
        const timeWithUnit = (seconds > 1) ? seconds.toString()+' seconds' : seconds.toString()+' second';
        document.getElementById('lastUpdateTime__converted').innerText = generateLastUpdateText(timeWithUnit);
    }
    console.log('page is loaded');
});
