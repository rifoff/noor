// ===== ЗАЩИТА: ТОЛЬКО TELEGRAM =====
(function() {
    const isTelegram = window.Telegram &&
                       window.Telegram.WebApp &&
                       window.Telegram.WebApp.initData &&
                       window.Telegram.WebApp.initData.length > 0;

    if (!isTelegram) {
        document.body.innerHTML = `
            <div style="
                min-height: 100vh;
                background: #0f0f0f;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: 'Outfit', sans-serif;
                text-align: center;
                padding: 40px 24px;
                gap: 20px;
            ">
                <div style="font-size: 64px;">🌙</div>
                <div style="
                    font-size: 28px;
                    font-weight: 700;
                    color: #10b981;
                    font-family: 'Scheherazade New', serif;
                ">نور</div>
                <div style="
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-top: 8px;
                ">Приложение доступно только в Telegram</div>
                <div style="
                    font-size: 14px;
                    color: #a0a0a0;
                    line-height: 1.6;
                    max-width: 280px;
                ">Откройте приложение через бота в Telegram, чтобы продолжить</div>
                <a href="https://t.me/noor_umra_bot" style="
                    margin-top: 12px;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 600;
                ">Открыть в Telegram</div>
            </div>
        `;
        return;
    }
})();

// ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP =====
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

tg.setHeaderColor('#0f0f0f');
tg.setBackgroundColor('#0f0f0f');

// ===== ЕДИНЫЙ ИСТОЧНИК ДАННЫХ =====
// Все данные хранятся по ключам "ramadan_day_1" ... "ramadan_day_30"
// Сегодня = текущий день месяца (используется как номер дня Рамадана)

function getTodayDayNumber() {
    return Math.min(new Date().getDate(), 30);
}

function getDayKey(dayNumber) {
    return `ramadan_day_${dayNumber}`;
}

function isDayCompleted(dayNumber) {
    return localStorage.getItem(getDayKey(dayNumber)) === 'true';
}

function setDayCompleted(dayNumber, value) {
    if (value) {
        localStorage.setItem(getDayKey(dayNumber), 'true');
    } else {
        localStorage.removeItem(getDayKey(dayNumber));
    }
}

function getAllCompletedDays() {
    const completed = [];
    for (let i = 1; i <= 30; i++) {
        if (isDayCompleted(i)) completed.push(i);
    }
    return completed;
}

