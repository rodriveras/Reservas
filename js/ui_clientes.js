/**
 * Módulo de UI - VERSIÓN CLIENTES
 */
const UI = {
    init() {
        document.getElementById('bs-overlay').onclick = () => this.closeCabinSheet();
    },

    toggleAccordion(btn) {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector('i.fa-chevron-down, i.fa-chevron-up');
        if (content.classList.contains('open')) {
            content.classList.remove('open');
            if (icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
        } else {
            content.classList.add('open');
            if (icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
        }
    },

    openCabinSheet(feature) {
        const p = feature.properties;
        // Determinar precio base
        let precioFinal = parseFloat(p.precio || p.precio_base || p["precio base"] || 0);
        if (isNaN(precioFinal)) precioFinal = 0;

        // Obtener la posición exacta desde el mapa (GeoJSON usa [Longitud, Latitud])
        let gpsUrl = 'https://maps.google.com';
        if (feature.geometry && feature.geometry.coordinates) {
            const lng = feature.geometry.coordinates[0];
            const lat = feature.geometry.coordinates[1];
            gpsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        }

        // --- Generar mini-calendario de disponibilidad ---
        let miniCalendar = '';
        if (typeof APP !== 'undefined' && APP.allData && APP.allData.reservas) {
            const cabinReservations = APP.allData.reservas.filter(r => r.id_cabana == p.id);
            
            // Contenedor del acordeón
            miniCalendar = `
                <div class="dark-accordion-container" style="padding:0; margin-bottom: 25px; background: transparent;">
                    <button class="dark-accordion-btn" onclick="UI.toggleAccordion(this)" style="background: #1c1c1e; border-radius: 20px; z-index: 2; position: relative; border: 1px solid #333;">
                        <span><i class="far fa-calendar-alt" style="color:var(--primary); margin-right:8px;"></i> Ver Disponibilidad</span> 
                        <i class="fas fa-chevron-down" style="color:#888;"></i>
                    </button>
                    <div class="dark-accordion-content" style="background: #1c1c1e; border-radius: 0 0 20px 20px; border: 1px solid #333; border-top: none; margin-top: -15px; padding: 30px 15px 15px 15px;">
            `;
            
            const hoy = new Date();
            
            const renderMonth = (year, month) => {
                const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                let html = `<div style="margin-bottom: 20px;">`;
                html += `<div style="font-size: 14px; font-weight: 700; color: white; margin-bottom: 10px; text-align: center;">${monthNames[month]} ${year}</div>`;
                html += '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 10px; font-weight: 700; color: #888; margin-bottom: 4px;">';
                html += '<div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div></div>';
                html += '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;">';
                
                const firstDayOfMonth = new Date(year, month, 1).getDay(); 
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                
                for (let i = 0; i < firstDayOfMonth; i++) html += '<div></div>';
                
                for (let d = 1; d <= daysInMonth; d++) {
                    const currentDate = new Date(year, month, d);
                    const isReserved = cabinReservations.some(r => {
                        const checkin = new Date(r.fecha_entrada.split('T')[0] + "T00:00:00");
                        const checkout = new Date(r.fecha_salida.split('T')[0] + "T00:00:00");
                        return currentDate >= checkin && currentDate < checkout;
                    });
                    
                    let opacity = currentDate < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) ? '0.3' : '1';
                    const bgColor = isReserved ? '#2a2a2c' : 'rgba(22, 163, 74, 0.15)';
                    const color = isReserved ? '#666' : 'var(--success)';
                    const border = isReserved ? '1px solid #333' : '1px solid rgba(22, 163, 74, 0.3)';
                    const txt = isReserved ? '<i class="fas fa-times" style="font-size:10px;"></i>' : d;
                    
                    html += `
                        <div style="aspect-ratio: 1/1; display:flex; align-items:center; justify-content:center; background: ${bgColor}; border: ${border}; border-radius: 8px; color: ${color}; font-weight: 800; font-size: 13px; opacity: ${opacity};">
                            ${txt}
                        </div>
                    `;
                }
                html += '</div></div>';
                return html;
            };

            let currentMonth = hoy.getMonth();
            let currentYear = hoy.getFullYear();
            miniCalendar += renderMonth(currentYear, currentMonth);
            
            let nextMonth = currentMonth + 1;
            let nextYear = currentYear;
            if (nextMonth > 11) { nextMonth = 0; nextYear++; }
            miniCalendar += renderMonth(nextYear, nextMonth);
            
            miniCalendar += '</div>';
        }

        const isOcupada = p.estado === 'Rojo';

        const content = `
            <div class="cabin-detail">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <button onclick="UI.closeCabinSheet()" style="background:transparent; border:none; color:white; font-size: 20px; cursor: pointer; padding: 0;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="status-badge" style="background:${isOcupada ? 'rgba(220, 38, 38, 0.15)' : 'rgba(22, 163, 74, 0.15)'}; color:${isOcupada ? 'var(--error)' : 'var(--success)'}; border: 1px solid ${isOcupada ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}; margin: 0;">
                        ${isOcupada ? 'Ocupada Hoy' : '¡Disponible!'}
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
                    ${miniCalendar}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                    <button onclick="UI.sendToWhatsApp('${p.nombre}')" class="btn-primary" style="background: #2a2a2c; border: 1px solid #444; color: white;">
                        <i class="fab fa-whatsapp" style="color: #25d366; font-size: 18px;"></i> Contactar
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
        const text = `Hola, me interesa solicitar más información sobre la *${cabinName || 'Cabaña'}*.`;
        const finalUrl = 'https://wa.me/56983008056?text=' + encodeURIComponent(text);
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
