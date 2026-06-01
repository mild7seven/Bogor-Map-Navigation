import { initDB } from './storage.js';
import { initMap, drawRouteOnMap, clearRouteMap, map } from './map.js';
import { loadGraph, calculateRoute } from './routing.js';
import { initSearch, searchPOI } from './search.js';
import { initGPS, toggleFollowMe, disableFollowOnDrag, recordedPath } from './gps.js';
import { exportToGPX } from './export.js';
import { startNavigationMode } from './navigation.js';

navigator.serviceWorker?.register('sw.js');

document.addEventListener('DOMContentLoaded', async () => {
    initDB();
    const myMap = initMap();
    await loadGraph();
    await initSearch();
    
    myMap.on('load', () => {
        initGPS();
        
        let startPoint = null;
        let endPoint = null;
        let mapMarkers = [];

        myMap.on('click', (e) => {
            const { lat, lng } = e.lngLat;
            
            // Jika belum ada titik awal ATAU sudah ada rute lengkap sebelumnya (Reset instan)
            if (!startPoint || (startPoint && endPoint)) {
                startPoint = {lat, lng};
                endPoint = null;
                
                // Hapus marker dan rute lama dari peta
                mapMarkers.forEach(m => m.remove());
                mapMarkers = [];
                clearRouteMap();

                const m = new maplibregl.Marker({color: 'green'}).setLngLat([lng, lat]).addTo(myMap);
                mapMarkers.push(m);
            } 
            // Jika titik awal sudah ada, set tujuan
            else if (!endPoint) {
                endPoint = {lat, lng};
                const m = new maplibregl.Marker({color: 'red'}).setLngLat([lng, lat]).addTo(myMap);
                mapMarkers.push(m);
                
                // Hitung Rute
                const rute = calculateRoute(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
                if (rute) {
                    drawRouteOnMap(rute.path);
                    startNavigationMode(rute);
                } else {
                    alert("Rute tidak ditemukan! Area tidak terjangkau jaringan jalan.");
                }
            }
        });

        const btnGPS = document.getElementById('loc');
        if (btnGPS) {
            btnGPS.addEventListener('click', () => toggleFollowMe(btnGPS));
            myMap.on('dragstart', () => disableFollowOnDrag(btnGPS));
        }

        const searchInput = document.getElementById('q');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const results = searchPOI(e.target.value);
                if (results.length > 0) {
                    console.log("Pencarian POI:", results);
                }
            });
        }
        
        const btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', () => exportToGPX(recordedPath));
        }
    });
});
