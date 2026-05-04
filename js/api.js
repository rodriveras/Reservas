/**
 * Módulo de comunicación con el Backend (Apps Script)
 */
const API = {
    async getStatusByDate(date) {
        console.log(`📡 Consultando API para fecha: ${date}`);
        try {
            const response = await fetch(`${CONFIG.API_URL}?date=${date}&t=${Date.now()}`);
            if (!response.ok) throw new Error('Error en la red');
            return await response.json();
        } catch (error) {
            console.error("❌ Fallo en la comunicación con la API:", error);
            throw error;
        }
    },

    async getAllData() {
        console.log(`📡 Consultando todas las reservas...`);
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=all_data&t=${Date.now()}`);
            if (!response.ok) throw new Error('Error en la red');
            return await response.json();
        } catch (error) {
            console.error("❌ Fallo en la comunicación con la API:", error);
            throw error;
        }
    },

    async createReservation(data) {
        console.log("📡 Enviando nueva reserva al servidor...");
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: 'create_reserva',
                    id_cabana: data.id_cabana,
                    fecha_entrada: data.fecha_entrada,
                    fecha_salida: data.fecha_salida,
                    cliente: data.cliente,
                    pasajeros: data.pasajeros,
                    mascota: data.mascota,
                    tina: data.tina,
                    valor_tina: data.valor_tina,
                    abono: data.abono,
                    comentarios: data.comentarios,
                    celular: data.celular,
                    rrss: data.rrss,
                    email: data.email,
                    precios_dinamicos: data.precios_dinamicos
                })
            });
            const result = await response.json();
            if (result.status === "error") {
                throw new Error(result.message || "Error desconocido en Apps Script");
            }
            return result;
        } catch (error) {
            console.error("❌ Fallo al guardar reserva:", error);
            throw error;
        }
    },

    async deleteReservation(id_reserva) {
        console.log(`📡 Eliminando reserva ${id_reserva}...`);
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'delete_reserva', id_reserva })
            });
            const result = await response.json();
            if (result.status === "error") {
                throw new Error(result.message || "Error desconocido en Apps Script");
            }
            return result;
        } catch (error) {
            console.error("❌ Fallo al eliminar reserva:", error);
            throw error;
        }
    },

    async updateBasePrice(id_cabana, new_price) {
        console.log(`📡 Actualizando precio base de cabaña ${id_cabana}...`);
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'update_base_price', id_cabana: id_cabana, new_price: new_price })
            });
            const result = await response.json();
            if (result.status === "error") {
                throw new Error(result.message || "Error desconocido en Apps Script");
            }
            return result;
        } catch (error) {
            console.error("❌ Fallo al actualizar precio:", error);
            throw error;
        }
    },

    async updateAbono(id_reserva, new_abono) {
        console.log(`📡 Actualizando abono de reserva ${id_reserva}...`);
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'update_abono', id_reserva: id_reserva, new_abono: new_abono })
            });
            const result = await response.json();
            if (result.status === "error") {
                throw new Error(result.message || "Error desconocido en Apps Script");
            }
            return result;
        } catch (error) {
            console.error("❌ Fallo al actualizar abono:", error);
            throw error;
        }
    }
};
