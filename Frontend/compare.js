// ===========================
// COMPARADOR DE PRECIOS
// ===========================

let comparisonGames = [];
let searchResults = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeComparer();
    setupEventListeners();
});

// ===========================
// INICIALIZACIÓN
// ===========================
function initializeComparer() {
    // Cargar comparación guardada
    loadSavedComparison();
    
    // Configurar búsqueda en tiempo real
    setupSearch();
}

function setupEventListeners() {
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('gameSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchGames();
            }
        });
    }
}

function setupSearch() {
    // Configurar autocompletado
    const searchInput = document.getElementById('gameSearch');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            if (searchResults.length > 0) {
                showSearchResults(searchResults);
            }
        });
        
        searchInput.addEventListener('blur', function() {
            // Delay para permitir clicks en los resultados
            setTimeout(() => {
                hideSearchResults();
            }, 200);
        });
    }
}

// ===========================
// BÚSQUEDA DE JUEGOS
// ===========================
function handleSearch(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    
    const results = searchGames(query);
    searchResults = results;
    showSearchResults(results);
}

function searchGames(query = null) {
    const searchTerm = query || document.getElementById('gameSearch').value.trim();
    
    if (searchTerm.length < 2) {
        return [];
    }
    
    // Buscar en la base de datos de juegos
    const results = window.searchGames ? window.searchGames(searchTerm) : [];
    
    // Limitar resultados
    return results.slice(0, 8);
}

