angular.module('mainApp').controller('SelectToolsModalCtrl', ['$scope', '$modalInstance', 'activity', 'ToolsOnly', 'TaskVersionID', 'UseType',
  function ($scope, $modalInstance, activity, ToolsOnly, TaskVersionID, UseType) {

    $scope.useType = UseType;
    $scope.taskVersionID = TaskVersionID;
    $scope.toolsOnly = ToolsOnly;
    $scope.activity = activity;


    switch ($scope.useType) {
      case 'Annotation':
        $scope.title = 'Insert Tool Code';
        break;
      case 'SelectSingleForImporter':
        $scope.title = 'Select Tool';
        break;
      case 'SelectMultipleForServicePlan':
        $scope.title = 'Select Tools';
        break;
      case 'SelectMultipleForActivity':
        $scope.title = 'Select Tools';
        break;
    }


    $scope.handleInput = function (input) {
      switch (UseType) {
        case 'Annotation':
          $modalInstance.close(input);
          break;
        case 'SelectSingleForImporter':
          $modalInstance.close(input);
          break;
        case 'SelectMultipleForServicePlan':
          activity.Tools = ToolsOnly;
          break;
        case 'SelectMultipleForActivity':
          break;
      }
    };

    $scope.close = function () {
      if ($scope.useType == 'SelectMultipleForServicePlan') {
        $modalInstance.close($scope.activity.Tools);
      } else {
        if ($scope.useType == 'SelectSingleForImporter')
          $modalInstance.dismiss();
        else
          $modalInstance.close('');
      }
    };
  }
]);