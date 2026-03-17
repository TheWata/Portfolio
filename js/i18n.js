 (function () {
    const STORAGE_KEY = 'portfolioLanguage';

    const translations = {
        pt: {
            'nav.programming': 'Programação',
            'nav.data': 'Dados',
            'nav.games': 'Games',
            'nav.recruitment': 'Modo Recrutamento',

            'index.wip': '< Portfólio em desenvolvimento >',
            'index.subtitle': 'Desenvolvedor, Analista de Dados e Gamer',
            'index.statusLabel': 'STATUS ATUAL:',
            'index.statusValue': 'FOCADO EM: ANÁLISE DE DADOS & POWER BI',
            'index.description': 'Desenvolvendo soluções complexas através de código, dados e interatividade.',
            'index.about': 'SOBRE MIM >',
            'index.themeProgramming': 'Programação',
            'index.themeProgrammingDesc': 'Desenvolvimento de aplicações multiplataforma com foco em alta performance, design limpo e interfaces intuitivas.',
            'index.themeProgrammingLink': 'Explorar Código >',
            'index.themeData': 'Análise de Dados',
            'index.themeDataDesc': 'Transformação de dados brutos em insights estratégicos usando BI, análise preditiva e visualização de dados.',
            'index.themeDataLink': 'Ver Análises >',
            'index.themeGames': 'Games',
            'index.themeGamesDesc': 'Criação de experiências interativas e protótipos de jogos com foco em mecânicas e design lúdico.',
            'index.themeGamesLink': 'Jogar Demos >',
            'index.footer': 'SYSTEM.OFF // © 2024',

            'about.title': 'SOBRE MIM',
            'about.subtitle': 'Analista de Dados & Desenvolvedor Full Stack',
            'about.p1': 'Aos 21 anos, atuo na intersecção entre a inteligência de negócios e o desenvolvimento de sistemas.',
            'about.p2': 'Como Analista de Dados, domino o ecossistema de BI (Excel Avançado, Power Query e DAX), transformando bases complexas em dashboards estratégicos.',
            'about.p3': 'Como desenvolvedor, foco em arquitetura robusta com C#, .NET e SQL Server, expandindo fronteiras para o desenvolvimento mobile com MAUI e a criação de jogos independentes (Indie Dev).',
            'about.p4': 'Sou movido pela eficiência técnica e pela resolução de problemas com foco em custo-benefício.',
            'about.tooltipTitle': 'Skill Tree',
            'about.tooltipHint': '// Selecione uma habilidade',
            'about.tooltipDesc': 'Explore minhas competências técnicas e criativas.',
            'about.recruitClose': 'Fechar Contrato',
            'about.recruitHintTitle': 'MODO CONTRATAÇÃO',
            'about.recruitHintDesc': 'Clique nos nós para adicionar ao orçamento.',
            'about.recruit.title': 'MODO CONTRATAÇÃO',
            'about.recruit.subtitle': 'Como montar sua build ideal de contratação',
            'about.recruit.p1': 'Ative o modo recrutamento para transformar a skill tree em uma seleção prática de competências para o projeto.',
            'about.recruit.p2': 'Clique nos nós da árvore para adicionar ou remover habilidades do escopo. Cada habilidade impacta o investimento total.',
            'about.recruit.p3': 'Use os presets para começar rápido com perfis prontos e depois ajuste manualmente para o cenário da sua vaga.',
            'about.recruit.p4': 'Ao finalizar, gere a proposta para obter um resumo claro com objetivo, stack escolhida e estimativa de investimento.',

            'data.placeholderTitle': 'Selecione uma análise para ver os detalhes',
            'data.placeholderDesc': 'Navegue pela lista ao lado.',
            'data.docs': 'Ver Documentação',

            'dev.placeholderTitle': 'Selecione um projeto para ver os detalhes',
            'dev.placeholderDesc': 'Navegue pela lista ao lado.',
            'dev.github': 'Ver no GitHub',

            'project.inDev': 'Em desenvolvimento',

            'games.title': 'Game Dev',
            'games.empty': 'Ainda não há nada aqui.',
            'games.wip': '// Projetos em desenvolvimento...'
        },
        en: {
            'nav.programming': 'Programming',
            'nav.data': 'Data',
            'nav.games': 'Games',
            'nav.recruitment': 'Recruitment Mode',

            'index.wip': '< Portfolio in progress >',
            'index.subtitle': 'Developer, Data Analyst and Gamer',
            'index.statusLabel': 'CURRENT STATUS:',
            'index.statusValue': 'FOCUSED ON: DATA ANALYTICS & POWER BI',
            'index.description': 'Building complex solutions through code, data and interactivity.',
            'index.about': 'ABOUT ME >',
            'index.themeProgramming': 'Programming',
            'index.themeProgrammingDesc': 'Cross-platform application development focused on high performance, clean design and intuitive interfaces.',
            'index.themeProgrammingLink': 'Explore Code >',
            'index.themeData': 'Data Analysis',
            'index.themeDataDesc': 'Turning raw data into strategic insights using BI, predictive analysis and data visualization.',
            'index.themeDataLink': 'View Analyses >',
            'index.themeGames': 'Games',
            'index.themeGamesDesc': 'Creating interactive experiences and game prototypes focused on mechanics and playful design.',
            'index.themeGamesLink': 'Play Demos >',
            'index.footer': 'SYSTEM.OFF // © 2024',

            'about.title': 'ABOUT ME',
            'about.subtitle': 'Data Analyst & Full Stack Developer',
            'about.p1': 'At 21, I work at the intersection of business intelligence and software development.',
            'about.p2': 'As a Data Analyst, I master the BI ecosystem (Advanced Excel, Power Query and DAX), turning complex datasets into strategic dashboards.',
            'about.p3': 'As a developer, I focus on robust architecture with C#, .NET and SQL Server, expanding into mobile development with MAUI and indie game creation.',
            'about.p4': 'I am driven by technical efficiency and problem-solving with a cost-benefit mindset.',
            'about.tooltipTitle': 'Skill Tree',
            'about.tooltipHint': '// Select a skill',
            'about.tooltipDesc': 'Explore my technical and creative skills.',
            'about.recruitClose': 'Close Hiring',
            'about.recruitHintTitle': 'HIRING MODE',
            'about.recruitHintDesc': 'Click nodes to add them to the budget.',
            'about.recruit.title': 'HIRING MODE',
            'about.recruit.subtitle': 'How to build your ideal hiring stack',
            'about.recruit.p1': 'Enable recruitment mode to turn the skill tree into a practical selection of competencies for your project.',
            'about.recruit.p2': 'Click tree nodes to add or remove skills from scope. Each skill impacts the total investment.',
            'about.recruit.p3': 'Use presets to start quickly with ready-made profiles, then fine-tune manually for your role scenario.',
            'about.recruit.p4': 'At the end, generate a proposal to get a clear summary with goal, selected stack and estimated investment.',

            'data.placeholderTitle': 'Select an analysis to view details',
            'data.placeholderDesc': 'Browse the list on the right.',
            'data.docs': 'View Documentation',

            'dev.placeholderTitle': 'Select a project to view details',
            'dev.placeholderDesc': 'Browse the list on the right.',
            'dev.github': 'View on GitHub',

            'project.inDev': 'In development',

            'games.title': 'Game Dev',
            'games.empty': 'There is nothing here yet.',
            'games.wip': '// Projects in development...'
        }
    };

    function normalizeLanguage(lang) {
        if (!lang) return 'pt';
        return lang.toLowerCase().startsWith('en') ? 'en' : 'pt';
    }

    function getSavedLanguage() {
        return normalizeLanguage(localStorage.getItem(STORAGE_KEY) || document.documentElement.lang || 'pt');
    }

    function setSavedLanguage(lang) {
        localStorage.setItem(STORAGE_KEY, normalizeLanguage(lang));
    }

    function t(key, lang) {
        const activeLang = normalizeLanguage(lang || getSavedLanguage());
        return translations[activeLang]?.[key] ?? translations.pt?.[key] ?? key;
    }

    function applyTranslations(lang) {
        const activeLang = normalizeLanguage(lang);
        document.documentElement.lang = activeLang === 'en' ? 'en' : 'pt-br';

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.getAttribute('data-i18n');
            const value = t(key, activeLang);
            element.textContent = value;
        });

        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.textContent = activeLang === 'pt' ? 'EN' : 'PT';
            langToggle.setAttribute('aria-label', activeLang === 'pt' ? 'Switch to English' : 'Mudar para português');
        }

        window.dispatchEvent(new CustomEvent('portfolio-language-changed', {
            detail: { lang: activeLang }
        }));
    }

    function setLanguage(lang) {
        const normalized = normalizeLanguage(lang);
        setSavedLanguage(normalized);
        applyTranslations(normalized);
    }

    function toggleLanguage() {
        const current = getSavedLanguage();
        setLanguage(current === 'pt' ? 'en' : 'pt');
    }

    window.PortfolioI18n = {
        t,
        setLanguage,
        getLanguage: getSavedLanguage
    };

    document.addEventListener('DOMContentLoaded', () => {
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', toggleLanguage);
        }

        applyTranslations(getSavedLanguage());
    });
})();
