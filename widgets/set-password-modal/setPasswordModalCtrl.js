angular.module('mainApp').controller('setPasswordModalCtrl', ['$scope', '$modalInstance', 'teamFactory', 'authService', 'Person',
  function ($scope, $modalInstance, teamFactory, authService, Person) {

    $scope.person = Person;
    $scope.ConfirmPassword = '';
    $scope.NewPassword = '';

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.savePassword = function () {
      $scope.tooShort = false;
      if ($scope.ConfirmPassword != '' && $scope.ConfirmPassword.length > 2 && $scope.NewPassword == $scope.ConfirmPassword) {
        teamFactory.updateUserPassword({ PersonID: $scope.person.PersonID, Password: $scope.ConfirmPassword }).success(function (data) {
          $scope.person.Password = data;
          if (authService.person.PersonID == $scope.person.PersonID)
            authService.person.Password = data;
        });
        $scope.setPassword = false;
        $scope.NewPassword = "";
        $scope.ConfirmPassword = "";
        $scope.close();
      }
      else {
        if ($scope.ConfirmPassword.length < 3) {
          $scope.tooShort = true;
        }
      }
    }
  }
]);