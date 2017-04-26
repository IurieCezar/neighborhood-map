var map;
// Create a new blank array for all the restaurant markers.
var markers = [];
// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

var largeInfowindow;

var textSearchPlaces;

// These are the restaurants that will be shown to the user.
var locations = [
  {
    title: 'Frontera Grill',
    location: {
      lat: 41.8905699,
      lng: -87.63079499999999
    }
  },{
    title: 'Lou Malnatis\'s Pizzeria' ,
    location: {
      lat: 41.8903431,
      lng: -87.6338062
    }
  },{
    title: 'Portillo\'s Restaurants',
    location: {
      lat: 41.893473,
      lng: -87.63150659999999
    }
  },{
    title: 'Smith and Wollensky',
    location: {
      lat: 41.887946,
      lng: -87.6285372
    }
  },{
    title: 'Dick\'s Last Resort',
    location: {
      lat: 41.8879619,
      lng: -87.62926659999999
    }
  },{
    title: 'Harry Caray\'s Italian Steakhouse',
    location: {
      lat: 41.8890085,
      lng: -87.62926410000001
    }
  },{
    title: 'Cantina Laredo',
    location: {
      lat: 41.8911001,
      lng: -87.6284184
    }
  },{
    title: 'Billy Goat Tavern',
    location: {
      lat : 41.8903616,
      lng : -87.6248004
    }
  }
];


function initMap() {
  var self = this;
  // Create a styles array to use with the map.
  var styles = [
    {
      featureType: 'water',
      stylers: [
        {'color': '#19a0d8'},
        {saturation: 100 },
      ]
    },{
      featureType: 'transit.station',
      stylers: [
        { weight: 9 },
        { hue: '#e85113' }
      ]
    }
  ];

  // Create new map centered in River North Neighborhood, Chicago.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.8911023, lng: -87.6299705},
    zoom: 16,
    styles: styles,
    mapTypeControl: true
  });

  // Create a searchbox in order to execute a places search
  var searchBox = new google.maps.places.SearchBox(
      document.getElementById('places-search'));

  // Bias the searchbox to within the bounds of the map.
  searchBox.setBounds(map.getBounds());

  // Create infowindow
  largeInfowindow = new google.maps.InfoWindow();

  // This will be our restaurant marker icon.Color to green using hexadecimal.
  var defaultIcon = makeMarkerIcon('00AA00');

  // Create a 'highlighted location' marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // The following group uses the location array to create an array of
  // markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);

    // Show markers on the map by default.
    showMarkers();
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('click', function() {
      this.setIcon(highlightedIcon);
      this.setAnimation(google.maps.Animation.BOUNCE);

      // When the user clicks on a marker, the wikipedia
      // articles for that item will be retrieved via an AJAX call
      // and attached to a list in a dropdown menu.
      wikiURL = 'https://en.wikipedia.org/w/api.php';
      wikiURL += '?' + $.param({
        'action': 'opensearch',
        'search': this.title,
        'format': 'json',
        'callback': 'wikiCallback'
      });

      $.ajax({
        url: wikiURL,
        dataType: 'jsonp'
        }).done( function(data) {
        var articleList = data[1];
        var urlList = data[3];
        if (!urlList) {
          window.alert('Sorry, no Wikipedia URLs available!');
        } else {
        for (var i = 0; i < urlList.length; i++) {
          var wikiLinkHead = articleList[i];
          if (!wikiLinkHead) {
              window.alert('Sorry, no Wikipedia titles available!');
            } else {
          var wikiLinkURL = urlList[i];
          if (!wikiLinkURL) {
            viewModel.urlExist(false);
            window.alert('Sorry, no Wikipedia articles available!');
          } else {
            viewModel.urlExist(true);
            viewModel.currentPlace({title: wikiLinkHead});
            viewModel.url(wikiLinkURL);
            }
              }
        }
          }
        }).fail(function(e) {
      window.alert('Sorry, Wikipedia API load error!');
        });

      stopAnimation(this);
    });

    function stopAnimation (marker) {
        setTimeout(function () {
            marker.setAnimation(null);
            marker.setIcon(defaultIcon);
        }, 1400);
    }
  }

  // Re-center the map on window resize
  var mapCenter;
  function storedMapCenter() {
    mapCenter = map.getCenter();
  }

  google.maps.event.addDomListener(map, 'idle', function() {
    storedMapCenter();
  });

  google.maps.event.addDomListener(window, 'resize', function() {
    map.setCenter(mapCenter);
  });

  // Listen for the event fired when the user selects a prediction from the
  // picklist and retrieve more details for that place.
  searchBox.addListener('places_changed', function() {
    searchBoxPlaces(this);
  });
}


// This function populates the infowindow when the marker is clicked.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;

    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading,
    // then get a panorama from that and set the options.
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          infowindow.setContent(
            '<div>' + marker.title + '</div><div id="pano"></div>'
          );
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position.
    streetViewService.getPanoramaByLocation(
      marker.position, radius, getStreetView
    );
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}


// This function will loop through the markers array and display them all.
function showMarkers() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}


// This function will loop through the markers array and hide them all.
function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}


// This function takes in a hexadecimal colorvalue, and then creates a
// new marker icon of that color.
function makeMarkerIcon(markerColor) {
  var markerImage = {
    url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
    markerColor + '|40|_|%E2%80%A2',
    size: new google.maps.Size(21, 34),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(10, 34),
    scaledSize: new google.maps.Size(21,34)
  };
  return markerImage;
}


// This function fires when the user selects a searchbox picklist item.
// It will do a nearby search using the selected query string or place.
function searchBoxPlaces(searchBox) {
  hideMarkers(placeMarkers);
  var places = searchBox.getPlaces();
  if (places.length === 0) {
    window.alert('We did not find any places matching that search.');
  } else {
  // For each place, get the icon, name and location.
    createMarkersForPlaces(places);
  }
}


