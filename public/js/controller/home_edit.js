function homeEditController ($scope, $location, FileUploader, $http, $log) {

    var uploader = $scope.uploader = new FileUploader({
        url: '/upload-single'
    });

    // Image filters
    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    // CALLBACKS
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
    };
    uploader.onCompleteAll = function() {
    };

    $scope.data = {
        "banners": [{
            "image": '1.jpg',
            "heading": 'Account Partner',
            "content": 'Juha Sipola'
        },{
            "image": '1.jpg',
            "heading": 'Account Partner2',
            "content": 'Juha Sipola2'
        },{
            "image": '1.jpg',
            "heading": 'Account Partner3',
            "content": 'Juha Sipola3'
        }],
        "featurettes": [{
            "image": '1.jpg',
            "heading": 'Account Partner',
            "content": 'Juha Sipola'
        },{
            "image": '1.jpg',
            "heading": 'Account Partner2',
            "content": 'Juha Sipola2'
        },{
            "image": '1.jpg',
            "heading": 'Account Partner3',
            "content": 'Juha Sipola3'
        }],
        "profiles": [{
            "icon": '1.jpg',
            "title": 'Account Partner',
            "name": 'Juha Sipola',
            "email": 'juha.sipola@fi.ibm.com'
        },{
            icon: '3.jpg',
            title: 'European SAP HANA & Analytics Leader ',
            name: 'Sanjay Das',
            email: 'sanjay.das@uk.ibm.com'
        },{
            icon: '2.jpg',
            title: 'Digital Service Line Leader',
            name: 'Laura Sutinen',
            email: 'lsutinen@fi.ibm.com'
        },{
            icon: '4.jpg',
            title: 'Industry COE Leader (Oil & Gas)',
            name: 'Seshasai Kandrakota',
            email: 'seshasai.k@in.ibm.com '
        },{
            icon: '5.jpg',
            title: 'Managing Consultant(BI & EPM)',
            name: 'Shivaram Kashyap',
            email: 'shivaram.kashyap@se.ibm.com '
        },{
            icon: '6.jpg',
            title: 'Delivery Project Executive',
            name: 'Eric Zenkner',
            email: 'eric.zenkner@fi.ibm.com'
        }]
    };

    $scope.team = null;

    $scope.profile = {
        icon: '',
        title: '',
        name: '',
        email: ''
    }

    $scope.banner = {
        image: '',
        heading: '',
        content: '',
    }

    $scope.featurette = {
        image: '',
        heading: '',
        content: '',
    }

    $scope.indexMark = 0 ;


    $scope.moveup = function(index, name) {
        var array = $scope.data[name];
        //change the order
        if(index > 0){
            var temp = array[index-1];
            array[index-1] = array[index];
            array[index] = temp;
        }
    };

    $scope.movedown = function(index, name) {
        var array = $scope.data[name];
        //change the order
        if(index < (array.length-1)){
            var temp = array[index+1];
            array[index+1] = array[index];
            array[index] = temp;
        }
    };

    $scope.editBanner = function(index) {
        $scope.banner = $scope.data.banners[index];
        //change Modal title
        $('#bannerImageHeadingModal').on('show.bs.modal', function(e) {
            if(e.relatedTarget.isEdit){
                $(this).find(".modal-title:first").text("Edit banner Image heading");
            }
        })
        $('#bannerImageHeadingModal').modal(null, {isEdit: true});
    };

    $scope.editFeaturette = function(index) {
        $scope.banner = $scope.data.banners[index];
        //change Modal title
        $('#featuretteHeadingModal').on('show.bs.modal', function(e) {
            if(e.relatedTarget.isEdit){
                $(this).find(".modal-title:first").text("Edit featurette heading");
            }
        })
        $('#featuretteHeadingModal').modal(null, {isEdit: true});
    };

    $scope.addBanner = function() {
        $scope.banner = {
            image: '',
            heading: '',
            content: ''
        };
        $('#bannerImageHeadingModal').modal(null, {isEdit: false});
    };

    $scope.addFeaturette = function() {
        $scope.featurette = {
            image: '',
            heading: '',
            content: ''
        };
        $('#featuretteHeadingModal').modal(null, {isEdit: false});
    };

    $scope.saveBanner = function() {
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            if(status == 200){
                $scope.banner.image = response;
                $scope.data.banners.push($scope.banner);
                $('#bannerImageHeadingModal').modal('hide');
            }else{

            }
        };
        if(uploader.queue.length>0) {
            uploader.uploadItem(uploader.queue.length-1);
        }
    };

    $scope.saveFeaturette = function() {
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            if(status == 200){
                $scope.featurette.image = response;
                $scope.data.featurettes.push($scope.featurette);
                $('#featuretteHeadingModal').modal('hide');
            }else{

            }
        };
        if(uploader.queue.length>0) {
            uploader.uploadItem(uploader.queue.length-1);
        }
    };


    $scope.remove = function(index, name) {
        var array = $scope.data[name];
        //delete
        array.splice(index, 1);
    }

    $scope.gotoTeam = function() {
        $scope.generateTeamShowData();
        $location.url("/team");
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
        alert('getData1');
        console.log("childCtr2", msg);
        $scope.ctr1Name = msg;
        $scope.$emit("sendDataHome", $scope.data);
    });

};