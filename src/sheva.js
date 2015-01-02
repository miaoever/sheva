var sheva = function () {
	this.tokens = {}
}

sheva.prototype.Or = function () {
	//var parsers = arguments
	var parsers = Array.prototype.slice.call(arguments, 0, arguments.length);
//	var type = "", parsers
//	
//	if (typeof arguments[arguments.length - 1] === "string") {
//		type = arguments[arguments.length - 1]
//		parsers = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
//	} else {
//		parsers = Array.prototype.slice.call(arguments, 0, arguments.length);
//
//	}
	
	return function (value){
		for (var i = 0; i < parsers.length; i++) {
			var parser = parsers[i]
			
			//parser should be a function
			if (typeof parser != "function") break

			var ok = parser(value)
			if (ok.status === true) return ok
		}
		return {status:false, type:"",value:"", offset:0}
	}
}

sheva.prototype.And = function () {
	//var parsers = arguments
	var parsers = Array.prototype.slice.call(arguments, 0, arguments.length);
	//var type = arguments[arguments.length - 1]
	
	return function (value) {
		var val = "", offset = 0, children = []
		
		if (value.length === 0) return {status:false, type:"",value:"", offset:0}

		for (var i = 0; i < parsers.length; i++) {
			var parser = parsers[i]
			var ok = parser(value.slice(offset))
			
			if (ok.status != true) return {status:false, type:"",value:"", offset:0}
					
			if (ok.offset != 0) children.push(ok)
			val += ok.value
			offset += ok.offset
		}
		return {status:true, type:type, value:val, offset:offset, children:children}
	}
}

sheva.prototype.Optional = function (parser) {
	//var parsers = arguments
	return function (value) {
//    var val = "", offset = 0, type = ""

//		for (var i = 0; i < parsers.length; i++) {
//			var parser = parsers[i]
//			var ok = parser(value.slice(offset))
//		
//			if (ok.status != true) continue
//					
//			val += ok.value
//			offset += ok.offset
//			type = ok.type
//		}

		var ok = parser(value)
		return {status:true, type:ok.type, value:ok.value, offset:ok.offset, children: ok.children || []}
	}
}

sheva.prototype.Is = function (expect) {
	var type = arguments[arguments - 1]

	return function (value) {
		if (typeof expect === "string") {
			return value.slice(0, expect.length) === expect
				? {status:true, type:type, value:expect, offset:expect.length} 
				: {status:false, type:"",value:"", offset:0}
		} else {
			return value[0].type === expect.type
				? {status:true, type:type, value:expect.value, offset:1} 
				: {status:false, type:"",value:"", offset:0}
		}
	}
}

//MoreThan(times, parser)
sheva.prototype.MoreThan = function (times, parser) {
	var type = arguments[arguments - 1]

	return function (value) {
		var val = "", offset = 0
		
		if (value.length === 0) return {status:false, type:"",value:"", offset:0}
		
		for (var i = 0; i < value.length; i++) {
			var ok = parser(value[i])
			
			if (ok.status != true) {
				if (i <= times) {
					return {status:false, type:"",value:"", offset:0}
				} else {
					break
				}
			} else {
				val += ok.value
				offset += ok.offset
			}
		}

		return {status:true, type:type, value:val, offset:offset}
	}
}

sheva.prototype.Digit = function (str) {
	if (str.charCodeAt(0) >='0'.charCodeAt(0) && str.charCodeAt(0) <= "9".charCodeAt(0)) {
		return {status:true, type:"digit", value:str, offset:1}
	} else {
		return {status:false, type:"",value:"", offset:0}
	}
}

sheva.prototype.token = function(tokens) {
	var self = this
	for (var item in tokens) { 
		if (typeof tokens[item] === "function") {
			self.tokens[item] = (function(type){
				return function () {
					var argvs =  Array.prototype.slice.call(arguments);
					argvs.push(type)
					tokens[type].apply(self, argvs)
				}
			})(item)
		}
	}
}

sheva.prototype.$ = function () {
}

sheva.prototype.grammar = function() {
}

sheva.prototype.lex = function(str) {
	var val = "", offset = 0
	
	for (lexer in this.tokens) {
		var token = lexers(str.slice(offset))
	}
}

sheva.prototype.parse = function(str) {
	
}

module.exports = function () {
	return new sheva()
}
