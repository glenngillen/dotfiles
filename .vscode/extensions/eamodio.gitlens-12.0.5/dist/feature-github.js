var mt=Object.defineProperty;var y=(le,ue)=>mt(le,"name",{value:ue,configurable:!0});exports.id=457;exports.ids=[457];exports.modules={5186:(le,ue,E)=>{var T=E(3698),te=E(2505),J=E(6417),H=Function.bind,V=H.bind(H);function L(he,pe,P){var we=V(J,null).apply(null,P?[pe,P]:[pe]);he.api={remove:we},he.remove=we,["before","error","after","wrap"].forEach(function(w){var Ce=P?[pe,w,P]:[pe,w];he[w]=he.api[w]=V(te,null).apply(null,Ce)})}y(L,"bindApi");function ge(){var he="h",pe={registry:{}},P=T.bind(null,pe,he);return L(P,pe,he),P}y(ge,"HookSingular");function fe(){var he={registry:{}},pe=T.bind(null,he);return L(pe,he),pe}y(fe,"HookCollection");var ve=!1;function $(){return ve||(console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4'),ve=!0),fe()}y($,"Hook"),$.Singular=ge.bind(),$.Collection=fe.bind(),le.exports=$,le.exports.Hook=$,le.exports.Singular=$.Singular,le.exports.Collection=$.Collection},2505:le=>{le.exports=ue;function ue(E,T,te,J){var H=J;E.registry[te]||(E.registry[te]=[]),T==="before"&&(J=y(function(V,L){return Promise.resolve().then(H.bind(null,L)).then(V.bind(null,L))},"hook")),T==="after"&&(J=y(function(V,L){var ge;return Promise.resolve().then(V.bind(null,L)).then(function(fe){return ge=fe,H(ge,L)}).then(function(){return ge})},"hook")),T==="error"&&(J=y(function(V,L){return Promise.resolve().then(V.bind(null,L)).catch(function(ge){return H(ge,L)})},"hook")),E.registry[te].push({hook:J,orig:H})}y(ue,"addHook")},3698:le=>{le.exports=ue;function ue(E,T,te,J){if(typeof te!="function")throw new Error("method for before hook must be a function");return J||(J={}),Array.isArray(T)?T.reverse().reduce(function(H,V){return ue.bind(null,E,V,H,J)},te)():Promise.resolve().then(function(){return E.registry[T]?E.registry[T].reduce(function(H,V){return V.hook.bind(null,H,J)},te)():te(J)})}y(ue,"register")},6417:le=>{le.exports=ue;function ue(E,T,te){if(!!E.registry[T]){var J=E.registry[T].map(function(H){return H.orig}).indexOf(te);J!==-1&&E.registry[T].splice(J,1)}}y(ue,"removeHook")},8026:(le,ue,E)=>{"use strict";E.r(ue),E.d(ue,{GitHubApi:()=>ee,GitHubPullRequest:()=>Pe,fromCommitFileStatus:()=>gt});function T(){return typeof navigator=="object"&&"userAgent"in navigator?navigator.userAgent:typeof process=="object"&&"version"in process?`Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`:"<environment undetectable>"}y(T,"getUserAgent");var te=E(5186);/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */function J(a){return Object.prototype.toString.call(a)==="[object Object]"}y(J,"isObject");function H(a){var i,n;return J(a)===!1?!1:(i=a.constructor,i===void 0?!0:(n=i.prototype,!(J(n)===!1||n.hasOwnProperty("isPrototypeOf")===!1)))}y(H,"isPlainObject");function V(a){return a?Object.keys(a).reduce((i,n)=>(i[n.toLowerCase()]=a[n],i),{}):{}}y(V,"lowercaseKeys");function L(a,i){const n=Object.assign({},a);return Object.keys(i).forEach(o=>{H(i[o])?o in a?n[o]=L(a[o],i[o]):Object.assign(n,{[o]:i[o]}):Object.assign(n,{[o]:i[o]})}),n}y(L,"mergeDeep");function ge(a){for(const i in a)a[i]===void 0&&delete a[i];return a}y(ge,"removeUndefinedProperties");function fe(a,i,n){if(typeof i=="string"){let[s,u]=i.split(" ");n=Object.assign(u?{method:s,url:u}:{url:s},n)}else n=Object.assign({},i);n.headers=V(n.headers),ge(n),ge(n.headers);const o=L(a||{},n);return a&&a.mediaType.previews.length&&(o.mediaType.previews=a.mediaType.previews.filter(s=>!o.mediaType.previews.includes(s)).concat(o.mediaType.previews)),o.mediaType.previews=o.mediaType.previews.map(s=>s.replace(/-preview/,"")),o}y(fe,"merge");function ve(a,i){const n=/\?/.test(a)?"&":"?",o=Object.keys(i);return o.length===0?a:a+n+o.map(s=>s==="q"?"q="+i.q.split("+").map(encodeURIComponent).join("+"):`${s}=${encodeURIComponent(i[s])}`).join("&")}y(ve,"addQueryParameters");const $=/\{[^}]+\}/g;function he(a){return a.replace(/^\W+|\W+$/g,"").split(/,/)}y(he,"removeNonChars");function pe(a){const i=a.match($);return i?i.map(he).reduce((n,o)=>n.concat(o),[]):[]}y(pe,"extractUrlVariableNames");function P(a,i){return Object.keys(a).filter(n=>!i.includes(n)).reduce((n,o)=>(n[o]=a[o],n),{})}y(P,"omit");function we(a){return a.split(/(%[0-9A-Fa-f]{2})/g).map(function(i){return/%[0-9A-Fa-f]/.test(i)||(i=encodeURI(i).replace(/%5B/g,"[").replace(/%5D/g,"]")),i}).join("")}y(we,"encodeReserved");function w(a){return encodeURIComponent(a).replace(/[!'()*]/g,function(i){return"%"+i.charCodeAt(0).toString(16).toUpperCase()})}y(w,"encodeUnreserved");function Ce(a,i,n){return i=a==="+"||a==="#"?we(i):w(i),n?w(n)+"="+i:i}y(Ce,"encodeValue");function ce(a){return a!=null}y(ce,"isDefined");function Ee(a){return a===";"||a==="&"||a==="?"}y(Ee,"isKeyOperator");function Be(a,i,n,o){var s=a[n],u=[];if(ce(s)&&s!=="")if(typeof s=="string"||typeof s=="number"||typeof s=="boolean")s=s.toString(),o&&o!=="*"&&(s=s.substring(0,parseInt(o,10))),u.push(Ce(i,s,Ee(i)?n:""));else if(o==="*")Array.isArray(s)?s.filter(ce).forEach(function(c){u.push(Ce(i,c,Ee(i)?n:""))}):Object.keys(s).forEach(function(c){ce(s[c])&&u.push(Ce(i,s[c],c))});else{const c=[];Array.isArray(s)?s.filter(ce).forEach(function(g){c.push(Ce(i,g))}):Object.keys(s).forEach(function(g){ce(s[g])&&(c.push(w(g)),c.push(Ce(i,s[g].toString())))}),Ee(i)?u.push(w(n)+"="+c.join(",")):c.length!==0&&u.push(c.join(","))}else i===";"?ce(s)&&u.push(w(n)):s===""&&(i==="&"||i==="?")?u.push(w(n)+"="):s===""&&u.push("");return u}y(Be,"getValues");function Ye(a){return{expand:Le.bind(null,a)}}y(Ye,"parseUrl");function Le(a,i){var n=["+","#",".","/",";","?","&"];return a.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g,function(o,s,u){if(s){let g="";const f=[];if(n.indexOf(s.charAt(0))!==-1&&(g=s.charAt(0),s=s.substr(1)),s.split(/,/g).forEach(function(p){var C=/([^:\*]*)(?::(\d+)|(\*))?/.exec(p);f.push(Be(i,g,C[1],C[2]||C[3]))}),g&&g!=="+"){var c=",";return g==="?"?c="&":g!=="#"&&(c=g),(f.length!==0?g:"")+f.join(c)}else return f.join(",")}else return we(u)})}y(Le,"expand");function Fe(a){let i=a.method.toUpperCase(),n=(a.url||"/").replace(/:([a-z]\w+)/g,"{$1}"),o=Object.assign({},a.headers),s,u=P(a,["method","baseUrl","url","headers","request","mediaType"]);const c=pe(n);n=Ye(n).expand(u),/^http/.test(n)||(n=a.baseUrl+n);const g=Object.keys(a).filter(C=>c.includes(C)).concat("baseUrl"),f=P(u,g);if(!/application\/octet-stream/i.test(o.accept)&&(a.mediaType.format&&(o.accept=o.accept.split(/,/).map(C=>C.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,`application/vnd$1$2.${a.mediaType.format}`)).join(",")),a.mediaType.previews.length)){const C=o.accept.match(/[\w-]+(?=-preview)/g)||[];o.accept=C.concat(a.mediaType.previews).map(q=>{const Y=a.mediaType.format?`.${a.mediaType.format}`:"+json";return`application/vnd.github.${q}-preview${Y}`}).join(",")}return["GET","HEAD"].includes(i)?n=ve(n,f):"data"in f?s=f.data:Object.keys(f).length?s=f:o["content-length"]=0,!o["content-type"]&&typeof s<"u"&&(o["content-type"]="application/json; charset=utf-8"),["PATCH","PUT"].includes(i)&&typeof s>"u"&&(s=""),Object.assign({method:i,url:n,headers:o},typeof s<"u"?{body:s}:null,a.request?{request:a.request}:null)}y(Fe,"parse");function Ae(a,i,n){return Fe(fe(a,i,n))}y(Ae,"endpointWithDefaults");function qe(a,i){const n=fe(a,i),o=Ae.bind(null,n);return Object.assign(o,{DEFAULTS:n,defaults:qe.bind(null,n),merge:fe.bind(null,n),parse:Fe})}y(qe,"withDefaults");const Ne=`octokit-endpoint.js/6.0.12 ${T()}`,ke=qe(null,{method:"GET",baseUrl:"https://api.github.com",headers:{accept:"application/vnd.github.v3+json","user-agent":Ne},mediaType:{format:"",previews:[]}});var He=E(5568);class xe extends Error{constructor(i){super(i);Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor),this.name="Deprecation"}}y(xe,"Deprecation");var re=E(778),ae=E.n(re);const S=ae()(a=>console.warn(a)),me=ae()(a=>console.warn(a));class ye extends Error{constructor(i,n,o){super(i);Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor),this.name="HttpError",this.status=n;let s;"headers"in o&&typeof o.headers<"u"&&(s=o.headers),"response"in o&&(this.response=o.response,s=o.response.headers);const u=Object.assign({},o.request);o.request.headers.authorization&&(u.headers=Object.assign({},o.request.headers,{authorization:o.request.headers.authorization.replace(/ .*$/," [REDACTED]")})),u.url=u.url.replace(/\bclient_secret=\w+/g,"client_secret=[REDACTED]").replace(/\baccess_token=\w+/g,"access_token=[REDACTED]"),this.request=u,Object.defineProperty(this,"code",{get(){return S(new xe("[@octokit/request-error] `error.code` is deprecated, use `error.status`.")),n}}),Object.defineProperty(this,"headers",{get(){return me(new xe("[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`.")),s||{}}})}}y(ye,"RequestError");const Me="5.6.3";function Oe(a){return a.arrayBuffer()}y(Oe,"getBufferResponse");function Te(a){const i=a.request&&a.request.log?a.request.log:console;(H(a.body)||Array.isArray(a.body))&&(a.body=JSON.stringify(a.body));let n={},o,s;return(a.request&&a.request.fetch||He.ZP)(a.url,Object.assign({method:a.method,body:a.body,headers:a.headers,redirect:a.redirect},a.request)).then(async c=>{s=c.url,o=c.status;for(const g of c.headers)n[g[0]]=g[1];if("deprecation"in n){const g=n.link&&n.link.match(/<([^>]+)>; rel="deprecation"/),f=g&&g.pop();i.warn(`[@octokit/request] "${a.method} ${a.url}" is deprecated. It is scheduled to be removed on ${n.sunset}${f?`. See ${f}`:""}`)}if(!(o===204||o===205)){if(a.method==="HEAD"){if(o<400)return;throw new ye(c.statusText,o,{response:{url:s,status:o,headers:n,data:void 0},request:a})}if(o===304)throw new ye("Not modified",o,{response:{url:s,status:o,headers:n,data:await b(c)},request:a});if(o>=400){const g=await b(c);throw new ye(Ve(g),o,{response:{url:s,status:o,headers:n,data:g},request:a})}return b(c)}}).then(c=>({status:o,url:s,headers:n,data:c})).catch(c=>{throw c instanceof ye?c:new ye(c.message,500,{request:a})})}y(Te,"fetchWrapper");async function b(a){const i=a.headers.get("content-type");return/application\/json/.test(i)?a.json():!i||/^text\/|charset=utf-8$/.test(i)?a.text():Oe(a)}y(b,"getResponseData");function Ve(a){return typeof a=="string"?a:"message"in a?Array.isArray(a.errors)?`${a.message}: ${a.errors.map(JSON.stringify).join(", ")}`:a.message:`Unknown error: ${JSON.stringify(a)}`}y(Ve,"toErrorMessage");function O(a,i){const n=a.defaults(i);return Object.assign(y(function(s,u){const c=n.merge(s,u);if(!c.request||!c.request.hook)return Te(n.parse(c));const g=y((f,p)=>Te(n.parse(n.merge(f,p))),"request");return Object.assign(g,{endpoint:n,defaults:O.bind(null,n)}),c.request.hook(g,c)},"newApi"),{endpoint:n,defaults:O.bind(null,n)})}y(O,"dist_web_withDefaults");const e=O(ke,{headers:{"user-agent":`octokit-request.js/${Me} ${T()}`}}),t="4.8.0";function r(a){return`Request failed due to following response errors:
`+a.errors.map(i=>` - ${i.message}`).join(`
`)}y(r,"_buildMessageForResponseErrors");class l extends Error{constructor(i,n,o){super(r(o));this.request=i,this.headers=n,this.response=o,this.name="GraphqlResponseError",this.errors=o.errors,this.data=o.data,Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}}y(l,"GraphqlResponseError");const h=["method","baseUrl","url","headers","request","query","mediaType"],d=["query","method","url"],v=/\/api\/v3\/?$/;function m(a,i,n){if(n){if(typeof i=="string"&&"query"in n)return Promise.reject(new Error('[@octokit/graphql] "query" cannot be used as variable name'));for(const c in n)if(!!d.includes(c))return Promise.reject(new Error(`[@octokit/graphql] "${c}" cannot be used as variable name`))}const o=typeof i=="string"?Object.assign({query:i},n):i,s=Object.keys(o).reduce((c,g)=>h.includes(g)?(c[g]=o[g],c):(c.variables||(c.variables={}),c.variables[g]=o[g],c),{}),u=o.baseUrl||a.endpoint.DEFAULTS.baseUrl;return v.test(u)&&(s.url=u.replace(v,"/api/graphql")),a(s).then(c=>{if(c.data.errors){const g={};for(const f of Object.keys(c.headers))g[f]=c.headers[f];throw new l(s,g,c.data)}return c.data.data})}y(m,"graphql");function R(a,i){const n=a.defaults(i);return Object.assign(y((s,u)=>m(n,s,u),"newApi"),{defaults:R.bind(null,n),endpoint:e.endpoint})}y(R,"graphql_dist_web_withDefaults");const D=R(e,{headers:{"user-agent":`octokit-graphql.js/${t} ${T()}`},method:"POST",url:"/graphql"});function M(a){return R(a,{method:"POST",url:"/graphql"})}y(M,"withCustomRequest");const F=/^v1\./,x=/^ghs_/,N=/^ghu_/;async function X(a){const i=a.split(/\./).length===3,n=F.test(a)||x.test(a),o=N.test(a);return{type:"token",token:a,tokenType:i?"app":n?"installation":o?"user-to-server":"oauth"}}y(X,"auth");function _(a){return a.split(/\./).length===3?`bearer ${a}`:`token ${a}`}y(_,"withAuthorizationPrefix");async function G(a,i,n,o){const s=i.endpoint.merge(n,o);return s.headers.authorization=_(a),i(s)}y(G,"hook");const j=y(function(i){if(!i)throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");if(typeof i!="string")throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");return i=i.replace(/^(token|bearer) +/i,""),Object.assign(X.bind(null,i),{hook:G.bind(null,i)})},"createTokenAuth"),B="3.6.0";class A{constructor(i={}){const n=new te.Collection,o={baseUrl:e.endpoint.DEFAULTS.baseUrl,headers:{},request:Object.assign({},i.request,{hook:n.bind(null,"request")}),mediaType:{previews:[],format:""}};if(o.headers["user-agent"]=[i.userAgent,`octokit-core.js/${B} ${T()}`].filter(Boolean).join(" "),i.baseUrl&&(o.baseUrl=i.baseUrl),i.previews&&(o.mediaType.previews=i.previews),i.timeZone&&(o.headers["time-zone"]=i.timeZone),this.request=e.defaults(o),this.graphql=M(this.request).defaults(o),this.log=Object.assign({debug:()=>{},info:()=>{},warn:console.warn.bind(console),error:console.error.bind(console)},i.log),this.hook=n,i.authStrategy){const{authStrategy:u,...c}=i,g=u(Object.assign({request:this.request,log:this.log,octokit:this,octokitOptions:c},i.auth));n.wrap("request",g.hook),this.auth=g}else if(!i.auth)this.auth=async()=>({type:"unauthenticated"});else{const u=j(i.auth);n.wrap("request",u.hook),this.auth=u}this.constructor.plugins.forEach(u=>{Object.assign(this,u(this,i))})}static defaults(i){return y(class extends this{constructor(...o){const s=o[0]||{};if(typeof i=="function"){super(i(s));return}super(Object.assign({},i,s,s.userAgent&&i.userAgent?{userAgent:`${s.userAgent} ${i.userAgent}`}:null))}},"OctokitWithDefaults")}static plugin(...i){var n;const o=this.plugins;return n=y(class extends this{},"_a"),n.plugins=o.concat(i.filter(u=>!o.includes(u))),n}}y(A,"Octokit"),A.VERSION=B,A.plugins=[];var U=E(9496),de=E(1149),k=E(4673),ie=E(9179),K=E(5396),$e=E(5059),oe=E(2833),z=E(2436),W=E(7369),at=E(9417),Je=Object.defineProperty,lt=Object.defineProperties,ut=Object.getOwnPropertyDescriptor,ct=Object.getOwnPropertyDescriptors,Ge=Object.getOwnPropertySymbols,Xe=Object.prototype.hasOwnProperty,Qe=Object.prototype.propertyIsEnumerable,ze=y((a,i,n)=>i in a?Je(a,i,{enumerable:!0,configurable:!0,writable:!0,value:n}):a[i]=n,"__defNormalProp"),_e=y((a,i)=>{for(var n in i||(i={}))Xe.call(i,n)&&ze(a,n,i[n]);if(Ge)for(var n of Ge(i))Qe.call(i,n)&&ze(a,n,i[n]);return a},"__spreadValues"),De=y((a,i)=>lt(a,ct(i)),"__spreadProps"),dt=y((a,i)=>{var n={};for(var o in a)Xe.call(a,o)&&i.indexOf(o)<0&&(n[o]=a[o]);if(a!=null&&Ge)for(var o of Ge(a))i.indexOf(o)<0&&Qe.call(a,o)&&(n[o]=a[o]);return n},"__objRest"),ne=y((a,i,n,o)=>{for(var s=o>1?void 0:o?ut(i,n):i,u=a.length-1,c;u>=0;u--)(c=a[u])&&(s=(o?c(i,n,s):c(s))||s);return o&&s&&Je(i,n,s),s},"__decorateClass"),Ue=y((a,i,n)=>(ze(a,typeof i!="symbol"?i+"":i,n),n),"__publicField");const Se=Object.freeze({values:[]}),Ze=Object.freeze({ranges:[]});class ee{constructor(i){Ue(this,"_onDidReauthenticate",new U.EventEmitter),Ue(this,"_disposable"),Ue(this,"_proxyAgent",null),Ue(this,"_octokits",new Map),!k.$L&&(this._disposable=U.Disposable.from(ie.DN.onDidChange(n=>{ie.DN.changed(n,"proxy")?(this._proxyAgent=null,this._octokits.clear()):ie.DN.changed(n,"outputLevel")&&this._octokits.clear()}),ie.DN.onDidChangeAny(n=>{(n.affectsConfiguration("http.proxy")||n.affectsConfiguration("http.proxyStrictSSL"))&&(this._proxyAgent=null,this._octokits.clear())})))}get onDidReauthenticate(){return this._onDidReauthenticate.event}dispose(){var i;(i=this._disposable)==null||i.dispose()}get proxyAgent(){if(!k.$L)return this._proxyAgent===null&&(this._proxyAgent=(0,de.N)()),this._proxyAgent}async getAccountForCommit(i,n,o,s,u,c){var g,f;const p=z.Y.getCorrelationContext();try{const C=`query getAccountForCommit(
	$owner: String!
	$repo: String!
	$ref: GitObjectID!
	$avatarSize: Int
) {
	repository(name: $repo, owner: $owner) {
		object(oid: $ref) {
			... on Commit {
				author {
					name
					email
					avatarUrl(size: $avatarSize)
				}
			}
		}
	}
}`,q=await this.graphql(n,C,De(_e({},c),{owner:o,repo:s,ref:u})),Y=(f=(g=q?.repository)==null?void 0:g.object)==null?void 0:f.author;return Y==null?void 0:{provider:i,name:Y.name??void 0,email:Y.email??void 0,avatarUrl:Y.avatarUrl}}catch(C){return this.handleException(C,p,void 0)}}async getAccountForEmail(i,n,o,s,u,c){var g,f;const p=z.Y.getCorrelationContext();try{const C=`query getAccountForEmail(
	$emailQuery: String!
	$avatarSize: Int
) {
	search(type: USER, query: $emailQuery, first: 1) {
		nodes {
			... on User {
				name
				email
				avatarUrl(size: $avatarSize)
			}
		}
	}
}`,q=await this.graphql(n,C,De(_e({},c),{owner:o,repo:s,emailQuery:`in:email ${u}`})),Y=(f=(g=q?.search)==null?void 0:g.nodes)==null?void 0:f[0];return Y==null?void 0:{provider:i,name:Y.name??void 0,email:Y.email??void 0,avatarUrl:Y.avatarUrl}}catch(C){return this.handleException(C,p,void 0)}}async getDefaultBranch(i,n,o,s,u){var c,g;const f=z.Y.getCorrelationContext();try{const p=`query getDefaultBranch(
	$owner: String!
	$repo: String!
) {
	repository(name: $repo, owner: $owner) {
		defaultBranchRef {
			name
		}
	}
}`,C=await this.graphql(n,p,De(_e({},u),{owner:o,repo:s})),q=((g=(c=C?.repository)==null?void 0:c.defaultBranchRef)==null?void 0:g.name)??void 0;return q==null?void 0:{provider:i,name:q}}catch(p){return this.handleException(p,f,void 0)}}async getIssueOrPullRequest(i,n,o,s,u,c){var g;const f=z.Y.getCorrelationContext();try{const p=`query getIssueOrPullRequest(
		$owner: String!
		$repo: String!
		$number: Int!
	) {
		repository(name: $repo, owner: $owner) {
			issueOrPullRequest(number: $number) {
				__typename
				... on Issue {
					createdAt
					closed
					closedAt
					title
					url
				}
				... on PullRequest {
					createdAt
					closed
					closedAt
					title
					url
				}
			}
		}
	}`,C=await this.graphql(n,p,De(_e({},c),{owner:o,repo:s,number:u})),q=(g=C?.repository)==null?void 0:g.issueOrPullRequest;return q==null?void 0:{provider:i,type:q.type,id:String(u),date:new Date(q.createdAt),title:q.title,closed:q.closed,closedDate:q.closedAt==null?void 0:new Date(q.closedAt),url:q.url}}catch(p){return this.handleException(p,f,void 0)}}async getPullRequestForBranch(i,n,o,s,u,c){var g,f,p,C;const q=z.Y.getCorrelationContext();try{const Y=`query getPullRequestForBranch(
	$owner: String!
	$repo: String!
	$branch: String!
	$limit: Int!
	$include: [PullRequestState!]
	$avatarSize: Int
) {
	repository(name: $repo, owner: $owner) {
		refs(query: $branch, refPrefix: "refs/heads/", first: 1) {
			nodes {
				associatedPullRequests(first: $limit, orderBy: {field: UPDATED_AT, direction: DESC}, states: $include) {
					nodes {
						author {
							login
							avatarUrl(size: $avatarSize)
							url
						}
						permalink
						number
						title
						state
						updatedAt
						closedAt
						mergedAt
						repository {
							isFork
							owner {
								login
							}
						}
					}
				}
			}
		}
	}
}`,Q=await this.graphql(n,Y,De(_e({},c),{owner:o,repo:s,branch:u,limit:10})),I=(C=(p=(f=(g=Q?.repository)==null?void 0:g.refs.nodes[0])==null?void 0:f.associatedPullRequests)==null?void 0:p.nodes)==null?void 0:C.filter(Z=>!Z.repository.isFork||Z.repository.owner.login===o);return I==null||I.length===0?void 0:(I.length>1&&I.sort((Z,se)=>(Z.repository.owner.login===o?-1:1)-(se.repository.owner.login===o?-1:1)||(Z.state==="OPEN"?-1:1)-(se.state==="OPEN"?-1:1)||new Date(se.updatedAt).getTime()-new Date(Z.updatedAt).getTime()),Pe.from(I[0],i))}catch(Y){return this.handleException(Y,q,void 0)}}async getPullRequestForCommit(i,n,o,s,u,c){var g,f,p,C;const q=z.Y.getCorrelationContext();try{const Y=`query getPullRequestForCommit(
	$owner: String!
	$repo: String!
	$ref: GitObjectID!
	$avatarSize: Int
) {
	repository(name: $repo, owner: $owner) {
		object(oid: $ref) {
			... on Commit {
				associatedPullRequests(first: 2, orderBy: {field: UPDATED_AT, direction: DESC}) {
					nodes {
						author {
							login
							avatarUrl(size: $avatarSize)
							url
						}
						permalink
						number
						title
						state
						updatedAt
						closedAt
						mergedAt
						repository {
							isFork
							owner {
								login
							}
						}
					}
				}
			}
		}
	}
}`,Q=await this.graphql(n,Y,De(_e({},c),{owner:o,repo:s,ref:u})),I=(C=(p=(f=(g=Q?.repository)==null?void 0:g.object)==null?void 0:f.associatedPullRequests)==null?void 0:p.nodes)==null?void 0:C.filter(Z=>!Z.repository.isFork||Z.repository.owner.login===o);return I==null||I.length===0?void 0:(I.length>1&&I.sort((Z,se)=>(Z.repository.owner.login===o?-1:1)-(se.repository.owner.login===o?-1:1)||(Z.state==="OPEN"?-1:1)-(se.state==="OPEN"?-1:1)||new Date(se.updatedAt).getTime()-new Date(Z.updatedAt).getTime()),Pe.from(I[0],i))}catch(Y){return this.handleException(Y,q,void 0)}}async getBlame(i,n,o,s,u){var c,g,f,p,C;const q=z.Y.getCorrelationContext();try{const Y=`query getBlameRanges(
	$owner: String!
	$repo: String!
	$ref: String!
	$path: String!
) {
	viewer { name }
	repository(owner: $owner, name: $repo) {
		object(expression: $ref) {
			...on Commit {
				blame(path: $path) {
					ranges {
						startingLine
						endingLine
						commit {
							oid
							parents(first: 3) { nodes { oid } }
							message
							additions
							changedFiles
							deletions
							author {
								avatarUrl
								date
								email
								name
							}
							committer {
								date
								email
								name
							}
						}
					}
				}
			}
		}
	}
}`,Q=await this.graphql(i,Y,{owner:n,repo:o,ref:s,path:u});if(Q==null)return Ze;const I=(f=(g=(c=Q.repository)==null?void 0:c.object)==null?void 0:g.blame)==null?void 0:f.ranges;return I==null||I.length===0?{ranges:[],viewer:(p=Q.viewer)==null?void 0:p.name}:{ranges:I,viewer:(C=Q.viewer)==null?void 0:C.name}}catch(Y){return this.handleException(Y,q,Ze)}}async getBranches(i,n,o,s){var u;const c=z.Y.getCorrelationContext();try{const g=`query getBranches(
	$owner: String!
	$repo: String!
	$branchQuery: String
	$cursor: String
	$limit: Int = 100
) {
	repository(owner: $owner, name: $repo) {
		refs(query: $branchQuery, refPrefix: "refs/heads/", first: $limit, after: $cursor, orderBy: { field: TAG_COMMIT_DATE, direction: DESC }) {
			pageInfo {
				endCursor
				hasNextPage
			}
			nodes {
				name
				target {
					oid
					commitUrl
					...on Commit {
						authoredDate
						committedDate
					}
				}
			}
		}
	}
}`,f=await this.graphql(i,g,{owner:n,repo:o,branchQuery:s?.query,cursor:s?.cursor,limit:Math.min(100,s?.limit??100)});if(f==null)return Se;const p=(u=f.repository)==null?void 0:u.refs;return p==null?Se:{paging:{cursor:p.pageInfo.endCursor,more:p.pageInfo.hasNextPage},values:p.nodes}}catch(g){return this.handleException(g,c,Se)}}async getCommit(i,n,o,s){var u,c,g,f,p,C,q,Y,Q,I;const Z=z.Y.getCorrelationContext();try{const se=await this.request(i,"GET /repos/{owner}/{repo}/commits/{ref}",{owner:n,repo:o,ref:s}),be=se?.data;if(be==null)return;const{commit:Re}=be;return{oid:be.sha,parents:{nodes:be.parents.map(Ie=>({oid:Ie.sha}))},message:Re.message,additions:(u=be.stats)==null?void 0:u.additions,changedFiles:(c=be.files)==null?void 0:c.length,deletions:(g=be.stats)==null?void 0:g.deletions,author:{avatarUrl:((f=be.author)==null?void 0:f.avatar_url)??void 0,date:((p=Re.author)==null?void 0:p.date)??new Date().toString(),email:((C=Re.author)==null?void 0:C.email)??void 0,name:((q=Re.author)==null?void 0:q.name)??""},committer:{date:((Y=Re.committer)==null?void 0:Y.date)??new Date().toString(),email:((Q=Re.committer)==null?void 0:Q.email)??void 0,name:((I=Re.committer)==null?void 0:I.name)??""},files:be.files}}catch(se){return this.handleException(se,Z,void 0)}}async getCommitForFile(i,n,o,s,u){if(oe.GitRevision.isSha(s))return this.getCommit(i,n,o,s);const c=await this.getCommits(i,n,o,s,{limit:1,path:u});if(c.values.length===0)return;const g=await this.getCommit(i,n,o,c.values[0].oid);return De(_e({},g??c.values[0]),{viewer:c.viewer})}async getCommitBranches(i,n,o,s,u){var c,g;const f=z.Y.getCorrelationContext();try{const p=`query getCommitBranches(
	$owner: String!
	$repo: String!
	$since: GitTimestamp!
	$until: GitTimestamp!
) {
	repository(owner: $owner, name: $repo) {
		refs(first: 20, refPrefix: "refs/heads/", orderBy: { field: TAG_COMMIT_DATE, direction: DESC }) {
			nodes {
				name
				target {
					... on Commit {
						history(first: 3, since: $since until: $until) {
							nodes { oid }
						}
					}
				}
			}
		}
	}
}`,C=await this.graphql(i,p,{owner:n,repo:o,since:u.toISOString(),until:u.toISOString()}),q=(g=(c=C?.repository)==null?void 0:c.refs)==null?void 0:g.nodes;if(q==null)return[];const Y=[];for(const Q of q)for(const I of Q.target.history.nodes)if(I.oid===s){Y.push(Q.name);break}return Y}catch(p){return this.handleException(p,f,[])}}async getCommitCount(i,n,o,s){var u,c;const g=z.Y.getCorrelationContext();try{const f=`query getCommitCount(
	$owner: String!
	$repo: String!
	$ref: String!
) {
	repository(owner: $owner, name: $repo) {
		ref(qualifiedName: $ref) {
			target {
				... on Commit {
					history(first: 1) {
						totalCount
					}
				}
			}
		}
	}
}`,p=await this.graphql(i,f,{owner:n,repo:o,ref:s});return(c=(u=p?.repository)==null?void 0:u.ref)==null?void 0:c.target.history.totalCount}catch(f){return this.handleException(f,g,void 0)}}async getCommitOnBranch(i,n,o,s,u,c){var g;const f=z.Y.getCorrelationContext();try{const p=`query getCommitOnBranch(
	$owner: String!
	$repo: String!
	$ref: String!
	$since: GitTimestamp!
	$until: GitTimestamp!
) {
	repository(owner: $owner, name: $repo) {
		ref(qualifiedName: $ref) {
			target {
				... on Commit {
					history(first: 3, since: $since until: $until) {
						nodes { oid }
					}
				}
			}
		}
	}
}`,C=await this.graphql(i,p,{owner:n,repo:o,ref:`refs/heads/${s}`,since:c.toISOString(),until:c.toISOString()}),q=(g=C?.repository)==null?void 0:g.ref.target.history.nodes;if(q==null)return[];const Y=[];for(const Q of q)if(Q.oid===u){Y.push(s);break}return Y}catch(p){return this.handleException(p,f,[])}}async getCommits(i,n,o,s,u){var c,g,f,p;const C=z.Y.getCorrelationContext();if(u?.limit===1&&u?.path==null)return this.getCommitsCoreSingle(i,n,o,s);try{const q=`query getCommits(
	$owner: String!
	$repo: String!
	$ref: String!
	$path: String
	$author: CommitAuthor
	$after: String
	$before: String
	$limit: Int = 100
	$since: GitTimestamp
	$until: GitTimestamp
) {
	viewer { name }
	repository(name: $repo, owner: $owner) {
		object(expression: $ref) {
			... on Commit {
				history(first: $limit, author: $author, path: $path, after: $after, before: $before, since: $since, until: $until) {
					pageInfo {
						startCursor
						endCursor
						hasNextPage
						hasPreviousPage
					}
					nodes {
						... on Commit {
							oid
							message
							parents(first: 3) { nodes { oid } }
							additions
							changedFiles
							deletions
							author {
								avatarUrl
								date
								email
								name
							}
							committer {
								 date
								 email
								 name
							 }
						}
					}
				}
			}
		}
	}
}`;let Y;if(u?.authors!=null)if(u.authors.length===1){const[Z]=u.authors;Y={id:Z.id,emails:Z.email?[Z.email]:void 0}}else{const Z=u.authors.filter(se=>se.email).map(se=>se.email);Y=Z.length?{emails:Z}:void 0}const Q=await this.graphql(i,q,{owner:n,repo:o,ref:s,after:u?.after,before:u?.before,path:u?.path,author:Y,limit:Math.min(100,u?.limit??100),since:typeof u?.since=="string"?u?.since:(c=u?.since)==null?void 0:c.toISOString(),until:typeof u?.until=="string"?u?.until:(g=u?.until)==null?void 0:g.toISOString()}),I=(p=(f=Q?.repository)==null?void 0:f.object)==null?void 0:p.history;return I==null?Se:{paging:I.pageInfo.endCursor!=null?{cursor:I.pageInfo.endCursor??void 0,more:I.pageInfo.hasNextPage}:void 0,values:I.nodes,viewer:Q?.viewer.name}}catch(q){return this.handleException(q,C,Se)}}async getCommitsCoreSingle(i,n,o,s){var u;const c=z.Y.getCorrelationContext();try{const g=`query getCommit(
	$owner: String!
	$repo: String!
	$ref: String!
) {
	viewer { name }
	repository(name: $repo owner: $owner) {
		object(expression: $ref) {
			...on Commit {
				oid
				parents(first: 3) { nodes { oid } }
				message
				additions
				changedFiles
				deletions
				author {
					avatarUrl
					date
					email
					name
				}
				committer {
					date
					email
					name
				}
			}
		}
	}
}`,f=await this.graphql(i,g,{owner:n,repo:o,ref:s});if(f==null)return Se;const p=(u=f.repository)==null?void 0:u.object;return p!=null?{values:[p],viewer:f.viewer.name}:Se}catch(g){return this.handleException(g,c,Se)}}async getCommitRefs(i,n,o,s,u){var c,g;const f=z.Y.getCorrelationContext();try{const p=`query getCommitRefs(
	$owner: String!
	$repo: String!
	$ref: String!
	$after: String
	$before: String
	$first: Int
	$last: Int
	$path: String
	$since: GitTimestamp
	$until: GitTimestamp
) {
	repository(name: $repo, owner: $owner) {
		object(expression: $ref) {
			... on Commit {
				history(first: $first, last: $last, path: $path, since: $since, until: $until, after: $after, before: $before) {
					pageInfo { startCursor, endCursor, hasNextPage, hasPreviousPage }
					totalCount
					nodes { oid }
				}
			}
		}
	}
}`,C=await this.graphql(i,p,{owner:n,repo:o,ref:s,path:u?.path,first:u?.first,last:u?.last,after:u?.after,before:u?.before,since:u?.since,until:u?.until}),q=(g=(c=C?.repository)==null?void 0:c.object)==null?void 0:g.history;return q==null?void 0:{pageInfo:q.pageInfo,totalCount:q.totalCount,values:q.nodes}}catch(p){return this.handleException(p,f,void 0)}}async getNextCommitRefs(i,n,o,s,u,c){const g=await this.getCommitDate(i,n,o,c);if(g==null)return[];let f=await this.getCommitRefs(i,n,o,s,{path:u,first:1,since:g});if(f==null)return[];const p=`${f.pageInfo.startCursor.split(" ",1)[0]} ${f.totalCount}`;let C;if([,C]=p.split(" ",2),C=Math.min(parseInt(C,10),5),f=await this.getCommitRefs(i,n,o,s,{path:u,last:C,before:p}),f==null)return[];const q=[];for(const{oid:Y}of f.values){if(Y===c)break;q.push(Y)}return q.reverse()}async getCommitDate(i,n,o,s){var u,c;const g=z.Y.getCorrelationContext();try{const f=`query getCommitDate(
	$owner: String!
	$repo: String!
	$sha: GitObjectID!
) {
	repository(name: $repo, owner: $owner) {
		object(oid: $sha) {
			... on Commit { committer { date } }
		}
	}
}`,p=await this.graphql(i,f,{owner:n,repo:o,sha:s});return(c=(u=p?.repository)==null?void 0:u.object)==null?void 0:c.committer.date}catch(f){return this.handleException(f,g,void 0)}}async getContributors(i,n,o){const s=z.Y.getCorrelationContext();try{const u=await this.request(i,"GET /repos/{owner}/{repo}/contributors",{owner:n,repo:o,per_page:100});return u?.data==null?[]:u.data}catch(u){return this.handleException(u,s,[])}}async getDefaultBranchName(i,n,o){var s,u;const c=z.Y.getCorrelationContext();try{const g=`query getDefaultBranch(
	$owner: String!
	$repo: String!
) {
	repository(owner: $owner, name: $repo) {
		defaultBranchRef {
			name
		}
	}
}`,f=await this.graphql(i,g,{owner:n,repo:o});return f==null?void 0:((u=(s=f.repository)==null?void 0:s.defaultBranchRef)==null?void 0:u.name)??void 0}catch(g){return this.handleException(g,c,void 0)}}async getCurrentUser(i,n,o){var s,u,c,g;const f=z.Y.getCorrelationContext();try{const p=`query getCurrentUser(
	$owner: String!
	$repo: String!
) {
	viewer { name, email, login, id }
	repository(owner: $owner, name: $repo) { viewerPermission }
}`,C=await this.graphql(i,p,{owner:n,repo:o});return C==null?void 0:{name:(s=C.viewer)==null?void 0:s.name,email:(u=C.viewer)==null?void 0:u.email,username:(c=C.viewer)==null?void 0:c.login,id:(g=C.viewer)==null?void 0:g.id}}catch(p){return this.handleException(p,f,void 0)}}async getRepositoryVisibility(i,n,o){var s;const u=z.Y.getCorrelationContext();try{const c=`query getRepositoryVisibility(
	$owner: String!
	$repo: String!
) {
	repository(owner: $owner, name: $repo) {
		visibility
	}
}`,g=await this.graphql(i,c,{owner:n,repo:o});return((s=g?.repository)==null?void 0:s.visibility)==null?void 0:g.repository.visibility==="PUBLIC"?$e.q.Public:$e.q.Private}catch(c){return this.handleException(c,u,void 0)}}async getTags(i,n,o,s){var u;const c=z.Y.getCorrelationContext();try{const g=`query getTags(
	$owner: String!
	$repo: String!
	$tagQuery: String
	$cursor: String
	$limit: Int = 100
) {
	repository(owner: $owner, name: $repo) {
		refs(query: $tagQuery, refPrefix: "refs/tags/", first: $limit, after: $cursor, orderBy: { field: TAG_COMMIT_DATE, direction: DESC }) {
			pageInfo {
				endCursor
				hasNextPage
			}
			nodes {
				name
				target {
					oid
					commitUrl
					...on Commit {
						authoredDate
						committedDate
						message
					}
					...on Tag {
						message
						tagger { date }
					}
				}
			}
		}
	}
}`,f=await this.graphql(i,g,{owner:n,repo:o,tagQuery:s?.query,cursor:s?.cursor,limit:Math.min(100,s?.limit??100)});if(f==null)return Se;const p=(u=f.repository)==null?void 0:u.refs;return p==null?Se:{paging:{cursor:p.pageInfo.endCursor,more:p.pageInfo.hasNextPage},values:p.nodes}}catch(g){return this.handleException(g,c,Se)}}async resolveReference(i,n,o,s,u){var c,g,f,p,C,q;const Y=z.Y.getCorrelationContext();try{if(!u){const Z=`query resolveReference(
	$owner: String!
	$repo: String!
	$ref: String!
) {
	repository(owner: $owner, name: $repo) {
		object(expression: $ref) {
			oid
		}
	}
}`,se=await this.graphql(i,Z,{owner:n,repo:o,ref:s});return((g=(c=se?.repository)==null?void 0:c.object)==null?void 0:g.oid)??void 0}const Q=`query resolveReference(
	$owner: String!
	$repo: String!
	$ref: String!
	$path: String!
) {
	repository(owner: $owner, name: $repo) {
		object(expression: $ref) {
			... on Commit {
				history(first: 1, path: $path) {
					nodes { oid }
				}
			}
		}
	}
}`,I=await this.graphql(i,Q,{owner:n,repo:o,ref:s,path:u});return((q=(C=(p=(f=I?.repository)==null?void 0:f.object)==null?void 0:p.history.nodes)==null?void 0:C[0])==null?void 0:q.oid)??void 0}catch(Q){return this.handleException(Q,Y,void 0)}}async searchCommits(i,n,o){const s=z.Y.getCorrelationContext(),u=Math.min(100,o?.limit??100);let c,g,f;o?.cursor!=null?([c,g,f]=o.cursor.split(" ",3),c=parseInt(c,10),g=parseInt(g,10),f=parseInt(f,10)):(c=1,g=u,f=0);try{const p=await this.request(i,"GET /search/commits",{q:n,sort:o?.sort,order:o?.order,per_page:g,page:c}),C=p?.data;if(C==null||C.items.length===0)return;const q=C.items.map(I=>{var Z,se,be,Re,Ie,Ke,et,tt,rt,it,nt,ot,st;return{oid:I.sha,parents:{nodes:I.parents.map(ht=>({oid:ht.sha}))},message:I.commit.message,author:{avatarUrl:((Z=I.author)==null?void 0:Z.avatar_url)??void 0,date:((se=I.commit.author)==null?void 0:se.date)??((be=I.commit.author)==null?void 0:be.date)??new Date().toString(),email:((Re=I.author)==null?void 0:Re.email)??((Ie=I.commit.author)==null?void 0:Ie.email)??void 0,name:((Ke=I.author)==null?void 0:Ke.name)??((et=I.commit.author)==null?void 0:et.name)??""},committer:{date:((tt=I.commit.committer)==null?void 0:tt.date)??((rt=I.committer)==null?void 0:rt.date)??new Date().toString(),email:((it=I.committer)==null?void 0:it.email)??((nt=I.commit.committer)==null?void 0:nt.email)??void 0,name:((ot=I.committer)==null?void 0:ot.name)??((st=I.commit.committer)==null?void 0:st.name)??""}}}),Y=f+C.items.length,Q=C.incomplete_results||C.total_count>Y;return{pageInfo:{startCursor:`${c} ${g} ${f}`,endCursor:Q?`${c+1} ${g} ${Y}`:void 0,hasPreviousPage:C.total_count>0&&c>1,hasNextPage:Q},totalCount:C.total_count,values:q}}catch(p){return this.handleException(p,s,void 0)}}octokit(i,n){let o=this._octokits.get(i);if(o==null){let s;if(k.$L){let u=y(function(c,g){if(g.headers!=null){const f=g.headers,{"user-agent":p}=f,C=dt(f,["user-agent"]);p&&(g.headers=C)}return(0,de.h)(c,g)},"fetchCore");s=A.defaults({auth:`token ${i}`,request:{fetch:u}})}else s=A.defaults({auth:`token ${i}`,request:{agent:this.proxyAgent}});o=new s(n),this._octokits.set(i,o),(z.Y.logLevel===z.i.Debug||z.Y.isDebugging)&&o.hook.wrap("request",async(u,c)=>{const g=new at.u(`[GITHUB] ${c.method} ${c.url}`,{log:!1});try{return await u(c)}finally{let f;try{if(typeof c.query=="string"){const p=/(^[^({\n]+)/.exec(c.query);f=` ${p?.[1].trim()??c.query}`}}catch{}g.stop({message:f})}})}return o}async graphql(i,n,o){var s,u,c,g,f;try{return await this.octokit(i).graphql(n,o)}catch(p){if(p instanceof l){switch((u=(s=p.errors)==null?void 0:s[0])==null?void 0:u.type){case"NOT_FOUND":throw new K.Ww(p);case"FORBIDDEN":throw new K._7("github",K.Jx.Forbidden,p);case"RATE_LIMITED":{let C;const q=(c=p.headers)==null?void 0:c["x-ratelimit-reset"];throw q!=null&&(C=parseInt(q,10),Number.isNaN(C)&&(C=void 0)),new K.yx(p,i,C)}}z.Y.isDebugging&&U.window.showErrorMessage(`GitHub request failed: ${((f=(g=p.errors)==null?void 0:g[0])==null?void 0:f.message)??p.message}`)}else p instanceof ye?this.handleRequestError(p,i):z.Y.isDebugging&&U.window.showErrorMessage(`GitHub request failed: ${p.message}`);throw p}}async request(i,n,o){try{return await this.octokit(i).request(n,o)}catch(s){throw s instanceof ye?this.handleRequestError(s,i):z.Y.isDebugging&&U.window.showErrorMessage(`GitHub request failed: ${s.message}`),s}}handleRequestError(i,n){var o,s,u,c,g;switch(i.status){case 404:case 410:case 422:throw new K.Ww(i);case 401:throw new K._7("github",K.Jx.Unauthorized,i);case 403:if(i.message.includes("rate limit exceeded")){let f;const p=(s=(o=i.response)==null?void 0:o.headers)==null?void 0:s["x-ratelimit-reset"];throw p!=null&&(f=parseInt(p,10),Number.isNaN(f)&&(f=void 0)),new K.yx(i,n,f)}throw new K._7("github",K.Jx.Forbidden,i);case 500:i.response!=null&&U.window.showErrorMessage("GitHub failed to respond and might be experiencing issues. Please visit the [GitHub status page](https://githubstatus.com) for more information.","OK");return;case 502:if(i.message.includes("timeout")){U.window.showErrorMessage("GitHub request timed out");return}break;default:if(i.status>=400&&i.status<500)throw new K.Bn(i);break}z.Y.isDebugging&&U.window.showErrorMessage(`GitHub request failed: ${((g=(c=(u=i.response)==null?void 0:u.errors)==null?void 0:c[0])==null?void 0:g.message)??i.message}`)}handleException(i,n,o){if(i instanceof K.Ww)return o;throw z.Y.error(i,n),i instanceof K._7&&this.showAuthenticationErrorMessage(i),i}async showAuthenticationErrorMessage(i){if(i.reason===K.Jx.Unauthorized||i.reason===K.Jx.Forbidden){const n="Reauthenticate";await U.window.showErrorMessage(`${i.message}. Would you like to try reauthenticating${i.reason===K.Jx.Forbidden?" to provide additional access":""}?`,n)===n&&this._onDidReauthenticate.fire()}else U.window.showErrorMessage(i.message)}}y(ee,"GitHubApi"),ne([(0,W.fF)({args:{0:a=>a.name,1:"<token>"}})],ee.prototype,"getAccountForCommit",1),ne([(0,W.fF)({args:{0:a=>a.name,1:"<token>"}})],ee.prototype,"getAccountForEmail",1),ne([(0,W.fF)({args:{0:a=>a.name,1:"<token>"}})],ee.prototype,"getDefaultBranch",1),ne([(0,W.fF)({args:{0:a=>a.name,1:"<token>"}})],ee.prototype,"getIssueOrPullRequest",1),ne([(0,W.fF)({args:{0:a=>a.name,1:"<token>"}})],ee.prototype,"getPullRequestForBranch",1),ne([(0,W.fF)({args:{0:a=>a.name,1:"<token>"}})],ee.prototype,"getPullRequestForCommit",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getBlame",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getBranches",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getCommit",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getCommitForFile",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getCommitBranches",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getCommitCount",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getCommitOnBranch",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getCommits",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getCommitRefs",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getNextCommitRefs",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getContributors",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getDefaultBranchName",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getCurrentUser",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getRepositoryVisibility",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"getTags",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"resolveReference",1),ne([(0,W.fF)({args:{0:"<token>"}})],ee.prototype,"searchCommits",1);var Pe;(a=>{function i(s,u){return new oe.PullRequest(u,{name:s.author.login,avatarUrl:s.author.avatarUrl,url:s.author.url},String(s.number),s.title,s.permalink,n(s.state),new Date(s.updatedAt),s.closedAt==null?void 0:new Date(s.closedAt),s.mergedAt==null?void 0:new Date(s.mergedAt))}y(i,"from"),a.from=i;function n(s){return s==="MERGED"?oe.PullRequestState.Merged:s==="CLOSED"?oe.PullRequestState.Closed:oe.PullRequestState.Open}y(n,"fromState"),a.fromState=n;function o(s){return s===oe.PullRequestState.Merged?"MERGED":s===oe.PullRequestState.Closed?"CLOSED":"OPEN"}y(o,"toState"),a.toState=o})(Pe||(Pe={}));function gt(a){switch(a){case"added":return oe.GitFileIndexStatus.Added;case"changed":case"modified":return oe.GitFileIndexStatus.Modified;case"removed":return oe.GitFileIndexStatus.Deleted;case"renamed":return oe.GitFileIndexStatus.Renamed;case"copied":return oe.GitFileIndexStatus.Copied}}y(gt,"fromCommitFileStatus")},3333:(le,ue,E)=>{"use strict";E.r(ue),E.d(ue,{GitHubGitProvider:()=>b});var T=E(9496),te=E(7267),J=E(9179),H=E(1045),V=E(313),L=E(5396),ge=E(6532),fe=E(5059),ve=E(2324),$=E(2833),he=E(7358),pe=E(3969),P=E(2436),we=E(5861),w=E(7369),Ce=E(2886),ce=E(516),Ee=E(2378);async function Be(O){try{const e=T.extensions.getExtension("ms-vscode.remote-repositories")??T.extensions.getExtension("GitHub.remotehub");if(e==null)throw P.Y.log("GitHub Repositories extension is not installed or enabled"),new L.R5("GitHub Repositories","GitHub.remotehub");return e.isActive?e.exports:await e.activate()}catch(e){if(P.Y.error(e,"Unable to get required api from the GitHub Repositories extension"),e instanceof L.R5,O)return;throw e}}y(Be,"getRemoteHubApi");var Ye=(O=>(O[O.Branch=0]="Branch",O[O.RemoteBranch=1]="RemoteBranch",O[O.Tag=2]="Tag",O[O.Commit=3]="Commit",O))(Ye||{}),Le=(O=>(O[O.Branch=0]="Branch",O[O.Tag=1]="Tag",O[O.Commit=2]="Commit",O[O.PullRequest=3]="PullRequest",O[O.Tree=4]="Tree",O))(Le||{}),Fe=E(8026),Ae=Object.defineProperty,qe=Object.defineProperties,We=Object.getOwnPropertyDescriptor,Ne=Object.getOwnPropertyDescriptors,je=Object.getOwnPropertySymbols,ke=Object.prototype.hasOwnProperty,He=Object.prototype.propertyIsEnumerable,xe=y((O,e,t)=>e in O?Ae(O,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):O[e]=t,"__defNormalProp"),re=y((O,e)=>{for(var t in e||(e={}))ke.call(e,t)&&xe(O,t,e[t]);if(je)for(var t of je(e))He.call(e,t)&&xe(O,t,e[t]);return O},"__spreadValues"),ae=y((O,e)=>qe(O,Ne(e)),"__spreadProps"),S=y((O,e,t,r)=>{for(var l=r>1?void 0:r?We(e,t):e,h=O.length-1,d;h>=0;h--)(d=O[h])&&(l=(r?d(e,t,l):d(l))||l);return r&&l&&Ae(e,t,l),l},"__decorateClass"),me=y((O,e,t)=>(xe(O,typeof e!="symbol"?e+"":e,t),t),"__publicField");const ye=Object.freeze({values:[]}),Me=Promise.resolve(void 0),Oe=["repo","read:user","user:email"],Te=/^[^/](?!.*\/\.)(?!.*\.\.)(?!.*\/\/)(?!.*@\{)[^\000-\037\177 ~^:?*[\\]+[^./]$/;class b{constructor(e){this.container=e,me(this,"descriptor",{id:fe.p.GitHub,name:"GitHub"}),me(this,"supportedSchemes",new Set([H.sN.Virtual,H.sN.GitHub,H.sN.PRs])),me(this,"_onDidChangeRepository",new T.EventEmitter),me(this,"_onDidCloseRepository",new T.EventEmitter),me(this,"_onDidOpenRepository",new T.EventEmitter),me(this,"_branchesCache",new Map),me(this,"_repoInfoCache",new Map),me(this,"_tagsCache",new Map),me(this,"_disposables",[]),me(this,"_github"),me(this,"_remotehub"),me(this,"_remotehubPromise"),me(this,"_sessionPromise")}get onDidChangeRepository(){return this._onDidChangeRepository.event}get onDidCloseRepository(){return this._onDidCloseRepository.event}get onDidOpenRepository(){return this._onDidOpenRepository.event}dispose(){this._disposables.forEach(e=>e.dispose())}onRepositoryChanged(e,t){this._branchesCache.delete(e.path),this._tagsCache.delete(e.path),this._repoInfoCache.delete(e.path),this._onDidChangeRepository.fire(t)}async discoverRepositories(e){if(!this.supportedSchemes.has(e.scheme))return[];try{const{remotehub:t}=await this.ensureRepositoryContext(e.toString(),!0),r=t.getVirtualWorkspaceUri(e);return r==null?[]:[this.openRepository(void 0,r,!0)]}catch{return[]}}updateContext(){(0,V.v)(H.zf.HasVirtualFolders,this.container.git.hasOpenRepositories(this.descriptor.id))}openRepository(e,t,r,l,h){return new $.Repository(this.container,this.onRepositoryChanged.bind(this),this.descriptor,e,t,r,l??!T.window.state.focused,h)}async supports(e){switch(e){case ge.A.Worktrees:return!1;default:return!0}}async visibility(e){const t=await this.getRemotes(e);if(t.length===0)return fe.q.Local;const r=t.find(l=>l.name==="origin");return r!=null?this.getRemoteVisibility(r):fe.q.Private}async getRemoteVisibility(e){var t;switch((t=e.provider)==null?void 0:t.id){case"github":{const{github:r,metadata:l,session:h}=await this.ensureRepositoryContext(e.repoPath);return await r.getRepositoryVisibility(h.accessToken,l.repo.owner,l.repo.name)??fe.q.Private}default:return fe.q.Private}}async getOpenScmRepositories(){return[]}async getOrOpenScmRepository(e){}canHandlePathOrUri(e,t){if(!!this.supportedSchemes.has(e))return typeof t=="string"?t:t.toString()}getAbsoluteUri(e,t){if(typeof t=="string")if((0,ce.tE)(t))t=T.Uri.parse(t,!0);else throw T.window.showErrorMessage(`Unable to get absolute uri between ${typeof e=="string"?e:e.toString(!1)} and ${t}; Base path '${t}' must be a uri`),new Error(`Base path '${t}' must be a uri`);if(typeof e=="string"&&!(0,ce.tE)(e)&&!(0,ce.YP)(e))return T.Uri.joinPath(t,(0,ce.AH)(e));const r=this.getRelativePath(e,t);return T.Uri.joinPath(t,r)}async getBestRevisionUri(e,t,r){return r?this.createProviderUri(e,r,t):this.createVirtualUri(e,r,t)}getRelativePath(e,t){if(typeof t=="string")if((0,ce.tE)(t))t=T.Uri.parse(t,!0);else throw T.window.showErrorMessage(`Unable to get relative path between ${typeof e=="string"?e:e.toString(!1)} and ${t}; Base path '${t}' must be a uri`),new Error(`Base path '${t}' must be a uri`);let r;if(typeof e=="string")if((0,ce.tE)(e))e=T.Uri.parse(e,!0);else return e=(0,ce.AH)(e),r=(0,ce.YP)(e)&&e.startsWith(t.path)?e.slice(t.path.length):e,r.charCodeAt(0)===H.mN.Slash&&(r=r.slice(1)),r;return r=(0,ce.AH)((0,ce.Gf)(t.path.slice(1),e.path.slice(1))),r}getRevisionUri(e,t,r){const l=this.createProviderUri(e,r,t);return r===$.GitRevision.deletedOrMissing?l.with({query:"~"}):l}async getWorkingUri(e,t){return this.createVirtualUri(e,void 0,t.path)}async addRemote(e,t,r){}async pruneRemote(e,t){}async applyChangesToWorkingFile(e,t,r){}async branchContainsCommit(e,t,r){return!1}async checkout(e,t,r){}resetCaches(...e){(e.length===0||e.includes("branches"))&&this._branchesCache.clear(),(e.length===0||e.includes("tags"))&&this._tagsCache.clear(),e.length===0&&this._repoInfoCache.clear()}async excludeIgnoredUris(e,t){return t}async fetch(e,t){}async findRepositoryUri(e,t){const r=P.Y.getCorrelationContext();try{return(await this.ensureRemoteHubApi()).getProviderRootUri(e).with({scheme:H.sN.Virtual})}catch(l){l instanceof L.R5,P.Y.error(l,r);return}}async getAheadBehindCommitCount(e,t){}async getBlame(e,t){const r=P.Y.getCorrelationContext();if(t?.isDirty)return;let l="blame";e.sha!=null&&(l+=`:${e.sha}`);const h=await this.container.tracker.getOrAdd(e);if(h.state!=null){const v=h.state.getBlame(l);if(v!=null)return P.Y.debug(r,`Cache hit: '${l}'`),v.item}P.Y.debug(r,`Cache miss: '${l}'`),h.state==null&&(h.state=new Ee.p2(h.key));const d=this.getBlameCore(e,h,l,r);if(h.state!=null){P.Y.debug(r,`Cache add: '${l}'`);const v={item:d};h.state.setBlame(l,v)}return d}async getBlameCore(e,t,r,l){var h,d;try{const v=await this.ensureRepositoryContext(e.repoPath);if(v==null)return;const{metadata:m,github:R,remotehub:D,session:M}=v,F=D.getVirtualUri(D.getProviderRootUri(e)),x=this.getRelativePath(e,F);if(e.scheme===H.sN.Virtual){const[A,U]=await Promise.allSettled([T.workspace.fs.stat(e),T.workspace.fs.stat(e.with({scheme:H.sN.GitHub}))]);if(A.status!=="fulfilled"||U.status!=="fulfilled"||A.value.mtime!==U.value.mtime)return}const N=!e.sha||e.sha==="HEAD"?(await m.getRevision()).revision:e.sha,X=await R.getBlame(M.accessToken,m.repo.owner,m.repo.name,N,x),_=new Map,G=new Map,j=[];for(const A of X.ranges){const U=A.commit,{viewer:de=M.account.label}=X,k=de!=null&&U.author.name===de?"You":U.author.name,ie=de!=null&&U.committer.name===de?"You":U.committer.name;let K=_.get(k);K==null&&(K={name:k,lineCount:0},_.set(k,K)),K.lineCount+=A.endingLine-A.startingLine+1;let $e=G.get(U.oid);$e==null&&($e=new $.GitCommit(this.container,e.repoPath,U.oid,new $.GitCommitIdentity(k,U.author.email,new Date(U.author.date),U.author.avatarUrl),new $.GitCommitIdentity(ie,U.committer.email,new Date(U.author.date)),U.message.split(`
`,1)[0],(h=U.parents.nodes[0])!=null&&h.oid?[(d=U.parents.nodes[0])==null?void 0:d.oid]:[],U.message,new $.GitFileChange(F.toString(),x,$.GitFileIndexStatus.Modified),{changedFiles:U.changedFiles??0,additions:U.additions??0,deletions:U.deletions??0},[]),G.set(U.oid,$e));for(let oe=A.startingLine;oe<=A.endingLine;oe++){const z={sha:U.oid,originalLine:oe,line:oe};$e.lines.push(z),j[oe-1]=z}}const B=new Map([..._.entries()].sort((A,U)=>U[1].lineCount-A[1].lineCount));return{repoPath:e.repoPath,authors:B,commits:G,lines:j}}catch(v){if(t.state!=null&&!/No provider registered with/.test(String(v))){const m=v?.toString()??"";P.Y.debug(l,`Cache replace (with empty promise): '${r}'`);const R={item:Me,errorMessage:m};return t.state.setBlame(r,R),t.setBlameFailure(),Me}return}}async getBlameContents(e,t){}async getBlameForLine(e,t,r,l){var h,d;const v=P.Y.getCorrelationContext();if(!r?.isDirty){if(!l?.forceSingleLine){const m=await this.getBlame(e);if(m==null)return;let R=m.lines[t];if(R==null){if(m.lines.length!==t)return;R=m.lines[t-1]}const D=m.commits.get(R.sha);if(D==null)return;const M=m.authors.get(D.author.name);return{author:ae(re({},M),{lineCount:D.lines.length}),commit:D,line:R}}try{const m=await this.ensureRepositoryContext(e.repoPath);if(m==null)return;const{metadata:R,github:D,remotehub:M,session:F}=m,x=M.getVirtualUri(M.getProviderRootUri(e)),N=this.getRelativePath(e,x),X=!e.sha||e.sha==="HEAD"?(await R.getRevision()).revision:e.sha,_=await D.getBlame(F.accessToken,R.repo.owner,R.repo.name,X,N),G=t+1,j=_.ranges.find(ie=>ie.startingLine===G);if(j==null)return;const B=j.commit,{viewer:A=F.account.label}=_,U=A!=null&&B.author.name===A?"You":B.author.name,de=A!=null&&B.committer.name===A?"You":B.committer.name,k=new $.GitCommit(this.container,e.repoPath,B.oid,new $.GitCommitIdentity(U,B.author.email,new Date(B.author.date),B.author.avatarUrl),new $.GitCommitIdentity(de,B.committer.email,new Date(B.author.date)),B.message.split(`
`,1)[0],(h=B.parents.nodes[0])!=null&&h.oid?[(d=B.parents.nodes[0])==null?void 0:d.oid]:[],B.message,new $.GitFileChange(x.toString(),N,$.GitFileIndexStatus.Modified),{changedFiles:B.changedFiles??0,additions:B.additions??0,deletions:B.deletions??0},[]);for(let ie=j.startingLine;ie<=j.endingLine;ie++){const K={sha:B.oid,originalLine:ie,line:ie};k.lines.push(K)}return{author:{name:U,lineCount:j.endingLine-j.startingLine+1},commit:k,line:{sha:B.oid,originalLine:j.startingLine,line:j.startingLine}}}catch(m){P.Y.error(v,m);return}}}async getBlameForLineContents(e,t,r,l){}async getBlameForRange(e,t){const r=await this.getBlame(e);if(r!=null)return this.getBlameRange(r,e,t)}async getBlameForRangeContents(e,t,r){const l=await this.getBlameContents(e,r);if(l!=null)return this.getBlameRange(l,e,t)}getBlameRange(e,t,r){if(e.lines.length===0)return re({allLines:e.lines},e);if(r.start.line===0&&r.end.line===e.lines.length-1)return re({allLines:e.lines},e);const l=e.lines.slice(r.start.line,r.end.line+1),h=new Set(l.map(M=>M.sha)),d=r.start.line+1,v=r.end.line+1,m=new Map,R=new Map;for(const M of e.commits.values()){if(!h.has(M.sha))continue;const F=M.with({lines:M.lines.filter(N=>N.line>=d&&N.line<=v)});R.set(M.sha,F);let x=m.get(F.author.name);x==null&&(x={name:F.author.name,lineCount:0},m.set(x.name,x)),x.lineCount+=F.lines.length}const D=new Map([...m.entries()].sort((M,F)=>F[1].lineCount-M[1].lineCount));return{repoPath:t.repoPath,authors:D,commits:R,lines:l,allLines:e.lines}}async getBranch(e){const{values:[t]}=await this.getBranches(e,{filter:r=>r.current});return t}async getBranches(e,t){if(e==null)return ye;const r=P.Y.getCorrelationContext();let l=t?.cursor?void 0:this._branchesCache.get(e);if(l==null){async function d(){var v;try{const{metadata:m,github:R,session:D}=await this.ensureRepositoryContext(e),M=await m.getRevision(),F=M.type===0?M.name:void 0,x=[];let N=t?.cursor;const X=N==null;for(;;){const _=await R.getBranches(D.accessToken,m.repo.owner,m.repo.name,{cursor:N});for(const G of _.values){const j=new Date(this.container.config.advanced.commitOrdering==="author-date"?G.target.authoredDate:G.target.committedDate),B=G.target.oid;x.push(new $.GitBranch(e,G.name,!1,G.name===F,j,B,{name:`origin/${G.name}`,missing:!1}),new $.GitBranch(e,`origin/${G.name}`,!0,!1,j,B))}if(!((v=_.paging)!=null&&v.more)||!X)return ae(re({},_),{values:x});N=_.paging.cursor}}catch(m){return P.Y.error(m,r),this._branchesCache.delete(e),ye}}y(d,"load"),l=d.call(this),t?.cursor==null&&this._branchesCache.set(e,l)}let h=await l;return t?.filter!=null&&(h=ae(re({},h),{values:h.values.filter(t.filter)})),t?.sort!=null&&$.GitBranch.sort(h.values,typeof t.sort=="boolean"?void 0:t.sort),h}async getChangedFilesCount(e,t){if(!t)return;const r=await this.getCommit(e,t);if(r?.stats==null)return;const{stats:l}=r,h=typeof l.changedFiles=="number"?l.changedFiles:l.changedFiles.added+l.changedFiles.changed+l.changedFiles.deleted;return{additions:l.additions,deletions:l.deletions,changedFiles:h}}async getCommit(e,t){var r;if(e==null)return;const l=P.Y.getCorrelationContext();try{const{metadata:h,github:d,session:v}=await this.ensureRepositoryContext(e),m=await d.getCommit(v.accessToken,h.repo.owner,h.repo.name,t);if(m==null)return;const{viewer:R=v.account.label}=m,D=R!=null&&m.author.name===R?"You":m.author.name,M=R!=null&&m.committer.name===R?"You":m.committer.name;return new $.GitCommit(this.container,e,m.oid,new $.GitCommitIdentity(D,m.author.email,new Date(m.author.date),m.author.avatarUrl),new $.GitCommitIdentity(M,m.committer.email,new Date(m.committer.date)),m.message.split(`
`,1)[0],m.parents.nodes.map(F=>F.oid),m.message,((r=m.files)==null?void 0:r.map(F=>new $.GitFileChange(e,F.filename??"",(0,Fe.fromCommitFileStatus)(F.status)??$.GitFileIndexStatus.Modified,F.previous_filename,void 0,{additions:F.additions??0,deletions:F.deletions??0,changes:F.changes??0})))??[],{changedFiles:m.changedFiles??0,additions:m.additions??0,deletions:m.deletions??0},[])}catch(h){P.Y.error(h,l);return}}async getCommitBranches(e,t,r){if(e==null||r?.commitDate==null)return[];const l=P.Y.getCorrelationContext();try{const{metadata:h,github:d,session:v}=await this.ensureRepositoryContext(e);let m;return r?.branch?m=await d.getCommitOnBranch(v.accessToken,h.repo.owner,h.repo.name,r?.branch,t,r?.commitDate):m=await d.getCommitBranches(v.accessToken,h.repo.owner,h.repo.name,t,r?.commitDate),m}catch(h){return P.Y.error(h,l),[]}}async getCommitCount(e,t){if(e==null)return;const r=P.Y.getCorrelationContext();try{const{metadata:l,github:h,session:d}=await this.ensureRepositoryContext(e);return await h.getCommitCount(d?.accessToken,l.repo.owner,l.repo.name,t)}catch(l){P.Y.error(l,r);return}}async getCommitForFile(e,t,r){var l;if(e==null)return;const h=P.Y.getCorrelationContext();try{const{metadata:d,github:v,remotehub:m,session:R}=await this.ensureRepositoryContext(e),D=this.getRelativePath(t,m.getProviderRootUri(t)),M=!r?.ref||r.ref==="HEAD"?(await d.getRevision()).revision:r.ref,F=await v.getCommitForFile(R.accessToken,d.repo.owner,d.repo.name,M,D);if(F==null)return;const{viewer:x=R.account.label}=F,N=x!=null&&F.author.name===x?"You":F.author.name,X=x!=null&&F.committer.name===x?"You":F.committer.name,_=(l=F.files)==null?void 0:l.map(j=>new $.GitFileChange(e,j.filename??"",(0,Fe.fromCommitFileStatus)(j.status)??$.GitFileIndexStatus.Modified,j.previous_filename,void 0,{additions:j.additions??0,deletions:j.deletions??0,changes:j.changes??0})),G=_?.find(j=>j.path===D);return new $.GitCommit(this.container,e,F.oid,new $.GitCommitIdentity(N,F.author.email,new Date(F.author.date),F.author.avatarUrl),new $.GitCommitIdentity(X,F.committer.email,new Date(F.committer.date)),F.message.split(`
`,1)[0],F.parents.nodes.map(j=>j.oid),F.message,{file:G,files:_},{changedFiles:F.changedFiles??0,additions:F.additions??0,deletions:F.deletions??0},[])}catch(d){P.Y.error(d,h);return}}async getOldestUnpushedRefForFile(e,t){}async getContributors(e,t){if(e==null)return[];const r=P.Y.getCorrelationContext();try{const{metadata:l,github:h,session:d}=await this.ensureRepositoryContext(e),v=await h.getContributors(d.accessToken,l.repo.owner,l.repo.name),m=await this.getCurrentUser(e),R=[];for(const D of v)D.type==="User"&&R.push(new $.GitContributor(e,D.name,D.email,D.contributions,void 0,(0,$.isUserMatch)(m,D.name,D.email,D.login),void 0,D.login,D.avatar_url,D.node_id));return R}catch(l){return P.Y.error(l,r),[]}}async getCurrentUser(e){if(!e)return;const t=P.Y.getCorrelationContext(),r=this._repoInfoCache.get(e);let l=r?.user;if(l!=null)return l;if(l!==null)try{const{metadata:h,github:d,session:v}=await this.ensureRepositoryContext(e);return l=await d.getCurrentUser(v.accessToken,h.repo.owner,h.repo.name),this._repoInfoCache.set(e,ae(re({},r),{user:l??null})),l}catch(h){P.Y.error(h,t),this._repoInfoCache.set(e,ae(re({},r),{user:null}));return}}async getDefaultBranchName(e,t){if(e==null)return;const r=P.Y.getCorrelationContext();try{const{metadata:l,github:h,session:d}=await this.ensureRepositoryContext(e);return await h.getDefaultBranchName(d.accessToken,l.repo.owner,l.repo.name)}catch(l){P.Y.error(l,r);return}}async getDiffForFile(e,t,r){}async getDiffForFileContents(e,t,r){}async getDiffForLine(e,t,r,l){}async getDiffStatus(e,t,r,l){}async getFileStatusForCommit(e,t,r){if(r===$.GitRevision.deletedOrMissing||$.GitRevision.isUncommitted(r))return;const l=await this.getCommitForFile(e,t,{ref:r});if(l!=null)return l.findFile(t)}async getLastFetchedTimestamp(e){}async getLog(e,t){var r,l,h;if(e==null)return;const d=P.Y.getCorrelationContext(),v=this.getPagingLimit(t?.limit);try{const{metadata:m,github:R,session:D}=await this.ensureRepositoryContext(e),M=!t?.ref||t.ref==="HEAD"?(await m.getRevision()).revision:t.ref,F=await R.getCommits(D.accessToken,m.repo.owner,m.repo.name,M,{all:t?.all,authors:t?.authors,after:t?.cursor,limit:v,since:t?.since?new Date(t.since):void 0}),x=new Map,{viewer:N=D.account.label}=F;for(const _ of F.values){const G=N!=null&&_.author.name===N?"You":_.author.name,j=N!=null&&_.committer.name===N?"You":_.committer.name;let B=x.get(_.oid);B==null&&(B=new $.GitCommit(this.container,e,_.oid,new $.GitCommitIdentity(G,_.author.email,new Date(_.author.date),_.author.avatarUrl),new $.GitCommitIdentity(j,_.committer.email,new Date(_.committer.date)),_.message.split(`
`,1)[0],_.parents.nodes.map(A=>A.oid),_.message,(r=_.files)==null?void 0:r.map(A=>new $.GitFileChange(e,A.filename??"",(0,Fe.fromCommitFileStatus)(A.status)??$.GitFileIndexStatus.Modified,A.previous_filename,void 0,{additions:A.additions??0,deletions:A.deletions??0,changes:A.changes??0})),{changedFiles:_.changedFiles??0,additions:_.additions??0,deletions:_.deletions??0},[]),x.set(_.oid,B))}const X={repoPath:e,commits:x,sha:M,range:void 0,count:x.size,limit:v,hasMore:((l=F.paging)==null?void 0:l.more)??!1,cursor:(h=F.paging)==null?void 0:h.cursor,query:_=>this.getLog(e,ae(re({},t),{limit:_}))};return X.hasMore&&(X.more=this.getLogMoreFn(X,t)),X}catch(m){P.Y.error(m,d);return}}async getLogRefsOnly(e,t){const r=await this.getLog(e,t);if(r!=null)return new Set([...r.commits.values()].map(l=>l.ref))}getLogMoreFn(e,t){return async r=>{const l=r!=null&&typeof r=="object"?r.until:void 0;let h=typeof r=="number"?r:void 0;if(l&&(0,Ce.G)(e.commits.values(),R=>R.ref===l))return e;h=this.getPagingLimit(h);const d=await this.getLog(e.repoPath,ae(re({},t),{limit:h,cursor:e.cursor}));if(d==null)return ae(re({},e),{hasMore:!1});const v=new Map([...e.commits,...d.commits]),m={repoPath:e.repoPath,commits:v,sha:e.sha,range:void 0,count:v.size,limit:l==null?(e.limit??0)+h:void 0,hasMore:l==null?d.hasMore:!0,cursor:d.cursor,query:e.query};return m.more=this.getLogMoreFn(m,t),m}}async getLogForSearch(e,t,r){var l,h,d;if(e==null)return;const v=P.Y.getCorrelationContext(),m=pe.n.parseSearchOperations(t.pattern);let R,D=m.get("commit:");if(D!=null){const x=await this.getCommit(e,D[0]);return x==null?void 0:{repoPath:e,commits:new Map([[x.sha,x]]),sha:x.sha,range:void 0,count:1,limit:1,hasMore:!1}}const M=[];for([R,D]of m.entries())switch(R){case"message:":M.push(...D.map(x=>x.replace(/ /g,"+")));break;case"author:":M.push(...D.map(x=>(x=x.replace(/ /g,"+"),x.startsWith("@")?`author:${x.slice(1)}`:x.startsWith('"@')?`author:"${x.slice(2)}`:x.includes("@")?`author-email:${x}`:`author-name:${x}`)));break}if(M.length===0)return;const F=this.getPagingLimit(r?.limit);try{const{metadata:x,github:N,session:X}=await this.ensureRepositoryContext(e),_=await N.searchCommits(X.accessToken,`repo:${x.repo.owner}/${x.repo.name}+${M.join("+").trim()}`,{cursor:r?.cursor,limit:F,sort:r?.ordering==="date"?"committer-date":r?.ordering==="author-date"?"author-date":void 0});if(_==null)return;const G=new Map,j=X.account.label;for(const A of _.values){const U=j!=null&&A.author.name===j?"You":A.author.name,de=j!=null&&A.committer.name===j?"You":A.committer.name;let k=G.get(A.oid);k==null&&(k=new $.GitCommit(this.container,e,A.oid,new $.GitCommitIdentity(U,A.author.email,new Date(A.author.date),A.author.avatarUrl),new $.GitCommitIdentity(de,A.committer.email,new Date(A.committer.date)),A.message.split(`
`,1)[0],A.parents.nodes.map(ie=>ie.oid),A.message,(l=A.files)==null?void 0:l.map(ie=>new $.GitFileChange(e,ie.filename??"",(0,Fe.fromCommitFileStatus)(ie.status)??$.GitFileIndexStatus.Modified,ie.previous_filename,void 0,{additions:ie.additions??0,deletions:ie.deletions??0,changes:ie.changes??0})),{changedFiles:A.changedFiles??0,additions:A.additions??0,deletions:A.deletions??0},[]),G.set(A.oid,k))}const B={repoPath:e,commits:G,sha:void 0,range:void 0,count:G.size,limit:F,hasMore:((h=_.pageInfo)==null?void 0:h.hasNextPage)??!1,cursor:((d=_.pageInfo)==null?void 0:d.endCursor)??void 0,query:A=>this.getLog(e,ae(re({},r),{limit:A}))};return B.hasMore&&(B.more=this.getLogForSearchMoreFn(B,t,r)),B}catch(x){P.Y.error(x,v);return}}getLogForSearchMoreFn(e,t,r){return async l=>{l=this.getPagingLimit(l);const h=await this.getLogForSearch(e.repoPath,t,ae(re({},r),{limit:l,cursor:e.cursor}));if(h==null)return ae(re({},e),{hasMore:!1});const d=new Map([...e.commits,...h.commits]),v={repoPath:e.repoPath,commits:d,sha:e.sha,range:void 0,count:d.size,limit:(e.limit??0)+l,hasMore:h.hasMore,cursor:h.cursor,query:e.query};return v.more=this.getLogForSearchMoreFn(v,t,r),v}}async getLogForFile(e,t,r){if(e==null)return;const l=P.Y.getCorrelationContext(),h=this.getRelativePath(t,e);if(e!=null&&e===h)throw new Error(`File name cannot match the repository path; path=${h}`);r=re({reverse:!1},r),r.renames=!1,r.all=!1;let d="log";r.ref!=null&&(d+=`:${r.ref}`),r.limit=this.getPagingLimit(r?.limit),r.limit&&(d+=`:n${r.limit}`),r.renames&&(d+=":follow"),r.reverse&&(d+=":reverse"),r.since&&(d+=`:since=${r.since}`),r.skip&&(d+=`:skip${r.skip}`),r.cursor&&(d+=`:cursor=${r.cursor}`);const v=await this.container.tracker.getOrAdd(ve.YY.fromFile(h,e,r.ref));if(!r.force&&r.range==null){if(v.state!=null){const R=v.state.getLog(d);if(R!=null)return P.Y.debug(l,`Cache hit: '${d}'`),R.item;if(r.ref!=null||r.limit!=null){const D=v.state.getLog(`log${r.renames?":follow":""}${r.reverse?":reverse":""}`);if(D!=null){if(r.ref==null)return P.Y.debug(l,`Cache hit: ~'${d}'`),D.item;P.Y.debug(l,`Cache ?: '${d}'`);let M=await D.item;if(M!=null&&!M.hasMore&&M.commits.has(r.ref)){P.Y.debug(l,`Cache hit: '${d}'`);let F=!0,x=0;const N=new Map((0,Ce.DZ)(M.commits.entries(),([_,G])=>{if(F){if(_!==r?.ref)return;F=!1}if(x++,!(r?.limit!=null&&x>r.limit))return[_,G]})),X=re({},r);return M=ae(re({},M),{limit:r.limit,count:N.size,commits:N,query:_=>this.getLogForFile(e,t,ae(re({},X),{limit:_}))}),M}}}}P.Y.debug(l,`Cache miss: '${d}'`),v.state==null&&(v.state=new Ee.p2(v.key))}const m=this.getLogForFileCore(e,h,v,d,l,r);if(v.state!=null&&r.range==null){P.Y.debug(l,`Cache add: '${d}'`);const R={item:m};v.state.setLog(d,R)}return m}async getLogForFileCore(e,t,r,l,h,d){var v,m,R;if(e==null)return;const D=this.getPagingLimit(d?.limit);try{const M=await this.ensureRepositoryContext(e);if(M==null)return;const{metadata:F,github:x,remotehub:N,session:X}=M,_=this.getAbsoluteUri(t,e),G=this.getRelativePath(_,N.getProviderRootUri(_)),j=!d?.ref||d.ref==="HEAD"?(await F.getRevision()).revision:d.ref,B=await x.getCommits(X.accessToken,F.repo.owner,F.repo.name,j,{all:d?.all,after:d?.cursor,path:G,limit:D,since:d?.since?new Date(d.since):void 0}),A=new Map,{viewer:U=X.account.label}=B;for(const k of B.values){const ie=U!=null&&k.author.name===U?"You":k.author.name,K=U!=null&&k.committer.name===U?"You":k.committer.name;let $e=A.get(k.oid);if($e==null){const oe=(v=k.files)==null?void 0:v.map(W=>new $.GitFileChange(e,W.filename??"",(0,Fe.fromCommitFileStatus)(W.status)??$.GitFileIndexStatus.Modified,W.previous_filename,void 0,{additions:W.additions??0,deletions:W.deletions??0,changes:W.changes??0})),z=(0,ce.Mh)(G)?void 0:oe?.find(W=>W.path===G)??new $.GitFileChange(e,G,$.GitFileIndexStatus.Modified,void 0,void 0,k.changedFiles===1?{additions:k.additions??0,deletions:k.deletions??0,changes:0}:void 0);$e=new $.GitCommit(this.container,e,k.oid,new $.GitCommitIdentity(ie,k.author.email,new Date(k.author.date),k.author.avatarUrl),new $.GitCommitIdentity(K,k.committer.email,new Date(k.committer.date)),k.message.split(`
`,1)[0],k.parents.nodes.map(W=>W.oid),k.message,{file:z,files:oe},{changedFiles:k.changedFiles??0,additions:k.additions??0,deletions:k.deletions??0},[]),A.set(k.oid,$e)}}const de={repoPath:e,commits:A,sha:j,range:void 0,count:A.size,limit:D,hasMore:((m=B.paging)==null?void 0:m.more)??!1,cursor:(R=B.paging)==null?void 0:R.cursor,query:k=>this.getLogForFile(e,t,ae(re({},d),{limit:k}))};return de.hasMore&&(de.more=this.getLogForFileMoreFn(de,t,d)),de}catch(M){if(r.state!=null&&d?.range==null&&!d?.reverse){const F=M?.toString()??"";P.Y.debug(h,`Cache replace (with empty promise): '${l}'`);const x={item:Me,errorMessage:F};return r.state.setLog(l,x),Me}return}}getLogForFileMoreFn(e,t,r){return async l=>{const h=l!=null&&typeof l=="object"?l.until:void 0;let d=typeof l=="number"?l:void 0;if(h&&(0,Ce.G)(e.commits.values(),D=>D.ref===h))return e;d=this.getPagingLimit(d);const v=await this.getLogForFile(e.repoPath,t,ae(re({},r),{limit:h==null?d:0,cursor:e.cursor}));if(v==null)return ae(re({},e),{hasMore:!1});const m=new Map([...e.commits,...v.commits]),R={repoPath:e.repoPath,commits:m,sha:e.sha,range:e.range,count:m.size,limit:h==null?(e.limit??0)+d:void 0,hasMore:h==null?v.hasMore:!0,cursor:v.cursor,query:e.query};return R.more=this.getLogForFileMoreFn(R,t,r),R}}async getMergeBase(e,t,r,l){}async getMergeStatus(e){}async getRebaseStatus(e){}async getNextComparisonUris(e,t,r,l=0){if(!r)return;const h=P.Y.getCorrelationContext();try{const d=await this.ensureRepositoryContext(e);if(d==null)return;const{metadata:v,github:m,remotehub:R,session:D}=d,M=this.getRelativePath(t,R.getProviderRootUri(t)),F=(await v.getRevision()).revision;r==="HEAD"&&(r=F);const x=await m.getNextCommitRefs(D.accessToken,v.repo.owner,v.repo.name,F,M,r);return{current:l===0?ve.YY.fromFile(M,e,r):new ve.YY(await this.getBestRevisionUri(e,M,x[l-1])),next:new ve.YY(await this.getBestRevisionUri(e,M,x[l]))}}catch(d){throw P.Y.error(d,h),d}}async getPreviousComparisonUris(e,t,r,l=0,h=!1){var d,v;if(r===$.GitRevision.deletedOrMissing)return;const m=P.Y.getCorrelationContext();r===$.GitRevision.uncommitted&&(r=void 0);try{const R=await this.ensureRepositoryContext(e);if(R==null)return;const{metadata:D,github:M,remotehub:F,session:x}=R,N=this.getRelativePath(t,F.getProviderRootUri(t)),X=r!=null?1:0,_=await M.getCommitRefs(x.accessToken,D.repo.owner,D.repo.name,!r||r==="HEAD"?(await D.getRevision()).revision:r,{path:N,first:X+l+1});if(_==null)return;const G=l===0?ve.YY.fromFile(N,e,r):new ve.YY(await this.getBestRevisionUri(e,N,((d=_.values[X+l-1])==null?void 0:d.oid)??$.GitRevision.deletedOrMissing));return G==null||G.sha===$.GitRevision.deletedOrMissing?void 0:{current:G,previous:new ve.YY(await this.getBestRevisionUri(e,N,((v=_.values[X+l])==null?void 0:v.oid)??$.GitRevision.deletedOrMissing))}}catch(R){throw P.Y.error(R,m),R}}async getPreviousComparisonUrisForLine(e,t,r,l,h=0){var d,v;if(l===$.GitRevision.deletedOrMissing)return;const m=P.Y.getCorrelationContext();try{const R=await this.ensureRepositoryContext(e);if(R==null)return;const{remotehub:D}=R;let M=this.getRelativePath(t,D.getProviderRootUri(t)),F=ve.YY.fromFile(M,e,l),x=r,N,X=r,_=r;for(let G=0;G<Math.max(0,h)+2;G++){const j=await this.getBlameForLine(N??F,_,void 0,{forceSingleLine:!0});if(j==null)break;l=j.commit.sha,M=((d=j.commit.file)==null?void 0:d.path)??((v=j.commit.file)==null?void 0:v.originalPath)??M,_=j.line.originalLine-1;const B=ve.YY.fromFile(M,e,l);N==null?(N=B,X=_):(F=N,x=X,N=B,X=_)}return F==null?void 0:{current:F,previous:N,line:(x??r)+1}}catch(R){throw P.Y.error(R,m),R}}async getIncomingActivity(e,t){}async getRemotes(e,t){if(e==null)return[];const r=t?.providers??he.c.loadProviders(J.DN.get("remotes",null)),l=T.Uri.parse(e,!0),[,h,d]=l.path.split("/",3),v=`https://github.com/${h}/${d}.git`,m="github.com",R=`${h}/${d}`;return[new $.GitRemote(e,`${m}/${R}`,"origin","https",m,R,he.c.factory(r)(v,m,R),[{type:$.GitRemoteType.Fetch,url:v},{type:$.GitRemoteType.Push,url:v}])]}async getRevisionContent(e,t,r){const l=r?this.createProviderUri(e,r,t):this.createVirtualUri(e,r,t);return T.workspace.fs.readFile(l)}async getStash(e){}async getStatusForFile(e,t){}async getStatusForFiles(e,t){}async getStatusForRepo(e){}async getTags(e,t){if(e==null)return ye;const r=P.Y.getCorrelationContext();let l=t?.cursor?void 0:this._tagsCache.get(e);if(l==null){async function d(){var v,m,R;try{const{metadata:D,github:M,session:F}=await this.ensureRepositoryContext(e),x=[];let N=t?.cursor;const X=N==null;for(;;){const _=await M.getTags(F.accessToken,D.repo.owner,D.repo.name,{cursor:N});for(const G of _.values)x.push(new $.GitTag(e,G.name,G.target.oid,G.target.message??"",new Date(G.target.authoredDate??((v=G.target.tagger)==null?void 0:v.date)),new Date(G.target.committedDate??((m=G.target.tagger)==null?void 0:m.date))));if(!((R=_.paging)!=null&&R.more)||!X)return ae(re({},_),{values:x});N=_.paging.cursor}}catch(D){return P.Y.error(D,r),this._tagsCache.delete(e),ye}}y(d,"load"),l=d.call(this),t?.cursor==null&&this._tagsCache.set(e,l)}let h=await l;return t?.filter!=null&&(h=ae(re({},h),{values:h.values.filter(t.filter)})),t?.sort!=null&&$.GitTag.sort(h.values,typeof t.sort=="boolean"?void 0:t.sort),h}async getTreeEntryForRevision(e,t,r){if(e==null||!t)return;if(r==="HEAD"){const d=await this.ensureRepositoryContext(e);if(d==null)return;const v=await d.metadata.getRevision();r=v?.revision}const l=r?this.createProviderUri(e,r,t):this.createVirtualUri(e,r,t),h=await T.workspace.fs.stat(l);if(h!=null)return{path:this.getRelativePath(l,e),commitSha:r,size:h.size,type:h.type===T.FileType.Directory?"tree":"blob"}}async getTreeForRevision(e,t){if(e==null)return[];if(t==="HEAD"){const d=await this.ensureRepositoryContext(e);if(d==null)return[];const v=await d.metadata.getRevision();t=v?.revision}const r=t?this.createProviderUri(e,t):this.createVirtualUri(e,t),l=await T.workspace.fs.readDirectory(r);if(l==null)return[];const h=[];for(const[d,v]of l){const m=this.getAbsoluteUri(d,r);h.push({path:this.getRelativePath(d,m),commitSha:t,size:0,type:v===T.FileType.Directory?"tree":"blob"})}return[]}async hasBranchOrTag(e,t){var r,l;const[{values:h},{values:d}]=await Promise.all([this.getBranches(e,{filter:(r=t?.filter)==null?void 0:r.branches,sort:!1}),this.getTags(e,{filter:(l=t?.filter)==null?void 0:l.tags,sort:!1})]);return h.length!==0||d.length!==0}async hasCommitBeenPushed(e,t){return!0}isTrackable(e){return this.supportedSchemes.has(e.scheme)}isTracked(e){return Promise.resolve(this.isTrackable(e)&&this.container.git.getRepository(e)!=null)}async getDiffTool(e){}async openDiffTool(e,t,r){}async openDirectoryCompare(e,t,r,l){}async resolveReference(e,t,r,l){if(!t||t===$.GitRevision.deletedOrMissing||r==null&&$.GitRevision.isSha(t)||r!=null&&$.GitRevision.isUncommitted(t))return t;let h;if(r!=null)h=this.getRelativePath(r,e);else if(!$.GitRevision.isShaLike(t)||t.endsWith("^3"))return t;const d=await this.ensureRepositoryContext(e);if(d==null)return t;const{metadata:v,github:m,session:R}=d,D=await m.resolveReference(R.accessToken,v.repo.owner,v.repo.name,t,h);return D??(h?$.GitRevision.deletedOrMissing:t)}async validateBranchOrTagName(e,t){return Te.test(e)}async validateReference(e,t){return!0}async stageFile(e,t){}async stageDirectory(e,t){}async unStageFile(e,t){}async unStageDirectory(e,t){}async stashApply(e,t,r){}async stashDelete(e,t,r){}async stashSave(e,t,r,l){}async ensureRepositoryContext(e,t){let r=T.Uri.parse(e,!0);if(!/^github\+?/.test(r.authority))throw new L.kX(e,L.sh.NotAGitHubRepository);if(!t){const m=this.container.git.getRepository(r);if(m==null)throw new L.kX(e,L.sh.NotAGitHubRepository);r=m.uri}let l=this._remotehub;if(l==null)try{l=await this.ensureRemoteHubApi()}catch(m){throw m instanceof L.R5,new L.kX(e,L.sh.RemoteHubApiNotFound,m)}const h=await l?.getMetadata(r);if(h?.provider.id!=="github")throw new L.kX(e,L.sh.NotAGitHubRepository);let d,v;try{[d,v]=await Promise.all([this.ensureGitHub(),this.ensureSession()])}catch(m){throw m instanceof L._7?new L.kX(e,m.reason===L.Jx.UserDidNotConsent?L.sh.GitHubAuthenticationDenied:L.sh.GitHubAuthenticationNotFound,m):new L.kX(e)}if(d==null)throw new L.kX(e);return{github:d,metadata:h,remotehub:l,session:v}}async ensureGitHub(){if(this._github==null){const e=await this.container.github;e!=null&&this._disposables.push(e.onDidReauthenticate(()=>{this._sessionPromise=void 0,this.ensureSession(!0)})),this._github=e}return this._github}async ensureRemoteHubApi(e){if(this._remotehubPromise==null&&(this._remotehubPromise=Be(),this._remotehubPromise.then(t=>this._remotehub=t,()=>this._remotehub=void 0)),!e)return this._remotehubPromise;try{return await this._remotehubPromise}catch{return}}async ensureSession(e=!1){if(this._sessionPromise==null){async function t(){try{return e?await T.authentication.getSession("github",Oe,{forceNewSession:!0}):await T.authentication.getSession("github",Oe,{createIfNone:!0})}catch(r){throw r instanceof Error&&r.message.includes("User did not consent")?new L._7("github",L.Jx.UserDidNotConsent):(P.Y.error(r),new L._7("github",void 0,r))}}y(t,"getSession"),this._sessionPromise=t()}return this._sessionPromise}createVirtualUri(e,t,r){let l;if(typeof t=="string")t&&($.GitRevision.isSha(t)?l={v:1,ref:{id:t,type:2}}:l={v:1,ref:{id:t,type:4}});else switch(t?.refType){case"revision":case"stash":l={v:1,ref:{id:t.ref,type:2}};break;case"branch":case"tag":l={v:1,ref:{id:t.name,type:4}};break}if(typeof e=="string"&&(e=T.Uri.parse(e,!0)),r){let h=e.path;h.endsWith("/")&&(h=h.slice(0,-1)),r=this.getRelativePath(r,e),r=`${h}/${r.startsWith("/")?r.slice(0,-1):r}`}return e.with({scheme:H.sN.Virtual,authority:Ve("github",l),path:r??e.path})}createProviderUri(e,t,r){const l=this.createVirtualUri(e,t,r);return this._remotehub==null?l.scheme!==H.sN.Virtual?l:l.with({scheme:H.sN.GitHub}):this._remotehub.getProviderUri(l)}getPagingLimit(e){return e=Math.min(100,e??this.container.config.advanced.maxListItems??100),e===0&&(e=100),e}async resolveReferenceCore(e,t,r){var l,h;if(r==null||r==="HEAD")return(await t.getRevision()).revision;if($.GitRevision.isSha(r))return r;if($.GitRevision.isRange(r))return;const[d,v]=await Promise.allSettled([this.getBranches(e,{filter:m=>m.name===r}),this.getTags(e,{filter:m=>m.name===r})]);return r=(d.status==="fulfilled"?(l=d.value.values[0])==null?void 0:l.sha:void 0)??(v.status==="fulfilled"?(h=v.value.values[0])==null?void 0:h.sha:void 0),r==null,r}}y(b,"GitHubGitProvider"),S([(0,w.cM)()],b.prototype,"getBestRevisionUri",1),S([(0,w.cM)()],b.prototype,"getWorkingUri",1),S([(0,w.cM)()],b.prototype,"addRemote",1),S([(0,w.cM)()],b.prototype,"pruneRemote",1),S([(0,w.cM)()],b.prototype,"applyChangesToWorkingFile",1),S([(0,w.cM)()],b.prototype,"branchContainsCommit",1),S([(0,w.cM)()],b.prototype,"checkout",1),S([(0,w.cM)()],b.prototype,"resetCaches",1),S([(0,w.cM)({args:{1:O=>O.length}})],b.prototype,"excludeIgnoredUris",1),S([(0,w.cM)()],b.prototype,"fetch",1),S([(0,we.H)(),(0,w.fF)()],b.prototype,"findRepositoryUri",1),S([(0,w.cM)({args:{1:O=>O.join(",")}})],b.prototype,"getAheadBehindCommitCount",1),S([(0,we.H)(),(0,w.cM)()],b.prototype,"getBlame",1),S([(0,w.cM)({args:{1:"<contents>"}})],b.prototype,"getBlameContents",1),S([(0,we.H)(),(0,w.cM)()],b.prototype,"getBlameForLine",1),S([(0,w.cM)({args:{2:"<contents>"}})],b.prototype,"getBlameForLineContents",1),S([(0,w.cM)()],b.prototype,"getBlameForRange",1),S([(0,w.cM)({args:{2:"<contents>"}})],b.prototype,"getBlameForRangeContents",1),S([(0,w.cM)({args:{0:"<blame>"}})],b.prototype,"getBlameRange",1),S([(0,w.cM)()],b.prototype,"getBranch",1),S([(0,w.cM)({args:{1:!1}})],b.prototype,"getBranches",1),S([(0,w.cM)()],b.prototype,"getChangedFilesCount",1),S([(0,w.cM)()],b.prototype,"getCommit",1),S([(0,w.cM)()],b.prototype,"getCommitBranches",1),S([(0,w.cM)()],b.prototype,"getCommitCount",1),S([(0,w.cM)()],b.prototype,"getCommitForFile",1),S([(0,w.cM)()],b.prototype,"getOldestUnpushedRefForFile",1),S([(0,w.cM)()],b.prototype,"getContributors",1),S([(0,we.H)(),(0,w.cM)()],b.prototype,"getCurrentUser",1),S([(0,w.cM)()],b.prototype,"getDefaultBranchName",1),S([(0,w.cM)()],b.prototype,"getDiffForFile",1),S([(0,w.cM)({args:{1:O=>"<contents>"}})],b.prototype,"getDiffForFileContents",1),S([(0,w.cM)()],b.prototype,"getDiffForLine",1),S([(0,w.cM)()],b.prototype,"getDiffStatus",1),S([(0,w.cM)()],b.prototype,"getFileStatusForCommit",1),S([(0,w.cM)()],b.prototype,"getLog",1),S([(0,w.cM)()],b.prototype,"getLogRefsOnly",1),S([(0,w.cM)()],b.prototype,"getLogForSearch",1),S([(0,w.cM)()],b.prototype,"getLogForFile",1),S([(0,w.cM)()],b.prototype,"getMergeBase",1),S([(0,w.cM)()],b.prototype,"getMergeStatus",1),S([(0,w.cM)()],b.prototype,"getRebaseStatus",1),S([(0,w.cM)()],b.prototype,"getNextComparisonUris",1),S([(0,w.cM)()],b.prototype,"getPreviousComparisonUris",1),S([(0,w.cM)()],b.prototype,"getPreviousComparisonUrisForLine",1),S([(0,w.cM)()],b.prototype,"getIncomingActivity",1),S([(0,w.cM)({args:{1:!1}})],b.prototype,"getRemotes",1),S([(0,w.cM)()],b.prototype,"getRevisionContent",1),S([(0,w.cM)()],b.prototype,"getStash",1),S([(0,w.cM)()],b.prototype,"getStatusForFile",1),S([(0,w.cM)()],b.prototype,"getStatusForFiles",1),S([(0,w.cM)()],b.prototype,"getStatusForRepo",1),S([(0,w.cM)({args:{1:!1}})],b.prototype,"getTags",1),S([(0,w.cM)()],b.prototype,"getTreeEntryForRevision",1),S([(0,w.cM)()],b.prototype,"getTreeForRevision",1),S([(0,w.cM)()],b.prototype,"hasBranchOrTag",1),S([(0,w.cM)()],b.prototype,"hasCommitBeenPushed",1),S([(0,w.cM)()],b.prototype,"getDiffTool",1),S([(0,w.cM)()],b.prototype,"openDiffTool",1),S([(0,w.cM)()],b.prototype,"openDirectoryCompare",1),S([(0,w.cM)()],b.prototype,"resolveReference",1),S([(0,w.cM)()],b.prototype,"validateBranchOrTagName",1),S([(0,w.cM)()],b.prototype,"validateReference",1),S([(0,w.cM)()],b.prototype,"stageFile",1),S([(0,w.cM)()],b.prototype,"stageDirectory",1),S([(0,w.cM)()],b.prototype,"unStageFile",1),S([(0,w.cM)()],b.prototype,"unStageDirectory",1),S([(0,w.cM)()],b.prototype,"stashApply",1),S([(0,w.cM)()],b.prototype,"stashDelete",1),S([(0,w.cM)({args:{2:O=>O?.length}})],b.prototype,"stashSave",1),S([(0,we.H)()],b.prototype,"ensureRepositoryContext",1),S([(0,we.H)()],b.prototype,"ensureGitHub",1);function Ve(O,e){return`${O}${e!=null?`+${(0,te.e)(JSON.stringify(e))}`:""}`}y(Ve,"encodeAuthority")},778:(le,ue,E)=>{var T=E(2479);le.exports=T(te),le.exports.strict=T(J),te.proto=te(function(){Object.defineProperty(Function.prototype,"once",{value:function(){return te(this)},configurable:!0}),Object.defineProperty(Function.prototype,"onceStrict",{value:function(){return J(this)},configurable:!0})});function te(H){var V=y(function(){return V.called?V.value:(V.called=!0,V.value=H.apply(this,arguments))},"f");return V.called=!1,V}y(te,"once");function J(H){var V=y(function(){if(V.called)throw new Error(V.onceError);return V.called=!0,V.value=H.apply(this,arguments)},"f"),L=H.name||"Function wrapped with `once`";return V.onceError=L+" shouldn't be called more than once",V.called=!1,V}y(J,"onceStrict")},2479:le=>{le.exports=ue;function ue(E,T){if(E&&T)return ue(E)(T);if(typeof E!="function")throw new TypeError("need wrapper function");return Object.keys(E).forEach(function(J){te[J]=E[J]}),te;function te(){for(var J=new Array(arguments.length),H=0;H<J.length;H++)J[H]=arguments[H];var V=E.apply(this,J),L=J[J.length-1];return typeof V=="function"&&V!==L&&Object.keys(L).forEach(function(ge){V[ge]=L[ge]}),V}y(te,"wrapper")}y(ue,"wrappy")}};

//# sourceMappingURL=feature-github.js.map