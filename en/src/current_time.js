// Written by Constantine Heinrich Chen (ConsHein Chen)
// Last updated: 2025-09-30


function updateTime() {
    const now = new Date();
    
    // Get each time component
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // English time format: Month. Day, Year Hours:Minutes:Seconds
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[now.getMonth()];
    const timeString = `<strong>${monthName}. ${day}, ${year}</strong> ${hours}:${minutes}:${seconds}`;
    
    // Update time display on the page
    document.getElementById('current-time').innerHTML = timeString;
}

// Update time immediately
updateTime();

// Update time every second
setInterval(updateTime, 1000);
