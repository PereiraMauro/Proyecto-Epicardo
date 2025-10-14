// ===========================
// DASHBOARD FUNCTIONALITY
// ===========================

let priceChart = null;
let userWishlist = [];
let userAlerts = [];
let userActivity = [];

// Inicialización del dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadUserData();
    setupEventListeners();
});

// ===========================
// INICIALIZACIÓN
// ===========================
function initializeDashboard() {
    // Actualizar información del usuario
    updateUserInfo();
    
    // Inicializar gráfico de precios
    initializePriceChart();
    
    // Cargar datos del usuario
    loadUserWishlist();
    loadUserAlerts();
    loadUserActivity();
    
    // Actualizar estadísticas
    updateDashboardStats();
}

function updateUserInfo() {
    // Dashboard simplificado sin sistema de usuarios
    console.log('Dashboard inicializado');
}

// ===========================
// GESTIÓN DE DATOS
// ===========================
function loadUserData() {
    // Cargar datos del localStorage (en producción sería desde API)
    const savedWishlist = localStorage.getItem('epicardo_wishlist');
    const savedAlerts = localStorage.getItem('epicardo_alerts');
    const savedActivity = localStorage.getItem('epicardo_activity');
    
    if (savedWishlist) {
        userWishlist = JSON.parse(savedWishlist);
    }
    
    if (savedAlerts) {
        userAlerts = JSON.parse(savedAlerts);
    }
    
    if (savedActivity) {
        userActivity = JSON.parse(savedActivity);
    } else {
        // Datos de ejemplo
        userActivity = [
            {
                type: 'add_wishlist',
                game: 'Cyberpunk 2077',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                type: 'create_alert',
                game: 'The Witcher 3',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                type: 'price_drop',
                game: 'Hades',
                discount: 40,
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        saveUserActivity();
    }
}

function saveUserWishlist() {
    localStorage.setItem('epicardo_wishlist', JSON.stringify(userWishlist));
}

function saveUserAlerts() {
    localStorage.setItem('epicardo_alerts', JSON.stringify(userAlerts));
}

function saveUserActivity() {
    localStorage.setItem('epicardo_activity', JSON.stringify(userActivity));
}

// ===========================
// WISHLIST
// ===========================
function loadUserWishlist() {
    const wishlistPreview = document.getElementById('wishlistPreview');
    
    if (userWishlist.length === 0) {
        wishlistPreview.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>Tu wishlist está vacía</p>
                <a href="radar.html" class="btn-secondary">Explorar juegos</a>
            </div>
        `;
        return;
    }
    
    // Mostrar los primeros 3 juegos
    const previewItems = userWishlist.slice(0, 3);
    
    wishlistPreview.innerHTML = previewItems.map(game => `
        <div class="wishlist-item">
            <img src="${game.image}" alt="${game.name}" class="wishlist-image">
            <div class="wishlist-info">
                <h4>${game.name}</h4>
                <p class="wishlist-price">$${game.currentPrice}</p>
                <span class="wishlist-badge ${game.discount > 0 ? 'discount' : 'normal'}">
                    ${game.discount > 0 ? `-${game.discount}%` : 'Sin descuento'}
                </span>
            </div>
            <button class="remove-btn" onclick="removeFromWishlist('${game.id}')">×</button>
        </div>
    `).join('');
}

function removeFromWishlist(gameId) {
    userWishlist = userWishlist.filter(game => game.id !== gameId);
    saveUserWishlist();
    loadUserWishlist();
    updateDashboardStats();
    
    // Agregar a actividad
    const game = userWishlist.find(g => g.id === gameId);
    if (game) {
        addActivity('remove_wishlist', game.name);
    }
    
    showNotification('Juego removido de tu wishlist', 'success');
}

function addToWishlist(gameData) {
    const existingGame = userWishlist.find(game => game.id === gameData.id);
    
    if (existingGame) {
        showNotification('Este juego ya está en tu wishlist', 'warning');
        return;
    }
    
    userWishlist.push({
        ...gameData,
        addedDate: new Date().toISOString()
    });
    
    saveUserWishlist();
    loadUserWishlist();
    updateDashboardStats();
    
    addActivity('add_wishlist', gameData.name);
    showNotification('Juego agregado a tu wishlist', 'success');
}

// ===========================
// ALERTAS DE PRECIO
// ===========================
function loadUserAlerts() {
    const alertsList = document.getElementById('alertsList');
    
    if (userAlerts.length === 0) {
        alertsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔔</div>
                <p>No tienes alertas configuradas</p>
                <button class="btn-secondary" onclick="addPriceAlert()">Crear alerta</button>
            </div>
        `;
        return;
    }
    
    alertsList.innerHTML = userAlerts.map(alert => `
        <div class="alert-item">
            <div class="alert-info">
                <h4>${alert.gameName}</h4>
                <p>Alerta cuando baje de $${alert.targetPrice}</p>
                <span class="alert-status ${alert.active ? 'active' : 'inactive'}">
                    ${alert.active ? 'Activa' : 'Inactiva'}
                </span>
            </div>
            <div class="alert-actions">
                <button class="btn-icon" onclick="toggleAlert('${alert.id}')">
                    ${alert.active ? '⏸️' : '▶️'}
                </button>
                <button class="btn-icon delete" onclick="deleteAlert('${alert.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function addPriceAlert() {
    document.getElementById('alertModal').classList.add('show');
}

function closeModal() {
    document.getElementById('alertModal').classList.remove('show');
    document.getElementById('alertForm').reset();
}

function toggleAlert(alertId) {
    const alert = userAlerts.find(a => a.id === alertId);
    if (alert) {
        alert.active = !alert.active;
        saveUserAlerts();
        loadUserAlerts();
        updateDashboardStats();
    }
}

function deleteAlert(alertId) {
    userAlerts = userAlerts.filter(alert => alert.id !== alertId);
    saveUserAlerts();
    loadUserAlerts();
    updateDashboardStats();
    showNotification('Alerta eliminada', 'success');
}

// ===========================
// FORMULARIO DE ALERTA
// ===========================
document.getElementById('alertForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newAlert = {
        id: 'alert_' + Date.now(),
        gameName: formData.get('gameName'),
        targetPrice: parseFloat(formData.get('targetPrice')),
        alertType: formData.get('alertType'),
        active: true,
        createdDate: new Date().toISOString()
    };
    
    userAlerts.push(newAlert);
    saveUserAlerts();
    loadUserAlerts();
    updateDashboardStats();
    
    addActivity('create_alert', newAlert.gameName);
    closeModal();
    
    showNotification('Alerta creada exitosamente', 'success');
});

// ===========================
// ACTIVIDAD
// ===========================
function loadUserActivity() {
    const activityList = document.getElementById('activityList');
    
    if (userActivity.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📈</div>
                <p>No hay actividad reciente</p>
            </div>
        `;
        return;
    }
    
    // Mostrar las últimas 5 actividades
    const recentActivity = userActivity.slice(0, 5);
    
    activityList.innerHTML = recentActivity.map(activity => {
        const timeAgo = getTimeAgo(activity.timestamp);
        const icon = getActivityIcon(activity.type);
        const message = getActivityMessage(activity);
        
        return `
            <div class="activity-item">
                <div class="activity-icon">${icon}</div>
                <div class="activity-content">
                    <p>${message}</p>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
}

function addActivity(type, gameName, extraData = {}) {
    const activity = {
        type: type,
        game: gameName,
        timestamp: new Date().toISOString(),
        ...extraData
    };
    
    userActivity.unshift(activity);
    
    // Mantener solo las últimas 50 actividades
    if (userActivity.length > 50) {
        userActivity = userActivity.slice(0, 50);
    }
    
    saveUserActivity();
    loadUserActivity();
}

function getActivityIcon(type) {
    const icons = {
        'add_wishlist': '➕',
        'remove_wishlist': '➖',
        'create_alert': '🔔',
        'delete_alert': '🔕',
        'price_drop': '💰',
        'register': '🎉'
    };
    return icons[type] || '📝';
}

function getActivityMessage(activity) {
    const messages = {
        'add_wishlist': `Agregaste <strong>${activity.game}</strong> a tu wishlist`,
        'remove_wishlist': `Removiste <strong>${activity.game}</strong> de tu wishlist`,
        'create_alert': `Creaste una alerta para <strong>${activity.game}</strong>`,
        'delete_alert': `Eliminaste la alerta de <strong>${activity.game}</strong>`,
        'price_drop': `Detectaste una oferta en <strong>${activity.game}</strong> (-${activity.discount}%)`,
        'register': 'Te registraste en Epicardo'
    };
    return messages[activity.type] || 'Actividad en Epicardo';
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Hace unos segundos';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
}

// ===========================
// GRÁFICO DE PRECIOS
// ===========================
function initializePriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Datos de ejemplo (en producción vendrían de la API)
    const chartData = generateSamplePriceData();
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Precio Promedio (USD)',
                data: chartData.values,
                borderColor: '#19d4a6',
                backgroundColor: 'rgba(25, 212, 166, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#19d4a6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(36, 52, 71, 0.3)'
                    },
                    ticks: {
                        color: '#a3b5c8'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(36, 52, 71, 0.3)'
                    },
                    ticks: {
                        color: '#a3b5c8',
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function generateSamplePriceData() {
    const days = 30;
    const labels = [];
    const values = [];
    
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
        
        // Generar datos simulados con tendencia
        const basePrice = 25;
        const variation = (Math.random() - 0.5) * 10;
        const trend = (days - i) * 0.1; // Tendencia ligeramente descendente
        values.push(Math.max(10, basePrice + variation - trend));
    }
    
    return { labels, values };
}

function updateChart(period) {
    // Actualizar el gráfico según el período seleccionado
    const chartData = generateSamplePriceData(parseInt(period));
    
    priceChart.data.labels = chartData.labels;
    priceChart.data.datasets[0].data = chartData.values;
    priceChart.update();
}

// ===========================
// ESTADÍSTICAS
// ===========================
function updateDashboardStats() {
    // Actualizar contador de wishlist
    document.getElementById('wishlistCount').textContent = userWishlist.length;
    
    // Calcular dinero ahorrado (simulación)
    const savedMoney = userWishlist.reduce((total, game) => {
        if (game.discount > 0) {
            const originalPrice = game.currentPrice / (1 - game.discount / 100);
            return total + (originalPrice - game.currentPrice);
        }
        return total;
    }, 0);
    
    document.getElementById('savedMoney').textContent = `$${savedMoney.toFixed(2)}`;
    
    // Actualizar alertas activas
    const activeAlerts = userAlerts.filter(alert => alert.active).length;
    document.getElementById('activeAlerts').textContent = activeAlerts;
}

// ===========================
// EVENT LISTENERS
// ===========================
function setupEventListeners() {
    // Selector de período del gráfico
    document.getElementById('chartSelector').addEventListener('change', function(e) {
        updateChart(e.target.value);
    });
    
    // Configuraciones rápidas
    document.getElementById('emailAlerts').addEventListener('change', function(e) {
        updateUserPreference('emailAlerts', e.target.checked);
    });
    
    document.getElementById('pushNotifications').addEventListener('change', function(e) {
        updateUserPreference('pushNotifications', e.target.checked);
    });
    
    document.getElementById('weeklyDigest').addEventListener('change', function(e) {
        updateUserPreference('weeklyDigest', e.target.checked);
    });
    
    // Cerrar modal al hacer click fuera
    document.getElementById('alertModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

function updateUserPreference(key, value) {
    // Guardar preferencias sin sistema de usuarios
    const preferences = localStorage.getItem('epicardo_preferences') || '{}';
    const userPrefs = JSON.parse(preferences);
    userPrefs[key] = value;
    localStorage.setItem('epicardo_preferences', JSON.stringify(userPrefs));
    
    showNotification(`Preferencia ${value ? 'activada' : 'desactivada'}`, 'success');
}

// ===========================
// NOTIFICACIONES PUSH
// ===========================
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                showNotification('Notificaciones activadas', 'success');
            } else {
                showNotification('Notificaciones bloqueadas', 'warning');
            }
        });
    }
}

function sendTestNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Epicardo - Test', {
            body: 'Las notificaciones están funcionando correctamente',
            icon: 'logo.png'
        });
    }
}

// ===========================
// UTILIDADES
// ===========================
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}







