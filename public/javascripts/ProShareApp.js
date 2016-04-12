var app = angular.module('ProShareApp', [], function($locationProvider){
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
});

app.controller('RegisterCtrl', ['$scope','$http', '$window', function($scope, $http, $window){
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

app.controller('ConfirmationCtrl', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location){
  $scope.error = false
  $scope.confirm = function(){
    $http({
      method: 'POST',
      url: 'http://localhost:3000/users'+$location.url(),
      data: {conf_key: $scope.confkey},
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.error;
        $scope.errmessage = response.message;
      }
      else{
        $window.location.href = '/'
      }
    })   
  }
}])

app.controller('LoginCtrl', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location){
  $scope.error = false
  console.log($scope.user)
  $scope.login = function(){
    $http({
      method: 'POST',
      url: 'http://localhost:3000/users'+$location.url(),
      data: $scope.user,
    }).
    success(function(response){
      if(response.error){
        $scope.error = response.error;
        $scope.errmessage = response.message;
      }
      else{
        $window.location.href = '/'
      }
    })   
  }
}])