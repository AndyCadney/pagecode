angular.module('mainApp').controller('setPinModalCtrl', ['$scope', '$modalInstance', 'teamFactory', 'cacheService', 'Person',
  function ($scope, $modalInstance, teamFactory, cs, Person) {

    $scope.selectedPIN = '';
    $scope.pinLength = cs.get('global:settings', 0).pinLength;

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.changePIN = function () {
      if (validatePIN()) {
        var pinRequest = {
          Person: Person,
          EnteredPIN: $scope.selectedPIN
        }
        teamFactory.changePIN(pinRequest).success(function (data) {
          $scope.pinEntryError = "";
          $modalInstance.close(data);
        });
      }
    };

    $scope.enterPINNo = function (num, event) {
      var blnAdd = true;
      //Allow only numbers, delete, backspace, tab and enter
      if (event) {
        if (event.keyCode != 8 && event.keyCode != 9 && event.keyCode != 13 && event.keyCode != 46) {
          event.preventDefault();
        }
        else if (event.keyCode == 13) {
          blnAdd = false;
          $scope.changePIN();
        }
        else {
          blnAdd = false;
        }
      }

      if (blnAdd) {
        $scope.pinEntryError = "";
        if ($scope.selectedPIN.length < $scope.pinLength) {
          $scope.selectedPIN = $scope.selectedPIN + num;
        }
      }
    };

    function validatePIN() {
      if ($scope.selectedPIN.length != $scope.pinLength) {
        $scope.pinEntryError = "PIN must be " + $scope.pinLength + " characters long";
        return false;
      }
      else {
        return true;
      }
    };

  }
]);