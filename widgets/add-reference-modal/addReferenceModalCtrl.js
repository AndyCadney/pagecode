angular.module('mainApp').controller('addReferenceModalCtrl', ['$scope', '$modalInstance', 'instructFactory', 'Upload', '$timeout', 'refLinks', 'ParentID', 'ParentTypeID', 'AddLink', '$q', 'UtilsFactory', 'teamFactory', 'GridUtilsFactory', 'cacheService',
  function ($scope, $modalInstance, instructFactory, Upload, $timeout, refLinks, ParentID, ParentTypeID, AddLink, $q, UtilsFactory, teamFactory, GridUtilsFactory, cs) {

  	var vm = this;

  	vm.AddLink = AddLink;
  	vm.fileTooLarge = false;
  	vm.fileTooLargeTooltip = false;
  	vm.noFile = false;
  	vm.noFileTooltip = false;
  	vm.refLinks = refLinks;
  	vm.ParentID = ParentID;
  	vm.ParentTypeID = ParentTypeID;
  	vm.addedExisting = false;

  	vm.addExistingRefsNoFilesSelected = false;
  	vm.addExistingRefsNoFilesSelectedTooltip = false;
  	vm.addExistingTags = [];

  	vm.up = {
  		file: null
  	};

  	vm.tasksPager = {
  		currentPage: 1,
  		pageSize: 5
  	};

  	vm.routesPager = {
  		currentPage: 1,
  		pageSize: 5
  	};

  	vm.refLink = {
  		LinkContent: '',
  		DateCreated: new Date()
  	};

  	vm.libDocTypes = [];
  	vm.method = 'link';
  	vm.refTasks = [];
  	vm.refRoutes = [];
  	vm.uploading = false;
  	vm.progress = 0;
  	vm.saving = false;

  	function addAndClose(data) {
  		vm.refLinks.push(data);
  		vm.refLinks.sort(function (a, b) {
  			if (a.LinkText < b.LinkText) return -1;
  			if (a.LinkText > b.LinkText) return 1;
  			return 0;
  		});
  		$modalInstance.close(true);
  	}

  	vm.close = function (data) {
  		$modalInstance.close(data);
  	}

  	vm.onFileSelect = function (files) {
  		if (!vm.uploading && files && files.length && files.length > 0 && files[0] !== null) {

  			if (files[0].size < 40000000) {

  				if (vm.method === 'network') {
  					document.getElementById('filePathInputBox').value = document.getElementById('linkBrowse').value;
  					vm.filePath = document.getElementById('filePathInputBox').value;
  				}

  				vm.file = files[0];

  				vm.noFile = false;
  				vm.fileTooLarge = false;

  				//if (!vm.refLink.LinkText) {
  				//	vm.refLink.LinkText = vm.file.name;
  				//}
  			} else {
  				vm.fileTooLargeTooltip = true;
  				vm.fileTooLarge = true;
  				vm.noFileTooltip = false;
  			}
  		}
  	}

  	vm.resetErrors = function () {
  		vm.fileTooLargeTooltip = false;
  		vm.fileTooLarge = false;

  		vm.noFileTooltip = false;
  		vm.noFile = false;

  		vm.invalidURL = false;
  		vm.invalidURLTooltip = false;

  		vm.addExistingRefsNoFilesSelected = false;
  		vm.addExistingRefsNoFilesSelectedTooltip = false;
  	}

  	vm.uploadDoc = function () {
  		vm.fileTooLarge = false;
  		vm.fileTooLargeTooltip = false;

  		if (!vm.refLink.DateCreated) {
  			vm.refLink.DateCreated = "";
  		}

  		var libDocTags = ""

  		if (vm.method != "addExisting") {
  			_.each(vm.tags, function (tag, tagIndex) {
  				if (tag.selected) {
  					libDocTags = libDocTags + (libDocTags.length > 0 ? "," + tag.TagID : tag.TagID);
  				}
  			});
  		} else {
  			_.each(vm.addExistingTags, function (tag, tagIndex) {
  				if (tag.selected) {
  					libDocTags = libDocTags + (libDocTags.length > 0 ? "," + tag.TagID : tag.TagID);
  				}
  			});
  		}

  		if (vm.file) {
  			vm.refLink.LinkText;
  			vm.uploading = true;
  			vm.progress = 0;
  			if (!vm.refLink.RefLinkTypeID) { vm.refLink.RefLinkTypeID = vm.libDocTypes[0].LibDocTypeID; }
  			if (!vm.refLink.LinkText) {
  				var extentionIndex = vm.file.name.indexOf(".");
  				vm.refLink.LinkText = vm.file.name.substring(0, extentionIndex);
  			}
  			if (vm.AddLink) {
  				Upload.upload({
  					url: '/api/references/upload',
  					method: 'POST',
  					params: {
  						ParentTypeID: vm.ParentTypeID,
  						ParentID: vm.ParentID,
  						LibDocTypeID: vm.refLink.RefLinkTypeID,
  						FileName: vm.file.name,
  						LinkText: vm.refLink.LinkText,
  						Tags: libDocTags,
  						DateCreated: vm.refLink.DateCreated
  					},
  					file: vm.file
  				}).progress(function (evt) {
  					vm.progress = parseInt(100.0 * evt.loaded / evt.total);
  				}).success(function (data) {
  					addAndClose(data);
  				});
  			}
  			else {
  				Upload.upload({
  					url: '/api/references/uploadwithoutlink',
  					method: 'POST',
  					params: {
  						LibDocTypeID: vm.refLink.RefLinkTypeID,
  						FileName: vm.file.name,
  						DocDesc: vm.refLink.LinkText,
  						Tags: libDocTags,
  						DateCreated: vm.refLink.DateCreated
  					},
  					file: vm.file
  				}).progress(function (evt) {
  					vm.progress = parseInt(100.0 * evt.loaded / evt.total);
  				}).then(function (data) {
  					vm.close(true);
  				});
  			}
  		}
  		else {
  			vm.noFileTooltip = true;
  			vm.noFile = true;
  			vm.fileTooLargeTooltip = false;
  		}
  	}

  	vm.checkTasks = function () {
  		taskIds = [];
  		for (var i = 0; i < vm.refLinks.length; i++) {
  			if (vm.refLinks[i].TaskID !== null) {
  				taskIds.push(vm.refLinks[i].TaskID);
  			}
  		}
  		for (var i = 0; i < vm.refTasks.length; i++) {
  			var rt = vm.refTasks[i];
  			rt.linked = false;
  			if (taskIds.indexOf(rt.TaskID) !== -1) {
  				rt.linked = true;
  			}
  		}
  	}

  	vm.checkRoutes = function () {
  		routeIds = [];
  		for (var i = 0; i < vm.refLinks.length; i++) {
  			if (vm.refLinks[i].RouteID !== null) {
  				routeIds.push(vm.refLinks[i].RouteID);
  			}
  		}
  		for (var i = 0; i < vm.refRoutes.length; i++) {
  			var rr = vm.refRoutes[i];
  			rr.linked = false;
  			if (routeIds.indexOf(rr.RouteID) !== -1) {
  				rr.linked = true;
  			}
  		}
  	}

  	vm.addTaskLink = function (task) {
  		var rl = {
  			TaskID: task.TaskID,
  			LinkText: task.TaskName,
  			RefLinkTypeID: vm.libDocTypes[0].LibDocTypeID,
  			ParentTypeID: vm.ParentTypeID,
				ParentID: vm.ParentID
  		};
  		instructFactory.saveRefLink(rl).success(function (data) {
  			addAndClose(data);
  		});
  	}

  	vm.addRouteLink = function (route) {
  		var rl = {
  			RouteID: route.RouteID,
  			LinkText: route.RouteName,
  			RefLinkTypeID: vm.libDocTypes[0].LibDocTypeID,
  			ParentTypeID: vm.ParentTypeID,
  			ParentID: vm.ParentID
  		};
  		instructFactory.saveRefLink(rl).success(function (data) {
  			addAndClose(data);
  		});
  	}

  	vm.checkStartPath = function () {
  		if (vm.refLink.RefLinkTypeID && vm.refLink.RefLinkTypeID > 0) {
  			var type = null;
  			for (var i = 0; i < vm.libDocTypes.length; i++) {
  				if (vm.libDocTypes[i].LibDocTypeID === vm.refLink.RefLinkTypeID) {
  					type = vm.libDocTypes[i];
  					break;
  				}
  			}
  			if (type) {
  				vm.refLink.LinkContent = (type.StartingPath ? type.StartingPath : "");
  			}
  		}
  	}

  	vm.createLink = function () {
  		if (vm.form.$valid) {
  			var linkToSave = "";

  			if (vm.method == 'link') {
  				linkToSave = vm.refLink.LinkContent;
  			}
  			if (vm.method == 'network') {
  			  vm.filePath = document.getElementById('FileURL').value;
  				linkToSave = vm.filePath;
  			}
  			if (!vm.refLink.DateCreated) {
  				vm.refLink.DateCreated = "";
  			}

  			vm.saving = true;
  			vm.refLink.ParentTypeID = vm.ParentTypeID;
  			vm.refLink.ParentID = vm.ParentID;

  			var linkDoc = {
  				LinkDocTypeID: vm.refLink.RefLinkTypeID,
  				DocDesc: vm.refLink.LinkText,
  				Url: linkToSave,
  				Tags: [],
  				DateCreated: vm.refLink.DateCreated
  			}

  			_.each(vm.tags, function (tag, tagIndex) {
  				if (tag.selected) {
  					linkDoc.Tags.push({ TagID: tag.TagID });
  				}
  			});

  			if (vm.AddLink) {
  				linkDoc.ParentTypeID = vm.ParentTypeID;
  				linkDoc.ParentID = vm.ParentID;
  				linkDoc.RefLinkTypeID = vm.refLink.RefLinkTypeID;
  				linkDoc.LinkText = vm.refLink.LinkText;

  				instructFactory.CreateLinkDocWithRef(linkDoc).then(function (resp) {
  					vm.saving = false;

  					if (resp.data == null) {
  						vm.invalidURL = true;
  						vm.invalidURLTooltip = true;
  					}
  					else {
  						addAndClose(data);
  					}
  				});
  			}
  			else {
  				instructFactory.CreateLinkDoc(linkDoc).then(function (resp) {
  					vm.saving = false;

  					if (resp.data) {
  						vm.close(true);
  					}
  					else {
  						vm.invalidURL = true;
  						vm.invalidURLTooltip = true;
  					}
  				});
  			}
  		}
  	}

  	function init() {
  		$q.all([
          instructFactory.getTags(),
          instructFactory.getLibDocTypes()
  		]).then(function (resp) {
  			vm.tags = angular.copy(resp[0].data); //Otherwise tags and addExistingTags reference the same tags
  			vm.addExistingTags = angular.copy(resp[0].data);
  			vm.tagLookup = UtilsFactory.CreateLookupObj(vm.tags, 'TagID');

  			for (var i = 0; i < vm.tags.length; i++) {
  				vm.tags[i].selected = false;
  				vm.addExistingTags[i].selected = false;
  			}

  			vm.libDocTypes = resp[1].data;
  			if (resp[1].data && resp[1].data.length > 0) {
  				vm.refLink.RefLinkTypeID = resp[1].data[0].LibDocTypeID;
  			}

  		});
  	}

  	init();

  	//Add Existing
  	vm.searchObject = cs.get('addReferenceModalSearchObject', {
  		AuthorID: null,
  		Author: {},
  		Desc: null,
  		CreatedAfter: null,
  		CreatedBefore: null,
  		FileType: null,
  		DocumentTypeID: null,
  		DocumentType: null,
  		tags: [],
  		searchLib: true,
  		searchLink: true,
      ProductCodes: []
  	});

  	vm.docs = [];
  	vm.selectedFiles = [];

  	vm.addExistingGrid = GridUtilsFactory.GetDefaultGridConfig('documentLibraryUploadedController', 'Documents', 'Document', true, true, true, vm, $scope);
  	vm.addExistingGrid.data = 'vm.docs';
  	vm.addExistingGrid.exporterCsvFilename = 'documents.csv';
  	vm.addExistingGrid.rowHeight = 43;
  	vm.addExistingGrid.columnDefs = [
      { name: 'Description', field: 'DocDesc', displayName: 'Description', enableFiltering: true, enableSorting: true },
      { name: 'URL', field: 'Url', displayName: 'URL', enableFiltering: true, enableSorting: true },
      { name: 'OriginalDocumentName', field: 'OriginalDocumentName', displayName: 'Original Document Name', enableFiltering: true, enableSorting: true },
      { name: 'FileType', field: 'FileType', displayName: 'File Type', enableFiltering: true, enableSorting: true, visible: false },
      { name: 'Type', displayName: 'Document Type', cellTemplate: 'uploadedDocType', enableFiltering: true, enableSorting: true, visible: false },
      { name: 'DateCreated', cellTemplate: 'DateCreated', displayName: 'Date Created', enableFiltering: false, enableSorting: true },
      { name: 'Author', cellTemplate: 'Author', displayName: 'Author', enableFiltering: true, enableSorting: true, visible: false },
      { name: 'Tags', cellTemplate: 'Tags', displayName: 'Tags', enableFiltering: false, enableSorting: false, visible: false },
			{ name: 'addButton', cellTemplate: 'addButton', displayName: '', width: 80, enableColumnResizing: false, enableSorting: false, enableFiltering: false, exporterSuppressExport: true, pinnedRight: true }
  	];

  	vm.getAutoProdOptions = function (text) {
  	  return instructFactory.getProdOptionsByAutocomplete(text).then(function (resp) {
  	    return resp.data;
  	  })
  	}

  	vm.selectRow = function (row) {
  		if (!row.Selected) {
  			vm.selectedFiles.push(row)
  		}
  		else {
  			vm.selectedFiles.splice(vm.selectedFiles.indexOf(row), 1);
  		}
  		row.Selected = !row.Selected;
  	}

  	vm.getDocs = function () {
  		cs.set('addReferenceModalSearchObject', vm.searchObject, true);

  		if (!vm.searchObject.Author.Invalid) {
  		  vm.searchObject.ProductCodes = [];
  		  _.each(vm.searchObject.Products, function (product) {
  		    vm.searchObject.ProductCodes.push(product.OptionCode);
  		  });


  			vm.docs = [];
  			vm.searchObject.tags = [];

  			if (vm.searchObject.CreatedAfter) {
  				vm.searchObject.CreatedAfter = new Date(vm.searchObject.CreatedAfter);
  				vm.searchObject.CreatedAfter.setHours(0, 0, 0, 0);
  			}
  			if (vm.searchObject.CreatedBefore) {
  				vm.searchObject.CreatedBefore = new Date(vm.searchObject.CreatedBefore);
  				vm.searchObject.CreatedBefore.setHours(0, 0, 0, 0);
  			}

  			_.each(vm.addExistingTags, function (tag, tagIndex) {
  				if (tag.selected) {
  					vm.searchObject.tags.push(tag.TagID);
  				}
  			});

  			if (vm.searchObject.searchLib) {
  				vm.searchingLib = true;

  				instructFactory.searchForUploadedRefs(vm.searchObject).then(function (resp) {
  					_.each(resp.data, function (doc, docIndex) {
  						add = true;
  						_.each(vm.refLinks, function (existingRef, existingRefIndex) {
  							if ((existingRef.LinkDocID && doc.LinkDocID && existingRef.LinkDocID == doc.LinkDocID) || (existingRef.LibDocID && doc.LibDocID && existingRef.LibDocID == doc.LibDocID)) {
  								doc.Referenced = true;
  							}
  						});
  						vm.docs.push(doc);
  					});

  					vm.searchingLib = false;
  				});
  			}

  			if (vm.searchObject.searchLink) {
  				vm.searchingLink = true;

  				instructFactory.searchAllLinkDocs(vm.searchObject).then(function (resp) {
  					_.each(resp.data, function (doc, docIndex) {
  						add = true;
  						_.each(vm.refLinks, function (existingRef, existingRefIndex) {
  							if ((existingRef.LinkDocID && doc.LinkDocID && existingRef.LinkDocID == doc.LinkDocID) || (existingRef.LibDocID && doc.LibDocID && existingRef.LibDocID == doc.LibDocID)) {
  								doc.Referenced = true;
  							}
  						});
  						vm.docs.push(doc);
  					});

  					vm.searchingLink = false;
  				});
  			}
  		}
  	}

  	vm.addExistingRef = function (file) {
  		var refLink = {
  			RefLinkTypeID: vm.refLink.RefLinkTypeID,
  			ParentTypeID: vm.ParentTypeID,
  			ParentID: vm.ParentID,
  			LinkText: file.DocDesc,
  			LibDocID: file.LibDocID,
  			LinkDocID: file.LinkDocID
  		}

  		instructFactory.saveRefLink(refLink);

  		file.Referenced = true;
  		vm.addedExisting = true;
  	}

  	vm.clear = function () {
  		vm.searchObject = {
  			AuthorID: null,
  			Author: {},
  			Desc: null,
  			FileType: null,
  			DocumentType: null,
  			tags: []
  		};

  		_.each(vm.tags, function (tag, tagIndex) {
  			tag.selected = false;
  		});

  		vm.clearCreatedAfter();
  		vm.clearCreatedBefore();

  		vm.searchObject.searchLib = true;
  		vm.searchObject.searchLink = true;
  	}

  	vm.clearCreatedAfter = function () {
  		$('#txtcreatedAfter')[0].value = null;
  		vm.searchObject.CreatedAfter = null;
  	}

  	vm.clearCreatedBefore = function () {
  		$('#txtcreatedBefore')[0].value = null;
  		vm.searchObject.CreatedBefore = null;
  	}

  	vm.clearDateCreated = function () {
  		$('#txtdateCreated')[0].value = null;
  		vm.refLink.DateCreated = null;
  	}

  	vm.getAutoPeople = function (text) {
  		return teamFactory.getAutoCompletePeople(8, text, 0, '', false).then(function (resp) {
  			return resp.data;
  		})
  	}

  	vm.checkAuthorValidity = function () {
  		vm.searchObject.AuthorID = null;
  		if (vm.searchObject.Author.FullName && vm.searchObject.Author.FullName != "") {
  			vm.searchObject.Author.Invalid = true;
  		}
  		else {
  			vm.searchObject.Author.Invalid = false;
  		}
  	}

  	vm.setAuthor = function (item) {
  		vm.searchObject.Author = item;
  		vm.searchObject.AuthorID = item.PersonID;
  		vm.searchObject.Author.Invalid = false;
  	}

  	vm.checkDocumentTypeValidity = function () {
  		vm.searchObject.DocumentTypeID = null;
  		if (vm.searchObject.DocumentType.DocType && vm.searchObject.DocumentType.DocType != "") {
  			vm.searchObject.DocumentType.Invalid = true;
  		}
  		else {
  			vm.searchObject.DocumentType.Invalid = false;
  		}
  	}

  	vm.setDocumentType = function (item) {
  		vm.searchObject.DocumentType = angular.copy(item);
  		vm.searchObject.DocumentTypeID = angular.copy(item.LibDocTypeID);
  		vm.searchObject.DocumentType.Invalid = false;
  	}
  }
]);