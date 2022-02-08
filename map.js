//ACCESS TOKEN
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxleHphbmRlcmdpbmdyYXMiLCJhIjoiY2t5bHB5YjBhMjh3ejJucGx3MWZ6bHQ1aCJ9.ZbErSdHzDpHnuHoEKQTfmQ';

//Create new map object
const map = new mapboxgl.Map({
    container: 'map', //Container ID
    style: 'mapbox://styles/mapbox/streets-v11', //Style URL
    center: [-74.5, 40], //Starting position [lng, lat]
    zoom: 3 //Starting zoom
    });

//When the map loads
map.on('load', () => {

  //Load and store icons
  map.loadImage(
    './assets/live-icon.png', //Icon location
    (error, image) => {
    if (error) throw error; //Image not found error
    map.addImage('live-icon', image); //Store image ('name', image)
    }
  );

  map.loadImage(
    './assets/hybrid-icon.png', //Icon location
    (error, image) => {
    if (error) throw error; //Image not found error
    map.addImage('hybrid-icon', image); //Store image ('name', image)
    }
  );

  map.loadImage(
    './assets/event-icon.png', //Icon location
    (error, image) => {
    if (error) throw error; //Image not found error
    map.addImage('event-icon', image); //Store image ('name', image)
    }
  );

  map.loadImage(
    './assets/venues-icon.png', //Icon location
    (error, image) => {
    if (error) throw error; //Image not found error
    map.addImage('venues-icon', image); //Store image ('name', image)
    }
  );

  //Sources are used for both Heatmap layer, and Symbol layers
  map.addSource('live-data', {
    type: 'geojson',
    data: './GeoData/live.geojson'
  });

  map.addSource('hybrid-data', {
    type: 'geojson',
    data: './GeoData/hybrid.geojson'
  });

  map.addSource('event-data', {
    type: 'geojson',
    data: './GeoData/event.geojson'
  });

  map.addSource('venues-data', {
    type: 'geojson',
    data: './GeoData/venues.geojson'
  });

  map.addSource('heatmap-data', {
    type: 'geojson',
    data: './GeoData/heatmap.geojson'
  });

  //Heatmap layer
  map.addLayer(
    {
      id: 'symbols-heat',
      type: 'heatmap',
      source: 'heatmap-data',
      maxzoom: 15,
      paint: {
        //Increase weight as diameter breast height increases
        'heatmap-weight': {
          property: 'dbh',
          type: 'exponential',
          stops: [
            [1, 0],
            [62, 1]
          ]
        },
        //Increase intensity as zoom level increases
        'heatmap-intensity': {
          stops: [
            [11, 1],
            [15, 3]
          ]
        },
        //Assign color values be applied to points depending on their density
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(236,222,239,0)',
          0.2,
          'rgb(208,209,230)',
          0.4,
          'rgb(166,189,219)',
          0.6,
          'rgb(103,169,207)',
          0.8,
          'rgb(28,144,153)'
        ],
        //Increase radius as zoom increases
        'heatmap-radius': {
          stops: [
            [11, 15],
            [15, 20]
          ]
        },
        //Decrease opacity to transition into symbol layer
        'heatmap-opacity': {
          default: 1,
          stops: [
            [14, 1],
            [15, 0]
          ]
        }
      }
    },
    'waterway-label'
  );
  
  //Symbol Layer
  map.addLayer({
    id: 'live-symbol',
    type: 'symbol',
    source: 'live-data',
    layout: {
      'icon-image': 'live-icon',
      'icon-allow-overlap': true,
      'icon-size': 0.15
    },
    minzoom: 14,
  });

  map.addLayer({
    id: 'hybrid-symbol',
    type: 'symbol',
    source: 'hybrid-data',
    layout: {
      'icon-image': 'hybrid-icon',
      'icon-allow-overlap': true,
      'icon-size': 0.15
    },
    minzoom: 14,
  });

  map.addLayer({
    id: 'event-symbol',
    type: 'symbol',
    source: 'event-data',
    layout: {
      'icon-image': 'event-icon',
      'icon-allow-overlap': true,
      'icon-size': 0.15
    },
    minzoom: 14,
  });

  map.addLayer({
    id: 'venues-symbol',
    type: 'symbol',
    source: 'venues-data',
    layout: {
      'icon-image': 'venues-icon',
      'icon-allow-overlap': true,
      'icon-size': 0.15
    },
    minzoom: 14,
  });

});

//Adds onscreen nevigation controls for the map
const nav = new mapboxgl.NavigationControl()
map.addControl(nav)