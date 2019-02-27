//define([],function () {
(function () {
    function G(g) {
        //o[SYMBOL_G]=true;
        this.gen=g;
        //return o;
    }
    generatorifyRuntime={
        yieldable: function (gf) {
            return new G(gf());
        },
        yield: function (val) {
            return new G((function*() {
                yield val;
            })());
        },
        toGen: function (v) {
            if (v instanceof G) {
                return v.gen;
            }
            return (function*(){return v;})();
        },
        gToVal: function (genF,thiz) {
            return this.toVal(genF.call(thiz));
        },
        toVal: function (gen) {
            var n=gen.next();
            if (n.done) return n.value;
            return new G((function*() {
                while(true) {
                    yield n.value;
                    n=gen.next();
                    if (n.done) return n.value;
                }
            })());
        }
    };
    //generatorifyRuntime.init();
    return generatorifyRuntime;
})();
