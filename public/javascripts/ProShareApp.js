var app = angular.module('ProShareApp', []);

app.controller('RegisterCtrl', ['$scope','$http', '$window', function($scope, $http, $window){
  $scope.error = false
  $scope.register = function(){
    
    $http.post('/users/register', $scope.user).success(function(response){
      if(response.error){
        $scope.error = response.error;
        $scope.errmessage = response.message;
      }
      else{
        $window.location.href = '/confirmation/' + $scope.username;
      }
      
    })
  }
}]);