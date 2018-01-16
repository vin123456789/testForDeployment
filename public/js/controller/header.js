function headerController ($scope, $location, $http, $log) {

    $scope.user = null;

    $scope.getUser = function (e) {
        $http({method:'get',url:'/user'}).then(function successCallback(response) {
            $scope.user = response.data;
        }, function errorCallback(response) {
        });
    };

};