'use strict';

var requirePromise = require('./requirePromise');

requirePromise();

var AggregateError = require('es-aggregate-error/polyfill')();
var PromiseResolve = require('es-abstract/2019/PromiseResolve');
var Type = require('es-abstract/2019/Type');
var callBound = require('es-abstract/helpers/callBound');
var iterate = require('iterate-value');
var map = require('array.prototype.map');

var all = callBound('Promise.all');
var reject = callBound('Promise.reject');

var identity = function (x) {
	return x;
};

module.exports = function any(iterable) {
	var C = this;
	if (Type(C) !== 'Object') {
		throw new TypeError('`this` value must be an object');
	}
	var thrower = function (value) {
		return reject(C, value);
	};
	return all(C, map(iterate(iterable), function (item) {
		var itemPromise = PromiseResolve(C, item);
		try {
			return itemPromise.then(thrower, identity);
		} catch (e) {
			return e;
		}
	})).then(
		function (errors) {
			throw new AggregateError(errors, 'Every promise rejected');
		},
		identity
	);
};
