// ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP =====
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Установка цвета темы
tg.setHeaderColor('#0f0f0f');
tg.setBackgroundColor('#0f0f0f');

// ===== НАВИГАЦИЯ =====
const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');

function switchScreen(screenId) {
    screens.forEach(screen => screen.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));
    
    document.getElementById(screenId).classList.add('active');
    const activeNav = document.querySelector(`[data-screen="${screenId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const screenId = item.getAttribute('data-screen');
        switchScreen(screenId);
        tg.HapticFeedback.impactOccurred('light');
    });
});

// ===== ЭКРАН 1: ГЛАВНАЯ =====

// Счётчик Уммы
function updateUmmahCounter() {
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('lastUmmahVisit');
    let ummahCount = parseInt(localStorage.getItem('ummahCount') || '12847');
    
    if (lastVisit !== today) {
        ummahCount += 1;
        localStorage.setItem('ummahCount', ummahCount.toString());
        localStorage.setItem('lastUmmahVisit', today);
    }
    
    // Анимация счётчика
    animateCounter('ummah-count', ummahCount);
}

function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 1500;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString('ru-RU');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('ru-RU');
        }
    }, 16);
}

// Аят дня
function loadDailyAyat() {
    const today = new Date().getDate();
    const ayatIndex = today % 30;
    const ayat = ayatData[ayatIndex];
    
    document.getElementById('ayat-arabic').textContent = ayat.arabic;
    document.getElementById('ayat-translation').textContent = ayat.translation;
    document.getElementById('ayat-reference').textContent = `Сура ${ayat.surah}, Аят ${ayat.ayah}`;
}

// Таймер до ифтара
function updateIftarTimer() {
    const now = new Date();
    const iftarTime = new Date();
    const [hours, minutes] = prayerTimes.maghrib.split(':');
    iftarTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const timerElement = document.getElementById('iftar-timer');
    const messageElement = document.getElementById('iftar-message');
    
    if (now >= iftarTime) {
        timerElement.textContent = '00:00:00';
        messageElement.textContent = 'Ифтар начался 🌙';
        messageElement.style.color = 'var(--accent-primary)';
        return;
    }
    
    const diff = iftarTime - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    timerElement.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    messageElement.textContent = 'осталось';
}

// Отметка поста
function loadFastingData() {
    const today = new Date().toISOString().split('T')[0];
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    const button = document.getElementById('fasting-button');
    const streakElement = document.getElementById('fasting-streak');
    
    if (fastingDays.includes(today)) {
        button.classList.add('completed');
        button.querySelector('.button-text').textContent = 'Сегодня отмечено ✔';
    }
    
    const streak = calculateStreak(fastingDays);
    if (streak > 0) {
        streakElement.textContent = `Вы держите пост ${streak} ${getDaysWord(streak)} подряд`;
        streakElement.classList.add('visible');
    }
}

function calculateStreak(days) {
    if (days.length === 0) return 0;
    
    const sortedDays = days.sort().reverse();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDays.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (sortedDays.includes(checkDateStr)) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function getDaysWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'день';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'дня';
    return 'дней';
}

document.getElementById('fasting-button').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    const button = document.getElementById('fasting-button');
    
    if (fastingDays.includes(today)) {
        tg.showAlert('Вы уже отметили пост сегодня');
        return;
    }
    
    fastingDays.push(today);
    localStorage.setItem('fastingDays', JSON.stringify(fastingDays));
    
    button.classList.add('completed');
    button.querySelector('.button-text').textContent = 'Сегодня отмечено ✔';
    
    tg.HapticFeedback.notificationOccurred('success');
    
    loadFastingData();
    updateCalendar();
    updateProgress();
    updateAchievements();
    showShareButton();
});

// Обновление прогресса Рамадана
function updateProgress() {
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    const completed = fastingDays.length;
    const percentage = Math.round((completed / 30) * 100);
    
    document.getElementById('progress-completed').textContent = completed;
    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    
    // Анимация прогресс-бара
    setTimeout(() => {
        document.getElementById('progress-bar').style.width = `${percentage}%`;
    }, 100);
}

// Обновление достижений
function updateAchievements() {
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    const streak = calculateStreak(fastingDays);
    
    const badges = document.querySelectorAll('.achievement-badge');
    const milestones = [3, 7, 15, 30];
    
    badges.forEach((badge, index) => {
        const requiredDays = milestones[index];
        if (streak >= requiredDays) {
            badge.classList.remove('locked');
            badge.classList.add('unlocked');
        } else {
            badge.classList.remove('unlocked');
            badge.classList.add('locked');
        }
    });
}

// Кнопка "Поделиться прогрессом"
document.getElementById('share-button').addEventListener('click', () => {
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    const streak = calculateStreak(fastingDays);
    
    // URL приложения (замените на реальный URL вашего приложения)
    const appUrl = 'https://t.me/YOUR_BOT_NAME/noor';
    
    // Формирование текста
    const text = `Я соблюдаю пост уже ${streak} ${getDaysWord(streak)} подряд 🌙 Присоединяйся к Noor Ramadan`;
    
    // Открытие Telegram share
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`;
    
    tg.openTelegramLink(shareUrl);
    tg.HapticFeedback.impactOccurred('medium');
});

