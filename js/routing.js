let graph = {};

export const loadGraph = async () => {
    try {
        const res = await fetch('data/graph.json');
        graph = await res.json();
        console.log("Graph ringan dimuat:", Object.keys(graph).length, "nodes");
    } catch (e) { console.error("Error loading graph", e); }
};

const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2)**2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export const getNearestNode = (lat, lng) => {
    let nearestId = null, minDistance = Infinity;
    for (let id in graph) {
        const dist = haversine(lat, lng, graph[id][0], graph[id][1]);
        if (dist < minDistance) { minDistance = dist; nearestId = id; }
    }
    return nearestId;
};

export const calculateRoute = (startLat, startLng, endLat, endLng) => {
    const startId = getNearestNode(startLat, startLng);
    const endId = getNearestNode(endLat, endLng);
    
    if (!startId || !endId) return null;

    let openSet = [{ id: startId, f: 0 }];
    const cameFrom = {}, gScore = { [startId]: 0 };

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift().id;

        if (current === endId) {
            const path = [[graph[current][1], graph[current][0]]]; // [lng, lat]
            let curr = current;
            while (cameFrom[curr]) {
                curr = cameFrom[curr];
                path.unshift([graph[curr][1], graph[curr][0]]);
            }
            return { distance: gScore[endId].toFixed(2), path };
        }

        const edges = graph[current][2] || [];
        for (let edge of edges) {
            const neighbor = edge[0]; // ID target
            const weight = edge[1];   // Jarak
            
            // FIX KRUSIAL: Mencegah error jika node terpotong di perbatasan peta OSM
            if (!graph[neighbor]) continue; 

            const tentativeGScore = gScore[current] + weight;

            if (tentativeGScore < (gScore[neighbor] || Infinity)) {
                cameFrom[neighbor] = current;
                gScore[neighbor] = tentativeGScore;
                const f = tentativeGScore + haversine(graph[neighbor][0], graph[neighbor][1], graph[endId][0], graph[endId][1]);
                openSet.push({ id: neighbor, f });
            }
        }
    }
    return null;
};
