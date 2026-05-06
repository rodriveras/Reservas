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

    openCabinSheet(feature) {
        const p = feature.properties;
        // Renderizado del bloque de cliente si existe
        // Intento de enriquecer los datos desde memoria si existen
        if (typeof CALENDAR !== 'undefined' && CALENDAR.allData) {
            const res = CALENDAR.allData.reservas.find(r => r.cliente === p.cliente);
            if (res) {
                p.pasajeros = p.pasajeros || res.pasajeros;
                p.mascota = p.mascota || res.mascota;
                p.tina = p.tina || res.tina;
                p.valor_tina = p.valor_tina || res.valor_tina || res.Valor_tina;
                p.abono = p.abono || res.abono;
                p.comentarios = p.comentarios || res.comentarios;
                p.celular = p.celular || res.celular;
                p.rrss = p.rrss || res.rrss;
                p.email = p.email || res.email;
            }
        }

        const checkMascota = p.mascota && typeof p.mascota === 'string' && p.mascota.toLowerCase().includes('s');
        const checkTina = p.tina && typeof p.tina === 'string' && p.tina.toLowerCase().includes('s');        
        
        const infoCliente = p.cliente ? `
            <div style="background: #1c1c1e; padding: 20px; border-radius: 20px; border: 1px solid #333; margin-bottom: 20px;">
                <div style="font-size: 11px; color: #888; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 15px;">Huésped Actual</div>
                
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(22, 163, 74, 0.2); color: var(--success); display:flex; align-items:center; justify-content:center; margin-right: 12px;">
                        <i class="fas fa-user"></i>
                    </div>
                    <span style="font-size: 18px; font-weight: 700; color: white;">${p.cliente}</span>
                </div>
                
                ${(p.celular || p.email || p.rrss) ? `
                <div style="display:grid; gap:10px; margin-bottom: 15px;">
                    ${p.celular ? `<div style="font-size:14px; color:#ccc; display:flex; align-items:center; gap:10px;"><i class="fas fa-phone" style="color:#888; width:16px;"></i> ${p.celular}</div>` : ''}
                    ${p.email ? `<div style="font-size:14px; color:#ccc; display:flex; align-items:center; gap:10px;"><i class="fas fa-envelope" style="color:#888; width:16px;"></i> ${p.email}</div>` : ''}
                    ${p.rrss ? `<div style="font-size:14px; color:#ccc; display:flex; align-items:center; gap:10px;"><i class="fab fa-instagram" style="color:#888; width:16px;"></i> ${p.rrss}</div>` : ''}
                </div>
                ` : ''}
                
                ${(p.pasajeros || checkMascota || checkTina) ? `
                <div style="display:flex; flex-wrap:wrap; gap:8px; border-top: 1px solid #333; padding-top: 15px;">
                    ${p.pasajeros ? `<span style="background:#2a2a2c; border: 1px solid #444; color:#ddd; padding:6px 12px; border-radius:12px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px;"><i class="fas fa-users" style="color:#888;"></i> ${p.pasajeros} Pax</span>` : ''}
                    ${checkMascota ? `<span style="background:#2a2a2c; border: 1px solid #444; color:#ddd; padding:6px 12px; border-radius:12px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px;"><i class="fas fa-paw" style="color:#888;"></i> Mascota</span>` : ''}
                    ${checkTina ? `<span style="background:#2a2a2c; border: 1px solid #444; color:#ddd; padding:6px 12px; border-radius:12px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px;"><i class="fas fa-hot-tub" style="color:var(--primary);"></i> Tina ${p.valor_tina ? `($${parseFloat(p.valor_tina).toLocaleString('es-CL')})` : ''}</span>` : ''}
                </div>
                ` : ''}
            </div>

            <div style="background: #1c1c1e; padding: 20px; border-radius: 20px; border: 1px solid #333; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size: 11px; color: #888; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 5px;">Abono Registrado</div>
                    <span style="font-size: 18px; font-weight: 700; color: ${p.abono ? 'var(--success)' : '#666'};">${p.abono ? '$ ' + parseFloat(p.abono).toLocaleString('es-CL') : 'No registrado'}</span>
                </div>
                <button onclick="UI.editAbono('${p.id_reserva}', '${p.abono || 0}')" style="background:#2a2a2c; border:1px solid #444; color:white; border-radius:12px; width:44px; height:44px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.2s;" title="Modificar Abono">
                    <i class="fas fa-edit"></i>
                </button>
            </div>

            ${p.comentarios ? `
            <div style="background: #1c1c1e; padding: 20px; border-radius: 20px; border: 1px solid #333; margin-bottom: 20px;">
                <div style="font-size: 11px; color: #888; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 10px;"><i class="fas fa-comment-alt" style="margin-right:5px;"></i> Comentarios</div>
                <div style="font-size: 14px; color: #ccc; line-height: 1.5;">${p.comentarios}</div>
            </div>
            ` : ''}
        ` : '';

        const content = `
            <div class="cabin-detail">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <button onclick="UI.closeCabinSheet()" style="background:transparent; border:none; color:white; font-size: 20px; cursor: pointer; padding: 0;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="status-badge" style="background:${p.estado === 'Verde' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)'}; color:${p.estado === 'Verde' ? 'var(--success)' : 'var(--error)'}; border: 1px solid ${p.estado === 'Verde' ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)'}; margin: 0;">
                        ${p.estado_txt || p.estado}
                    </div>
                </div>
                
                <h2 style="font-family: 'Outfit'; font-size: 28px; font-weight: 700; color: white; margin-bottom: 5px;">${p.nombre}</h2>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom: 25px;">
                    <span style="font-size: 20px; font-weight: 700; color: var(--success);">$ ${parseFloat(p.precio_base || p['precio base'] || 0).toLocaleString('es-CL')}</span>
                    <button onclick="UI.editBasePrice('${p.id}', ${p.precio_base || p['precio base'] || 0})" style="background:transparent; border:none; color:#888; cursor:pointer;" title="Cambiar precio base">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                
                ${infoCliente}
                
                <div style="background: #1c1c1e; padding: 20px; border-radius: 20px; border: 1px solid #333; margin-bottom: 25px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size: 11px; color: #888; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 5px;">Mantención</div>
                        <span style="font-size: 15px; color: white; font-weight:600;">${p.mantenimiento}</span>
                    </div>
                    <i class="fas fa-broom" style="color:#666; font-size:20px;"></i>
                </div>
                
                ${p.id_reserva ? `
                <button onclick="CALENDAR.deleteReservation('${p.id_reserva}')" class="btn-primary" style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); color: var(--error); margin-top: 5px;">
                    <i class="fas fa-trash-alt"></i> Eliminar Reserva
                </button>
                ` : `
                <button onclick="document.getElementById('reserva-modal').classList.add('active'); document.getElementById('bs-overlay').classList.add('active'); document.getElementById('new-res-cabana').innerText = '${p.nombre}'; UI.closeCabinSheet();" class="btn-primary" style="background: var(--success); color: white; margin-top: 5px;">
                    <i class="fas fa-calendar-plus"></i> Nueva Reserva
                </button>
                `}
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
        if (!id_cabana || id_cabana === 'undefined') return;
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
    },

    async editAbono(id_reserva, currentAbono) {
        if (!id_reserva || id_reserva === 'undefined') return;
        const newAbono = prompt("Ingresa el nuevo monto del abono para esta reserva (números solamente):", currentAbono === '0' ? '' : currentAbono);
        if (newAbono === null || isNaN(newAbono) || newAbono === currentAbono.toString()) return;

        try {
            this.showLoading(true);
            await API.updateAbono(id_reserva, newAbono);
            
            // Actualizar localmente
            if (typeof CALENDAR !== 'undefined' && CALENDAR.allData) {
                const res = CALENDAR.allData.reservas.find(r => (r.id || r.d_reserva || r.id_reserva) === id_reserva);
                if (res) res.abono = newAbono;
            }
            
            this.closeCabinSheet();
            if (typeof CALENDAR !== 'undefined') {
                CALENDAR.renderGrid();
            }
            this.showLoading(false);
            alert("Abono actualizado exitosamente.");
        } catch (error) {
            this.showLoading(false);
            alert("Error al actualizar abono: " + error.message);
        }
    }
};
