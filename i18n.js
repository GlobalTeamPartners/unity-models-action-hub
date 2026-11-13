(function () {
    const STORAGE_KEY = 'unity_hub_lang';

    const COMMON = {
        ru: {
            brand_name: 'Unity Models × Global Plus',
            back_hub: '← Главный Хаб Действий',
            live_en: '🌐 Платформа EN',
            live_ru: '🌐 Платформа RU',
            bot_btn: '🤖 @unitymodelsbot',
            footer_copy: '© 2026 Unity Models × Глобал Плюс (Global Team Partners). Международный штаб развития, PR и координации представителей.',
            footer_sub: 'Глобальные коридоры экспансии: Москва • Санкт-Петербург • Стамбул • Шанхай • Сеул • Токио • Бангкок • Дубай • Париж • Милан.',
            copy_idle: '📋 Скопировать',
            copy_done: '✅ Скопировано!'
        },
        en: {
            brand_name: 'Unity Models × Global Plus',
            back_hub: '← Main Action Hub',
            live_en: '🌐 Platform EN',
            live_ru: '🌐 Platform RU',
            bot_btn: '🤖 @unitymodelsbot',
            footer_copy: '© 2026 Unity Models × Global Plus (Global Team Partners). International Expansion, PR & Representative Operations HQ.',
            footer_sub: 'Global Placement Corridors: Moscow • St. Petersburg • Istanbul • Shanghai • Seoul • Tokyo • Bangkok • Dubai • Paris • Milan.',
            copy_idle: '📋 Copy Text',
            copy_done: '✅ Copied!'
        }
    };

    let pageDict = { ru: {}, en: {} };
    let onChangeCallbacks = [];

    function detectInitialLang() {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');
        if (urlLang === 'en' || urlLang === 'ru') {
            localStorage.setItem(STORAGE_KEY, urlLang);
            return urlLang;
        }
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'ru') {
            return saved;
        }
        return 'ru';
    }

    let currentLang = detectInitialLang();

    function mergeDict(lang) {
        return Object.assign({}, COMMON[lang] || {}, pageDict[lang] || {});
    }

    function updateLinksWithLang(lang) {
        document.querySelectorAll('a[href]').forEach((a) => {
            const raw = a.getAttribute('href');
            if (!raw || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('#') || raw.startsWith('tel:')) {
                return;
            }
            const parts = raw.split('#');
            const baseAndQuery = parts[0].split('?');
            const file = baseAndQuery[0];
            if (!file.endsWith('.html')) return;
            const params = new URLSearchParams(baseAndQuery[1] || '');
            params.set('lang', lang);
            const nextHref = file + '?' + params.toString() + (parts[1] ? '#' + parts[1] : '');
            a.setAttribute('href', nextHref);
        });
    }

    function applyTranslations() {
        const dict = mergeDict(currentLang);
        document.documentElement.lang = currentLang;

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) el.textContent = dict[key];
        });

        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            if (dict[key] !== undefined) el.innerHTML = dict[key];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
        });

        document.querySelectorAll('.lang-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });

        updateLinksWithLang(currentLang);

        onChangeCallbacks.forEach((cb) => {
            try { cb(currentLang, dict); } catch (e) { console.error(e); }
        });
    }

    function setLang(lang) {
        if (lang !== 'ru' && lang !== 'en') return;
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url.toString());
        applyTranslations();
    }

    function copyText(elementId, btn) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const text = el.innerText.trim();
        const dict = mergeDict(currentLang);
        navigator.clipboard.writeText(text).then(() => {
            btn.textContent = dict.copy_done;
            btn.style.background = 'var(--emerald)';
            btn.style.color = '#000';
            setTimeout(() => {
                btn.textContent = dict.copy_idle;
                btn.style.background = '';
                btn.style.color = '';
            }, 1800);
        });
    }

    window.HubI18n = {
        init(customDict) {
            if (customDict) pageDict = customDict;
            applyTranslations();
        },
        getLang() { return currentLang; },
        setLang,
        t(key) {
            const dict = mergeDict(currentLang);
            return dict[key] !== undefined ? dict[key] : key;
        },
        onChange(cb) {
            onChangeCallbacks.push(cb);
        },
        copyText
    };
})();
