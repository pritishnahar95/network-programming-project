var app = angular.module('ProShareApp', ['LocalStorageModule'], function($locationProvider){
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
});


app.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('ProSharePrefix');
});


app.controller('RegisterCtrl', ['$scope','$http', '$window', 'localStorageService', function($scope, $http, $window, localStorageService){
  $scope.error = false
  $scope.register = function(){
    $http.post('/users/register', $scope.user).success(function(response){
      if(response.error){
        $scope.error = response.error;
        $scope.errmessage = response.message;
      }
      else{
        $window.location.href = '/confirmation/' + response.data;
      }
    })
  }
}]);

app.controller('ConfirmationCtrl', ['$scope', '$http', '$window', '$location', 'localStorageService', function($scope, $http, $window, $location, localStorageService){
  $scope.error = false
  $scope.confirm = function(){
    $http({
      method: 'POST',
      url: 'http://10.3.11.34:3000/users'+$location.url(),
      data: {conf_key: $scope.confkey},
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.error;
        $scope.errmessage = response.message;
      }
      else{
        localStorageService.set('user_info', response)
        localStorageService.set('loggedin', true)
        //console.log(localStorageService.get('user_info'))
        $window.location.href = '/'
      }
    })   
  }
}])

app.controller('LoginCtrl', ['$scope', '$http', '$window', '$location', 'localStorageService', function($scope, $http, $window, $location, localStorageService){
  $scope.error = false
  $scope.login = function(){
    $http({
      method: 'POST',
      url: 'http://10.3.11.34:3000/users'+$location.url(),
      data: $scope.user,
    }).
    success(function(response){
      console.log(response)
      if(response.error){
        $scope.error = response.error;
        $scope.errmessage = response.message;
      }
      else{
        localStorageService.set('user_info', response)
        localStorageService.set('loggedin', true)
        localStorageService.cookie.set('x-access-token', response.token)
        //console.log(localStorageService.cookie.get('x-access-token'))
        // console.log(localStorageService.get('user_info'))
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
    url: 'http://10.3.11.34:3000/users/getprojects/'+localStorageService.get('user_info').user.username
  }).
  success(function(response){
    if(response.error){
      $scope.errorValue = true
      $scope.errormessage = response.message
    }
    else{
      localStorageService.set('admin_projects', response.projects)
    }
  })
    
  $http({
    method: 'GET',
    url: 'http://10.3.11.34:3000/users/getallprojects/'+localStorageService.get('user_info').user.username
  }).
  success(function(response){
    if(response.error){
      $scope.errorValue = true
      $scope.errormessage = response.message
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
      url: 'http://10.3.11.34:3000/users/getprojects/'+$scope.username
    }).
    success(function(response){
      if(response.error){
        $scope.errorValue = true
        $scope.errormessage = response.message
      }
      else{
        //localStorageService.set('admin_projects', response.projects)
        $scope.data = response.projects
      }
    })
}])


app.controller('IndProjectCtrl', ['$scope', 'localStorageService', '$http', '$location', '$window', function($scope, localStorageService, $http, $location, $window){
    $http({
      method: 'GET',
      url: 'http://10.3.11.34:3000/projects/page/'+$location.url().split("/")[3]
    }).
    success(function(response){
      if(response.error){
        $scope.errorValue = true
        $scope.errormessage = response.message
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
    
    $scope.shownotices = function(){
      console.log($scope.project)
      $http({
        method: 'GET',
        url: 'http://10.3.11.34:3000/projects/getnotices/project/'+$scope.project.project_id
      }).
      success(function(response){
        if(response.error){
          $scope.errorValue = true
          $scope.errormessage = response.message
        }
        else{
          $scope.data = response.data
        }
      })
    }
   
    $scope.createnotice = function(){
      var url = 'http://10.3.11.34:3000/projects/createnotice/user/'+localStorageService.get('user_info').user.user_id + '/project/' + $scope.project.project_id
      console.log()
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
        console.log(response)
        if(response.error){
          $scope.error = response.error;
          $scope.errmessage = response.message;
        }
        else{
          $window.location.href = '/users/dashboard/adminprojects'
        }
      })
    }
}])

app.controller('MemberProjectsCtrl', ['$scope', 'localStorageService', '$http', function($scope, localStorageService, $http){
    $http({
      method: 'GET',
      url: 'http://10.3.11.34:3000/users/getallprojects/'+$scope.username
    }).
    success(function(response){
      if(response.error){
        $scope.errorValue = true
        $scope.errormessage = response.message
      }
      else{
        //localStorageService.set('member_projects', response.projects)
        $scope.data = response.projects
      }
    })
}])

app.controller('CreateProjectCtrl', ['$scope', 'localStorageService', '$http', '$window', function($scope, localStorageService, $http, $window){
    $scope.create = function(){
      $http({
        method: 'POST',
        url: 'http://10.3.11.34:3000/projects/create/'+localStorageService.get('user_info').user.username,
        data: {title: $scope.project.title, description: $scope.project.description, branchname:$scope.project.branchname}
      }).
      success(function(response){
        if(response.error){
          $scope.error = response.error;
          $scope.errmessage = response.message;
        }
        else{
          $window.location.href = '/users/dashboard/adminprojects'
        }
      })
    }
}])

app.controller('OtherProjectsCtrl', ['$scope', 'localStorageService', '$http', function($scope, localStorageService, $http){
    console.log(localStorageService.get('user_info').user.user_id)
    $http({
      method: 'GET',
      url: 'http://10.3.11.34:3000/users/otherprojects/'+localStorageService.get('user_info').user.user_id
    }).
    success(function(response){
      if(response.error){
        $scope.errorValue = true
        $scope.errormessage = response.message
      }
      else{
        $scope.projects = response.projects
      }
    })
}])