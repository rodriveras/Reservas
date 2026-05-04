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

    openCabinSheet(feature) {
        const p = feature.properties;
        const checkin = document.getElementById('client-checkin').value;
        const checkout = document.getElementById('client-checkout').value;

        // Determinar precio base y sumar 20% si es fin de semana
        let precioFinal = parseFloat(p.precio || p.precio_base || p["precio base"] || 0);
        if (isNaN(precioFinal)) precioFinal = 0;
        
        if (checkin) {
            const inDate = new Date(checkin + "T00:00:00");
            if (inDate.getDay() === 5 || inDate.getDay() === 6) {
                precioFinal *= 1.20;
            }
        }

        // Obtener la posición exacta desde el mapa (GeoJSON usa [Longitud, Latitud])
        let gpsUrl = 'https://maps.google.com';
        if (feature.geometry && feature.geometry.coordinates) {
            const lng = feature.geometry.coordinates[0];
            const lat = feature.geometry.coordinates[1];
            gpsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        }

        const content = `
            <div class="cabin-detail">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <button onclick="UI.closeCabinSheet()" style="background:transparent; border:none; color:white; font-size: 20px; cursor: pointer; padding: 0;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="status-badge" style="background:rgba(22, 163, 74, 0.15); color:var(--success); border: 1px solid rgba(22, 163, 74, 0.3); margin: 0;">
                        ¡Disponible!
                    </div>
                </div>
                
                <h2 style="font-family: 'Outfit'; font-size: 28px; font-weight: 700; color: white; margin-bottom: 5px;">${p.nombre}</h2>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom: 25px;">
                    <span style="font-size: 20px; font-weight: 700; color: var(--success);">$ ${precioFinal.toLocaleString('es-CL')}</span>
                    <span style="font-size: 14px; color: #888;">/ noche</span>
                </div>
                
                <div style="background: #1c1c1e; padding: 20px; border-radius: 20px; border: 1px solid #333; margin-bottom: 25px;">
                    <p style="color: #ccc; font-size: 14px; line-height: 1.5; margin: 0;">
                        Cabaña totalmente equipada en medio del bosque nativo. El lugar ideal para conectarse con la naturaleza y descansar.
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                    <button onclick="UI.sendToWhatsApp('${p.nombre}')" class="btn-primary" style="background: #2a2a2c; border: 1px solid #444; color: white;">
                        <i class="fab fa-whatsapp" style="color: #25d366; font-size: 18px;"></i> Reservar
                    </button>
                    <a href="${gpsUrl}" target="_blank" class="btn-primary" style="background: #2a2a2c; border: 1px solid #444; color: white;">
                        <i class="fas fa-location-arrow" style="color: var(--primary); font-size: 16px;"></i> Cómo llegar
                    </a>
                </div>
            </div>
        `;
        
        document.getElementById('sheet-data').innerHTML = content;
        document.getElementById('cabin-sheet').classList.add('active');
        document.getElementById('bs-overlay').classList.add('active');
    },

    sendToWhatsApp(cabinName) {
        const checkin = document.getElementById('client-checkin').value;
        const checkout = document.getElementById('client-checkout').value;
        
        if(!checkout || checkout <= checkin) {
            alert("La fecha de salida debe ser posterior a la fecha de llegada.");
            return;
        }

        const datesText = `\n\nHola, me interesa reservar la *${cabinName || 'Cabaña'}*.\n📅 *Fechas:*\nEntrada: ${checkin}\nSalida: ${checkout}`;
        const finalUrl = 'https://wa.me/56983008056?text=' + encodeURIComponent(datesText);
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
