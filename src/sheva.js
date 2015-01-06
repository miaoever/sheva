var sheva = function () {
	this.tokens = {}
	this.grammars = {}
}

sheva.prototype.Or = function () {
	//var parsers = arguments
	var self = this
	var parsers = Array.prototype.slice.call(arguments, 0, arguments.length);
	return function (value, type){
		for (var i = 0; i < parsers.length; i++) {
			var parser = parsers[i]
			
			//parser should be a function
			if (typeof parser != "function") break
			var ok = parser(value, type)
			if (ok.status === true) return ok
		}
		return {status:false, type:"",value:"", offset:0}
	}
}

sheva.prototype.And = function () {
	//var parsers = arguments
	var parsers = Array.prototype.slice.call(arguments, 0, arguments.length);
	var self = this

	return function (value, type) {
		var val = "", offset = 0, children = []
	
    	if (value.length === 0) return {status:false, type:"",value:"", offset:0}

		for (var i = 0; i < parsers.length; i++) {
			var parser = parsers[i]
			var ok = parser(value.slice(offset), type)
			
			if (ok.status != true) return {status:false, type:"",value:"", offset:0}

			if (ok.offset != 0 && !(type in self.tokens)) children.push(ok)

			val += ok.value
			offset += ok.offset
		}

		var res = {status:true, type:type, value:val, offset:offset}

		if (!(type in self.tokens)) res.children = children

		return res
	}
}

sheva.prototype.Optional = function (parser) {
	//var parsers = arguments
	var self = this

	return function (value, type) {
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
        var ok = {}, res = {}
        if (value.length != 0) {
		    ok = parser(value, type)
        } 		
            
        res = {status:true, type:ok.type || "", value:ok.value || "", offset:ok.offset || 0}
        
		if (!(type in self.tokens)) res.children = ok.children
		return res
	}
}

sheva.prototype.Is = function (expect) {
	var self = this
	//console.log(self);
	return function (value, type) {
		//console.log("###", value, expect, type);
		if (type in self.tokens) {
			return value.slice(0, expect.length) === expect
				? {status:true, type:type, value:expect, offset:expect.length} 
				: {status:false, type:"",value:"", offset:0}
		} else {
			//console.log("###", value, expect, type);

			return value[0].type === expect
				? {status:true, type:type, value:value[0].value, offset:1} 
				: {status:false, type:"",value:"", offset:0}
		}
	}
}

//MoreThan(times, parser)
sheva.prototype.MoreThan = function (times, parser) {
	var self = this
	return function (value, type) {
		var val = "", offset = 0
		
		if (value.length === 0) return {status:false, type:"",value:"", offset:0}
		
		for (var i = 0; i < value.length; i++) {
			var ok = parser.call(self, value[i], type)
			
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
		return {status:true, type:"DIGIT", value:str, offset:1}
	} else {
		return {status:false, type:"",value:"", offset:0}
	}
}

sheva.prototype.token = function(tokens) {
	var self = this

	for (var item in tokens) { 
		if (typeof tokens[item] === "function") {
			var action = (function(type){
				var fn = (tokens[type]).bind(self)
				
				return function() {
					var argvs =  Array.prototype.slice.call(arguments)
					//append the token type to the parser
					argvs.push(type)
					return fn.apply(self, argvs)
				}
			})(item)
			self.tokens[item] = action
		}
	}
}

sheva.prototype.IsToken = function (token) {
	return (token in this.tokens)
}

sheva.prototype.$ = function (type) {
	var self = this
	return function () {
		var fn = self.tokens[type] || self.grammars[type]
		
		if (typeof fn != "function") return new Error("Unknow item: " + type)
		
		return fn.apply(self, arguments)
	}
}

sheva.prototype.grammar = function(rules) {
	var self = this

	for (var item in rules) { 
		if (typeof rules[item] === "function") {
			var action = (function(type){
				var fn = (rules[type]).bind(self)
				
				return function() {
					var argvs =  Array.prototype.slice.call(arguments)
					//append the token type to the parser
					argvs.push(type)
					return fn.apply(self, argvs)
				}
			})(item)
			self.grammars[item] = action
		}
	}
}

sheva.prototype.lex = function(str) {
	var val = "", offset = 0, res = [], success = false
	
	while (offset < str.length) {
		success = false
		for (var item in this.tokens) {
			//console.log(item);
			var lexer = this.tokens[item]
			var token = lexer(str.slice(offset))
			if (token.status) {
				res.push(token)
				success = true
				offset += token.offset
				break
			}
		}
		if (!success) {
			return new Error("Error when parse " + str.substr(offset))
		}
	}
	return res
}

sheva.prototype.ast = function (tokens) {
	var val = "", offset = 0, res = [], success = false

	while (offset < tokens.length) {
		for (var rule in this.grammars) {
			//console.log(rule);
			var parser = this.grammars[rule]
			var ok = parser(tokens.slice(offset))
            //console.log("@@@@", ok);

			if (ok.status) {
				//console.log("@@@",ok);
				res.push(ok)
				success = true
				offset += ok.offset
				break
			}
		}
		if (!success) {
			return new Error("Error when parse.")
		}
	}
		
	return res
} 
sheva.prototype.parse = function(str) {
	var tokens = this.lex(str)
	var ast = this.ast(tokens)
}

module.exports = function () {
	return new sheva()
}
