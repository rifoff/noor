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
                <a href="https://t.me/YOUR_BOT_NAME" style="
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

// ===== ИНИЦИАЛИЗАЦИЯ ЯЗЫКА =====
let currentLang = getSavedLanguage();
applyTranslations(currentLang);

// Обработчик переключения языка
document.getElementById('language-button').addEventListener('click', () => {
    const dropdown = document.getElementById('language-dropdown');
    dropdown.classList.toggle('hidden');
    tg.HapticFeedback.impactOccurred('light');
});

document.querySelectorAll('.language-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        currentLang = lang;
        applyTranslations(lang);
        
        // Обновить текст кнопки
        document.getElementById('current-language').textContent = languageConfig[lang].short;
        
        // Закрыть dropdown
        document.getElementById('language-dropdown').classList.add('hidden');
        
        // Обновить динамические тексты
        updateStreak();
        updateIftarTimer();
        initPrayerTimes(); // Обновить названия намазов
        
        tg.HapticFeedback.notificationOccurred('success');
    });
});

// Закрыть dropdown при клике вне
document.addEventListener('click', (e) => {
    const selector = document.querySelector('.language-selector');
    if (selector && !selector.contains(e.target)) {
        document.getElementById('language-dropdown').classList.add('hidden');
    }
});

// ===== ЕДИНЫЙ ИСТОЧНИК ДАННЫХ =====
// Дата начала Рамадана 2026
const RAMADAN_START = new Date('2026-02-18');
const RAMADAN_DAYS = 30;

// Получить день Рамадана от 1 до 30 на основе текущей даты
function getTodayDayNumber() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(RAMADAN_START);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Если до начала Рамадана - вернуть 1
    if (diffDays < 1) return 1;
    // Если после окончания - вернуть 30
    if (diffDays > RAMADAN_DAYS) return RAMADAN_DAYS;
    
    return diffDays;
}

// Получить реальную дату для дня Рамадана
function getDateForRamadanDay(dayNumber) {
    const date = new Date(RAMADAN_START);
    date.setDate(date.getDate() + (dayNumber - 1));
    return date.toISOString().split('T')[0];
}

// Получить день Рамадана по реальной дате
function getRamadanDayFromDate(dateString) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    const start = new Date(RAMADAN_START);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = date - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays < 1 || diffDays > RAMADAN_DAYS) return null;
    return diffDays;
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
    for (let i = 1; i <= RAMADAN_DAYS; i++) {
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
    return getDaysWord(count, currentLang);
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
        msgEl.textContent = t('iftar-started');
        msgEl.style.color = 'var(--accent-primary)';
        return;
    }

    const diff = iftarTime - now;
    const hh = Math.floor(diff / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    timerEl.textContent = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    msgEl.textContent = t('iftar-remaining');
}

// --- Кнопка поста (состояние) ---
function loadFastingButton() {
    const today = getTodayDayNumber();
    const button = document.getElementById('fasting-button');

    if (isDayCompleted(today)) {
        button.classList.add('completed');
        button.querySelector('.button-text').textContent = t('fasting-completed');
    } else {
        button.classList.remove('completed');
        button.querySelector('.button-text').textContent = t('fasting-button');
    }
}

// --- Streak ---
function updateStreak() {
    const streak = calculateStreak();
    const el = document.getElementById('fasting-streak');
    if (streak > 0) {
        el.textContent = t('streak-text', {
            count: streak,
            days: getDaysWord(streak)
        });
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
    const appUrl = 'https://t.me/YOUR_BOT_NAME/noor';
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
    if (grid.children.length !== RAMADAN_DAYS) {
        grid.innerHTML = '';
        for (let i = 1; i <= RAMADAN_DAYS; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day';
            el.dataset.dayNumber = String(i);
            
            // Создаём контейнер для номера дня
            const dayNum = document.createElement('div');
            dayNum.className = 'calendar-day-number';
            dayNum.textContent = i;
            
            // Создаём элемент для реальной даты
            const realDate = getDateForRamadanDay(i);
            const dateObj = new Date(realDate);
            const dateText = document.createElement('div');
            dateText.className = 'calendar-day-date';
            dateText.textContent = `${dateObj.getDate()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
            
            el.appendChild(dayNum);
            el.appendChild(dateText);

            if (i === today) el.classList.add('today');

            el.addEventListener('click', () => toggleCalendarDay(i));
            grid.appendChild(el);
        }
    }

    // Синхронизируем состояние каждой клетки
    for (let i = 1; i <= RAMADAN_DAYS; i++) {
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
        name.textContent = getPrayerName(key);

        const time = document.createElement('div');
        time.className = 'prayer-time';
        time.textContent = prayerTimes[key];

        item.appendChild(name);
        item.appendChild(time);
        list.appendChild(item);
    });

    updateNextPrayer();
    updateLocationInfo();
}

// Обновить информацию о локации
function updateLocationInfo() {
    const locationText = document.getElementById('location-text');
    if (!locationText) return;
    
    const saved = localStorage.getItem('prayer_times');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.location && data.location.city) {
            locationText.textContent = data.location.city;
        } else {
            locationText.textContent = 'Локация по умолчанию';
        }
    }
}

// Обработчик кнопки изменения города
if (document.getElementById('location-change')) {
    document.getElementById('location-change').addEventListener('click', () => {
        const selector = document.getElementById('city-selector');
        const cityList = document.getElementById('city-list');
        
        // Заполнить список городов только один раз
        if (cityList && cityList.children.length === 0) {
            popularCities.forEach(city => {
                const btn = document.createElement('button');
                btn.className = 'city-option';
                btn.textContent = city.name;
                btn.onclick = async () => {
                    // Сохранить выбранный город
                    const location = {
                        latitude: city.lat,
                        longitude: city.lon,
                        city: city.name
                    };
                    localStorage.setItem('user_location', JSON.stringify(location));
                    
                    // Показать индикатор загрузки
                    const locationText = document.getElementById('location-text');
                    if (locationText) locationText.textContent = 'Загрузка...';
                    
                    // Закрыть селектор сразу
                    if (selector) selector.classList.add('hidden');
                    
                    // Обновить времена намаза
                    await fetchPrayerTimes();
                    initPrayerTimes();
                    
                    tg.HapticFeedback.notificationOccurred('success');
                };
                cityList.appendChild(btn);
            });
        }
        
        // Переключить видимость селектора
        if (selector) {
            selector.classList.toggle('hidden');
            tg.HapticFeedback.impactOccurred('light');
        }
    });
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
        document.getElementById('next-prayer-name').textContent = getPrayerName(nextKey);
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

async function init() {
    // Загрузить времена намаза перед инициализацией
    await ensurePrayerTimes();
    
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
    
    // Обновление countdown каждую секунду - берём активный намаз из dataset
    setInterval(() => {
        const activeItem = document.querySelector('.prayer-item.active');
        if (activeItem) {
            const key = activeItem.dataset.prayer;
            const [hh, mm] = prayerTimes[key].split(':');
            updatePrayerCountdown(parseInt(hh) * 60 + parseInt(mm));
        }
    }, 1000);
    
    // Обновлять времена намаза каждый день в полночь
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow - now;
    
    setTimeout(async () => {
        await fetchPrayerTimes();
        initPrayerTimes();
        // Повторять каждые 24 часа
        setInterval(async () => {
            await fetchPrayerTimes();
            initPrayerTimes();
        }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
}

init();

tg.MainButton.text = 'Готово';
tg.MainButton.hide();
