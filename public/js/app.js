angular
    .module('msApp', ['ui.router', 'angularFileUpload'])
    .controller('mainController', mainController)
    .controller('headerController', headerController)
    .controller('sideMenuController', sideMenuController)
    .controller('homeEditController', homeEditController)
    .controller('valueEditController', valueEditController)
    .config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/home_edit');
        $stateProvider
            .state('home_edit', {
                url: "/home_edit",
                templateUrl: "partials0/home_edit.html",
                controller:"homeEditController"
            })
            .state('general_edit', {
                url: "/general_edit",
                templateUrl: "partials0/general_edit.html"
            })
            .state('value_edit', {
                url: "/value_edit",
                templateUrl: "partials0/value_edit.html",
                controller:"valueEditController"
            })
            .state('result', {
                url: "/result",
                templateUrl: "partials/result.html"
            });
    }).directive('includeReplace', function () {
        return {
            require: 'ngInclude',
            restrict: 'A', /* optional */
            link: function (scope, el, attrs) {
                el.replaceWith(el.children());
            }
        };
    }).filter('truncate', function() {
        return function(input, length) {
            input = input || '';
            var out = '';
            for (var i = 0; i < input.length; i++) {
                out = input.charAt(i) + out;
            }
            // conditional based on optional argument
            if (uppercase) {
                out = out.toUpperCase();
            }
            return out;
        };
    }).run(['$rootScope',function ($rootScope) {
        $rootScope.$on('$locationChangeStart',function (event,msg) {
            alert(msg);
            $rootScope.$emit("pageStartChange", msg);
        });
    }]);