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
    var Context=function () {
        this.WrappedGenerator=function(gen){this.gen=gen;};
    };
    var p=Context.prototype;
    p.wrapFunction=function (f) {
        //f:GeneratorFunction
        var t=this;
        return (function () {
            var res=f.apply(this,arguments);
            return t.wrapGenerator(res);
        });
    };
    p.isWrappedGenerator=function (v) {
        return (v instanceof this.WrappedGenerator);
    };
    p.wrapGenerator=function (v) {
        // v:Generator
        return new this.WrappedGenerator(v);
    };
    p.call=F(function (v) {
        if (this.isWrappedGenerator(v)) return v.gen;
        if (v instanceof WrappedPromise) {
            var res,err,iserr;
            v.nativePromise.then(function (r) {
                res=r;
            },function (e) {
                err=e;
                iserr=true;
            });
            return (function*(){
                yield v;
                if (iserr) throw err;
                return res;
            })();
        }
        return (function*(){return v;})();
    });
    var WrappedPromise=function (succ,err) {
        this.nativePromise=new Promise(succ,err);
    };
    generatorifyRuntime={
        Context:Context,
        promise: function (succ,err) {
            return new WrappedPromise(succ,err);
        }
    };
    return generatorifyRuntime;
})();
