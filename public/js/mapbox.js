/*eslint-disable*/

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    mapboxgl.accessToken = `pk.eyJ1IjoibnBtaWt1c2giLCJhIjoiY21nYW50OXV5MDV5ZTJrc2U5YmplOGZ6NyJ9.aH1HrBUejOmIAndOBjVnTg`;

    const mapEl = document.querySelector("#map");
    const locations =   JSON.parse(mapEl.dataset.locations);
    console.log(locations)

    

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        scrollZoom: false
        // scrollZoom: false, 
        // center: [87.9912828,26.6417056],
        // zoom: 13,
        // interactive: false,
    });

    // Check if locations array exists before using it
    if (typeof locations !== 'undefined' && locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();

        locations.forEach((loc,i) => {
            const el = document.createElement("div");
            el.className = "marker";

            new mapboxgl.Marker({
                element: el,
                anchor: 'bottom',
            }).setLngLat(loc.coordinates).addTo(map);

            //Now adding up popups.

            new mapboxgl.Popup({
                offset: 60
            }).setLngLat(loc.coordinates).setHTML(`<p>Day ${i+1}: ${loc.description}`).addTo(map);



            bounds.extend(loc.coordinates);
        });

        // Fit map to bounds
        map.fitBounds(bounds, {
            padding: { 
                top: 200,
                bottom: 200,
                left: 100,
                right: 100
            }
        });
    }
});


// *******************************//
// *******************************//
// *******************************//
// *******************************//
// *******************************//








// /*eslint-disable*/

// // Wait for DOM to be fully loaded
// document.addEventListener('DOMContentLoaded', function() {
//     mapboxgl.accessToken = `pk.eyJ1IjoibnBtaWt1c2giLCJhIjoiY21nYW50OXV5MDV5ZTJrc2U5YmplOGZ6NyJ9.aH1HrBUejOmIAndOBjVnTg`;

//     const map = new mapboxgl.Map({
//         container: 'map',
//         style: 'mapbox://styles/mapbox/streets-v11',
//         scrollZoom: false,
//         center: [87.9912828,26.6417056],
//         zoom: 13,
//         interactive: false,
//     });
// });
 
// const bounds = new mapboxgl.LatLngBounds();

// locations.forEach(loc=>{
//     //
//       const el = document.createElement("div");
//       el.className = "marker";

//       new mapboxgl.Marker({
//         element: el,
//         anchor: 'bottom',
//       }).setLngLat(loc.coordinates).addTo(map);

//       bounds.extend(loc.coordinates);

// })