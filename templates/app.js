
// ===== 全局变量 =====
const groups = globalThis.GROUPS_DATA || [];
let currentLanguage = 'zh_CN';
let currentVersion = '';
let championsData = null;
let itemsData = null;
let summonerSpellsData = null;
let profileIconsData = null;

// 筛选状态
let currentMapFilter = '11';        // 默认召唤师峡谷
let currentSpellMode = 'classic';   // 默认经典模式
let currentItemType = 'all';        // 道具类型筛选
let currentItemStat = 'all';        // 属性筛选
let currentItemPrice = 'all';       // 价格范围筛选
let iconCurrentPage = 1;
let iconPageSize = 100;
let filteredIconsData = [];

// ===== 图标资源路径配置 =====
const ICON_ASSETS = {
    // CDN 基础路径
    cdn: {
        ddragon: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img',
        communityDragon: 'https://raw.communitydragon.org/latest/plugins'
    },

    // 位置图标（Community Dragon）
    positions: {
        top: 'rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
        jungle: 'rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png'
    },

    // 符文统计图标（Community Dragon）
    statMods: {
        adaptiveForce: 'rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsadaptiveforceicon.png',
        attackSpeed: 'rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsattackspeedicon.png',
        abilityHaste: 'rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsabilityhasteicon.png',
        health: 'rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodshealthscalingicon.png',
        armor: 'rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsarmoricon.png',
        magicRes: 'rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsmagicresicon.png'
    },

    // 道具图标（DDragon）
    items: {
        healthPotion: 'item/2003.png',          // 生命药水
        wardingTotem: 'item/3340.png',          // 侦查守卫
        boots: 'item/1001.png',                 // 布甲鞋
        infinityEdge: 'item/3031.png',          // 无尽之刃
        vampiricScepter: 'item/3072.png',       // 吸血鬼节杖
        tearOfGoddess: 'item/3040.png',         // 女神之泪
        frozenHeart: 'item/3114.png',           // 冰霜之心
        doransShield: 'item/1054.png'           // 多兰盾
    }
};

/**
 * 获取图标完整URL
 * @param {String} source - 图标来源 'positions' | 'statMods' | 'items'
 * @param {String} key - 图标键名
 * @returns {String} 完整的图标URL
 */
function getIconUrl(source, key) {
    const baseUrl = source === 'items'
        ? ICON_ASSETS.cdn.ddragon
        : ICON_ASSETS.cdn.communityDragon;

    const path = ICON_ASSETS[source][key];
    return `${baseUrl}/${path}`;
}

// ===== 道具筛选器配置数据 =====
const ITEM_FILTER_CONFIG = {
    // 类别筛选配置
    categories: [
        { id: 'all', label: '全部', type: 'text' },
        { id: 'LANE', label: '起始装备', type: 'icon', iconSource: 'positions', iconKey: 'top' },
        { id: 'JUNGLE', label: '打野装备', type: 'icon', iconSource: 'positions', iconKey: 'jungle' },
        { id: 'CONSUMABLE', label: '消耗品', type: 'icon', iconSource: 'items', iconKey: 'healthPotion' },
        { id: 'TRINKET', label: '饰品', type: 'icon', iconSource: 'items', iconKey: 'wardingTotem' },
        { id: 'BOOTS', label: '鞋子', type: 'icon', iconSource: 'items', iconKey: 'boots' }
    ],

    // 标签筛选配置（按组）
    tagGroups: [
        {
            groupLabel: '攻击',
            tags: [
                { id: 'all', label: '全部', type: 'text' },
                { id: 'Damage', label: '攻击力', type: 'icon', iconSource: 'statMods', iconKey: 'adaptiveForce' },
                { id: 'CriticalStrike', label: '暴击', type: 'icon', iconSource: 'items', iconKey: 'infinityEdge' },
                { id: 'AttackSpeed', label: '攻击速度', type: 'icon', iconSource: 'statMods', iconKey: 'attackSpeed' },
                { id: 'LifeSteal', label: '生命偷取', type: 'icon', iconSource: 'items', iconKey: 'vampiricScepter' }
            ]
        },
        {
            groupLabel: '法术',
            tags: [
                { id: 'all', label: '全部', type: 'text' },
                { id: 'SpellDamage', label: '法术强度', type: 'icon', iconSource: 'statMods', iconKey: 'abilityHaste' },
                { id: 'Mana', label: '法力', type: 'icon', iconSource: 'items', iconKey: 'tearOfGoddess' },
                { id: 'ManaRegen', label: '法力回复', type: 'icon', iconSource: 'items', iconKey: 'frozenHeart' },
                { id: 'CooldownReduction', label: '冷却缩减', type: 'icon', iconSource: 'statMods', iconKey: 'abilityHaste' }
            ]
        },
        {
            groupLabel: '防御',
            tags: [
                { id: 'all', label: '全部', type: 'text' },
                { id: 'Health', label: '生命值', type: 'icon', iconSource: 'statMods', iconKey: 'health' },
                { id: 'HealthRegen', label: '生命回复', type: 'icon', iconSource: 'items', iconKey: 'doransShield' },
                { id: 'Armor', label: '护甲', type: 'icon', iconSource: 'statMods', iconKey: 'armor' },
                { id: 'SpellBlock', label: '魔抗', type: 'icon', iconSource: 'statMods', iconKey: 'magicRes' }
            ]
        }
    ]
};

// ===== 通用函数 =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function switchMainTab(tabName, updateHash = true) {
    document.querySelectorAll('.main-nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[onclick*="'${tabName}'"]`).classList.add('active');

    document.querySelectorAll('.main-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(tabName + 'Panel').classList.add('active');

    // 更新 URL hash
    if (updateHash) {
        window.location.hash = tabName;
    }

    // 首次进入 DDragon 标签时初始化
    if (tabName === 'ddragon' && !currentVersion) {
        initDDragon();
    }
}

// ===== LCU API 测试器功能 =====
function showExamplesMenu(method, endpoint, examples, sourceItem) {
    // 移除已存在的菜单
    const existingMenu = document.querySelector('.examples-menu');
    if (existingMenu) existingMenu.remove();

    // 创建菜单
    const menu = document.createElement('div');
    menu.className = 'examples-menu';
    menu.style.cssText = `
        position: absolute;
        background: var(--bg-card);
        border: 1px solid var(--border-gold);
        border-radius: 4px;
        padding: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        min-width: 200px;
    `;

    // 计算位置
    const rect = sourceItem.getBoundingClientRect();
    menu.style.left = rect.right + 'px';
    menu.style.top = rect.top + 'px';

    // 添加标题
    const title = document.createElement('div');
    title.style.cssText = 'color: var(--gold); font-size: 11px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border);';
    title.textContent = '选择示例';
    menu.appendChild(title);

    // 添加示例选项
    examples.forEach((example, index) => {
        const option = document.createElement('div');
        option.style.cssText = `
            padding: 8px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 12px;
            color: var(--text-light);
            transition: background 0.2s;
        `;
        option.textContent = example.name;
        option.onmouseover = () => option.style.background = 'rgba(200,170,110,0.1)';
        option.onmouseout = () => option.style.background = 'transparent';
        option.onclick = () => {
            document.getElementById('method').value = method;
            document.getElementById('endpoint').value = endpoint;
            document.getElementById('body').value = JSON.stringify(example.data, null, 2);
            document.querySelectorAll('.preset-item').forEach(el => {
                el.classList.remove('active');
            });
            sourceItem.classList.add('active');
            menu.remove();
        };
        menu.appendChild(option);
    });

    document.body.appendChild(menu);

    // 点击外部关闭菜单
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== sourceItem) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

function buildPresetList() {
    const container = document.getElementById('presetList');
    container.innerHTML = '';

    groups.forEach((group, groupIdx) => {
        const title = document.createElement('div');
        title.className = 'preset-group-title';
        title.textContent = group.name;
        container.appendChild(title);

        // 添加分组注释（如果存在）
        if (group.context_note) {
            const note = document.createElement('div');
            note.className = 'preset-desc';
            note.textContent = group.context_note;
            container.appendChild(note);
        }

        group.endpoints.forEach((ep, epIdx) => {
            const name = ep[0];
            const method = ep[1];
            const endpoint = ep[2];
            const examples = ep[3]; // 示例数据数组

            const item = document.createElement('div');
            item.className = 'preset-item';
            item.innerHTML = `
                <span class="preset-method ${method.toLowerCase()}">${method}</span>
                <span class="preset-name" title="${endpoint}">${name}</span>
                ${examples && examples.length > 0 ? '<span style="margin-left: auto; color: var(--gold); font-size: 10px;">▼</span>' : ''}
            `;
            item.onclick = () => {
                // 如果有多个示例，显示选择菜单
                if (examples && examples.length > 0) {
                    showExamplesMenu(method, endpoint, examples, item);
                } else {
                    // 没有示例数据，使用默认值
                    const defaultBody = (method === 'GET' || method === 'DELETE') ? '' : '{}';
                    document.getElementById('method').value = method;
                    document.getElementById('endpoint').value = endpoint;
                    document.getElementById('body').value = defaultBody;
                    document.querySelectorAll('.preset-item').forEach(el => {
                        el.classList.remove('active');
                    });
                    item.classList.add('active');
                }
            };
            container.appendChild(item);
        });
    });
}

async function connectLCU() {
    const statusBox = document.getElementById('statusBox');
    const statusText = document.getElementById('statusText');
    const portInfo = document.getElementById('portInfo');
    const btn = document.getElementById('connectBtn');

    statusText.textContent = '连接中...';
    btn.disabled = true;

    try {
        const resp = await fetch('/api/lcu/connect', { method: 'POST' });
        const data = await resp.json();

        if (data.success) {
            statusText.textContent = '已连接';
            statusBox.className = 'status-box connected';
            portInfo.textContent = data.port;
            showToast('连接成功', 'success');
            sendLCURequest();
        } else {
            statusText.textContent = '未连接';
            statusBox.className = 'status-box disconnected';
            portInfo.textContent = '';
            showToast(data.message, 'error');
        }
    } catch (e) {
        statusText.textContent = '未连接';
        statusBox.className = 'status-box disconnected';
        portInfo.textContent = '';
        showToast('连接失败: ' + e.message, 'error');
    }
    btn.disabled = false;
    // 连接成功后获取参数
    await fetchParams();
}

// 参数缓存
let cachedParams = {};

// 获取参数值
async function fetchParams() {
    try {
        const resp = await fetch('/api/lcu/params', { method: 'POST' });
        const data = await resp.json();
        if (data.success) {
            cachedParams = data.data;
        }
    } catch (e) {
        console.error('获取参数失败:', e);
    }
}

// 一键自动填充所有参数
async function autoFillParams() {
    const endpointInput = document.getElementById('endpoint');
    let endpoint = endpointInput.value;

    // 提取所有参数占位符 {xxx}
    const paramMatches = endpoint.match(/\{([a-zA-Z]+)\}/g);

    if (!paramMatches || paramMatches.length === 0) {
        showToast('端点中没有需要填充的参数', 'info');
        return;
    }

    // 确保已获取参数
    if (Object.keys(cachedParams).length === 0) {
        showToast('正在获取参数...', 'info');
        await fetchParams();
    }

    // 填充所有参数
    const uniqueParams = [...new Set(paramMatches.map(p => p.slice(1, -1)))];
    const filledParams = [];
    const missingParams = [];

    uniqueParams.forEach(paramName => {
        const value = cachedParams[paramName];
        if (value !== undefined && value !== '') {
            endpoint = endpoint.replace(`{${paramName}}`, value);
            filledParams.push(`${paramName}=${value}`);
        } else {
            missingParams.push(paramName);
        }
    });

    endpointInput.value = endpoint;

    // 显示填充结果
    if (filledParams.length > 0) {
        const message = `已填充: ${filledParams.join(', ')}`;
        showToast(message, 'success');
    }

    if (missingParams.length > 0) {
        const message = `无法获取: ${missingParams.join(', ')}`;
        showToast(message, 'warning');
    }

    if (filledParams.length === 0 && missingParams.length === 0) {
        showToast('没有可填充的参数', 'info');
    }
}

async function sendLCURequest() {
    const method = document.getElementById('method').value;
    const endpoint = document.getElementById('endpoint').value;
    const body = document.getElementById('body').value;
    const responseEl = document.getElementById('response');
    const statusCodeEl = document.getElementById('statusCode');
    const responseTimeEl = document.getElementById('responseTime');

    if (!endpoint) {
        showToast('请输入端点', 'error');
        return;
    }

    responseEl.textContent = '请求中...';
    statusCodeEl.textContent = '-';
    statusCodeEl.className = 'status-badge';
    responseTimeEl.textContent = '';

    const startTime = performance.now();

    try {
        const resp = await fetch('/api/lcu/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method, endpoint, data: body })
        });
        const result = await resp.json();
        const elapsed = Math.round(performance.now() - startTime);

        statusCodeEl.textContent = result.status || 'ERR';
        if (result.status >= 200 && result.status < 300) {
            statusCodeEl.className = 'status-badge s2xx';
        } else if (result.status >= 400 && result.status < 500) {
            statusCodeEl.className = 'status-badge s4xx';
        } else {
            statusCodeEl.className = 'status-badge s5xx';
        }

        responseTimeEl.textContent = `${elapsed}ms`;
        responseEl.textContent = JSON.stringify(result.data, null, 2);
    } catch (e) {
        responseEl.textContent = 'Error: ' + e.message;
        statusCodeEl.textContent = 'ERR';
        statusCodeEl.className = 'status-badge s5xx';
    }
}

