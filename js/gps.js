import { map } from './map.js';

let watchId = null;
let userMarker = null;
export let isFollowing = false;
export let recordedPath = [];

export const initGPS = () => {
    if (map) {
        const el = document.createElement('div');
        el.style.width = '15px'; el.style.height = '15px';
        el.style.backgroundColor = '#2196F3'; el.style.borderRadius = '50%'; el.style.border = '2px solid white';
        userMarker = new maplibregl.Marker({ element: el }).setLngLat([0, 0]);
    }
};

export const toggleFollowMe = (btnElement) => {
    isFollowing = !isFollowing;
    
    if (isFollowing) {
        btnElement.style.backgroundColor = '#4CAF50';
        btnElement.style.color = 'white';
        
        // FIX: Pengecekan aman untuk melihat apakah marker sudah ada di peta
        if (!userMarker._map) {
            userMarker.addTo(map);
        }
        
        watchId = navigator.geolocation.watchPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            userMarker.setLngLat([longitude, latitude]);
            
            recordedPath.push({ lat: latitude, lng: longitude, time: new Date().toISOString() });
            
            if (isFollowing) map.flyTo({ center: [longitude, latitude], zoom: 16 });
        }, (err) => console.error(err), { enableHighAccuracy: true });
    } else {
        btnElement.style.backgroundColor = '';
        btnElement.style.color = '';
        if (watchId) navigator.geolocation.clearWatch(watchId);
    }
};

export const disableFollowOnDrag = (btnElement) => {
    isFollowing = false;
    btnElement.style.backgroundColor = '';
    btnElement.style.color = '';
};
