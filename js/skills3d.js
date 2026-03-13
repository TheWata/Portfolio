// js/skills3d.js
import { skillsData } from './skillsData.js';

// Usando o Import Map definido no HTML
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


    // --- Recruitment Data ---
    const SKILL_PRICES = {
        // Roots & Commons
        'root': 2500, 'dev_root': 1500, 'data_root': 1500, 'game_root': 1500,
        'sql': 900, 'csharp': 900,
        
        // Dev
        'arch': 1200, 'web': 1000, 'backend': 1200, 'java': 800, 'docker': 1000,
        'mobile': 1100, 'maui': 900, 'flutter': 900,
        
        // Data
        'excel': 600, 'pbi': 1000, 'dax': 800, 'python': 1100, 
        'firebase': 700, 'postgresql': 800, 'sqlserver': 800,
        
        // Game
        'unity': 1000, 'godot': 800
    };

    const PRESETS = {
        'architect': {
            name: 'The Architect 🏗️',
            ids: ['dev_root', 'sql', 'arch'], 
            goal: 'Criar uma estrutura de backend robusta e escalável do zero.',
            summary: 'Um especialista focado na integridade e sustentabilidade do código a longo prazo.'
        },
        'oracle': {
            name: 'Data Oracle 🔮',
            ids: ['data_root', 'python', 'pbi'],
            goal: 'Transformar dados brutos em dashboards e decisões inteligentes.',
            summary: 'Capacidade analítica avançada para traduzir números em estratégias de negócio.'
        },
        'gamemaster': {
            name: 'Game Master 🎮',
            ids: ['game_root', 'unity', 'csharp'],
            goal: 'Desenvolver um protótipo funcional ou mecânica de jogo completa.',
            summary: 'Know-how em engines modernas e lógica de interação complexa.'
        },
        'fullstack': {
            name: 'Full-Stack Hero ⚔️',
            ids: ['dev_root', 'web', 'sqlserver'],
            goal: 'Entrega de uma aplicação web completa (Ponta a ponta).',
            summary: 'Versatilidade total para construir desde a interface até o banco de dados.'
        }
    };

    let hiringModeActive = false;
    let cart = new Set(); // Stores IDs
    let currentPreset = null;
    let nodes = {}; // Global reference for UI helpers
    let updateTooltip; // Global reference for UI helpers

    // EXPORTS FOR 2D TREE
    window.isHiringMode = () => hiringModeActive;
    window.toggleSkillCart = (id) => toggleCartItem(id);
    window.getCart = () => Array.from(cart);
    window.updateVisualsFromCart = () => {
        // Force update of 2D nodes if they exist
        const event = new CustomEvent('cartUpdated', { detail: { cart: Array.from(cart) } });
        window.dispatchEvent(event);
    };

    // --- Visual Helpers (Global for UI) ---
    const getColor = (status) => {
        if (status === 'mastered') return 0x0aff60; 
        return 0xffe600; 
    };
    const getGlowColor = (skill) => {
        if (skill.id === 'root') return 0xffe600; // Amarelo Destaque
        if (['data_root', 'excel', 'pbi', 'dax', 'python', 'sql'].includes(skill.id) || skill.parent === 'data_root') return 0x0aff60; 
        if (['game_root', 'unity', 'godot'].includes(skill.id) || skill.parent === 'game_root') return 0xbd00ff; 
        return 0x00f3ff; 
    };


    // --- Helper UI Logic ---
    const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const updateCartUI = () => {
        const list = document.getElementById('cart-list');
        const totalEl = document.getElementById('total-price');
        const countEl = document.getElementById('cart-count');
        if(!list) return;

        list.innerHTML = '';
        let total = 0;
        
        // Convert Set to Array for processing
        if(cart.size === 0) {
            list.innerHTML = `<div style="text-align:center; color: #64748b; padding: 2rem; font-size: 0.9rem;">
                <p>Nenhuma habilidade selecionada.</p>
                <p>Clique nos nós da árvore para adicionar.</p>
            </div>`;
        }

        cart.forEach(id => {
            const skill = skillsData.find(s => s.id === id);
            if(!skill) return;
            
            const price = SKILL_PRICES[id] || 800; // Default price fallback
            total += price;

            const item = document.createElement('div');
            item.className = 'cart-item';
            item.innerHTML = `
                <div class="cart-item-name">
                    <span style="color:${new THREE.Color(getGlowColor(skill)).getStyle()}">●</span>
                    ${skill.label}
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="cart-item-price">${formatCurrency(price)}</span>
                    <button class="cart-item-remove" data-id="${id}">×</button>
                </div>
            `;
            list.appendChild(item);
        });

        if(totalEl) totalEl.innerText = formatCurrency(total);
        if(countEl) countEl.innerText = cart.size;

        // Rebind remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute('data-id');
                toggleCartItem(id);
            };
        });
    };

    const toggleCartItem = (id) => {
        const node = nodes[id];
        if(!node) return;

        if(cart.has(id)) {
            cart.delete(id);
            // Visual Reset
            node.material.color.setHex(getColor(node.userData.skill.status));
            node.material.emissive.setHex(getGlowColor(node.userData.skill));
            node.material.emissiveIntensity = 0.8;
            node.scale.set(node.userData.originalScale, node.userData.originalScale, node.userData.originalScale);
            // Reset Bloom
            if(node.userData.sprite) node.userData.sprite.material.color.setHex(getGlowColor(node.userData.skill));
        } else {
            cart.add(id);
            // Visual Selected (Gold/White Highlight)
            if (hiringModeActive) {
                node.material.color.setHex(0xffffff); // White
                node.material.emissive.setHex(0xffd700); // Gold Glow
                node.material.emissiveIntensity = 2.0;
                
                // Update Bloom (Sprite)
                if(node.userData.sprite) {
                    node.userData.sprite.material.color.setHex(0xffd700);
                    // node.userData.sprite.scale.set(...) // Optional pulse
                }

                const s = node.userData.originalScale * 1.3;
                node.scale.set(s, s, s);
            }
        }
        updateCartUI();
        window.updateVisualsFromCart(); // Force update 2D
    };

    const activatePreset = (presetKey) => {
        // Clear current
        cart.forEach(id => toggleCartItem(id)); // Toggle off manually to reset visuals
        cart.clear(); // Ensure clear

        const preset = PRESETS[presetKey];
        if(!preset) return;

        // Visual Feedback for Preset Button
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.getAttribute('data-preset') === presetKey) btn.classList.add('active');
        });

        // Add skills
        preset.ids.forEach(id => {
            if(nodes[id]) toggleCartItem(id);
        });
    };

    // Initialize UI Listeners
    const recruitBtn = document.getElementById('recruit-toggle');
    const recruitPanel = document.getElementById('recruitment-panel');
    const finishBtn = document.getElementById('finish-hire');
    const modal = document.getElementById('report-modal');
    const closeModal = document.getElementById('close-report');

    const aboutTitle = document.getElementById('about-title');
    const aboutSubtitle = document.getElementById('about-subtitle');
    const aboutText1 = document.getElementById('about-text-1');
    const aboutText2 = document.getElementById('about-text-2');
    const aboutText3 = document.getElementById('about-text-3');
    const aboutText4 = document.getElementById('about-text-4');

    const originalAboutCopy = {
        title: aboutTitle ? aboutTitle.textContent : '',
        subtitle: aboutSubtitle ? aboutSubtitle.textContent : '',
        text1: aboutText1 ? aboutText1.textContent : '',
        text2: aboutText2 ? aboutText2.textContent : '',
        text3: aboutText3 ? aboutText3.textContent : '',
        text4: aboutText4 ? aboutText4.textContent : ''
    };

    const recruitmentAboutCopy = {
        title: 'MODO CONTRATAÇÃO',
        subtitle: 'Como montar sua build ideal de contratação',
        text1: 'Ative o modo recrutamento para transformar a skill tree em uma seleção prática de competências para o projeto.',
        text2: 'Clique nos nós da árvore para adicionar ou remover habilidades do escopo. Cada habilidade impacta o investimento total.',
        text3: 'Use os presets para começar rápido com perfis prontos e depois ajuste manualmente para o cenário da sua vaga.',
        text4: 'Ao finalizar, gere a proposta para obter um resumo claro com objetivo, stack escolhida e estimativa de investimento.'
    };

    const updateAboutSectionCopy = (isRecruitmentMode) => {
        const copy = isRecruitmentMode ? recruitmentAboutCopy : originalAboutCopy;
        if (aboutTitle) aboutTitle.textContent = copy.title;
        if (aboutSubtitle) aboutSubtitle.textContent = copy.subtitle;
        if (aboutText1) aboutText1.textContent = copy.text1;
        if (aboutText2) aboutText2.textContent = copy.text2;
        if (aboutText3) aboutText3.textContent = copy.text3;
        if (aboutText4) aboutText4.textContent = copy.text4;
    };

    if(recruitBtn && recruitPanel) {
        recruitBtn.addEventListener('click', () => {
            hiringModeActive = !hiringModeActive;
            recruitBtn.classList.toggle('active');
            recruitPanel.classList.toggle('open');
            updateAboutSectionCopy(hiringModeActive);
            recruitBtn.innerHTML = hiringModeActive
                ? '<i data-lucide="x"></i> Fechar Contrato'
                : '<i data-lucide="briefcase-business"></i> Modo Recrutamento';
            if (window.lucide) {
                window.lucide.createIcons();
            }
            
            // Visual Hint
            if(hiringModeActive) updateTooltip({ label: 'MODO CONTRATAÇÃO', desc: 'Clique nos nós para adicionar ao orçamento.', status: 'recruit' });
            
            // Sync with 2D Visuals
            window.updateVisualsFromCart();
        });
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => activatePreset(btn.getAttribute('data-preset')));
    });

    if(finishBtn && modal) {
        finishBtn.addEventListener('click', () => {
            // Generate Report Data
            const total = Array.from(cart).reduce((sum, id) => sum + (SKILL_PRICES[id] || 800), 0);
            
            // Populate Modal
            document.getElementById('report-total').innerText = formatCurrency(total);
            
            // Determine Goal/Context
            let presetName = 'Seleção Personalizada';
            let presetGoal = 'Definido pelo contratante.';
            let summary = 'Uma combinação única de habilidades técnicas focada em necessidades específicas.';

            // Check if matches preset
            // Basic heuristic: check if any preset was clicked last, OR infer
            // Let's just use the active preset button class
            const activePresetBtn = document.querySelector('.preset-btn.active');
            if(activePresetBtn) {
                const key = activePresetBtn.getAttribute('data-preset');
                presetName = PRESETS[key].name;
                presetGoal = PRESETS[key].goal;
                summary = PRESETS[key].summary;
            }

            document.getElementById('report-preset-name').innerText = presetName;
            document.getElementById('report-preset-goal').innerText = presetGoal;
            document.getElementById('report-summary-text').innerText = summary;

            // List Text Tags
            const tagsContainer = document.getElementById('report-skills-list');
            tagsContainer.innerHTML = '';
            cart.forEach(id => {
                const s = skillsData.find(x => x.id === id);
                if(s) {
                    const span = document.createElement('span');
                    span.className = 'skill-tag';
                    span.innerText = s.label;
                    tagsContainer.appendChild(span);
                }
            });

            modal.classList.add('active');
        });
    }

    if(closeModal && modal) {
        closeModal.addEventListener('click', () => modal.classList.remove('active'));
    }

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('skill-tree-3d');
    if (!container) return;

    // Remove legacy container cleanup if needed
    container.innerHTML = '';
    
    // Inject UI Controls & Styles
    const uiWrapper = document.createElement('div');
    uiWrapper.style.position = 'absolute';
    uiWrapper.style.top = '0';
    uiWrapper.style.left = '0';
    uiWrapper.style.width = '100%';
    uiWrapper.style.height = '100%';
    uiWrapper.style.pointerEvents = 'none'; // Permitir cliques no canvas abaixo
    uiWrapper.innerHTML = `
        <style>
            .skill-tree-container { position: relative !important; }
            .tree-controls-overlay {
                position: absolute; bottom: 20px; right: 20px; z-index: 100;
                display: flex; flex-direction: column; align-items: flex-end; gap: 10px; pointer-events: none;
            }
            .mouse-controls-hint {
                background: rgba(0, 0, 0, 0.7); border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 10px 15px; border-radius: 8px; color: #94a3b8; font-size: 0.8rem;
                font-family: 'JetBrains Mono', monospace; text-align: right; backdrop-filter: blur(4px);
            }
            .mouse-controls-hint strong { color: #00f3ff; font-weight: bold; }
            .recenter-btn {
                pointer-events: auto; background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff;
                color: #00f3ff; padding: 10px 20px; border-radius: 4px; cursor: pointer;
                font-family: 'Rajdhani', sans-serif; font-weight: 700; text-transform: uppercase;
                transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; font-size: 0.9rem;
            }
            .recenter-btn:hover { background: #00f3ff; color: #000; box-shadow: 0 0 15px #00f3ff; transform: translateY(-2px); }
        </style>
        <div class="tree-controls-overlay">
            <div class="mouse-controls-hint">
                <span>🖱️ <strong>Esq:</strong> Girar</span>
                <span>🖱️ <strong>Dir:</strong> Mover</span>
                <span>🖱️ <strong>Scroll:</strong> Zoom</span>
            </div>
            <button id="recenter-btn" class="recenter-btn">
                <span>🎯</span> RECENTRALIZAR
            </button>
        </div>
    `;
    container.appendChild(uiWrapper);

    // --- Configuration ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0b10, 0.002);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 80;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.minDistance = 20;
    controls.maxDistance = 150;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f3ff, 2, 100);
    pointLight.position.set(20, 20, 50);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xbd00ff, 2, 100);
    pointLight2.position.set(-20, -20, 30);
    scene.add(pointLight2);

    // --- Data Processing & Layout ---
    
    // Group to hold the entire tree for rotation
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    nodes = {}; // Use global reference
    const particles = [];
    const connectionLines = [];
    
    // Helper functions moved to global scope
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Calculate 3D Positions logic
    const getZPosition = (skill) => {
        if (skill.id === 'root') return 0;
        
        // Separação espacial por "Ramos" para dar volume - AUMENTADA
        const isData = ['data_root', 'excel', 'pbi', 'dax', 'python', 'sql'].includes(skill.id) || skill.parent === 'data_root';
        const isDev = ['dev_root', 'arch', 'web', 'backend', 'firebase', 'java', 'mobile', 'maui', 'flutter'].includes(skill.id) || skill.parent === 'dev_root' || skill.parent === 'backend' || skill.parent === 'mobile';
        const isGame = ['game_root', 'unity', 'godot'].includes(skill.id) || skill.parent === 'game_root';
        
        // Cada ramo vai para uma profundidade diferente com mais variação
        if (isData) return 40 + (Math.random() * 40);  // Frente forte
        if (isDev) return -40 - (Math.random() * 40); // Fundo forte
        if (isGame) return (Math.random() * 60 - 30);  // Espalhado no meio
        
        return (Math.random() * 80 - 40);
    };

    // Create Nodes
    skillsData.forEach(skill => {
        // Efeito Explosão : Espalhar mais no X e Y também
        const spreadFactor = 2.2; // Aumentado de 1.5 para 2.2 para ocupar mais espaço lateral
        const x = (skill.x - 50) * spreadFactor; 
        const y = -(skill.y - 50) * spreadFactor; 
        const z = getZPosition(skill);

        const pos = new THREE.Vector3(x, y, z);
        const color = getColor(skill.status);
        const glowColor = getGlowColor(skill);

        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: glowColor,
            emissiveIntensity: 0.8,
            metalness: 0.9,
            roughness: 0.1
        });

        const mesh = new THREE.Mesh(sphereGeometry, material);
        mesh.position.copy(pos);
        
        // Efeito EU: Destaque moderado
        const scale = skill.id === 'root' ? 4 : (skill.parent === 'root' ? 2 : 1.5);
        mesh.scale.set(scale, scale, scale);

        // Glow (Bilboard Sprite)
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 128; glowCanvas.height = 128;
        const gCtx = glowCanvas.getContext('2d');
        const gradient = gCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.2, new THREE.Color(glowColor).getStyle());
        gradient.addColorStop(0.6, 'transparent');
        gCtx.fillStyle = gradient;
        gCtx.fillRect(0,0,128,128);

        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: new THREE.CanvasTexture(glowCanvas), 
            color: glowColor, 
            transparent: true, 
            blending: THREE.AdditiveBlending,
            opacity: 0.7
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        // Ajuste no tamanho do brilho para não exagerar no root
        const spriteScale = skill.id === 'root' ? scale * 4 : scale * 6;
        sprite.scale.set(spriteScale, spriteScale, 1);
        sprite.raycast = () => {}; // IMPEDIraycast no brilho para não bloquear cliques
        mesh.add(sprite);

        // Label (Escondido por padrão para ficar limpo, aparece no hover/select?)
        // Vamos deixar visível mas sutil
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512; 
        canvas.height = 128;
        context.font = 'Bold 40px Rajdhani, Arial';
        context.textAlign = 'center';
        context.fillStyle = '#ffffff';
        context.shadowColor = new THREE.Color(glowColor).getStyle();
        context.shadowBlur = 10;
        context.fillText(skill.label, 256, 80);
        
        const textTex = new THREE.CanvasTexture(canvas);
        const textMat = new THREE.SpriteMaterial({ map: textTex, transparent: true, opacity: 0.8 });
        const textSprite = new THREE.Sprite(textMat);
        textSprite.position.y = -2.5; 
        textSprite.scale.set(15, 3.75, 1);
        mesh.add(textSprite);

        mesh.userData = { id: skill.id, skill: skill, originalScale: scale, sprite: sprite, text: textSprite };

        treeGroup.add(mesh); 
        nodes[skill.id] = mesh;
    });

    // Create Connections
    skillsData.forEach(skill => {
        const parents = skill.parents || (skill.parent ? [skill.parent] : []);
        parents.forEach(pId => {
            if (nodes[pId] && nodes[skill.id]) {
                const p1 = nodes[pId].position;
                const p2 = nodes[skill.id].position;

                const points = [];
                points.push(p1);
                points.push(p2);

                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ 
                    color: 0x4fc3f7, 
                    transparent: true, 
                    opacity: 0.4,
                    linewidth: 2
                });
                const line = new THREE.Line(geometry, material);
                treeGroup.add(line); // Add to Group
                connectionLines.push({ line, p1, p2 });
            }
        });
    });

    // Particles/Stars Background
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 500;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 200;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.5,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const starMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starMesh);


    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedNode = null;

    const onMouseMove = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    updateTooltip = (s) => {
        if (!tooltip) return; // Guard clause
        
        const tTitle = tooltip.querySelector('.tooltip-title');
        const tStatus = tooltip.querySelector('.tooltip-status');
        const tDesc = tooltip.querySelector('.tooltip-desc');
        
        if (tTitle) {
            tTitle.textContent = s.label;
            // Cor do texto baseada no tipo
            tTitle.style.color = new THREE.Color(getGlowColor(s)).getStyle();
            tTitle.style.textShadow = `0 0 10px ${tTitle.style.color}`;
        }
        if (tDesc) {
            tDesc.textContent = s.desc;
            tDesc.style.opacity = '1';
        }
        if (tStatus) {
            tStatus.textContent = s.status === 'mastered' ? '// DOMINADO' : '// EVOLUINDO';
            tStatus.className = `tooltip-status ${s.status === 'mastered' ? 'status-green' : 'status-yellow'}`;
        }
    };

    // Helper para achar o nó principal (caso o raycast pegue children como texto)
    const findMainNode = (obj) => {
        let current = obj;
        while (current) {
            if (current.userData && current.userData.skill) return current; // É o Node Mesh
            current = current.parent;
        }
        return null;
    };

    const handleNodeSelection = (node) => {
        // Mode Check: Recruitment
        if (hiringModeActive) {
            toggleCartItem(node.userData.id);
            return;
        }

        // Normal Mode: Detail View
        // Reset visual state of previously selected node
        if (selectedNode && selectedNode !== node) {
            const originalScale = selectedNode.userData.originalScale;
            selectedNode.scale.set(originalScale, originalScale, originalScale);
            selectedNode.material.emissiveIntensity = 0.8; 
            // Reset color if it was changed by hover logic, though loop handles it
        }

        selectedNode = node;
        
        // Visual Highlight for Selection
        const highlightScale = selectedNode.userData.originalScale * 1.5;
        selectedNode.scale.set(highlightScale, highlightScale, highlightScale);
        selectedNode.material.emissiveIntensity = 2.0;
        
        // Update UI Side Panel (Concept from 2D tree, adapts here?)
        // Currently we use tooltip
        updateTooltip(node.userData.skill);
    };

    // Click handler global
    window.addEventListener('click', (event) => {
        if (hoveredNode) {
            handleNodeSelection(hoveredNode);
        }
    });

    // Tap handler for mobile compatibility
    renderer.domElement.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent scrolling while interacting
        const rect = renderer.domElement.getBoundingClientRect();
        const touch = event.touches[0];
        
        // Update Raycaster coords
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(treeGroup.children, true); // Recursive
        
        if (intersects.length > 0) {
            const targetNode = findMainNode(intersects[0].object);
            if (targetNode) {
                handleNodeSelection(targetNode);
            }
        }
    }, { passive: false });


    // --- Animation Loop ---
    let time = 0;

    const tooltipElement = document.getElementById('skill-tooltip');
    const tooltip = tooltipElement ? tooltipElement.querySelector('.tooltip-content') : null;
    
    let hoveredNode = null;

    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.005;

        controls.update();

        // Slow Rotation of scene stars
        starMesh.rotation.y = time * 0.05;

        // Rotate the entire Tree Group gently
        // treeGroup.rotation.y = Math.sin(time * 0.2) * 0.1; // Very subtle sway

        // Pulse effect & State management
        Object.values(nodes).forEach(mesh => {
            // Se for o nó selecionado, mantém escala de destaque
            if (mesh === selectedNode) {
                const pulse = Math.sin(time * 5) * 0.1 + 1.4; // Pulso mais rápido e maior
                const finalScale = mesh.userData.originalScale * pulse;
                mesh.scale.set(finalScale, finalScale, finalScale);
            } else {
                // Comportamento normal
                const scaleBase = mesh.userData.originalScale; 
                const pulse = Math.sin(time * 2 + mesh.position.x * 0.05) * 0.05 + 1;
                mesh.scale.set(scaleBase * pulse, scaleBase * pulse, scaleBase * pulse);
            }
            
            // Billboard behavior for text sprites (always face camera)
            if (mesh.userData.text) {
                // Opcional: mostrar texto só no hover/select ou sempre?
                // Vamos deixar sempre visível mas clean
                mesh.userData.text.quaternion.copy(camera.quaternion);
            }
        });

        // Raycasting for Hover state
        raycaster.setFromCamera(mouse, camera);
        
        // Use recursivo para pegar cliques no Texto ou Glow também
        const intersects = raycaster.intersectObjects(treeGroup.children, true);

        if (intersects.length > 0) {
            // Pega o primeiro objeto intersectado e sobe a hierarquia para achar o nó
            const targetNode = findMainNode(intersects[0].object);
            
            if (targetNode) {
                if (hoveredNode !== targetNode) {
                    // Reset do antigo hover se não estava selecionado
                    if (hoveredNode && hoveredNode !== selectedNode) {
                        hoveredNode.material.emissiveIntensity = 0.8;
                    }

                    hoveredNode = targetNode;
                    container.style.cursor = 'pointer';
                    
                    // Highlight new hovered node
                    if (hoveredNode !== selectedNode) {
                        hoveredNode.material.emissiveIntensity = 1.5;
                    }
                }
            } else {
                 if (hoveredNode) {
                    // Clicou no nada ou objeto sem skill
                    if (hoveredNode !== selectedNode) {
                        hoveredNode.material.emissiveIntensity = 0.8;
                    }
                    hoveredNode = null;
                    container.style.cursor = 'default';
                }
            }
        } else {
            if (hoveredNode) {
                // Restore if not selected
                if (hoveredNode !== selectedNode) {
                    hoveredNode.material.emissiveIntensity = 0.8;
                }
                hoveredNode = null;
                container.style.cursor = 'default';
            }
        }

        renderer.render(scene, camera);
    };

    animate();

    // Recenter Button Logic
    const recenterBtn = document.getElementById('recenter-btn');
    if(recenterBtn) {
        recenterBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita conflito com clique no canvas
            
            // Animar camera reset (GSAP seria ideal, mas vai manual suave)
            // Reset position
            camera.position.set(0, 0, 80);
            camera.lookAt(0,0,0);
            
            // Reset controls target
            controls.target.set(0,0,0);
            controls.update();

            // Reset selection to ROOT optionally
            if(nodes['root']) handleNodeSelection(nodes['root']);
        });
    }

    // Window Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
