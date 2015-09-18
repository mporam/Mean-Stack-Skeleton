// The main application module that contains the next level of sub-modules for child states.
// The purpose of this state is to include global application dependencies and global configuration.
angular.module("app", [ // External dependencies
"ui.router", "ngResource", "ngSanitize", "ngAnimate", "foundation", // Application child module dependencies, i.e. the next level in the state tree
// In our application this is a single state
"app.users" ]).config([ "$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
    // Declare this root state of all sub-modules abstract, i.e. we cannot navigate to it
    $stateProvider.state("app", {
        url: "",
        template: '<div data-ui-view class="grid-block"></div>',
        "abstract": true
    });
    // Enable HTML5 mode
    $locationProvider.html5Mode(true).hashPrefix("!");
    // Ensure we go to the users child state when just the base url is typed
    $urlRouterProvider.when("", "/users").when("/", "/users");
} ]).run([ function() {
    // Use fast click so there is no debounce period when users tap mobile devices
    FastClick.attach(document.body);
} ]);
// The users child state
angular.module("app.users", []).config([ "$stateProvider", function($stateProvider) {
    $stateProvider.state("app.users", {
        url: "/users",
        templateUrl: "/modules/app.users/view.html",
        controller: "app.users.controller",
        // Resolves enable us to initialise data before the view is loaded
        resolve: {
            // Every time this state is loaded we will create a new user by calling the service layer
            createUser: [ "$resource", function($resource) {
                var User = $resource("/api/users/:userId");
                var newUser = new User({
                    firstname: "Test",
                    lastname: "User"
                });
                // Returning the promise ensures the resolve blocks until we have completed
                // the service layer call
                return newUser.$save().$promise;
            } ],
            // Once the new user is created we return all users, from the service layer, to display on the page
            users: [ "$resource", function($resource) {
                var User = $resource("/api/users/:userId");
                return User.query().$promise;
            } ]
        }
    });
} ]);
angular.module("app.users").controller("app.users.controller", [ "$scope", "users", // Users is resolved in the module definition
function($scope, users) {
    // Make the users obtained from the service layer available to the view
    $scope.users = users;
} ]);