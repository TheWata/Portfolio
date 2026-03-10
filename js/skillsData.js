export const skillsData = [
    { id: 'root', label: 'Eu', x: 50, y: 50, status: 'dev', icon: 'user', desc: 'Analista de Dados & Desenvolvedor Full Stack.' },

    // Dados
    { id: 'data_root', label: 'Data Analyst', x: 25, y: 35, status: 'mastered', parent: 'root', icon: 'bar-chart-3', desc: 'Especialista em BI e modelagem.' },
    { id: 'excel', label: 'Excel', x: 15, y: 35, status: 'mastered', parent: 'data_root', icon: 'table', desc: 'Power Pivot, Power Query e automação avançada.' },
    { id: 'pbi', label: 'Power BI', x: 25, y: 15, status: 'mastered', parent: 'data_root', icon: 'pie-chart', desc: 'Storytelling e Dashboards dinâmicos.' },
    { id: 'dax', label: 'DAX', x: 17, y: 20, status: 'mastered', parents: ['excel', 'pbi'], icon: 'variable', desc: 'Linguagem de fórmulas para análise de dados.' },
    { id: 'python', label: 'Python', x: 35, y: 15, status: 'developing', parent: 'data_root', icon: 'binary', desc: 'Aprendendo para automação e análise estatística.' },

    // Dev & Arquitetura
    { id: 'dev_root', label: 'Dev', x: 75, y: 35, status: 'mastered', parent: 'root', icon: 'code', desc: 'Desenvolvimento Full Stack e Mobile.' },
    { id: 'arch', label: 'Arquitetura', x: 75, y: 15, status: 'mastered', parent: 'dev_root', icon: 'component', desc: 'Padrões de projeto: MVC e MVVM.' },
    { id: 'web', label: 'Web (JS)', x: 80, y: 20, status: 'mastered', parent: 'dev_root', icon: 'globe', desc: 'Domínio de HTML5, CSS3 e JS Vanilla.' },
    
    // Backend & Cloud
    { id: 'backend', label: 'Back-end', x: 85, y: 35, status: 'mastered', parent: 'dev_root', icon: 'server', desc: 'Arquitetura ASP.NET Core e APIs.' },
    { id: 'java', label: 'Java', x: 95, y: 25, status: 'developing', parent: 'backend', icon: 'coffee', desc: 'Aprendendo fundamentos e POO.' },
    { id: 'docker', label: 'Docker', x: 95, y: 45, status: 'developing', parent: 'backend', icon: 'container', desc: 'Containerização e orquestração.' },

    // Mobile x: 55, y: 70,
    { id: 'mobile', label: 'Mobile', x: 65, y: 60, status: 'developing', parent: 'dev_root', icon: 'smartphone', desc: 'Desenvolvimento multiplataforma.' },
    { id: 'maui', label: 'MAUI',x: 70, y: 70, status: 'developing', parents: ['mobile', 'csharp'], icon: 'layers', desc: 'Apps nativos com .NET e XAML.' },
    { id: 'flutter', label: 'Flutter', x: 60, y: 70, status: 'developing', parent: 'mobile', icon: 'zap', desc: 'UI moderna com Dart.' },

    // Games
    { id: 'game_root', label: 'Game Dev', x: 35, y: 60, status: 'developing', parent: 'root', icon: 'gamepad-2', desc: 'Lógica indie e prototipagem.' },
    { id: 'unity', label: 'Unity', x: 45, y: 85, status: 'developing', parent: 'game_root', icon: 'box', desc: 'Criação de jogos independentes.' },
    { id: 'godot', label: 'Godot', x: 25, y: 80, status: 'developing', parent: 'game_root', icon: 'cpu', desc: 'Explorando GDScript e Nodes.' },

    // Intersecções centrais
    { id: 'sql', label: 'Bancos SQL', x: 50, y: 25, status: 'mastered', parents: ['data_root', 'dev_root'], icon: 'database', desc: 'SQL Server e PostgreSQL.' },
    { id: 'csharp', label: 'C#', x: 80, y: 85, status: 'mastered', parents: ['backend', 'unity'], icon: 'terminal', desc: 'Linguagem base para .NET e Unity.' },
    
    //databases
    { id: 'firebase', label: 'Firebase', x: 50, y: 7, status: 'developing', parent: 'sql', icon: 'flame', desc: 'Backend as a Service e Realtime Database.' },
    { id: 'postgresql', label: 'PostgreSQL', x: 57, y: 10, status: 'mastered', parent: 'sql', icon: 'database', desc: 'Banco de dados relacional avançado.' },   
    { id: 'sqlserver', label: 'SQL Server', x: 43, y: 10, status: 'mastered', parent: 'sql', icon: 'database', desc: 'Banco de dados relacional da Microsoft.' },

];