# neighborhood-map

This is a single page application featuring a map of River North neighborhood in Chicago and a list of restaurants.
A filter option is provided, that uses an input field to filter both the list view and the map markers displayed by default on load. The list view and the markers update accordingly in real time.
Extra functionality added using Google and MediaWiki APIs to provide information when a map marker or list view entry is clicked. Wikipedia links will be displayed when a restaurant in the list is clicked on. A map marker will animate when clicked on the list item associated with it or the map marker itself is selected.


<img width="1435" alt="neighborhood-map" src="https://cloud.githubusercontent.com/assets/19762832/26764941/f8657622-4936-11e7-8986-2be733f854aa.png">


## Getting Started

### Prerequisites
For this project, you will need a Google account. Sign up for a free account if you don't have one. Create a new project and enable billing for it on the Google Cloud Platform. Enable the Maps JavaScript API and Places API. Create an API key and save it on your machine. You will need it later.

### How to run the project
* Clone the repository to your local machine

`git clone https://github.com/iuriepopovici/neighborhood-map`

* Navigate to the directory that contains the code

* Replace [GOOGLE_API_KEY] in neighborhood-map/index.html with the api key from your google account

* Within the project directory find `index.html` file and double-click on it

* A new browser window will open

* Start using the app

### Make a change

To make a change open the project using a text editor like Atom or Sublime-Text.

## Built With

* [Bootstrap](http://getbootstrap.com/) - CSS and JavaScript framework
* [jQuery](https://jquery.com/) - JavaScript library
* [Google Maps API](https://developers.google.com/maps/) - Used to visualize maps and accessing rich mapping features
* [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page) - Used to get Wikipedia content
* [Knockout JS](http://knockoutjs.com/) - Organizational web framework
* HTML5

## Authors

* **Iurie Popovici** - *Initial work* - [GitHub](https://github.com/IurieCezar)

## Sources used:

* Knockoutjs documentation
* Bootstrap documentation
* Google Maps API documentation
* MediaWiki documentation
* Udacity Online Courses
* Mozilla Developer Network
* Stackoverflow
