Sheva
=====

Sheva is a Parser combinator library in JS.

### Example ###

* Calculator

```javascript
var parser = require("sheva")()

(function () {
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
		})()
	})

	parser.grammar({
        "Expr": And($("Term"), Optional(MoreThan(0, $("MoreExpr")))),
        "MoreExpr": And($("TermOp"), $("Term")),
		"Term": And($("Factor"), Optional(MoreThan(0, $("MoreTerm")))),
        "MoreTerm": And($("FactorOp"), $("Factor")),
		"TermOp": Or(Is("PLUS"), Is("MINUS")),
		"Factor": Or($("P-Expr"), Is("NUM")),
        "P-Expr": And(Is("LB"), $("Expr"), Is("RB")),
		"FactorOp": Or(Is("MUL"), Is("DIV"))
	})

    parser.action({
        "NUM": function(n) { n.extra = parseFloat(n.value) },
        "Factor": function(n) { n.extra = n.children[0].extra },
        "MoreTerm": function (n) { n.extra = n.children[1].extra },
        "MoreExpr": function (n) { n.extra = n.children[1].extra },
        "P-Expr": function(n) { n.extra = n.children[1].extra },
        "Term": function(n) {
            n.extra = n.children[0].extra
            var child = n.children[1]
            for (var i = 0; child && i < child.children.length; i+=2) {
                var FactorOp = child.children[i]
                var Factor = child.children[i+1]
                
                switch (FactorOp.value) {
                   case "*": n.extra *= Factor.extra;break;
                   case "/": n.extra /= Factor.extra;break;
                }
            }
        },
        "Expr": function(n) {
            n.extra = n.children[0].extra
            var child = n.children[1]
            for (var i = 0; child && i < child.children.length; i+=2) {
                var TermOp = child.children[i]
                var Term = child.children[i+1]
                switch (TermOp.value) {
                  case "+": n.extra += Term.extra;break;
                  case "-": n.extra -= Term.extra;break;
                }
            }
        },
    })
   
    console.log(parser.parse("7+234*(3+1)"))
})()

```
### Author ###
@miaoever
### License ###

MIT
