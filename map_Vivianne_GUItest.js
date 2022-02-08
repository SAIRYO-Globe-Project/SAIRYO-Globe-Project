mapboxgl.accessToken = 'pk.eyJ1IjoiYWxleHphbmRlcmdpbmdyYXMiLCJhIjoiY2t5bHB5YjBhMjh3ejJucGx3MWZ6bHQ1aCJ9.ZbErSdHzDpHnuHoEKQTfmQ';

// height: 100vh;
// width: 100vw;


navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAccuracy: true })

function successLocation(position) {
    //console.log(position)
    setupMap([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
    setupMap([35.689487, 139.691706]);
}

function setupMap(center) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 10
    });

    //navigation control
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav);

    var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
    });

    map.addControl(directions, 'top-left');


    //popup image
    const images = {
        'popup': 'https://docs.mapbox.com/mapbox-gl-js/assets/popup.png',
        'popup-debug':
            'https://docs.mapbox.com/mapbox-gl-js/assets/popup_debug.png'
    };
    loadImages(images, (loadedImages) => {
        map.on('load', () => {
            map.addImage('popup-debug', loadedImages['popup-debug'], {
                // The two (blue) columns of pixels that can be stretched horizontally:
                //   - the pixels between x: 25 and x: 55 can be stretched
                //   - the pixels between x: 85 and x: 115 can be stretched.
                stretchX: [
                    [25, 55],
                    [85, 115]
                ],
                // The one (red) row of pixels that can be stretched vertically:
                //   - the pixels between y: 25 and y: 100 can be stretched
                stretchY: [[25, 100]],
                // This part of the image that can contain text ([x1, y1, x2, y2]):
                content: [25, 25, 115, 100],
                // This is a high-dpi image:
                pixelRatio: 2
            });
            map.addImage('popup', loadedImages['popup'], {
                stretchX: [
                    [25, 55],
                    [85, 115]
                ],
                stretchY: [[25, 100]],
                content: [25, 25, 115, 100],
                pixelRatio: 2
            });

            map.addSource('points', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [-80.34173, 43.58787]
                            },
                            'properties': {
                                'image-name': 'popup-debug',
                                'name': 'Line 1\nLine 2\nLine 3'
                            }
                        },
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [-80.24467, 43.53860]
                            },
                            'properties': {
                                'image-name': 'popup',
                                'name': 'Line 1\nLine 2\nLine 3'
                            }
                        },
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [-80.29531, 43.47211]
                            },
                            'properties': {
                                'image-name': 'popup-debug',
                                'name': 'One longer line'
                            }
                        },
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [-80.47178, 43.46015]
                            },
                            'properties': {
                                'image-name': 'popup',
                                'name': 'One longer line'
                            }
                        }
                    ]
                }
            });
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'points',
                'layout': {
                    'text-field': ['get', 'name'],
                    'icon-text-fit': 'both',
                    'icon-image': ['get', 'image-name'],
                    'icon-allow-overlap': true,
                    'text-allow-overlap': true
                }
            });

            // the original, unstretched image for comparison
            map.addSource('original', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [-80.64500, 43.48957]
                            }
                        }
                    ]
                }
            });
            map.addLayer({
                'id': 'original',
                'type': 'symbol',
                'source': 'original',
                'layout': {
                    'text-field': 'unstretched image',
                    'icon-image': 'popup-debug',
                    'icon-allow-overlap': true,
                    'text-allow-overlap': true
                }
            });
        });
    });

    function loadImages(urls, callback) {
        const results = {};
        for (const name in urls) {
            map.loadImage(urls[name], makeCallback(name));
        }

        function makeCallback(name) {
            return (err, image) => {
                results[name] = err ? null : image;

                // if all images are loaded, call the callback
                if (Object.keys(results).length === Object.keys(urls).length) {
                    callback(results);
                }
            };
        }
       
    }


    //add animated icon
    const size = 200;

    // This implements `StyleImageInterface`
    // to draw a pulsing dot icon on the map.
    const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // When the layer is added to the map,
        // get the rendering context for the map canvas.
        onAdd: function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },

        // Call once before every frame where the icon will be used.
        render: function () {
            const duration = 1000;
            const t = (performance.now() % duration) / duration;

            const radius = (size / 2) * 0.3;
            const outerRadius = (size / 2) * 0.7 * t + radius;
            const context = this.context;

            // Draw the outer circle.
            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                outerRadius,
                0,
                Math.PI * 2
            );
            context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
            context.fill();

            // Draw the inner circle.
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                radius,
                0,
                Math.PI * 2
            );
            context.fillStyle = 'rgba(255, 100, 100, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            // Update this image's data with data from the canvas.
            this.data = context.getImageData(
                0,
                0,
                this.width,
                this.height
            ).data;

            // Continuously repaint the map, resulting
            // in the smooth animation of the dot.
            map.triggerRepaint();

            // Return `true` to let the map know that the image was updated.
            return true;
        }
    };

    map.on('load', () => {
        map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

        map.addSource('dot-point', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.43127, 43.51875] // icon position [lng, lat]
                        }
                    }
                ]
            }
        });
        map.addLayer({
            'id': 'layer-with-pulsing-dot',
            'type': 'symbol',
            'source': 'dot-point',
            'layout': {
                'icon-image': 'pulsing-dot'
            }
        });
    });


    //add marker
    const marker1 = new mapboxgl.Marker()
        .setLngLat([-80.24467, 43.53860])
        .addTo(map);

    //attach a popup to a marker instance
    const monument = [-80.15134, 43.53859];
    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        'Construction on the Washington Monument began in 1848.'
    );

    // create DOM element for the marker
    const el = document.createElement('div');
    el.id = 'marker';

    // create the marker
    new mapboxgl.Marker(el)
        .setLngLat(monument)
        .setPopup(popup) // sets a popup on this marker
        .addTo(map);


    // add popup for symbols
    map.on('load', () => {
        map.addSource('places', {
            // This GeoJSON contains features that include an "icon"
            // property. The value of the "icon" property corresponds
            // to an image in the Mapbox Streets style's sprite.
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>Make it Mount Pleasant</strong><p><a href="http://www.mtpleasantdc.com/makeitmtpleasant" target="_blank" title="Opens in a new window">Make it Mount Pleasant</a> is a handmade and vintage market and afternoon of live entertainment and kids activities. 12:00-6:00 p.m.</p>',
                            'icon': 'theatre-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.09088, 43.56324]
                        }
                    },
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>Mad Men Season Five Finale Watch Party</strong><p>Head to Lounge 201 (201 Massachusetts Avenue NE) Sunday for a <a href="http://madmens5finale.eventbrite.com/" target="_blank" title="Opens in a new window">Mad Men Season Five Finale Watch Party</a>, complete with 60s costume contest, Mad Men trivia, and retro food and drink. 8:00-11:00 p.m. $10 general admission, $20 admission and two hour open bar.</p>',
                            'icon': 'theatre-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.06368, 43.54127]
                        }
                    },
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>Big Backyard Beach Bash and Wine Fest</strong><p>EatBar (2761 Washington Boulevard Arlington VA) is throwing a <a href="http://tallulaeatbar.ticketleap.com/2012beachblanket/" target="_blank" title="Opens in a new window">Big Backyard Beach Bash and Wine Fest</a> on Saturday, serving up conch fritters, fish tacos and crab sliders, and Red Apron hot dogs. 12:00-3:00 p.m. $25.grill hot dogs.</p>',
                            'icon': 'bar-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.21457, 43.48952]
                        }
                    },
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>Ballston Arts & Crafts Market</strong><p>The <a href="http://ballstonarts-craftsmarket.blogspot.com/" target="_blank" title="Opens in a new window">Ballston Arts & Crafts Market</a> sets up shop next to the Ballston metro this Saturday for the first of five dates this summer. Nearly 35 artists and crafters will be on hand selling their wares. 10:00-4:00 p.m.</p>',
                            'icon': 'art-gallery-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.34968, 43.51010]
                        }
                    },
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>Seersucker Bike Ride and Social</strong><p>Feeling dandy? Get fancy, grab your bike, and take part in this year\'s <a href="http://dandiesandquaintrelles.com/2012/04/the-seersucker-social-is-set-for-june-9th-save-the-date-and-start-planning-your-look/" target="_blank" title="Opens in a new window">Seersucker Social</a> bike ride from Dandies and Quaintrelles. After the ride enjoy a lawn party at Hillwood with jazz, cocktails, paper hat-making, and more. 11:00-7:00 p.m.</p>',
                            'icon': 'bicycle-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.34968, 43.51010]
                        }
                    },
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>Capital Pride Parade</strong><p>The annual <a href="http://www.capitalpride.org/parade" target="_blank" title="Opens in a new window">Capital Pride Parade</a> makes its way through Dupont this Saturday. 4:30 p.m. Free.</p>',
                            'icon': 'rocket-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.36694, 43.62873]
                        }
                    },
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>Muhsinah</strong><p>Jazz-influenced hip hop artist <a href="http://www.muhsinah.com" target="_blank" title="Opens in a new window">Muhsinah</a> plays the <a href="http://www.blackcatdc.com">Black Cat</a> (1811 14th Street NW) tonight with <a href="http://www.exitclov.com" target="_blank" title="Opens in a new window">Exit Clov</a> and <a href="http://godsilla.bandcamp.com" target="_blank" title="Opens in a new window">Gods¡¦illa</a>. 9:00 p.m. $12.</p>',
                            'icon': 'music-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.31547, 43.63995]
                        }
                    },
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>A Little Night Music</strong><p>The Arlington Players\' production of Stephen Sondheim\'s  <a href="http://www.thearlingtonplayers.org/drupal-6.20/node/4661/show" target="_blank" title="Opens in a new window"><em>A Little Night Music</em></a> comes to the Kogod Cradle at The Mead Center for American Theater (1101 6th Street SW) this weekend and next. 8:00 p.m.</p>',
                            'icon': 'music-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.41966, 43.59499]
                        }
                    },
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                '<strong>Truckeroo</strong><p><a href="http://www.truckeroodc.com/www/" target="_blank">Truckeroo</a> brings dozens of food trucks, live music, and games to half and M Street SE (across from Navy Yard Metro Station) today from 11:00 a.m. to 11:00 p.m.</p>',
                            'icon': 'music-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-80.29126, 43.50585]
                        }
                    }
                ]
            }
        });
        // Add a layer showing the places.
        map.addLayer({
            'id': 'places',
            'type': 'symbol',
            'source': 'places',
            'layout': {
                'icon-image': '{icon}',
                'icon-allow-overlap': true
            }
        });

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'places', (e) => {
            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'places', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'places', () => {
            map.getCanvas().style.cursor = '';
        });

    });

    document.getElementById('buttons').addEventListener('click', (event) => {
        const language = event.target.id.substr('button-'.length);
        // Use setLayoutProperty to set the value of a layout property in a style layer.
        // The three arguments are the id of the layer, the name of the layout property,
        // and the new property value.
        map.setLayoutProperty('country-label', 'text-field', [
            'get',
            `name_${language}`
        ]);
    });


}



