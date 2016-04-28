var app = angular.module('ProShareApp', ['LocalStorageModule'], function($locationProvider){
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('fileUpload', ['$http','$window', function ($http, $window) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
          $window.location.reload()
        })
        .error(function(){
          console.log("error in uploading")
        });
    }
}]);

app.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('ProSharePrefix');
});


app.controller('RegisterCtrl', ['$scope','$http', '$window', 'localStorageService', function($scope, $http, $window, localStorageService){
  $scope.register = function(){
    $http.post('/users/register', $scope.user).success(function(response){
      if(response.error){
        $scope.error = response.error;
      }
      else{
        $window.location.href = '/confirmation/' + response.data;
      }
    })
  }
}]);

app.controller('ConfirmationCtrl', ['$scope', '$http', '$window', '$location', 'localStorageService', function($scope, $http, $window, $location, localStorageService){
  $scope.confirm = function(){
    $http({
      method: 'POST',
      url: '/users'+$location.url(),
      data: {conf_key: $scope.confkey},
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.error;
      }
      else{
        localStorageService.set('user_info', response)
        localStorageService.set('loggedin', true)
        localStorageService.cookie.set('x-access-token', response.token)
        $window.location.href = '/'
      }
    })   
  }
}])

app.controller('LoginCtrl', ['$scope', '$http', '$window', '$location', 'localStorageService', function($scope, $http, $window, $location, localStorageService){
  localStorageService.set('loggedin', false)
  $scope.login = function(){
    $http({
      method: 'POST',
      url: '/users'+$location.url(),
      data: $scope.user,
    }).
    success(function(response){
      console.log(response)
      if(response.error){
        $scope.error = response.error;
      }
      else{
        localStorageService.set('user_info', response)
        localStorageService.set('loggedin', true)
        localStorageService.cookie.set('x-access-token', response.token)
        $window.location.href = '/'
      }
    })   
  }
}])

app.controller('IndexCtrl', ['$scope', '$window', 'localStorageService', '$http', function($scope, $window, localStorageService, $http){
  $scope.loggedin = localStorageService.get('loggedin')
  $scope.logout = function(){
    localStorageService.clearAll()
    localStorageService.cookie.clearAll();
    $window.location.href = '/'
  }
}])

app.controller('DashboardCtrl', ['$scope', 'localStorageService', '$http', function($scope, localStorageService, $http){
  $scope.username = localStorageService.get('user_info').user.username
  $http({
    method: 'GET',
    url: '/users/getprojects/'+localStorageService.get('user_info').user.username
  }).
  success(function(response){
    if(response.error){
      console.log(response)
      // $scope.error = response.message
    }
    else{
      localStorageService.set('admin_projects', response.projects)
    }
  })
    
  $http({
    method: 'GET',
    url: '/users/getallprojects/'+localStorageService.get('user_info').user.username
  }).
  success(function(response){
    if(response.error){
      console.log(response)
      // $scope.error = response.message
    }
    else{
      localStorageService.set('member_projects', response.projects)
    }
  })
}])

// Controllers inside dashboard view.
app.controller('UserDetailsCtrl', ['$scope', 'localStorageService', function($scope, localStorageService){
  var userObject = localStorageService.get('user_info').user
  $scope.username = userObject.username
  $scope.name = userObject.firstname + " " + userObject.lastname
  $scope.bitsid = userObject.bitsid
  $scope.branch = userObject.branch
  $scope.email = userObject.email
}])

app.controller('AdminProjectsCtrl', ['$scope', 'localStorageService', '$http', function($scope, localStorageService, $http){
    $http({
      method: 'GET',
      url: '/users/getprojects/'+$scope.username
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.message
      }
      else{
        $scope.data = response.projects
      }
    })
}])


