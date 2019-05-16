!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("indexDBP",[],t):"object"==typeof exports?exports.indexDBP=t():e.indexDBP=t()}(window,function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";function n(e){const t=Object.keys(e),r=t.indexOf("$lt")>-1||t.indexOf("$lte")>-1,n=t.indexOf("$gt")>-1||t.indexOf("$gte")>-1;return r&&n?IDBKeyRange.bound(e.$gt||e.$gte,e.$lt||e.$lte,!!e.$gt,!!e.$lt):n?IDBKeyRange.lowerBound(e.$gt||e.$gte,!!e.$gt):r?IDBKeyRange.upperBound(e.$lt||e.$lte,e.$lt):e.value||""}function o(e,t){let r=-1;for(let n=0;n<e.length;n++)e[n]===t&&(r=n);return r}r.r(t);const s={name:"indexDbP",version:1,onError(e){throw e},onSuccess(){}},i={autoIncrement:!0,keyPath:"id"},a={upsert:!1,multi:!1,extend:!0},c=window.indexedDB;t.default=class{constructor(e=s){this.$db={},this.name=e.name,this.version=e.version,this.onError=e.onError||s.onError,this.onSuccess=e.onSuccess||s.onSuccess}get db(){return this.pdb}set db(e){this.pdb=e;const t=e.objectStoreNames;for(let e=0;e<t.length;e++)this.insertObjectStore(t[e])}init(){return this.use(this.name,this.version)}getTransaction(e,t){return this.db.transaction(e,t)}getObjectStore(e,t){return this.getTransaction(e,t).objectStore(e)}dropDatabase(){return new Promise((e,t)=>{if(c.deleteDatabase&&this.db){const r=this.db.name;this.closeDB();const n=c.deleteDatabase(r);n.onsuccess=(t=>{e(t)}),n.onerror=(e=>{t(this.patchError(e))})}else t(this.patchError("Browser does not support IndexedDB deleteDatabase!"))})}containObjectStore(e){return o(this.db.objectStoreNames,e)>-1}async createObjectStore(e,t=i){if(this.containObjectStore(e))return this.patchError(`objectStore: ${e} exist`);await this.toggleMode("versionChange");const r=this.db.createObjectStore(e,t);return this.insertObjectStore(e),r}async deleteObjectStore(e){return this.containObjectStore(e)?(await this.toggleMode("versionChange"),this.db.deleteObjectStore(e),!0):this.patchError(`objectStore: ${e} not exist`)}containIndex(e,t){let r;return o((r=this.versionTransaction?this.versionTransaction:this.getTransaction(e,"readonly")).objectStore(e).indexNames,t)>-1}async createIndex(e,t,r,n){return await this.toggleMode("versionChange"),this.versionTransaction.objectStore(e).createIndex(t,r,n),!0}async deleteIndex(e,t){return await this.toggleMode("versionChange"),this.versionTransaction.objectStore(e).deleteIndex(t),!0}async find(e,t,r){const o="[object Object]"===Object.prototype.toString.call(t);return await this.toggleMode("normal"),new Promise((s,i)=>{const a=this.getObjectStore(e,"readonly");let c,d=a;if(r&&(d=a.index(r)),o){const e=n(t);c=d.getAll(e,t.count)}else c=d.getAll(t);this.documentHandleError(c,i,"find IDBRequest unknown error"),c.onsuccess=(()=>{s(c.result)})})}async insert(e,t,r){return await this.toggleMode("normal"),new Promise((n,o)=>{const s=this.getObjectStore(e,"readwrite").add(t,r);this.documentHandleError(s,o,"add IDBRequest unknown error"),s.onsuccess=(e=>{n(e)})})}async update(e,t,r,n){n=Object.assign({},a,n),await this.toggleMode("normal");const o=await this.find(e,t),s=(t={})=>new Promise((o,s)=>{const i=this.getObjectStore(e,"readwrite");let a="";a="string"==typeof i.keyPath?i.keyPath:i.keyPath[0],t[a]&&(r[a]=t[a]),n.extend&&(r=Object.assign(t,r));const c=i.put(r);this.documentHandleError(c,s,"update IDBRequest unknown error"),c.onsuccess=(e=>{o(e)})});return n.multi?Promise.all(o.map(e=>s(e))):o.length||n.upsert?s(o[0]||{}):this.patchError("can not find result!")}async remove(e,t){const r="[object Object]"===Object.prototype.toString.call(t);return await this.toggleMode("normal"),new Promise((o,s)=>{const i=this.getObjectStore(e,"readwrite");let a=t;r&&(a=n(t));const c=i.delete(a);this.documentHandleError(c,s,"remove IDBRequest unknown error"),c.onsuccess=(e=>{o(e)})})}use(e,t){return new Promise((r,n)=>{const o=c.open(e,t);this.openRequest=o,o.onerror=(r=>{if(function(e){return"error"in e.target?"VersionError"===e.target.error.name:"errorCode"in e.target&&12===e.target.errorCode}(r))n(this.patchError("The version number provided is lower than the existing one."));else{let o;if(r.target.error)o=(o=r.target.error).message||o;else{let n=`unknown error: ${e}:${t} open fail`;"errorCode"in r.target&&(n+=" with error code "+r.target.errorCode),o=new Error(n)}n(this.patchError(o))}}),o.onsuccess=(e=>{this.db=e.target.result,this.onSuccess&&this.onSuccess(e),r(!0)}),o.onupgradeneeded=(e=>{this.db=e.target.result,this.versionTransaction=e.target.transaction,this.onSuccess&&this.onSuccess(e),r(!0)})})}insertObjectStore(e){this.$db[e]={insert:this.insert.bind(this,e),update:this.update.bind(this,e),remove:this.remove.bind(this,e),find:this.find.bind(this,e),createIndex:this.createIndex.bind(this,e),deleteIndex:this.deleteIndex.bind(this,e),containIndex:this.containIndex.bind(this,e)}}patchError(e){let t;return t=e instanceof Error?e:new Error(e),this.onError(t),t}closeDB(){this.db.close(),this.openRequest.onerror=null,this.openRequest.onsuccess=null,this.openRequest.onupgradeneeded=null}toggleMode(e){const t=async e=>{const t=this.db.name,r=e?this.db.version+1:this.db.version;this.closeDB(),await this.use(t,r)};return"versionChange"===e?this.versionTransaction?Promise.resolve(!0):t(!0):"normal"===e?this.versionTransaction?t(!1):Promise.resolve(!0):void 0}documentHandleError(e,t,r){e.onerror=(e=>{const n=e.target.error;t(this.patchError(n.message||r))})}}}])});