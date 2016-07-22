(function () {
    
    'use strict';
    
    var app = angular.module('flapperNews', ['ui.router']);
    
    
    // CONFIG =================================================================
    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        
        $stateProvider
        
            .state('home', {
                url: '/home',
                templateUrl: '/views/home.html',
                controller : 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function (posts) {
                        return posts.getAll();
                    }]
                }
            })
        
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/views/posts.html',
                controller : 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            })
        
            .state('login', {
                url: '/login',
                templateUrl: '/views/login.html',
                controller : 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
        
            /*

            What's 'onEnter'?  Gives us a functio to detect if a user is already authenticated before entering the state.  If they are, we redirect them back to 'home'

            */
        
            .state('register', {
                url: '/register',
                templateUrl: '/views/register.html',
                controller : 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            });
        
        $urlRouterProvider.otherwise('home');

    }]);
    
    
    // SERVICES ===============================================================
    
    // handle HTTP requests relating to posts
    app.factory('posts', ['$http', 'auth', function ($http, auth) {
        
        var o = {};
        
        o.posts = [];
        
        // get all posts
        o.getAll = function () {
            return $http.get('/posts')
                .success(function (data) {
                    angular.copy(data, o.posts);
                });
        };
        
        // create a new post
        o.create = function (post) {
            
            // prepend 'http://' if missing from input link
            if (post.link.indexOf('http://') === -1) {
                post.link = 'http://' + post.link;
            }
            
            return $http.post('/posts', post, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            })
                .success(function (data) {
                    o.posts.push(data);
                });
        };
        
        // upvote a post
        o.upvote = function (post) {
            return $http.put('/posts/' + post._id + '/upvote', null, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            })
                .success(function (data) {
                    post.upvotes += 1;
                });
        };
        
        // get a single post
        o.get = function (id) {
            return $http.get('/posts/' + id)
                .then(function (res) {  // using a promise here instead of .success - why?
                    return res.data;
                });
        };
        
        // add a comment to a post
        o.addComment = function (id, comment) {
            return $http.post('/posts/' + id + '/comments', comment, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            });
        };
        
        // upvote a post's comment
        o.upvoteComment = function (post, comment) {
            return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            })
                .success(function (data) {
                    comment.upvotes += 1;
                });
        };
    
        return o;
    }]);
    
    
    // user auth factory
    // injecting $window to interface with localStorage, where we'll store
    //   our JWT token.
    app.factory('auth', ['$http', '$window', function ($http, $window) {
        var auth = {};
        
        // save token to local storage
        auth.saveToken = function (token) {
            $window.localStorage['flapper-news-token'] = token;
        };
        
        // retrieve token from local storage
        auth.getToken = function () {
            return $window.localStorage['flapper-news-token'];
        };
        
        // Check if user is logged in and if token has expired.
        // The payload is the middle part of the token between the two '.'s.
        // Returns a boolean.
        auth.isLoggedIn = function () {
            var payload,
                token = auth.getToken();
            
            if (token) {
                payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.exp > Date.now() / 1000;  // true if exp > now
            } else {
                return false;
            }
        };
        
        // retrieve username of authenticated user
        auth.currentUser = function () {
            if (auth.isLoggedIn()) {
                var token = auth.getToken(),
                    payload = JSON.parse($window.atob(token.split('.')[1]));
                
                return payload.username;
            }
        };
        
        // POST /register - Register new user and store the returned token.
        auth.register = function (user) {
            return $http.post('/register', user)
                .success(function (data) {
                    auth.saveToken(data.token);
                });
        };
        
        // POST /login - Log in user and store the returned token.
        auth.logIn = function (user) {
            return $http.post('/login', user)
                .success(function (data) {
                    auth.saveToken(data.token);
                });
        };
        
        // Logout function just removes user token from localStorage
        auth.logOut = function () {
            $window.localStorage.removeItem('flapper-news-token');
        };
        
        
        return auth;
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
    
    app.controller('AuthCtrl', [
        '$scope', '$state', 'auth',
        function ($scope, $state, auth) {
            
            // init user object for our templates forms
            $scope.user = {};
            
            // new user registration method
            $scope.register = function () {
                auth.register($scope.user)
                
                    .error(function (error) {
                        $scope.error = error;
                    })
                
                    .then(function () {
                        $state.go('home');
                    });
            };
            
            // existing user login method
            $scope.logIn = function () {
                auth.logIn($scope.user)
                
                    .error(function (error) {
                        $scope.error = error;
                    })

                    .then(function () {
                        $state.go('home');
                    });
            };
            
        }]);
    
    app.controller('NavCtrl', ['$scope', 'auth', function ($scope, auth) {
        
        // expose the following methods from our 'auth' factory:        
        $scope.isLoggedIn  = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut      = auth.logOut;
        
    }]);
    
})();