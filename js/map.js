/**
 * Módulo de Inicialización y Gestión del Mapa
 */
const MAP_ENGINE = {
    instance: null,
    layerGroup: null,

    init() {
        this.instance = L.map('map', { 
            zoomControl: false,
            attributionControl: false 
        }).setView([-36.915, -71.501], 18); // Coordenadas de las cabañas exportadas

        // Capas Base exportadas desde QGIS
        const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 28, maxNativeZoom: 18
        });
        const hibrido = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            maxZoom: 28, maxNativeZoom: 18
        });
        const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 28, maxNativeZoom: 19
        });

        // Añadir satélite por defecto
        satelite.addTo(this.instance);

        // Control de capas (arriba a la derecha, agrupado con zoom)
        L.control.layers({
            "Satélite ESRI": satelite,
            "Google Híbrido": hibrido,
            "OpenStreetMap": osm
        }, null, { position: 'topright' }).addTo(this.instance);

        // Control de zoom (arriba a la derecha, desplazado por CSS)
        L.control.zoom({ position: 'topright' }).addTo(this.instance);

        this.layerGroup = L.layerGroup().addTo(this.instance);
        
        console.log("🗺️ Motor de Mapa listo con capas de QGIS.");
    },

    renderPoints(apiFeatures) {
        this.layerGroup.clearLayers();
        
        // Unir datos espaciales de QGIS con datos de negocio de Apps Script
        const finalFeatures = json_Cabaas_3.features.map(spatialFeature => {
            const spatialName = spatialFeature.properties.nombre; // Ej: "Lenga"
            
            // Buscar en la API la cabaña que coincida en el nombre
            const apiData = apiFeatures.find(f => {
                const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
                const apiName = normalize(f.properties.nombre);
                const qgisName = normalize(spatialName);
                
                // Excepción específica: Maitén <-> Hualle
                if ((apiName.includes("maiten") && qgisName.includes("hualle")) || (apiName.includes("hualle") && qgisName.includes("maiten"))) return true;
                
                return apiName.includes(qgisName) || qgisName.includes(apiName);
            });
            
            if (apiData) {
                // Combinar propiedades espaciales con las de la API
                spatialFeature.properties = {
                    ...spatialFeature.properties,
                    ...apiData.properties,
                    // Forzar GPS exacto de QGIS en modo "Ruta/Navegación"
                    gps: `https://www.google.com/maps/dir/?api=1&destination=${spatialFeature.geometry.coordinates[1]},${spatialFeature.geometry.coordinates[0]}`
                };
            }
            return spatialFeature;
        });
        
        const geojson = L.geoJSON(finalFeatures, {
            pointToLayer: (feature, latlng) => {
                const color = CONFIG.COLORS[feature.properties.estado] || CONFIG.COLORS.Gris;
                
                // Creamos un icono personalizado tipo Pin con cabaña
                const cabinIcon = L.divIcon({
                    className: 'cabin-marker-container',
                    html: `
                        <div class="cabin-pin" style="background-color: ${color}; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <i class="fas fa-house-chimney" style="color: white;"></i>
                        </div>
                    `,
                    iconSize: [36, 36],
                    iconAnchor: [18, 36]
                });

                return L.marker(latlng, { icon: cabinIcon });
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties.nombre) {
                    // Limpiar nombre y aplicar corrección Maitén -> Hualle
                    let adHocText = feature.properties.nombre.replace("Cabaña ", "");
                    if (adHocText.toLowerCase().includes("maitén") || adHocText.toLowerCase().includes("maiten")) {
                        adHocText = "Hualle";
                        feature.properties.nombre = "Cabaña Hualle"; // Forzar internamente también
                    }
                    
                    layer.bindTooltip(adHocText, {
                        permanent: true,
                        direction: "bottom",
                        className: "cabin-tooltip",
                        offset: [0, 5]
                    });
                }
                layer.on('click', () => UI.openCabinSheet(feature));
            }
        });

        geojson.addTo(this.layerGroup);
        
        // Ajustar vista a los puntos si existen (y hacer zoom suficiente)
        if (finalFeatures.length > 0) {
            this.instance.fitBounds(geojson.getBounds(), { padding: [50, 50], maxZoom: 18 });
        }
    }
};
