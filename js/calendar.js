/**
 * Módulo para la Vista Panorámica (Gantt) de Reservas Mensuales
 */
const CALENDAR = {
    allData: null,
    currentCabinId: null,
    currentMonthDate: new Date(),

    render(allData) {
        this.allData = allData;
        if (!this.currentCabinId && allData.cabanas.length > 0) {
            this.currentCabinId = allData.cabanas[0].id; 
        }
        
        const container = document.getElementById('calendar-content');
        container.innerHTML = this.buildUI();
        this.renderGrid();
    },
    
    buildUI() {
        let cabinOptions = this.allData.cabanas.map(c => 
            `<option value="${c.id}" ${c.id == this.currentCabinId ? 'selected' : ''}>${c.nombre}</option>`
        ).join('');
        
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; margin-top:20px;">
                <select id="cal-cabin-select" style="padding:12px; border-radius:16px; background:var(--surface); color:white; border:1px solid rgba(255,255,255,0.1); font-size:18px; font-weight:800; font-family:'Outfit';" onchange="CALENDAR.changeCabin(this.value)">
                    ${cabinOptions}
                </select>
                <div style="display:flex; gap:10px;">
                    <button class="btn-primary" style="padding:12px; width:45px; border-radius:16px;" onclick="CALENDAR.changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                    <button class="btn-primary" style="padding:12px; width:45px; border-radius:16px;" onclick="CALENDAR.changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            
            <h2 id="cal-month-title" style="font-size:32px; margin-bottom:25px; font-family:'Outfit'; text-transform:capitalize; color:var(--text-main);"></h2>
            
            <div style="display:grid; grid-template-columns:repeat(7,1fr); text-align:center; font-weight:800; font-size:12px; margin-bottom:15px; color:var(--text-dim);">
                <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
            </div>
            
            <div id="cal-grid" style="display:grid; grid-template-columns:repeat(7,1fr); gap:6px;">
            </div>
        `;
    },

    changeCabin(id) {
        this.currentCabinId = id;
        this.renderGrid();
    },

    changeMonth(delta) {
        this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + delta);
        this.renderGrid();
    },

    renderGrid() {
        const year = this.currentMonthDate.getFullYear();
        const month = this.currentMonthDate.getMonth();
        
        document.getElementById('cal-month-title').innerText = this.currentMonthDate.toLocaleString('es-ES', {month: 'long', year:'numeric'});
        
        const firstDayOfMonth = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const cabin = this.allData.cabanas.find(c => c.id == this.currentCabinId);
        const cabinReservations = this.allData.reservas.filter(r => r.id_cabana == this.currentCabinId);
        
        let gridHtml = '';
        
        for (let i = 0; i < firstDayOfMonth; i++) {
            gridHtml += `<div></div>`;
        }
        
        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(year, month, d);
            const z = (n) => n.toString().padStart(2, '0');
            const dateStr = `${year}-${z(month+1)}-${z(d)}`;
            
            let dayPrice = cabin.precio_base || 0;
            if (currentDate.getDay() === 5 || currentDate.getDay() === 6) dayPrice *= 1.20;
            
            const activeRes = cabinReservations.find(r => {
                const checkin = new Date(r.fecha_entrada + "T00:00:00");
                const checkout = new Date(r.fecha_salida + "T00:00:00");
                return currentDate >= checkin && currentDate <= checkout;
            });
            
            let isStart = false;
            let isEnd = false;
            let clientName = '';
            let cellStyle = `background: var(--bg-dark); color: var(--text-main); border: 1px solid rgba(255,255,255,0.08);`;
            
            if (activeRes) {
                isStart = dateStr === activeRes.fecha_entrada;
                isEnd = dateStr === activeRes.fecha_salida;
                clientName = activeRes.cliente ? activeRes.cliente.split(' ')[0] : 'Reservado';
                
                let rad = '0';
                if (isStart && isEnd) rad = '24px';
                else if (isStart) rad = '24px 0 0 24px';
                else if (isEnd) rad = '0 24px 24px 0';
                
                // Si cae domingo o sabado rompe el "pill"
                if (currentDate.getDay() === 0 && !isStart) rad = '24px 0 0 24px';
                if (currentDate.getDay() === 6 && !isEnd) rad = '0 24px 24px 0';

                // DISEÑO DESTACADO PARA RESERVAS
                cellStyle = `background: var(--primary); color: white; border: none; border-radius: ${rad}; box-shadow: 0 4px 12px rgba(217, 119, 54, 0.4);`;
                
                if(isStart || isEnd) {
                    cellStyle += ` z-index: 2; position:relative;`;
                }
            } else {
                cellStyle += ` border-radius: 14px;`;
            }
            
            let isMiddle = activeRes && !isStart && !isEnd;
            let onClick = activeRes ? `onclick="CALENDAR.openDetails('${activeRes.fecha_entrada}')"` : `onclick="CALENDAR.startDraft('${dateStr}')"`;
            
            gridHtml += `
                <div style="aspect-ratio: 1/1.2; display:flex; flex-direction:column; justify-content:space-between; align-items:center; padding:10px 4px; cursor:pointer; transition:0.2s; ${cellStyle}" ${onClick} onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <span style="${isMiddle ? 'text-decoration:line-through; opacity:0.5;' : 'font-weight:900;'} font-size:15px; color:white;">${isEnd && activeRes ? '<i class="fas fa-sign-out-alt"></i>' : d}</span>
                    
                    ${activeRes && isStart ? `<div style="font-size:11px; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center; color:white; text-shadow: 0 1px 2px rgba(0,0,0,0.5);"><i class="fas fa-user"></i> ${clientName}</div>` : ''}
                    
                    ${!activeRes ? `<span style="font-size:11px; font-weight:600; color:var(--text-dim);">$${Math.round(dayPrice/1000)}k</span>` : ''}
                </div>
            `;
        }
        
        document.getElementById('cal-grid').innerHTML = gridHtml;
    },

    openDetails(fechaEntrada) {
        // 🌟 MAGIA: Al tocar una reserva, cambiamos la fecha global al día de entrada y recalculamos KPIs
        const filter = document.getElementById('master-date-filter');
        if(filter && typeof APP !== 'undefined' && APP.recalcKPIs) {
            filter.value = fechaEntrada;
            APP.currentDate = fechaEntrada;
            APP.recalcKPIs();
        }

        const res = this.allData.reservas.find(r => r.id_cabana == this.currentCabinId && r.fecha_entrada === fechaEntrada);
        const cabin = this.allData.cabanas.find(c => c.id == this.currentCabinId);
        if (!res || !cabin) return;
        
        // Forzar coordenadas exactas desde QGIS si existen
        let lat = cabin.latitud;
        let lng = cabin.longitud;
        if (typeof json_Cabaas_3 !== 'undefined') {
            const qgisF = json_Cabaas_3.features.find(f => f.properties.nombre.includes(cabin.nombre));
            if (qgisF) {
                lat = qgisF.geometry.coordinates[1];
                lng = qgisF.geometry.coordinates[0];
            }
        }

        const p = {
            nombre: cabin.nombre,
            estado: 'Rojo',
            estado_txt: `Reservado hasta ${res.fecha_salida}`,
            precio: cabin.precio_base,
            mantenimiento: cabin.mantenimiento || "OK",
            wa: `https://wa.me/${cabin.telefono}?text=Gestion+${cabin.nombre}`,
            gps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            cliente: res.cliente,
            pasajeros: res.pasajeros,
            mascota: res.mascota,
            tina: res.tina,
            celular: res.celular,
            rrss: res.rrss,
            email: res.email
        };
        
        UI.openCabinSheet(p);
    },

    startDraft(dateStr) {
        // 🌟 MAGIA: Al tocar un día vacío, cambiamos la fecha global y recalculamos KPIs
        const filter = document.getElementById('master-date-filter');
        if(filter && typeof APP !== 'undefined' && APP.recalcKPIs) {
            filter.value = dateStr;
            APP.currentDate = dateStr;
            APP.recalcKPIs();
        }

        const cabin = this.allData.cabanas.find(c => c.id == this.currentCabinId);
        document.getElementById('new-res-cabana').innerText = cabin.nombre;
        document.getElementById('new-res-in').value = dateStr;
        document.getElementById('new-res-out').value = '';
        document.getElementById('new-res-cliente').value = '';
        
        // Resetear nuevos campos
        document.getElementById('new-res-pax').value = '2';
        document.getElementById('new-res-mascota').checked = false;
        document.getElementById('new-res-tina').checked = false;
        document.getElementById('new-res-cel').value = '';
        document.getElementById('new-res-rrss').value = '';
        document.getElementById('new-res-email').value = '';
        
        document.getElementById('reserva-modal').classList.add('active');
        document.getElementById('bs-overlay').classList.add('active');
    },

    async saveReservation() {
        const checkin = document.getElementById('new-res-in').value;
        const checkout = document.getElementById('new-res-out').value;
        const cliente = document.getElementById('new-res-cliente').value;
        
        // Recolectar nuevos campos
        const pasajeros = document.getElementById('new-res-pax').value;
        const mascota = document.getElementById('new-res-mascota').checked ? "Sí" : "No";
        const tina = document.getElementById('new-res-tina').checked ? "Sí" : "No";
        const celular = document.getElementById('new-res-cel').value;
        const rrss = document.getElementById('new-res-rrss').value;
        const email = document.getElementById('new-res-email').value;
        
        if (!checkin || !checkout || !cliente) {
            alert('Por favor completa la fecha de salida y el nombre del huésped.');
            return;
        }
        
        if (checkin >= checkout) {
            alert('La fecha de salida debe ser posterior a la de entrada.');
            return;
        }

        const btn = document.getElementById('btn-save-res');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btn.disabled = true;

        try {
            const resData = await API.createReservation({
                id_cabana: this.currentCabinId,
                fecha_entrada: checkin,
                fecha_salida: checkout,
                cliente: cliente,
                pasajeros: pasajeros,
                mascota: mascota,
                tina: tina,
                celular: celular,
                rrss: rrss,
                email: email
            });
            
            // 🌟 Inyectar la reserva localmente en la memoria para verla de inmediato
            if (resData) {
                this.allData.reservas.push({
                    d_reserva: resData.id || ("R-" + Math.floor(Math.random() * 9999)),
                    id_cabana: this.currentCabinId,
                    fecha_entrada: checkin,
                    fecha_salida: checkout,
                    cliente: cliente,
                    pasajeros: pasajeros,
                    mascota: mascota,
                    tina: tina,
                    celular: celular,
                    rrss: rrss,
                    email: email
                });
            }
            
            // Cerrar modal
            document.getElementById('reserva-modal').classList.remove('active');
            document.getElementById('bs-overlay').classList.remove('active');
            btn.innerHTML = '<i class="fas fa-check"></i> Confirmar y Guardar';
            btn.disabled = false;
            
            // Refrescar el grid visualmente al instante
            this.renderGrid();
            
            // Actualizar KPIs de la barra inferior al instante
            if (typeof APP !== 'undefined' && APP.recalcKPIs) {
                APP.recalcKPIs();
            }
            
            // Si el mapa estaba en una fecha que ahora está ocupada, se actualizará la próxima vez que se cambie la fecha.
            
        } catch(e) {
            alert("Error al guardar: " + e.message);
            btn.innerHTML = '<i class="fas fa-check"></i> Confirmar y Guardar';
            btn.disabled = false;
        }
    }
};
