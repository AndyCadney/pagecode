angular.module('mainApp').controller('alertModalCtrl', ['$scope', '$modalInstance', 'alert', '$sce',
  function ($scope, $modalInstance, alert, $sce) {

    $scope.title = alert.title;
    $scope.isHtml = alert.isHtml ? true : false;
    $scope.message = alert.message;

    $scope.DisplayAsHtml = function (text) {
      return $sce.trustAsHtml(text);
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);