(function () {
'use strict';

angular
  .module('mainApp')
  .component('selectToolModal', {
    templateUrl: '/App_Portal/components/widgets/select-tools-modal-component/select-tools-modal-component.html',
    bindings: {
      activity: '=',
      toolsOnly: '=',
      taskVersionID: '=',
      useType: '=',
      onPerformAction: '&'
    },
    controllerAs: 'st',
    controller: selectToolModalComponentCtrl
  });

selectToolModalComponentCtrl.$inject = ['instructFactory'];
function selectToolModalComponentCtrl(instructFactory) {
  var st = this;

  st.pager = {
    currentPage: 1,
    pageSize: 15
  };

  st.performAction = function (input) {
    switch (st.useType) {
      case 'Annotation':
        st.onPerformAction({ input: input });
        break;
      case 'SelectSingleForImporter':
        st.onPerformAction({ input: input });
        break;
      case 'SelectMultipleForServicePlan':
        input.Linked = true;
        st.activity.Tools.push(input);
        break;
      case 'SelectMultipleForActivity':
        input.Linked = true;
        var request = {
          TaskVersionID: st.TaskVersionID,
          Tool: input,
          ActivityID: st.activity.ActivityID
        };
        instructFactory.addActivityTool(request).success(function (data) {
          st.activity.Tools.push(data.ActivityTool);
        });
        break;
    }
  };



  init();

  ////////////////

  function init() {

    st.annotation = false;
    st.loading = true;
    st.tools = [];

    switch (st.useType) {
      case 'Annotation':
        st.annotation = true;
        break;
      case 'SelectMultipleForServicePlan':
        st.activity.Tools = st.toolsOnly;
        st.buttonText = 'Add';
        break;
      case 'SelectSingleForImporter':
        st.buttonText = 'Select';
        break;
      case 'SelectMultipleForActivity':
        st.buttonText = 'Add';
        break;
    }

    instructFactory.getTools().success(function (data) {
      var t = [];
      for (var i = 0; i < data.length; i++) {
        var type = angular.copy(data[i]);
        delete type.ToolCats;
        for (var x = 0; x < data[i].ToolCats.length; x++) {
          var cat = angular.copy(data[i].ToolCats[x]);
          delete cat.Tools;
          for (var y = 0; y < data[i].ToolCats[x].Tools.length; y++) {
            var tool = data[i].ToolCats[x].Tools[y];
            tool.Cat = cat;
            tool.Type = type;
            tool.Linked = false;

            if (st.activity !== null) {
              for (var g = 0; g < st.activity.Tools.length; g++) {
                if (st.activity.Tools[g].ToolID == tool.ToolID) {
                  tool.Linked = true;
                }
              }
            }

            t.push(tool);
          }
        }
      }
      st.tools = t;
      st.loading = false;
    });
  };
}
})();