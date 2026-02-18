// Переводы для 3 языков
const translations = {
    ru: {
        // Главная
        'ummah-label': 'Сегодня пост соблюдают',
        'ayat-title': 'Аят дня',
        'iftar-title': 'До ифтара',
        'iftar-remaining': 'осталось',
        'iftar-started': 'Ифтар начался 🌙',
        'progress-title': 'Ваш прогресс Рамадана',
        'progress-days': '30 дней',
        'achievements-title': 'Ваши достижения',
        'badge-3': '3 дня',
        'badge-7': '7 дней',
        'badge-15': '15 дней',
        'badge-30': 'Рамадан',
        'fasting-button': 'Я держал пост сегодня',
        'fasting-completed': 'Сегодня отмечено ✔',
        'share-button': 'Поделиться прогрессом',
        'streak-text': 'Вы держите пост {count} {days} подряд',
        'days-1': 'день',
        'days-2': 'дня',
        'days-many': 'дней',
        
        // Календарь
        'calendar-title': 'Календарь Рамадана',
        'calendar-total': 'Всего соблюдено дней',
        
        // Намаз
        'prayer-title': 'Время намаза',
        'next-prayer': 'Следующий намаз',
        
        // Навигация
        'nav-home': 'Главная',
        'nav-calendar': 'Календарь',
        'nav-prayer': 'Намаз'
    },
    
    en: {
        // Home
        'ummah-label': 'Fasting today',
        'ayat-title': 'Verse of the Day',
        'iftar-title': 'Until Iftar',
        'iftar-remaining': 'remaining',
        'iftar-started': 'Iftar has begun 🌙',
        'progress-title': 'Your Ramadan Progress',
        'progress-days': '30 days',
        'achievements-title': 'Your Achievements',
        'badge-3': '3 days',
        'badge-7': '7 days',
        'badge-15': '15 days',
        'badge-30': 'Ramadan',
        'fasting-button': 'I fasted today',
        'fasting-completed': 'Marked for today ✔',
        'share-button': 'Share progress',
        'streak-text': 'You are fasting for {count} {days} in a row',
        'days-1': 'day',
        'days-2': 'days',
        'days-many': 'days',
        
        // Calendar
        'calendar-title': 'Ramadan Calendar',
        'calendar-total': 'Total days completed',
        
        // Prayer
        'prayer-title': 'Prayer Times',
        'next-prayer': 'Next Prayer',
        
        // Navigation
        'nav-home': 'Home',
        'nav-calendar': 'Calendar',
        'nav-prayer': 'Prayer'
    },
    
    ar: {
        // الرئيسية
        'ummah-label': 'الصائمون اليوم',
        'ayat-title': 'آية اليوم',
        'iftar-title': 'حتى الإفطار',
        'iftar-remaining': 'متبقي',
        'iftar-started': 'بدأ الإفطار 🌙',
        'progress-title': 'تقدمك في رمضان',
        'progress-days': '٣٠ يوماً',
        'achievements-title': 'إنجازاتك',
        'badge-3': '٣ أيام',
        'badge-7': '٧ أيام',
        'badge-15': '١٥ يوماً',
        'badge-30': 'رمضان',
        'fasting-button': 'صمت اليوم',
        'fasting-completed': 'تم التسجيل اليوم ✔',
        'share-button': 'مشاركة التقدم',
        'streak-text': 'أنت تصوم {count} {days} متتالية',
        'days-1': 'يوم',
        'days-2': 'أيام',
        'days-many': 'يوماً',
        
        // التقويم
        'calendar-title': 'تقويم رمضان',
        'calendar-total': 'إجمالي الأيام المكتملة',
        
        // الصلاة
        'prayer-title': 'أوقات الصلاة',
        'next-prayer': 'الصلاة القادمة',
        
        // التنقل
        'nav-home': 'الرئيسية',
        'nav-calendar': 'التقويم',
        'nav-prayer': 'الصلاة'
    }
};

// Языковые настройки
const languageConfig = {
    ru: { code: 'ru', name: 'Русский', flag: '🇷🇺', short: 'РУ', dir: 'ltr' },
    en: { code: 'en', name: 'English', flag: '🇬🇧', short: 'EN', dir: 'ltr' },
    ar: { code: 'ar', name: 'العربية', flag: '🇸🇦', short: 'ع', dir: 'rtl' }
};

// Получить сохранённый язык или язык Telegram
function getSavedLanguage() {
    const saved = localStorage.getItem('app_language');
    if (saved && translations[saved]) return saved;
    
    // Определить язык из Telegram
    const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || 'en';
    if (tgLang.startsWith('ru')) return 'ru';
    if (tgLang.startsWith('ar')) return 'ar';
    return 'en';
}

// Применить переводы
function applyTranslations(lang) {
    const texts = translations[lang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (texts[key]) {
            el.textContent = texts[key];
        }
    });
    
    // Направление текста
    document.documentElement.setAttribute('dir', languageConfig[lang].dir);
    document.documentElement.setAttribute('lang', lang);
    
    // Сохранить выбор
    localStorage.setItem('app_language', lang);
}

// Получить перевод по ключу
function t(key, replacements = {}) {
    const lang = getSavedLanguage();
    let text = translations[lang][key] || translations['en'][key] || key;
    
    // Заменить плейсхолдеры
    Object.keys(replacements).forEach(placeholder => {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    
    return text;
}

// Функция для склонения "дней" в зависимости от языка
function getDaysWord(count, lang) {
    if (lang === 'en') return count === 1 ? t('days-1') : t('days-2');
    if (lang === 'ar') return t('days-many');
    
    // Русский
    if (count % 10 === 1 && count % 100 !== 11) return t('days-1');
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return t('days-2');
    return t('days-many');
}
