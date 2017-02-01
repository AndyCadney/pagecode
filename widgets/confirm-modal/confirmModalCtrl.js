angular.module('mainApp').controller('confirmModalCtrl', ['$scope', '$modalInstance', 'confirmModel','$sce',
  function ($scope, $modalInstance, confirmModel, $sce) {

    $scope.message = $sce.trustAsHtml(confirmModel.message);
    $scope.btn = confirmModel.btn;

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.confirm = function () {
      $modalInstance.close();
    };
  }
]);