var parser = require("sheva")()

var calc = function () {
	var And = parser.And.bind(parser)
	var Or = parser.Or.bind(parser)
	var MoreThan = parser.MoreThan.bind(parser)
	var Optional = parser.Optional.bind(parser)
	var Is = parser.Is.bind(parser)
	var Digit = parser.Digit.bind(parser)
	var $ = parser.$.bind(parser)
	
	parser.token({
		"LB": Is("("),
		"RB": Is(")"),
		"PLUS": Is("+"),
		"MINUS": Is("-"),
		"MUL": Is("*"),
		"DIV": Is("/"),
		"NUM": (function () {	
			var digits = MoreThan(0, Digit)
			var sign = Or(Is("-"), Is("+"))
			var dot = Is(".")
			return And(Optional(sign), digits, Optional(And(dot, digits)))
		})(),
	})
	
	parser.grammar({
		"Expr": And($("Term"), Optional($("TermOp"))),
		"Term": And($("Factor"), Optional($("FactorOp"))),
		"TermOp": Or(Is("PLUS"), Is("MINUS")),
		"Factor": Or(And(Is("LB"), $("Expr"), Is("RB")), Is("NUM")),
		"FactorOp": Or(Is("MUL"), Is("DIV")),

	})

    //console.log(parser.ast(parser.lex("888+99-123")))
	console.log(parser.ast(parser.lex("123+1")));
}

calc()
