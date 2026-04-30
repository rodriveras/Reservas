/**
 * Módulo de Interfaz de Usuario y Dashboard
 */
const UI = {
    init() {
        // Evento cerrar BottomSheet
        document.getElementById('bs-overlay').onclick = () => this.closeCabinSheet();
        
        // Evento cambio de fecha
        document.getElementById('master-date-filter').onchange = (e) => {
            APP.updateData(e.target.value);
        };
    },

    updateDashboard(stats) {
        if (!stats) return;
        
        // Animación suave de valores
        this._animateValue("kpi-occ", stats.ocupacion, "%");
        this._animateValue("kpi-rev", stats.revpar, "$ ", true);
        this._animateValue("kpi-alert", stats.disponibles, ""); // O cualquier otro stat
    },

    openCabinSheet(p) {
        const content = `
            <div class="cabin-detail">
                <div class="status-badge" style="background:${CONFIG.COLORS[p.estado]}">
                    ${p.estado_txt || p.estado}
                </div>
                <h2>${p.nombre}</h2>
                <div style="font-size: 20px; font-weight: 800; color: var(--success); margin-bottom: 20px;">
                    $ ${p.precio.toLocaleString('es-CL')}
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.08);">
                    <small style="color: var(--text-dim); text-transform: uppercase; font-size: 10px; font-weight: 700;">Estado de Mantención</small>
                    <p style="margin-top: 5px; font-size: 14px;">${p.mantenimiento}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <a href="${p.wa}" target="_blank" class="btn-primary" style="background: #25d366;">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                    <a href="${p.gps}" target="_blank" class="btn-primary" style="background: var(--surface-light);">
                        <i class="fas fa-location-arrow"></i> Navegar
                    </a>
                </div>
            </div>
        `;
        
        document.getElementById('sheet-data').innerHTML = content;
        document.getElementById('cabin-sheet').classList.add('active');
        document.getElementById('bs-overlay').classList.add('active');
    },

    closeCabinSheet() {
        document.getElementById('cabin-sheet').classList.remove('active');
        document.getElementById('bs-overlay').classList.remove('active');
    },

    showLoading(show) {
        const pill = document.getElementById('sync-status');
        pill.innerHTML = show ? 
            '<i class="fas fa-sync fa-spin"></i> Sincronizando...' : 
            '<i class="fas fa-check-circle" style="color:var(--success)"></i> Actualizado';
    },

    _animateValue(id, end, prefix = "", isMoney = false) {
        const obj = document.getElementById(id);
        const start = 0;
        const duration = 1000;
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = Math.floor(progress * (end - start) + start);
            
            if (isMoney) {
                obj.innerHTML = prefix + val.toLocaleString('es-CL');
            } else {
                obj.innerHTML = val + prefix;
            }
            
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }
};
