var sheva = function () {
	this.tokens = {};
	this.grammars = {};
  this.actions = {};
}

sheva.prototype.Or = function () {
  var self = this;
  var parsers = Array.prototype.slice.call(arguments, 0, arguments.length);
  return function (value, type){
    var res = {status:false};
    var maxLength = 0;

    for (var i = 0; i < parsers.length; i++) {
      var parser = parsers[i];

      //parser should be a function
      if (typeof parser != "function") break;

      var ok = parser(value, type);
      
      if (ok.status === true && ok.offset >= maxLength) {
        maxLength = ok.offset;
        res = ok;
      }
    }
    return res;
  }
}

sheva.prototype.And = function () {
	var parsers = Array.prototype.slice.call(arguments, 0, arguments.length);
	var self = this;

	return function (value, type) {
		var val = "", offset = 0, children = [];

    if (value.length === 0) return {status:false};

		for (var i = 0; i < parsers.length; i++) {
			var parser = parsers[i];
			var ok = parser(value.slice(offset), type);

			if (ok.status != true) return {status:false};

			if (ok.offset != 0 && !(type in self.tokens)) children.push(ok);

			val += ok.value;
			offset += ok.offset;
		}

		var res = {status:true, type:type, value:val, offset:offset};

		if (!(type in self.tokens)) res.children = children;

		return res;
	}
}
//Until(Parser, EndConditionParser) - repeat the Parser until the EndConditionParser matched.
sheva.prototype.Until = function () {
  var self  = this;
	var parsers = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
  var EndConditionParser = arguments[1];

  return function (value, type) {
		var val = "", offset = 0, children = [], res = {status:false};
    
    if (value.length === 0) return {status:false};

    var tail = EndConditionParser(value.slice(offset), type)

		for (var i = 0; !tail.status && i < parsers.length; i++) {

      if (value.length === 0) return {status:false};

			var parser = parsers[i];
			var ok = parser(value.slice(offset), type);

			if (ok.status != true) return {status:false};
			
      if (ok.offset != 0 && !(type in self.tokens)) children.push(ok);
			
      val += ok.value;
			offset += ok.offset;
      
      tail = EndConditionParser(value.slice(offset), type)
    }

		if (offset != 0) {
      offset += tail.offset;
      val += tail.value;
      children.push(tail);

      res = {status:true, type:type, value:val, offset:offset};

	  	if (!(type in self.tokens)) res.children = children;
    }

		return res;
  }
}

sheva.prototype.Not = function (parser) {
  return function (value, type) {
    if (value.length === 0) return {status:false};
    var ok = parser(value, type);

    if (!ok) return {status:true, type:type, value:value.value || value,offset:0};
    
    return {status:false};
  }
}

sheva.prototype.Optional = function (parser) {
	var self = this;

  return function (value, type) {
    var ok = {}, res = {};
    if (value.length != 0) {
      ok = parser(value, type);
    }

    res = {status:true, type:ok.type || "", value:ok.value || "", offset:ok.offset || 0};

    if (!(type in self.tokens)) res.children = ok.children;
    return res;
  }
}

sheva.prototype.Is = function (expect) {
  var self = this
  return function (value, type) {
    if (type in self.tokens) {
      return value.slice(0, expect.length) === expect
        ? {status:true, type:type, value:expect, offset:expect.length}
        : {status:false};
    } else if (expect in self.tokens){
      return value[0].type === expect
        ? {status:true, type:expect, value:value[0].value, offset:1}
        : {status:false};
    } else {
      return value[0].value === expect
        ? {status:true, type:expect, value:value[0].value, offset:1}
        : {status:false};
    }
  }
}

//MoreThan(times, parser)
sheva.prototype.MoreThan = function (times, parser) {
	var self = this
	return function (value, type) {
		var val = "", offset = 0, pass = 0, children = [], resType = "";

		if (value.length === 0) return {status:false};

    while (offset < value.length) {
      var ok = parser(value.slice(offset), type);

			if (ok.status != true) {
				if (pass <= times) return {status:false};
				break;
			}

      pass ++;
      val += ok.value;
      offset += ok.offset;
      resType = ok.type;

      if (!(type in self.tokens)) {
        for (var i = 0; i < ok.children.length; i++) {
           children.push(ok.children[i]);
        }
      }
    }

    var res = {status:true, type:resType, value:val, offset:offset};

    if (!(type in self.tokens)) res.children = children;
    
    return res;
	}
}

sheva.prototype.Digit = function (str) {
	if (str[0].charCodeAt(0) >='0'.charCodeAt(0) && str[0].charCodeAt(0) <= "9".charCodeAt(0)) {
		return {status:true, type:"DIGIT", value:str[0], offset:1};
	} else {
		return {status:false};
	}
}

sheva.prototype.token = function(tokens) {
	var self = this;

	for (var item in tokens) {
		if (typeof tokens[item] === "function") {
			var action = (function(type){
				var fn = (tokens[type]).bind(self);

				return function() {
					var argvs =  Array.prototype.slice.call(arguments);
					//append the token type to the parser
					argvs.push(type);
					return fn.apply(self, argvs);
				}
			})(item);
			self.tokens[item] = action;
		}
	}
}

sheva.prototype.IsToken = function (token) {
	return (token in this.tokens);
}

sheva.prototype.$ = function (type) {
	var self = this;
	return function () {
		var fn = self.tokens[type] || self.grammars[type];

		if (typeof fn != "function") return new Error("Unknow item: " + type);
    //replace the item type
		arguments[arguments.length - 1] = type;
		return fn.apply(self, arguments);
	}
}

sheva.prototype.grammar = function(rules) {
	var self = this;

	for (var item in rules) {
		if (typeof rules[item] === "function") {
			var action = (function(type){
				var fn = (rules[type]).bind(self);

				return function() {
					var argvs =  Array.prototype.slice.call(arguments);
					//append the token type to the parser
					argvs.push(type);
					return fn.apply(self, argvs);
				}
			})(item);
			self.grammars[item] = action;
		}
	}
}

sheva.prototype.lex = function(str) {
	var val = "", offset = 0, res = [], success = false;

	while (offset < str.length) {
		success = false;
		for (var item in this.tokens) {
			//console.log(item);
			var lexer = this.tokens[item];
			var token = lexer(str.slice(offset));
			if (token.status) {
				res.push(token);
				success = true;
				offset += token.offset;
				break;
			}
		}
		if (!success) {
			return new Error("Error when parse " + str.substr(offset));
		}
	}
	return res;
}

sheva.prototype.ast = function (root, tokens) {
	var parser = this.grammars[root];
  var ok = parser(tokens);

  if (!ok.status) return new Error("Error when parse " + tokens[0].value);
  if (ok.offset < tokens.length) return new Error("Error when parse " + tokens.slice(ok.offset)[0].value);

	return ok;
}

sheva.prototype.action = function(actions) {
  var self = this;

  for (var item in actions) {
    if (typeof actions[item] === "function") {
      self.actions[item] = actions[item];
    }
  }
}

sheva.prototype.eval = function (ast) {
  var node = ast;
  var self = this;

  if (node.children) {
    for (var i = 0; i < node.children.length; i ++) {
      this.eval(node.children[i]);
    }
  }
  var eval = this.actions[ast.type] || function() {};
  eval.call(self, ast);
  return ast;
}

sheva.prototype.parse = function(root, str) {
	var tokens = this.lex(str);
	var ast = this.ast(root, tokens);
  return this.eval(ast);
}

module.exports = function () {
	return new sheva();
}
