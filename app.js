var app = angular.module('app', ['slider']);

app.controller('mainController', function($scope){
  $scope.from = 10;
  $scope.to = 60;
});
