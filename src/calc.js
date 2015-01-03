var parser = require("sheva")()

function calc() {
	var And = parser.And
	var Or = parser.Or
	var MoreThan = parser.MoreThan
	var Optional = parser.Optional
	var Is = parser.Is
	var Digit = parser.Digit
	
	parser.token({
		"NUMBER": function () {	
			var digits = MoreThan(0, Digit)
			var sign = Or(Is("-"), Is("+"))
			var dot = Is(".")
			return And(Optional(sign), digits, Optional(And(dot, digits)))
		},
		"DOT": Is("."),
		"LBRACKET": Is("("),
		"RBRACKET": Is(")"),
		"PLUS": ("+"),
		"MINUS": Is("-"),
		"MUL": Is("*"),
		"DIV": Is("/")
	})
	
	parser.lex("6.823");
}

calc()


//var dot = Is(".")
//var digits = MoreThan(0, digit)
//var sign = Or(Is("-"), Is("+"))
//
//var LBracket = Is("(")
//var RBracket = Is(")")
//var plus = Is("+")
//var minus = Is("-")
//
//var number = And(Optional(sign), digits, Optional(And(dot, digits)))
//
//console.log(number("-89.23211"))

//parser.add.Terminal.number = Add
//parser.add.Nonterminal.exp = ...

//parser.terminals.Number()