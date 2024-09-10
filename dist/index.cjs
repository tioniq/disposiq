"use strict";var A=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var O=Object.getOwnPropertyNames;var R=Object.prototype.hasOwnProperty;var N=(o,e)=>{for(var s in e)A(o,s,{get:e[s],enumerable:!0})},U=(o,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of O(e))!R.call(o,n)&&n!==s&&A(o,n,{get:()=>e[n],enumerable:!(t=W(e,n))||t.enumerable});return o};var B=o=>U(A({},"__esModule",{value:!0}),o);var p=(o,e,s)=>new Promise((t,n)=>{var F=r=>{try{v(s.next(r))}catch(x){n(x)}},q=r=>{try{v(s.throw(r))}catch(x){n(x)}},v=r=>r.done?t(r.value):Promise.resolve(r.value).then(F,q);v((s=s.apply(o,e)).next())});var ie={};N(ie,{AbortDisposable:()=>u,AsyncDisposableAction:()=>c,BoolDisposable:()=>m,BooleanDisposable:()=>J,CompositeDisposable:()=>Q,Disposable:()=>C,DisposableAction:()=>i,DisposableContainer:()=>f,DisposableStore:()=>l,ObjectDisposedException:()=>E,SafeActionDisposable:()=>K,SafeAsyncActionDisposable:()=>j,SerialDisposable:()=>G,createDisposable:()=>S,createDisposableCompat:()=>w,disposableFromEvent:()=>T,disposableFromEventOnce:()=>I,disposeAllSafe:()=>V,emptyDisposable:()=>d,isAsyncDisposableCompat:()=>oe,isDisposable:()=>L,isDisposableCompat:()=>ee,isDisposableLike:()=>k,isSystemAsyncDisposable:()=>te,isSystemDisposable:()=>se,on:()=>X,once:()=>Y,safeDisposableExceptionHandlerManager:()=>z,toDisposable:()=>Z,toDisposableCompat:()=>$});module.exports=B(ie);"dispose"in Symbol||(Symbol.dispose=Symbol("Symbol.dispose"));"asyncDispose"in Symbol||(Symbol.asyncDispose=Symbol("Symbol.asyncDispose"));var a=Object.freeze(()=>{}),h=Object.freeze(()=>Promise.resolve());var i=class{constructor(e){this._disposed=!1;this._action=typeof e=="function"?e:a}get disposed(){return this._disposed}dispose(){this._disposed||(this._disposed=!0,this._action())}[Symbol.dispose](){this.dispose()}},c=class{constructor(e){this._disposed=!1;this._action=typeof e=="function"?e:h}get disposed(){return this._disposed}dispose(){return p(this,null,function*(){this._disposed||(this._disposed=!0,yield this._action())})}[Symbol.asyncDispose](){return this.dispose()}};var g=class{constructor(e){this.value=e,this.next=null}},b=class{constructor(){this.head=null,this.tail=null,this.length=0}enqueue(e){let s=new g(e);this.head?(this.tail.next=s,this.tail=s):(this.head=s,this.tail=s),this.length++}dequeue(){let e=this.head;return e===null?null:(this.head=e.next,this.length--,e.value)}isEmpty(){return this.length===0}getHead(){var e,s;return(s=(e=this.head)==null?void 0:e.value)!=null?s:null}getLength(){return this.length}forEach(e){let s=this.head;for(;s!==null;)e(s.value),s=s.next}toArray(){let e=[],s=this.head;for(;s!==null;)e.push(s.value),s=s.next;return e}clear(){this.head=null,this.tail=null,this.length=0}};var y=class{constructor(e){this._scrap=new b,this._size=e}get size(){return this._size}set size(e){this._size=e}get all(){return this._scrap.toArray()}lift(){return this._scrap.length>0?this._scrap.dequeue():null}throw(e){if(this._scrap.length<this._size)return this._scrap.enqueue(e),null;let s=this._scrap.dequeue();return this._scrap.enqueue(e),s}clear(){this._scrap.clear()}};var H=new y(10);function D(o){let e=o.length;if(e===0)return;let s=H.lift();s===null?s=new Array(e):s.length<e&&(s.length=e);for(let t=0;t<e;t++)s[t]=o[t];o.length=0;for(let t=0;t<e;++t){let n=s[t];n&&(typeof n=="function"?n():n.dispose())}s.fill(void 0,0,e),H.throw(s)}function P(o){for(let e=0;e<o.length;++e){let s=o[e];s&&(typeof s=="function"?s():s.dispose())}o.length=0}var l=class{constructor(){this._disposed=!1;this._disposables=new Array}get disposed(){return this._disposed}add(...e){this.addAll(e)}addAll(e){if(e.length!==0){if(this._disposed){for(let s of e)s&&(typeof s=="function"?s():s.dispose());return}for(let s=0;s<e.length;s++){let t=e[s];t&&this._disposables.push(typeof t=="function"?new i(t):t)}}}addOne(e){if(e){if(this._disposed){typeof e=="function"?e():e.dispose();return}typeof e=="function"&&(e=new i(e)),this._disposables.push(e)}}remove(e){let s=this._disposables.indexOf(e);return s===-1?!1:(this._disposables.splice(s,1),!0)}addTimeout(e,s){if(typeof e=="function"){let t=setTimeout(e,s);this.add(()=>clearTimeout(t));return}this.add(()=>clearTimeout(e))}addInterval(e,s){if(typeof e=="function"){let t=setInterval(e,s);this.add(()=>clearInterval(t));return}this.add(()=>clearInterval(e))}dispose(){this._disposed||(this._disposed=!0,P(this._disposables))}disposeCurrent(){D(this._disposables)}[Symbol.dispose](){this.dispose()}};var C=class{constructor(){this._store=new l}get disposed(){return this._store.disposed}register(e){return this._store.addOne(e),e}dispose(){this._store.dispose()}[Symbol.dispose](){this.dispose()}};var M={dispose:function(){},[Symbol.dispose]:function(){}},d=Object.freeze(M);var u=class{constructor(e){this._controller=e}get disposed(){return this._controller.signal.aborted}get signal(){return this._controller.signal}dispose(){this._controller.abort()}[Symbol.dispose](){this.dispose()}};function S(o){if(!o)return d;if(typeof o=="function")return new i(o);if(typeof o=="object"){if("dispose"in o)return o;if(Symbol.dispose in o)return new i(()=>{let e=o[Symbol.dispose];e()});if(Symbol.asyncDispose in o)return new c(()=>p(this,null,function*(){let e=o[Symbol.asyncDispose];yield e()}));if("unref"in o)return new i(()=>o.unref());if(o instanceof AbortController)return new u(o)}return d}function w(o){if(!o)return d;if(typeof o=="function")return new i(o);if(typeof o=="object"){let e="dispose"in o,s=Symbol.dispose in o;if(e&&s)return o;if(e)return new i(()=>o.dispose());if(s)return new i(()=>o[Symbol.dispose]());if(Symbol.asyncDispose in o)return new i(()=>p(this,null,function*(){o[Symbol.asyncDispose]()}));if("unref"in o)return new i(()=>o.unref());if(o instanceof AbortController)return new u(o)}return d}var f=class{constructor(e=void 0){this._disposed=!1;this._disposable=e}get disposed(){return this._disposed}get disposable(){return this._disposable}set(e){if(this._disposed){e.dispose();return}this._disposable!=null&&this._disposable.dispose(),this._disposable=e}replace(e){if(this._disposed){e.dispose();return}this._disposable=e}dispose(){this._disposed||(this._disposed=!0,this._disposable!=null&&(this._disposable.dispose(),this._disposable=void 0))}[Symbol.dispose](){this.dispose()}};var m=class{constructor(e=!1){this._disposed=!1;this._disposed=e}get disposed(){return this._disposed}dispose(){this._disposed=!0}[Symbol.dispose](){this.dispose()}};function T(o,e,s){return o.on(e,s),new i(()=>{o.off(e,s)})}function I(o,e,s){return o.once(e,s),new i(()=>{o.off(e,s)})}var Q=l,G=f,J=m,V=D,X=T,Y=I,Z=S,$=w;var E=class extends Error{constructor(e){super(e||"Object disposed")}};var _=class{constructor(e){this._handler=typeof e=="function"?e:a}get handler(){return this._handler}set handler(e){this._handler=typeof e=="function"?e:this._defaultHandler}reset(){this._handler=this._defaultHandler}handle(e){this._handler(e)}handleAny(e){e instanceof Error||(e=new Error(e)),this._handler(e)}handleSafe(e){try{this.handle(e)}catch(s){}}handleAnySafe(e){try{this.handleAny(e)}catch(s){}}};var z=new _,K=class{constructor(e){this._disposed=!1;this._action=typeof e=="function"?e:a}get disposed(){return this._disposed}dispose(){if(!this._disposed){this._disposed=!0;try{this._action()}catch(e){z.handleAny(e)}}}[Symbol.dispose](){this.dispose()}},j=class{constructor(e){this._disposed=!1;this._action=typeof e=="function"?e:h}get disposed(){return this._disposed}dispose(){return p(this,null,function*(){if(!this._disposed){this._disposed=!0;try{yield this._action()}catch(e){z.handleAny(e)}}})}[Symbol.asyncDispose](){return this.dispose()}};function L(o){return typeof o=="object"&&o!==null&&typeof o.dispose=="function"}function k(o){return typeof o=="function"||typeof o=="object"&&o!==null&&typeof o.dispose=="function"}function ee(o){return typeof o=="object"&&o!==null&&typeof o.dispose=="function"&&typeof o[Symbol.dispose]=="function"}function oe(o){return typeof o=="object"&&o!==null&&typeof o.dispose=="function"&&typeof o[Symbol.asyncDispose]=="function"}function se(o){return typeof o=="object"&&o!==null&&typeof o[Symbol.dispose]=="function"}function te(o){return typeof o=="object"&&o!==null&&typeof o[Symbol.asyncDispose]=="function"}0&&(module.exports={AbortDisposable,AsyncDisposableAction,BoolDisposable,BooleanDisposable,CompositeDisposable,Disposable,DisposableAction,DisposableContainer,DisposableStore,ObjectDisposedException,SafeActionDisposable,SafeAsyncActionDisposable,SerialDisposable,createDisposable,createDisposableCompat,disposableFromEvent,disposableFromEventOnce,disposeAllSafe,emptyDisposable,isAsyncDisposableCompat,isDisposable,isDisposableCompat,isDisposableLike,isSystemAsyncDisposable,isSystemDisposable,on,once,safeDisposableExceptionHandlerManager,toDisposable,toDisposableCompat});
//# sourceMappingURL=index.cjs.map