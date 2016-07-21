(function () {
    
    'use strict';
    
    var app = angular.module('flapperNews', ['ui.router']);
    
    
    // CONFIG =================================================================
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
                controller : 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            });
        
        $urlRouterProvider.otherwise('home');

    }]);
    
    
    // SERVICES ===============================================================
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
        
        o.get = function (id) {
            return $http.get('/posts/' + id)
                .then(function (res) {  // using a promise here instead of .success - why?
                    return res.data;
                });
        };
        
        o.addComment = function (id, comment) {
            return $http.post('/posts/' + id + '/comments', comment);
        };
        
        o.upvoteComment = function (post, comment) {
            return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
                .success(function (data) {
                    comment.upvotes += 1;
                });
        };
    
        return o;
    }]);
    
    
    // CONTROLLERS ============================================================
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
    
    app.controller('PostsCtrl', ['$scope', 'posts', 'post', function ($scope, posts, post) {
        
        // Where's 'post' coming from?  It's created in the ui-router 'posts' state.
        // When ui-router detects we are entering the posts state, it triggers the resolve
        // and queries the server for the full post object, including comments.
        // Only after the request has returned will the state finish loading.
        // To access the retrieved post object in PostsCtrl, instead of going through
        // the posts service, the specific object will be directly injected into PostsCtrl.
        // We no longer need $stateParams.
        // We still inject 'posts' to gain access to its methods for manipulating comments.
        $scope.post = post;
        
        $scope.addComment = function () {
            if ($scope.body === '') {
                return;
            }
            
            posts.addComment(post._id, {
                body  : $scope.body,
                author: 'user'
            }).success(function (comment) {
                $scope.post.comments.push(comment);
            });
            
            $scope.body = '';
        };
        
        $scope.incrementUpvotes = function (comment) {
            posts.upvoteComment(post, comment);
        };
        
    }]);
    
})();