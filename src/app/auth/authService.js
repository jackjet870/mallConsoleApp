﻿(function(app){
  'use strict';
  app.factory('authService',
    ['$http', '$q', '$sessionStorage', 'ngAuthSettings',
      function ($http, $q, $sessionStorage, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var authServiceFactory = {};

        var _authentication = {
          isAuth: false,
          userName: "",
          useRefreshTokens: false
        };

        var _saveRegistration = function (registration) {

          _logOut();

          return $http.post(serviceBase + 'api/account/register', registration).then(function (response) {
            return response;
          });

        };

        var _login = function (loginData) {

          var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

          if (loginData.useRefreshTokens) {
            data = data + "&client_id=" + ngAuthSettings.clientId;
          }

          var deferred = $q.defer();
          var response = {access_token:'23234241-1123-23'};
          $sessionStorage.authorizationData = {
            token: response.access_token,
            userName: loginData.userName,
            refreshToken: "",
            useRefreshTokens: false
          };

          _authentication.isAuth = true;
          _authentication.userName = loginData.userName;
          _authentication.useRefreshTokens = loginData.useRefreshTokens;
          deferred.resolve(response);
          return deferred.promise;
          //console.log(data);
          //实际代码
          //$http.post(serviceBase + 'token', data, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
          //    .success(function (response) {
          //        if (loginData.useRefreshTokens) {
          //            $sessionStorage.authorizationData= {
          //                token: response.access_token,
          //                userName: loginData.userName,
          //                refreshToken: response.refresh_token,
          //                useRefreshTokens: true
          //            }
          //        }
          //        else {
          //            $sessionStorage.authorizationData= {
          //                token: response.access_token,
          //                userName: loginData.userName,
          //                refreshToken: "",
          //                useRefreshTokens: false
          //            };
          //        }
          //        _authentication.isAuth = true;
          //        _authentication.userName = loginData.userName;
          //        _authentication.useRefreshTokens = loginData.useRefreshTokens;
          //
          //        deferred.resolve(response);
          //
          //    }).error(function (err, status) {
          //        _logOut();
          //        deferred.reject(err);
          //    });
          //
          //return deferred.promise;

        };
        var _changePassword = function (userName, oldpass, newpass) {

          console.log('arguments', arguments)
          var data = {
            'UserName': userName,
            'OldPassword': oldpass,
            'Password': newpass,
            'ConfirmPassword': newpass
          };
          return $http.post(serviceBase + 'api/account/ChangePassword', data).then(function (response) {
            return response;
          }, function (ex) {
            alert('有错误发生!' + ex);
            console.log('error', ex);
            return ex;
          })

        }
        var _logOut = function () {

          delete $sessionStorage['authorizationData'];
          console.log('you call logout!')
          _authentication.isAuth = false;
          _authentication.userName = "";
          _authentication.useRefreshTokens = false;

        };

        var _fillAuthData = function () {

          var authData = $sessionStorage['authorizationData'];
          if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
            _authentication.useRefreshTokens = authData.useRefreshTokens;
          }

        };

        var _refreshToken = function () {
          var deferred = $q.defer();

          var authData = $sessionStorage['authorizationData'];

          if (authData) {

            if (authData.useRefreshTokens) {

              var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken + "&client_id=" + ngAuthSettings.clientId;

              delete $sessionStorage['authorizationData'];

              $http.post(serviceBase + 'token', data, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (response) {

                $sessionStorage['authorizationData'] = {
                  token: response.access_token,
                  userName: response.userName,
                  refreshToken: response.refresh_token,
                  useRefreshTokens: true
                };
                deferred.resolve(response);

              }).error(function (err, status) {
                _logOut();
                deferred.reject(err);
              });
            }
          }

          return deferred.promise;
        };

        authServiceFactory.saveRegistration = _saveRegistration;
        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.changePassword = _changePassword;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        authServiceFactory.refreshToken = _refreshToken;

        return authServiceFactory;
      }]);


//本地验证 $cookieStore

//'use strict';

//angular.module('AngularAuthApp')
//  .factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, $q) {
//      var currentUser = {};
//      if ($cookieStore.get('token')) {
//          currentUser = User.get();
//      }

//      return {

//          /**
//           * Authenticate user and save token
//           *
//           * @param  {Object}   user     - login info
//           * @param  {Function} callback - optional
//           * @return {Promise}
//           */
//          login: function (user, callback) {
//              var cb = callback || angular.noop;
//              var deferred = $q.defer();

//              $http.post('/auth/local', {
//                  email: user.email,
//                  password: user.password
//              }).
//              success(function (data) {
//                  $cookieStore.put('token', data.token);
//                  currentUser = User.get();
//                  deferred.resolve(data);
//                  return cb();
//              }).
//              error(function (err) {
//                  this.logout();
//                  deferred.reject(err);
//                  return cb(err);
//              }.bind(this));

//              return deferred.promise;
//          },

//          /**
//           * Delete access token and user info
//           *
//           * @param  {Function}
//           */
//          logout: function () {
//              $cookieStore.remove('token');
//              currentUser = {};
//          },

//          /**
//           * Create a new user
//           *
//           * @param  {Object}   user     - user info
//           * @param  {Function} callback - optional
//           * @return {Promise}
//           */
//          createUser: function (user, callback) {
//              var cb = callback || angular.noop;

//              return User.save(user,
//                function (data) {
//                    $cookieStore.put('token', data.token);
//                    currentUser = User.get();
//                    return cb(user);
//                },
//                function (err) {
//                    this.logout();
//                    return cb(err);
//                }.bind(this)).$promise;
//          },

//          /**
//           * Change password
//           *
//           * @param  {String}   oldPassword
//           * @param  {String}   newPassword
//           * @param  {Function} callback    - optional
//           * @return {Promise}
//           */
//          changePassword: function (oldPassword, newPassword, callback) {
//              var cb = callback || angular.noop;

//              return User.changePassword({ id: currentUser._id }, {
//                  oldPassword: oldPassword,
//                  newPassword: newPassword
//              }, function (user) {
//                  return cb(user);
//              }, function (err) {
//                  return cb(err);
//              }).$promise;
//          },

//          /**
//           * Gets all available info on authenticated user
//           *
//           * @return {Object} user
//           */
//          getCurrentUser: function () {
//              return currentUser;
//          },

//          /**
//           * Check if a user is logged in
//           *
//           * @return {Boolean}
//           */
//          isLoggedIn: function () {
//              return currentUser.hasOwnProperty('role');
//          },

//          /**
//           * Waits for currentUser to resolve before checking if user is logged in
//           */
//          isLoggedInAsync: function (cb) {
//              if (currentUser.hasOwnProperty('$promise')) {
//                  currentUser.$promise.then(function () {
//                      cb(true);
//                  }).catch(function () {
//                      cb(false);
//                  });
//              } else if (currentUser.hasOwnProperty('role')) {
//                  cb(true);
//              } else {
//                  cb(false);
//              }
//          },

//          /**
//           * Check if a user is an admin
//           *
//           * @return {Boolean}
//           */
//          isAdmin: function () {
//              return currentUser.role === 'admin';
//          },

//          /**
//           * Get auth token
//           */
//          getToken: function () {
//              return $cookieStore.get('token');
//          }
//      };
//  });

})(app || angular.module('mallConsoleApp') );
