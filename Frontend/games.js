// ===========================
// SISTEMA DE GESTIÓN DE JUEGOS
// ===========================

let gamesDatabase = [];
let categories = [];
let priceHistory = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadGamesData();
});

// ===========================
// CARGA DE DATOS
// ===========================
async function loadGamesData() {
    try {
        const response = await fetch('data/games.json');
        const data = await response.json();
        
        gamesDatabase = data.games;
        categories = data.categories;
        priceHistory = data.priceHistory;
        
        // Inicializar páginas si es necesario
        if (document.getElementById('games-grid')) {
            initializeGamesPage();
        }
        
        if (document.getElementById('radar-container')) {
            initializeRadarPage();
        }
        
        console.log('Base de datos de juegos cargada:', gamesDatabase.length, 'juegos');
    } catch (error) {
        console.error('Error al cargar la base de datos de juegos:', error);
        // Cargar datos de ejemplo en caso de error
        loadFallbackData();
    }
}

function loadFallbackData() {
    // Datos de ejemplo en caso de que no se pueda cargar el JSON
    gamesDatabase = [
        {
            id: 'cyberpunk-2077',
            name: 'Cyberpunk 2077',
            developer: 'CD Projekt RED',
            genre: ['RPG', 'Action'],
            basePrice: 59.99,
            currentPrice: 29.99,
            discount: 50,
            rating: 7.2,
            image: 'images/free-week.png',
            isFree: false
        },
        {
            id: 'the-witcher-3',
            name: 'The Witcher 3: Wild Hunt',
            developer: 'CD Projekt RED',
            genre: ['RPG', 'Fantasy'],
            basePrice: 29.99,
            currentPrice: 9.99,
            discount: 67,
            rating: 9.7,
            image: 'images/under-5.png',
            isFree: false
        }
    ];
}

// ===========================
// BÚSQUEDA Y FILTROS
// ===========================
function searchGames(query) {
    if (!query || query.length < 2) {
        return gamesDatabase;
    }
    
    const searchTerm = query.toLowerCase();
    return gamesDatabase.filter(game => 
        game.name.toLowerCase().includes(searchTerm) ||
        game.developer.toLowerCase().includes(searchTerm) ||
        game.genre.some(g => g.toLowerCase().includes(searchTerm))
    );
}

function filterGamesByCategory(categoryId) {
    switch (categoryId) {
        case 'free-week':
            return gamesDatabase.filter(game => game.isFree);
        case 'under-5':
            return gamesDatabase.filter(game => game.currentPrice < 5);
        case 'under-2':
            return gamesDatabase.filter(game => game.currentPrice < 2);
        case 'hidden-gems':
            return gamesDatabase.filter(game => game.rating > 8.5 && game.discount > 30);
        case 'early-access':
            return gamesDatabase.filter(game => game.isEarlyAccess);
        case 'wishlist':
            // En una implementación real, esto vendría de la base de datos del usuario
            return getUserWishlist();
        default:
            return gamesDatabase;
    }
}

function filterGamesByGenre(genre) {
    return gamesDatabase.filter(game => 
        game.genre.includes(genre)
    );
}

function filterGamesByPriceRange(minPrice, maxPrice) {
    return gamesDatabase.filter(game => 
        game.currentPrice >= minPrice && game.currentPrice <= maxPrice
    );
}

function sortGames(games, sortBy) {
    const sortedGames = [...games];
    
    switch (sortBy) {
        case 'price-low':
            return sortedGames.sort((a, b) => a.currentPrice - b.currentPrice);
        case 'price-high':
            return sortedGames.sort((a, b) => b.currentPrice - a.currentPrice);
        case 'discount':
            return sortedGames.sort((a, b) => b.discount - a.discount);
        case 'rating':
            return sortedGames.sort((a, b) => b.rating - a.rating);
        case 'name':
            return sortedGames.sort((a, b) => a.name.localeCompare(b.name));
        case 'release-date':
            return sortedGames.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        default:
            return sortedGames;
    }
}

