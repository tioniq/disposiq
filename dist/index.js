var p=(o,e,s)=>new Promise((t,n)=>{var P=r=>{try{v(s.next(r))}catch(x){n(x)}},F=r=>{try{v(s.throw(r))}catch(x){n(x)}},v=r=>r.done?t(r.value):Promise.resolve(r.value).then(P,F);v((s=s.apply(o,e)).next())});"dispose"in Symbol||(Symbol.dispose=Symbol("Symbol.dispose"));"asyncDispose"in Symbol||(Symbol.asyncDispose=Symbol("Symbol.asyncDispose"));var l=Object.freeze(()=>{}),c=Object.freeze(()=>Promise.resolve());var i=class{constructor(e){this._disposed=!1;this._action=typeof e=="function"?e:l}get disposed(){return this._disposed}dispose(){this._disposed||(this._disposed=!0,this._action())}[Symbol.dispose](){this.dispose()}},f=class{constructor(e){this._disposed=!1;this._action=typeof e=="function"?e:c}get disposed(){return this._disposed}dispose(){return p(this,null,function*(){this._disposed||(this._disposed=!0,yield this._action())})}[Symbol.asyncDispose](){return this.dispose()}};var A=class{constructor(e){this.value=e,this.next=null}},m=class{constructor(){this.head=null,this.tail=null,this.length=0}enqueue(e){let s=new A(e);this.head?(this.tail.next=s,this.tail=s):(this.head=s,this.tail=s),this.length++}dequeue(){let e=this.head;return e===null?null:(this.head=e.next,this.length--,e.value)}isEmpty(){return this.length===0}getHead(){var e,s;return(s=(e=this.head)==null?void 0:e.value)!=null?s:null}getLength(){return this.length}forEach(e){let s=this.head;for(;s!==null;)e(s.value),s=s.next}toArray(){let e=[],s=this.head;for(;s!==null;)e.push(s.value),s=s.next;return e}clear(){this.head=null,this.tail=null,this.length=0}};var h=class{constructor(e){this._scrap=new m,this._size=e}get size(){return this._size}set size(e){this._size=e}get all(){return this._scrap.toArray()}lift(){return this._scrap.length>0?this._scrap.dequeue():null}throw(e){if(this._scrap.length<this._size)return this._scrap.enqueue(e),null;let s=this._scrap.dequeue();return this._scrap.enqueue(e),s}clear(){this._scrap.clear()}};var C=new h(10);function b(o){let e=o.length;if(e===0)return;let s=C.lift();s===null?s=new Array(e):s.length<e&&(s.length=e);for(let t=0;t<e;t++)s[t]=o[t];o.length=0;for(let t=0;t<e;++t){let n=s[t];n&&(typeof n=="function"?n():n.dispose())}s.fill(void 0,0,e),C.throw(s)}function g(o){for(let e=0;e<o.length;++e){let s=o[e];s&&(typeof s=="function"?s():s.dispose())}o.length=0}var a=class{constructor(){this._disposed=!1;this._disposables=new Array}get disposed(){return this._disposed}add(...e){this.addAll(e)}addAll(e){if(!(!e||e.length===0)){if(this._disposed){for(let s of e)s&&(typeof s=="function"?s():s.dispose());return}for(let s=0;s<e.length;s++){let t=e[s];t&&this._disposables.push(typeof t=="function"?new i(t):t)}}}addOne(e){if(e){if(this._disposed){typeof e=="function"?e():e.dispose();return}typeof e=="function"&&(e=new i(e)),this._disposables.push(e)}}remove(e){let s=this._disposables.indexOf(e);return s===-1?!1:(this._disposables.splice(s,1),!0)}addTimeout(e,s){if(typeof e=="function"){let t=setTimeout(e,s);this.add(()=>clearTimeout(t));return}this.add(()=>clearTimeout(e))}addInterval(e,s){if(typeof e=="function"){let t=setInterval(e,s);this.add(()=>clearInterval(t));return}this.add(()=>clearInterval(e))}dispose(){this._disposed||(this._disposed=!0,g(this._disposables))}disposeCurrent(){b(this._disposables)}[Symbol.dispose](){this.dispose()}};var S=class{constructor(){this._store=new a}get disposed(){return this._store.disposed}register(e){return this._store.addOne(e),e}dispose(){this._store.dispose()}[Symbol.dispose](){this.dispose()}};var q={dispose:function(){},[Symbol.dispose]:function(){}},d=Object.freeze(q);var u=class{constructor(e){this._controller=e}get disposed(){return this._controller.signal.aborted}get signal(){return this._controller.signal}dispose(){this._controller.abort()}[Symbol.dispose](){this.dispose()}};function w(o){if(!o)return d;if(typeof o=="function")return new i(o);if(typeof o=="object"){if("dispose"in o)return o;if(Symbol.dispose in o)return new i(()=>{let e=o[Symbol.dispose];e()});if(Symbol.asyncDispose in o)return new f(()=>p(this,null,function*(){let e=o[Symbol.asyncDispose];yield e()}));if("unref"in o)return new i(()=>o.unref());if(o instanceof AbortController)return new u(o)}return d}function T(o){if(!o)return d;if(typeof o=="function")return new i(o);if(typeof o=="object"){let e="dispose"in o,s=Symbol.dispose in o;if(e&&s)return o;if(e)return new i(()=>o.dispose());if(s)return new i(()=>o[Symbol.dispose]());if(Symbol.asyncDispose in o)return new i(()=>p(this,null,function*(){o[Symbol.asyncDispose]()}));if("unref"in o)return new i(()=>o.unref());if(o instanceof AbortController)return new u(o)}return d}var y=class{constructor(e=void 0){this._disposed=!1;this._disposable=e}get disposed(){return this._disposed}get disposable(){return this._disposable}set(e){if(this._disposed){e.dispose();return}this._disposable!=null&&this._disposable.dispose(),this._disposable=e}replace(e){if(this._disposed){e.dispose();return}this._disposable=e}disposeCurrent(){let e=this._disposable;e!=null&&(this._disposable=void 0,e.dispose())}dispose(){this._disposed||(this._disposed=!0,this._disposable!=null&&(this._disposable.dispose(),this._disposable=void 0))}[Symbol.dispose](){this.dispose()}};var D=class{constructor(e=!1){this._disposed=!1;this._disposed=e}get disposed(){return this._disposed}dispose(){this._disposed=!0}[Symbol.dispose](){this.dispose()}};function I(o,e,s){return o.on(e,s),new i(()=>{o.off(e,s)})}function E(o,e,s){return o.once(e,s),new i(()=>{o.off(e,s)})}var he=a,be=y,ye=D,De=b,_e=I,ve=E,xe=w,Ae=T;var K=class extends Error{constructor(e){super(e||"Object disposed")}};var _=class{constructor(e){this._handler=typeof e=="function"?e:l}get handler(){return this._handler}set handler(e){this._handler=typeof e=="function"?e:this._defaultHandler}reset(){this._handler=this._defaultHandler}handle(e){this._handler(e)}handleAny(e){e instanceof Error||(e=new Error(e)),this._handler(e)}handleSafe(e){try{this.handle(e)}catch(s){}}handleAnySafe(e){try{this.handleAny(e)}catch(s){}}};var H=new _,j=class{constructor(e){this._disposed=!1;this._action=typeof e=="function"?e:l}get disposed(){return this._disposed}dispose(){if(!this._disposed){this._disposed=!0;try{this._action()}catch(e){H.handleAny(e)}}}[Symbol.dispose](){this.dispose()}},z=class{constructor(e){this._disposed=!1;this._action=typeof e=="function"?e:c}get disposed(){return this._disposed}dispose(){return p(this,null,function*(){if(!this._disposed){this._disposed=!0;try{yield this._action()}catch(e){H.handleAny(e)}}})}[Symbol.asyncDispose](){return this.dispose()}};function je(o){return typeof o=="object"&&o!==null&&typeof o.dispose=="function"}function ze(o){return typeof o=="function"||typeof o=="object"&&o!==null&&typeof o.dispose=="function"}function He(o){return typeof o=="object"&&o!==null&&typeof o.dispose=="function"&&typeof o[Symbol.dispose]=="function"}function Pe(o){return typeof o=="object"&&o!==null&&typeof o.dispose=="function"&&typeof o[Symbol.asyncDispose]=="function"}function Fe(o){return typeof o=="object"&&o!==null&&typeof o[Symbol.dispose]=="function"}function qe(o){return typeof o=="object"&&o!==null&&typeof o[Symbol.asyncDispose]=="function"}export{u as AbortDisposable,f as AsyncDisposableAction,D as BoolDisposable,ye as BooleanDisposable,he as CompositeDisposable,S as Disposable,i as DisposableAction,y as DisposableContainer,a as DisposableStore,K as ObjectDisposedException,j as SafeActionDisposable,z as SafeAsyncActionDisposable,be as SerialDisposable,w as createDisposable,T as createDisposableCompat,I as disposableFromEvent,E as disposableFromEventOnce,b as disposeAll,De as disposeAllSafe,g as disposeAllUnsafe,d as emptyDisposable,Pe as isAsyncDisposableCompat,je as isDisposable,He as isDisposableCompat,ze as isDisposableLike,qe as isSystemAsyncDisposable,Fe as isSystemDisposable,_e as on,ve as once,H as safeDisposableExceptionHandlerManager,xe as toDisposable,Ae as toDisposableCompat};
//# sourceMappingURL=index.js.map