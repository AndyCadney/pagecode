angular.module('mainApp').controller('edittextboxController', ['$scope', '$sce', '$timeout', 'cacheService','instructFactory',
function (scope, $sce, $timeout, cacheService, instructFactory) {

    //Single line text box usage
    //<div edit-textbox original-text="task.TaskRef" new-text="task.TaskRef != changedtext ? updateTaskHeader(changedtext, 'TaskRef') : task.TaskRef = task.TaskRef" edit-mode="true" />
    // original-text : the current text
    // new-text : function for the returned text
    // edit-mode : can be edited?
    // non-editable-text : OPTIONAL.  Is used mainly in action text on TVE for the actiontype verb to be displayed but not editable

    //Multi line text box usage
    //<div edit-textbox edit-mode="true" edit-text-area="true" original-text="'WOO WOO'" new-text="saveWOOWOO(changedtext)"></div>
    // edit-text-area : set to true will show a multi line text box

    //Dropdown usage
    //<div edit-textbox edit-mode="true" edit-dropdown="true" dropdown-options="TaskTypes" dropdown-display-field="'TaskTypeName'" dropdown-display-id="'TaskTypeID'" dropdown-selected-id="selectedTaskType.TaskTypeID" new-text="task.TaskTypeID != changedtext ? updateTaskHeader(changedtext, 'TaskTypeID', changedobject) : task.TaskTypeID = task.TaskTypeID"></div>
    // dropdownoptions : array to bind to
    // dropdown-display-field : text to display in dropdown
    // dropdown-display-id : ID field to return on selection
    // dropdown-selected-id : the current array ID selected to be shown
    // new-text : function for returned value.  dropdowns return an addition value for the selectedObject.
    // edit-mode : can be edited?

    //Checkbox usage
    //<div edit-textbox edit-checkbox="true" checkbox-selected="person.FirstAider" new-text="person.FirstAider != changedtext ? updatePerson(changedtext, 'FirstAider') : person.FirstAider = person.FirstAider" edit-mode="true" />
    // checkboxSelected : checked or not initially

    // box width: With either no class statement or class="edit-text-box": if full-width is either set to true, or not set, text box width will be 100%, if full-width is set to false box width is 210px.
    // box width: With full-width: false and class statement class="medium-text-edit-box" box width is 110px, class="qty-text-edit-box" box width is 70px. 
    // DO NOT USE full-width: true or have full-width not set with either class statement class="medium-text-edit-box" or class="qty-text-edit-box", as hover positioning will NOT be correct. 

    //Person autocomplete

    //Datepicker
    //<div class="dates-text-edit-box" edit-textbox edit-datepicker original-text="act.ActionDate" new-text="act.ActionDate != changedtext ? updateAction(changedtext, 'ActionDate') : act.ActionDate = act.ActionDate" edit-mode="true" />
  // NOTE: Class statement added for datepicker
  
  scope.tinyId = "txtTiny-" + Math.floor((Math.random() * 6) + 1);

  scope.tinymceOptions = {
    menubar: false,
    inline: false,
    format: "html",
    statusbar: false,
    plugins: "textcolor paste charmap",
    trusted: true,
    paste_word_valid_elements: "b,strong,i,em,h1,h2,u,strike,p",
    forced_root_block: scope.rootPs && scope.rootPs == 'false' ? false: 'p',
    paste_as_text: true,
    remove_trailing_brs: true,
    toolbar: "cut copy paste | bold italic underline strikethrough | bullist numlist | forecolor backcolor | removeformat | charmap",
    browser_spellcheck: true
  };

  if (scope.stdText && scope.stdText != "" && scope.stdText != "<br>" && scope.stdText != "<br />" && scope.stdText != "<br/>") {
    tinymce.PluginManager.add('stdtextplugin', function (editor, url) {
      editor.addButton('stdtextbtn', {
        text: 'Std Text',
        icon: false,
        onclick: function () {
          editor.insertContent(scope.stdText);
        }
      });
    });
    scope.tinymceOptions.plugins = scope.tinymceOptions.plugins + " stdtextplugin";
    scope.tinymceOptions.toolbar = scope.tinymceOptions.toolbar + " | stdtextbtn";
  }

  if (scope.openEditing && scope.openEditing == true)
    focusTextbox();

  function focusTextbox() {
    $timeout(function () {
      try {
        var ta = $('#' + scope.tinyId + ' > textarea')[0];
        tinyMCE.activeEditor.execCommand('mceFocus', false, ta.id);
      } catch(err) {}
    }, 500);
  };

  scope.setEditing = function (val) {
    scope.Editing = val;
    if (scope.nonEditableTextId)
      scope.$parent.$parent.$parent.editingTextBox = val;
  }

  scope.setEditing(scope.autoEdit);

    if (!scope.originalText) {
      if (scope.originalText != "0") {
        scope.originalText = "";
        scope.EditingText = "";
      }
      else
        scope.EditingText = "0";
    }

    // Setup the non editing text
    scope.customeCss = "";

    function makeid() {
      if (scope.nonEditableTextId) {
        scope.customeCss = "action-type-" + scope.nonEditableTextId;
        scope.tinymceOptions.content_css = "/Document/actiontypecss?" + new Date().getTime();
        scope.tinymceOptions.body_class = scope.customeCss;
      }
    };

    scope.$watch('nonEditableText', function (newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        //scope.Editing = false;
        setDisplayText();
        (scope.$$phase || scope.$root.$$phase) ? makeid() : $scope.$apply(makeid);
        //$timeout(function () { scope.Editing = true; }, 100);
      }
    }, true);

    makeid();

    if (scope.editDropdown || scope.editTypeahead) {
      scope.$watch('dropdownOptions', function (newValue, oldValue) {
        if (newValue) {
          if (scope.editDropdown || scope.editTypeahead) {
            //Setup DisplayOptions and DisplayName
            scope.DisplayOptions = [];

            _.forEach(scope.dropdownOptions, function (opt) {
              var newOpt = {
                DisplayID: opt[scope.dropdownDisplayId],
                DisplayName: opt[scope.dropdownDisplayField],
                DisplayObject: opt
              }
              scope.DisplayOptions.push(newOpt);

              if (scope.dropdownSelectedId == opt[scope.dropdownDisplayId]) {
                scope.selectedOption = newOpt;
                scope.originalText = newOpt.DisplayName;
              }
            })
          }
        }
      });

      scope.$watch('dropdownSelectedId', function (newValue, oldValue) {
        if (newValue) {
          if ((scope.editDropdown || scope.editTypeahead) && scope.DisplayOptions) {

            _.forEach(scope.DisplayOptions, function (opt) {
              if (scope.dropdownSelectedId == opt['DisplayID']) {
                scope.selectedOption = opt;
                scope.originalText = opt.DisplayName;
              }
            })
          }
        }
      });
    }

    function setDisplayText() {
      var net = "";
      if (scope.nonEditableText)
        net = "<strong style='margin-right:4px;float:left;'>" + scope.nonEditableText + "</strong>"

      if (typeof scope.originalText == "string")
        scope.displayText = $sce.trustAsHtml(net + scope.originalText);
      else if (typeof scope.originalText == "number")
        scope.displayText = $sce.trustAsHtml(net + scope.originalText.toString());
      else
        scope.displayText = net + scope.originalText;

    };

    scope.$watch('originalText', function (newValue, oldValue) {
      if (!scope.editDropdown && !scope.editCheckbox && !scope.editTypeahead) {
        if (scope.editDatepicker)
        {
          if (scope.originalText && scope.originalText != "" && scope.dateObj) {
            scope.originalText = moment(scope.dateObj).format('ll');
          }
          else {
            scope.originalText = "";
          }
        }
        scope.EditingText = scope.originalText;
        if (scope.autoEdit)
          scope.editText();
      }
      setDisplayText();
    });

    scope.editText = function () {
      if (scope.editMode) {
        scope.setEditing(true);
        focusTextbox();
      }
    }




    scope.saveText = function ($event) {
      if ($event) {
        $event.currentTarget.focus();
      }
      if (!scope.editDropdown && !scope.editTypeahead && !scope.editCheckbox && !scope.editPersonAutoComplete && !scope.editDatepicker && !scope.editIconSelect && !scope.editTimeSpan) {
          if (!scope.preventBlank || scope.EditingText != '') {
            scope.originalText = scope.EditingText;
            scope.newText({ changedtext: scope.EditingText });
          }
            scope.EditingText = scope.originalText;
        }
        else if (scope.editCheckbox) {
          scope.newText({ changedtext: scope.checkboxSelected });
        }
        else if (scope.editPersonAutoComplete) {
          scope.newText({ changedtext: scope.PersonID, changedobject: scope.PersonFullName });
        }
        else if (scope.editDatepicker) {
          scope.newText({ changedtext: moment(scope.dateObj).toDate(), changedobject: scope.dateObj });
        }
        else if (scope.editIconSelect) {
          scope.newText({ changedtext: scope.selectedIcon.ID });
        }
        else if (scope.editTimeSpan) {
          scope.timeSpanDays = scope.timeSpanDays ? scope.timeSpanDays : 0;
          scope.timeSpanHours = scope.timeSpanHours ? scope.timeSpanHours : 0;
          scope.timeSpanMins = scope.timeSpanMins ? scope.timeSpanMins : 0;
          scope.timeSpanSecs = scope.timeSpanSecs ? scope.timeSpanSecs : 0;

          scope.timeSpanData.Days = scope.timeSpanDays;
          scope.timeSpanData.Hours = scope.timeSpanHours;
          scope.timeSpanData.Mins = scope.timeSpanMins;
          scope.timeSpanData.Secs = scope.timeSpanSecs;

          scope.newText({ changedobject: scope.timeSpanData });
        }
        else {
          scope.originalText = scope.selectedOption.DisplayName;
          scope.newText({ changedtext: scope.selectedOption.DisplayID, changedobject: scope.selectedOption.DisplayObject });
        }
      scope.setEditing(false);
    }

    scope.cancelText = function () {     
      if (!scope.editDropdown && !scope.editTypeahead && !scope.editPersonAutoComplete && !scope.editIconSelect && !scope.editTimeSpan) {
        scope.newText({ changedtext: scope.originalText });
        scope.EditingText = scope.originalText;
      }
      else if (scope.editIconSelect) {
        scope.newText({ changedtext: scope.originalIcon.ID });
        scope.selectedIcon = scope.originalIcon;
      }
      scope.setEditing(false);
    }
    
    scope.updateSelectedPerson = function(PersonID, FullName)
    {
      scope.PersonID = PersonID;
      scope.PersonFullName = FullName;
    }

    scope.changeIcon = function (icon) {
      scope.selectedIcon = icon;
    }

    //revisit this - see comment in editTextBoxDirective.js
    if (scope.fullWidth == undefined || scope.fullWidth)
      scope.FullWidth = true;
    //-----------

    scope.width = scope.FullWidth ? '100%' : '';
    scope.innerWidth = scope.FullWidth ? '100%' : '';    

    if (scope.openEditing) {
      scope.setEditing(true);
    }

    if (scope.editDatepicker) {
      if (scope.originalText && scope.originalText != "")
        scope.dateObj = moment(scope.originalText);
      scope.dateFormat = cacheService.get('global:dateformat');
    }

    if (scope.editProductAutoComplete) {
      scope.getParts = function (val, onlyOptions) {
        return instructFactory.itemsAuto(val, 5, onlyOptions).then(function (data) {
          return data.data;
        });
      };
    }

    if (scope.editIconSelect) {
      scope.selectedIcon = _.filter(scope.iconOptions, function (io) {
        return io.ID == scope.iconSelectedId;
      })[0];

      if (!scope.selectedIcon)
        scope.selectedIcon = scope.iconOptions[0];

      scope.originalIcon = scope.selectedIcon;
      
      if (!scope.selectedIcon.Hidden)
        scope.iconDesc = scope.selectedIcon.Desc;

      scope.setIconDesc = function (text) {
        scope.iconDesc = text;
      }

      scope.resetIconDesc = function () {
        if (!scope.selectedIcon.Hidden)
          scope.iconDesc = scope.selectedIcon.Desc;
        else
          scope.iconDesc = "";
      }
    }

    if (scope.editTimeSpan) {
      scope.timeSpanDays = scope.timeSpanData.Days ? scope.timeSpanData.Days : 0;
      scope.timeSpanHours = scope.timeSpanData.Hours ? scope.timeSpanData.Hours : 0;
      scope.timeSpanMins = scope.timeSpanData.Mins ? scope.timeSpanData.Mins : 0;
      scope.timeSpanSecs = scope.timeSpanData.Secs ? scope.timeSpanData.Secs : 0;
    }
  }
]);