// ===========================
// INFORMACIÓN DE JUEGOS
// ===========================
function getGameById(gameId) {
    return gamesDatabase.find(game => game.id === gameId);
}

function getGamePriceHistory(gameId) {
    return priceHistory[gameId] || [];
}

function getLowestPrice(gameId) {
    const history = getGamePriceHistory(gameId);
    if (history.length === 0) {
        const game = getGameById(gameId);
        return game ? game.currentPrice : 0;
    }
    return Math.min(...history.map(entry => entry.price));
}

function getHighestPrice(gameId) {
    const history = getGamePriceHistory(gameId);
    if (history.length === 0) {
        const game = getGameById(gameId);
        return game ? game.basePrice : 0;
    }
    return Math.max(...history.map(entry => entry.price));
}

function getAveragePrice(gameId) {
    const history = getGamePriceHistory(gameId);
    if (history.length === 0) {
        const game = getGameById(gameId);
        return game ? game.currentPrice : 0;
    }
    const sum = history.reduce((acc, entry) => acc + entry.price, 0);
    return sum / history.length;
}

// ===========================
// RENDERIZADO DE JUEGOS
// ===========================
function renderGameCard(game) {
    const discountBadge = game.discount > 0 ? 
        `<span class="discount-badge">-${game.discount}%</span>` : '';
    
    const freeBadge = game.isFree ? 
        '<span class="free-badge">GRATIS</span>' : '';
    
    const earlyAccessBadge = game.isEarlyAccess ? 
        '<span class="early-access-badge">EARLY ACCESS</span>' : '';

    return `
        <div class="game-card" data-game-id="${game.id}">
            <div class="game-image-container">
                <img src="${game.image}" alt="${game.name}" class="game-image">
                <div class="game-badges">
                    ${discountBadge}
                    ${freeBadge}
                    ${earlyAccessBadge}
                </div>
                <div class="game-overlay">
                    <button class="btn-overlay" onclick="viewGameDetails('${game.id}')">
                        Ver Detalles
                    </button>
                </div>
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.name}</h3>
                <p class="game-developer">${game.developer}</p>
                <div class="game-genres">
                    ${game.genre.slice(0, 2).map(genre => 
                        `<span class="genre-tag">${genre}</span>`
                    ).join('')}
                </div>
                <div class="game-rating">
                    <span class="rating-stars">${generateStarRating(game.rating)}</span>
                    <span class="rating-number">${game.rating}</span>
                </div>
                <div class="game-price">
                    ${game.isFree ? 
                        '<span class="price-free">GRATIS</span>' :
                        `<span class="price-current">$${game.currentPrice}</span>
                         ${game.discount > 0 ? `<span class="price-original">$${game.basePrice}</span>` : ''}`
                    }
                </div>
                <div class="game-actions">
                    <button class="btn-wishlist" onclick="toggleWishlist('${game.id}')" 
                            data-in-wishlist="${isInWishlist(game.id)}">
                        <span class="wishlist-icon">${isInWishlist(game.id) ? '❤️' : '🤍'}</span>
                        Wishlist
                    </button>
                    <button class="btn-price-alert" onclick="createPriceAlert('${game.id}')">
                        🔔 Alerta
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderGamesGrid(games, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (games.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎮</div>
                <p>No se encontraron juegos</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = games.map(game => renderGameCard(game)).join('');
}

// ===========================
// WISHLIST
// ===========================
function getUserWishlist() {
    const wishlistIds = JSON.parse(localStorage.getItem('epicardo_wishlist_ids') || '[]');
    return gamesDatabase.filter(game => wishlistIds.includes(game.id));
}

function isInWishlist(gameId) {
    const wishlistIds = JSON.parse(localStorage.getItem('epicardo_wishlist_ids') || '[]');
    return wishlistIds.includes(gameId);
}

function toggleWishlist(gameId) {
    const wishlistIds = JSON.parse(localStorage.getItem('epicardo_wishlist_ids') || '[]');
    const index = wishlistIds.indexOf(gameId);
    
    if (index > -1) {
        wishlistIds.splice(index, 1);
        showNotification('Juego removido de tu wishlist', 'success');
    } else {
        wishlistIds.push(gameId);
        showNotification('Juego agregado a tu wishlist', 'success');
    }
    
    localStorage.setItem('epicardo_wishlist_ids', JSON.stringify(wishlistIds));
    
    // Actualizar botón
    const button = document.querySelector(`[data-game-id="${gameId}"] .btn-wishlist`);
    if (button) {
        const isInList = wishlistIds.includes(gameId);
        button.setAttribute('data-in-wishlist', isInList);
        button.querySelector('.wishlist-icon').textContent = isInList ? '❤️' : '🤍';
    }
    
    // Actualizar contador en dashboard si existe
    if (typeof updateDashboardStats === 'function') {
        updateDashboardStats();
    }
}

// ===========================
// ALERTAS DE PRECIO
// ===========================
function createPriceAlert(gameId) {
    const game = getGameById(gameId);
    if (!game) return;
    
    // Mostrar modal de alerta (reutilizar el del dashboard)
    const modal = document.getElementById('alertModal');
    if (modal) {
        document.getElementById('gameName').value = game.name;
        document.getElementById('targetPrice').value = (game.currentPrice * 0.8).toFixed(2);
        modal.classList.add('show');
    } else {
        // Si no hay modal, crear alerta simple
        const targetPrice = prompt(`¿A qué precio quieres que te avisemos cuando baje ${game.name}? (USD)`, 
                                  (game.currentPrice * 0.8).toFixed(2));
        
        if (targetPrice && !isNaN(targetPrice)) {
            addPriceAlert({
                gameId: gameId,
                gameName: game.name,
                targetPrice: parseFloat(targetPrice),
                currentPrice: game.currentPrice
            });
        }
    }
}

function addPriceAlert(alertData) {
    const alerts = JSON.parse(localStorage.getItem('epicardo_price_alerts') || '[]');
    
    // Evitar duplicados
    const existingAlert = alerts.find(alert => alert.gameId === alertData.gameId);
    if (existingAlert) {
        showNotification('Ya tienes una alerta para este juego', 'warning');
        return;
    }
    
    alerts.push({
        id: 'alert_' + Date.now(),
        ...alertData,
        createdDate: new Date().toISOString(),
        active: true
    });
    
    localStorage.setItem('epicardo_price_alerts', JSON.stringify(alerts));
    showNotification('Alerta de precio creada', 'success');
}

// ===========================
// DETALLES DE JUEGO
// ===========================
function viewGameDetails(gameId) {
    const game = getGameById(gameId);
    if (!game) return;
    
    // Crear modal de detalles
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content game-details-modal">
            <div class="modal-header">
                <h3>${game.name}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="game-details-content">
                <div class="game-details-image">
                    <img src="${game.image}" alt="${game.name}">
                </div>
                <div class="game-details-info">
                    <div class="game-meta">
                        <div class="meta-item">
                            <strong>Desarrollador:</strong> ${game.developer}
                        </div>
                        <div class="meta-item">
                            <strong>Géneros:</strong> ${game.genre.join(', ')}
                        </div>
                        <div class="meta-item">
                            <strong>Fecha de lanzamiento:</strong> ${formatDate(game.releaseDate)}
                        </div>
                        <div class="meta-item">
                            <strong>Calificación:</strong> ${game.rating}/10
                        </div>
                    </div>
                    <div class="game-description">
                        <h4>Descripción</h4>
                        <p>${game.description}</p>
                    </div>
                    <div class="game-price-details">
                        <div class="price-info">
                            <span class="current-price">$${game.currentPrice}</span>
                            ${game.discount > 0 ? `<span class="original-price">$${game.basePrice}</span>` : ''}
                            ${game.discount > 0 ? `<span class="discount">-${game.discount}%</span>` : ''}
                        </div>
                        <div class="price-history">
                            <h5>Historial de precios</h5>
                            <div class="price-chart" id="priceChart_${gameId}"></div>
                        </div>
                    </div>
                    <div class="game-actions-details">
                        <button class="btn-primary" onclick="toggleWishlist('${gameId}'); this.closest('.modal').remove();">
                            ${isInWishlist(gameId) ? 'Remover de Wishlist' : 'Agregar a Wishlist'}
                        </button>
                        <button class="btn-secondary" onclick="createPriceAlert('${gameId}'); this.closest('.modal').remove();">
                            Crear Alerta de Precio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ===========================
// UTILIDADES
// ===========================
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + 
           (hasHalfStar ? '⭐' : '') + 
           '☆'.repeat(emptyStars);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// ===========================
// INICIALIZACIÓN DE PÁGINAS
// ===========================
function initializeGamesPage() {
    // Si estamos en una página de juegos específica
    const category = getUrlParameter('category');
    if (category) {
        const games = filterGamesByCategory(category);
        renderGamesGrid(games, 'games-grid');
    }
}

function initializeRadarPage() {
    // Actualizar las páginas del radar con juegos reales
    updateRadarPages();
}

function updateRadarPages() {
    categories.forEach(category => {
        const games = filterGamesByCategory(category.id);
        const categoryGames = games.slice(0, 6); // Mostrar máximo 6 juegos por categoría
        
        // Actualizar la página correspondiente
        const pageMap = {
            'free-week': 'free-week.html',
            'under-5': 'under-5.html',
            'under-2': 'under-2.html',
            'hidden-gems': 'hidden-gems.html',
            'early-access': 'early-access.html',
            'wishlist': 'wishlist.html'
        };
        
        // Si estamos en la página correcta, actualizar el contenido
        if (window.location.pathname.includes(pageMap[category.id])) {
            renderGamesGrid(categoryGames, 'games-grid');
        }
    });
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// ===========================
// ANÁLISIS DE PRECIOS
// ===========================
function getPriceTrend(gameId) {
    const history = getGamePriceHistory(gameId);
    if (history.length < 2) return 'stable';
    
    const recent = history[history.length - 1];
    const previous = history[history.length - 2];
    
    if (recent.price < previous.price) return 'down';
    if (recent.price > previous.price) return 'up';
    return 'stable';
}

function getBestTimeToBuy(gameId) {
    const history = getGamePriceHistory(gameId);
    if (history.length === 0) return null;
    
    // Encontrar el precio más bajo histórico
    const lowestPrice = Math.min(...history.map(entry => entry.price));
    const lowestEntry = history.find(entry => entry.price === lowestPrice);
    
    return {
        price: lowestPrice,
        date: lowestEntry.date,
        savings: getGameById(gameId).basePrice - lowestPrice
    };
}

function getSimilarGames(gameId, limit = 5) {
    const game = getGameById(gameId);
    if (!game) return [];
    
    // Encontrar juegos con géneros similares
    const similarGames = gamesDatabase.filter(otherGame => 
        otherGame.id !== gameId &&
        otherGame.genre.some(genre => game.genre.includes(genre))
    );
    
    // Ordenar por similitud (más géneros en común = más similar)
    similarGames.sort((a, b) => {
        const aCommonGenres = a.genre.filter(genre => game.genre.includes(genre)).length;
        const bCommonGenres = b.genre.filter(genre => game.genre.includes(genre)).length;
        return bCommonGenres - aCommonGenres;
    });
    
    return similarGames.slice(0, limit);
}

// ===========================
// EXPORTAR FUNCIONES GLOBALES
// ===========================
window.searchGames = searchGames;
window.filterGamesByCategory = filterGamesByCategory;
window.getGameById = getGameById;
window.toggleWishlist = toggleWishlist;
window.createPriceAlert = createPriceAlert;
window.viewGameDetails = viewGameDetails;
window.renderGamesGrid = renderGamesGrid;
window.getUserWishlist = getUserWishlist;
window.isInWishlist = isInWishlist;








