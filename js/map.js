export let map;
let routeSourceId = 'route';

export const initMap = () => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {
                'bogor-tiles': {
                    type: 'vector',
                    url: 'pmtiles://bogor.pmtiles' 
                }
            },
            layers: [
                {
                    'id': 'background',
                    'type': 'background',
                    'paint': { 'background-color': '#f8f4f0' }
                }
            ]
        },
        center: [106.799, -6.598], 
        zoom: 13
    });
    
    return map;
};

export const drawRouteOnMap = (coordinates) => {
    if (!map) return;
    
    if (map.getSource(routeSourceId)) {
        map.getSource(routeSourceId).setData({
            type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates }
        });
    } else {
        map.addSource(routeSourceId, {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
        });
        map.addLayer({
            id: routeSourceId,
            type: 'line',
            source: routeSourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#007cbf', 'line-width': 5, 'line-opacity': 0.8 }
        });
    }
};

// Fungsi baru untuk mereset garis rute di peta
export const clearRouteMap = () => {
    if (map && map.getSource(routeSourceId)) {
        map.getSource(routeSourceId).setData({
            type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] }
        });
    }
};
