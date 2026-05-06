/**
 * Motor de Mapa - VERSIÓN CLIENTES
 */
const MAP_ENGINE = {
    instance: null,
    layerGroup: null,

    init() {
        this.instance = L.map('map', { 
            zoomControl: true,
            attributionControl: false 
        }).setView([-36.915, -71.501], 18);

        this.instance.zoomControl.setPosition('topright');

        // Capas Base
        const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 28, maxNativeZoom: 18
        });
        satelite.addTo(this.instance);

        this.layerGroup = L.layerGroup().addTo(this.instance);
        console.log("🗺️ Motor Mapa Clientes listo.");
    },

    renderPoints(apiFeatures) {
        this.layerGroup.clearLayers();
        
        const finalFeatures = json_Cabaas_3.features.map(spatialFeature => {
            const spatialName = spatialFeature.properties.nombre;
            const apiData = apiFeatures.find(f => {
                const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
                const apiName = normalize(f.properties.nombre);
                const qgisName = normalize(spatialName);
                
                // Excepción específica: Maitén <-> Hualle
                if ((apiName.includes("maiten") && qgisName.includes("hualle")) || (apiName.includes("hualle") && qgisName.includes("maiten"))) return true;
                
                return apiName.includes(qgisName) || qgisName.includes(apiName);
            });
            if (apiData) {
                spatialFeature.properties = { ...spatialFeature.properties, ...apiData.properties };
            }
            return spatialFeature;
        });

        const geojson = L.geoJSON(finalFeatures, {
            pointToLayer: (feature, latlng) => {
                const estado = feature.properties.estado;
                const isAvailable = estado === 'Verde';
                
                // Color para clientes: Verde brillante si disponible, si no, un gris oscuro semi-transparente
                const color = isAvailable ? CONFIG.COLORS.Verde : 'rgba(161, 176, 166, 0.4)';
                const opacity = isAvailable ? 1 : 0.6;
                const pointerEvents = isAvailable ? 'auto' : 'none';

                const cabinIcon = L.divIcon({
                    className: 'cabin-marker-container',
                    html: `
                        <div class="cabin-pin" style="background-color: ${color}; opacity: ${opacity}; pointer-events: ${pointerEvents}">
                            <i class="fas fa-house-chimney"></i>
                        </div>
                    `,
                    iconSize: [36, 36],
                    iconAnchor: [18, 36]
                });

                return L.marker(latlng, { icon: cabinIcon });
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties.nombre) {
                    let adHocText = feature.properties.nombre.replace("Cabaña ", "");
                    if (adHocText.toLowerCase().includes("maitén") || adHocText.toLowerCase().includes("maiten")) {
                        adHocText = "Hualle";
                        feature.properties.nombre = "Cabaña Hualle";
                    }
                    
                    layer.bindTooltip(adHocText, {
                        permanent: true,
                        direction: "bottom",
                        className: "cabin-tooltip",
                        offset: [0, 5]
                    });
                }
                // Solo permitir click si está disponible
                if (feature.properties.estado === 'Verde') {
                    layer.on('click', () => UI.openCabinSheet(feature));
                }
            }
        });

        geojson.addTo(this.layerGroup);
    }
};
