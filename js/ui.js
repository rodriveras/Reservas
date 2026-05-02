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
        
        // Calcular libres
        const libres = (stats.total || 0) - (stats.ocupadas || 0);
        
        // Animación suave de valores
        this._animateValue("kpi-libres", libres, "");
        this._animateValue("kpi-ocupadas", stats.ocupadas || 0, "");
        this._animateValue("kpi-ingresos", stats.ingresos || 0, "$ ", true);
    },

    openCabinSheet(p) {
        // Renderizado del bloque de cliente si existe
        // Intento de enriquecer los datos desde memoria si existen
        if (typeof CALENDAR !== 'undefined' && CALENDAR.allData) {
            const res = CALENDAR.allData.reservas.find(r => r.cliente === p.cliente);
            if (res) {
                p.pasajeros = p.pasajeros || res.pasajeros;
                p.mascota = p.mascota || res.mascota;
                p.tina = p.tina || res.tina;
                p.celular = p.celular || res.celular;
                p.rrss = p.rrss || res.rrss;
                p.email = p.email || res.email;
            }
        }

        const checkMascota = p.mascota && typeof p.mascota === 'string' && p.mascota.toLowerCase().includes('s');
        const checkTina = p.tina && typeof p.tina === 'string' && p.tina.toLowerCase().includes('s');

        const infoCliente = p.cliente ? `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid var(--success);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <small style="color: var(--text-dim); text-transform: uppercase; font-size: 10px; font-weight: 800;">Huésped Actual</small>
                </div>
                
                <div style="display: flex; align-items: center; margin-top: 5px;">
                    <i class="fas fa-user" style="font-size: 18px; margin-right: 10px; color: var(--success);"></i>
                    <span style="font-size: 18px; font-weight: 600; color: var(--text-main);">${p.cliente}</span>
                </div>
                
                ${(p.celular || p.email || p.rrss) ? `
                <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05); display:grid; gap:8px;">
                    ${p.celular ? `<div style="font-size:13px; color:var(--text-dim); display:flex; align-items:center; gap:8px;"><i class="fas fa-phone" style="width:14px; text-align:center;"></i> ${p.celular}</div>` : ''}
                    ${p.email ? `<div style="font-size:13px; color:var(--text-dim); display:flex; align-items:center; gap:8px;"><i class="fas fa-envelope" style="width:14px; text-align:center;"></i> ${p.email}</div>` : ''}
                    ${p.rrss ? `<div style="font-size:13px; color:var(--text-dim); display:flex; align-items:center; gap:8px;"><i class="fab fa-instagram" style="width:14px; text-align:center;"></i> ${p.rrss}</div>` : ''}
                </div>
                ` : ''}
                
                ${(p.pasajeros || checkMascota || checkTina) ? `
                <div style="margin-top: 15px; display:flex; flex-wrap:wrap; gap:10px;">
                    ${p.pasajeros ? `<span style="background:rgba(217,119,54,0.15); color:var(--primary); padding:6px 12px; border-radius:8px; font-size:12px; font-weight:800; display:flex; align-items:center; gap:6px;"><i class="fas fa-users" style="font-size:14px;"></i> ${p.pasajeros} Pasajeros</span>` : ''}
                    ${checkMascota ? `<span style="background:rgba(217,119,54,0.15); color:var(--primary); padding:6px 12px; border-radius:8px; font-size:12px; font-weight:800; display:flex; align-items:center; gap:6px;"><i class="fas fa-paw" style="font-size:14px;"></i> Mascota</span>` : ''}
                    ${checkTina ? `<span style="background:rgba(217,119,54,0.15); color:var(--primary); padding:6px 12px; border-radius:8px; font-size:12px; font-weight:800; display:flex; align-items:center; gap:6px;"><i class="fas fa-hot-tub" style="font-size:14px;"></i> Tina</span>` : ''}
                </div>
                ` : ''}
            </div>
        ` : '';

        // Estado de pago eliminado por petición del usuario

        const content = `
            <div class="cabin-detail">
                <div class="status-badge" style="background:${CONFIG.COLORS[p.estado]}">
                    ${p.estado_txt || p.estado}
                </div>
                <h2>${p.nombre}</h2>
                <div style="font-size: 20px; font-weight: 800; color: var(--success); margin-bottom: 20px; display:flex; align-items:center; gap: 10px;">
                    $ ${parseFloat(p.precio).toLocaleString('es-CL')}
                    <button onclick="UI.editBasePrice('${p.id_cabana}', ${p.precio})" style="background:transparent; border:none; color:var(--text-dim); cursor:pointer;" title="Cambiar precio base de esta cabaña">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                
                ${infoCliente}
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.08);">
                    <small style="color: var(--text-dim); text-transform: uppercase; font-size: 10px; font-weight: 700;">Estado de Mantención</small>
                    <p style="margin-top: 5px; font-size: 14px;">${p.mantenimiento}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <a href="${p.wa}" target="_blank" class="btn-primary" style="background: #25d366;">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                    <a href="${p.gps}" target="_blank" class="btn-primary" style="background: #25d366;">
                        <i class="fas fa-location-arrow"></i> Navegar
                    </a>
                </div>
                
                ${p.id_reserva ? `
                <button onclick="CALENDAR.deleteReservation('${p.id_reserva}')" class="btn-primary" style="margin-top: 15px; background: transparent; border: 1px solid var(--error); color: var(--error);">
                    <i class="fas fa-trash-alt"></i> Eliminar Reserva
                </button>
                ` : ''}
            </div>
        `;
        
        document.getElementById('sheet-data').innerHTML = content;
        document.getElementById('cabin-sheet').classList.add('active');
        document.getElementById('bs-overlay').classList.add('active');
    },

    closeCabinSheet() {
        const sheet = document.getElementById('cabin-sheet');
        const modal = document.getElementById('reserva-modal');
        if(sheet) sheet.classList.remove('active');
        if(modal) modal.classList.remove('active');
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
    },

    async editBasePrice(id_cabana, currentPrice) {
        if (!id_cabana) return;
        const newPrice = prompt("Ingresa el nuevo precio base para esta cabaña:", currentPrice);
        if (!newPrice || isNaN(newPrice) || newPrice === currentPrice.toString()) return;

        try {
            this.showLoading(true);
            await API.updateBasePrice(id_cabana, newPrice);
            
            // Actualizar localmente
            if (typeof CALENDAR !== 'undefined' && CALENDAR.allData) {
                const cabana = CALENDAR.allData.cabanas.find(c => c.id == id_cabana);
                if (cabana) cabana.precio_base = newPrice;
            }
            
            this.closeCabinSheet();
            if (typeof APP !== 'undefined' && APP.recalcKPIs) {
                APP.recalcKPIs();
            }
            this.showLoading(false);
            alert("Precio actualizado exitosamente.");
        } catch (error) {
            this.showLoading(false);
            alert("Error al actualizar precio: " + error.message);
        }
    }
};
