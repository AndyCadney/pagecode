angular.module('mainApp').controller('yesnoConfirmModalCtrl', ['$scope', '$modalInstance', 'message',
  function ($scope, $modalInstance, message) {

    $scope.message = message;

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.yes = function () {
      $modalInstance.close({ yes: true });
    };

    $scope.no = function () {
      $modalInstance.close({ yes: false });
    };
  }
]);