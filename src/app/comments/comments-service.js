angular.module('mallConsoleApp')
    .factory('commentsService', ['$http', 'utils', function ($http, utils) {
        var path = 'assets/comments.json';
        var comments = $http.get(path).then(function (resp) {
            return resp.data.data;
        });

        var factory = {};
        factory.all = function () {
            return comments;
        };
        factory.get = function (id) {
            return contacts.then(function () {
                return utils.findById(contacts, id);
            })
        };
        return factory;
    }]);
