function sideMenuController ($scope, $location, $log) {

    $scope.switchSubMenu = function (e) {
        var li = angular.element(e).parent();
        li.find("ul:first").css("display","block");
        li.addClass("active");
    };

    $scope.scrollContentTo = function (id) {
        var top0 = $("#right_content").scrollTop();
        var top = $(id).offset().top;
        $("#right_content").animate({scrollTop: (top0+top-70)}, "slow");
    };

};