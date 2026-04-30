/**
 * Módulo de UI - VERSIÓN CLIENTES
 */
const UI = {
    init() {
        document.getElementById('bs-overlay').onclick = () => this.closeCabinSheet();
        
        const checkinInput = document.getElementById('client-checkin');
        const checkoutInput = document.getElementById('client-checkout');

        // UX: Abrir el calendario táctil nativo al hacer clic en cualquier parte del recuadro
        if (checkinInput) {
            checkinInput.addEventListener('click', function() { if (this.showPicker) this.showPicker(); });
        }
        if (checkoutInput) {
            checkoutInput.addEventListener('click', function() { if (this.showPicker) this.showPicker(); });
        }

        checkinInput.onchange = (e) => {
            const checkin = e.target.value;
            // Forzar fecha de salida si es igual o anterior
            if (checkoutInput.value <= checkin) {
                checkoutInput.value = new Date(new Date(checkin).getTime() + 86400000).toISOString().split('T')[0];
            }
            APP.updateData(checkin);
        };

        checkoutInput.onchange = (e) => {
            if (e.target.value <= checkinInput.value) {
                alert("La fecha de salida debe ser posterior a la de llegada.");
                e.target.value = new Date(new Date(checkinInput.value).getTime() + 86400000).toISOString().split('T')[0];
            }
        };
    },

    openCabinSheet(p) {
        const checkin = document.getElementById('client-checkin').value;
        const checkout = document.getElementById('client-checkout').value;

        const content = `
            <div class="cabin-detail">
                <div class="status-badge" style="background:var(--success)">
                    ¡Disponible!
                </div>
                <h2>${p.nombre}</h2>
                <div style="font-size: 24px; font-weight: 800; color: var(--text-main); margin-bottom: 5px;">
                    $ ${p.precio.toLocaleString('es-CL')} <span style="font-size: 14px; color: var(--text-dim); font-weight: 400;">/ noche</span>
                </div>
                
                <p style="color: var(--text-dim); font-size: 14px; margin-bottom: 20px;">
                    Cabaña totalmente equipada en medio del bosque nativo.
                </p>

                <div style="background: rgba(0,0,0,0.25); padding: 15px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="font-size: 11px; color: var(--text-dim); font-weight: 700;">LLEGADA</label>
                            <input type="date" id="sheet-checkin" class="date-input" style="width: 100%; background: var(--bg-dark); margin-top: 5px;" value="${checkin}" onclick="this.showPicker && this.showPicker()">
                        </div>
                        <div>
                            <label style="font-size: 11px; color: var(--text-dim); font-weight: 700;">SALIDA</label>
                            <input type="date" id="sheet-checkout" class="date-input" style="width: 100%; background: var(--bg-dark); margin-top: 5px;" value="${checkout}" onclick="this.showPicker && this.showPicker()">
                        </div>
                    </div>
                    
                    <button class="btn-primary" onclick="UI.sendToWhatsApp('${p.wa}')">
                        <i class="fab fa-whatsapp"></i> Confirmar y Reservar
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('sheet-data').innerHTML = content;
        document.getElementById('cabin-sheet').classList.add('active');
        document.getElementById('bs-overlay').classList.add('active');
    },

    sendToWhatsApp(waBaseUrl) {
        const checkin = document.getElementById('sheet-checkin').value;
        const checkout = document.getElementById('sheet-checkout').value;
        
        if(!checkout || checkout <= checkin) {
            alert("La fecha de salida debe ser posterior a la fecha de llegada.");
            return;
        }

        // Reemplazar el número de Google Sheets por tu número de prueba
        const urlConTuNumero = waBaseUrl.replace(/wa\.me\/\d+/, 'wa.me/56974300363');

        const datesText = `\n\n📅 *Fechas Solicitadas:*\nEntrada: ${checkin}\nSalida: ${checkout}`;
        const finalUrl = urlConTuNumero + encodeURIComponent(datesText);
        window.open(finalUrl, '_blank');
    },

    closeCabinSheet() {
        document.getElementById('cabin-sheet').classList.remove('active');
        document.getElementById('bs-overlay').classList.remove('active');
    },

    showLoading(show) {
        const pill = document.getElementById('sync-status');
        if(pill) {
            pill.innerHTML = show ? 
                '<i class="fas fa-sync fa-spin"></i> Buscando...' : 
                '<i class="fas fa-calendar-check" style="color:var(--success)"></i> Fechas actualizadas';
        }
    }
};
