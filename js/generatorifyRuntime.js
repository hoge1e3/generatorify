//define([],function () {
(function () {
    function F(f) {
        var src=f+"";
        var argsp=/^function\s*\(([^\)]+)\)/;
        var args=argsp.exec(src)[1].replace(/\s/g,"").split(",");
        var bodyp=/\/\*---((\n|\r|.)*)---\*\//;
        try {
            return Function.apply(null, args.concat([ bodyp.exec(src)[1] ]));
        } catch (e) {
            return f;
        }
    }
    generatorifyRuntime={
        isGenerator: function isGenerator(v) {
            return v &&
                ((typeof Symbol==="function" && v[Symbol.toStringTag]==="Generator") ||
                    (this.GeneratorFunction &&
                    this.GeneratorFunction.prototype.isPrototypeOf(v))
                );
        },
        init: function () {
            try {
                f=new Function("this.GeneratorFunction = ((function*(){})()).constructor;");
                f.call(this);
                this.supportsGenerator=true;
            } catch(e) {
                this.supportsGenerator=false;
            }
        },
        toGen: F(function (v) {
            /*---
            if (this.isGenerator(v)) {
                return v;
            }
            return (function*(){return v;})();
            ---*/
        }),
        toVal: F(function (gen) {
            /*---
            var n=gen.next();
            if (n.done) return n.value;
            return (function*() {
                while(true) {
                    yield n.value;
                    n=gen.next();
                    if (n.done) return n.value;
                }
            })();
            ---*/
        })
    };
    generatorifyRuntime.init();
    return generatorifyRuntime;
})();
