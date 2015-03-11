'use strict';

var routes = require('./routes');

(function(library) {
	
	library.init = function(params, callback) {
		require('./websockets');
		require('./hooks');
		routes.init(params, callback);
	};

	library.modifyTemplateConfig = function(config, callback) {
		if (!config || !config.custom_mapping) {
			return callback(null, config);
		}
		
		config.custom_mapping['^user/.*/friends'] = 'friends';
		
		callback(null, config);
	};

}(module.exports));

