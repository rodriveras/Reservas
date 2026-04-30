/**
 * Módulo de comunicación con el Backend (Apps Script)
 */
const API = {
    async getStatusByDate(date) {
        console.log(`📡 Consultando API para fecha: ${date}`);
        try {
            const response = await fetch(`${CONFIG.API_URL}?date=${date}`);
            if (!response.ok) throw new Error('Error en la red');
            return await response.json();
        } catch (error) {
            console.error("❌ Fallo en la comunicación con la API:", error);
            throw error;
        }
    }
};