// This function fires when the user select 'Search' on the places search.
// It will do a nearby search using the entered query string or place.
function textSearchPlaces() {
  var bounds = map.getBounds();
  hideMarkers(placeMarkers);
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({
    query: viewModel.otherPlacesSearch(),
    bounds: bounds
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      createMarkersForPlaces(results);
    } else {
      window.alert('Sorry, Google API load error!');
    }
  });
}


// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    // Create a marker for each place.
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.place_id
    });
    // Create a single infowindow to be used with the place details
    // information.
    // so that only one is open at once.
    var placeInfoWindow = new google.maps.InfoWindow();
    // If a marker is clicked, do a place details search on it in the
    // next function.
    marker.addListener('click', function() {
      if (placeInfoWindow.marker == this) {
        console.log('This infowindow already is on this marker!');
      } else {
        getPlacesDetails(this, placeInfoWindow);
      }
    });
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}


// This is the PLACE DETAILS search - it's the most detailed so it's only
// executed when a marker is selected, indicating the user wants more
// details about that place.
function getPlacesDetails(marker, infowindow) {
  var service = new google.maps.places.PlacesService(map);
  service.getDetails({
    placeId: marker.id
  }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Set the marker property on this infowindow so it isn't created again.
      infowindow.marker = marker;
      var innerHTML = '<div>';
      if (place.name) {
        innerHTML += '<strong>' + place.name + '</strong>';
      }
      if (place.formatted_address) {
        innerHTML += '<br>' + place.formatted_address;
      }
      if (place.formatted_phone_number) {
        innerHTML += '<br>' + place.formatted_phone_number;
      }
      if (place.opening_hours) {
        innerHTML += '<br><br><strong>Hours:</strong><br>' +
            place.opening_hours.weekday_text[0] + '<br>' +
            place.opening_hours.weekday_text[1] + '<br>' +
            place.opening_hours.weekday_text[2] + '<br>' +
            place.opening_hours.weekday_text[3] + '<br>' +
            place.opening_hours.weekday_text[4] + '<br>' +
            place.opening_hours.weekday_text[5] + '<br>' +
            place.opening_hours.weekday_text[6];
      }
      if (place.photos) {
        innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
            {maxHeight: 100, maxWidth: 100}) + '">';
      }
      innerHTML += '</div>';
      infowindow.setContent(innerHTML);
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    } else {
      window.alert('Sorry, Google API load error.');
    }
  });
}


// Handle error function in case if Google Maps Api is not loading.
function loadError() {
  window.alert(
    'Sorry, the map could not be loaded. Please refresh the page.'
  );
}


// Knockoutjs model
var Place = function(data) {

  this.title = ko.observable(data.title);

};


 // Knockoutjs ViewModel
var ViewModel = function() {

    var self = this;

    this.placeList = ko.observableArray([]);

    // Create observable to keep track of the current/selected place.
    this.currentPlace = ko.observable(
      {title: 'You did not select a restaurant from the list.'}
    );

    this.searchPlace = ko.observable('');

    // Create observable array to display the results of the filter
    // function to the user and handle the lack of results.
    this.filteredPlaces = ko.observableArray([]);

    this.url = ko.observable('');
    this.urlExist = ko.observable(false);

    this.otherPlacesSearch = ko.observable('');

    locations.forEach( function(location) {
        self.placeList.push( new Place(location));
    });

    this.textSearchPlacesRest = function() {
      textSearchPlaces();
    };

    this.hidePlaceMarkers = function() {
      hideMarkers(markers);
    };

     this.showPlaceMarkers = function() {
      showMarkers();
    };

    // When we click on something and it runs a function, it passes in the
    // object that we clicked on as a parameter.
    // Change current restaurant when the user clicks on it in the list.
    this.changeCurrent = function(clickedPlace) {
        self.currentPlace(clickedPlace);
        for (var i=0; i<markers.length; i++) {
          if (markers[i].title == self.currentPlace().title()) {
            // Trigger marker's event 'click'.
            google.maps.event.trigger(markers[i], 'click');
          }
        }
    };

    // Filter restaurants in the list and markers on the map in real time.
    this.filteredItems = ko.computed(function() {
      var l = [];
      var filter = self.searchPlace().toLowerCase();
      // If filter box is empty show the whole list.
      if (filter.length===0) {
        self.filteredPlaces(self.placeList());
        for (var i=0; i<markers.length; i++) {
          markers[i].setMap(map);
        }
      } else {
          // Use ko.utils to filter the array and add matched results
          // to l list.
          ko.utils.arrayFilter(self.placeList(), function(placeItem) {
            var lc_title = placeItem.title().toLowerCase();
            var return_val = (lc_title.search(filter) === -1);
            if (!return_val) {
              l.push(placeItem);
            }
          });
        // Append the filtered list to the observable array for display
        // in the view.
        self.filteredPlaces(l);
        // Filter the markers on the map.
        var bounds = new google.maps.LatLngBounds();
        for (var m=0; m<markers.length; m++) {
          if (markers[m].map !== null) {
            markers[m].setMap(null);
          }
          for (var n=0; n<self.filteredPlaces().length; n++) {
            if (markers[m].title === self.filteredPlaces()[n].title()) {
              markers[m].setMap(map);
              bounds.extend(markers[m].position);
            }
          }
          // Fit bounds and zoom for the filtered markers.
          map.fitBounds(bounds);
          map.setZoom(16);
        }
      }
    });
};


var viewModel = new ViewModel();
ko.applyBindings(viewModel);
