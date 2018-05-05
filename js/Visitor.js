define(["Klass"],function (Klass){
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
				var v=$.types[type];
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
		var C=VisitorClass.inherit({
			types:types
			/*$:function () {
				C.super(this,"$");
			}*/
		});
		return new C;
	};
	Visitor.define=function (p) {
		return VisitorClass.inherit(p);
	};
	Visitor.class=VisitorClass;
	return Visitor;
});
