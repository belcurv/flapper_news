(function () {
    
    'use strict';
    
    var app = angular.module('flapperNews', ['ui.router']);
    
    
    // ============= CONFIG ============
    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        
        $stateProvider
        
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller : 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function (posts) {
                        return posts.getAll();
                    }]
                }
            })
        
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller : 'PostsCtrl'
            });
        
        $urlRouterProvider.otherwise('home');

    }]);
    
    
    // ============ SERVICES ===========
    app.factory('posts', ['$http', function ($http) {
        
        var o = {};
        
        o.posts = [];
        
        o.getAll = function () {
            return $http.get('/posts')
                .success(function (data) {
                    angular.copy(data, o.posts);
                });
        };
        
        o.create = function (post) {
            return $http.post('/posts', post)
                .success(function (data) {
                    o.posts.push(data);
                });
        };
        
        o.upvote = function (post) {
            return $http.put('/posts/' + post._id + '/upvote')
                .success(function (data) {
                    post.upvotes += 1;
                });
        };
    
        return o;
    }]);
    
    
    // ========== CONTROLLERS ==========
    app.controller('MainCtrl', ['$scope', 'posts', function ($scope, posts) {
        
        // retrieve posts from 'posts' service & method
        // and bind to $scope
        $scope.posts = posts.posts;
        
        /* ADD POSTS */
        $scope.addPost = function () {
            
            // prevent blank posts
            if (!$scope.title || $scope.title === '') {
                return;
            }
            
            // save new posts
            posts.create({
                title   : $scope.title,
                link    : $scope.link
            });
            
            // reset the form
            $scope.title = '';
            $scope.link  = '';
            
        };
        
        /* INCREMENT UPVOTES */
        $scope.incrementUpvotes = function (post) {
            posts.upvote(post);
        };
        
    }]);
    
    app.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', function ($scope, $stateParams, posts) {
        
        // get {id} from URL to load appropriate post
        $scope.post = posts.posts[$stateParams.id];
        
    }]);
    
})();