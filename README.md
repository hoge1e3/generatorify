# generatorify

Convert JS code into 'waitable' using generator 

[Demo](https://cdn.rawgit.com/hoge1e3/generatorify/c3f44d0e/index.html)

## Before generatified
~~~JS
var result=document.querySelector("#result");
function doit(x) {
    for(var i=1;i<=x;i++) {
        result.innerHTML+=i+", ";
        console.log(i);
        sleep(1000);
    }
}
doit(3);
doit(5);
~~~

## After generatified

~~~JS
(function* (_){
var result=(yield* _(document.querySelector("#result")));
function* doit(x) {
    for(var i=1;i<=x;i++) {
        result.innerHTML+=i+", ";
        (yield* _(console.log(i)));
        (yield* _(sleep(1000)));
    }
}
(yield* _(doit(3)));
(yield* _(doit(5)));
})(generatorifyRuntime.toGen.bind(generatorifyRuntime))
~~~
