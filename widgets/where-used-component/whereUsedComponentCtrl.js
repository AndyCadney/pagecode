(function () {
'use strict';

angular
  .module('mainApp')
  .component('whereUsed', {
    templateUrl: '/App_Portal/components/widgets/where-used-component/where-used-component.html',
    bindings: {
      uses: '<',
      type: '<'
    },
    controllerAs: 'wu',
    controller: whereUsedComponentCtrl
  });
function whereUsedComponentCtrl() {
  var wu = this;
}

})();