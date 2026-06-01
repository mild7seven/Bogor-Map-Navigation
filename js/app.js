import { initDB } from './storage.js';
import { initMap, drawRouteOnMap, map } from './map.js';
import { loadGraph, calculateRoute } from './routing.js';
import { initSearch, searchPOI } from './search.js';
import { initGPS, toggleFollowMe, disableFollowOnDrag, recordedPath } from './gps.js';
import { exportToGPX } from './export.js';
import { startNavigationMode } from './navigation.js';

// Registrasi Service Worker untuk Offline Mode
navigator.serviceWorker?.register('sw.js');

document.addEventListener('DOMContentLoaded', async () => {
    initDB();
    const myMap = initMap();
    await loadGraph();
    await initSearch();
    
    myMap.on('load', () => {
        initGPS();
        
        // Logika Klik Peta untuk Rute
        let startPoint = null;
        let endPoint = null;
        let mapMarkers = [];

        myMap.on('click', (e) => {
            const { lat, lng } = e.lngLat;
            
            if (!startPoint) {
                startPoint = {lat, lng};
                const m = new maplibregl.Marker({color: 'green'}).setLngLat([lng, lat]).addTo(myMap);
                mapMarkers.push(m);
            } else if (!endPoint) {
                endPoint = {lat, lng};
                const m = new maplibregl.Marker({color: 'red'}).setLngLat([lng, lat]).addTo(myMap);
                mapMarkers.push(m);
                
                // Hitung Rute
                const rute = calculateRoute(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
                if (rute) {
                    drawRouteOnMap(rute.path);
                    startNavigationMode(rute);
                } else {
                    alert("Rute tidak ditemukan!");
                }

                // Reset setelah 5 detik
                setTimeout(() => { 
                    mapMarkers.forEach(m => m.remove()); 
                    mapMarkers = []; 
                    startPoint = null; 
                    endPoint = null; 
                }, 5000);
            }
        });

        // Event Tombol GPS (Follow Me)
        const btnGPS = document.getElementById('loc');
        if (btnGPS) {
            btnGPS.addEventListener('click', () => toggleFollowMe(btnGPS));
            myMap.on('dragstart', () => disableFollowOnDrag(btnGPS));
        }

        // Event Input Search POI
        const searchInput = document.getElementById('q');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const results = searchPOI(e.target.value);
                if (results.length > 0) {
                    console.log("Ditemukan:", results);
                    // Disini Anda bisa membuat dropdown UI, sementara ini kita log
                }
            });
        }
        
        // Event Ekspor GPX (Anda perlu menambahkan <button id="btn-export">Export</button> di index.html)
        const btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', () => exportToGPX(recordedPath));
        }
    });
});
