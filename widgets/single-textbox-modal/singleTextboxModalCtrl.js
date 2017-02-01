angular.module('mainApp').controller('singleTextboxModalCtrl', ['$scope', '$modalInstance', 'labelText', 'titleText', 'saveFunction', 'errorMessage', 'inputCanBeNull', 'inputModel', 'inputPlaceholder',
function ($scope, $modalInstance, labelText, titleText, saveFunction, errorMessage, inputCanBeNull, inputModel, inputPlaceholder) {
	vm = this;

	vm.init = function () {
		vm.labelText = labelText ? labelText : "DefaultLabel";
		vm.titleText = titleText ? titleText : "DefaultTitleText";
		vm.saveFunction = saveFunction ? saveFunction : vm.close;
		vm.inputCanBeNull = inputCanBeNull ? inputCanBeNull : false;
		vm.errorMessage = errorMessage ? errorMessage : "Invalid Input";
		vm.inputModel = inputModel ? inputModel : null;
		vm.inputPlaceholder = inputPlaceholder ? inputPlaceholder : null;

		vm.showErrorMessage = false;
		vm.showErrorMessageTooltip = false;
	}

	vm.close = function (obj) {
		$modalInstance.close(obj);
	};

	vm.save = function () {
		if (vm.inputModel != null && vm.inputModel != "") {
			vm.saveFunction(vm.inputModel);
			vm.close();
		}
		else {
			vm.showErrorMessage = true;
			vm.showErrorMessageTooltip = true;
		}
	}

}
]);