function copyResponse() {
    const el = document.getElementById('response');
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('响应内容已复制到剪贴板', 'success');
    }).catch(err => {
        showToast('复制失败: ' + err.message, 'error');
    });
}

document.getElementById('endpoint').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendLCURequest();
});

// ===== Data Dragon 数据查询功能 =====
async function fetchDDragonAPI(endpoint) {
    try {
        const response = await fetch(endpoint);
        const result = await response.json();
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || '请求失败');
        }
    } catch (error) {
        console.error('API Error:', error);
        showToast('加载数据失败: ' + error.message, 'error');
        return null;
    }
}

async function initDDragon() {
    await initLanguages();
    await initVersions();
}

async function initLanguages() {
    const data = await fetchDDragonAPI('/api/ddragon/languages');
    if (data) {
        const select = document.getElementById('languageSelect');
        select.innerHTML = data.map(lang =>
            `<option value="${lang}" ${lang === 'zh_CN' ? 'selected' : ''}>${lang}</option>`
        ).join('');
        currentLanguage = 'zh_CN';
    }
}

async function initVersions() {
    const data = await fetchDDragonAPI('/api/ddragon/versions');
    if (data && data.length > 0) {
        const select = document.getElementById('versionSelect');
        select.innerHTML = data.map((version, index) =>
            `<option value="${version}" ${index === 0 ? 'selected' : ''}>${version}${index === 0 ? ' (最新)' : ''}</option>`
        ).join('');
        currentVersion = data[0];
        await loadAllDDragonData();
    }
}

async function onLanguageChange() {
    currentLanguage = document.getElementById('languageSelect').value;
    await loadAllDDragonData();
}

async function onVersionChange() {
    currentVersion = document.getElementById('versionSelect').value;
    await loadAllDDragonData();
}

async function loadAllDDragonData() {
    await loadChampions();
    await loadItems();
    await loadSummonerSpells();
    await loadProfileIcons();
}

