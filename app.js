(function () {
    
    'use strict';
    
    var app = angular.module('flapperNews', ['ui.router']);
    
    
    // ============= CONFIG ============
    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        
        $stateProvider
        
            .state('home', {
                url: '/home',
                templateUrl: 'views/home.html',
                controller : 'MainCtrl'
            })
        
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: 'views/posts.html',
                controller : 'PostsCtrl'
            });
        
        $urlRouterProvider.otherwise('home');

    }]);
    
    
    // ============ SERVICES ===========
    app.factory('post', [function () {
        var o = {
            posts: []
        };
        return o;
    }]);
    
    
    // ========== CONTROLLERS ==========
    app.controller('MainCtrl', ['$scope', 'post', function ($scope, post) {
        
        // retrieve posts from 'posts' service & method
        // and bind to $scope
        $scope.posts = post.posts;
        
        /* ADD POSTS */
        $scope.addPost = function () {
            
            // prevent blank posts
            if (!$scope.title || $scope.title === '') {
                return;
            }
            
            // push new posts
            $scope.posts.push({
                title   : $scope.title,
                link    : $scope.link,
                upvotes : 0,
                comments: [
                    {
                        author : 'Joe',
                        body   : 'Cool post!',
                        upvotes: 0
                    },
                    {
                        author : 'Bob',
                        body   : 'Everything is wrong!',
                        upvotes: 0
                    }
                ]
            });
            
            // reset form
            $scope.title = '';
            $scope.link  = '';
            
        };
        
        /* INCREMENT UPVOTES */
        $scope.incrementUpvotes = function (post) {
            
            post.upvotes += 1;
            
        };
        
    }]);
    
    app.controller('PostsCtrl', ['$scope', '$stateParams', 'post', function ($scope, $stateParams, post) {
        
        // get {id} from URL to load appropriate post
        $scope.post = post.posts[$stateParams.id];
        
    }]);
    
})();