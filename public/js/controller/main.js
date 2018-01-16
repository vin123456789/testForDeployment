function mainController ($scope, $rootScope, $location, $http, $log) {

    $scope.user = null;

    $scope.data = {"home":null,
        "value":null
    };

    $scope.startSave = false;

    $scope.save = function (e) {
        $scope.startSave = true;
        $scope.$broadcast("getData", null);
    };

    $scope.checkSave = function (key) {
        alert("do2");
        if($scope.startSave && $scope.data.home && $scope.data.value) {
            $scope.startSave = false;
            alert("do");

            $http({
                method: 'post',
                url: '/save',
                data: $scope.data,
                headers: {'Content-Type': 'application/json'}
            }).success(function (req) {
                alert()
                //$location
                console.log(req);
            })
        }
    };

    $scope.$on("sendDataHome", function (event, msg) {
        $scope.data.home = msg;
        $scope.checkSave();
    });

    $scope.$on("sendDataValue", function (event, msg) {
        $scope.data.value = msg;
        $scope.checkSave();
    });

    $rootScope.$on('pageStartChange',function(event, msg){
        $scope.$broadcast("getData", null);
    });

};