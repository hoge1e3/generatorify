//define([],function () {
(function () {
    var SYMBOL_G="SYMBOL_G";
    function G(o) {
        o[SYMBOL_G]=true;
        return o;
    }
    generatorifyRuntime={
        yieldable: function (gf) {
            return G(gf);
        },
        isGenerator: function isGenerator(v) {
            return v && v[SYMBOL_G];
        },
        toGen: F(function (v) {
            if (this.isGenerator(v)) {
                return v;
            }
            return (function*(){return v;})();
        }),
        gToVal: function (genF,thiz) {
            return this.toVal(genF.call(thiz));
        },
        toVal: function (gen) {
            var n=gen.next();
            if (n.done) return n.value;
            return G((function*() {
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