function showSearchResults(results) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="search-empty">
                <p>No se encontraron juegos</p>
            </div>
        `;
        container.style.display = 'block';
        return;
    }
    
    container.innerHTML = results.map(game => `
        <div class="search-result-item" onclick="addToComparison('${game.id}')">
            <img src="${game.image}" alt="${game.name}" class="search-result-image">
            <div class="search-result-info">
                <h4>${game.name}</h4>
                <p class="search-result-developer">${game.developer}</p>
                <div class="search-result-price">
                    <span class="current-price">$${game.currentPrice}</span>
                    ${game.discount > 0 ? `<span class="original-price">$${game.basePrice}</span>` : ''}
                    ${game.discount > 0 ? `<span class="discount-badge">-${game.discount}%</span>` : ''}
                </div>
            </div>
            <div class="search-result-actions">
                <button class="btn-add" onclick="event.stopPropagation(); addToComparison('${game.id}')">
                    ➕ Agregar
                </button>
            </div>
        </div>
    `).join('');
    
    container.style.display = 'block';
}

function hideSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) {
        container.style.display = 'none';
    }
}

// ===========================
// GESTIÓN DE COMPARACIÓN
// ===========================
function addToComparison(gameId) {
    // Verificar si el juego ya está en la comparación
    if (comparisonGames.find(game => game.id === gameId)) {
        showNotification('Este juego ya está en la comparación', 'warning');
        return;
    }
    
    // Limitar a 4 juegos máximo
    if (comparisonGames.length >= 4) {
        showNotification('Máximo 4 juegos en la comparación', 'warning');
        return;
    }
    
    const game = window.getGameById ? window.getGameById(gameId) : null;
    if (!game) {
        showNotification('Juego no encontrado', 'error');
        return;
    }
    
    // Agregar datos de comparación
    const comparisonGame = {
        ...game,
        comparisonData: {
            epicPrice: game.currentPrice,
            steamPrice: generateSteamPrice(game.currentPrice),
            gogPrice: generateGOGPrice(game.currentPrice),
            humblePrice: generateHumblePrice(game.currentPrice),
            bestPrice: Math.min(game.currentPrice, generateSteamPrice(game.currentPrice), generateGOGPrice(game.currentPrice), generateHumblePrice(game.currentPrice)),
            bestStore: findBestStore(game.currentPrice)
        }
    };
    
    comparisonGames.push(comparisonGame);
    saveComparison();
    renderComparison();
    updateComparisonStats();
    
    // Limpiar búsqueda
    document.getElementById('gameSearch').value = '';
    hideSearchResults();
    
    showNotification(`${game.name} agregado a la comparación`, 'success');
}

function removeFromComparison(gameId) {
    comparisonGames = comparisonGames.filter(game => game.id !== gameId);
    saveComparison();
    renderComparison();
    updateComparisonStats();
    
    showNotification('Juego removido de la comparación', 'success');
}

function clearComparison() {
    comparisonGames = [];
    saveComparison();
    renderComparison();
    updateComparisonStats();
    
    showNotification('Comparación limpiada', 'success');
}

// ===========================
// GENERACIÓN DE PRECIOS SIMULADOS
// ===========================
function generateSteamPrice(epicPrice) {
    // Steam suele ser un poco más caro
    const variation = (Math.random() - 0.5) * 0.2; // ±10%
    return Math.max(epicPrice * (1 + variation), epicPrice * 0.9);
}

function generateGOGPrice(epicPrice) {
    // GOG suele tener precios similares
    const variation = (Math.random() - 0.5) * 0.15; // ±7.5%
    return Math.max(epicPrice * (1 + variation), epicPrice * 0.85);
}

function generateHumblePrice(epicPrice) {
    // Humble Bundle suele tener mejores precios
    const variation = (Math.random() - 0.5) * 0.1; // ±5%
    return Math.max(epicPrice * (1 + variation - 0.1), epicPrice * 0.8);
}

function findBestStore(epicPrice) {
    const steamPrice = generateSteamPrice(epicPrice);
    const gogPrice = generateGOGPrice(epicPrice);
    const humblePrice = generateHumblePrice(epicPrice);
    
    const prices = [
        { store: 'Epic', price: epicPrice },
        { store: 'Steam', price: steamPrice },
        { store: 'GOG', price: gogPrice },
        { store: 'Humble', price: humblePrice }
    ];
    
    return prices.reduce((best, current) => 
        current.price < best.price ? current : best
    );
}

// ===========================
// RENDERIZADO
// ===========================
function renderComparison() {
    const container = document.getElementById('comparisonGrid');
    if (!container) return;
    
    if (comparisonGames.length === 0) {
        container.innerHTML = `
            <div class="empty-comparison">
                <div class="empty-icon">🎮</div>
                <p>Agregá juegos para comparar precios</p>
                <p class="muted">Usá la búsqueda de arriba para encontrar juegos</p>
            </div>
        `;
        document.getElementById('comparisonStats').style.display = 'none';
        return;
    }
    
    container.innerHTML = comparisonGames.map(game => renderComparisonCard(game)).join('');
    document.getElementById('comparisonStats').style.display = 'block';
}

function renderComparisonCard(game) {
    const { comparisonData } = game;
    const savings = game.currentPrice - comparisonData.bestPrice;
    const savingsPercent = ((savings / game.currentPrice) * 100).toFixed(1);
    
    return `
        <div class="comparison-card" data-game-id="${game.id}">
            <div class="comparison-header">
                <img src="${game.image}" alt="${game.name}" class="comparison-image">
                <div class="comparison-title">
                    <h3>${game.name}</h3>
                    <p class="comparison-developer">${game.developer}</p>
                </div>
                <button class="remove-btn" onclick="removeFromComparison('${game.id}')">×</button>
            </div>
            
            <div class="price-comparison">
                <div class="price-store ${comparisonData.bestStore.store.toLowerCase()}">
                    <div class="store-info">
                        <span class="store-name">${comparisonData.bestStore.store}</span>
                        <span class="store-badge best">MEJOR PRECIO</span>
                    </div>
                    <div class="price-info">
                        <span class="price-amount">$${comparisonData.bestPrice.toFixed(2)}</span>
                        ${savings > 0 ? `<span class="savings">Ahorras $${savings.toFixed(2)} (${savingsPercent}%)</span>` : ''}
                    </div>
                </div>
                
                <div class="other-prices">
                    ${renderStorePrice('Epic', comparisonData.epicPrice, game.currentPrice, 'epic')}
                    ${renderStorePrice('Steam', comparisonData.steamPrice, game.currentPrice, 'steam')}
                    ${renderStorePrice('GOG', comparisonData.gogPrice, game.currentPrice, 'gog')}
                    ${renderStorePrice('Humble', comparisonData.humblePrice, game.currentPrice, 'humble')}
                </div>
            </div>
            
            <div class="comparison-actions">
                <button class="btn-primary" onclick="openStore('${game.id}', '${comparisonData.bestStore.store.toLowerCase()}')">
                    Comprar en ${comparisonData.bestStore.store}
                </button>
                <button class="btn-secondary" onclick="addToWishlist('${game.id}')">
                    🤍 Wishlist
                </button>
            </div>
        </div>
    `;
}

function renderStorePrice(storeName, price, epicPrice, storeClass) {
    const isBest = price === Math.min(price, epicPrice, generateSteamPrice(epicPrice), generateGOGPrice(epicPrice), generateHumblePrice(epicPrice));
    const isEpic = storeName === 'Epic';
    
    return `
        <div class="store-price ${storeClass} ${isBest ? 'best-price' : ''}">
            <span class="store-label">${storeName}</span>
            <span class="store-price-amount">$${price.toFixed(2)}</span>
            ${isBest ? '<span class="best-indicator">🏆</span>' : ''}
            ${isEpic ? '<span class="epic-badge">Epic</span>' : ''}
        </div>
    `;
}

// ===========================
// ESTADÍSTICAS
// ===========================
function updateComparisonStats() {
    if (comparisonGames.length === 0) return;
    
    // Calcular ahorro total
    const totalSavings = comparisonGames.reduce((total, game) => {
        const savings = game.currentPrice - game.comparisonData.bestPrice;
        return total + savings;
    }, 0);
    
    // Contar mejores ofertas
    const bestDeals = comparisonGames.filter(game => 
        game.comparisonData.bestPrice < game.currentPrice
    ).length;
    
    // Calcular descuento promedio
    const totalDiscount = comparisonGames.reduce((total, game) => {
        const discount = ((game.currentPrice - game.comparisonData.bestPrice) / game.currentPrice) * 100;
        return total + discount;
    }, 0);
    const averageDiscount = totalDiscount / comparisonGames.length;
    
    // Actualizar UI
    document.getElementById('totalSavings').textContent = `$${totalSavings.toFixed(2)}`;
    document.getElementById('bestDeals').textContent = bestDeals;
    document.getElementById('averageDiscount').textContent = `${averageDiscount.toFixed(1)}%`;
}

// ===========================
// ACCIONES
// ===========================
function openStore(gameId, storeName) {
    const game = comparisonGames.find(g => g.id === gameId);
    if (!game) return;
    
    // En una implementación real, esto abriría la tienda correspondiente
    const storeUrls = {
        'epic': 'https://store.epicgames.com/',
        'steam': 'https://store.steampowered.com/',
        'gog': 'https://www.gog.com/',
        'humble': 'https://www.humblebundle.com/'
    };
    
    const url = storeUrls[storeName] || storeUrls.epic;
    window.open(url, '_blank');
    
    showNotification(`Redirigiendo a ${storeName}...`, 'info');
}

function addToWishlist(gameId) {
    if (window.toggleWishlist) {
        window.toggleWishlist(gameId);
    } else {
        showNotification('Funcionalidad de wishlist no disponible', 'warning');
    }
}

// ===========================
// PERSISTENCIA
// ===========================
function saveComparison() {
    localStorage.setItem('epicardo_comparison', JSON.stringify(comparisonGames));
}

function loadSavedComparison() {
    const saved = localStorage.getItem('epicardo_comparison');
    if (saved) {
        try {
            comparisonGames = JSON.parse(saved);
            renderComparison();
            updateComparisonStats();
        } catch (error) {
            console.error('Error al cargar comparación guardada:', error);
        }
    }
}

// ===========================
// UTILIDADES
// ===========================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===========================
// FUNCIONES GLOBALES
// ===========================
window.addToComparison = addToComparison;
window.removeFromComparison = removeFromComparison;
window.clearComparison = clearComparison;
window.searchGames = searchGames;








