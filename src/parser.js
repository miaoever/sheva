var Token = function(status, type, value, offset) {
	return {status:status, type:type, value:value, offset:offset}
}

var Or = function () {
	var parsers = arguments
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

var And = function () {
	var parsers = arguments
	return function (value) {
		var val = "", offset = 0, type = "", children = []
		
		if (value.length === 0) return {status:false, type:"",value:"", offset:0}

		for (var i = 0; i < parsers.length; i++) {
			var parser = parsers[i]
			var ok = parser(value.slice(offset))
			
			if (ok.status != true) return {status:false, type:"",value:"", offset:0}
					
			val += ok.value
			offset += ok.offset
			type = ok.type
		}
		return {status:true, type:type, value:val, offset:offset}
	}
}

var Optional = function () {
	var parsers = arguments
	return function (value) {
    var val = "", offset = 0, type = ""

		for (var i = 0; i < parsers.length; i++) {
			var parser = parsers[i]
			var ok = parser(value.slice(offset))
		
			if (ok.status != true) continue
					
			val += ok.value
			offset += ok.offset
			type = ok.type
		}

		return {status:true, type:type, value:val, offset:offset}
	}
}

var Is = function (expect) {
	return function (value) {
		return value.slice(0, expect.length) === expect
		? {status:true, type:"literal", value:expect, offset:expect.length} 
		: {status:false, type:"",value:"", offset:0}
	}
}

//MoreThan(times, parser)
var MoreThan = function (times, parser) {
	return function (value) {
		var val = "", offset = 0, type = ""
		
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
				type = ok.type
			}
		}

		return {status:true, type:type, value:val, offset:offset}
	}
}

var digit = function (str) {
	if (str.charCodeAt(0) >='0'.charCodeAt(0) && str.charCodeAt(0) <= "9".charCodeAt(0)) {
		return {status:true, type:"digit", value:str, offset:1}
	} else {
		return {status:false, type:"",value:"", offset:0}
	}
}

var dot = Is(".")
var digits = MoreThan(0, digit)
var sign = Or(Is("-"), Is("+"))

var LBracket = Is("(")
var RBracket = Is(")")
var plus = Is("+")
var minus = Is("-")

var number = And(Optional(sign), digits, Optional(And(dot, digits)))
var exp = And()

console.log(number("666.23211"))


