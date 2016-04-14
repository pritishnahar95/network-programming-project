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

app.controller('DashboardCtrl', ['$scope', '$window', 'localStorageService', '$http', function($scope, $window, localStorageService, $http){
  $scope.username = localStorageService.get('user_info').user.username
  $scope.flag1 = true
  $scope.flag2 = false
  $scope.flag3 = false
  
  var userObject = localStorageService.get('user_info').user
  console.log(userObject)
  
  $scope.username = userObject.username
  $scope.name = userObject.firstname + " " + userObject.lastname
  $scope.bitsid = userObject.bitsid
  $scope.branch = userObject.branch
  $scope.email = userObject.email
  
  $scope.userdetails = function(){
    $scope.flag1 = true
    $scope.flag2 = false
    $scope.flag3 = false
  }
  
  $scope.userprojects = function(){
    $scope.flag1 = false
    $scope.flag2 = true
    $scope.flag3 = false
  }
  
  $scope.createproject = function(){
    $scope.flag1 = false
    $scope.flag2 = false
    $scope.flag3 = true
  }
  
  $scope.create = function(){
    $http({
      method: 'POST',
      url: 'http://10.3.11.34:3000/projects/create/'+$scope.username,
      data: {title: $scope.project.title, description: $scope.project.description},
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.error;
        $scope.errmessage = response.message;
      }
      else{
        $window.location.href = '/users/dashboard'
      }
    })   
  }
}])