/**
 * Current Time - 时间显示脚本
 * 根据当前语言显示不同格式的时间
 */

function updateTime() {
  const now = new Date();
  
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  let timeString = '';
  
  if (currentLang === 'zh') {
    timeString = `<strong>${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}</strong> ${hours}:${minutes}:${seconds}`;
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[now.getMonth()];
    timeString = `<strong>${monthName}. ${day}, ${year}</strong> ${hours}:${minutes}:${seconds}`;
  }
  
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.innerHTML = timeString;
  }
}

updateTime();
setInterval(updateTime, 1000);
