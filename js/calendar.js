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
            <div style="background: white; min-height: 100%; max-width: 600px; margin: 0 auto; border-radius: 24px; padding: 15px; padding-bottom: 100px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                    <select id="cal-cabin-select" style="padding:10px 0; border:none; background:transparent; color:#222; font-size:18px; font-weight:800; font-family:'Outfit'; outline:none;" onchange="CALENDAR.changeCabin(this.value)">
                        ${cabinOptions}
                    </select>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-primary" style="padding:10px; width:40px; border-radius:50%; background:#f0f0f0; color:#222; border:none;" onclick="CALENDAR.changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                        <button class="btn-primary" style="padding:10px; width:40px; border-radius:50%; background:#f0f0f0; color:#222; border:none;" onclick="CALENDAR.changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                
                <h2 id="cal-month-title" style="font-size:32px; margin-bottom:25px; font-family:'Outfit'; text-transform:lowercase; color:#222;"></h2>
                
                <div style="display:grid; grid-template-columns:repeat(7,1fr); text-align:center; font-weight:800; font-size:11px; margin-bottom:15px; color:#717171;">
                    <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
                </div>
                
                <div id="cal-grid" style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px;">
                </div>
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
            let cellStyle = `background: white; color: #222; border: 1px solid #ebebeb; border-radius: 12px;`;
            
            if (activeRes) {
                isStart = dateStr === activeRes.fecha_entrada;
                isEnd = dateStr === activeRes.fecha_salida;
                clientName = activeRes.cliente ? activeRes.cliente.split(' ')[0] : 'Reservado';
                
                let rad = '0';
                if (isStart && isEnd) rad = '12px';
                else if (isStart) rad = '12px 0 0 12px';
                else if (isEnd) rad = '0 12px 12px 0';
                
                // Si cae domingo o sabado rompe el "pill"
                if (currentDate.getDay() === 0 && !isStart) rad = '12px 0 0 12px';
                if (currentDate.getDay() === 6 && !isEnd) rad = '0 12px 12px 0';

                // DISEÑO DESTACADO PARA RESERVAS (Oscuro puro tipo Airbnb)
                cellStyle = `background: #222222; color: white; border: 1px solid #222222; border-radius: ${rad};`;
                
                if(isStart || isEnd) {
                    cellStyle += ` z-index: 2; position:relative;`;
                }
            }
            
            let isMiddle = activeRes && !isStart && !isEnd;
            let onClick = activeRes ? `onclick="CALENDAR.openDetails('${activeRes.fecha_entrada}')"` : `onclick="CALENDAR.startDraft('${dateStr}')"`;
            
            gridHtml += `
                <div style="aspect-ratio: 1/1.2; display:flex; flex-direction:column; justify-content:space-between; align-items:center; padding:6px 2px; cursor:pointer; transition:0.2s; ${cellStyle}" ${onClick} onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <span style="${isMiddle ? 'opacity:0.5;' : 'font-weight:900;'} font-size:13px;">${isEnd && activeRes ? '<i class="fas fa-sign-out-alt"></i>' : d}</span>
                    
                    ${activeRes && isStart ? `<div style="font-size:9px; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center; color:white;"><i class="fas fa-user"></i> ${clientName}</div>` : ''}
                    
                    ${!activeRes ? `<span style="font-size:9px; font-weight:700; color:#717171;">$${Math.round(dayPrice/1000)}k</span>` : ''}
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

        const precioMostrar = res.precios_dinamicos ? res.precios_dinamicos : cabin.precio_base;

        const p = {
            id_cabana: cabin.id,
            nombre: cabin.nombre,
            estado: 'Rojo',
            estado_txt: `Reservado hasta ${res.fecha_salida}`,
            precio: precioMostrar,
            mantenimiento: cabin.mantenimiento || "OK",
            wa: `https://wa.me/${cabin.telefono}?text=Gestion+${cabin.nombre}`,
            gps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            cliente: res.cliente,
            pasajeros: res.pasajeros,
            mascota: res.mascota,
            tina: res.tina,
            celular: res.celular,
            rrss: res.rrss,
            email: res.email,
            id_reserva: res.id || res.d_reserva || res.id_reserva
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
        document.getElementById('new-res-precio').value = cabin.precio_base;
        
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
        const precios_dinamicos = document.getElementById('new-res-precio').value || "";
        
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
                email: email,
                precios_dinamicos: precios_dinamicos
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
                    email: email,
                    precios_dinamicos: precios_dinamicos
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
    },

    async deleteReservation(id_reserva) {
        if (!confirm("¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.")) return;
        
        try {
            await API.deleteReservation(id_reserva);
            
            // Eliminar de los datos locales
            this.allData.reservas = this.allData.reservas.filter(r => (r.id || r.d_reserva || r.id_reserva) !== id_reserva);
            
            // Cerrar el panel
            UI.closeCabinSheet();
            
            // Actualizar la grilla
            this.renderGrid();
            
            // Actualizar KPIs
            if (typeof APP !== 'undefined' && APP.recalcKPIs) {
                APP.recalcKPIs();
            }
            
            // Si el mapa depende de los datos recargados, esto podría requerir un reload completo, 
            // pero si APP.recalcKPIs o el render local es suficiente, esto lo maneja.
        } catch(e) {
            alert("Error al eliminar: " + e.message);
        }
    }
};
