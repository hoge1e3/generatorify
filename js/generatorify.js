define(["esprima","Visitor"], function (es,Visitor) {
    var V=Visitor.define({
        $this:"v",
        types:{
            FunctionDeclaration: function (node) {
                var v=this;
                v.visitSub(node);
                node.subnodes[0].src=node.subnodes[0].src.replace(/function/,"function*");
                node.src=v.concat(node);
            },
            FunctionExpression: function (node) {
                var v=this;
                v.visitSub(node);
                node.subnodes[0].src=node.subnodes[0].src.replace(/function/,"function*");
                node.src=v.concat(node);
            },
            CallExpression: function (node) {
                var v=this;
                v.visitSub(node);
                node.subnodes.unshift({src:"(yield* "+v.alias_toGen+"("});
                node.subnodes.push({src:"))"});
                node.src=v.concat(node);
            }
        },
        concat: function (v,node) {
            if (node.subnodes) {
                return node.subnodes.map(function (sn) {
                    return v.concat(sn);
                }).join("");
            } else {
                return node.src;
            }
        },
        def: function (v,node) {
            //console.log(node.type,node);
            v.visitSub(node);
        },
        visitSub: function (v,node) {
            if (node.subnodes) {
                node.subnodes.forEach(v.$bind.visit);
            }
        }
    });
    var IdentV=Visitor.define({
        $this:"v",
        types:{
            Identifier: function (n) {
                this.names[n.name]=1;
            }
        },
        $:function (v){
            Visitor.class.call(v);
            v.names={};
        },
        def: function (v,node) {
            v.visitSub(node);
        },
        visitSub: function (v,node) {
            if (node.subnodes) {
                node.subnodes.forEach(v.$bind.visit);
            }
        }
    });
    function addSrc(src,node) {
        var r=node.range;
        var subnodes=[];
        node.src=src.substring(r[0],r[1]);
        trace(node);
        subnodes=subnodes.sort(function (a,b) {
            return a.range[0]-b.range[0];
        });
        var e=node.range[1];
        for (var i=subnodes.length-1;i>=-1;i--) {
            var b=(i<0 ? node.range[0] : subnodes[i].range[1]);
            if (b<e) {
                subnodes.splice(i+1,0,{type:"PlainText",src:src.substring(b,e),range:[b,e]});
            }
            if (i<0) break;
            e=subnodes[i].range[0];
        }
        node.subnodes=subnodes;

        function trace(obj) {
            for (var k in obj) {
                var e=obj[k];
                if (e && e.type && e.range) {
                    subnodes.push(e);
                    addSrc(src,e);
                } else if (typeof e==="object") {
                    trace(e);
                }
            }
        }
    }
    var acand="_$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    function getAliasName(defined) {
        var radix=acand.length;
        for (var i=0;;i++) {
            var n="";
            var itmp=i;
            while(true) {
                n=acand[itmp%radix]+n;
                itmp-=itmp%radix;
                itmp/=radix;
                if (itmp<=0) break;
            }
            if (!defined[n]) return n;
        }
    }
    generatorify={
        convert: function (src) {
            var node=es.parse(src,{ range: true });
            addSrc(src,node);
            //console.log(node);
            var id=new IdentV;
            id.visit(node);
            //console.log(id.names);
            var v=new V;
            v.alias_toGen=getAliasName(id.names,"");
            v.src=src;
            v.visit(node);
            var conv=("(function* ("+v.alias_toGen+"){\n"+ v.concat(node)+
            "\n})(generatorifyRuntime.toGen.bind(generatorifyRuntime))");
           //    console.log(JSON.stringify(syntax, null, 4));
            return conv;
        }
    };
    return generatorify;
});