// Streak = последовательные дни, заканчивающиеся сегодняшним днём
function calculateStreak() {
    const today = getTodayDayNumber();
    let streak = 0;
    for (let i = today; i >= 1; i--) {
        if (isDayCompleted(i)) {
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

// ===== НАВИГАЦИЯ =====
const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');

function switchScreen(screenId) {
    screens.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    const activeNav = document.querySelector(`[data-screen="${screenId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Обновить данные при переходе
    if (screenId === 'calendar-screen') renderCalendar();
    if (screenId === 'home-screen') refreshHomeScreen();
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const screenId = item.getAttribute('data-screen');
        switchScreen(screenId);
        tg.HapticFeedback.impactOccurred('light');
    });
});

// ===== ЭКРАН 1: ГЛАВНАЯ =====

function refreshHomeScreen() {
    loadFastingButton();
    updateStreak();
    updateProgress();
    updateAchievements();
    showShareButton();
}

// --- Счётчик Уммы ---
function updateUmmahCounter() {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('lastUmmahVisit');
    let ummahCount = parseInt(localStorage.getItem('ummahCount') || '12847');

    if (lastVisit !== todayStr) {
        ummahCount += 1;
        localStorage.setItem('ummahCount', String(ummahCount));
        localStorage.setItem('lastUmmahVisit', todayStr);
    }

    animateCounter('ummah-count', ummahCount);
}

function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const increment = target / (1200 / 16);
    let current = 0;
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

// --- Аят дня ---
function loadDailyAyat() {
    const ayatIndex = new Date().getDate() % 30;
    const ayat = ayatData[ayatIndex];
    document.getElementById('ayat-arabic').textContent = ayat.arabic;
    document.getElementById('ayat-translation').textContent = ayat.translation;
    document.getElementById('ayat-reference').textContent = `Сура ${ayat.surah}, Аят ${ayat.ayah}`;
}

// --- Таймер до ифтара ---
function updateIftarTimer() {
    const now = new Date();
    const iftarTime = new Date();
    const [h, m] = prayerTimes.maghrib.split(':');
    iftarTime.setHours(parseInt(h), parseInt(m), 0, 0);

    const timerEl = document.getElementById('iftar-timer');
    const msgEl = document.getElementById('iftar-message');

    if (now >= iftarTime) {
        timerEl.textContent = '00:00:00';
        msgEl.textContent = 'Ифтар начался 🌙';
        msgEl.style.color = 'var(--accent-primary)';
        return;
    }

    const diff = iftarTime - now;
    const hh = Math.floor(diff / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    timerEl.textContent = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    msgEl.textContent = 'осталось';
}

// --- Кнопка поста (состояние) ---
function loadFastingButton() {
    const today = getTodayDayNumber();
    const button = document.getElementById('fasting-button');

    if (isDayCompleted(today)) {
        button.classList.add('completed');
        button.querySelector('.button-text').textContent = 'Сегодня отмечено ✔';
    } else {
        button.classList.remove('completed');
        button.querySelector('.button-text').textContent = 'Я держал пост сегодня';
    }
}

// --- Streak ---
function updateStreak() {
    const streak = calculateStreak();
    const el = document.getElementById('fasting-streak');
    if (streak > 0) {
        el.textContent = `Вы держите пост ${streak} ${getDaysWord(streak)} подряд`;
        el.classList.add('visible');
    } else {
        el.textContent = '';
        el.classList.remove('visible');
    }
}

// --- Клик по кнопке поста ---
document.getElementById('fasting-button').addEventListener('click', () => {
    const today = getTodayDayNumber();

    if (isDayCompleted(today)) {
        tg.showAlert('Вы уже отметили пост сегодня');
        return;
    }

    setDayCompleted(today, true);
    tg.HapticFeedback.notificationOccurred('success');

    // Обновить главную
    loadFastingButton();
    updateStreak();
    updateProgress();
    updateAchievements();
    showShareButton();

    // Синхронизировать календарь (если уже отрисован)
    renderCalendar();
});

// --- Прогресс Рамадана ---
function updateProgress() {
    const completed = getAllCompletedDays().length;
    const percentage = Math.round((completed / 30) * 100);

    document.getElementById('progress-completed').textContent = completed;
    document.getElementById('progress-percentage').textContent = `${percentage}%`;

    setTimeout(() => {
        document.getElementById('progress-bar').style.width = `${percentage}%`;
    }, 100);
}

// --- Достижения ---
function updateAchievements() {
    const streak = calculateStreak();
    const milestones = [3, 7, 15, 30];

    document.querySelectorAll('.achievement-badge').forEach((badge, index) => {
        if (streak >= milestones[index]) {
            badge.classList.remove('locked');
            badge.classList.add('unlocked');
        } else {
            badge.classList.remove('unlocked');
            badge.classList.add('locked');
        }
    });
}

// --- Кнопка "Поделиться" ---
function showShareButton() {
    const today = getTodayDayNumber();
    const shareButton = document.getElementById('share-button');
    if (isDayCompleted(today)) {
        shareButton.classList.remove('hidden');
    } else {
        shareButton.classList.add('hidden');
    }
}

document.getElementById('share-button').addEventListener('click', () => {
    const streak = calculateStreak();
    const appUrl = 'https://t.me/noor_umra_bot/Noor';
    const text = `Я соблюдаю пост уже ${streak} ${getDaysWord(streak)} подряд 🌙 Присоединяйся к Noor Ramadan`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`;
    tg.openTelegramLink(shareUrl);
    tg.HapticFeedback.impactOccurred('medium');
});

// ===== ЭКРАН 2: КАЛЕНДАРЬ =====

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const today = getTodayDayNumber();

    // Если клетки ещё не созданы — создаём
    if (grid.children.length !== 30) {
        grid.innerHTML = '';
        for (let i = 1; i <= 30; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day';
            el.dataset.dayNumber = String(i);
            el.textContent = i;

            if (i === today) el.classList.add('today');

            el.addEventListener('click', () => toggleCalendarDay(i));
            grid.appendChild(el);
        }
    }

    // Синхронизируем состояние каждой клетки
    for (let i = 1; i <= 30; i++) {
        const el = grid.querySelector(`[data-day-number="${i}"]`);
        if (!el) continue;
        if (isDayCompleted(i)) {
            el.classList.add('completed');
        } else {
            el.classList.remove('completed');
        }
    }

    updateCalendarStats();
}

function toggleCalendarDay(dayNumber) {
    const wasCompleted = isDayCompleted(dayNumber);
    setDayCompleted(dayNumber, !wasCompleted);

    // Обновить клетку
    const el = document.querySelector(`[data-day-number="${dayNumber}"]`);
    if (el) {
        el.classList.toggle('completed', !wasCompleted);
    }

    tg.HapticFeedback.impactOccurred(wasCompleted ? 'light' : 'medium');

    updateCalendarStats();

    // Синхронизировать главный экран
    loadFastingButton();
    updateStreak();
    updateProgress();
    updateAchievements();
    showShareButton();
}

function updateCalendarStats() {
    document.getElementById('calendar-stats').textContent = getAllCompletedDays().length;
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
    const currentMins = now.getHours() * 60 + now.getMinutes();
    let nextKey = null;
    let minDiff = Infinity;
    let nextPrayerMins = 0;

    Object.keys(prayerTimes).forEach(key => {
        const [hh, mm] = prayerTimes[key].split(':');
        const pMins = parseInt(hh) * 60 + parseInt(mm);
        let diff = pMins - currentMins;
        if (diff < 0) diff += 1440;
        if (diff < minDiff) {
            minDiff = diff;
            nextKey = key;
            nextPrayerMins = pMins;
        }
    });

    if (nextKey) {
        document.getElementById('next-prayer-name').textContent = prayerNames[nextKey];
        document.querySelectorAll('.prayer-item').forEach(item => {
            item.classList.toggle('active', item.dataset.prayer === nextKey);
        });
        updatePrayerCountdown(nextPrayerMins);
    }
}

function updatePrayerCountdown(prayerMins) {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    let diff = prayerMins - currentMins;
    if (diff < 0) diff += 1440;

    const hh = Math.floor(diff / 60);
    const mm = diff % 60;
    const ss = 59 - now.getSeconds();

    document.getElementById('next-prayer-countdown').textContent =
        `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

function init() {
    updateUmmahCounter();
    loadDailyAyat();
    loadFastingButton();
    updateStreak();
    updateProgress();
    updateAchievements();
    showShareButton();
    updateIftarTimer();
    setInterval(updateIftarTimer, 1000);

    renderCalendar();

    initPrayerTimes();
    setInterval(updateNextPrayer, 60000);
    setInterval(() => {
        const nextName = document.getElementById('next-prayer-name').textContent;
        const key = Object.keys(prayerNames).find(k => prayerNames[k] === nextName);
        if (key) {
            const [hh, mm] = prayerTimes[key].split(':');
            updatePrayerCountdown(parseInt(hh) * 60 + parseInt(mm));
        }
    }, 1000);
}

init();

tg.MainButton.text = 'Готово';
tg.MainButton.hide();