// Показать кнопку "Поделиться" после отметки поста
function showShareButton() {
    const today = new Date().toISOString().split('T')[0];
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    const shareButton = document.getElementById('share-button');
    
    if (fastingDays.includes(today) && fastingDays.length > 0) {
        shareButton.classList.remove('hidden');
    } else {
        shareButton.classList.add('hidden');
    }
}

// ===== ЭКРАН 2: КАЛЕНДАРЬ =====

function initCalendar() {
    const grid = document.getElementById('calendar-grid');
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    
    grid.innerHTML = '';
    
    for (let i = 1; i <= 30; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        dayElement.dataset.day = i;
        
        // Проверяем, отмечен ли день
        const ramadanStart = new Date('2025-02-01'); // Примерная дата начала Рамадана
        const dayDate = new Date(ramadanStart);
        dayDate.setDate(ramadanStart.getDate() + i - 1);
        const dayDateStr = dayDate.toISOString().split('T')[0];
        
        if (fastingDays.includes(dayDateStr)) {
            dayElement.classList.add('completed');
        }
        
        dayElement.addEventListener('click', () => {
            toggleDay(dayDateStr, dayElement);
        });
        
        grid.appendChild(dayElement);
    }
    
    updateCalendarStats();
}

function toggleDay(dateStr, element) {
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    
    if (fastingDays.includes(dateStr)) {
        const index = fastingDays.indexOf(dateStr);
        fastingDays.splice(index, 1);
        element.classList.remove('completed');
        tg.HapticFeedback.impactOccurred('light');
    } else {
        fastingDays.push(dateStr);
        element.classList.add('completed');
        tg.HapticFeedback.notificationOccurred('success');
    }
    
    localStorage.setItem('fastingDays', JSON.stringify(fastingDays));
    updateCalendarStats();
    loadFastingData();
    updateProgress();
    updateAchievements();
    showShareButton();
}

function updateCalendar() {
    initCalendar();
}

function updateCalendarStats() {
    const fastingDays = JSON.parse(localStorage.getItem('fastingDays') || '[]');
    document.getElementById('calendar-stats').textContent = fastingDays.length;
}

// ===== ЭКРАН 3: НАМАЗ =====

function initPrayerTimes() {
    const list = document.getElementById('prayer-times-list');
    list.innerHTML = '';
    
    Object.keys(prayerTimes).forEach(key => {
        const item = document.createElement('div');
        item.className = 'prayer-item';
        item.dataset.prayer = key;
        
        const name = document.createElement('div');
        name.className = 'prayer-name';
        name.textContent = prayerNames[key];
        
        const time = document.createElement('div');
        time.className = 'prayer-time';
        time.textContent = prayerTimes[key];
        
        item.appendChild(name);
        item.appendChild(time);
        list.appendChild(item);
    });
    
    updateNextPrayer();
}

function updateNextPrayer() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let nextPrayer = null;
    let nextPrayerTime = null;
    let minDiff = Infinity;
    
    Object.keys(prayerTimes).forEach(key => {
        const [hours, minutes] = prayerTimes[key].split(':');
        const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);
        
        let diff = prayerMinutes - currentTime;
        if (diff < 0) diff += 1440; // Добавляем сутки
        
        if (diff < minDiff) {
            minDiff = diff;
            nextPrayer = key;
            nextPrayerTime = prayerMinutes;
        }
    });
    
    if (nextPrayer) {
        document.getElementById('next-prayer-name').textContent = prayerNames[nextPrayer];
        
        // Подсветить активный намаз
        document.querySelectorAll('.prayer-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.prayer === nextPrayer) {
                item.classList.add('active');
            }
        });
        
        updatePrayerCountdown(nextPrayerTime);
    }
}

function updatePrayerCountdown(prayerMinutes) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let diff = prayerMinutes - currentMinutes;
    if (diff < 0) diff += 1440;
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const seconds = 59 - now.getSeconds();
    
    document.getElementById('next-prayer-countdown').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

function init() {
    // Главная
    updateUmmahCounter();
    loadDailyAyat();
    loadFastingData();
    updateProgress();
    updateAchievements();
    showShareButton();
    updateIftarTimer();
    setInterval(updateIftarTimer, 1000);
    
    // Календарь
    initCalendar();
    
    // Намаз
    initPrayerTimes();
    setInterval(updateNextPrayer, 60000); // Обновление каждую минуту
    setInterval(() => {
        const nextPrayerName = document.getElementById('next-prayer-name').textContent;
        const prayerKey = Object.keys(prayerNames).find(key => prayerNames[key] === nextPrayerName);
        if (prayerKey) {
            const [hours, minutes] = prayerTimes[prayerKey].split(':');
            const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);
            updatePrayerCountdown(prayerMinutes);
        }
    }, 1000);
}

// Запуск приложения
init();

// Telegram MainButton для подтверждения
tg.MainButton.text = 'Готово';
tg.MainButton.hide();

// Показывать MainButton только на экране отметки поста (опционально)
// Можно добавить дополнительную логику при необходимости
