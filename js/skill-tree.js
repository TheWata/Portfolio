// js/skill-tree.js

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('skill-tree');
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

    // 3. Sistema de Expansão, Renderização e Pan (Drag)
    const expandedNodes = new Set(['root']); // Estado inicial: apenas Raiz expandido
    
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

    // Estado de Expansão Global
    const toggleBtn = document.getElementById('toggle-tree-btn');
    let isAllExpanded = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar conflito com drag
            if (isAllExpanded) {
                // Collapse All
                expandedNodes.clear();
                expandedNodes.add('root');
                toggleBtn.textContent = 'EXPANDIR TUDO';
                isAllExpanded = false;
            } else {
                // Expand All
                skillsData.forEach(s => expandedNodes.add(s.id));
                toggleBtn.textContent = 'RECOLHER TUDO';
                isAllExpanded = true;
            }
            renderTree();
        });
    }

    // Rastreamento para animação
    let previousVisibleIds = new Set(['root']);

    const getVisibleSkills = () => {
        const visible = new Set(['root']);
        const queue = ['root'];
        const processed = new Set(['root']);

        while(queue.length > 0) {
            const currentId = queue.shift();
            
            if (expandedNodes.has(currentId)) {
                // Encontrar filhos
                const children = skillsData.filter(s => {
                    const parents = s.parents || (s.parent ? [s.parent] : []);
                    return parents.includes(currentId);
                });

                children.forEach(child => {
                    if (!processed.has(child.id)) {
                        visible.add(child.id);
                        processed.add(child.id);
                        queue.push(child.id);
                    }
                });
            }
        }
        return skillsData.filter(s => visible.has(s.id));
    };

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
        const currentVisibleIds = new Set(visibleSkills.map(s => s.id));
        
        // Desenhar Nós
        visibleSkills.forEach((skill, index) => {
            const node = document.createElement('div');
            node.classList.add('skill-node', skill.status === 'mastered' ? 'status-mastered' : 'status-developing');
            if (expandedNodes.has(skill.id)) node.classList.add('node-expanded');
            
            node.id = `node-${skill.id}`;

            // Lógica de Animação de Entrada
            const isNew = !previousVisibleIds.has(skill.id);
            
            if (isNew && skill.id !== 'root') {
                // Encontrar pai visível para animar de lá
                const parents = skill.parents || (skill.parent ? [skill.parent] : []);
                // Priorizar pai que já estava visível ou que está sendo renderizado agora
                const parentId = parents[0]; // Simplificação: pega o primeiro pai
                const parentSkill = skillsData.find(s => s.id === parentId);
                
                if (parentSkill) {
                    // Posicionar inicialmente no pai
                    node.style.left = `${parentSkill.x}%`;
                    node.style.top = `${parentSkill.y}%`;
                    node.style.opacity = '0';
                    node.style.transform = 'translate(-50%, -50%) scale(0.5)'; // Começar pequeno
                    
                    // Forçar reflow/frame seguinte para animar
                    requestAnimationFrame(() => {
                        // Timeout pequeno para garantir que o navegador processou a posição inicial
                        setTimeout(() => {
                            node.style.left = `${skill.x}%`;
                            node.style.top = `${skill.y}%`;
                            node.style.opacity = '1';
                            node.style.transform = 'translate(-50%, -50%) scale(1)';
                        }, 50);
                    });
                } else {
                    node.style.left = `${skill.x}%`;
                    node.style.top = `${skill.y}%`;
                }
            } else {
                // Posição estática (já estava visível)
                node.style.left = `${skill.x}%`;
                node.style.top = `${skill.y}%`;
                node.style.opacity = '1';
            }

            // node.style.animationDelay removido para não conflitar com a animação manual JS
            // node.style.animationDelay = `${index * 0.05}s`; 

            // Verificar filhos para indicador
            const hasChildren = skillsData.some(s => {
                const parents = s.parents || (s.parent ? [s.parent] : []);
                return parents.includes(skill.id);
            });

            let indicatorHtml = '';
            if (hasChildren) {
                const isExpanded = expandedNodes.has(skill.id);
                indicatorHtml = `<div class="node-indicator">${isExpanded ? '-' : '+'}</div>`;
            }

            node.innerHTML = `
                <div class="node-icon">
                    <i data-lucide="${skill.icon}"></i>
                </div>
                <span class="node-label">${skill.label}</span>
                ${indicatorHtml}
            `;

            // Clique para expandir/recolher
            let isClick = true;
            node.addEventListener('mousedown', () => isClick = true);
            node.addEventListener('mousemove', () => isClick = false);

            node.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (expandedNodes.has(skill.id)) {
                    expandedNodes.delete(skill.id);
                } else {
                    expandedNodes.add(skill.id);
                }
                renderTree();
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

        // Desenhar Linhas (com delay ou transição se possível, mas SVG é mais complexo)
        // Linhas aparecem instantaneamente para simplicidade, ou fade-in via CSS
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
                        
                        // Opcional: Animar linha também
                         if (!previousVisibleIds.has(skill.id)) {
                             line.style.opacity = '0';
                             line.style.transition = 'opacity 0.5s ease 0.3s'; // Delay para esperar o nó chegar
                             setTimeout(() => line.style.opacity = '1', 100);
                         }

                        svg.appendChild(line);
                    }
                }
            });
        });

        lucide.createIcons();
        updateTransform();
        
        // Atualizar estado anterior
        previousVisibleIds = currentVisibleIds;
    };

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