async function loadChampions() {
    const grid = document.getElementById('championsGrid');
    grid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>正在加载英雄数据...</span>
        </div>
    `;

    const data = await fetchDDragonAPI(`/api/ddragon/champions?version=${currentVersion}&language=${currentLanguage}`);
    if (data && data.data) {
        championsData = data.data;
        displayChampions(Object.values(championsData));
        // 更新数据链接
        updateDataLink('champions');
    } else {
        grid.innerHTML = `
            <div class="loading-state">
                <span>加载失败，请检查网络连接</span>
                <button onclick="loadChampions()" style="margin-top: 12px; padding: 8px 16px; background: var(--gold); color: var(--bg-dark); border: none; border-radius: 4px; cursor: pointer;">重试</button>
            </div>
        `;
    }
}

// 视图状态管理
const viewModes = {
    champions: 'grid',
    items: 'grid',
    'summoner-spells': 'grid',
    'profile-icons': 'grid'
};

function switchView(tabName, viewMode) {
    viewModes[tabName] = viewMode;
    const gridId = tabName === 'champions' ? 'championsGrid' :
                  tabName === 'items' ? 'itemsGrid' : 'summonerSpellsGrid';
    const grid = document.getElementById(gridId);

    // 更新按钮状态
    const panel = grid.parentElement;
    panel.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewMode);
    });

    // 更新视图类
    if (viewMode === 'list') {
        grid.classList.remove('grid');
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
        grid.classList.add('grid');
    }

    // 重新渲染
    if (tabName === 'champions') filterChampions();
    else if (tabName === 'items') filterItems();
    else filterSummonerSpells();
}

function getDifficultyClass(difficulty) {
    if (difficulty <= 3) return 'easy';
    if (difficulty <= 6) return 'moderate';
    return 'hard';
}

function getDifficultyText(difficulty) {
    if (difficulty <= 3) return '简单';
    if (difficulty <= 6) return '中等';
    return '困难';
}

// 角色类型翻译
function translateRole(role) {
    const roleMap = {
        'Fighter': '战士',
        'Tank': '坦克',
        'Mage': '法师',
        'Assassin': '刺客',
        'Support': '辅助',
        'Marksman': '射手'
    };
    return roleMap[role] || role;
}

// 根据角色类型获取样式类
function getRoleClass(role) {
    const roleClassMap = {
        'Fighter': 'fighter',
        'Tank': 'tank',
        'Mage': 'mage',
        'Assassin': 'assassin',
        'Support': 'support',
        'Marksman': 'marksman'
    };
    return roleClassMap[role] || 'default';
}

function displayChampions(champions) {
    const grid = document.getElementById('championsGrid');
    const countEl = document.getElementById('championCount');
    countEl.textContent = `共 ${champions.length} 个英雄`;
    const isListView = viewModes.champions === 'list';

    // 检查是否按角色筛选
    const roleFilter = document.getElementById('championRoleFilter')?.value || '';

    // 如果没有筛选角色且是网格视图，按角色分组显示
    if (!roleFilter && !isListView) {
        const roleGroups = {};
        champions.forEach(champ => {
            const primaryRole = champ.tags?.[0] || 'Other';
            if (!roleGroups[primaryRole]) {
                roleGroups[primaryRole] = [];
            }
            roleGroups[primaryRole].push(champ);
        });

        // 按角色分组显示
        grid.innerHTML = Object.entries(roleGroups).map(([role, roleChamps]) => {
            const roleText = translateRole(role);
            const roleClass = getRoleClass(role);
            return `
                <div style="grid-column: 1 / -1; margin: 24px 0 12px 0;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: var(--text-light); font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">${roleText}</span>
                        <span style="color: var(--text); font-size: 14px;">${roleChamps.length} / ${champions.length} (${((roleChamps.length / champions.length) * 100).toFixed(0)}%)</span>
                    </div>
                </div>
                ${roleChamps.map(champ => renderChampionCard(champ, false)).join('')}
            `;
        }).join('');
        return;
    }

    grid.innerHTML = champions.map(champ => renderChampionCard(champ, isListView)).join('');
}

function renderChampionCard(champ, isListView) {
    const tags = champ.tags || [];
    const info = champ.info || {};
    const difficulty = info.difficulty || 5;
    const diffClass = getDifficultyClass(difficulty);
    const diffText = getDifficultyText(difficulty);

    if (isListView) {
        return `
            <div class="card" onclick="showChampionDetail('${champ.id}')">
                <img class="card-image" src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${champ.id}.png"
                     alt="${champ.name}">
                <div class="card-content">
                    <div>
                        <div class="card-title">${champ.name}</div>
                        <div class="card-subtitle">${champ.title}</div>
                    </div>
                    <div class="card-tags">
                        ${tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="card-stats">
                    <div class="card-stat">
                        <span class="card-stat-label">攻击</span>
                        <span class="card-stat-value">${info.attack || 0}</span>
                    </div>
                    <div class="card-stat">
                        <span class="card-stat-label">防御</span>
                        <span class="card-stat-value">${info.defense || 0}</span>
                    </div>
                    <div class="card-stat">
                        <span class="card-stat-label">魔法</span>
                        <span class="card-stat-value">${info.magic || 0}</span>
                    </div>
                </div>
                <span class="card-difficulty ${diffClass}">${diffText}</span>
            </div>
        `;
    }

    // 网格视图使用加载页面图片（竖版立绘）
    const championId = champ.id.toLowerCase();
    // 获取主要角色（第一个tag）
    const primaryRole = tags[0] || 'Fighter';
    const roleClass = getRoleClass(primaryRole);
    const roleText = translateRole(primaryRole);
    // Community Dragon 加载页面图片URL
    const loadScreenUrl = `https://raw.communitydragon.org/latest/game/assets/characters/${championId}/skins/base/${championId}loadscreen_0.png`;

    return `
            <div class="card">
                <span class="card-difficulty ${roleClass}">${roleText}</span>
                <img class="card-image"
                     src="${loadScreenUrl}"
                     alt="${champ.name}"
                     onerror="this.src='https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg'"
                     onclick="showChampionDetail('${champ.id}')">
                <div class="card-footer">
                    <img class="card-icon"
                         src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${champ.id}.png"
                         alt="${champ.name}">
                    <span class="card-name">${champ.name}</span>
                </div>
                <div class="card-hover-detail">
                    <div class="hover-detail-header">
                        <img class="hover-detail-icon"
                             src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${champ.id}.png"
                             alt="${champ.name}">
                        <div class="hover-detail-name">
                            <div class="hover-detail-title">${champ.name}</div>
                            <div class="hover-detail-subtitle">${champ.title}</div>
                        </div>
                    </div>
                    <div class="hover-detail-stats">
                        <div class="hover-stat">
                            <div class="hover-stat-label">攻击</div>
                            <div class="hover-stat-value">${info.attack || 0}/10</div>
                        </div>
                        <div class="hover-stat">
                            <div class="hover-stat-label">防御</div>
                            <div class="hover-stat-value">${info.defense || 0}/10</div>
                        </div>
                        <div class="hover-stat">
                            <div class="hover-stat-label">魔法</div>
                            <div class="hover-stat-value">${info.magic || 0}/10</div>
                        </div>
                        <div class="hover-stat">
                            <div class="hover-stat-label">难度</div>
                            <div class="hover-stat-value">${info.difficulty || 0}/10</div>
                        </div>
                    </div>
                    <div class="hover-detail-tags">
                        ${tags.map(tag => `<span class="card-tag">${translateRole(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
}

// 全局变量存储当前选择的角色
let currentRoleFilter = '';

function filterChampionsByRole(btn, role) {
    // 更新按钮激活状态
    document.querySelectorAll('.role-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 保存当前角色筛选
    currentRoleFilter = role;

    // 触发筛选
    filterChampions();
}

function filterChampions() {
    if (!championsData) return;
    const search = document.getElementById('championSearch').value.toLowerCase();
    const sortFilter = document.getElementById('championSortFilter')?.value || 'name';

    let filtered = Object.values(championsData).filter(champ => {
        const matchesSearch = champ.name.toLowerCase().includes(search) ||
                            champ.title.toLowerCase().includes(search) ||
                            champ.id.toLowerCase().includes(search);
        const matchesRole = !currentRoleFilter || (champ.tags && champ.tags.includes(currentRoleFilter));
        return matchesSearch && matchesRole;
    });

    // 排序
    filtered.sort((a, b) => {
        const aInfo = a.info || {};
        const bInfo = b.info || {};

        switch(sortFilter) {
            case 'difficulty-asc':
                return (aInfo.difficulty || 0) - (bInfo.difficulty || 0);
            case 'difficulty-desc':
                return (bInfo.difficulty || 0) - (aInfo.difficulty || 0);
            case 'attack-desc':
                return (bInfo.attack || 0) - (aInfo.attack || 0);
            case 'defense-desc':
                return (bInfo.defense || 0) - (aInfo.defense || 0);
            case 'magic-desc':
                return (bInfo.magic || 0) - (aInfo.magic || 0);
            default: // name
                return a.name.localeCompare(b.name);
        }
    });

    displayChampions(filtered);
}

async function showChampionDetail(championId) {
    const modal = document.getElementById('championModal');
    modal.classList.add('show');

    const data = await fetchDDragonAPI(`/api/ddragon/champion/${championId}?version=${currentVersion}&language=${currentLanguage}`);
    if (data && data.data && data.data[championId]) {
        const champ = data.data[championId];
        document.getElementById('modalChampionName').textContent = champ.name;
        document.getElementById('modalChampionTitle').textContent = champ.title;
        document.getElementById('modalChampionLore').textContent = champ.lore;

        // 显示详细属性
        const stats = champ.stats || {};
        const statsHTML = `
            <div class="stat-item"><span class="stat-label">生命值:</span> <span class="stat-value">${stats.hp || 0} (+${stats.hpperlevel || 0})</span></div>
            <div class="stat-item"><span class="stat-label">生命回复:</span> <span class="stat-value">${stats.hpregen || 0} (+${stats.hpregenperlevel || 0})</span></div>
            <div class="stat-item"><span class="stat-label">法力值:</span> <span class="stat-value">${stats.mp || 0} (+${stats.mpperlevel || 0})</span></div>
            <div class="stat-item"><span class="stat-label">法力回复:</span> <span class="stat-value">${stats.mpregen || 0} (+${stats.mpregenperlevel || 0})</span></div>
            <div class="stat-item"><span class="stat-label">移动速度:</span> <span class="stat-value">${stats.movespeed || 0}</span></div>
            <div class="stat-item"><span class="stat-label">护甲:</span> <span class="stat-value">${stats.armor || 0} (+${stats.armorperlevel || 0})</span></div>
            <div class="stat-item"><span class="stat-label">魔法抗性:</span> <span class="stat-value">${stats.spellblock || 0} (+${stats.spellblockperlevel || 0})</span></div>
            <div class="stat-item"><span class="stat-label">攻击范围:</span> <span class="stat-value">${stats.attackrange || 0}</span></div>
            <div class="stat-item"><span class="stat-label">攻击力:</span> <span class="stat-value">${stats.attackdamage || 0} (+${stats.attackdamageperlevel || 0})</span></div>
            <div class="stat-item"><span class="stat-label">攻击速度:</span> <span class="stat-value">${stats.attackspeed || 0} (+${(stats.attackspeedperlevel || 0).toFixed(2)}%)</span></div>
            <div class="stat-item"><span class="stat-label">暴击:</span> <span class="stat-value">${stats.crit || 0} (+${stats.critperlevel || 0})</span></div>
        `;
        document.getElementById('modalChampionStats').innerHTML = statsHTML;

        // 显示详细技能（包含冷却、消耗、等级数据）
        const skillsHTML = [champ.passive, ...champ.spells].map((skill, index) => {
            const isPassive = index === 0;
            const key = isPassive ? '被动' : ['Q', 'W', 'E', 'R'][index - 1];

            let cooldownHTML = '';
            if (!isPassive && skill.cooldown && skill.cooldown.length > 0) {
                const cds = skill.cooldown.filter(cd => cd > 0);
                if (cds.length > 0) {
                    cooldownHTML = `<div class="skill-stat"><span class="skill-stat-label">冷却:</span> <span class="skill-stat-value">${cds.join(' / ')}s</span></div>`;
                }
            }

            let costHTML = '';
            if (!isPassive && skill.cost && skill.cost.length > 0) {
                const costs = skill.cost.filter(c => c > 0);
                if (costs.length > 0) {
                    const costType = skill.costType || '法力';
                    costHTML = `<div class="skill-stat"><span class="skill-stat-label">消耗:</span> <span class="skill-stat-value">${costs.join(' / ')} ${costType}</span></div>`;
                }
            }

            let rangeHTML = '';
            if (!isPassive && skill.range && skill.range.length > 0) {
                const ranges = skill.range.filter(r => r > 0);
                if (ranges.length > 0) {
                    rangeHTML = `<div class="skill-stat"><span class="skill-stat-label">范围:</span> <span class="skill-stat-value">${ranges.join(' / ')}</span></div>`;
                }
            }

            return `
                <div class="skill-detail-card">
                    <div class="skill-detail-header">
                        <img class="skill-detail-icon" src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/${isPassive ? 'passive' : 'spell'}/${skill.image.full}" alt="${skill.name}">
                        <div class="skill-detail-info">
                            <div class="skill-detail-name">[${key}] ${skill.name}</div>
                            <div class="skill-detail-stats">
                                ${cooldownHTML}
                                ${costHTML}
                                ${rangeHTML}
                            </div>
                        </div>
                    </div>
                    <div class="skill-detail-desc">${skill.description}</div>
                </div>
            `;
        }).join('');
        document.getElementById('modalChampionSkills').innerHTML = skillsHTML;

        // 显示皮肤
        const skins = champ.skins || [];
        const skinsHTML = skins.map(skin => {
            const displayName = (skin.num === 0 && skin.name === 'default') ? champ.name : skin.name;
            return `
            <div class="skin-card">
                ${skin.num === 0 ? '<span class="skin-card-default">原画</span>' : ''}
                <img class="skin-card-image"
                     src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skin.num}.jpg"
                     alt="${displayName}"
                     loading="lazy">
                <div class="skin-card-name">${displayName}</div>
            </div>
        `;
        }).join('');
        document.getElementById('modalChampionSkins').innerHTML = skinsHTML || '<p class="modal-text">暂无皮肤数据</p>';
    }
}

async function loadItems() {
    const grid = document.getElementById('itemsGrid');
    grid.className = 'items-grid-v2';
    grid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>正在加载道具数据...</span>
        </div>
    `;

    // 初始化侧边栏筛选器
    initItemSidebarFilters();

    const data = await fetchDDragonAPI(`/api/ddragon/items?version=${currentVersion}&language=${currentLanguage}`);
    if (data) {
        if (data.data) {
            itemsData = data.data;
        }
        // 保存物品分类树信息
        if (data.tree) {
            itemsTreeData = data.tree;
        }
        // 默认筛选召唤师峡谷
        filterItems();
        updateDataLink('items');
    } else {
        grid.innerHTML = `
            <div class="loading-state">
                <span>加载失败，请检查网络连接</span>
                <button onclick="loadItems()" style="margin-top: 12px; padding: 8px 16px; background: var(--gold); color: var(--bg-dark); border: none; border-radius: 4px; cursor: pointer;">重试</button>
            </div>
        `;
    }
}

// 初始化道具筛选器
function initItemSidebarFilters() {
    const version = currentVersion || '14.1.1';

    // 道具类型筛选
    const typeFilters = document.getElementById('itemTypeFilters');
    if (typeFilters) {
        const types = [
            { id: 'all', label: '全部', icon: null },
            { id: 'Boots', label: '鞋子', icon: '1001' },
            { id: 'Consumable', label: '消耗品', icon: '2003' },
            { id: 'Jungle', label: '打野', icon: '1101' },
            { id: 'Lane', label: '起始', icon: '1055' },
            { id: 'Trinket', label: '饰品', icon: '3340' },
        ];

        typeFilters.innerHTML = types.map((type, index) => `
            <button class="type-filter-btn ${index === 0 ? 'active' : ''}" data-type="${type.id}" onclick="filterItemsByType('${type.id}')">
                ${type.icon ? `<img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${type.icon}.png" alt="${type.label}">` : '<span style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:16px;">📦</span>'}
                <span>${type.label}</span>
            </button>
        `).join('');
    }

    // 属性筛选
    const statFilters = document.getElementById('itemStatFilters');
    if (statFilters) {
        const stats = [
            { id: 'all', label: '全部属性', icon: null },
            { id: 'Damage', label: '攻击力', icon: '1036' },
            { id: 'SpellDamage', label: '法术强度', icon: '1052' },
            { id: 'Health', label: '生命值', icon: '1028' },
            { id: 'Armor', label: '护甲', icon: '1029' },
            { id: 'SpellBlock', label: '魔法抗性', icon: '1033' },
            { id: 'AttackSpeed', label: '攻击速度', icon: '1042' },
            { id: 'CriticalStrike', label: '暴击几率', icon: '1018' },
            { id: 'LifeSteal', label: '生命偷取', icon: '1053' },
            { id: 'Mana', label: '法力值', icon: '1027' },
        ];

        statFilters.innerHTML = stats.map((stat, index) => `
            <button class="stat-filter-btn ${index === 0 ? 'active' : ''}" data-stat="${stat.id}" onclick="filterItemsByStat('${stat.id}')">
                ${stat.icon ? `<img class="stat-icon" src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${stat.icon}.png" alt="${stat.label}">` : '<span style="width:18px;text-align:center;">✨</span>'}
                <span>${stat.label}</span>
            </button>
        `).join('');
    }
}

// 地图筛选
function filterItemsByMap(mapId) {
    currentMapFilter = mapId;
    // 更新地图筛选按钮样式 (支持新旧两种选择器)
    document.querySelectorAll('.shop-map-btn, .items-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.map === mapId);
    });
    filterItems();
}

// 类型筛选
function filterItemsByType(typeId) {
    currentItemType = typeId;
    // 更新分类筛选按钮样式 (支持新旧两种选择器)
    document.querySelectorAll('.shop-cat-btn, .filter-tag[data-type]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === typeId);
    });
    filterItems();
}

// 属性筛选
function filterItemsByStat(statId) {
    currentItemStat = statId;
    // 更新属性筛选按钮样式 (支持新旧两种选择器)
    document.querySelectorAll('.shop-stat-btn, .filter-tag[data-stat]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.stat === statId);
    });
    filterItems();
}

// 价格筛选
function filterItemsByPrice(priceRange) {
    currentItemPrice = priceRange;
    // 更新价格筛选按钮样式 (支持新旧两种选择器)
    document.querySelectorAll('.shop-price-btn, .filter-tag[data-price]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.price === priceRange);
    });
    filterItems();
}

// 重置所有筛选器
function resetItemFilters() {
    currentItemType = 'all';
    currentItemStat = 'all';
    currentItemPrice = 'all';

    // 重置分类筛选 (支持新旧两种选择器)
    document.querySelectorAll('.shop-cat-btn, .filter-tag[data-type]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === 'all');
    });
    // 重置属性筛选 (支持新旧两种选择器)
    document.querySelectorAll('.shop-stat-btn, .filter-tag[data-stat]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.stat === 'all');
    });
    // 重置价格筛选 (支持新旧两种选择器)
    document.querySelectorAll('.shop-price-btn, .filter-tag[data-price]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.price === 'all');
    });
    // 清空搜索框
    const searchInput = document.getElementById('itemSearch');
    if (searchInput) searchInput.value = '';

    filterItems();
}

// 全局过滤状态
let currentItemCategoryFilter = 'all';  // 类别筛选 (LANE, JUNGLE等)
let currentItemTagFilter = 'all';       // 标签筛选 (Damage, Health等)
let itemsTreeData = null;               // 存储官方分类树数据

// ===== 筛选器渲染函数 =====
/**
 * 渲染单个筛选按钮
 * @param {Object} config - 按钮配置 { id, label, type, iconSource?, iconKey? }
 * @param {String} filterType - 筛选类型 'category' 或 'tag'
 * @param {Boolean} isActive - 是否激活
 */
function renderFilterButton(config, filterType, isActive = false) {
    const { id, label, type, iconSource, iconKey } = config;
    const activeClass = isActive ? 'active' : '';
    const iconClass = type === 'icon' ? 'item-icon-btn' : '';
    const clickHandler = filterType === 'category'
        ? `filterItemsByCategory('${id}')`
        : `filterItemsByTag('${id}')`;
    const dataAttr = filterType === 'category'
        ? `data-category="${id}"`
        : `data-tag="${id}"`;

    if (type === 'text') {
        return `<button class="icon-filter-btn ${activeClass}" ${dataAttr} onclick="${clickHandler}" title="${label}">${label}</button>`;
    } else {
        // 通过 iconSource 和 iconKey 获取图标URL
        const iconUrl = getIconUrl(iconSource, iconKey);
        return `<button class="icon-filter-btn ${iconClass} ${activeClass}" ${dataAttr} onclick="${clickHandler}" title="${label}">
            <img src="${iconUrl}" alt="${label}" class="filter-icon">
        </button>`;
    }
}

/**
 * 初始化道具筛选器UI
 */
function initItemFilters() {
    const container = document.getElementById('itemFiltersContainer');
    if (!container) return;

    let html = '';

    // 渲染类别筛选组
    html += '<div class="filter-group"><span class="filter-label">类别:</span>';
    ITEM_FILTER_CONFIG.categories.forEach((category, index) => {
        html += renderFilterButton(category, 'category', index === 0);
    });
    html += '</div>';

    // 渲染标签筛选组
    ITEM_FILTER_CONFIG.tagGroups.forEach(group => {
        html += `<div class="filter-group"><span class="filter-label">${group.groupLabel}:</span>`;
        group.tags.forEach((tag, index) => {
            html += renderFilterButton(tag, 'tag', index === 0);
        });
        html += '</div>';
    });

    container.innerHTML = html;
}

// 获取道具品质等级 (使用官方depth属性)
function getItemTier(item) {
    // 优先使用官方的depth属性
    const depth = item.depth;
    if (depth === 3 || depth === 4) return 'legendary';  // 终极装备
    if (depth === 2) return 'epic';                       // 中级装备

    // 如果没有depth，使用金币价格判断
    const gold = item.gold?.total || 0;
    if (gold >= 2500) return 'legendary';
    if (gold >= 800) return 'epic';
    return 'basic';
}

// 品质等级翻译
const tierNames = {
    'legendary': '传说',
    'epic': '史诗',
    'basic': '基础'
};

function displayItems(items) {
    const grid = document.getElementById('itemsGrid');
    const countEl = document.getElementById('itemCount');
    countEl.textContent = items.length;

    if (items.length === 0) {
        grid.className = 'items-grid-v2';
        grid.innerHTML = `
            <div class="empty-state-v2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                <p>未找到符合条件的道具</p>
            </div>
        `;
        return;
    }

    const sortFilter = document.getElementById('itemSortFilter')?.value || 'tier';

    // 按品质分组显示
    if (sortFilter === 'tier' || sortFilter === 'name') {
        grid.className = 'items-grid-v2';
        const grouped = { legendary: [], epic: [], basic: [] };
        items.forEach(([id, item]) => {
            const tier = getItemTier(item);
            grouped[tier].push([id, item]);
        });

        let html = '';
        ['legendary', 'epic', 'basic'].forEach(tier => {
            if (grouped[tier].length > 0) {
                const tierLabel = tierNames[tier];
                html += `
                    <div class="items-tier-section">
                        <div class="items-tier-header">
                            <span class="tier-indicator tier-${tier}"></span>
                            <span class="tier-title">${tierLabel}装备</span>
                            <span class="tier-count">${grouped[tier].length}</span>
                        </div>
                        <div class="items-tier-grid">
                            ${grouped[tier].map(([id, item]) => renderItemCardV2(id, item)).join('')}
                        </div>
                    </div>
                `;
            }
        });
        grid.innerHTML = html;
    } else {
        // 不分组，直接网格展示
        grid.className = 'items-grid-v2 items-flat-grid';
        grid.innerHTML = items.map(([id, item]) => renderItemCardV2(id, item)).join('');
    }
}

// 新的道具卡片渲染函数 - 紧凑正方形图标风格
function renderItemCardNew(id, item) {
    const price = item.gold?.total || 0;
    const tier = getItemTier(item);
    // 转义名称中的引号
    const safeName = item.name.replace(/"/g, '&quot;');

    return `
        <div class="item-card-new tier-${tier}" onclick="showItemDetail('${id}')" data-name="${safeName}" data-price="${price}">
            <img class="item-image" src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/item/${id}.png"
                 alt="${item.name}" onerror="this.src='https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/ui/items.png'">
        </div>
    `;
}

// V2 道具卡片渲染函数 - 带悬浮信息
function renderItemCardV2(id, item) {
    const price = item.gold?.total || 0;
    const tier = getItemTier(item);
    const safeName = item.name.replace(/"/g, '&quot;');

    return `
        <div class="item-card-v2 tier-${tier}" onclick="showItemDetail('${id}')" title="${item.name} - ${price}金币">
            <img class="item-icon-v2" src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/item/${id}.png"
                 alt="${item.name}" loading="lazy" onerror="this.style.opacity='0.3'">
            <div class="item-card-overlay">
                <span class="item-name-v2">${item.name}</span>
                <span class="item-price-v2">${price}</span>
            </div>
        </div>
    `;
}

// 渲染列表视图行
function renderItemListRow(id, item) {
    const gold = item.gold || {};
    const price = gold.total || 0;
    const tier = getItemTier(item);
    const tierLabel = tierNames[tier];

    // 获取主要属性
    const mainStats = [];
    if (item.stats) {
        if (item.stats.FlatPhysicalDamageMod) mainStats.push(`攻击 +${item.stats.FlatPhysicalDamageMod}`);
        if (item.stats.FlatMagicDamageMod) mainStats.push(`法强 +${item.stats.FlatMagicDamageMod}`);
        if (item.stats.FlatHPPoolMod) mainStats.push(`生命 +${item.stats.FlatHPPoolMod}`);
        if (item.stats.FlatArmorMod) mainStats.push(`护甲 +${item.stats.FlatArmorMod}`);
        if (item.stats.FlatSpellBlockMod) mainStats.push(`魔抗 +${item.stats.FlatSpellBlockMod}`);
        if (item.stats.PercentAttackSpeedMod) mainStats.push(`攻速 +${(item.stats.PercentAttackSpeedMod * 100).toFixed(0)}%`);
        if (item.stats.FlatCritChanceMod) mainStats.push(`暴击 +${(item.stats.FlatCritChanceMod * 100).toFixed(0)}%`);
    }

    const tags = (item.tags || []).join(', ');

    return `
        <div class="list-item item-list-row tier-${tier}" onclick="showItemDetail('${id}')">
            <img class="list-item-icon" src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/item/${id}.png"
                 alt="${item.name}" onerror="this.src='https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/ui/items.png'">
            <div class="list-item-info">
                <div class="list-item-header">
                    <span class="list-item-name">${item.name}</span>
                    <span class="list-item-tier-badge tier-badge-${tier}">${tierLabel}</span>
                </div>
                <div class="list-item-description">${item.plaintext || '无描述'}</div>
                ${mainStats.length > 0 ? `<div class="list-item-stats">${mainStats.slice(0, 5).join(' · ')}</div>` : ''}
            </div>
            <div class="list-item-meta">
                <div class="list-item-price">💰 ${price}</div>
                ${tags ? `<div class="list-item-tags">${tags}</div>` : ''}
            </div>
        </div>
    `;
}

function renderItemCard(id, item) {
    const gold = item.gold || {};
    const price = gold.total || 0;
    const stats = [];

    if (item.stats) {
        if (item.stats.FlatPhysicalDamageMod) stats.push('攻击');
        if (item.stats.FlatMagicDamageMod) stats.push('法术');
        if (item.stats.FlatHPPoolMod) stats.push('生命');
        if (item.stats.FlatArmorMod) stats.push('护甲');
        if (item.stats.FlatSpellBlockMod) stats.push('魔抗');
    }

    return `
        <div class="card item-card" onclick="showItemDetail('${id}')">
            <img class="card-image" src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/item/${id}.png"
                 alt="${item.name}" onerror="this.src='https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/ui/items.png'">
            <div class="card-title">${item.name}</div>
            <div class="item-price">💰 ${price}</div>
            ${stats.length > 0 ? `<div class="item-stats-mini">${stats.slice(0, 3).join(' · ')}</div>` : ''}
        </div>
    `;
}

function filterItems() {
    if (!itemsData) return;
    const search = document.getElementById('itemSearch')?.value.toLowerCase() || '';
    const sortFilter = document.getElementById('itemSortFilter')?.value || 'name';

    let filtered = Object.entries(itemsData).filter(([id, item]) => {
        // 搜索匹配
        const matchesSearch = item.name.toLowerCase().includes(search) ||
                            (item.plaintext && item.plaintext.toLowerCase().includes(search)) ||
                            (item.description && item.description.toLowerCase().includes(search));

        // 地图筛选
        let matchesMap = true;
        if (currentMapFilter === 'other') {
            // 其他地图：显示在其他地图可用的道具（如斗魂竞技场30等）
            if (item.maps) {
                // 检查是否在任何非SR(11)/ARAM(12)地图可用
                const otherMapIds = Object.keys(item.maps).filter(id => id !== '11' && id !== '12');
                matchesMap = otherMapIds.some(id => item.maps[id] === true);
            } else {
                matchesMap = false;
            }
        } else if (currentMapFilter) {
            matchesMap = item.maps && item.maps[currentMapFilter] === true;
        }

        // 类型筛选
        let matchesType = true;
        if (currentItemType !== 'all') {
            const tags = item.tags || [];
            matchesType = tags.includes(currentItemType);
        }

        // 属性筛选
        let matchesStat = true;
        if (currentItemStat !== 'all') {
            const tags = item.tags || [];
            matchesStat = tags.includes(currentItemStat);
        }

        // 价格范围筛选
        let matchesPrice = true;
        const price = item.gold?.total || 0;
        if (currentItemPrice === 'low') {
            matchesPrice = price < 1000;
        } else if (currentItemPrice === 'mid') {
            matchesPrice = price >= 1000 && price <= 2500;
        } else if (currentItemPrice === 'high') {
            matchesPrice = price > 2500;
        }

        // 排除不可购买的道具
        const isPurchasable = item.gold?.purchasable !== false;

        return matchesSearch && matchesMap && matchesType && matchesStat && matchesPrice && isPurchasable;
    });

    // 排序
    filtered.sort((a, b) => {
        const [, itemA] = a;
        const [, itemB] = b;

        switch(sortFilter) {
            case 'price-asc':
                return (itemA.gold?.total || 0) - (itemB.gold?.total || 0);
            case 'price-desc':
                return (itemB.gold?.total || 0) - (itemA.gold?.total || 0);
            case 'tier':
                const tierOrder = { legendary: 0, epic: 1, basic: 2 };
                return tierOrder[getItemTier(itemA)] - tierOrder[getItemTier(itemB)];
            default: // name
                return itemA.name.localeCompare(itemB.name);
        }
    });

    displayItems(filtered);
}

// 类别筛选函数 (LANE, JUNGLE, CONSUMABLE等)
function filterItemsByCategory(category) {
    currentItemCategoryFilter = category;

    // 更新按钮激活状态
    document.querySelectorAll('[data-category]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    // 如果选择了类别，重置标签筛选
    if (category !== 'all') {
        currentItemTagFilter = 'all';
        document.querySelectorAll('[data-tag]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tag === 'all');
        });
    }

    filterItems();
}

// 标签筛选函数 (Damage, Health, SpellDamage等)
function filterItemsByTag(tag) {
    currentItemTagFilter = tag;

    // 更新按钮激活状态
    document.querySelectorAll('[data-tag]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tag === tag);
    });

    // 如果选择了标签，重置类别筛选
    if (tag !== 'all') {
        currentItemCategoryFilter = 'all';
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });
    }

    filterItems();
}

// 道具属性翻译映射
const statTranslations = {
    FlatPhysicalDamageMod: '攻击力',
    FlatMagicDamageMod: '法术强度',
    FlatHPPoolMod: '生命值',
    FlatMPPoolMod: '法力值',
    FlatArmorMod: '护甲',
    FlatSpellBlockMod: '魔法抗性',
    FlatCritChanceMod: '暴击几率',
    FlatMovementSpeedMod: '移动速度',
    PercentAttackSpeedMod: '攻击速度',
    PercentMovementSpeedMod: '移动速度',
    FlatHPRegenMod: '生命回复',
    FlatMPRegenMod: '法力回复',
    PercentLifeStealMod: '生命偷取',
    PercentSpellVampMod: '法术吸血'
};

// 道具标签翻译
const itemTagTranslations = {
    'Boots': '鞋子',
    'ManaRegen': '法力回复',
    'HealthRegen': '生命回复',
    'Health': '生命值',
    'CriticalStrike': '暴击',
    'SpellDamage': '法术强度',
    'Mana': '法力值',
    'Armor': '护甲',
    'SpellBlock': '魔法抗性',
    'Damage': '攻击力',
    'LifeSteal': '生命偷取',
    'SpellVamp': '法术吸血',
    'Jungle': '打野',
    'Lane': '对线',
    'AttackSpeed': '攻击速度',
    'OnHit': '命中特效',
    'Trinket': '饰品',
    'Active': '主动',
    'Consumable': '消耗品',
    'CooldownReduction': '技能急速',
    'NonbootsMovement': '移动速度',
    'ArmorPenetration': '护甲穿透',
    'MagicPenetration': '法术穿透',
    'Tenacity': '韧性',
    'Vision': '视野',
    'Slow': '减速',
    'Stealth': '隐身'
};

// 地图名称
const mapNames = {
    '11': '召唤师峡谷',
    '12': '嚎哭深渊',
    '21': '极限闪击',
    '22': '训练模式',
    '30': '斗魂竞技场'
};

/**
 * 格式化道具描述文本
 * 简洁处理，移除属性区块（已在顶部显示），只保留技能效果
 */
function formatItemDescription(desc) {
    if (!desc) return '';

    let html = desc;

    // 移除包裹标签
    html = html.replace(/<\/?mainText>/gi, '');

    // 移除 stats 区块（属性已在顶部显示）
    html = html.replace(/<stats>[\s\S]*?<\/stats>/gi, '');

    // 基础 HTML 清理
    html = html
        .replace(/<br\s*\/?>/gi, '<br>')
        .replace(/<li>/gi, '<br>• ')
        .replace(/<\/li>/gi, '')
        .replace(/<ul>|<\/ul>/gi, '');

    // 技能标题标签 - 只有在换行后的才是标题（块级显示）
    // 格式: <br><passive>技能名</passive> 或开头的 <passive>技能名</passive>
    html = html.replace(/(?:^|<br>)<passive>([\s\S]*?)<\/passive>(\s*\([^)]*\))?(?=<br>|$)/gi,
        '<div class="desc-ability"><span class="desc-passive">$1</span>$2：</div>');
    html = html.replace(/(?:^|<br>)<active>([\s\S]*?)<\/active>(\s*\([^)]*\))?(?=<br>|$)/gi,
        '<div class="desc-ability"><span class="desc-active">$1</span>$2：</div>');
    html = html.replace(/(?:^|<br>)<aura>([\s\S]*?)<\/aura>(\s*\([^)]*\))?(?=<br>|$)/gi,
        '<div class="desc-ability"><span class="desc-aura">$1</span>$2：</div>');

    // 描述中引用的技能名称 - 保持行内显示
    html = html.replace(/<passive>([\s\S]*?)<\/passive>/gi, '<span class="desc-passive-ref">$1</span>');
    html = html.replace(/<active>([\s\S]*?)<\/active>/gi, '<span class="desc-active-ref">$1</span>');
    html = html.replace(/<aura>([\s\S]*?)<\/aura>/gi, '<span class="desc-aura-ref">$1</span>');

    // 稀有度标签
    html = html.replace(/<rarityMythic>([\s\S]*?)<\/rarityMythic>/gi, '<span class="desc-mythic">$1</span>');
    html = html.replace(/<rarityLegendary>([\s\S]*?)<\/rarityLegendary>/gi, '<span class="desc-legendary">$1</span>');

    // 数值强调
    html = html.replace(/<attention>([\s\S]*?)<\/attention>/gi, '<span class="desc-attention">$1</span>');

    // 伤害类型
    html = html.replace(/<magicDamage>([\s\S]*?)<\/magicDamage>/gi, '<span class="desc-magic">$1</span>');
    html = html.replace(/<physicalDamage>([\s\S]*?)<\/physicalDamage>/gi, '<span class="desc-physical">$1</span>');
    html = html.replace(/<trueDamage>([\s\S]*?)<\/trueDamage>/gi, '<span class="desc-true">$1</span>');

    // 治疗/护盾
    html = html.replace(/<healing>([\s\S]*?)<\/healing>/gi, '<span class="desc-heal">$1</span>');
    html = html.replace(/<shield>([\s\S]*?)<\/shield>/gi, '<span class="desc-shield">$1</span>');

    // 状态效果
    html = html.replace(/<status>([\s\S]*?)<\/status>/gi, '<span class="desc-status">$1</span>');

    // 关键词
    html = html.replace(/<keyword>([\s\S]*?)<\/keyword>/gi, '<span class="desc-keyword">$1</span>');
    html = html.replace(/<keywordMajor>([\s\S]*?)<\/keywordMajor>/gi, '<span class="desc-keyword">$1</span>');
    html = html.replace(/<keywordStealth>([\s\S]*?)<\/keywordStealth>/gi, '<span class="desc-stealth">$1</span>');

    // 缩放属性
    html = html.replace(/<scaleAP>([\s\S]*?)<\/scaleAP>/gi, '<span class="desc-scale-ap">$1</span>');
    html = html.replace(/<scaleAD>([\s\S]*?)<\/scaleAD>/gi, '<span class="desc-scale-ad">$1</span>');
    html = html.replace(/<scaleHealth>([\s\S]*?)<\/scaleHealth>/gi, '<span class="desc-scale-hp">$1</span>');
    html = html.replace(/<scaleMana>([\s\S]*?)<\/scaleMana>/gi, '<span class="desc-scale-mana">$1</span>');
    html = html.replace(/<scaleArmor>([\s\S]*?)<\/scaleArmor>/gi, '<span class="desc-scale-armor">$1</span>');
    html = html.replace(/<scaleMR>([\s\S]*?)<\/scaleMR>/gi, '<span class="desc-scale-mr">$1</span>');
    html = html.replace(/<scaleLethality>([\s\S]*?)<\/scaleLethality>/gi, '<span class="desc-scale-lethality">$1</span>');

    // 规则文本
    html = html.replace(/<rules>([\s\S]*?)<\/rules>/gi, '<span class="desc-rules">$1</span>');

    // 清理残留的未知标签
    html = html.replace(/<\/?[a-zA-Z]+>/g, '');

    // 清理技能标题后紧跟的换行（已经是块级元素了）
    html = html.replace(/<\/div>(<br>)+/gi, '</div>');

    // 清理开头的换行
    html = html.replace(/^(<br>)+/gi, '');
    // 将连续换行转为段落分隔
    html = html.replace(/(<br>){2,}/gi, '<div class="desc-separator"></div>');

    return html.trim();
}

function showItemDetail(itemId) {
    if (!itemsData || !itemsData[itemId]) return;

    const item = itemsData[itemId];
    const modal = document.getElementById('itemModal');
    modal.classList.add('show');

    // 更新 URL（不触发 hashchange）
    history.replaceState(null, '', `#ddragon/item/${itemId}`);

    // 基本信息
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalItemImage').src = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/item/${itemId}.png`;

    // 道具品级
    const tier = getItemTier(item);
    const tierNames = { 'mythic': '神话', 'legendary': '传说', 'epic': '史诗', 'basic': '基础' };
    const tierBadge = document.getElementById('modalItemTier');
    tierBadge.textContent = tierNames[tier] || '道具';
    tierBadge.className = `item-tier-badge tier-${tier}`;

    // 标签
    const tagsHTML = (item.tags || []).map(tag => {
        const label = itemTagTranslations[tag] || tag;
        return `<span class="item-tag">${label}</span>`;
    }).join('');
    document.getElementById('modalItemTags').innerHTML = tagsHTML;

    // 金币信息
    const gold = item.gold || {};
    const goldHTML = `
        <span class="gold-total">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
            </svg>
            ${gold.total || 0}
        </span>
        <span class="gold-detail">基础 ${gold.base || 0} · 售出 ${gold.sell || 0}</span>
        ${gold.purchasable === false ? '<span class="gold-detail" style="color:#ff6b6b;">不可购买</span>' : ''}
    `;
    document.getElementById('modalItemGold').innerHTML = goldHTML;

    // 属性
    if (item.stats && Object.keys(item.stats).length > 0) {
        const CDRAGON_STATMODS = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods';

        const statIcons = {
            'FlatPhysicalDamageMod': `${CDRAGON_STATMODS}/statmodsadaptiveforceicon.png`,
            'FlatMagicDamageMod': `${CDRAGON_STATMODS}/statmodsabilityhasteicon.png`,
            'FlatHPPoolMod': `${CDRAGON_STATMODS}/statmodshealthscalingicon.png`,
            'FlatMPPoolMod': `${CDRAGON_STATMODS}/statmodsabilityhasteicon.png`,
            'FlatArmorMod': `${CDRAGON_STATMODS}/statmodsarmoricon.png`,
            'FlatSpellBlockMod': `${CDRAGON_STATMODS}/statmodsmagicresicon.png`,
            'FlatCritChanceMod': `${CDRAGON_STATMODS}/statmodsattackspeedicon.png`,
            'FlatMovementSpeedMod': `${CDRAGON_STATMODS}/statmodsmovementspeedicon.png`,
            'PercentAttackSpeedMod': `${CDRAGON_STATMODS}/statmodsattackspeedicon.png`,
            'PercentLifeStealMod': `${CDRAGON_STATMODS}/statmodsadaptiveforceicon.png`,
            'PercentMovementSpeedMod': `${CDRAGON_STATMODS}/statmodsmovementspeedicon.png`,
        };

        const statsHTML = Object.entries(item.stats).map(([key, value]) => {
            const label = statTranslations[key] || key;
            const iconUrl = statIcons[key] || `${CDRAGON_STATMODS}/statmodsadaptiveforceicon.png`;
            let displayValue = value;
            if (key.startsWith('Percent')) {
                displayValue = `+${(value * 100).toFixed(0)}%`;
            } else {
                displayValue = `+${value}`;
            }
            return `
                <div class="item-stat-v2">
                    <img src="${iconUrl}" alt="${label}" onerror="this.style.display='none'">
                    <div class="item-stat-info">
                        <div class="item-stat-value">${displayValue}</div>
                        <div class="item-stat-label">${label}</div>
                    </div>
                </div>
            `;
        }).join('');
        document.getElementById('modalItemStats').innerHTML = statsHTML;
        document.getElementById('modalItemStatsSection').style.display = 'block';
    } else {
        document.getElementById('modalItemStatsSection').style.display = 'none';
    }

    // 效果描述
    const descContent = item.description || '';
    const formattedDesc = formatItemDescription(descContent);
    const descSection = document.getElementById('modalItemDescSection');
    const descEl = document.getElementById('modalItemDesc');

    if (formattedDesc && formattedDesc.trim()) {
        descEl.innerHTML = formattedDesc;
        descSection.style.display = 'block';
    } else {
        descSection.style.display = 'none';
    }

    // 合成路线
    let buildsHTML = '';
    if (item.from && item.from.length > 0) {
        buildsHTML += '<div class="builds-group-v2"><div class="builds-title-v2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>合成材料</div><div class="builds-items-v2">';
        item.from.forEach(fromId => {
            const fromItem = itemsData[fromId];
            if (fromItem) {
                const price = fromItem.gold?.total || 0;
                buildsHTML += `
                    <div class="build-item-v2" onclick="showItemDetail('${fromId}')">
                        <img src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/item/${fromId}.png" alt="${fromItem.name}">
                        <div class="build-item-name-v2">${fromItem.name}</div>
                        <div class="build-item-price-v2">${price}</div>
                    </div>
                `;
            }
        });
        buildsHTML += '</div></div>';
    }

    if (item.into && item.into.length > 0) {
        buildsHTML += '<div class="builds-group-v2"><div class="builds-title-v2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>可合成为</div><div class="builds-items-v2">';
        item.into.forEach(intoId => {
            const intoItem = itemsData[intoId];
            if (intoItem) {
                const price = intoItem.gold?.total || 0;
                buildsHTML += `
                    <div class="build-item-v2" onclick="showItemDetail('${intoId}')">
                        <img src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/item/${intoId}.png" alt="${intoItem.name}">
                        <div class="build-item-name-v2">${intoItem.name}</div>
                        <div class="build-item-price-v2">${price}</div>
                    </div>
                `;
            }
        });
        buildsHTML += '</div></div>';
    }

    if (buildsHTML) {
        document.getElementById('modalItemBuilds').innerHTML = buildsHTML;
        document.getElementById('modalItemBuildsSection').style.display = 'block';
    } else {
        document.getElementById('modalItemBuildsSection').style.display = 'none';
    }

    // 地图可用性
    if (item.maps) {
        const mapsHTML = Object.entries(mapNames).map(([mapId, mapName]) => {
            const available = item.maps[mapId] === true;
            return `<span class="map-tag ${available ? 'available' : 'unavailable'}">${mapName}</span>`;
        }).join('');
        document.getElementById('modalItemMaps').innerHTML = mapsHTML;
        document.getElementById('modalItemMapsSection').style.display = 'block';
    } else {
        document.getElementById('modalItemMapsSection').style.display = 'none';
    }
}

function hideItemModal(e) {
    if (!e || e.target === document.getElementById('itemModal')) {
        document.getElementById('itemModal').classList.remove('show');
        // 恢复到道具列表路由
        history.replaceState(null, '', '#ddragon/items');
    }
}

async function loadSummonerSpells() {
    const grid = document.getElementById('summonerSpellsGrid');
    grid.className = 'spells-grid-v2';
    grid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>正在加载召唤师技能数据...</span>
        </div>
    `;

    const data = await fetchDDragonAPI(`/api/ddragon/summoner-spells?version=${currentVersion}&language=${currentLanguage}`);
    if (data && data.data) {
        summonerSpellsData = data.data;
        // 默认显示经典模式技能
        filterSummonerSpells();
        updateDataLink('summoner-spells');
    } else {
        grid.innerHTML = `
            <div class="loading-state">
                <span>加载失败，请检查网络连接</span>
                <button onclick="loadSummonerSpells()" style="margin-top: 12px; padding: 8px 16px; background: var(--gold); color: var(--bg-dark); border: none; border-radius: 4px; cursor: pointer;">重试</button>
            </div>
        `;
    }
}

// 召唤师峡谷可用的技能
const CLASSIC_SPELLS = ['SummonerFlash', 'SummonerHeal', 'SummonerTeleport', 'SummonerExhaust', 'SummonerBarrier', 'SummonerBoost', 'SummonerDot', 'SummonerHaste', 'SummonerSmite', 'SummonerMana'];
// 嚎哭深渊可用的技能（包括雪球）
const ARAM_SPELLS = ['SummonerFlash', 'SummonerHeal', 'SummonerExhaust', 'SummonerBarrier', 'SummonerBoost', 'SummonerDot', 'SummonerHaste', 'SummonerMana', 'SummonerSnowball'];

// 游戏模式筛选
function filterSpellsByMode(mode) {
    currentSpellMode = mode;

    // 更新模式卡片状态 (支持新旧两种选择器)
    document.querySelectorAll('.spell-mode-card, .spells-mode-btn').forEach(card => {
        card.classList.toggle('active', card.dataset.mode === mode);
    });

    filterSummonerSpells();
}

// 技能类型分类
const SPELL_TYPES = {
    // 伤害类
    'SummonerDot': 'damage',      // 点燃
    'SummonerSmite': 'damage',    // 惩戒
    'SummonerSnowball': 'damage', // 雪球
    // 位移类
    'SummonerFlash': 'mobility',  // 闪现
    'SummonerTeleport': 'mobility', // 传送
    'SummonerHaste': 'mobility',  // 疾跑
    // 防御类
    'SummonerHeal': 'defensive',  // 治疗
    'SummonerBarrier': 'defensive', // 护盾
    'SummonerBoost': 'defensive', // 净化
    // 功能类
    'SummonerExhaust': 'utility', // 虚弱
    'SummonerMana': 'utility',    // 清晰
};

const SPELL_TYPE_NAMES = {
    'damage': '伤害',
    'mobility': '位移',
    'defensive': '防御',
    'utility': '功能'
};

function displaySummonerSpells(spells) {
    const grid = document.getElementById('summonerSpellsGrid');
    const countEl = document.getElementById('spellCount');
    countEl.textContent = spells.length;

    if (spells.length === 0) {
        grid.className = 'spells-grid-v2';
        grid.innerHTML = `
            <div class="empty-state-v2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                <p>没有找到符合条件的技能</p>
            </div>
        `;
        return;
    }

    grid.className = 'spells-grid-v2';
    grid.innerHTML = spells.map(spell => {
        const cooldown = spell.cooldown && spell.cooldown[0] ? spell.cooldown[0] : 0;
        const level = spell.summonerLevel || 1;
        // 清理描述中的 HTML 标签
        const cleanDesc = (spell.description || '无描述').replace(/<[^>]*>/g, '');
        // 截断过长描述
        const shortDesc = cleanDesc.length > 80 ? cleanDesc.substring(0, 80) + '...' : cleanDesc;

        // 获取技能类型
        const spellType = SPELL_TYPES[spell.id] || 'utility';
        const typeName = SPELL_TYPE_NAMES[spellType];

        return `
        <div class="spell-card-v2" onclick='showSpellDetail(${JSON.stringify(spell).replace(/'/g, "&apos;")})'>
            <span class="spell-type-tag ${spellType}">${typeName}</span>
            <div class="spell-icon-wrapper">
                <img class="spell-icon-v2" src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/spell/${spell.image.full}" alt="${spell.name}">
            </div>
            <div class="spell-info-v2">
                <div class="spell-name-v2">${spell.name}</div>
                <div class="spell-desc-v2">${shortDesc}</div>
                <div class="spell-meta-v2">
                    ${cooldown > 0 ? `<span class="spell-cooldown-v2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>${cooldown}s</span>` : ''}
                    <span class="spell-level-v2">Lv.${level}</span>
                </div>
            </div>
        </div>
    `}).join('');
}

function showSpellDetail(spell) {
    const modal = document.getElementById('spellModal');
    modal.classList.add('show');

    document.getElementById('modalSpellName').textContent = spell.name;
    document.getElementById('modalSpellImage').src = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/spell/${spell.image.full}`;

    // 冷却时间
    const cooldowns = spell.cooldown && spell.cooldown.length > 0 ? spell.cooldown.filter(cd => cd > 0) : [];
    const cooldownText = cooldowns.length > 0 ? `${cooldowns[0]}s` : '-';
    document.getElementById('modalSpellCooldown').textContent = cooldownText;

    // 施法范围
    const range = spell.range && spell.range[0] ? spell.range[0] : '-';
    document.getElementById('modalSpellRange').textContent = range === 'self' ? '自身' : range;

    // 解锁等级
    const level = spell.summonerLevel || 1;
    document.getElementById('modalSpellLevel').textContent = `Lv.${level}`;

    // 可用模式标签
    const modesContainer = document.getElementById('modalSpellModes');
    const isClassic = CLASSIC_SPELLS.includes(spell.id);
    const isAram = ARAM_SPELLS.includes(spell.id);
    modesContainer.innerHTML = `
        <span class="spell-mode-tag ${isClassic ? '' : 'unavailable'}">召唤师峡谷</span>
        <span class="spell-mode-tag ${isAram ? '' : 'unavailable'}">嚎哭深渊</span>
    `;

    // 描述
    document.getElementById('modalSpellDescription').innerHTML = spell.description || '无描述';
}

function hideSpellModal(e) {
    if (!e || e.target === document.getElementById('spellModal')) {
        document.getElementById('spellModal').classList.remove('show');
    }
}

function filterSummonerSpells() {
    if (!summonerSpellsData) return;
    const search = document.getElementById('spellSearch')?.value.toLowerCase() || '';
    const sortFilter = document.getElementById('spellSortFilter')?.value || 'name';

    let filtered = Object.values(summonerSpellsData).filter(spell => {
        // 搜索匹配
        const matchesSearch = spell.name.toLowerCase().includes(search) ||
            (spell.description && spell.description.toLowerCase().includes(search));

        // 游戏模式筛选
        let matchesMode = true;
        if (currentSpellMode === 'classic') {
            matchesMode = CLASSIC_SPELLS.includes(spell.id);
        } else if (currentSpellMode === 'aram') {
            matchesMode = ARAM_SPELLS.includes(spell.id);
        }
        // 'all' 模式显示全部

        return matchesSearch && matchesMode;
    });

    // 排序
    filtered.sort((a, b) => {
        switch(sortFilter) {
            case 'cooldown-asc':
                return (a.cooldown?.[0] || 0) - (b.cooldown?.[0] || 0);
            case 'cooldown-desc':
                return (b.cooldown?.[0] || 0) - (a.cooldown?.[0] || 0);
            case 'level-asc':
                return (a.summonerLevel || 1) - (b.summonerLevel || 1);
            case 'level-desc':
                return (b.summonerLevel || 1) - (a.summonerLevel || 1);
            default: // name
                return a.name.localeCompare(b.name);
        }
    });

    displaySummonerSpells(filtered);
}

async function loadProfileIcons() {
    const grid = document.getElementById('profileIconsGrid');
    grid.className = 'icons-grid-v2';
    grid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>正在加载召唤师图标数据...</span>
        </div>
    `;

    const data = await fetchDDragonAPI(`/api/ddragon/profile-icons?version=${currentVersion}&language=${currentLanguage}`);
    if (data && data.data) {
        profileIconsData = data.data;
        iconCurrentPage = 1;
        filterProfileIcons();
        updateDataLink('profile-icons');
    } else {
        grid.innerHTML = `
            <div class="loading-state">
                <span>加载失败，请检查网络连接</span>
                <button onclick="loadProfileIcons()" style="margin-top: 12px; padding: 8px 16px; background: var(--gold); color: var(--bg-dark); border: none; border-radius: 4px; cursor: pointer;">重试</button>
            </div>
        `;
    }
}

function displayProfileIcons(icons) {
    const grid = document.getElementById('profileIconsGrid');
    const countEl = document.getElementById('iconCount');
    const pageInfoEl = document.getElementById('iconPageInfo');

    const totalCount = icons.length;
    const totalPages = Math.ceil(totalCount / iconPageSize);

    // 确保当前页有效
    if (iconCurrentPage > totalPages) iconCurrentPage = totalPages;
    if (iconCurrentPage < 1) iconCurrentPage = 1;

    // 分页
    const startIndex = (iconCurrentPage - 1) * iconPageSize;
    const endIndex = startIndex + iconPageSize;
    const pageIcons = icons.slice(startIndex, endIndex);

    countEl.textContent = totalCount;
    pageInfoEl.textContent = `${iconCurrentPage} / ${totalPages || 1}`;

    // 更新分页按钮状态 (支持新旧两种选择器)
    const prevBtns = document.querySelectorAll('.pagination-controls .page-btn:first-child, .page-nav-btn:first-of-type');
    const nextBtns = document.querySelectorAll('.pagination-controls .page-btn:nth-child(3), .page-nav-btn:last-of-type');
    prevBtns.forEach(btn => btn.disabled = iconCurrentPage <= 1);
    nextBtns.forEach(btn => btn.disabled = iconCurrentPage >= totalPages);

    if (pageIcons.length === 0) {
        grid.className = 'icons-grid-v2';
        grid.innerHTML = `
            <div class="empty-state-v2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <p>没有找到符合条件的图标</p>
            </div>
        `;
        return;
    }

    grid.className = 'icons-grid-v2';
    grid.innerHTML = pageIcons.map(([id, icon]) => {
        return `
        <div class="icon-card-v2" title="图标 ID: ${id}">
            <img class="icon-img-v2" src="https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/profileicon/${id}.png" alt="图标 ${id}" loading="lazy">
            <span class="icon-id-v2">${id}</span>
        </div>
    `}).join('');
}

function filterProfileIcons() {
    if (!profileIconsData) return;
    const search = document.getElementById('iconSearch')?.value.toLowerCase() || '';
    const sortFilter = document.getElementById('iconSortFilter')?.value || 'id-desc';

    filteredIconsData = Object.entries(profileIconsData).filter(([id, icon]) =>
        id.includes(search)
    );

    // 排序
    filteredIconsData.sort((a, b) => {
        const [idA] = a;
        const [idB] = b;

        switch(sortFilter) {
            case 'id-asc':
                return parseInt(idA) - parseInt(idB);
            default: // id-desc (最新优先)
                return parseInt(idB) - parseInt(idA);
        }
    });

    // 重置到第一页（搜索或排序变化时）
    iconCurrentPage = 1;
    displayProfileIcons(filteredIconsData);
}

function changeIconPage(delta) {
    const totalPages = Math.ceil(filteredIconsData.length / iconPageSize);
    const newPage = iconCurrentPage + delta;

    if (newPage >= 1 && newPage <= totalPages) {
        iconCurrentPage = newPage;
        displayProfileIcons(filteredIconsData);
        // 滚动到顶部
        document.getElementById('profileIconsGrid').scrollTop = 0;
    }
}

function changeIconPageSize() {
    const select = document.getElementById('iconPageSize');
    iconPageSize = parseInt(select.value);
    iconCurrentPage = 1;
    displayProfileIcons(filteredIconsData);
}

function switchDDragonTab(tabName, updateHash = true) {
    document.querySelectorAll('.sub-nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.sub-nav-tab[onclick*="'${tabName}'"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');

    // 更新原始数据链接
    updateDataLink(tabName);

    // 更新 URL hash
    if (updateHash) {
        window.location.hash = `ddragon/${tabName}`;
    }
}

function updateDataLink(tabName) {
    const link = document.getElementById('ddragonDataLink');
    if (!currentVersion || !currentLanguage) {
        link.style.display = 'none';
        return;
    }

    link.style.display = 'flex';
    let dataUrl = '';
    switch(tabName) {
        case 'champions':
            dataUrl = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${currentLanguage}/champion.json`;
            break;
        case 'items':
            dataUrl = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${currentLanguage}/item.json`;
            break;
        case 'summoner-spells':
            dataUrl = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${currentLanguage}/summoner.json`;
            break;
        case 'profile-icons':
            dataUrl = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${currentLanguage}/profileicon.json`;
            break;
    }
    link.href = dataUrl;
}

function hideModal(e) {
    if (!e || e.target === document.getElementById('championModal')) {
        document.getElementById('championModal').classList.remove('show');
    }
}

function showAbout() {
    document.getElementById('aboutModal').classList.add('show');
}

function hideAbout(e) {
    if (!e || e.target === document.getElementById('aboutModal')) {
        document.getElementById('aboutModal').classList.remove('show');
    }
}

function openDocs() {
    window.open('https://www.mingweisamuel.com/lcu-schema/tool/', '_blank');
}

// ===== 语言切换功能 =====
async function showLocaleManager() {
    const modal = document.getElementById('localeModal');
    modal.classList.add('show');

    // 加载当前语言
    await loadCurrentLocale();

    // 加载语言列表
    await loadLocalesList();
}

function hideLocaleManager(e) {
    if (!e || e.target === document.getElementById('localeModal')) {
        document.getElementById('localeModal').classList.remove('show');
        // 清空结果
        const resultDiv = document.getElementById('localeResult');
        resultDiv.className = 'locale-result';
        resultDiv.textContent = '';
    }
}

async function loadCurrentLocale() {
    const textEl = document.getElementById('currentLocaleText');
    textEl.textContent = '检测中...';
    textEl.style.color = 'var(--text)';

    try {
        const response = await fetch('/api/locale/get', { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            textEl.textContent = data.message || data.current_locale;
            textEl.style.color = 'var(--blue)';
        } else {
            textEl.textContent = data.message || '无法检测当前语言';
            textEl.style.color = 'var(--red)';
        }
    } catch (error) {
        textEl.textContent = `检测失败: ${error.message}`;
        textEl.style.color = 'var(--red)';
    }
}

async function loadLocalesList() {
    const selectEl = document.getElementById('localeSelect');
    selectEl.innerHTML = '<option value="">加载中...</option>';

    try {
        const response = await fetch('/api/locale/list', { method: 'POST' });
        const data = await response.json();

        if (data.success && data.locales) {
            selectEl.innerHTML = data.locales.map(locale =>
                `<option value="${locale.code}">${locale.code} - ${locale.name}</option>`
            ).join('');
        } else {
            selectEl.innerHTML = '<option value="">加载失败</option>';
        }
    } catch (error) {
        selectEl.innerHTML = '<option value="">加载失败</option>';
    }
}

async function setLocale(method) {
    const selectEl = document.getElementById('localeSelect');
    const localeCode = selectEl.value;
    const resultDiv = document.getElementById('localeResult');

    if (!localeCode) {
        resultDiv.textContent = '请先选择一个语言';
        resultDiv.className = 'locale-result error';
        return;
    }

    // 显示加载中
    resultDiv.textContent = '正在切换语言，请稍候...';
    resultDiv.className = 'locale-result loading';

    try {
        const response = await fetch('/api/locale/set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                locale: localeCode,
                method: method
            })
        });

        const data = await response.json();

        if (data.success) {
            resultDiv.textContent = data.message;
            resultDiv.className = 'locale-result success';
            showToast('语言切换成功！请重启游戏客户端', 'success');

            // 刷新当前语言显示
            setTimeout(() => loadCurrentLocale(), 1000);
        } else {
            resultDiv.textContent = data.message || '切换失败';
            resultDiv.className = 'locale-result error';
            showToast('语言切换失败', 'error');
        }
    } catch (error) {
        resultDiv.textContent = `切换失败: ${error.message}`;
        resultDiv.className = 'locale-result error';
        showToast('网络请求失败', 'error');
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideModal();
        hideAbout();
        hideItemModal();
        hideSpellModal();
        hideLocaleManager();
    }
});

// ===== 页面路由处理 =====
function handleRoute() {
    const hash = window.location.hash.slice(1); // 移除 # 号

    if (!hash) {
        // 默认显示 LCU 标签
        switchMainTab('lcu', false);
        return;
    }

    if (hash.startsWith('ddragon/')) {
        // Data Dragon 子标签: #ddragon/champions, #ddragon/items, #ddragon/summoner-spells
        const parts = hash.split('/');
        const subTab = parts[1];
        switchMainTab('ddragon', false);

        if (subTab === 'item' && parts[2]) {
            // 道具详情路由: #ddragon/item/3153
            switchDDragonTab('items', false);
            // 等待数据加载后显示道具详情
            waitForItemsAndShow(parts[2]);
        } else if (subTab) {
            switchDDragonTab(subTab, false);
        }
    } else if (hash === 'ddragon') {
        // Data Dragon 主标签
        switchMainTab('ddragon', false);
    } else if (hash === 'lcu') {
        // LCU API 测试器
        switchMainTab('lcu', false);
    }
}

// 等待道具数据加载后显示详情
function waitForItemsAndShow(itemId) {
    if (itemsData && itemsData[itemId]) {
        showItemDetail(itemId);
    } else {
        // 等待数据加载
        const checkInterval = setInterval(() => {
            if (itemsData && itemsData[itemId]) {
                clearInterval(checkInterval);
                showItemDetail(itemId);
            }
        }, 100);
        // 5秒超时
        setTimeout(() => clearInterval(checkInterval), 5000);
    }
}

// 监听 hash 变化
window.addEventListener('hashchange', handleRoute);

// ===== 页面初始化 =====
buildPresetList();
connectLCU();

// 页面加载时获取参数（用于自动填充）
fetchParams();

// 初始化路由
handleRoute();
