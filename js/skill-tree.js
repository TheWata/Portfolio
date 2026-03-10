// js/skill-tree.js

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('skill-tree-2d');
    if (!container) return;

    // 1. Importação Assíncrona
    let skillsData;
    try {
        const module = await import('./skillsData.js');
        skillsData = module.skillsData;
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
        return;
    }

    // 2. Setup de Camadas
    const treeLayer = document.createElement('div');
    treeLayer.classList.add('tree-layer');
    container.appendChild(treeLayer);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.classList.add('skill-lines-svg');
    treeLayer.appendChild(svg);

    const tooltip = {
        title: document.querySelector('.tooltip-title'),
        status: document.querySelector('.tooltip-status'),
        desc: document.querySelector('.tooltip-desc')
    };

    // 3. Sistema de Expansão e Renderização
    // REMOVIDO: expandedNodes e lógica de expandir. Agora mostra tudo.
    
    // Estado do Pan/Zoom
    let panState = { x: 0, y: 0, scale: 1 };
    let isDragging = false;
    let startX = 0, startY = 0;

    // Configuração do Container para Drag
    container.style.cursor = 'grab';
    container.style.overflow = 'hidden';

    // Desativar animações CSS conflitantes no layer
    treeLayer.style.animation = 'none';
    treeLayer.style.transition = 'none';

    // Estado de Expansão removido (botão não é mais necessário, se existir pode ser ocultado)
    const toggleBtn = document.getElementById('toggle-tree-btn');
    if (toggleBtn) toggleBtn.style.display = 'none';

    // Visualização: Mostrar todos os skills
    const getVisibleSkills = () => skillsData;

    const updateTransform = () => {
        treeLayer.style.transform = `translate(${panState.x}px, ${panState.y}px) scale(${panState.scale})`;
    };

    const renderTree = () => {
        // Limpar layer
        treeLayer.innerHTML = '';
        
        // Recriar SVG background
        const svg = document.createElementNS(svgNS, "svg");
        svg.classList.add('skill-lines-svg');
        treeLayer.appendChild(svg);

        const visibleSkills = getVisibleSkills();
        
        // Check cart visuals if available
        const currentCart = (window.getCart) ? new Set(window.getCart()) : new Set();
        const hiringActive = (window.isHiringMode) ? window.isHiringMode() : false;

        // Helper Cor por Categoria (Consistente com 3D)
        const getCategoryColor = (s) => {
            if (s.id === 'root') return '#2979ff'; // Root Blue (Custom CSS handles size, but color here ensures match)
            if (['data_root', 'excel', 'pbi', 'dax', 'python', 'sql', 'postgresql', 'sqlserver', 'firebase'].includes(s.id) || s.parent === 'data_root') return '#0aff60';
            if (['game_root', 'unity', 'godot'].includes(s.id) || s.parent === 'game_root') return '#bd00ff'; 
            return '#00f3ff'; // Dev defaults
        };

        // Desenhar Nós
        visibleSkills.forEach((skill, index) => {
            const node = document.createElement('div');
            // Apenas classe base, sem status de cor na borda
            node.classList.add('skill-node');
            
            // Aplicar cor da categoria na borda e glow suave
            const catColor = getCategoryColor(skill);
            node.style.borderColor = catColor;
            node.style.boxShadow = `0 0 10px ${catColor}40`; // 25% opacity hex roughly
            
            node.id = `node-${skill.id}`;

            // Posição estática (sem animação de expansão)
            node.style.left = `${skill.x}%`;
            node.style.top = `${skill.y}%`;
            node.style.opacity = '1';

            // Cart Highlight (2D)
            const hiringActive = (window.isHiringMode) ? window.isHiringMode() : false;
            
            if (currentCart.has(skill.id)) {
                node.style.borderColor = '#ffd700'; // Override category color
                node.style.boxShadow = '0 0 20px #ffd700';
                node.style.transform = 'translate(-50%, -50%) scale(1.2)';
                node.style.zIndex = '100';
            } else {
                 node.style.borderColor = catColor;
                 node.style.boxShadow = `0 0 10px ${catColor}40`;
                 node.style.transform = 'translate(-50%, -50%) scale(1)';
                 node.style.zIndex = 'auto';
            }

            // Indicador de Status (Check ou Bookmark)
            let indicatorHtml = '';
            // Se for root, ignora
            if (skill.id !== 'root') {
                if (skill.status === 'mastered') {
                    // Green Check
                     indicatorHtml = `<div class="node-indicator" style="border-color: #0aff60; color: #0aff60; background: rgba(10, 255, 96, 0.1);">
                        <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                     </div>`;
                } else {
                    // Yellow Bookmark
                    indicatorHtml = `<div class="node-indicator" style="border-color: #ffe600; color: #ffe600; background: rgba(255, 230, 0, 0.1);">
                        <i data-lucide="bookmark" style="width: 14px; height: 14px;"></i>
                    </div>`;
                }
            }

            node.innerHTML = `
                <div class="node-icon">
                    <i data-lucide="${skill.icon}" style="color: ${catColor};"></i>
                </div>
                <span class="node-label">${skill.label}</span>
                ${indicatorHtml}
            `;

            // Interaction
            let isClick = true;
            node.addEventListener('mousedown', () => isClick = true);
            node.addEventListener('mousemove', () => isClick = false);

            node.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isClick) return;

                // Check Hiring Mode via Global
                if (window.isHiringMode && window.isHiringMode()) {
                    if (window.toggleSkillCart) {
                        window.toggleSkillCart(skill.id);
                        // Visual update is handled by listener below
                    }
                } else {
                    // Normal interaction: just show tooltip? Or toggle (removed per request)?
                    // Just show tooltip/highlight
                }
            });

            node.addEventListener('mouseenter', () => {
                tooltip.title.textContent = skill.label;
                tooltip.status.textContent = skill.status === 'mastered' ? '// DOMINADO' : '// EVOLUINDO';
                tooltip.status.className = `tooltip-status ${skill.status === 'mastered' ? 'status-green' : 'status-yellow'}`;
                tooltip.desc.textContent = skill.desc;

                document.querySelectorAll('.skill-node, .connection-line').forEach(el => el.classList.remove('active'));
                node.classList.add('active');
                
                const parents = skill.parents || (skill.parent ? [skill.parent] : []);
                parents.forEach(pId => document.getElementById(`line-${pId}-${skill.id}`)?.classList.add('active'));
            });

            treeLayer.appendChild(node);
        });

        // Desenhar Linhas (Agora sempre visíveis, sem animação complexa)
        const currentVisibleIds = new Set(visibleSkills.map(s => s.id));
        visibleSkills.forEach(skill => {
            const parents = skill.parents || (skill.parent ? [skill.parent] : []);
            parents.forEach(pId => {
                if (currentVisibleIds.has(pId)) {
                    const parent = skillsData.find(s => s.id === pId);
                    if (parent) {
                        const line = document.createElementNS(svgNS, "line");
                        line.setAttribute("x1", `${parent.x}%`);
                        line.setAttribute("y1", `${parent.y}%`);
                        line.setAttribute("x2", `${skill.x}%`);
                        line.setAttribute("y2", `${skill.y}%`);
                        line.classList.add('connection-line');
                        line.id = `line-${pId}-${skill.id}`;
                        svg.appendChild(line);
                    }
                }
            });
        });

        lucide.createIcons();
        updateTransform();
    };

    // --- Listener for Shared Cart Updates ---
    window.addEventListener('cartUpdated', (e) => {
        // Just re-render to update highlights
        renderTree();
    });

    // --- Lógica de Drag (Pan) ---
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - panState.x;
        startY = e.clientY - panState.y;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        panState.x = e.clientX - startX;
        panState.y = e.clientY - startY;
        updateTransform();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            container.style.cursor = 'grab';
        }
    });

    // Zoom básico com Scroll (Opcional, mas útil para mapas)
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        panState.scale += scaleAmount;
        // Limites de zoom
        panState.scale = Math.min(Math.max(0.5, panState.scale), 2);
        updateTransform();
    }, { passive: false });


    // Inicialização
    renderTree();

    // 5. Efeito Parallax (REMOVIDO EM FAVOR DO DRAG)
    /* 
       O código antigo de parallax conflitava com o drag.
       Agora a árvore é estática em relação ao mouse, mas movível (Pan).
    */


    // 6. Mobile Cards Accordion
    const mobileHeaders = document.querySelectorAll('.mobile-card-header');
    mobileHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            
            // Auto-close others (Accordion effect)
            document.querySelectorAll('.mobile-card').forEach(c => {
                if (c !== card) c.classList.remove('open');
            });

            card.classList.toggle('open');
        });
    });
});