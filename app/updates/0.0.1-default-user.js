'use strict';

var keystone = require('keystone');
var User = keystone.list('User');

module.exports = function (done) {
	new User.model({
		name: {
			first: 'Default',
			last: 'User'
		},
		email: 'default@d-pac.be',
		password: 'changeme',
		isAdmin: true
	})
	.save(done);
};
