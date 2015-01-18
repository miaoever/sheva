var parser = require("sheva")();

(function(){
	var And      = parser.And.bind(parser)
	var Until    = parser.Until.bind(parser)
	var Or       = parser.Or.bind(parser)
	var MoreThan = parser.MoreThan.bind(parser)
	var Optional = parser.Optional.bind(parser)
	var Is       = parser.Is.bind(parser)
	var Digit    = parser.Digit.bind(parser)
	var $        = parser.$.bind(parser)

  parser.token({
  //token
  });

  parser.grammar({
  //grammar
  });

  parser.action({
  //action
  });

})();
