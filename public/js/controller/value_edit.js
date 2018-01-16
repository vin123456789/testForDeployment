function valueEditController ($scope, $rootScope, $location, FileUploader, $http, $log) {

    var uploader = $scope.uploader = new FileUploader({
        url: '/upload-single',
        queueLimit:5
    });

    var uploader2 = $scope.uploader2 = new FileUploader({
        url: '/upload-single',
        queueLimit:5
    });

    // Image filters
    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|pdf'.indexOf(type) !== -1;
        }
    });

    // CALLBACKS
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        if(status == 200){
            $scope.teamMember.icon = response;
        }
    };
    uploader.onCompleteAll = function() {
    };

    $scope.data = {
        "values": [{
            "image": 'innovation.jpg',
            "title": 'Innovation',
            "pdf": '123.pdf',
        },{
            "image": 'journey.jpg',
            "title": 'Journey',
            "pdf": '123.pdf',
        },{
            "image": 'risks.jpg',
            "title": 'Risks',
            "pdf": '123.pdf',
        },{
            "image": 'team.jpg',
            "title": 'Team',
            "pdf": '123.pdf',
        }]
    };

    $scope.team = null;

    $scope.value = {
        "image": '',
        "title": '',
        "pdf": '',
    }

    $scope.indexMark = 0 ;

    $scope.openLeftMenu = function() {
        $mdSidenav('left').toggle();
    };

    $scope.gotoWelcome = function() {
        $location.url("/welcome");
    };

    $scope.gotoTeam = function() {
        $scope.generateTeamShowData();
        $location.url("/team");
    };


    $scope.addValue = function() {
        $scope.value = {
            image: '',
            title: '',
            pdf: ''
        };
        $('#valueModal').modal(null, {isEdit: false});
    };

    $scope.saveValue = function() {
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            alert(response);
            if(status == 200){
                $scope.value.image = response;
                if(uploader2.queue.length>0) {
                    uploader2.uploadItem(uploader.queue.length-1);
                }
            }else{

            }
        };
        uploader2.onCompleteItem = function(fileItem, response, status, headers) {
            alert(response);
            if(status == 200){
                $scope.value.pdf = response;
                $scope.data.values.push($scope.value);
                $('#valueModal').modal('hide');
            }else{

            }
        };
        if(uploader.queue.length>0) {
            uploader.uploadItem(uploader.queue.length-1);
        }
    };

    $scope.moveup = function(index) {
        var array = $scope.data.values;
        //change the order
        if(index > 0){
            var temp = array[index-1];
            array[index-1] = array[index];
            array[index] = temp;
        }
    };

    $scope.movedown = function(index) {
        var array = $scope.data.values;
        //change the order
        if(index < (array.length-1)){
            var temp = array[index+1];
            array[index+1] = array[index];
            array[index] = temp;
        }
    };

    $scope.generateTeamShowData = function() {
        var data = [];
        for (var i = 0; i < $scope.data.team_members.length; i++ ) {
            if (i % 3 == 0) data.push([]);
            data[data.length-1].push($scope.data.team_members[i]);
        }
        return $scope.team = data;
    };

    $scope.gotoTeamMember = function(index1, index2) {
        $scope.teamMember = $scope.data.team_members[index1*3+index2];
        $location.url("/teamMember");
    };

    $scope.addTeamMember = function() {
        $scope.data.team_members.push({
            icon: '',
            title: '',
            name: '',
            email: ''
        });
        $scope.teamMember = $scope.data.team_members[$scope.data.team_members.length-1];
        $location.url("/teamMember");
    };

    $scope.saveTeamMember = function() {
        if(uploader.queue.length>0) {
            uploader.uploadItem(uploader.queue.length-1);
        }
        $scope.gotoTeam();
    };

    $scope.deleteTeamMember = function(index1, index2) {
        $scope.data.team_members.splice((index1*3+index2), 1);
        $scope.gotoTeam();
    };

    $scope.generate = function() {
        $http({
            method:'post',
            url:'/generate',
            data:$scope.data,
            headers:{'Content-Type': 'application/json'}
        }).success(function(req){
            $location.url("/result");
            console.log(req);
        })

    };

    $scope.$on("getData", function (event, msg) {
        alert('getData2');
        $scope.$emit("sendDataValue", $scope.data);
    });

    $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
        alert('$stateChangeStart');
    });

};