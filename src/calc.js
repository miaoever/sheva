var parser = require("sheva")()

function calc() {
	
	var And = parser.And.bind(parser)
	var Or = parser.Or.bind(parser)
	var MoreThan = parser.MoreThan.bind(parser)
	var Optional = parser.Optional.bind(parser)
	var Is = parser.Is.bind(parser)
	var Digit = parser.Digit.bind(parser)
	var $ = parser.$.bind(parser)
	
	parser.token({
		"DOT": Is("."),
		"LBRACKET": Is("("),
		"RBRACKET": Is(")"),
		"PLUS": Is("+"),
		"MINUS": Is("-"),
		"MUL": Is("*"),
		"DIV": Is("/"),
		"DOT": Is("."),
		"SIGN": Or(Is("-"), Is("+")),
		"DIGITS": MoreThan(0, Digit),
		//"NUMBER": And(Optional($('SIGN')), $('DIGITS'), Optional(And($('DOT'), $('DIGITS'))))
		"NUMBER": (function () {	
			var digits = MoreThan(0, Digit)
			var sign = Or(Is("-"), Is("+"))
			var dot = Is(".")
			return And(Optional(sign), digits, Optional(And(dot, digits)))
		})(),
	})
	
	console.log(parser.lex("-6.8934"));
}

calc()
