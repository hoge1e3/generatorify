define(["Klass"],function (Klass){
	var TYPES_NAME="types";
	var TYPES_PREFIX=TYPES_NAME+"_";
	VisitorClass = Klass.define({
		$this: "$",
		$: function ($) {
			$.path=[];
		},
		getType: function (node) {
			return node && node.type;
		},
		visit: function ($,node) {
			try {
				$.path.push(node);
				var type=$.getType(node);
				if ($.debug) console.log("visit ",type, node.pos);
				var v=$[TYPES_PREFIX+type];
				if (v) return v.call($, node);
				else if ($.def) return $.def.call($,node);
			} finally {
				$.path.pop();
			}
		},
		replace:function ($,node) {
			if (!$.def) {
				$.def=function (node) {
					if (typeof node=="object"){
						for (var i in node) {
							if (node[i] && typeof node[i]=="object") {
								node[i]=$.visit(node[i]);
							}
						}
					}
					return node;
				};
			}
			return $.visit(node);
		}
	});
	Visitor=function (types) {
		var p={};
		p[TYPES_NAME]=types;
		var C=Visitor.define(p);
		return new C;
	};
	Visitor.define=function (p) {
		return VisitorClass.inherit(expandTypes(p));
	};
	function expandTypes(prot) {
		var types=prot[TYPES_NAME];
		delete prot[TYPES_NAME];
		for (var k in types) {
			prot[TYPES_PREFIX+k]=types[k];
		}
		return prot;
	}
	Visitor.class=VisitorClass;
	return Visitor;
});