app.controller('IndProjectCtrl', ['$scope', 'localStorageService', '$http', '$location', '$window', 'fileUpload', function($scope, localStorageService, $http, $location, $window, fileUpload){
    $http({
      method: 'GET',
      url: '/projects/page/otherusers/'+$location.url().split("/")[3]
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.message
      }
      else{
        $scope.otherusers = response.data
      }
    })
    
    $http({
      method: 'GET',
      url: '/projects/page/'+$location.url().split("/")[3]
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.message
      }
      else{
        for(var i = 0; i<localStorageService.get('admin_projects').length; i++){
          if(response.data[0].project_id == localStorageService.get('admin_projects')[i].project_id){
            $scope.flag = true
            break
          }
        }
        $scope.project = response.data[0]
      }
    })
    
    $http({
      method: 'GET',
      url: '/projects/page/usersrequesting/'+$location.url().split("/")[3]
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.message
      }
      else{
        $scope.users = response.data
      }
    })
    
    $scope.uploadFile = function(){
        $http({
          method: 'POST',
          url: '/projects/mkdir/'+$location.url().split("/")[3]
        }).
        success(function(response){
          console.log(response)
          if(response.error){
            console.log(response)
          }
          else{
            var file = $scope.myFile;
            var uploadUrl = "/projects/upload/"+$location.url().split("/")[3];
            fileUpload.uploadFileToUrl(file, uploadUrl);
          }
        })
    };
    
    $scope.showfiles = function(project_id){
      $http({
        method: 'GET',
        url: '/projects/getfiles/'+$location.url().split("/")[3]
      }).
      success(function(response){
          if(response.error){
            console.log(response)
          }
          else{
            $scope.data1 = response.data
          }
      })
    }
    
    $scope.download = function(){
      $http({
        method: 'GET',
        url: '/download'
      }).
      success(function(response){
        console.log(response)
      })   
    }
    
    $scope.deletefile = function(project_id, file){
      console.log("here")
      $http({
        method: 'POST',
        url: '/projects/deletefile/'+$location.url().split("/")[3],
        data: {filename: file}
      }).
      success(function(response){
        if(response.error){
          $scope.error = response.message
        }
        else{
          $window.location.reload()
        }
      })
    }
    
    $scope.shownotices = function(){
      $http({
        method: 'GET',
        url: '/projects/getnotices/project/'+$scope.project.project_id
      }).
      success(function(response){
        if(response.error){
          $scope.error = response.message
        }
        else{
          $scope.data = response.data
        }
      })
    }
   
    $scope.createnotice = function(){
      var url = '/projects/createnotice/user/'+localStorageService.get('user_info').user.user_id + '/project/' + $scope.project.project_id
      $http({
        method: 'POST',
        url: url,
        data: {content: $scope.notice.content},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        }
      }).
      success(function(response){
        if(response.error){
          $scope.error = response.error;
        }
        else{
          $window.location.href = '/users/dashboard/adminprojects'
        }
      })
    }
    
    $scope.acceptrequest = function(project_id, user_id, decision){
      $http({
        method: 'PUT',
        url: '/projects/acceptrequest/project/'+project_id+'/user/'+user_id+'/admin/'+localStorageService.get('user_info').user.user_id+'/'+decision
      }).
      success(function(response){
        if(response.error){
          $scope.error = response.error;
        }
        else{
          $window.location.reload()
        }
      })
    }
    
    $scope.inviteuser = function(user_id, project_id){
      var url = '/projects/inviteuser/'+user_id+'/project/'+project_id+'/admin/'+localStorageService.get('user_info').user.user_id
      $http({
        method : 'PUT',
        url : url
      }).
      success(function(response){
        if(response.error){
          $scope.error = response.error;
        }
        else{
          $window.location.reload()
        }
      })
    }
    
}])

app.controller('MemberProjectsCtrl', ['$scope', 'localStorageService', '$http', function($scope, localStorageService, $http){
    $http({
      method: 'GET',
      url: '/users/getallprojects/'+$scope.username
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.message
      }
      else{
        $scope.data = response.projects
      }
    })
}])

app.controller('ProjectInvitesCtrl', ['$scope', 'localStorageService', '$http', '$window', function($scope, localStorageService, $http, $window){
    $http({
      method: 'GET',
      url: '/users/getinvites/user/'+localStorageService.get('user_info').user.user_id
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.message
      }
      else{
        $scope.data = response.data
      }
    })
    
    $scope.acceptinvite = function(project_id, decision){
      var url = '/users/acceptinvite/project/'+project_id+'/'+localStorageService.get('user_info').user.user_id+'/'+decision
      $http({
        method: 'PUT',
        url: url
      }).success(function(response){
        if(response.error){
          console.log(response)
        }
        else{
          $window.location.reload()
        }
      })
    }
    
}])

app.controller('CreateProjectCtrl', ['$scope', 'localStorageService', '$http', '$window', function($scope, localStorageService, $http, $window){
    $scope.create = function(){
      $http({
        method: 'POST',
        url: '/projects/create/'+localStorageService.get('user_info').user.username,
        data: {title: $scope.project.title, description: $scope.project.description, branchname:$scope.project.branchname}
      }).
      success(function(response){
        if(response.error){
          $scope.error = response.message;
        }
        else{
          $window.location.href = '/users/dashboard/adminprojects'
        }
      })
    }
}])

app.controller('OtherProjectsCtrl', ['$scope', 'localStorageService', '$http', '$window', function($scope, localStorageService, $http, $window){
  $http({
    method: 'GET',
    url: '/users/otherprojects/'+localStorageService.get('user_info').user.user_id
  }).
  success(function(response){
    console.log(response)
    if(response.error){
      $scope.error = response.message
    }
    else{
      $scope.projects = response.projects
    }
  })
  
  $scope.sendrequest = function(id){
    $http({
      method: 'PUT',
      url: '/users/sendrequest/'+localStorageService.get('user_info').user.username+'/project/'+id
    }).
    success(function(response){
      console.log(response)
      if(response.error){
        $window.location.href = '/users/dashboard/otherprojects'
      }
      else{
        $window.location.href = '/users/dashboard/requestsent'
      }
    })
  }
}])

app.controller('RequestSentCtrl', ['$scope', '$http', 'localStorageService', function($scope, $http, localStorageService){
  $http({
    method: 'GET',
    url: '/users/requestsent/'+localStorageService.get('user_info').user.user_id
  }).
  success(function(response){
    if(response.error){
      $scope.error = response.message
    }
    else{
      $scope.data = response.projects
    }
  })
}])
