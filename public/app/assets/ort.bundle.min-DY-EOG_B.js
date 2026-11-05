var l0=Object.defineProperty;var d0=(e,t,r)=>t in e?l0(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var $o=(e,t,r)=>d0(e,typeof t!="symbol"?t+"":t,r);/*!
 * ONNX Runtime Web v1.31.1
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */var Va=Object.defineProperty,p0=Object.getOwnPropertyDescriptor,c0=Object.getOwnPropertyNames,h0=Object.prototype.hasOwnProperty,f0=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),U=(e,t,r)=>()=>{if(r)throw r[0];try{return e&&(t=e(e=0)),t}catch(i){throw r=[i],i}},Yt=(e,t)=>{for(var r in t)Va(e,r,{get:t[r],enumerable:!0})},m0=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of c0(t))!h0.call(e,a)&&a!==r&&Va(e,a,{get:()=>t[a],enumerable:!(i=p0(t,a))||i.enumerable});return e},yr=e=>m0(Va({},"__esModule",{value:!0}),e),Ft,ut,ki,Kt,Ti,np,sp,Ga=U(()=>{"use strict";Ft=new Map,ut=[],ki=new WeakMap,Kt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=Ft.get(e);if(i===void 0)Ft.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=ut.indexOf(e);a!==-1&&ut.splice(a,1);for(let n=0;n<ut.length;n++)if(Ft.get(ut[n]).priority<=r){ut.splice(n,0,e);return}ut.push(e)}return}throw new TypeError("not a valid backend")},Ti=async e=>{let t=Ft.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{if(!r){let i=t.backend,a=ki.get(i);t.initPromise=a?a.then(async()=>i.init(e),async()=>i.init(e)):i.init(e),ki.set(i,t.initPromise)}return await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},np=async e=>{let t=e.executionProviders||[],r=t.map(l=>typeof l=="string"?l:l.name),i=r.length===0?ut:r,a,n=[],s=new Set;for(let l of i){let p=await Ti(l);typeof p=="string"?n.push({name:l,err:p}):(a||(a=p),a===p&&s.add(l))}if(!a)throw new Error(`no available backend found. ERR: ${n.map(l=>`[${l.name}] ${l.err}`).join(", ")}`);for(let{name:l,err:p}of n)r.includes(l)&&console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${p}`);let u=t.filter(l=>s.has(typeof l=="string"?l:l.name));return[a,new Proxy(e,{get:(l,p)=>p==="executionProviders"?u:Reflect.get(l,p)})]},sp=async()=>{let e=[];for(let r of ut){if(typeof Ft.get(r).backend.createLoraAdapterHandler!="function")continue;let i=await Ti(r);if(typeof i!="string")return i;e.push({name:r,err:i})}let t=e.length===0?"":` ERR: ${e.map(r=>`[${r.name}] ${r.err}`).join(", ")}`;throw new Error(`no available backend supports LoRA adapters.${t}`)}}),g0=U(()=>{"use strict";Ga()}),op,y0=U(()=>{"use strict";op="1.31.1"}),Ii,ze,up=U(()=>{"use strict";y0(),Ii="warning",ze={wasm:{},webgl:{},webgpu:{},versions:{common:op},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);Ii=e}},get logLevel(){return Ii}},Object.defineProperty(ze,"logLevel",{enumerable:!0})}),ve,_0=U(()=>{"use strict";up(),ve=ze}),jr,Ei,Ge,Le,Mt,Ut,Ha=U(()=>{"use strict";up(),jr=(e,t)=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.timeStamp(`${e}::ORT::${t}`)},Ei=(e,t)=>{var a;let r=((a=new Error().stack)==null?void 0:a.split(/\r\n|\r|\n/g))||[],i=!1;for(let n=0;n<r.length;n++){if(i&&!r[n].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[n].trim().split(" ")[1]}`;t&&(s+=`::${t}`),jr("CPU",s);return}r[n].includes("TRACE_FUNC")&&(i=!0)}},Ge=e=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||Ei("BEGIN",e)},Le=e=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||Ei("END",e)},Mt=e=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.time(`ORT::${e}`)},Ut=e=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.timeEnd(`ORT::${e}`)}}),Fa,lp=U(()=>{"use strict";Ga(),Ha(),Fa=class dp{constructor(t,r){this.backend=t,this.handler=r}static async create(t){if(Ge(),typeof t!="string"&&!(t instanceof Uint8Array))throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let r=await sp(),i=await r.createLoraAdapterHandler(t);return Le(),new dp(r,i)}async release(){return this.handler.dispose()}}}),pp,cp,w0=U(()=>{"use strict";pp=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,n;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[3]):(a=e.dims[3],n=e.dims[2]);let s=(t==null?void 0:t.format)!==void 0?t.format:"RGB",u=t==null?void 0:t.norm,l,p;u===void 0||u.mean===void 0?l=[255,255,255,255]:typeof u.mean=="number"?l=[u.mean,u.mean,u.mean,u.mean]:(l=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(l[3]=u.mean[3])),u===void 0||u.bias===void 0?p=[0,0,0,0]:typeof u.bias=="number"?p=[u.bias,u.bias,u.bias,u.bias]:(p=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(p[3]=u.bias[3]));let c=n*a,m=0,g=c,_=c*2,y=-1;s==="RGBA"?(m=0,g=c,_=c*2,y=c*3):s==="RGB"?(m=0,g=c,_=c*2):s==="RBG"&&(m=0,_=c,g=c*2);for(let x=0;x<n;x++)for(let S=0;S<a;S++){let $=(e.data[m++]-p[0])*l[0],w=(e.data[g++]-p[1])*l[1],k=(e.data[_++]-p[2])*l[2],I=y===-1?255:(e.data[y++]-p[3])*l[3];i.fillStyle="rgba("+$+","+w+","+k+","+I+")",i.fillRect(S,x,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},cp=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,n,s;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[1],s=e.dims[3]):(a=e.dims[3],n=e.dims[2],s=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",l=t==null?void 0:t.norm,p,c;l===void 0||l.mean===void 0?p=[255,255,255,255]:typeof l.mean=="number"?p=[l.mean,l.mean,l.mean,l.mean]:(p=[l.mean[0],l.mean[1],l.mean[2],255],l.mean[3]!==void 0&&(p[3]=l.mean[3])),l===void 0||l.bias===void 0?c=[0,0,0,0]:typeof l.bias=="number"?c=[l.bias,l.bias,l.bias,l.bias]:(c=[l.bias[0],l.bias[1],l.bias[2],0],l.bias[3]!==void 0&&(c[3]=l.bias[3]));let m=n*a;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let g=4,_=0,y=1,x=2,S=3,$=0,w=m,k=m*2,I=-1;u==="RGBA"?($=0,w=m,k=m*2,I=m*3):u==="RGB"?($=0,w=m,k=m*2):u==="RBG"&&($=0,k=m,w=m*2),i=r.createImageData(a,n);for(let E=0;E<n*a;_+=g,y+=g,x+=g,S+=g,E++)i.data[_]=(e.data[$++]-c[0])*p[0],i.data[y]=(e.data[w++]-c[1])*p[1],i.data[x]=(e.data[k++]-c[2])*p[2],i.data[S]=I===-1?255:(e.data[I++]-c[3])*p[3]}else throw new Error("Can not access image data");return i}}),Ar,hp,fp,mp,gp,yp,$0=U(()=>{"use strict";ja(),Ar=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},n,s;typeof a.mean=="number"?n=[a.mean,a.mean,a.mean,a.mean]:n=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?s=[a.bias,a.bias,a.bias,a.bias]:s=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",l=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",p=r*i,c=l==="RGBA"?new Float32Array(p*4):new Float32Array(p*3),m=4,g=0,_=1,y=2,x=3,S=0,$=p,w=p*2,k=-1;u==="RGB"&&(m=3,g=0,_=1,y=2,x=-1),l==="RGBA"?k=p*3:l==="RBG"?(S=0,w=p,$=p*2):l==="BGR"&&(w=0,$=p,S=p*2);for(let I=0;I<p;I++,g+=m,y+=m,_+=m,x+=m)c[S++]=(e[g]+s[0])/n[0],c[$++]=(e[_]+s[1])/n[1],c[w++]=(e[y]+s[2])/n[2],k!==-1&&x!==-1&&(c[k++]=(e[x]+s[3])/n[3]);return l==="RGBA"?new Pe("float32",c,[1,4,r,i]):new Pe("float32",c,[1,3,r,i])},hp=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,n=typeof e=="string",s,u=t??{},l=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},p=c=>typeof HTMLCanvasElement<"u"&&c instanceof HTMLCanvasElement||c instanceof OffscreenCanvas?c.getContext("2d"):null;if(r){let c=l();c.width=e.width,c.height=e.height;let m=p(c);if(m!=null){let g=e.height,_=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,_=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=_}else u.tensorFormat="RGBA",u.height=g,u.width=_;m.drawImage(e,0,0),s=m.getImageData(0,0,_,g).data}else throw new Error("Can not access image data")}else if(i){let c,m;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(c=t.resizedHeight,m=t.resizedWidth):(c=e.height,m=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=c,u.width=m,t!==void 0){let g=l();g.width=m,g.height=c;let _=p(g);if(_!=null)_.putImageData(e,0,0),s=_.getImageData(0,0,m,c).data;else throw new Error("Can not access image data")}else s=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let c=l();c.width=e.width,c.height=e.height;let m=p(c);if(m!=null){let g=e.height,_=e.width;return m.drawImage(e,0,0,_,g),s=m.getImageData(0,0,_,g).data,u.height=g,u.width=_,Ar(s,u)}else throw new Error("Can not access image data")}else{if(n)return new Promise((c,m)=>{let g=l(),_=p(g);if(!e||!_)return m();let y=new Image;y.crossOrigin="Anonymous",y.src=e,y.onload=()=>{g.width=y.width,g.height=y.height,_.drawImage(y,0,0,g.width,g.height);let x=_.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,c(Ar(x.data,u))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return Ar(s,u);throw new Error("Input data provided is not supported - aborted tensor creation")},fp=(e,t)=>{let{width:r,height:i,download:a,dispose:n}=t,s=[1,i,r,4];return new Pe({location:"texture",type:"float32",texture:e,dims:s,download:a,dispose:n})},mp=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Pe({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:n})},gp=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Pe({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:n})},yp=(e,t,r)=>new Pe({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),Rt,hr,Ci,_p,b0=U(()=>{"use strict";Rt=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),hr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),Ci=!1,_p=()=>{if(!Ci){Ci=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(Rt.set("int64",BigInt64Array),hr.set(BigInt64Array,"int64")),t&&(Rt.set("uint64",BigUint64Array),hr.set(BigUint64Array,"uint64")),i?(Rt.set("float16",r),hr.set(r,"float16")):Rt.set("float16",Uint16Array)}}}),wp,$p,v0=U(()=>{"use strict";ja(),wp=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},$p=(e,t)=>{switch(e.location){case"cpu":return new Pe(e.type,e.data,t);case"cpu-pinned":return new Pe({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Pe({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Pe({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Pe({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Pe,ja=U(()=>{"use strict";w0(),$0(),b0(),v0(),Pe=class{constructor(e,t,r){_p();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let s=Rt.get(i);if(!s)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw new TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,u;if(typeof e=="string")if(i=e,u=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");s=t}else{let l=Rt.get(e);if(l===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&l===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);e==="uint64"||e==="int64"?s=l.from(t,BigInt):s=l.from(t)}else if(t instanceof l)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&l!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${l}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let l=typeof e[0];if(l==="string")i="string",s=e;else if(l==="boolean")i="bool",s=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${l}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let l=hr.get(e.constructor);if(l===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=l,s=e}if(u===void 0)u=[s.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");a=u,this.cpuData=s,this.dataLocation="cpu"}let n=wp(a);if(this.cpuData&&n!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(n/2)===this.cpuData.length))throw new Error(`Tensor's size(${n}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=n}static async fromImage(e,t){return hp(e,t)}static fromTexture(e,t){return fp(e,t)}static fromGpuBuffer(e,t){return mp(e,t)}static fromMLTensor(e,t){return gp(e,t)}static fromPinnedBuffer(e,t,r){return yp(e,t,r)}toDataURL(e){return pp(this,e)}toImageData(e){return cp(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return $p(this,e)}}}),nt,bp=U(()=>{"use strict";ja(),nt=Pe}),vp,x0=U(()=>{"use strict";Ga(),lp(),bp(),Ha(),vp=class xp{constructor(t,r){this.handler=t,this.backend=r}async run(t,r,i){Ge(),Mt("InferenceSession.run");let a={},n={};if(typeof t!="object"||t===null||t instanceof nt||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof nt)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let c of r){if(typeof c!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(c)===-1)throw new RangeError(`'fetches' contains invalid output name: ${c}.`);a[c]=null}if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let c=!1,m=Object.getOwnPropertyNames(r);for(let g of this.outputNames)if(m.indexOf(g)!==-1){let _=r[g];(_===null||_ instanceof nt)&&(c=!0,s=!1,a[g]=_)}if(c){if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else n=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let c of this.inputNames)if(typeof t[c]>"u")throw new Error(`input '${c}' is missing in 'feeds'.`);if(s)for(let c of this.outputNames)a[c]=null;let u;if(n.activeLoraAdapters!==void 0){if(!Array.isArray(n.activeLoraAdapters))throw new TypeError("'activeLoraAdapters' must be an array.");u=n.activeLoraAdapters.map(c=>{if(!(c instanceof Fa))throw new TypeError("'activeLoraAdapters' must be an array of LoraAdapter objects.");if(c.backend!==this.backend)throw new Error("LoRA adapter was created by a different backend than the session.");return c.handler})}let l=await this.handler.run(t,a,n,u),p={};for(let c in l)if(Object.hasOwnProperty.call(l,c)){let m=l[c];m instanceof nt?p[c]=m:p[c]=new nt(m.type,m.data,m.dims)}return Ut("InferenceSession.run"),Le(),p}async release(){return this.handler.dispose()}static async create(t,r,i,a){Ge(),Mt("InferenceSession.create");let n,s={};if(typeof t=="string"){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let c=t,m=0,g=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(m=r,!Number.isSafeInteger(m))throw new RangeError("'byteOffset' must be an integer.");if(m<0||m>=c.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${c.byteLength}).`);if(g=t.byteLength-m,typeof i=="number"){if(g=i,!Number.isSafeInteger(g))throw new RangeError("'byteLength' must be an integer.");if(g<=0||m+g>c.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${c.byteLength-m}].`);if(typeof a=="object"&&a!==null)s=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");n=new Uint8Array(c,m,g)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,l]=await np(s),p=await u.createInferenceSessionHandler(n,l);return Ut("InferenceSession.create"),Le(),new xp(p,u)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),Sp,S0=U(()=>{"use strict";x0(),Sp=vp}),kp,k0=U(()=>{"use strict";lp(),kp=Fa}),T0=U(()=>{"use strict"}),I0=U(()=>{"use strict"}),E0=U(()=>{"use strict"}),C0=U(()=>{"use strict"}),Tp={};Yt(Tp,{InferenceSession:()=>Sp,LoraAdapter:()=>kp,TRACE:()=>jr,TRACE_EVENT_BEGIN:()=>Mt,TRACE_EVENT_END:()=>Ut,TRACE_FUNC_BEGIN:()=>Ge,TRACE_FUNC_END:()=>Le,Tensor:()=>nt,env:()=>ve,registerBackend:()=>Kt});var We=U(()=>{"use strict";g0(),_0(),S0(),k0(),bp(),T0(),I0(),Ha(),E0(),C0()}),Ka=U(()=>{"use strict"}),Ip={};Yt(Ip,{default:()=>Ep});var zi,Ai,Ep,z0=U(()=>{"use strict";var e;Uf(),Wt(),Za(),zi="ort-wasm-proxy-worker",Ai=((e=globalThis.self)==null?void 0:e.name)===zi,Ai&&(self.onmessage=t=>{let{type:r,in:i}=t.data;try{switch(r){case"init-wasm":Qa(i.wasm).then(()=>{fn(i).then(()=>{postMessage({type:r})},a=>{postMessage({type:r,err:a})})},a=>{postMessage({type:r,err:a})});break;case"init-ep":{let{epName:a,env:n}=i;mn(n,a).then(()=>{postMessage({type:r})},s=>{postMessage({type:r,err:s})});break}case"copy-from":{let{buffer:a}=i,n=ei(a);postMessage({type:r,out:n});break}case"create":{let{model:a,options:n}=i;gn(a,n).then(s=>{postMessage({type:r,out:s})},s=>{postMessage({type:r,err:s})});break}case"release":yn(i),postMessage({type:r});break;case"run":{let{sessionId:a,inputIndices:n,inputs:s,outputIndices:u,options:l}=i;_n(a,n,s,u,new Array(u.length).fill(null),l).then(p=>{p.some(c=>c[3]!=="cpu")?postMessage({type:r,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:r,out:p},$n([...s,...p]))},p=>{postMessage({type:r,err:p})});break}case"end-profiling":wn(i),postMessage({type:r});break;default:}}catch(a){postMessage({type:r,err:a})}}),Ep=Ai?null:t=>new Worker(t??Ue,{type:"module",name:zi})}),Cp={};Yt(Cp,{default:()=>zp});async function bo(e={}){var _o,wo;var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,a=i&&((_o=self.name)==null?void 0:_o.startsWith("em-pthread"));t.mountExternalData=(o,d)=>{o.startsWith("./")&&(o=o.substring(2)),(t.jd||(t.jd=new Map)).set(o,d)},t.unmountExternalData=()=>{delete t.jd,delete t.ke,delete t.je,delete t.le},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,shared:!0}).buffer.constructor;let n=o=>async(...d)=>{var f;try{if(t.hd)throw Error("Session already started");let h=t.hd={Vd:d[0],errors:[]},b=await o(...d);if(t.hd!==h)throw Error("Session mismatch");(f=t.pd)==null||f.flush();let T=h.errors;if(0<T.length){let z=await Promise.all(T);if(z=z.filter(N=>N),0<z.length)throw Error(z.join(`
`))}return b}finally{t.hd=null}};t.jsepInit=(o,d)=>{if(o==="webgpu"){[t.pd,t.Ld,t.Pd,t.rd,t.Od,t.ic,t.Qd,t.Sd,t.Md,t.Nd,t.Rd]=d;let f=t.pd;t.jsepRegisterBuffer=(h,b,T,z)=>f.registerBuffer(h,b,T,z),t.jsepGetBuffer=h=>f.getBuffer(h),t.jsepCreateDownloader=(h,b,T)=>f.createDownloader(h,b,T),t.jsepOnCreateSession=h=>{f.onCreateSession(h)},t.jsepOnReleaseSession=h=>{f.onReleaseSession(h)},t.jsepOnRunStart=h=>f.onRunStart(h),t.Td=(h,b)=>{f.upload(h,b)}}else if(o==="webnn"){let f=d[0];[t.ce,t.Cd,t.webnnEnsureTensor,t.Dd,t.webnnDownloadTensor,t.be,t.webnnEnableTraceEvent]=d.slice(1),t.webnnReleaseTensorId=t.Cd,t.webnnUploadTensor=t.Dd,t.webnnRegisterMLContext=t.be,t.webnnOnRunStart=h=>f.onRunStart(h),t.webnnOnRunEnd=f.onRunEnd.bind(f),t.webnnOnReleaseSession=h=>{f.onReleaseSession(h)},t.webnnCreateMLTensorDownloader=(h,b)=>f.createMLTensorDownloader(h,b),t.webnnRegisterMLTensor=(h,b,T,z)=>f.registerMLTensor(h,b,T,z),t.webnnCreateMLContext=h=>f.createMLContext(h),t.webnnRegisterGraphInput=f.registerGraphInput.bind(f),t.webnnIsGraphInput=f.isGraphInput.bind(f),t.webnnRegisterGraphOutput=f.registerGraphOutput.bind(f),t.webnnIsGraphOutput=f.isGraphOutput.bind(f),t.webnnCreateTemporaryTensor=f.createTemporaryTensor.bind(f),t.webnnIsGraphInputOutputTypeSupported=f.isGraphInputOutputTypeSupported.bind(f)}};let s=()=>{let o=d=>(...f)=>{let h=tt;return f=d(...f),tt!=h?new Promise((b,T)=>{ci={resolve:b,reject:T}}):f};(d=>{for(let f of d)t[f]=o(t[f])})("_OrtAppendExecutionProvider _OrtAppendExecutionProviderV2 _OrtCreateSession _OrtRun _OrtRunWithBinding _OrtBindInput".split(" ")),n!==void 0&&(t._OrtRun=n(t._OrtRun),t._OrtRunWithBinding=n(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s==null||s()};var u,l,p=(o,d)=>{throw d},c=import.meta.url,m="";if(r||i){try{m=new URL(".",c).href}catch{}i&&(l=o=>{var d=new XMLHttpRequest;return d.open("GET",o,!1),d.responseType="arraybuffer",d.send(null),new Uint8Array(d.response)}),u=async o=>{if(A(o))return new Promise((f,h)=>{var b=new XMLHttpRequest;b.open("GET",o,!0),b.responseType="arraybuffer",b.onload=()=>{b.status==200||b.status==0&&b.response?f(b.response):h(b.status)},b.onerror=h,b.send(null)});var d=await fetch(o,{credentials:"same-origin"});if(d.ok)return d.arrayBuffer();throw Error(d.status+" : "+d.url)}}var g,_,y,x,S,$,w=console.log.bind(console),k=console.error.bind(console),I=w,E=k,C=!1,A=o=>o.startsWith("file://");function v(){ht.buffer!=P.buffer&&K()}if(a){let o=function(d){try{var f=d.data,h=f.bd;if(h==="load"){let b=[];self.onmessage=T=>b.push(T),$=()=>{postMessage({bd:"loaded"});for(let T of b)o(T);self.onmessage=o};for(let T of f.Hd)t[T]&&!t[T].proxy||(t[T]=(...z)=>{postMessage({bd:"callHandler",Fd:T,args:z})},T=="print"&&(I=t[T]),T=="printErr"&&(E=t[T]));ht=f.Zd,K(),_=f.$d,$e(),zr()}else if(h==="run"){(function(b){var T=(v(),j)[b+52>>>2>>>0];b=(v(),j)[b+56>>>2>>>0],ks(T,T-b),se(T)})(f.ad),yi(f.ad,0,0,1,0,0),kn(),li(f.ad),M||(ws(),M=!0);try{Jf(f.Xd,f.nd)}catch(b){if(b!="unwind")throw b}}else f.target!=="setimmediate"&&(h==="checkMailbox"?M&&xr():h&&(E(`worker: received unknown command ${h}`),E(f)))}catch(b){throw $s(),b}};var M=!1;self.onunhandledrejection=d=>{throw d.reason||d},self.onmessage=o}var P,G,W,H,B,j,Y,ee,re,J,ye,R=!1;function K(){var o=ht.buffer;t.HEAP8=P=new Int8Array(o),W=new Int16Array(o),t.HEAPU8=G=new Uint8Array(o),H=new Uint16Array(o),t.HEAP32=B=new Int32Array(o),t.HEAPU32=j=new Uint32Array(o),Y=new Float32Array(o),ee=new Float64Array(o),re=new BigInt64Array(o),J=new BigUint64Array(o)}function X(){R=!0,a?$():ot.vb()}function L(o){throw E(o="Aborted("+o+")"),C=!0,o=new WebAssembly.RuntimeError(o+". Build with -sASSERTIONS for more info."),S==null||S(o),o}function _e(){return{a:{na:vg,jb:bg,g:em,G:tm,f:rm,o:im,h:am,$:nm,b:sm,S:om,Ja:An,n:um,aa:Nn,_a:Dn,Fa:Mn,Ha:Un,$a:Pn,Ya:Ln,Ra:qn,Xa:Wn,la:Vn,Ga:Gn,Da:Hn,Za:Fn,Ea:jn,eb:lm,ga:dm,ya:pm,wa:hm,fa:mm,N:gm,I:ym,xa:_m,_:km,za:Tm,Ua:Im,Ba:Cm,Ka:zm,ua:Am,ha:Om,Ta:li,bb:Bm,Q:Mm,r:Wm,c:oi,kb:Vm,y:Gm,M:Hm,D:Fm,m:jm,s:ts,lb:Km,J:Zm,R:Qm,j:Xm,u:Ym,q:Jm,k:eg,Oa:tg,Pa:rg,Qa:ig,Ma:ns,Na:ss,va:os,gb:ng,db:og,v:ug,ba:lg,ia:dg,cb:sg,V:pg,ab:cg,Ca:hg,F:ag,U:fg,ma:Er,Aa:gg,ib:mg,hb:yg,Va:ps,Wa:cs,Ia:Me,T:hs,La:fs,ka:ms,Sa:gs,ja:ys,nb:s0,oa:t0,ob:n0,pa:e0,H:Vg,e:Tg,t:Sg,w:xg,B:Mg,pb:Xg,Z:Qg,x:zg,qa:Yg,X:r0,ca:Zg,qb:Kg,ea:Eg,O:Ug,sb:Hg,ra:jg,tb:Gg,L:qg,Y:Jg,d:kg,A:Cg,l:Ig,mb:o0,p:Og,z:Bg,C:Ag,E:Rg,K:Pg,sa:Wg,P:i0,da:Lg,W:a0,ub:Dg,ta:Ng,rb:Fg,i:wg,a:ht,fb:Te}}}async function $e(){function o(h,b){var T=ot=h.exports;h={};for(let[z,N]of Object.entries(T))typeof N=="function"?(T=Rm(N),h[z]=T):h[z]=N;return ot=h,ot=(function(){var z=ot,N=V=>ne=>V(ne)>>>0,q=V=>()=>V()>>>0;return(z=Object.assign({},z)).wb=N(z.wb),z.ec=q(z.ec),z.gc=N(z.gc),z.uc=N(z.uc),z.vc=q(z.vc),z.zc=N(z.zc),z})(),xn.push(ot.hc),_s=(h=ot).wb,ws=h.xb,t._OrtInit=h.yb,t._OrtGetLastError=h.zb,t._OrtCreateSessionOptions=h.Ab,t._OrtAppendExecutionProvider=h.Bb,t._OrtGetEpDevices=h.Cb,t._OrtEpDevice_EpName=h.Db,t._OrtAppendExecutionProviderV2=h.Eb,t._OrtAddFreeDimensionOverride=h.Fb,t._OrtAddSessionConfigEntry=h.Gb,t._OrtReleaseSessionOptions=h.Hb,t._OrtCreateSession=h.Ib,t._OrtReleaseSession=h.Jb,t._OrtGetInputOutputCount=h.Kb,t._OrtGetInputOutputMetadata=h.Lb,t._OrtFree=h.Mb,t._OrtCreateTensor=h.Nb,t._OrtGetTensorData=h.Ob,t._OrtReleaseTensor=h.Pb,t._OrtCreateLoraAdapter=h.Qb,t._OrtReleaseLoraAdapter=h.Rb,t._OrtCreateRunOptions=h.Sb,t._OrtAddRunConfigEntry=h.Tb,t._OrtRunOptionsAddActiveLoraAdapter=h.Ub,t._OrtReleaseRunOptions=h.Vb,t._OrtCreateBinding=h.Wb,t._OrtBindInput=h.Xb,t._OrtBindOutput=h.Yb,t._OrtClearBoundOutputs=h.Zb,t._OrtReleaseBinding=h._b,t._OrtRunWithBinding=h.$b,t._OrtRun=h.ac,t._OrtEndProfiling=h.bc,t._JsepOutput=h.cc,t._JsepGetNodeName=h.dc,Cr=h.ec,rt=t._free=h.fc,er=t._malloc=h.gc,yi=h.jc,$s=h.kc,bs=h.lc,vs=h.mc,_i=h.nc,xs=h.oc,Ss=h.pc,ue=h.qc,tr=h.rc,ks=h.sc,se=h.tc,wi=h.uc,oe=h.vc,Ts=h.wc,$i=h.xc,Is=h.yc,Es=h.zc,Cs=h.Ac,bi=h.Bc,zs=h.Cc,As=h.Dc,Os=h.Ec,Bs=h.Fc,Rs=h.Gc,Ns=h.Hc,Ds=h.Ic,Ms=h.Jc,Us=h.Kc,Ps=h.Lc,Ls=h.Mc,qs=h.Nc,Ws=h.Oc,Vs=h.Pc,Gs=h.Qc,Hs=h.Rc,Fs=h.Sc,js=h.Tc,Ks=h.Uc,Zs=h.Vc,Qs=h.Wc,Xs=h.Xc,Ys=h.Yc,Js=h._c,eo=h.$c,to=h.kd,ro=h.ld,io=h.qd,ao=h.vd,no=h.wd,so=h.xd,oo=h.yd,uo=h.zd,lo=h.Ad,po=h.Bd,co=h.Gd,ho=h.Jd,fo=h.fe,mo=h.ge,go=h.he,yo=h.ie,_=b,ot}var d,f=_e();return t.instantiateWasm?new Promise(h=>{t.instantiateWasm(f,(b,T)=>{h(o(b,T))})}):a?o(new WebAssembly.Instance(_,_e()),_):(ye??(ye=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",m):m+"ort-wasm-simd-threaded.jsep.wasm":new URL("/projeto54900/public/app/assets/ort-wasm-simd-threaded.jsep-Dt5UNR3U.wasm",import.meta.url).href),d=await(async function(h){var b=ye;if(!g&&!A(b))try{var T=fetch(b,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(T,h)}catch(z){E(`wasm streaming compile failed: ${z}`),E("falling back to ArrayBuffer instantiation")}return(async function(z,N){try{var q=await(async function(V){if(!g)try{var ne=await u(V);return new Uint8Array(ne)}catch{}if(V==ye&&g)V=new Uint8Array(g);else{if(!l)throw"both async and sync fetching of the wasm failed";V=l(V)}return V})(z);return await WebAssembly.instantiate(q,N)}catch(V){E(`failed to asynchronously prepare wasm: ${V}`),L(V)}})(b,h)})(f),o(d.instance,d.module))}class me{constructor(d){$o(this,"name","ExitStatus");this.message=`Program terminated with exit(${d})`,this.status=d}}var Re=o=>{o.terminate(),o.onmessage=()=>{}},Oe=[],vt=0,xt=null,He=o=>{Je.length==0&&(In(),Tn(Je[0]));var d=Je.pop();if(!d)return 6;St.push(d),kt[o.ad]=d,d.ad=o.ad;var f={bd:"run",Xd:o.Wd,nd:o.nd,ad:o.ad};return d.postMessage(f,o.ud),0},Be=0,fe=(o,d,...f)=>{var h,b=16*f.length,T=oe(),z=wi(b),N=z>>>3;for(h of f)typeof h=="bigint"?((v(),re)[N++>>>0]=1n,(v(),re)[N++>>>0]=h):((v(),re)[N++>>>0]=0n,(v(),ee)[N++>>>0]=h);return o=bs(o,0,b,z,d),se(T),o};function Te(o){if(a)return fe(0,1,o);if(y=o,!(0<Be)){for(var d of St)Re(d);for(d of Je)Re(d);Je=[],St=[],kt={},C=!0}p(0,new me(o))}function xe(o){if(a)return fe(1,0,o);Me(o)}var Me=o=>{if(y=o,a)throw xe(o),"unwind";Te(o)},Je=[],St=[],xn=[],kt={},Sn=o=>{var d=o.ad;delete kt[d],Je.push(o),St.splice(St.indexOf(o),1),o.ad=0,vs(d)};function kn(){xn.forEach(o=>o())}var Tn=o=>new Promise(d=>{o.onmessage=b=>{var T=b.data;if(b=T.bd,T.md&&T.md!=Cr()){var z=kt[T.md];z?z.postMessage(T,T.ud):E(`Internal error! Worker sent a message "${b}" to target pthread ${T.md}, but that thread no longer exists!`)}else b==="checkMailbox"?xr():b==="spawnThread"?He(T):b==="cleanupThread"?vr(()=>{Sn(kt[T.Yd])}):b==="loaded"?(o.loaded=!0,d(o)):T.target==="setimmediate"?o.postMessage(T):b==="uncaughtException"?o.onerror(T.error):b==="callHandler"?t[T.Fd](...T.args):b&&E(`worker sent an unknown command ${b}`)},o.onerror=b=>{throw E(`worker sent an error! ${b.filename}:${b.lineno}: ${b.message}`),b};var f,h=[];for(f of[])t.propertyIsEnumerable(f)&&h.push(f);o.postMessage({bd:"load",Hd:h,Zd:ht,$d:_})});function In(){var o=new Worker((()=>{let d=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new d("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});Je.push(o)}var ht,Jf=(o,d)=>{Be=0,o=bi(o,d),0<Be?y=o:_i(o)},wr=[],$r=0;function em(o){var d=new ii(o>>>=0);return(v(),P)[d.cd+12>>>0]==0&&(En(d,!0),$r--),Cn(d,!1),wr.push(d),Es(o)}var Gt=0,tm=()=>{ue(0,0);var o=wr.pop();Ts(o.od),Gt=0};function En(o,d){d=d?1:0,(v(),P)[o.cd+12>>>0]=d}function Cn(o,d){d=d?1:0,(v(),P)[o.cd+13>>>0]=d}class ii{constructor(d){this.od=d,this.cd=d-24}}var ai=o=>{var d=Gt;if(!d)return tr(0),0;var f=new ii(d);(v(),j)[f.cd+16>>>2>>>0]=d;var h=(v(),j)[f.cd+4>>>2>>>0];if(!h)return tr(0),d;for(var b of o){if(b===0||b===h)break;if(Is(b,h,f.cd+16))return tr(b),d}return tr(h),d};function rm(){return ai([])}function im(o){return ai([o>>>0])}function am(o,d,f,h){return ai([o>>>0,d>>>0,f>>>0,h>>>0])}var nm=()=>{var o=wr.pop();o||L("no exception to throw");var d=o.od;throw(v(),P)[o.cd+13>>>0]==0&&(wr.push(o),Cn(o,!0),En(o,!1),$r++),$i(d),Gt=d};function sm(o,d,f){var h=new ii(o>>>=0);throw d>>>=0,f>>>=0,(v(),j)[h.cd+16>>>2>>>0]=0,(v(),j)[h.cd+4>>>2>>>0]=d,(v(),j)[h.cd+8>>>2>>>0]=f,$i(o),$r++,Gt=o}var om=()=>$r;function zn(o,d,f,h){return a?fe(2,1,o,d,f,h):An(o,d,f,h)}function An(o,d,f,h){if(o>>>=0,d>>>=0,f>>>=0,h>>>=0,!globalThis.SharedArrayBuffer)return 6;var b=[];return a&&b.length===0?zn(o,d,f,h):(o={Wd:f,ad:o,nd:h,ud:b},a?(o.bd="spawnThread",postMessage(o,b),0):He(o))}function um(o){throw Gt||(Gt=o>>>0),Gt}var On=globalThis.TextDecoder&&new TextDecoder,Bn=(o,d,f,h)=>{if(f=d+f,h)return f;for(;o[d]&&!(d>=f);)++d;return d},Rn=(o,d=0,f,h)=>{if(16<(f=Bn(o,d>>>=0,f,h))-d&&o.buffer&&On)return On.decode(o.buffer instanceof ArrayBuffer?o.subarray(d,f):o.slice(d,f));for(h="";d<f;){var b=o[d++];if(128&b){var T=63&o[d++];if((224&b)==192)h+=String.fromCharCode((31&b)<<6|T);else{var z=63&o[d++];65536>(b=(240&b)==224?(15&b)<<12|T<<6|z:(7&b)<<18|T<<12|z<<6|63&o[d++])?h+=String.fromCharCode(b):(b-=65536,h+=String.fromCharCode(55296|b>>10,56320|1023&b))}}else h+=String.fromCharCode(b)}return h},Ie=(o,d,f)=>(o>>>=0)?Rn((v(),G),o,d,f):"";function Nn(o,d,f){return a?fe(3,1,o,d,f):0}function Dn(o,d){if(a)return fe(4,1,o,d)}function Mn(o,d){if(a)return fe(5,1,o,d)}function Un(o,d,f){if(a)return fe(6,1,o,d,f)}function Pn(o,d,f){return a?fe(7,1,o,d,f):0}function Ln(o,d){if(a)return fe(8,1,o,d)}function qn(o,d,f){if(a)return fe(9,1,o,d,f)}function Wn(o,d,f,h){if(a)return fe(10,1,o,d,f,h)}function Vn(o,d,f,h){if(a)return fe(11,1,o,d,f,h)}function Gn(o,d,f,h){if(a)return fe(12,1,o,d,f,h)}function Hn(o){if(a)return fe(13,1,o)}function Fn(o,d){if(a)return fe(14,1,o,d)}function jn(o,d,f){if(a)return fe(15,1,o,d,f)}var lm=()=>L(""),et=o=>{o>>>=0;for(var d="";;){var f=(v(),G)[o++>>>0];if(!f)return d;d+=String.fromCharCode(f)}},ni={},si={},Ht=class extends Error{constructor(o){super(o),this.name="BindingError"}};function st(o,d,f={}){return(function(h,b,T={}){var z=b.name;if(!h)throw new Ht(`type "${z}" must have a positive integer typeid pointer`);if(si.hasOwnProperty(h)){if(T.Id)return;throw new Ht(`Cannot register type '${z}' twice`)}si[h]=b,ni.hasOwnProperty(h)&&(b=ni[h],delete ni[h],b.forEach(N=>N()))})(o,d,f)}var Kn=(o,d,f)=>{switch(d){case 1:return f?h=>(v(),P)[h>>>0]:h=>(v(),G)[h>>>0];case 2:return f?h=>(v(),W)[h>>>1>>>0]:h=>(v(),H)[h>>>1>>>0];case 4:return f?h=>(v(),B)[h>>>2>>>0]:h=>(v(),j)[h>>>2>>>0];case 8:return f?h=>(v(),re)[h>>>3>>>0]:h=>(v(),J)[h>>>3>>>0];default:throw new TypeError(`invalid integer width (${d}): ${o}`)}};function dm(o,d,f,h,b){o>>>=0,f>>>=0,d=et(d>>>0);let T=z=>z;if(h=h===0n){let z=8*f;T=N=>BigInt.asUintN(z,N),b=T(b)}st(o,{name:d,Zc:T,ed:(z,N)=>(typeof N=="number"&&(N=BigInt(N)),N),dd:Kn(d,f,!h),gd:null})}function pm(o,d,f,h){st(o>>>=0,{name:d=et(d>>>0),Zc:function(b){return!!b},ed:function(b,T){return T?f:h},dd:function(b){return this.Zc((v(),G)[b>>>0])},gd:null})}var Zn=[],Tt=[0,1,,1,null,1,!0,1,!1,1];function oi(o){9<(o>>>=0)&&--Tt[o+1]===0&&(Tt[o]=void 0,Zn.push(o))}var Ve=o=>{if(!o)throw new Ht(`Cannot use deleted val. handle = ${o}`);return Tt[o]},Fe=o=>{switch(o){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let d=Zn.pop()||Tt.length;return Tt[d]=o,Tt[d+1]=1,d}};function ui(o){return this.Zc((v(),j)[o>>>2>>>0])}var cm={name:"emscripten::val",Zc:o=>{var d=Ve(o);return oi(o),d},ed:(o,d)=>Fe(d),dd:ui,gd:null};function hm(o){return st(o>>>0,cm)}var fm=(o,d)=>{switch(d){case 4:return function(f){return this.Zc((v(),Y)[f>>>2>>>0])};case 8:return function(f){return this.Zc((v(),ee)[f>>>3>>>0])};default:throw new TypeError(`invalid float width (${d}): ${o}`)}};function mm(o,d,f){f>>>=0,st(o>>>=0,{name:d=et(d>>>0),Zc:h=>h,ed:(h,b)=>b,dd:fm(d,f),gd:null})}function gm(o,d,f,h,b){o>>>=0,f>>>=0,d=et(d>>>0);let T=N=>N;if(h===0){var z=32-8*f;T=N=>N<<z>>>z,b=T(b)}st(o,{name:d,Zc:T,ed:(N,q)=>q,dd:Kn(d,f,h!==0),gd:null})}function ym(o,d,f){function h(T){var z=(v(),j)[T>>>2>>>0];return T=(v(),j)[T+4>>>2>>>0],new b((v(),P).buffer,T,z)}var b=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][d];st(o>>>=0,{name:f=et(f>>>0),Zc:h,dd:h},{Id:!0})}var ft=(o,d,f)=>{var h=(v(),G);if(d>>>=0,0<f){var b=d;f=d+f-1;for(var T=0;T<o.length;++T){var z=o.codePointAt(T);if(127>=z){if(d>=f)break;h[d++>>>0]=z}else if(2047>=z){if(d+1>=f)break;h[d++>>>0]=192|z>>6,h[d++>>>0]=128|63&z}else if(65535>=z){if(d+2>=f)break;h[d++>>>0]=224|z>>12,h[d++>>>0]=128|z>>6&63,h[d++>>>0]=128|63&z}else{if(d+3>=f)break;h[d++>>>0]=240|z>>18,h[d++>>>0]=128|z>>12&63,h[d++>>>0]=128|z>>6&63,h[d++>>>0]=128|63&z,T++}}h[d>>>0]=0,o=d-b}else o=0;return o},br=o=>{for(var d=0,f=0;f<o.length;++f){var h=o.charCodeAt(f);127>=h?d++:2047>=h?d+=2:55296<=h&&57343>=h?(d+=4,++f):d+=3}return d};function _m(o,d){st(o>>>=0,{name:d=et(d>>>0),Zc(f){var h=(v(),j)[f>>>2>>>0];return h=Ie(f+4,h,!0),rt(f),h},ed(f,h){h instanceof ArrayBuffer&&(h=new Uint8Array(h));var b=typeof h=="string";if(!(b||ArrayBuffer.isView(h)&&h.BYTES_PER_ELEMENT==1))throw new Ht("Cannot pass non-string to std::string");var T=b?br(h):h.length,z=er(4+T+1),N=z+4;return(v(),j)[z>>>2>>>0]=T,b?ft(h,N,T+1):(v(),G).set(h,N>>>0),f!==null&&f.push(rt,z),z},dd:ui,gd(f){rt(f)}})}var Qn=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,wm=(o,d,f)=>{if(o>>>=1,16<(d=Bn((v(),H),o,d/2,f))-o&&Qn)return Qn.decode((v(),H).slice(o,d));for(f="";o<d;++o){var h=(v(),H)[o>>>0];f+=String.fromCharCode(h)}return f},$m=(o,d,f)=>{if(f??(f=2147483647),2>f)return 0;var h=d;f=(f-=2)<2*o.length?f/2:o.length;for(var b=0;b<f;++b){var T=o.charCodeAt(b);(v(),W)[d>>>1>>>0]=T,d+=2}return(v(),W)[d>>>1>>>0]=0,d-h},bm=o=>2*o.length,vm=(o,d,f)=>{var h="";o>>>=2;for(var b=0;!(b>=d/4);b++){var T=(v(),j)[o+b>>>0];if(!T&&!f)break;h+=String.fromCodePoint(T)}return h},xm=(o,d,f)=>{if(d>>>=0,f??(f=2147483647),4>f)return 0;var h=d;f=h+f-4;for(var b=0;b<o.length;++b){var T=o.codePointAt(b);if(65535<T&&b++,(v(),B)[d>>>2>>>0]=T,(d+=4)+4>f)break}return(v(),B)[d>>>2>>>0]=0,d-h},Sm=o=>{for(var d=0,f=0;f<o.length;++f)65535<o.codePointAt(f)&&f++,d+=4;return d};function km(o,d,f){if(o>>>=0,d>>>=0,f=et(f>>>=0),d===2)var h=wm,b=$m,T=bm;else h=vm,b=xm,T=Sm;st(o,{name:f,Zc:z=>{var N=(v(),j)[z>>>2>>>0];return N=h(z+4,N*d,!0),rt(z),N},ed:(z,N)=>{if(typeof N!="string")throw new Ht(`Cannot pass non-string to C++ string type ${f}`);var q=T(N),V=er(4+q+d);return(v(),j)[V>>>2>>>0]=q/d,b(N,V+4,q+d),z!==null&&z.push(rt,V),V},dd:ui,gd(z){rt(z)}})}function Tm(o,d){st(o>>>=0,{Kd:!0,name:d=et(d>>>0),Zc:()=>{},ed:()=>{}})}function Im(o){yi(o>>>0,!i,1,!r,131072,!1),kn()}var vr=o=>{if(!C)try{if(o(),!(0<Be))try{a?Cr()&&_i(y):Me(y)}catch(d){d instanceof me||d=="unwind"||p(0,d)}}catch(d){d instanceof me||d=="unwind"||p(0,d)}},Em=!Atomics.waitAsync||((wo=globalThis.navigator)==null?void 0:wo.userAgent)&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function li(o){o>>>=0,Em||(Atomics.waitAsync((v(),B),o>>>2,o).value.then(xr),o+=128,Atomics.store((v(),B),o>>>2,1))}var xr=()=>vr(()=>{var o=Cr();o&&(li(o),Ss())});function Cm(o,d){(o>>>=0)==d>>>0?setTimeout(xr):a?postMessage({md:o,bd:"checkMailbox"}):(o=kt[o])&&o.postMessage({bd:"checkMailbox"})}var di=[];function zm(o,d,f,h,b){for(d>>>=0,b>>>=0,di.length=0,f=b>>>3,h=b+h>>>3;f<h;){var T;T=(v(),re)[f++>>>0]?(v(),re)[f++>>>0]:(v(),ee)[f++>>>0],di.push(T)}return(d?vi[d]:$g[o])(...di)}var Am=()=>{Be=0};function Om(o){o>>>=0,a?postMessage({bd:"cleanupThread",Yd:o}):Sn(kt[o])}function Bm(o){}var Sr=o=>{try{o()}catch(d){L(d)}};function Rm(o){var d=(...f)=>{kr.push(o);try{return o(...f)}finally{C||(kr.pop(),tt&&mt===1&&kr.length===0&&(mt=0,Be+=1,Sr(mo),typeof Fibers<"u"&&Fibers.ne()))}};return Jn.set(o,d),d}var mt=0,tt=null,Xn=0,kr=[],pi=new Map,Yn=new Map,Jn=new Map,Nm=0,ci=null,Dm=[],es=o=>(function(d){if(!C){if(mt===0){var f=!1,h=!1;d((b=0)=>{if(!C&&(Xn=b,f=!0,h)){mt=2,Sr(()=>go(tt)),typeof MainLoop<"u"&&MainLoop.Ed&&MainLoop.resume(),b=!1;try{var T=(function(){var q=(v(),B)[tt+8>>>2>>>0];return q=Yn.get(q),q=Jn.get(q),--Be,q()})()}catch(q){T=q,b=!0}var z=!1;if(!tt){var N=ci;N&&(ci=null,(b?N.reject:N.resolve)(T),z=!0)}if(b&&!z)throw T}}),h=!0,f||(mt=1,tt=(function(){var b=er(65548),T=b+12;if((v(),j)[b>>>2>>>0]=T,(v(),j)[b+4>>>2>>>0]=T+65536,T=kr[0],!pi.has(T)){var z=Nm++;pi.set(T,z),Yn.set(z,T)}return T=pi.get(T),(v(),B)[b+8>>>2>>>0]=T,b})(),typeof MainLoop<"u"&&MainLoop.Ed&&MainLoop.pause(),Sr(()=>fo(tt)))}else mt===2?(mt=0,Sr(yo),rt(tt),tt=null,Dm.forEach(vr)):L(`invalid state: ${mt}`);return Xn}})(d=>{o().then(d)});function Mm(o){return o>>>=0,es(async()=>{var d=await Ve(o);return Fe(d)})}var hi=[],Um=o=>{var d=hi.length;return hi.push(o),d},Pm=(o,d)=>{for(var f=Array(o),h=0;h<o;++h){var b=h,T=(v(),j)[d+4*h>>>2>>>0],z=si[T];if(z===void 0)throw o=`parameter ${h}`,T=_s(T),d=et(T),rt(T),new Ht(`${o} has unknown type ${d}`);f[b]=z}return f},Lm=(o,d,f)=>{var h=[];return o=o(h,f),h.length&&((v(),j)[d>>>2>>>0]=Fe(h)),o},qm={},Tr=o=>{var d=qm[o];return d===void 0?et(o):d};function Wm(o,d,f){var[h,...b]=Pm(o,d>>>0);d=h.ed.bind(h);var T=b.map(q=>q.dd.bind(q));o--;var z={toValue:Ve};switch(o=T.map((q,V)=>{var ne=`argFromPtr${V}`;return z[ne]=q,`${ne}(args${V?"+"+8*V:""})`}),f){case 0:var N="toValue(handle)";break;case 2:N="new (toValue(handle))";break;case 3:N="";break;case 1:z.getStringOrSymbol=Tr,N="toValue(handle)[getStringOrSymbol(methodName)]"}return N+=`(${o})`,h.Kd||(z.toReturnWire=d,z.emval_returnValue=Lm,N=`return emval_returnValue(toReturnWire, destructorsRef, ${N})`),N=`return function (handle, methodName, destructorsRef, args) {
  ${N}
  }`,f=new Function(Object.keys(z),N)(...Object.values(z)),N=`methodCaller<(${b.map(q=>q.name)}) => ${h.name}>`,Um(Object.defineProperty(f,"name",{value:N}))}function Vm(o,d){return d>>>=0,(o=Ve(o>>>0))==Ve(d)}function Gm(o){return(o>>>=0)?(o=Tr(o),Fe(globalThis[o])):Fe(globalThis)}function Hm(o){return o=Tr(o>>>0),Fe(t[o])}function Fm(o,d){return d>>>=0,o=Ve(o>>>0),d=Ve(d),Fe(o[d])}function jm(o){9<(o>>>=0)&&(Tt[o+1]+=1)}function ts(o,d,f,h,b){return hi[o>>>0](d>>>0,f>>>0,h>>>0,b>>>0)}function Km(o,d,f,h,b){return ts(o>>>0,d>>>0,f>>>0,h>>>0,b>>>0)}function Zm(){return Fe([])}function Qm(o){o=Ve(o>>>0);for(var d=Array(o.length),f=0;f<o.length;f++)d[f]=o[f];return Fe(d)}function Xm(o){return Fe(Tr(o>>>0))}function Ym(){return Fe({})}function Jm(o){for(var d=Ve(o>>>=0);d.length;){var f=d.pop();d.pop()(f)}oi(o)}function eg(o,d,f){d>>>=0,f>>>=0,o=Ve(o>>>0),d=Ve(d),f=Ve(f),o[d]=f}function tg(o,d){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),d>>>=0,o=new Date(1e3*o),(v(),B)[d>>>2>>>0]=o.getUTCSeconds(),(v(),B)[d+4>>>2>>>0]=o.getUTCMinutes(),(v(),B)[d+8>>>2>>>0]=o.getUTCHours(),(v(),B)[d+12>>>2>>>0]=o.getUTCDate(),(v(),B)[d+16>>>2>>>0]=o.getUTCMonth(),(v(),B)[d+20>>>2>>>0]=o.getUTCFullYear()-1900,(v(),B)[d+24>>>2>>>0]=o.getUTCDay(),o=(o.getTime()-Date.UTC(o.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,(v(),B)[d+28>>>2>>>0]=o}var rs=o=>o%4==0&&(o%100!=0||o%400==0),is=[0,31,60,91,121,152,182,213,244,274,305,335],as=[0,31,59,90,120,151,181,212,243,273,304,334];function rg(o,d){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),d>>>=0,o=new Date(1e3*o),(v(),B)[d>>>2>>>0]=o.getSeconds(),(v(),B)[d+4>>>2>>>0]=o.getMinutes(),(v(),B)[d+8>>>2>>>0]=o.getHours(),(v(),B)[d+12>>>2>>>0]=o.getDate(),(v(),B)[d+16>>>2>>>0]=o.getMonth(),(v(),B)[d+20>>>2>>>0]=o.getFullYear()-1900,(v(),B)[d+24>>>2>>>0]=o.getDay();var f=(rs(o.getFullYear())?is:as)[o.getMonth()]+o.getDate()-1|0;(v(),B)[d+28>>>2>>>0]=f,(v(),B)[d+36>>>2>>>0]=-60*o.getTimezoneOffset(),f=new Date(o.getFullYear(),6,1).getTimezoneOffset();var h=new Date(o.getFullYear(),0,1).getTimezoneOffset();o=0|(f!=h&&o.getTimezoneOffset()==Math.min(h,f)),(v(),B)[d+32>>>2>>>0]=o}function ig(o){o>>>=0;var d=new Date((v(),B)[o+20>>>2>>>0]+1900,(v(),B)[o+16>>>2>>>0],(v(),B)[o+12>>>2>>>0],(v(),B)[o+8>>>2>>>0],(v(),B)[o+4>>>2>>>0],(v(),B)[o>>>2>>>0],0),f=(v(),B)[o+32>>>2>>>0],h=d.getTimezoneOffset(),b=new Date(d.getFullYear(),6,1).getTimezoneOffset(),T=new Date(d.getFullYear(),0,1).getTimezoneOffset(),z=Math.min(T,b);return 0>f?(v(),B)[o+32>>>2>>>0]=+(b!=T&&z==h):0<f!=(z==h)&&(b=Math.max(T,b),d.setTime(d.getTime()+6e4*((0<f?z:b)-h))),(v(),B)[o+24>>>2>>>0]=d.getDay(),f=(rs(d.getFullYear())?is:as)[d.getMonth()]+d.getDate()-1|0,(v(),B)[o+28>>>2>>>0]=f,(v(),B)[o>>>2>>>0]=d.getSeconds(),(v(),B)[o+4>>>2>>>0]=d.getMinutes(),(v(),B)[o+8>>>2>>>0]=d.getHours(),(v(),B)[o+12>>>2>>>0]=d.getDate(),(v(),B)[o+16>>>2>>>0]=d.getMonth(),(v(),B)[o+20>>>2>>>0]=d.getYear(),o=d.getTime(),BigInt(isNaN(o)?-1:o/1e3)}function ns(o,d,f,h,b,T,z){return a?fe(16,1,o,d,f,h,b,T,z):-52}function ss(o,d,f,h,b,T){if(a)return fe(17,1,o,d,f,h,b,T)}var Jt={},ag=()=>performance.timeOrigin+performance.now();function os(o,d){if(a)return fe(18,1,o,d);if(Jt[o]&&(clearTimeout(Jt[o].id),delete Jt[o]),!d)return 0;var f=setTimeout(()=>{delete Jt[o],vr(()=>xs(o,performance.timeOrigin+performance.now()))},d);return Jt[o]={id:f,me:d},0}function ng(o,d,f,h){o>>>=0,d>>>=0,f>>>=0,h>>>=0;var b=new Date().getFullYear(),T=new Date(b,0,1).getTimezoneOffset();b=new Date(b,6,1).getTimezoneOffset();var z=Math.max(T,b);(v(),j)[o>>>2>>>0]=60*z,(v(),B)[d>>>2>>>0]=+(T!=b),o=(d=N=>{var q=Math.abs(N);return`UTC${0<=N?"-":"+"}${String(Math.floor(q/60)).padStart(2,"0")}${String(q%60).padStart(2,"0")}`})(T),d=d(b),b<T?(ft(o,f,17),ft(d,h,17)):(ft(o,h,17),ft(d,f,17))}var sg=()=>Date.now();function og(o,d,f){return f>>>=0,0<=o&&3>=o?(o===0?o=Date.now():o=performance.timeOrigin+performance.now(),o=Math.round(1e6*o),(v(),re)[f>>>3>>>0]=BigInt(o),0):28}var fi=[],us=(o,d)=>{fi.length=0;for(var f;f=(v(),G)[o++>>>0];){var h=f!=105;d+=(h&=f!=112)&&d%8?4:0,fi.push(f==112?(v(),j)[d>>>2>>>0]:f==106?(v(),re)[d>>>3>>>0]:f==105?(v(),B)[d>>>2>>>0]:(v(),ee)[d>>>3>>>0]),d+=h?8:4}return fi};function ug(o,d,f){return o>>>=0,d=us(d>>>0,f>>>0),vi[o](...d)}function lg(o,d,f){return o>>>=0,d=us(d>>>0,f>>>0),vi[o](...d)}var dg=()=>{};function pg(o,d){return E(Ie(o>>>0,d>>>0))}var cg=()=>{throw Be+=1,"unwind"};function hg(){return 4294901760}var fg=()=>navigator.hardwareConcurrency,It={},Ir=o=>{var d;return(d=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o))?+d[1]:(d=/:(\d+):\d+(?:\)|$)/.exec(o))?2147483648|+d[1]:0},ls=o=>{for(var d of o)(o=Ir(d))&&(It[o]=d)};function mg(){var o=Error().stack.toString().split(`
`);return o[0]=="Error"&&o.shift(),ls(o),It.sd=Ir(o[3]),It.Ud=o,It.sd}function Er(o){if(!(o=It[o>>>0]))return 0;var d;if(d=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o))o=d[1];else if(d=/^\s+at (.*) \(.*\)$/.exec(o))o=d[1];else{if(!(d=/^(.+?)@/.exec(o)))return 0;o=d[1]}rt(Er.td??0),d=br(o)+1;var f=er(d);return f&&ft(o,f,d),Er.td=f,Er.td}function gg(o){o>>>=0;var d=(v(),G).length;if(o<=d||4294901760<o)return!1;for(var f=1;4>=f;f*=2){var h=d*(1+.2/f);h=Math.min(h,o+100663296);e:{h=(Math.min(4294901760,65536*Math.ceil(Math.max(o,h)/65536))-ht.buffer.byteLength+65535)/65536|0;try{ht.grow(h),K();var b=1;break e}catch{}b=void 0}if(b)return!0}return!1}function yg(o,d,f){if(o>>>=0,d>>>=0,It.sd==o)var h=It.Ud;else(h=Error().stack.toString().split(`
`))[0]=="Error"&&h.shift(),ls(h);for(var b=3;h[b]&&Ir(h[b])!=o;)++b;for(o=0;o<f&&h[o+b];++o)(v(),B)[d+4*o>>>2>>>0]=Ir(h[o+b]);return o}var mi,gi={},ds=()=>{var h;if(!mi){var o,d={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(((h=globalThis.navigator)==null?void 0:h.language)??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(o in gi)gi[o]===void 0?delete d[o]:d[o]=gi[o];var f=[];for(o in d)f.push(`${o}=${d[o]}`);mi=f}return mi};function ps(o,d){if(a)return fe(19,1,o,d);o>>>=0,d>>>=0;var f,h=0,b=0;for(f of ds()){var T=d+h;(v(),j)[o+b>>>2>>>0]=T,h+=ft(f,T,1/0)+1,b+=4}return 0}function cs(o,d){if(a)return fe(20,1,o,d);o>>>=0,d>>>=0;var f=ds();for(var h of((v(),j)[o>>>2>>>0]=f.length,o=0,f))o+=br(h)+1;return(v(),j)[d>>>2>>>0]=o,0}function hs(o){return a?fe(21,1,o):52}function fs(o,d,f,h,b){return a?fe(22,1,o,d,f,h,b):52}function ms(o,d,f,h){return a?fe(23,1,o,d,f,h):52}function gs(o,d,f,h){return a?fe(24,1,o,d,f,h):70}var _g=[null,[],[]];function ys(o,d,f,h){if(a)return fe(25,1,o,d,f,h);d>>>=0,f>>>=0,h>>>=0;for(var b=0,T=0;T<f;T++){var z=(v(),j)[d>>>2>>>0],N=(v(),j)[d+4>>>2>>>0];d+=8;for(var q=0;q<N;q++){var V=o,ne=(v(),G)[z+q>>>0],de=_g[V];ne===0||ne===10?((V===1?I:E)(Rn(de)),de.length=0):de.push(ne)}b+=N}return(v(),j)[h>>>2>>>0]=b,0}function wg(o){return o>>>0}a||(function(){for(var o=t.numThreads-1;o--;)In();Oe.push(async()=>{var d=(async function(){if(!a)return Promise.all(Je.map(Tn))})();vt++,await d,--vt==0&&xt&&(d=xt,xt=null,d())})})(),a||(ht=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),K()),t.wasmBinary&&(g=t.wasmBinary),t.stackSave=()=>oe(),t.stackRestore=o=>se(o),t.stackAlloc=o=>wi(o),t.setValue=function(o,d,f="i8"){switch(f.endsWith("*")&&(f="*"),f){case"i1":case"i8":(v(),P)[o>>>0]=d;break;case"i16":(v(),W)[o>>>1>>>0]=d;break;case"i32":(v(),B)[o>>>2>>>0]=d;break;case"i64":(v(),re)[o>>>3>>>0]=BigInt(d);break;case"float":(v(),Y)[o>>>2>>>0]=d;break;case"double":(v(),ee)[o>>>3>>>0]=d;break;case"*":(v(),j)[o>>>2>>>0]=d;break;default:L(`invalid type for setValue: ${f}`)}},t.getValue=function(o,d="i8"){switch(d.endsWith("*")&&(d="*"),d){case"i1":case"i8":return(v(),P)[o>>>0];case"i16":return(v(),W)[o>>>1>>>0];case"i32":return(v(),B)[o>>>2>>>0];case"i64":return(v(),re)[o>>>3>>>0];case"float":return(v(),Y)[o>>>2>>>0];case"double":return(v(),ee)[o>>>3>>>0];case"*":return(v(),j)[o>>>2>>>0];default:L(`invalid type for getValue: ${d}`)}},t.UTF8ToString=Ie,t.stringToUTF8=ft,t.lengthBytesUTF8=br;var _s,ws,Cr,rt,er,yi,$s,bs,vs,_i,xs,Ss,ue,tr,ks,se,wi,oe,Ts,$i,Is,Es,Cs,bi,zs,As,Os,Bs,Rs,Ns,Ds,Ms,Us,Ps,Ls,qs,Ws,Vs,Gs,Hs,Fs,js,Ks,Zs,Qs,Xs,Ys,Js,eo,to,ro,io,ao,no,so,oo,uo,lo,po,co,ho,fo,mo,go,yo,ot,$g=[Te,xe,zn,Nn,Dn,Mn,Un,Pn,Ln,qn,Wn,Vn,Gn,Hn,Fn,jn,ns,ss,os,ps,cs,hs,fs,ms,gs,ys],vi={1124124:(o,d,f,h,b)=>{if(t===void 0||!t.jd)return 1;if((o=Ie(Number(o>>>0))).startsWith("./")&&(o=o.substring(2)),!(o=t.jd.get(o)))return 2;if(d=Number(d>>>0),f=Number(f>>>0),h=Number(h>>>0),d+f>o.byteLength)return 3;try{let T=o.subarray(d,d+f);switch(b){case 0:(v(),G).set(T,h>>>0);break;case 1:t.ae?t.ae(h,T):t.Td(h,T);break;default:return 4}return 0}catch{return 4}},1124948:()=>typeof navigator<"u"&&navigator.de?1:0,1125020:(o,d,f)=>{t.Dd(o,(v(),G).subarray(d>>>0,d+f>>>0))},1125084:()=>t.ce(),1125126:o=>{t.Cd(o)},1125163:()=>{t.Md()},1125194:()=>{t.Nd()},1125223:()=>{t.Rd()},1125248:o=>t.Ld(o),1125281:o=>t.Pd(o),1125313:(o,d,f)=>{t.rd(Number(o),Number(d),Number(f),!0)},1125376:(o,d,f)=>{t.rd(Number(o),Number(d),Number(f))},1125433:()=>typeof wasmOffsetConverter<"u",1125490:o=>{t.ic("Abs",o,void 0)},1125541:o=>{t.ic("Neg",o,void 0)},1125592:o=>{t.ic("Floor",o,void 0)},1125645:o=>{t.ic("Ceil",o,void 0)},1125697:o=>{t.ic("Reciprocal",o,void 0)},1125755:o=>{t.ic("Sqrt",o,void 0)},1125807:o=>{t.ic("Exp",o,void 0)},1125858:o=>{t.ic("Erf",o,void 0)},1125909:o=>{t.ic("Sigmoid",o,void 0)},1125964:(o,d,f)=>{t.ic("HardSigmoid",o,{alpha:d,beta:f})},1126043:o=>{t.ic("HardSwish",o,void 0)},1126100:o=>{t.ic("Log",o,void 0)},1126151:o=>{t.ic("Sin",o,void 0)},1126202:o=>{t.ic("Cos",o,void 0)},1126253:o=>{t.ic("Tan",o,void 0)},1126304:o=>{t.ic("Asin",o,void 0)},1126356:o=>{t.ic("Acos",o,void 0)},1126408:o=>{t.ic("Atan",o,void 0)},1126460:o=>{t.ic("Sinh",o,void 0)},1126512:o=>{t.ic("Cosh",o,void 0)},1126564:o=>{t.ic("Asinh",o,void 0)},1126617:o=>{t.ic("Acosh",o,void 0)},1126670:o=>{t.ic("Atanh",o,void 0)},1126723:o=>{t.ic("Tanh",o,void 0)},1126775:o=>{t.ic("Not",o,void 0)},1126826:(o,d,f)=>{t.ic("Clip",o,{min:d,max:f})},1126895:o=>{t.ic("Clip",o,void 0)},1126947:(o,d)=>{t.ic("Elu",o,{alpha:d})},1127005:o=>{t.ic("Gelu",o,void 0)},1127057:o=>{t.ic("Relu",o,void 0)},1127109:(o,d)=>{t.ic("LeakyRelu",o,{alpha:d})},1127173:(o,d)=>{t.ic("ThresholdedRelu",o,{alpha:d})},1127243:(o,d)=>{t.ic("Cast",o,{to:d})},1127301:o=>{t.ic("Add",o,void 0)},1127352:o=>{t.ic("Sub",o,void 0)},1127403:o=>{t.ic("Mul",o,void 0)},1127454:o=>{t.ic("Div",o,void 0)},1127505:o=>{t.ic("Pow",o,void 0)},1127556:o=>{t.ic("Equal",o,void 0)},1127609:o=>{t.ic("Greater",o,void 0)},1127664:o=>{t.ic("GreaterOrEqual",o,void 0)},1127726:o=>{t.ic("Less",o,void 0)},1127778:o=>{t.ic("LessOrEqual",o,void 0)},1127837:(o,d,f,h,b)=>{t.ic("ReduceMean",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1128012:(o,d,f,h,b)=>{t.ic("ReduceMax",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1128186:(o,d,f,h,b)=>{t.ic("ReduceMin",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1128360:(o,d,f,h,b)=>{t.ic("ReduceProd",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1128535:(o,d,f,h,b)=>{t.ic("ReduceSum",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1128709:(o,d,f,h,b)=>{t.ic("ReduceL1",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1128882:(o,d,f,h,b)=>{t.ic("ReduceL2",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1129055:(o,d,f,h,b)=>{t.ic("ReduceLogSum",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1129232:(o,d,f,h,b)=>{t.ic("ReduceSumSquare",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1129412:(o,d,f,h,b)=>{t.ic("ReduceLogSumExp",o,{keepDims:!!d,noopWithEmptyAxes:!!f,axes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1129592:o=>{t.ic("Where",o,void 0)},1129645:(o,d,f)=>{t.ic("Transpose",o,{perm:d?Array.from((v(),B).subarray(Number(d)>>>0,Number(f)>>>0)):[]})},1129769:(o,d,f,h)=>{t.ic("DepthToSpace",o,{blocksize:d,mode:Ie(f),format:h?"NHWC":"NCHW"})},1129902:(o,d,f,h)=>{t.ic("DepthToSpace",o,{blocksize:d,mode:Ie(f),format:h?"NHWC":"NCHW"})},1130035:(o,d,f,h)=>{t.ic("DFT",o,{axis:d,inverse:f,onesided:h})},1130127:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be,gt)=>{t.ic("ConvTranspose",o,{format:q?"NHWC":"NCHW",autoPad:d,dilations:[f],group:h,kernelShape:[b],pads:[T,z],strides:[N],wIsConst:()=>!!(v(),P)[V>>>0],outputPadding:ne?Array.from((v(),B).subarray(Number(ne)>>>0,Number(de)>>>0)):[],outputShape:we?Array.from((v(),B).subarray(Number(we)>>>0,Number(be)>>>0)):[],activation:Ie(gt)})},1130560:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be)=>{t.ic("ConvTranspose",o,{format:N?"NHWC":"NCHW",autoPad:d,dilations:Array.from((v(),B).subarray(Number(f)>>>0,(Number(f)>>>0)+2>>>0)),group:h,kernelShape:Array.from((v(),B).subarray(Number(b)>>>0,(Number(b)>>>0)+2>>>0)),pads:Array.from((v(),B).subarray(Number(T)>>>0,(Number(T)>>>0)+4>>>0)),strides:Array.from((v(),B).subarray(Number(z)>>>0,(Number(z)>>>0)+2>>>0)),wIsConst:()=>!!(v(),P)[q>>>0],outputPadding:V?Array.from((v(),B).subarray(Number(V)>>>0,Number(ne)>>>0)):[],outputShape:de?Array.from((v(),B).subarray(Number(de)>>>0,Number(we)>>>0)):[],activation:Ie(be)})},1131221:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be,gt)=>{t.ic("ConvTranspose",o,{format:q?"NHWC":"NCHW",autoPad:d,dilations:[f],group:h,kernelShape:[b],pads:[T,z],strides:[N],wIsConst:()=>!!(v(),P)[V>>>0],outputPadding:ne?Array.from((v(),B).subarray(Number(ne)>>>0,Number(de)>>>0)):[],outputShape:we?Array.from((v(),B).subarray(Number(we)>>>0,Number(be)>>>0)):[],activation:Ie(gt)})},1131654:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be)=>{t.ic("ConvTranspose",o,{format:N?"NHWC":"NCHW",autoPad:d,dilations:Array.from((v(),B).subarray(Number(f)>>>0,(Number(f)>>>0)+2>>>0)),group:h,kernelShape:Array.from((v(),B).subarray(Number(b)>>>0,(Number(b)>>>0)+2>>>0)),pads:Array.from((v(),B).subarray(Number(T)>>>0,(Number(T)>>>0)+4>>>0)),strides:Array.from((v(),B).subarray(Number(z)>>>0,(Number(z)>>>0)+2>>>0)),wIsConst:()=>!!(v(),P)[q>>>0],outputPadding:V?Array.from((v(),B).subarray(Number(V)>>>0,Number(ne)>>>0)):[],outputShape:de?Array.from((v(),B).subarray(Number(de)>>>0,Number(we)>>>0)):[],activation:Ie(be)})},1132315:(o,d)=>{t.ic("GlobalAveragePool",o,{format:d?"NHWC":"NCHW"})},1132406:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be)=>{t.ic("AveragePool",o,{format:be?"NHWC":"NCHW",auto_pad:d,ceil_mode:f,count_include_pad:h,storage_order:b,dilations:T?Array.from((v(),B).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:N?Array.from((v(),B).subarray(Number(N)>>>0,Number(q)>>>0)):[],pads:V?Array.from((v(),B).subarray(Number(V)>>>0,Number(ne)>>>0)):[],strides:de?Array.from((v(),B).subarray(Number(de)>>>0,Number(we)>>>0)):[]})},1132885:(o,d)=>{t.ic("GlobalAveragePool",o,{format:d?"NHWC":"NCHW"})},1132976:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be)=>{t.ic("AveragePool",o,{format:be?"NHWC":"NCHW",auto_pad:d,ceil_mode:f,count_include_pad:h,storage_order:b,dilations:T?Array.from((v(),B).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:N?Array.from((v(),B).subarray(Number(N)>>>0,Number(q)>>>0)):[],pads:V?Array.from((v(),B).subarray(Number(V)>>>0,Number(ne)>>>0)):[],strides:de?Array.from((v(),B).subarray(Number(de)>>>0,Number(we)>>>0)):[]})},1133455:(o,d)=>{t.ic("GlobalMaxPool",o,{format:d?"NHWC":"NCHW"})},1133542:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be)=>{t.ic("MaxPool",o,{format:be?"NHWC":"NCHW",auto_pad:d,ceil_mode:f,count_include_pad:h,storage_order:b,dilations:T?Array.from((v(),B).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:N?Array.from((v(),B).subarray(Number(N)>>>0,Number(q)>>>0)):[],pads:V?Array.from((v(),B).subarray(Number(V)>>>0,Number(ne)>>>0)):[],strides:de?Array.from((v(),B).subarray(Number(de)>>>0,Number(we)>>>0)):[]})},1134017:(o,d)=>{t.ic("GlobalMaxPool",o,{format:d?"NHWC":"NCHW"})},1134104:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be)=>{t.ic("MaxPool",o,{format:be?"NHWC":"NCHW",auto_pad:d,ceil_mode:f,count_include_pad:h,storage_order:b,dilations:T?Array.from((v(),B).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:N?Array.from((v(),B).subarray(Number(N)>>>0,Number(q)>>>0)):[],pads:V?Array.from((v(),B).subarray(Number(V)>>>0,Number(ne)>>>0)):[],strides:de?Array.from((v(),B).subarray(Number(de)>>>0,Number(we)>>>0)):[]})},1134579:(o,d,f,h,b)=>{t.ic("Gemm",o,{alpha:d,beta:f,transA:h,transB:b})},1134683:o=>{t.ic("MatMul",o,void 0)},1134737:(o,d,f,h)=>{t.ic("ArgMax",o,{keepDims:!!d,selectLastIndex:!!f,axis:h})},1134845:(o,d,f,h)=>{t.ic("ArgMin",o,{keepDims:!!d,selectLastIndex:!!f,axis:h})},1134953:(o,d)=>{t.ic("Softmax",o,{axis:d})},1135016:(o,d)=>{t.ic("Concat",o,{axis:d})},1135076:(o,d,f,h,b)=>{t.ic("Split",o,{axis:d,numOutputs:f,splitSizes:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1135232:o=>{t.ic("Expand",o,void 0)},1135286:(o,d)=>{t.ic("Gather",o,{axis:Number(d)})},1135357:(o,d)=>{t.ic("GatherElements",o,{axis:Number(d)})},1135436:(o,d)=>{t.ic("GatherND",o,{batch_dims:Number(d)})},1135515:(o,d,f,h,b,T,z,N,q,V,ne)=>{t.ic("Resize",o,{antialias:d,axes:f?Array.from((v(),B).subarray(Number(f)>>>0,Number(h)>>>0)):[],coordinateTransformMode:Ie(b),cubicCoeffA:T,excludeOutside:z,extrapolationValue:N,keepAspectRatioPolicy:Ie(q),mode:Ie(V),nearestMode:Ie(ne)})},1135877:(o,d,f,h,b,T,z)=>{t.ic("Slice",o,{starts:d?Array.from((v(),B).subarray(Number(d)>>>0,Number(f)>>>0)):[],ends:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[],axes:T?Array.from((v(),B).subarray(Number(T)>>>0,Number(z)>>>0)):[]})},1136141:o=>{t.ic("Tile",o,void 0)},1136193:(o,d,f)=>{t.ic("InstanceNormalization",o,{epsilon:d,format:f?"NHWC":"NCHW"})},1136307:(o,d,f)=>{t.ic("InstanceNormalization",o,{epsilon:d,format:f?"NHWC":"NCHW"})},1136421:o=>{t.ic("Range",o,void 0)},1136474:(o,d)=>{t.ic("Einsum",o,{equation:Ie(d)})},1136555:(o,d,f,h,b)=>{t.ic("Pad",o,{mode:d,value:f,pads:h?Array.from((v(),B).subarray(Number(h)>>>0,Number(b)>>>0)):[]})},1136698:(o,d,f,h,b,T)=>{t.ic("BatchNormalization",o,{epsilon:d,momentum:f,spatial:!!b,trainingMode:!!h,format:T?"NHWC":"NCHW"})},1136867:(o,d,f,h,b,T)=>{t.ic("BatchNormalization",o,{epsilon:d,momentum:f,spatial:!!b,trainingMode:!!h,format:T?"NHWC":"NCHW"})},1137036:(o,d,f)=>{t.ic("CumSum",o,{exclusive:Number(d),reverse:Number(f)})},1137133:(o,d,f)=>{t.ic("DequantizeLinear",o,{axis:d,blockSize:f})},1137223:(o,d,f,h,b)=>{t.ic("GridSample",o,{align_corners:d,mode:Ie(f),padding_mode:Ie(h),format:b?"NHWC":"NCHW"})},1137393:(o,d,f,h,b)=>{t.ic("GridSample",o,{align_corners:d,mode:Ie(f),padding_mode:Ie(h),format:b?"NHWC":"NCHW"})},1137563:(o,d)=>{t.ic("ScatterND",o,{reduction:Ie(d)})},1137648:(o,d,f,h,b,T,z,N,q)=>{t.ic("Attention",o,{numHeads:d,isUnidirectional:f,maskFilterValue:h,scale:b,doRotary:T,qkvHiddenSizes:z?Array.from((v(),B).subarray(Number(N)>>>0,Number(N)+z>>>0)):[],pastPresentShareBuffer:!!q})},1137920:o=>{t.ic("BiasAdd",o,void 0)},1137975:o=>{t.ic("BiasSplitGelu",o,void 0)},1138036:o=>{t.ic("FastGelu",o,void 0)},1138092:(o,d,f,h,b,T,z,N,q,V,ne,de,we,be,gt,xi)=>{t.ic("Conv",o,{format:de?"NHWC":"NCHW",auto_pad:d,dilations:f?Array.from((v(),B).subarray(Number(f)>>>0,Number(h)>>>0)):[],group:b,kernel_shape:T?Array.from((v(),B).subarray(Number(T)>>>0,Number(z)>>>0)):[],pads:N?Array.from((v(),B).subarray(Number(N)>>>0,Number(q)>>>0)):[],strides:V?Array.from((v(),B).subarray(Number(V)>>>0,Number(ne)>>>0)):[],w_is_const:()=>!!(v(),P)[Number(we)>>>0],activation:Ie(be),activation_params:gt?Array.from((v(),Y).subarray(Number(gt)>>>0,Number(xi)>>>0)):[]})},1138676:o=>{t.ic("Gelu",o,void 0)},1138728:(o,d,f,h,b,T,z,N,q)=>{t.ic("GroupQueryAttention",o,{numHeads:d,kvNumHeads:f,scale:h,softcap:b,doRotary:T,rotaryInterleaved:z,smoothSoftmax:N,localWindowSize:q})},1138945:(o,d,f,h)=>{t.ic("LayerNormalization",o,{axis:d,epsilon:f,simplified:!!h})},1139056:(o,d,f,h)=>{t.ic("LayerNormalization",o,{axis:d,epsilon:f,simplified:!!h})},1139167:(o,d,f,h,b,T)=>{t.ic("MatMulNBits",o,{k:d,n:f,accuracyLevel:h,bits:b,blockSize:T})},1139294:(o,d,f,h,b,T)=>{t.ic("MultiHeadAttention",o,{numHeads:d,isUnidirectional:f,maskFilterValue:h,scale:b,doRotary:T})},1139453:(o,d)=>{t.ic("QuickGelu",o,{alpha:d})},1139517:(o,d,f,h,b)=>{t.ic("RotaryEmbedding",o,{interleaved:!!d,numHeads:f,rotaryEmbeddingDim:h,scale:b})},1139656:(o,d,f)=>{t.ic("SkipLayerNormalization",o,{epsilon:d,simplified:!!f})},1139758:(o,d,f)=>{t.ic("SkipLayerNormalization",o,{epsilon:d,simplified:!!f})},1139860:(o,d,f,h)=>{t.ic("GatherBlockQuantized",o,{gatherAxis:d,quantizeAxis:f,blockSize:h})},1139981:o=>{t.Qd(o)},1140015:(o,d)=>t.Sd(Number(o),Number(d),t.hd.Vd,t.hd.errors)};function bg(o,d,f){return es(async()=>{await t.Od(Number(o),Number(d),Number(f))})}function vg(){return typeof wasmOffsetConverter<"u"}function xg(o,d,f,h){var b=oe();try{return Us(o,d,f,h)}catch(T){if(se(b),T!==T+0)throw T;ue(1,0)}}function Sg(o,d,f){var h=oe();try{return Ds(o,d,f)}catch(b){if(se(h),b!==b+0)throw b;ue(1,0)}}function kg(o){var d=oe();try{Rs(o)}catch(f){if(se(d),f!==f+0)throw f;ue(1,0)}}function Tg(o,d){var f=oe();try{return bi(o,d)}catch(h){if(se(f),h!==h+0)throw h;ue(1,0)}}function Ig(o,d,f){var h=oe();try{Cs(o,d,f)}catch(b){if(se(h),b!==b+0)throw b;ue(1,0)}}function Eg(o,d,f,h){var b=oe();try{return Vs(o,d,f,h)}catch(T){if(se(b),T!==T+0)throw T;ue(1,0)}}function Cg(o,d){var f=oe();try{Ps(o,d)}catch(h){if(se(f),h!==h+0)throw h;ue(1,0)}}function zg(o,d,f,h,b,T,z){var N=oe();try{return Ms(o,d,f,h,b,T,z)}catch(q){if(se(N),q!==q+0)throw q;ue(1,0)}}function Ag(o,d,f,h,b,T){var z=oe();try{zs(o,d,f,h,b,T)}catch(N){if(se(z),N!==N+0)throw N;ue(1,0)}}function Og(o,d,f,h){var b=oe();try{Os(o,d,f,h)}catch(T){if(se(b),T!==T+0)throw T;ue(1,0)}}function Bg(o,d,f,h,b){var T=oe();try{Ns(o,d,f,h,b)}catch(z){if(se(T),z!==z+0)throw z;ue(1,0)}}function Rg(o,d,f,h,b,T,z){var N=oe();try{qs(o,d,f,h,b,T,z)}catch(q){if(se(N),q!==q+0)throw q;ue(1,0)}}function Ng(o,d,f,h,b,T,z){var N=oe();try{Ws(o,d,f,h,b,T,z)}catch(q){if(se(N),q!==q+0)throw q;ue(1,0)}}function Dg(o,d,f,h,b,T,z,N){var q=oe();try{js(o,d,f,h,b,T,z,N)}catch(V){if(se(q),V!==V+0)throw V;ue(1,0)}}function Mg(o,d,f,h,b){var T=oe();try{return Ls(o,d,f,h,b)}catch(z){if(se(T),z!==z+0)throw z;ue(1,0)}}function Ug(o,d,f){var h=oe();try{return Bs(o,d,f)}catch(b){if(se(h),b!==b+0)throw b;ue(1,0)}}function Pg(o,d,f,h,b,T,z,N){var q=oe();try{Ks(o,d,f,h,b,T,z,N)}catch(V){if(se(q),V!==V+0)throw V;ue(1,0)}}function Lg(o,d,f,h,b,T,z,N,q,V,ne,de){var we=oe();try{Gs(o,d,f,h,b,T,z,N,q,V,ne,de)}catch(be){if(se(we),be!==be+0)throw be;ue(1,0)}}function qg(o,d,f){var h=oe();try{return Zs(o,d,f)}catch(b){if(se(h),b!==b+0)throw b;return ue(1,0),0n}}function Wg(o,d,f,h,b,T,z,N,q){var V=oe();try{As(o,d,f,h,b,T,z,N,q)}catch(ne){if(se(V),ne!==ne+0)throw ne;ue(1,0)}}function Vg(o){var d=oe();try{return Qs(o)}catch(f){if(se(d),f!==f+0)throw f;ue(1,0)}}function Gg(o,d){var f=oe();try{return co(o,d)}catch(h){if(se(f),h!==h+0)throw h;return ue(1,0),0n}}function Hg(o,d,f,h){var b=oe();try{return Xs(o,d,f,h)}catch(T){if(se(b),T!==T+0)throw T;ue(1,0)}}function Fg(o,d,f,h,b,T,z){var N=oe();try{ho(o,d,f,h,b,T,z)}catch(q){if(se(N),q!==q+0)throw q;ue(1,0)}}function jg(o){var d=oe();try{return Ys(o)}catch(f){if(se(d),f!==f+0)throw f;return ue(1,0),0n}}function Kg(o,d,f,h,b){var T=oe();try{return ao(o,d,f,h,b)}catch(z){if(se(T),z!==z+0)throw z;ue(1,0)}}function Zg(o,d,f,h,b,T){var z=oe();try{return no(o,d,f,h,b,T)}catch(N){if(se(z),N!==N+0)throw N;ue(1,0)}}function Qg(o,d,f,h,b,T){var z=oe();try{return Hs(o,d,f,h,b,T)}catch(N){if(se(z),N!==N+0)throw N;ue(1,0)}}function Xg(o,d,f,h,b,T){var z=oe();try{return so(o,d,f,h,b,T)}catch(N){if(se(z),N!==N+0)throw N;ue(1,0)}}function Yg(o,d,f,h,b,T,z,N){var q=oe();try{return Fs(o,d,f,h,b,T,z,N)}catch(V){if(se(q),V!==V+0)throw V;ue(1,0)}}function Jg(o,d,f,h,b){var T=oe();try{return oo(o,d,f,h,b)}catch(z){if(se(T),z!==z+0)throw z;return ue(1,0),0n}}function e0(o,d,f,h){var b=oe();try{return uo(o,d,f,h)}catch(T){if(se(b),T!==T+0)throw T;ue(1,0)}}function t0(o,d,f,h){var b=oe();try{return lo(o,d,f,h)}catch(T){if(se(b),T!==T+0)throw T;ue(1,0)}}function r0(o,d,f,h,b,T,z,N,q,V,ne,de){var we=oe();try{return po(o,d,f,h,b,T,z,N,q,V,ne,de)}catch(be){if(se(we),be!==be+0)throw be;ue(1,0)}}function i0(o,d,f,h,b,T,z,N,q,V,ne){var de=oe();try{ro(o,d,f,h,b,T,z,N,q,V,ne)}catch(we){if(se(de),we!==we+0)throw we;ue(1,0)}}function a0(o,d,f,h,b,T,z,N,q,V,ne,de,we,be,gt,xi){var u0=oe();try{io(o,d,f,h,b,T,z,N,q,V,ne,de,we,be,gt,xi)}catch(Si){if(se(u0),Si!==Si+0)throw Si;ue(1,0)}}function n0(o,d,f){var h=oe();try{return Js(o,d,f)}catch(b){if(se(h),b!==b+0)throw b;ue(1,0)}}function s0(o,d,f){var h=oe();try{return eo(o,d,f)}catch(b){if(se(h),b!==b+0)throw b;ue(1,0)}}function o0(o,d,f,h){var b=oe();try{to(o,d,f,h)}catch(T){if(se(b),T!==T+0)throw T;ue(1,0)}}function zr(){if(0<vt)xt=zr;else if(a)x==null||x(t),X();else{for(var o=Oe;0<o.length;)o.shift()(t);0<vt?xt=zr:(t.calledRun=!0,C||(X(),x==null||x(t)))}}return a||(ot=await $e(),zr()),t.PTR_SIZE=4,R?t:new Promise((o,d)=>{x=o,S=d})}var zp,vo,A0=U(()=>{"use strict";var e,t;zp=bo,vo=(t=(e=globalThis.self)==null?void 0:e.name)==null?void 0:t.startsWith("em-pthread"),vo&&bo()}),Oi,Ea,xo,Ue,Ap,Or,So,ko,Bi,To,Ri,Op,Ni,Bp,Za=U(()=>{"use strict";Ka(),Oi=typeof location>"u"?void 0:location.origin,Ea=import.meta.url>"file:"&&import.meta.url<"file;",xo=()=>{if(Ea){let e=URL;return new URL(new e("ort.bundle.min.mjs",import.meta.url).href,Oi).href}return import.meta.url},Ue=xo(),Ap=()=>{if(Ue&&!Ue.startsWith("blob:"))return Ue.substring(0,Ue.lastIndexOf("/")+1)},Or=(e,t)=>{try{let r=t??Ue;return(r?new URL(e,r):new URL(e)).origin===Oi}catch{return!1}},So=(e,t)=>{let r=t??Ue;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},ko=(e,t)=>`${t??"./"}${e}`,Bi=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},To=async e=>(await import(e)).default,Ri=(z0(),yr(Ip)).default,Op=async()=>{if(!Ue)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(Or(Ue))return[void 0,Ri()];let e=await Bi(Ue);return[e,Ri(e)]},Ni=(A0(),yr(Cp)).default,Bp=async(e,t,r,i)=>{let a=Ni&&!(e||t);if(a)if(Ue)a=Or(Ue)||i&&!r;else if(i&&!r)a=!0;else throw new Error("cannot determine the script source URL.");if(a)return[void 0,Ni];{let n="ort-wasm-simd-threaded.jsep.mjs",s=e??So(n,t),u=r&&s&&!Or(s,t),l=u?await Bi(s):s??ko(n,t);return[u?l:void 0,await To(l)]}}}),Di,Br,rr,Mi,Io,Eo,Co,Qa,ge,Wt=U(()=>{"use strict";Za(),Br=!1,rr=!1,Mi=!1,Io=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Eo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Co=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Qa=async e=>{if(Br)return Promise.resolve();if(rr)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Mi)throw new Error("previous call to 'initializeWebAssembly()' failed.");rr=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!Co())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Eo())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=Io();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,n=typeof a=="string"?a:void 0,s=a==null?void 0:a.mjs,u=(s==null?void 0:s.href)??s,l=a==null?void 0:a.wasm,p=(l==null?void 0:l.href)??l,c=e.wasmBinary,[m,g]=await Bp(u,n,r>1,!!c||!!p),_=!1,y=[];if(t>0&&y.push(new Promise(x=>{setTimeout(()=>{_=!0,x()},t)})),y.push(new Promise((x,S)=>{let $={numThreads:r};if(c)$.wasmBinary=c,$.locateFile=w=>w;else if(p||n)$.locateFile=w=>p??n+w;else if(u&&u.indexOf("blob:")!==0)$.locateFile=w=>new URL(w,u).href;else if(m){let w=Ap();w&&($.locateFile=k=>w+k)}g($).then(w=>{rr=!1,Br=!0,Di=w,x(),m&&URL.revokeObjectURL(m)},w=>{rr=!1,Mi=!0,S(w)})})),await Promise.race(y),_)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},ge=()=>{if(Br&&Di)return Di;throw new Error("WebAssembly is not initialized yet.")}}),Ye,Kr,ce,Xa=U(()=>{"use strict";Wt(),Ye=(e,t)=>{let r=ge(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},Kr=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,n])=>{let s=t?t+a:a;if(typeof n=="object")Kr(n,s+".",r,i);else if(typeof n=="string"||typeof n=="number")i(s,n.toString());else if(typeof n=="boolean")i(s,n?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof n}`)})},ce=e=>{let t=ge(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let n=Number(t.getValue(a,i===4?"i32":"i64")),s=t.getValue(a+i,"*"),u=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${n}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),Rp,O0=U(()=>{"use strict";Wt(),Xa(),Rp=(e,t)=>{let r=ge(),i=0,a=[],n=e||{};try{if((e==null?void 0:e.logSeverityLevel)===void 0)n.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if((e==null?void 0:e.logVerbosityLevel)===void 0)n.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);(e==null?void 0:e.terminate)===void 0&&(n.terminate=!1);let s=0;(e==null?void 0:e.tag)!==void 0&&(s=Ye(e.tag,a)),i=r._OrtCreateRunOptions(n.logSeverityLevel,n.logVerbosityLevel,!!n.terminate,s),i===0&&ce("Can't create run options."),(e==null?void 0:e.extra)!==void 0&&Kr(e.extra,"",new WeakSet,(u,l)=>{let p=Ye(u,a),c=Ye(l,a);r._OrtAddRunConfigEntry(i,p,c)!==0&&ce(`Can't set a run config entry: ${u} - ${l}.`)});for(let u of t)r._OrtRunOptionsAddActiveLoraAdapter(i,u)!==0&&ce("Can't add an active LoRA adapter.");return[i,a]}catch(s){throw i!==0&&r._OrtReleaseRunOptions(i),a.forEach(u=>r._free(u)),s}}}),zo,Ao,Oo,Et,Bo,Np,B0=U(()=>{"use strict";Wt(),Xa(),zo=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},Ao=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},Oo=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},Et=(e,t,r,i)=>{let a=Ye(t,i),n=Ye(r,i);ge()._OrtAddSessionConfigEntry(e,a,n)!==0&&ce(`Can't set a session config entry: ${t} - ${r}.`)},Bo=async(e,t,r)=>{let i=t.executionProviders;for(let a of i){let n=typeof a=="string"?a:a.name,s=[],u;switch(n){case"webnn":if(n="WEBNN",Et(e,"session.disable_quant_qdq","1",r),Et(e,"session.disable_qdq_constant_folding","1",r),typeof a!="string"){let g=a==null?void 0:a.deviceType;g&&Et(e,"deviceType",g,r)}break;case"webgpu":if(n="JS",typeof a!="string"){let g=a;if(g!=null&&g.preferredLayout){if(g.preferredLayout!=="NCHW"&&g.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${g.preferredLayout}`);Et(e,"preferredLayout",g.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${n}`)}let l=s.length,p=0,c=0;if(l>0){p=ge()._malloc(l*ge().PTR_SIZE),r.push(p),c=ge()._malloc(l*ge().PTR_SIZE),r.push(c);for(let g=0;g<l;g++)ge().setValue(p+g*ge().PTR_SIZE,s[g][0],"*"),ge().setValue(c+g*ge().PTR_SIZE,s[g][1],"*")}let m;if(u===void 0){let g=Ye(n,r);m=await ge()._OrtAppendExecutionProvider(e,g,p,c,l)}m!==0&&ce(`Can't append execution provider: ${n}.`)}},Np=async e=>{let t=ge(),r=0,i=[],a=e||{};Oo(a);try{let n=zo(a.graphOptimizationLevel??"all"),s=Ao(a.executionMode??"sequential"),u=typeof a.logId=="string"?Ye(a.logId,i):0,l=a.logSeverityLevel??2;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log severity level is not valid: ${l}`);let p=a.logVerbosityLevel??0;if(!Number.isInteger(p)||p<0||p>4)throw new Error(`log verbosity level is not valid: ${p}`);let c=typeof a.optimizedModelFilePath=="string"?Ye(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(n,!!a.enableCpuMemArena,!!a.enableMemPattern,s,!!a.enableProfiling,0,u,l,p,c),r===0&&ce("Can't create session options."),a.executionProviders&&await Bo(r,a,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);Et(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[m,g]of Object.entries(a.freeDimensionOverrides)){if(typeof m!="string")throw new Error(`free dimension override name must be a string: ${m}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw new Error(`free dimension override value must be a non-negative integer: ${g}`);let _=Ye(m,i);t._OrtAddFreeDimensionOverride(r,_,g)!==0&&ce(`Can't set a free dimension override: ${m} - ${g}.`)}return a.extra!==void 0&&Kr(a.extra,"",new WeakSet,(m,g)=>{Et(r,m,g,i)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&ce("Can't release session options."),i.forEach(s=>t._free(s)),n}}}),Nt,pt,Dt,ti,Zr,Ya,Ja,Ca,te=U(()=>{"use strict";Nt=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},pt=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},Dt=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,n)=>a*n,1);return r>0?Math.ceil(i*r):void 0},ti=e=>{switch(e){case"float16":return typeof Float16Array<"u"?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Zr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Ya=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Ja=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Ca=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),ri,en=U(()=>{"use strict";Ka(),ri=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),n;try{n=new ArrayBuffer(i)}catch(u){if(u instanceof RangeError){let l=Math.ceil(i/65536);n=new WebAssembly.Memory({initial:l,maximum:l}).buffer}else throw u}let s=0;for(;;){let{done:u,value:l}=await a.read();if(u)break;let p=l.byteLength;new Uint8Array(n,s,p).set(l),s+=p}return new Uint8Array(n,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),Ro,No,Do,Mo,tn,Uo,le,ct=U(()=>{"use strict";te(),Ro=["V","I","W","E","F"],No=(e,t)=>{console.log(`[${Ro[e]},${new Date().toISOString()}]${t}`)},tn=(e,t)=>{Do=e,Mo=t},Uo=(e,t)=>{let r=Zr(e),i=Zr(Do);r>=i&&No(r,typeof t=="function"?t():t)},le=(...e)=>{Mo&&Uo(...e)}}),Po,Qt,O,Qr,Dp,Mp,Up,ie=U(()=>{"use strict";Po=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Qt=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let n=Math.max(e.length,t.length),s=new Array(n);if(r){if(i<2||a<2)return;let u=Po.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(u===void 0)return;[s[n-2],s[n-1]]=u}for(let u=r?3:1;u<=n;u++){let l=i-u<0?1:e[i-u],p=a-u<0?1:t[a-u];if(l!==p&&l>1&&p>1)return;let c=Math.max(l,p);if(l&&p)s[n-u]=Math.max(l,p);else{if(c>1)return;s[n-u]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},O=class Hr{static size(t){return Hr.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),n=i-1;for(;n>=0;){if(t[n]%r===0){a[n]=t[n]/r;break}if(r%t[n]!==0)throw new Error("cannot convert shape");a[n]=1,r/=t[n],n--}for(n--;n>=0;n--)a[n]=t[n];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Hr.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Hr.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let n=r;n<i;n++){if(t[n]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[n])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,n)=>a+r[n]+r[n+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},Qr=class wt{static adjustPoolAttributes(t,r,i,a,n,s){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=i.length?i.push(r[u+2]):i[u]=r[u+2];for(let u=0;u<i.length;u++)if(u<a.length){if(a[u]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let u=0;u<i.length;u++)if(u<n.length){if(n[u]<0)throw new Error("dilations should be greater than or equal to 1")}else n.push(1);for(let u=0;u<i.length*2;u++)if(u<s.length){if(s[u]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let u=0;u<i.length;u++){if(i[u]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[u]>=i[u]||s[u+i.length]>=i[u])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,n,s,u){if(u){if(n.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let l=0;l<t.length-2;l++)wt.adjustPadAndReturnShape(t[l+(s?1:2)],r[l],i[l],a[l],n,l,l+t.length-2,u)}}static computePoolOutputShape(t,r,i,a,n,s,u,l=0){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let p=[r[0],r[1]];return wt.computeShapeHelper(t,r,p,i,a,n,s,u,l),p}static computeConvOutputShape(t,r,i,a,n,s,u){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let l=[t[0],r[0]];return wt.computeShapeHelper(!1,t,l,i,a,n,s,u),l}static computeShapeHelper(t,r,i,a,n,s,u,l,p=0){if(t)for(let c=0;c<r.length-2;c++)i.push(1);else for(let c=0;c<r.length-2;c++)i.push(wt.adjustPadAndReturnShape(r[c+2],a[c],n[c],s[c],u,c,c+r.length-2,l,p))}static computeOutputSize(t,r,i,a,n){let s=Math.floor(t/r)+1;return n===1&&(s=Math.ceil(t/r)+1,(s-1)*r>=i+a&&(s-=1)),s}static adjustPadAndReturnShape(t,r,i,a,n,s,u,l,p=0){let c=i*(a-1)+1;if(l&&l!=="NOTSET")switch(l){case"VALID":return n[s]=0,n[u]=0,wt.computeOutputSize(t-c,r,t,0,p);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let m=(Math.floor((t+r-1)/r)-1)*r+a-t;return n[s]=Math.floor(l==="SAME_LOWER"?(m+1)/2:m/2),n[u]=m-n[s],wt.computeOutputSize(t+n[s]+n[u]-c,r,t,n[s],p)}default:throw new Error("Unsupported AutoPad type")}else return wt.computeOutputSize(t+n[s]+n[u]-c,r,t,n[s],p)}},Dp=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let n,s,u;t?(n=e[1],s=e[0]):(n=e[0],s=e[1]);let l=-1;if(i?(u=r[0],l=1):(u=r[1],l=0),r[l]!==s)throw new Error("dimension mismatch");if(n<=0||u<=0||s<=0)throw new Error("invalid shape specified");if(a&&!Qt.isValidBroadcast(a,[n,u]))throw new Error("gemm: invalid bias shape for broadcast");return[n,u,s]}},Mp=-34028234663852886e22,Up=34028234663852886e22}),rn,Pp=U(()=>{"use strict";te(),rn=(e,t)=>new(ti(t))(e)}),Ui,Lo,Pi,qo,Li,Wo,qi,Wi,Vi,Vo,Lp,R0=U(()=>{"use strict";te(),ct(),Ui=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),Lo=(e,t)=>{if(t==="int32")return e;let r=Ui.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,n=new(ti(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let s=new Int32Array(a);for(let u=0;u<a;u++){let l=n[u];if(l>2147483647n||l<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[u]=Number(l)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&n.some(u=>u>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(n,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Pi=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(n=>n<-128||n>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},qo=1,Li=()=>qo++,Wo=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),qi=(e,t)=>{let r=Ui.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},Wi=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:n,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=n,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return qi(this.dataType,this.tensorShape)}destroy(){le("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Pi(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return new Uint8Array(r).buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},Vi=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),n=this.tensorManager.getMLOpSupportLimits(e),s;if(!(n!=null&&n.input.dataTypes.includes(t))){if(s=Wo.get(t),!s||!(n!=null&&n.input.dataTypes.includes(s)))throw new Error(`WebNN backend does not support data type: ${t}`);le("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==qi(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,u,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=Lo(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else le("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){var t,r;if(this.activeUpload){let i=(t=this.wrapper)!=null&&t.isDataConverted?Pi(this.activeUpload,(r=this.wrapper)==null?void 0:r.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(i):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(i);return}else return i.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},Vo=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Li();return this.tensorTrackersById.set(e,new Vi(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){le("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let n=this.tensorTrackersById.get(t);if(!n)throw new Error("Tensor not found.");return n.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){le("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t==null?void 0:t.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),n=Li(),s=new Wi({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(n,new Vi(this,s)),this.externalTensors.add(s),n}async getCachedTensor(e,t,r,i,a,n,s){let u=this.getMLContext(e);for(let[p,c]of this.freeTensors.entries())if(c.canReuseTensor(u,t,r)){le("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let m=this.freeTensors.splice(p,1)[0];return m.sessionId=e,m}le("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let l=await u.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:a,readable:n});return new Wi({sessionId:e,context:u,tensor:l,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},Lp=(...e)=>new Vo(...e)}),ir,Go,qp,N0=U(()=>{"use strict";te(),Wt(),Pp(),R0(),ct(),ir=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),Go=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,n)=>a===i[n]&&e[a]===t[a])},qp=class{constructor(e){this.tensorManager=Lp(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,tn(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){le("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){le("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)le("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>Go(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){le("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let n=ir.get(r);if(!n)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,n,i,a)}async createTemporaryTensor(e,t,r){le("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=ir.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let n=this.temporarySessionTensorIds.get(e);return n?n.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!ge().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");le("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return rn(r,t)}}registerMLTensor(e,t,r,i){let a=ir.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let n=this.tensorManager.registerTensor(e,t,a,i);return le("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${n}}`),n}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=ir.get(Nt(t)),a=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!(a!=null&&a.input.dataTypes.includes(i)):!!(a!=null&&a.output.dataTypes.includes(i))}flush(){}}}),an=U(()=>{"use strict"}),Gi,Rr,Nr,Ho,Fo,Hi,za,jo,Wp,D0=U(()=>{"use strict";ct(),an(),Gi=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Rr=[],Nr=e=>Math.ceil(Number(e)/16)*16,Ho=e=>{for(let t=0;t<Rr.length;t++){let r=Rr[t];if(e<=r)return r}return Math.ceil(e/16)*16},Fo=1,Hi=()=>Fo++,za=async(e,t,r,i)=>{let a=Nr(r),n=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,n,0,a),e.flush(),await n.mapAsync(GPUMapMode.READ);let u=n.getMappedRange();if(i){let l=i();return l.set(new Uint8Array(u,0,r)),l}else return new Uint8Array(u.slice(0,r))}finally{n.destroy()}},jo=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Gi)Rr.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,n=Nr(a),s=this.storageCache.get(e);if(!s)throw new Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${a}`);if(n===a&&i%4===0)this.backend.device.queue.writeBuffer(s.gpuData.buffer,0,r,i,a);else{let u=new Uint8Array(n);u.set(t),this.backend.device.queue.writeBuffer(s.gpuData.buffer,0,u,0,n)}le("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=Nr(r.originalSize),n=this.backend.getCommandEncoder();this.backend.endComputePass(),n.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return le("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Hi();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),le("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),le("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=Ho(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,n=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||n){let u=(a?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?i=u.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:Hi(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),le("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){var t;return(t=this.storageCache.get(e))==null?void 0:t.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return le("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await za(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Gi.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(le("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},Wp=(...e)=>new jo(...e)}),Ko,he,ke=U(()=>{"use strict";Ko=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},he=e=>new Ko(e)}),Xt,Dr,Ce,Ee,Q,Se,Aa,Zt,$t,Z,ar,D,F,Vp,nn,Zo,Gp,ae=U(()=>{"use strict";te(),ie(),Xt=64,Dr=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},Ce=(e,t=1)=>{let r=Dr(e,t);return typeof r=="string"?r:r[0]},Ee=(e,t=1)=>{let r=Dr(e,t);return typeof r=="string"?r:r[1]},Q=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:O.computeStrides(r)})}),t},Se=e=>e%4===0?4:e%2===0?2:1,Aa=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,Zt=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,$t=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Z=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,ar=(e,t,r,i,a)=>{let n=typeof r=="number",s=n?r:r.length,u=[...new Array(s).keys()],l=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,p=Dr(t,a),c=typeof p=="string"?p:p[1],m=typeof p=="string"?p:p[0],g={indices:l,value:c,storage:m,tensor:t},_=R=>typeof R=="string"?R:`${R}u`,y={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},x=n?"uniforms.":"",S=`${x}${e}_shape`,$=`${x}${e}_strides`,w="";for(let R=0;R<s-1;R++)w+=`
    let dim${R} = current / ${Z($,R,s)};
    let rest${R} = current % ${Z($,R,s)};
    indices[${R}] = dim${R};
    current = rest${R};
    `;w+=`indices[${s-1}] = current;`;let k=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${w}
    return indices;
  }`,I=R=>(y.offsetToIndices=!0,s<2?R:`o2i_${e}(${R})`),E=[];if(s>=2)for(let R=s-1;R>=0;R--)E.push(`${Z($,R,s)} * (indices[${R}])`);let C=s<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${E.join("+")};
  }`,A=R=>(y.indicesToOffset=!0,s<2?R:`i2o_${e}(${R})`),v=(...R)=>s===0?"0u":`${g.indices}(${R.map(_).join(",")})`,M=(R,K)=>s<2?`${R}`:`${Z(R,K,s)}`,P=(R,K,X)=>s<2?`${R}=${X};`:`${Z(R,K,s)}=${X};`,G={},W=(R,K)=>{y.broadcastedIndicesToOffset=!0;let X=`${K.name}broadcastedIndicesTo${e}Offset`;if(X in G)return`${X}(${R})`;let L=[];for(let _e=s-1;_e>=0;_e--){let $e=K.indicesGet("outputIndices",_e+K.rank-s);L.push(`${M($,_e)} * (${$e} % ${M(S,_e)})`)}return G[X]=`fn ${X}(outputIndices: ${K.type.indices}) -> u32 {
             return ${L.length>0?L.join("+"):"0u"};
           }`,`${X}(${R})`},H=(R,K)=>(()=>{if(g.storage===g.value)return`${e}[${R}]=${K};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${R}]=vec2<u32>(u32(${K}), select(0u, 0xFFFFFFFFu, ${K} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${R}]=vec2<u32>(u32(${K}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${R}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${K}));`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),B=R=>(()=>{if(g.storage===g.value)return`${e}[${R}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${R}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${R}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${R}] & 0xFFu), bool(${e}[${R}] & 0xFF00u), bool(${e}[${R}] & 0xFF0000u), bool(${e}[${R}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),j=s<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${c} {
    return ${B(`i2o_${e}(indices)`)};
  }`,Y=s<2?"":(()=>{let R=u.map(X=>`d${X}: u32`).join(", "),K=u.map(X=>`d${X}`).join(", ");return`
  fn get_${e}(${R}) -> ${c} {
    return get_${e}ByIndices(${v(K)});
  }`})(),ee=(...R)=>{if(R.length!==s)throw new Error(`indices length must be ${s}`);let K=R.map(_).join(",");return s===0?B("0u"):s===1?B(K[0]):(y.get=!0,y.getByIndices=!0,y.indicesToOffset=!0,`get_${e}(${K})`)},re=R=>s<2?B(R):(y.getByIndices=!0,y.indicesToOffset=!0,`get_${e}ByIndices(${R})`),J=s<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${c}) {
    ${H(`i2o_${e}(indices)`,"value")}
  }`,ye=s<2?"":(()=>{let R=u.map(X=>`d${X}: u32`).join(", "),K=u.map(X=>`d${X}`).join(", ");return`
  fn set_${e}(${R}, value: ${c}) {
    set_${e}ByIndices(${v(K)}, value);
  }`})();return{impl:()=>{let R=[],K=!1;return y.offsetToIndices&&(R.push(k),K=!0),y.indicesToOffset&&(R.push(C),K=!0),y.broadcastedIndicesToOffset&&(Object.values(G).forEach(X=>R.push(X)),K=!0),y.set&&(R.push(ye),K=!0),y.setByIndices&&(R.push(J),K=!0),y.get&&(R.push(Y),K=!0),y.getByIndices&&(R.push(j),K=!0),!n&&K&&R.unshift(`const ${S} = ${g.indices}(${r.join(",")});`,`const ${$} = ${g.indices}(${O.computeStrides(r).join(",")});`),R.join(`
`)},type:g,offsetToIndices:I,indicesToOffset:A,broadcastedIndicesToOffset:W,indices:v,indicesGet:M,indicesSet:P,set:(...R)=>{if(R.length!==s+1)throw new Error(`indices length must be ${s}`);let K=R[s];if(typeof K!="string")throw new Error("value must be string");let X=R.slice(0,s).map(_).join(",");return s===0?H("0u",K):s===1?H(X[0],K):(y.set=!0,y.setByIndices=!0,y.indicesToOffset=!0,`set_${e}(${X}, ${K})`)},setByOffset:H,setByIndices:(R,K)=>s<2?H(R,K):(y.setByIndices=!0,y.indicesToOffset=!0,`set_${e}ByIndices(${R}, ${K});`),get:ee,getByOffset:B,getByIndices:re,usage:i,name:e,strides:$,shape:S,rank:s}},D=(e,t,r,i=1)=>ar(e,t,r,"input",i),F=(e,t,r,i=1)=>ar(e,t,r,"output",i),Vp=(e,t,r)=>ar(e,t,r,"atomicOutput",1),nn=(e,t,r,i=1)=>ar(e,t,r,"internal",i),Zo=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=Xt){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,n=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${n}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},Gp=(e,t)=>new Zo(e,t)}),Qo,Fi,Xo,Yo,Jo,eu,qe,Hp,Fp,bt=U(()=>{"use strict";te(),ie(),ke(),ae(),Qo=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Fi=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),Xo=(e,t)=>O.sortBasedOnPerm(e,Fi(e.length,t)),Yo=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let n=0;n<t;++n)a+=`a[${e[n]}]=i[${n}];`;return a+="return a;}"},Jo=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},eu=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},qe=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Fi(i,t),n=Xo(e.dims,a),s=e.dims,u=n,l=i<2||eu(a,e.dims),p;if(l)return p=y=>{let x=D("input",r,s,4),S=F("output",r,u,4);return`
  ${y.registerUniform("output_size","u32").declareVariables(x,S)}
  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let y=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(y/64/4)},programUniforms:[{type:12,data:Math.ceil(y/4)}]}},getShaderSource:p};let{newShape:c,newPerm:m}=Jo(e.dims,a),g=O.areEqual(m,[2,3,1]),_=O.areEqual(m,[3,1,2]);if(c.length===2||g||_){s=g?[c[0],c[1]*c[2]]:_?[c[0]*c[1],c[2]]:c,u=[s[1],s[0]];let y=16;return p=x=>{let S=D("a",r,s.length),$=F("output",r,u.length);return`
  ${x.registerUniform("output_size","u32").declareVariables(S,$)}
  var<workgroup> tile : array<array<${$.type.value}, ${y+1}>, ${y}>;
  ${x.mainStart([y,y,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${y} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${y}u + local_id.x;
    let input_row = workgroup_id_x * ${y}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${S.getByIndices(`${S.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${y}u + local_id.x;
    let output_row = workgroup_id_y * ${y}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${$.setByIndices(`${$.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let x=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/y),y:Math.ceil(u[0]/y)},programUniforms:[{type:12,data:x},...Q(s,u)]}},getShaderSource:p}}return p=y=>{let x=D("a",r,s.length),S=F("output",r,u.length);return`
  ${y.registerUniform("output_size","u32").declareVariables(x,S)}

  ${Yo(a,i,x,S)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${S.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${S.setByOffset("global_idx",x.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let y=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:[{type:12,data:y},...Q(s,u)]}},getShaderSource:p}},Hp=(e,t)=>{Qo(e.inputs,t.perm),e.compute(qe(e.inputs[0],t.perm))},Fp=e=>he({perm:e.perm})}),tu,ru,iu,au,nu,su,ou,uu,lu,du,je,jp,Kp,Zp,Qp,Xp,Yp,Jp,ec,tc,rc,M0=U(()=>{"use strict";te(),ie(),ae(),sn(),bt(),tu={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},ru={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},iu={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},au={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},nu=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},su=(e,t)=>{let r=[],i=e.length;for(let n=0;n<i;n++)t.indexOf(n)===-1&&r.push(e[n]);let a=t.map(n=>e[n]);return[r,a]},ou=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let n=0;n<r;n++)t.indexOf(n)===-1?i.push(e[a++]):i.push(1);return i},uu=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},lu=(e,t)=>{let r=[];if(!uu(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},du=(e,t,r,i,a,n,s)=>{let u=r[0].dims,l=O.size(n),p=O.size(s),c=D("_A",r[0].dataType,u),m=F("output",a,n),g=64;l===1&&(g=256);let _=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,y=x=>`
        ${x.registerUniform("reduceSize","u32").declareVariables(c,m)}
        ${_}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${x.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${iu[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${c.getByOffset("offset + k")});
           bestValue = ${tu[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${ru[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${m.setByOffset("outputIndex",`${i==="mean"?`${m.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${m.type.storage}(${au[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:y,getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:l},programUniforms:[{type:12,data:p}]})}},je=(e,t,r,i)=>{let a=e.inputs.length===1?r:Oa(e.inputs,r),n=a.axes;n.length===0&&!a.noopWithEmptyAxes&&(n=e.inputs[0].dims.map((_,y)=>y));let s=O.normalizeAxes(n,e.inputs[0].dims.length),u=s,l=e.inputs[0],p=lu(u,e.inputs[0].dims.length);p.length>0&&(l=e.compute(qe(e.inputs[0],p),{inputs:[0],outputs:[-1]})[0],u=nu(u.length,l.dims.length));let[c,m]=su(l.dims,u),g=c;a.keepDims&&(g=ou(c,s)),e.compute(du(t,a.cacheKey,[l],i,e.inputs[0].dataType,g,m),{inputs:[l]})},jp=(e,t)=>{je(e,"ReduceMeanShared",t,"mean")},Kp=(e,t)=>{je(e,"ReduceL1Shared",t,"l1")},Zp=(e,t)=>{je(e,"ReduceL2Shared",t,"l2")},Qp=(e,t)=>{je(e,"ReduceLogSumExpShared",t,"logSumExp")},Xp=(e,t)=>{je(e,"ReduceMaxShared",t,"max")},Yp=(e,t)=>{je(e,"ReduceMinShared",t,"min")},Jp=(e,t)=>{je(e,"ReduceProdShared",t,"prod")},ec=(e,t)=>{je(e,"ReduceSumShared",t,"sum")},tc=(e,t)=>{je(e,"ReduceSumSquareShared",t,"sumSquare")},rc=(e,t)=>{je(e,"ReduceLogSumShared",t,"logSum")}}),Ke,pu,Xr,Oa,Ze,cu,hu,fu,mu,gu,yu,_u,wu,$u,bu,Qe,ic,ac,nc,sc,oc,uc,lc,dc,pc,cc,sn=U(()=>{"use strict";te(),ie(),ke(),ae(),M0(),Ke=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},pu=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Xr=(e,t,r,i,a,n,s=!1,u=!1)=>{let l=[],p=r[0].dims,c=p.length,m=O.normalizeAxes(a,c),g=!u&&m.length===0;p.forEach((x,S)=>{g||m.indexOf(S)>=0?s&&l.push(1):l.push(x)});let _=l.length,y=O.size(l);return{name:e,shaderCache:t,getShaderSource:x=>{let S=[],$=D("_A",r[0].dataType,c),w=F("output",n,_),k=i($,w,m),I=k[2];for(let E=0,C=0;E<c;E++)g||m.indexOf(E)>=0?(s&&C++,I=`for(var j${E}: u32 = 0; j${E} < ${p[E]}; j${E}++) {
                  ${k[2].includes("last_index")?`let last_index = j${E};`:""}
                  ${$.indicesSet("input_indices",E,`j${E}`)}
                  ${I}
                }`):(S.push(`${$.indicesSet("input_indices",E,w.indicesGet("output_indices",C))};`),C++);return`

        ${x.registerUniform("output_size","u32").declareVariables($,w)}

        ${x.mainStart()}
          ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${$.type.indices};
          let output_indices = ${w.offsetToIndices("global_idx")};

          ${S.join(`
`)}
          ${k[0]}       // init ops for reduce max/min
          ${k[1]}
          ${I}
          ${k[3]}
          ${k.length===4?w.setByOffset("global_idx","value"):k.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:l,dataType:n}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:[{type:12,data:y},...Q(p,l)]})}},Oa=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),he({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Ze=(e,t,r,i)=>{let a=e.inputs,n=a.length===1?r:Oa(a,r);e.compute(Xr(t,{hint:n.cacheKey,inputDependencies:["rank"]},[a[0]],n.noopWithEmptyAxes&&n.axes.length===0?pu:i,n.axes,a[0].dataType,n.keepDims,n.noopWithEmptyAxes),{inputs:[0]})},cu=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},hu=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},fu=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},mu=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},gu=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceMax",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(r.indicesSet("input_indices",s,0));return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},yu=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceMean",t,(r,i,a)=>{let n=1;for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&(n*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${n});`]})},_u=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceMin",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(`input_indices[${s}] = 0;`);return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},wu=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},$u=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},bu=(e,t)=>{Ke(e.inputs),Ze(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Qe=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let n=0;n<t.length;n++)t.indexOf(n)===-1?i*=e[n]:a*=e[n];return a<32&&i>1024},ic=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?yu(e,t):jp(e,t)},ac=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?hu(e,t):Kp(e,t)},nc=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?fu(e,t):Zp(e,t)},sc=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?mu(e,t):Qp(e,t)},oc=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?gu(e,t):Xp(e,t)},uc=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?_u(e,t):Yp(e,t)},lc=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?wu(e,t):Jp(e,t)},dc=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?$u(e,t):ec(e,t)},pc=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?bu(e,t):tc(e,t)},cc=(e,t)=>{Qe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?cu(e,t):rc(e,t)}}),ji,hc,fc,Ba,U0=U(()=>{"use strict";te(),ke(),sn(),ji=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},hc=(e,t)=>{ji(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Xr("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},fc=(e,t)=>{ji(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Xr("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Ba=e=>he(e)}),vu,Mr,xu,Su,ku,_r,Tu,mc,on=U(()=>{"use strict";te(),ie(),an(),ae(),vu=(e,t)=>{let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4],u=e[5];if(s&&u)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let l=r.dims[0],p=r.dims[1],c=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==c)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let m=a.dims[0]/3,g=m,_=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let k of t.qkvHiddenSizes)if(k%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");m=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],_=t.qkvHiddenSizes[2]}let y=p;if(m!==g)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==m+g+_)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let x=0;if(s){if(g!==_)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==l)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==g/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(x=s.dims[3])}let S=y+x,$=-1,w=0;if(n)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(u){if(u.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==l||u.dims[1]!==t.numHeads||u.dims[2]!==p||u.dims[3]!==S)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:p,pastSequenceLength:x,kvSequenceLength:y,totalSequenceLength:S,maxSequenceLength:$,inputHiddenSize:c,hiddenSize:m,vHiddenSize:_,headSize:Math.floor(m/t.numHeads),vHeadSize:Math.floor(_/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:w,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Mr=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e==null?void 0:e.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,xu=(e,t,r,i,a,n,s,u)=>{let l=Se(s?1:n),p=64,c=n/l;c<p&&(p=32);let m=Math.ceil(n/l/p),g=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:c},{type:12,data:m}],_=Ce(e.dataType,l),y=Ee(1,l),x=["type"];s&&x.push("type"),u&&x.push("type");let S=$=>{let w=F("x",e.dataType,e.dims,l),k=[w],I=s?D("seq_lens",s.dataType,s.dims):void 0;I&&k.push(I);let E=u?D("total_sequence_length_input",u.dataType,u.dims):void 0;E&&k.push(E);let C=Ee(e.dataType),A=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${p}>;
  var<workgroup> thread_sum: array<f32, ${p}>;
  ${$.registerUniforms(A).declareVariables(...k)}
  ${$.mainStart([p,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Mr(I,E,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${p}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${y}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${y}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(l){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${p}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${y}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${y}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(l){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${p}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${w.type.value}(${C}(1.0) / ${C}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${y}(x[offset + i]);
        x[offset + i] = ${w.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${w.type.value}(${C}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${p};${_};${l}`,inputDependencies:x},getShaderSource:S,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:g})}},Su=(e,t,r,i,a,n,s,u,l)=>{let p=s+n.kvSequenceLength,c=[n.batchSize,n.numHeads,n.sequenceLength,p],m=e>1&&i,g=n.kvNumHeads?n.kvNumHeads:n.numHeads,_=m?[n.batchSize,g,p,n.headSize]:void 0,y=n.nReps?n.nReps:1,x=n.scale===0?1/Math.sqrt(n.headSize):n.scale,S=Se(n.headSize),$=n.headSize/S,w=12,k={x:Math.ceil(p/w),y:Math.ceil(n.sequenceLength/w),z:n.batchSize*n.numHeads},I=[{type:12,data:n.sequenceLength},{type:12,data:$},{type:12,data:p},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:1,data:x},{type:12,data:s},{type:12,data:n.kvSequenceLength},{type:12,data:y}],E=m&&i&&O.size(i.dims)>0,C=["type","type"];E&&C.push("type"),a&&C.push("type"),u&&C.push("type"),l&&C.push("type");let A=[{dims:c,dataType:t.dataType,gpuDataType:0}];m&&A.push({dims:_,dataType:t.dataType,gpuDataType:0});let v=M=>{let P=D("q",t.dataType,t.dims,S),G=D("key",r.dataType,r.dims,S),W=[P,G];if(E){let J=D("past_key",i.dataType,i.dims,S);W.push(J)}a&&W.push(D("attention_bias",a.dataType,a.dims));let H=u?D("seq_lens",u.dataType,u.dims):void 0;H&&W.push(H);let B=l?D("total_sequence_length_input",l.dataType,l.dims):void 0;B&&W.push(B);let j=F("output",t.dataType,c),Y=[j];m&&Y.push(F("present_key",t.dataType,_,S));let ee=Ee(1,S),re=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${w}u;

  var<workgroup> tileQ: array<${P.type.storage}, ${w*w}>;
  var<workgroup> tileK: array<${P.type.storage}, ${w*w}>;
  ${M.registerUniforms(re).declareVariables(...W,...Y)}
  ${M.mainStart([w,w,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${y===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${y===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Mr(H,B,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${E&&m?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${m?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${ee}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${E&&m?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${m?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${ee}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(S){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${S}`)}})()};
        output[outputIdx] = ${j.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${S};${a!==void 0};${i!==void 0};${e}`,inputDependencies:C},getRunData:()=>({outputs:A,dispatchGroup:k,programUniforms:I}),getShaderSource:v}},ku=(e,t,r,i,a,n,s=void 0,u=void 0)=>{let l=n+a.kvSequenceLength,p=a.nReps?a.nReps:1,c=a.vHiddenSize*p,m=e>1&&i,g=a.kvNumHeads?a.kvNumHeads:a.numHeads,_=m?[a.batchSize,g,l,a.headSize]:void 0,y=[a.batchSize,a.sequenceLength,c],x=12,S={x:Math.ceil(a.vHeadSize/x),y:Math.ceil(a.sequenceLength/x),z:a.batchSize*a.numHeads},$=[{type:12,data:a.sequenceLength},{type:12,data:l},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:c},{type:12,data:n},{type:12,data:a.kvSequenceLength},{type:12,data:p}],w=m&&i&&O.size(i.dims)>0,k=["type","type"];w&&k.push("type"),s&&k.push("type"),u&&k.push("type");let I=[{dims:y,dataType:t.dataType,gpuDataType:0}];m&&I.push({dims:_,dataType:t.dataType,gpuDataType:0});let E=C=>{let A=D("probs",t.dataType,t.dims),v=D("v",r.dataType,r.dims),M=[A,v];w&&M.push(D("past_value",i.dataType,i.dims));let P=s?D("seq_lens",s.dataType,s.dims):void 0;s&&M.push(P);let G=u?D("total_sequence_length_input",u.dataType,u.dims):void 0;u&&M.push(G);let W=[F("output",t.dataType,y)];m&&W.push(F("present_value",t.dataType,_));let H=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${x}u;
  var<workgroup> tileQ: array<${A.type.value}, ${x*x}>;
  var<workgroup> tileV: array<${A.type.value}, ${x*x}>;
  ${C.registerUniforms(H).declareVariables(...M,...W)}
  ${C.mainStart([x,x,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${p===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${p===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Mr(P,G,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${w&&m?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${m?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${A.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${w&&m?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${m?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:k},getRunData:()=>({outputs:I,dispatchGroup:S,programUniforms:$}),getShaderSource:E}},_r=(e,t,r,i,a,n,s,u,l,p,c=void 0,m=void 0)=>{let g=Math.min(e.outputCount,1+(s?1:0)+(u?1:0)),_=g>1?s:void 0,y=g>1?u:void 0,x=g>1?p.pastSequenceLength:0,S=x+p.kvSequenceLength,$=l&&O.size(l.dims)>0?l:void 0,w=[t,r];_&&O.size(_.dims)>0&&w.push(_),$&&w.push($),c&&w.push(c),m&&w.push(m);let k=e.compute(Su(g,t,r,_,$,p,x,c,m),{inputs:w,outputs:g>1?[-1,1]:[-1]})[0];e.compute(xu(k,p.batchSize,p.numHeads,x,p.sequenceLength,S,c,m),{inputs:c&&m?[k,c,m]:[k],outputs:[]});let I=[k,i];y&&O.size(y.dims)>0&&I.push(y),c&&I.push(c),m&&I.push(m),e.compute(ku(g,k,i,y,p,x,c,m),{inputs:I,outputs:g>1?[0,2]:[0]})},Tu=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,n=t.headSize,s=12,u={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},l=[e.inputs[0],e.inputs[1],e.inputs[2]],p=[{type:12,data:i},{type:12,data:a},{type:12,data:n},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],c=m=>{let g=F("output_q",l[0].dataType,r),_=F("output_k",l[0].dataType,r),y=F("output_v",l[0].dataType,r),x=D("input",l[0].dataType,l[0].dims),S=D("weight",l[1].dataType,l[1].dims),$=D("bias",l[2].dataType,l[2].dims),w=x.type.storage,k=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${w}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${w}, ${s*s}>;
  var<workgroup> tileWeightK: array<${w}, ${s*s}>;
  var<workgroup> tileWeightV: array<${w}, ${s*s}>;
  ${m.registerUniforms(k).declareVariables(x,S,$,g,_,y)}
  ${m.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${w}(0);
    var valueK = ${w}(0);
    var valueV = ${w}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:p}),getShaderSource:c},{inputs:l,outputs:[-1,-1,-1]})},mc=(e,t)=>{let r=vu(e.inputs,t),[i,a,n]=Tu(e,r);return _r(e,i,a,n,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),Iu,Eu,Cu,gc,P0=U(()=>{"use strict";We(),te(),ie(),ke(),ae(),Iu=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,n)=>{let s=a.length;if(s!==i.length)throw new Error(`${n}: num dimensions != ${s}`);a.forEach((u,l)=>{if(u!==i[l])throw new Error(`${n}: dim[${l}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},Eu=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,n=e[0].dims,s=i?Se(n[n.length-1]):1,u=a==="NHWC"&&n.length>1?s:1,l=O.size(n)/s,p=i,c=p?n.length:n,m=D("x",e[0].dataType,e[0].dims,s),g=D("scale",e[1].dataType,e[1].dims,u),_=D("bias",e[2].dataType,e[2].dims,u),y=D("inputMean",e[3].dataType,e[3].dims,u),x=D("inputVar",e[4].dataType,e[4].dims,u),S=F("y",e[0].dataType,c,s),$=()=>{let k="";if(i)k=`let cOffset = ${n.length===1?"0u":a==="NHWC"?`outputIndices[${n.length-1}] / ${s}`:"outputIndices[1]"};`;else if(a==="NCHW")k=`
            ${S.indicesSet("outputIndices","0","0")}
            let cOffset = ${S.indicesToOffset("outputIndices")};`;else{k=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${n.length-1}];`;for(let I=1;I<g.rank;I++)k+=`cIndices[${I}] = outputIndices[${I}];`;k+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return k},w=k=>`
  const epsilon = ${r};
  ${k.registerUniform("outputSize","u32").declareVariables(m,g,_,y,x,S)}
  ${k.mainStart()}
  ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${S.offsetToIndices(`global_idx * ${s}`)};
    ${$()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${_.getByOffset("cOffset")};
    let inputMean = ${y.getByOffset("cOffset")};
    let inputVar = ${x.getByOffset("cOffset")};
    let x = ${m.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${S.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:p?["rank","type","type","type","type"]:void 0},getShaderSource:w,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p?[{type:12,data:l},...Q(n)]:[{type:12,data:l}]})}},Cu=e=>he(e),gc=(e,t)=>{let{inputs:r,outputCount:i}=e,a=Cu({...t,outputCount:i});if(ve.webgpu.validateInputContent&&Iu(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(Eu(r,a))}}),zu,Au,yc,L0=U(()=>{"use strict";ie(),ae(),zu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Au=e=>{let t=e[0].dims,r=e[0].dims[2],i=O.size(t)/4,a=e[0].dataType,n=D("input",a,t,4),s=D("bias",a,[r],4),u=D("residual",a,t,4),l=F("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:p=>`
  const channels = ${r}u / 4;
  ${p.declareVariables(n,s,u,l)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${n.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${l.setByOffset("global_idx","value")}
  }`}},yc=e=>{zu(e.inputs),e.compute(Au(e.inputs))}}),Ou,pe,_c,wc,$c,bc,vc,xc,Sc,kc,Tc,Bu,Ic,Ec,Cc,zc,fr,Ac,Fr,Oc,Bc,Rc,Nc,Dc,Mc,Uc,Pc,Lc,qc,Wc,Vc,Gc,Hc,Fc,jc,Kc,Ki,Zc,Ra,Na,Qc,Xc,Yc,Ru,Nu,Jc,un=U(()=>{"use strict";te(),ie(),ke(),ae(),Ou=(e,t,r,i,a,n,s)=>{let u=Math.ceil(t/4),l="";typeof a=="string"?l=`${a}(a)`:l=a("a");let p=D("inputData",r,[u],4),c=F("outputData",i,[u],4),m=[{name:"vec_size",type:"u32"}];return s&&m.push(...s),`
      ${e.registerUniforms(m).declareVariables(p,c)}

  ${n??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${p.getByOffset("global_idx")};
    ${c.setByOffset("global_idx",l)}
  }`},pe=(e,t,r,i,a,n=e.dataType,s,u)=>{let l=[{type:12,data:Math.ceil(O.size(e.dims)/4)}];return s&&l.push(...s),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:p=>Ou(p,O.size(e.dims),e.dataType,n,r,i,u),getRunData:p=>({outputs:[{dims:e.dims,dataType:n}],dispatchGroup:{x:Math.ceil(O.size(p[0].dims)/64/4)},programUniforms:l})}},_c=e=>{e.compute(pe(e.inputs[0],"Abs","abs"))},wc=e=>{e.compute(pe(e.inputs[0],"Acos","acos"))},$c=e=>{e.compute(pe(e.inputs[0],"Acosh","acosh"))},bc=e=>{e.compute(pe(e.inputs[0],"Asin","asin"))},vc=e=>{e.compute(pe(e.inputs[0],"Asinh","asinh"))},xc=e=>{e.compute(pe(e.inputs[0],"Atan","atan"))},Sc=e=>{e.compute(pe(e.inputs[0],"Atanh","atanh"))},kc=e=>he(e),Tc=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(pe(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},Bu=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return he({min:t,max:r})},Ic=(e,t)=>{let r=t||Bu(e.inputs),i=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},Ec=e=>{e.compute(pe(e.inputs[0],"Ceil","ceil"))},Cc=e=>{e.compute(pe(e.inputs[0],"Cos","cos"))},zc=e=>{e.compute(pe(e.inputs[0],"Cosh","cosh"))},fr=e=>he(e),Ac=(e,t)=>{let r=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Fr=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,Oc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Fr(t)))},Bc=e=>{e.compute(pe(e.inputs[0],"Exp","exp"))},Rc=e=>{e.compute(pe(e.inputs[0],"Floor","floor"))},Nc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Fr(t)))},Dc=(e,t)=>{let r=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},Mc=e=>{e.compute(pe(e.inputs[0],"Not",t=>`!${t}`))},Uc=e=>{e.compute(pe(e.inputs[0],"Neg",t=>`-${t}`))},Pc=e=>{e.compute(pe(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},Lc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},qc=e=>{e.compute(pe(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},Wc=e=>he(e),Vc=(e,t)=>{let r=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},Gc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"HardSwish",r=>`${r} * max(vec4<${t}>(0.0), min(vec4<${t}>(1.0), vec4<${t}>(${t}(1.0 / 6.0)) * ${r} + vec4<${t}>(0.5)))`))},Hc=e=>{e.compute(pe(e.inputs[0],"Sin","sin"))},Fc=e=>{e.compute(pe(e.inputs[0],"Sinh","sinh"))},jc=e=>{e.compute(pe(e.inputs[0],"Sqrt","sqrt"))},Kc=e=>{e.compute(pe(e.inputs[0],"Tan","tan"))},Ki=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,Zc=e=>{e.compute(pe(e.inputs[0],"Tanh",Ki))},Ra=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Ki("v")};
}
`,Na=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,Qc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"FastGelu",Na,Ra(t),void 0,e.inputs[0].dataType))},Xc=(e,t)=>{let r=Ee(e.inputs[0].dataType);return e.compute(pe(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Yc=e=>{e.compute(pe(e.inputs[0],"Log","log"))},Ru=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,Nu=e=>`quick_gelu_impl(${e})`,Jc=(e,t)=>{let r=Ee(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"QuickGelu",Nu,Ru(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),Du,Mu,eh,q0=U(()=>{"use strict";ie(),ae(),un(),Du=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Mu=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=D("input",e[0].dataType,e[0].dims,4),i=D("bias",e[0].dataType,[e[0].dims[2]],4),a=F("output",e[0].dataType,t,4),n=O.size(t)/4,s=Ce(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,i,a)}

  ${Fr(s)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(n)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},eh=e=>{Du(e.inputs),e.compute(Mu(e.inputs))}}),Uu,Pu,Xe,th,rh,ih,ah,nh,sh,oh,uh,lh,dh,W0=U(()=>{"use strict";te(),ie(),ae(),Uu=(e,t,r,i,a,n,s,u,l,p,c,m)=>{let g,_;typeof u=="string"?g=_=(w,k)=>`${u}((${w}),(${k}))`:typeof u=="function"?g=_=u:(g=u.scalar,_=u.vector);let y=F("outputData",c,i.length,4),x=D("aData",l,t.length,4),S=D("bData",p,r.length,4),$;if(a)if(n){let w=O.size(t)===1,k=O.size(r)===1,I=t.length>0&&t[t.length-1]%4===0,E=r.length>0&&r[r.length-1]%4===0;w||k?$=y.setByOffset("global_idx",_(w?`${x.type.value}(${x.getByOffset("0")}.x)`:x.getByOffset("global_idx"),k?`${S.type.value}(${S.getByOffset("0")}.x)`:S.getByOffset("global_idx"))):$=`
            let outputIndices = ${y.offsetToIndices("global_idx * 4u")};
            let offsetA = ${x.broadcastedIndicesToOffset("outputIndices",y)};
            let offsetB = ${S.broadcastedIndicesToOffset("outputIndices",y)};
            ${y.setByOffset("global_idx",_(s||I?x.getByOffset("offsetA / 4u"):`${x.type.value}(${x.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||E?S.getByOffset("offsetB / 4u"):`${S.type.value}(${S.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else $=y.setByOffset("global_idx",_(x.getByOffset("global_idx"),S.getByOffset("global_idx")));else{if(!n)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let w=(k,I,E="")=>{let C=`aData[indexA${I}][componentA${I}]`,A=`bData[indexB${I}][componentB${I}]`;return`
            let outputIndices${I} = ${y.offsetToIndices(`global_idx * 4u + ${I}u`)};
            let offsetA${I} = ${x.broadcastedIndicesToOffset(`outputIndices${I}`,y)};
            let offsetB${I} = ${S.broadcastedIndicesToOffset(`outputIndices${I}`,y)};
            let indexA${I} = offsetA${I} / 4u;
            let indexB${I} = offsetB${I} / 4u;
            let componentA${I} = offsetA${I} % 4u;
            let componentB${I} = offsetB${I} % 4u;
            ${k}[${I}] = ${E}(${g(C,A)});
          `};c===9?$=`
            var data = vec4<u32>(0);
            ${w("data",0,"u32")}
            ${w("data",1,"u32")}
            ${w("data",2,"u32")}
            ${w("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:$=`
            ${w("outputData[global_idx]",0)}
            ${w("outputData[global_idx]",1)}
            ${w("outputData[global_idx]",2)}
            ${w("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(x,S,y)}

        ${m??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${$}
      }`},Pu=(e,t,r,i,a,n,s=r.dataType)=>{let u=r.dims.map(Number),l=i.dims.map(Number),p=!O.areEqual(u,l),c=u,m=O.size(u),g=!1,_=!1,y=[p];if(p){let x=Qt.calcShape(u,l,!1);if(!x)throw new Error("Can't perform binary op on the given tensors");c=x.slice(),m=O.size(c);let S=O.size(u)===1,$=O.size(l)===1,w=u.length>0&&u[u.length-1]%4===0,k=l.length>0&&l[l.length-1]%4===0;y.push(S),y.push($),y.push(w),y.push(k);let I=1;for(let E=1;E<c.length;E++){let C=u[u.length-E],A=l[l.length-E];if(C===A)I*=C;else break}I%4===0?(_=!0,g=!0):(S||$||w||k)&&(g=!0)}else g=!0;return y.push(g),{name:e,shaderCache:{hint:t+y.map(x=>x.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:x=>Uu(x,u,l,c,g,p,_,a,r.dataType,i.dataType,s,n),getRunData:()=>({outputs:[{dims:c,dataType:s}],dispatchGroup:{x:Math.ceil(m/64/4)},programUniforms:[{type:12,data:Math.ceil(O.size(c)/4)},...Q(u,l,c)]})}},Xe=(e,t,r,i,a,n)=>{e.compute(Pu(t,a??"",e.inputs[0],e.inputs[1],r,i,n))},th=e=>{Xe(e,"Add",(t,r)=>`${t}+${r}`)},rh=e=>{Xe(e,"Div",(t,r)=>`${t}/${r}`)},ih=e=>{Xe(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},ah=e=>{Xe(e,"Mul",(t,r)=>`${t}*${r}`)},nh=e=>{let t=D("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Xe(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},sh=e=>{Xe(e,"Sub",(t,r)=>`${t}-${r}`)},oh=e=>{Xe(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},uh=e=>{Xe(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},lh=e=>{Xe(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},dh=e=>{Xe(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),Lu,qu,ph,ch,V0=U(()=>{"use strict";te(),ie(),ke(),ae(),Lu=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,n=i.dims.length;e.forEach((s,u)=>{if(u!==r){if(s.dataType!==a)throw new Error("input tensors should be one type");if(s.dims.length!==n)throw new Error("input tensors should have the same shape");s.dims.forEach((l,p)=>{if(p!==t&&l!==i.dims[p])throw new Error("non concat dimensions must match")})}})},qu=(e,t,r,i,a=0)=>{let n=e.reduce(($,w)=>$+O.size(w.dims),0),s=new Array(e.length),u=new Array(e.length),l=new Array(e.length),p=0,c=a,m=[],g=[],_=[{type:12,data:n}];for(let $=0;$<e.length;++$)s[$]=p,u[$]=c,p+=O.size(e[$].dims),c+=e[$].dims[t],g.push(e[$].dims.length),l[$]=D(`input${$}`,i,g[$]),m.push("rank"),_.push({type:12,data:s[$]}),_.push({type:12,data:u[$]});for(let $=0;$<e.length;++$)_.push(...Q(e[$].dims));_.push(...Q(r));let y=F("output",i,r.length),x=l.map(($,w)=>{let k=`
        let inputOffset = ${`global_idx - uniforms.inputOffset${w}`};
        var outputIndices = ${$.offsetToIndices("inputOffset")};
        ${y.indicesGet("outputIndices",t)} += uniforms.outputAxisOffset${w};
        ${y.setByIndices("outputIndices",$.getByOffset("inputOffset"))}`;return e.length===1?k:w===0?`if (inputIndex == 0u) {${k}}`:w===e.length-1?`else {${k}}`:`else if (inputIndex == ${w}u) {${k}}`}).join(`
`),S=$=>`

  ${(()=>{$.registerUniform("outputSize","u32");for(let w=0;w<e.length;w++)$.registerUniform(`inputOffset${w}`,"u32"),$.registerUniform(`outputAxisOffset${w}`,"u32");return $.declareVariables(...l,y)})()}

  fn calculateInputIndex(global_idx: u32) -> u32 {
    ${l.slice(1).map((w,k)=>`if (global_idx < uniforms.inputOffset${k+1}) {
      return ${k}u;
    }`).join(`
`)}
    return ${e.length-1}u;
  }

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    let inputIndex = calculateInputIndex(global_idx);
    ${x}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:m},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:_}),getShaderSource:S}},ph=(e,t)=>{let r=e.inputs,i=r[0].dims,a=O.normalizeAxis(t.axis,i.length);Lu(r,a);let n=i.slice();n[a]=r.reduce((p,c)=>p+(c.dims.length>a?c.dims[a]:0),0);let s=r.filter(p=>O.size(p.dims)>0);if(s.length===0){e.output(0,n);return}let u=e.deviceLimits.maxStorageBuffersPerShaderStage-1,l=0;for(let p=0;p<s.length;p+=u){let c=s.slice(p,p+u);e.compute(qu(c,a,n,r[0].dataType,l),{inputs:c,outputs:[0]}),l+=c.reduce((m,g)=>m+g.dims[a],0)}},ch=e=>he({axis:e.axis})}),Pt,Lt,qt,ln,Vt=U(()=>{"use strict";te(),ie(),Pt=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Lt=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},qt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},ln=e=>{let t=(e==null?void 0:e.activation)||"";if(t==="HardSigmoid"){let[r,i]=(e==null?void 0:e.activation_params)||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=(e==null?void 0:e.activation_params)||[Mp,Up];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=(e==null?void 0:e.activation_params)||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ae,hh,dn=U(()=>{"use strict";Ae=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},hh=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),fh,G0=U(()=>{"use strict";fh=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),gr,pn,cn=U(()=>{"use strict";te(),ie(),ae(),Vt(),gr=(e,t,r,i,a)=>{let n=i-r;return`
      ${Array.from({length:r}).map((s,u)=>`
      if (${Z(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,Z(a,u+n,i))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},pn=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,l=s[s.length-2],p=u[u.length-1],c=s[s.length-1],m=Se(p),g=Se(c),_=Se(l),y=O.size(r)/m/_,x=e.length>2,S=i?i.slice(0,-2):r.slice(0,-2),$=[O.size(S),l,p],w=[{type:12,data:y},{type:12,data:l},{type:12,data:p},{type:12,data:c}];Lt(t,w),w.push(...Q(S,s,u)),x&&w.push(...Q(e[2].dims)),w.push(...Q($));let k=I=>{let E=nn("batch_dims",e[0].dataType,S.length),C=D("a",e[0].dataType,s.length,g),A=D("b",e[1].dataType,u.length,m),v=F("output",e[0].dataType,$.length,m),M=Ce(v.type.tensor),P=Pt(t,v.type.value,M),G=[C,A],W="";if(x){let j=a?m:1;G.push(D("bias",e[2].dataType,e[2].dims.length,j)),W=`${a?`value += bias[col / ${j}];`:`value += ${v.type.value}(bias[row + i]);`}`}let H=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];qt(t,H);let B=()=>{let j=`var a_data: ${C.type.value};`;for(let Y=0;Y<g;Y++)j+=`
              let b_data${Y} = b[(b_offset + (k + ${Y}) * uniforms.N + col) / ${m}];`;for(let Y=0;Y<_;Y++){j+=`a_data = a[(a_offset + (row + ${Y}) * uniforms.K + k) / ${g}];`;for(let ee=0;ee<g;ee++)j+=`
            values[${Y}] = fma(${A.type.value}(a_data${g===1?"":`[${ee}]`}), b_data${ee}, values[${Y}]);
`}return j};return`
  ${I.registerUniforms(H).registerInternalVariables(E).declareVariables(...G,v)}
  ${I.mainStart()}
    ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${m})) * ${m};
    var index1 = global_idx / (uniforms.N / ${m});
    let stride1 = uniforms.M / ${_};
    let row = (index1 % stride1) * ${_};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${E.offsetToIndices("batch")};`}

    var a_indices: ${C.type.indices};
    ${gr("a_indices",C,C.rank-2,E.rank,"batch_indices")}
    ${C.indicesSet("a_indices",C.rank-2,0)}
    ${C.indicesSet("a_indices",C.rank-1,0)}
    let a_offset = ${C.indicesToOffset("a_indices")};

    var b_indices: ${A.type.indices};
    ${gr("b_indices",A,A.rank-2,E.rank,"batch_indices")}
    ${A.indicesSet("b_indices",A.rank-2,0)}
    ${A.indicesSet("b_indices",A.rank-1,0)}
    let b_offset = ${A.indicesToOffset("b_indices")};
    var values: array<${v.type.value}, ${_}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${B()}
    }
    for (var i = 0u; i < ${_}u; i++) {
      var value = values[i];
      ${W}
      ${P}
      let cur_indices = ${v.type.indices}(batch, row + i, col);
      let offset = ${v.indicesToOffset("cur_indices")};
      ${v.setByOffset(`offset / ${m}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${m};${g};${_};${a}`,inputDependencies:x?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:w}),getShaderSource:k}}}),Wu,Vu,Da,Zi,Gu,Ma,Hu,Yr,hn=U(()=>{"use strict";te(),ie(),ae(),Vt(),cn(),dn(),Wu=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,Vu=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,Da=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32)=>{let l=t[1]*e[1],p=t[0]*e[0],c=a?l:n,m=a?n:l,g=c/t[0],_=n/t[1];if(!((a&&g===4&&e[1]===4||!a&&(g===3||g===4))&&c%t[0]===0&&n%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${c} must be divisible by workgroupSize[0]${t[0]}. tileInner ${n} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${c/g}>, ${m}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${p/e[0]}>, ${n}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${l};

  let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${_};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Wu(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Vu(a,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},Zi=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,Gu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Ma=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32,l=!1)=>{let p=e[1]*t[1],c=e[0]*t[0],m=a?p:n,g=a?n:p;if(!(g%t[1]===0&&m%t[0]===0&&n%t[1]===0))throw new Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${m} must be divisible by workgroupSize[0]${t[0]}, tileInner ${n} must be divisible by workgroupSize[1]${t[1]}`);let _=g/t[1],y=m/t[0],x=n/t[1],S=l?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${p};
    let globalColStart = i32(workgroupId.x) * ${c};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${m}; inputCol = inputCol + ${t[0]}) {
          ${Zi(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${n}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${c}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${p};

let tileRowA = i32(localId.y) * ${_};
let tileColA = i32(localId.x) * ${y};
let tileRowB = i32(localId.y) * ${x};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${y}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Zi(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${x}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${Gu(a)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${m}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${c}>, ${n}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${S}
  }
`},Hu=(e,t,r,i,a=!1)=>{let[n,s,u,l]=i,p=Ce(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ae(e,p)} {
      var value = ${Ae(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${gr("aIndices",s,s.rank-2,n.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ae(e,p)} {
      var value = ${Ae(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${gr("bIndices",u,u.rank-2,n.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ae(e,p)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${Ae(e,p)}(bias[row])`};`:""}
        ${r}
        ${l.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Yr=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,l=s.slice(0,-2),p=u.slice(0,-2),c=i?i.slice(0,-2):r.slice(0,-2),m=O.size(c),g=s[s.length-2],_=s[s.length-1],y=u[u.length-1],x=_%4===0&&y%4===0,S=g<=8?[4,1,1]:[4,4,1],$=[8,8,1],w=[Math.ceil(y/$[0]/S[0]),Math.ceil(g/$[1]/S[1]),Math.ceil(m/$[2]/S[2])],k=x?4:1,I=[...l,g,_/k],E=I.length,C=[...p,_,y/k],A=C.length,v=[m,g,y/k],M=[{type:6,data:g},{type:6,data:y},{type:6,data:_}];Lt(t,M),M.push(...Q(c,I,C));let P=["rank","rank"],G=e.length>2;G&&(M.push(...Q(e[2].dims)),P.push("rank")),M.push(...Q(v));let W=H=>{let B=c.length,j=nn("batchDims",e[0].dataType,B,1),Y=Ce(e[0].dataType),ee=D("a",e[0].dataType,E,k),re=D("b",e[1].dataType,A,k),J=F("result",e[0].dataType,v.length,k),ye=[ee,re];if(G){let _e=a?k:1;ye.push(D("bias",e[2].dataType,e[2].dims.length,_e))}let R=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];qt(t,R);let K=Ce(J.type.tensor),X=Pt(t,J.type.value,K),L=Hu(k,G,X,[j,ee,re,J],a);return`
  ${H.registerUniforms(R).registerInternalVariables(j).declareVariables(...ye,J)}
  ${L}
  ${x?Da(S,$,Y,j):Ma(S,$,Y,j)}
                   `};return{name:"MatMul",shaderCache:{hint:`${S};${t.activation};${x};${a}`,inputDependencies:P},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:w[0],y:w[1],z:w[2]},programUniforms:M}),getShaderSource:W}}}),Fu,mh,H0=U(()=>{"use strict";te(),ct(),ae(),Vt(),dn(),G0(),hn(),Fu=(e,t,r,i,a=!1,n,s=4,u=4,l=4,p="f32")=>{let c=M=>{switch(M){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${p}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${M} is not supported.`)}},m=M=>{switch(M){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${M} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,_=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,y=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",x=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",S=e?"row":"col",$=e?"col":"row",w=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${S} / outWidth;
    let outCol = ${S} % outWidth;

    let WRow = ${$} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${$} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${$} % inChannels;
    var resData = ${Ae(s,p)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${y} && xCol >= 0 && xCol < ${x}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${c(s)}
    }
    return resData;`,k=e?t&&i?`
    let col = colIn * ${s};
    ${w}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${w}
    }
    return ${Ae(s,p)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${w}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${w}
    }
    return ${Ae(s,p)}(0.0);`,I=e?i&&r?m(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${m(u)}
    }
    return ${Ae(u,p)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${m(u)}
    }
    return ${Ae(u,p)}(0.0);`,E=Ae(l,p),C=Ae(e?s:u,p),A=Ae(e?u:s,p),v=Pt(n,E,p);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${C} {
      ${e?k:I}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${e?I:k}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${E}) {
      let col = colIn * ${l};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${_}
      ${hh(a)}
      ${v}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},mh=(e,t,r,i,a,n,s,u,l)=>{let p=t.format==="NHWC",c=p?e[0].dims[3]:e[0].dims[1],m=r[0],g=p?r[2]:r[3],_=p?r[1]:r[2],y=p?r[3]:r[1],x=p&&(c%4===0||c%3===0)&&y%4===0,S=p?y:g*_,$=p?g*_:y,w=[8,8,1],k=i<=8?[4,1,1]:[4,4,1],I=[Math.ceil(S/w[0]/k[0]),Math.ceil($/w[1]/k[1]),Math.ceil(m/w[2]/k[2])];le("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${I}`);let E=x?p&&c%4!==0?3:4:1,C=w[1]*k[1],A=w[0]*k[0],v=Math.max(w[0]*E,w[1]),M=i%C===0,P=a%A===0,G=n%v===0,W=x?[E,4,4]:[1,1,1],H=[{type:6,data:i},{type:6,data:a},{type:6,data:n},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Lt(t,H),H.push(...Q(e[0].dims,e[1].dims));let B=["rank","rank"];s&&(H.push(...Q(e[2].dims)),B.push("rank")),H.push(...Q(r));let j=Y=>{let ee=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];qt(t,ee);let re=x?4:1,J=Ce(e[0].dataType),ye=`
      fn setOutputAtIndex(flatIndex : i32, value : ${x?`vec4<${J}>`:J}) {
        result[flatIndex] = ${x?`vec4<${J}>`:J}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${x?`vec4<${J}>`:J}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${x?"/ 4":""}, value);
      }`,R=D("x",e[0].dataType,e[0].dims.length,E===3?1:E),K=D("w",e[1].dataType,e[1].dims.length,re),X=[R,K],L=F("result",e[0].dataType,r.length,re);if(s){let _e=D("bias",e[2].dataType,e[2].dims.length,re);X.push(_e),ye+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${x?`vec4<${J}>`:J} {
          return bias[coords.${p?"w":"y"}${x?"/ 4":""}];
        }`}return`
        ${fh("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${Y.registerUniforms(ee).declareVariables(...X,L)}
        ${ye}
        ${Fu(p,M,P,G,s,t,W[0],W[1],W[2],J)}
        ${x?Da(k,w,J,void 0,!p,v):Ma(k,w,J,void 0,!p,v,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${E};${x};${M};${P};${G};${C};${A};${v}`,inputDependencies:B},getRunData:()=>({outputs:[{dims:l?l(r):r,dataType:e[0].dataType}],dispatchGroup:{x:I[0],y:I[1],z:I[2]},programUniforms:H}),getShaderSource:j}}}),ju,Qi,nr,Ku,Xi,Zu,gh,yh,F0=U(()=>{"use strict";te(),ct(),ie(),ae(),Vt(),dn(),ju=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},Qi=e=>typeof e=="number"?[e,e,e]:e,nr=(e,t)=>t<=1?e:e+(e-1)*(t-1),Ku=(e,t,r,i=1)=>{let a=nr(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},Xi=(e,t,r,i,a)=>{a==null&&(a=Ku(e,t[0],i[0]));let n=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*a>=t[s]&&(n[s]=Math.trunc((e[s]-t[s]+2*a)/i[s]+1));return n},Zu=(e,t,r,i,a,n,s,u,l,p)=>{let c,m,g,_;if(e==="VALID"&&(e=0),typeof e=="number"){c={top:e,bottom:e,left:e,right:e,front:e,back:e};let y=Xi([t,r,i,1],[u,l,p],1,[a,n,s],e);m=y[0],g=y[1],_=y[2]}else if(Array.isArray(e)){if(!e.every((x,S,$)=>x===$[0]))throw Error(`Unsupported padding parameter: ${e}`);c={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let y=Xi([t,r,i,1],[u,l,p],1,[a,n,s],e[0]);m=y[0],g=y[1],_=y[2]}else if(e==="SAME_UPPER"){m=Math.ceil(t/a),g=Math.ceil(r/n),_=Math.ceil(i/s);let y=(m-1)*a+u-t,x=(g-1)*n+l-r,S=(_-1)*s+p-i,$=Math.floor(y/2),w=y-$,k=Math.floor(x/2),I=x-k,E=Math.floor(S/2),C=S-E;c={top:k,bottom:I,left:E,right:C,front:$,back:w}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:c,outDepth:m,outHeight:g,outWidth:_}},gh=(e,t,r,i,a,n=!1,s="channelsLast")=>{let u,l,p,c,m;if(s==="channelsLast")[u,l,p,c,m]=e;else if(s==="channelsFirst")[u,m,l,p,c]=e;else throw new Error(`Unknown dataFormat ${s}`);let[g,,_,y,x]=t,[S,$,w]=Qi(r),[k,I,E]=Qi(i),C=nr(_,k),A=nr(y,I),v=nr(x,E),{padInfo:M,outDepth:P,outHeight:G,outWidth:W}=Zu(a,l,p,c,S,$,w,C,A,v),H=n?g*m:g,B=[0,0,0,0,0];return s==="channelsFirst"?B=[u,H,P,G,W]:s==="channelsLast"&&(B=[u,P,G,W,H]),{batchSize:u,dataFormat:s,inDepth:l,inHeight:p,inWidth:c,inChannels:m,outDepth:P,outHeight:G,outWidth:W,outChannels:H,padInfo:M,strideDepth:S,strideHeight:$,strideWidth:w,filterDepth:_,filterHeight:y,filterWidth:x,effectiveFilterDepth:C,effectiveFilterHeight:A,effectiveFilterWidth:v,dilationDepth:k,dilationHeight:I,dilationWidth:E,inShape:e,outShape:B,filterShape:t}},yh=(e,t,r,i,a,n)=>{let s=n==="channelsLast",u=s?e[0].dims[3]:e[0].dims[1],l=!1,p=[64,1,1],c={x:r.map((w,k)=>k)},m=[Math.ceil(ju(c.x.map(w=>r[w]))/p[0]),1,1];le("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${m}`);let g=l?s&&u%4!==0?3:4:1,_=O.size(r),y=[{type:12,data:_},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Lt(t,y),y.push(...Q(e[0].dims,e[1].dims));let x=["rank","rank"],S=e.length===3;S&&(y.push(...Q(e[2].dims)),x.push("rank")),y.push(...Q(r));let $=w=>{let k=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];qt(t,k);let I=l?4:1,E=Ce(e[0].dataType),C=D("x",e[0].dataType,e[0].dims.length,g===3?1:g),A=D("W",e[1].dataType,e[1].dims.length,I),v=[C,A],M=F("result",e[0].dataType,r.length,I),P="";if(S){let H=D("bias",e[2].dataType,e[2].dims.length,I);v.push(H),P+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${l?`vec4<${E}>`:E} {
          return bias[${s?Z("coords",4,5):Z("coords",1,5)}${l?"/ 4":""}];
        }`}let G=Ae(g,E),W=Pt(t,G,E);return`
            ${P}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> ${E} {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${C.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> ${E} {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${A.getByIndices("aIndices")};
            }
          ${w.registerUniforms(k).declareVariables(...v,M)}
          ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${M.offsetToIndices("global_idx")};
              let batch = ${Z("coords",0,C.rank)};
              let d2 = ${s?Z("coords",C.rank-1,C.rank):Z("coords",1,C.rank)};
              let xFRCCorner = vec3<u32>(${s?Z("coords",1,C.rank):Z("coords",2,C.rank)},
              ${s?Z("coords",2,C.rank):Z("coords",3,C.rank)},
              ${s?Z("coords",3,C.rank):Z("coords",4,C.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?Z("uniforms.x_shape",1,C.rank):Z("uniforms.x_shape",2,C.rank)};
              let xShapeZ = ${s?Z("uniforms.x_shape",2,C.rank):Z("uniforms.x_shape",3,C.rank)};
              let xShapeW = ${s?Z("uniforms.x_shape",3,C.rank):Z("uniforms.x_shape",4,C.rank)};
              let xShapeU = ${s?Z("uniforms.x_shape",4,C.rank):Z("uniforms.x_shape",1,C.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = ${E}(0);
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<${E}>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<${E}>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<${E}>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<${E}>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<${E}>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<${E}>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<${E}>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<${E}>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<${E}>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${S?"value = value + getBiasByOutputCoords(coords)":""};
              ${W}
              result[global_idx] = ${E}(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${g};${S}`,inputDependencies:x},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:m[0],y:m[1],z:m[2]},programUniforms:y}),getShaderSource:$}}}),_h,wh,j0=U(()=>{"use strict";te(),ie(),ae(),Vt(),_h=(e,t,r,i)=>{let a=e.length>2,n=a?"value += b[output_channel];":"",s=e[0].dims,u=e[1].dims,l=t.format==="NHWC",p=l?r[3]:r[1],c=p/t.group,m=l&&c>=4?Se(p):1,g=O.size(r)/m,_=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:c}];Lt(t,_),_.push(...Q(s,[u[0],u[1],u[2],u[3]/m]));let y=a?["rank","rank","rank"]:["rank","rank"];_.push(...Q([r[0],r[1],r[2],r[3]/m]));let x=S=>{let $=F("output",e[0].dataType,r.length,m),w=Ce($.type.tensor),k=Pt(t,$.type.value,w),I=D("x",e[0].dataType,s.length),E=D("w",e[1].dataType,u.length,m),C=[I,E];a&&C.push(D("b",e[2].dataType,e[2].dims,m));let A=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];qt(t,A);let v=l?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${I.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${E.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${I.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${E.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${S.registerUniforms(A).declareVariables(...C,$)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${$.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${l?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${l?1:2}], outputIndices[${l?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${m} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${l?2:1}];

    var value: ${$.type.value} = ${$.type.value}(0);
    ${v}
    ${n}
    ${k}
    ${$.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${m}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:_}),getShaderSource:x}},wh=(e,t,r,i)=>{let a=e.length>2,n=Se(r[3]),s=Se(r[2]),u=O.size(r)/n/s,l=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/n],p=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/n],c=[r[0],r[1],r[2],r[3]/n],m=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Lt(t,m),m.push(...Q(l,p,c));let g=(s-1)*t.strides[1]+p[1],_=y=>{let x=F("output",e[0].dataType,c.length,n),S=Ce(x.type.tensor),$=Pt(t,x.type.value,S),w=D("x",e[0].dataType,l.length,n),k=D("w",e[1].dataType,p.length,n),I=[w,k];a&&I.push(D("b",e[2].dataType,e[2].dims,n));let E=a?"value += b[output_channel];":"",C=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return qt(t,C),`
  ${y.registerUniforms(C).declareVariables(...I,x)}
  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${w.type.value}, ${g}>;
    var values: array<${x.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${p[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${w.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${w.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${p[1]}; w_width++) {
          let w_val = ${k.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${E}
      ${$}
      ${x.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${n};${s};${g};${p[0]};${p[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:m}),getShaderSource:_}}}),Qu,Ur,Xu,Pr,Ua,Yi,Yu,Ju,Pa,K0=U(()=>{"use strict";ie(),H0(),F0(),hn(),j0(),Vt(),cn(),bt(),Qu=(e,t,r,i,a,n)=>{let s=e[0],u=e.slice(n?1:2,n?3:4),l=u.length,p=t[0],c=t.slice(2).map((g,_)=>g+(g-1)*(r[_]-1)),m=u.map((g,_)=>g+i[_]+i[_+l]).map((g,_)=>Math.floor((g-c[_]+a[_])/a[_]));return m.splice(0,0,s),m.splice(n?3:1,0,p),m},Ur=[2,3,1,0],Xu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Pr=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let n=2;n<t[1].dims.length;++n)r[n-2]===0&&(r[n-2]=t[1].dims[n]);let i=e.pads.slice();Qr.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},Ua=e=>{let t=ln(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,n=e.group,s=e.kernel_shape,u=e.pads,l=e.strides,p=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,pads:u,strides:l,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Yi=(e,t,r,i)=>{let a=r.format==="NHWC",n=Qu(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let C=[t[0]];if(a){let A=e.kernelCustomData.wT??e.compute(qe(t[1],Ur),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=A),C.push(A)}else C.push(t[1]);t.length===3&&C.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(wh(C,r,n,i),{inputs:C}):e.compute(_h(C,r,n,i),{inputs:C});return}let s=t.length===3,u=t[0].dims[a?1:2],l=t[0].dims[a?2:3],p=t[0].dims[a?3:1],c=t[1].dims[2],m=t[1].dims[3],g=n[a?1:2],_=n[a?2:3],y=n[a?3:1],x=a&&c===u&&m===l&&r.pads[0]===0&&r.pads[1]===0;if(x||c===1&&m===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let C=n[0],A,v,M,P=[];if(a){let H=e.kernelCustomData.wT??e.compute(qe(t[1],Ur),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=H),x){let B=u*l*p;A=t[0].reshape([1,C,B]),v=H.reshape([1,B,y]),M=[1,C,y]}else A=t[0].reshape([C,u*l,p]),v=H.reshape([1,p,y]),M=[C,g*_,y];P.push(A),P.push(v)}else A=t[0].reshape([C,p,u*l]),v=t[1].reshape([1,y,p]),M=[C,y,g*_],P.push(v),P.push(A);s&&P.push(t[2]);let G=M[2],W=P[0].dims[P[0].dims.length-1];G<8&&W<8?e.compute(pn(P,r,n,M,a,i),{inputs:P}):e.compute(Yr(P,r,n,M,a,i),{inputs:P});return}let S=!0,$=e.kernelCustomData.wT??e.compute(qe(t[1],Ur),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=$);let w=[t[0],$];s&&w.push(t[2]);let k=a?g*_:y,I=a?y:g*_,E=c*m*p;e.compute(mh(w,r,n,k,I,E,s,S,i),{inputs:w})},Yu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],n=[1].concat(t.strides),s=[1].concat(t.dilations),u=[1].concat(t.kernelShape),l=Pr({...t,pads:a,strides:n,dilations:s,kernelShape:u},i);Yi(e,i,l,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},Ju=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=Pr(r,t),n=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=gh(t[0].dims,t[1].dims,r.strides,r.dilations,n,!1,i);e.compute(yh(t,a,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},Pa=(e,t)=>{if(Xu(e.inputs,t),e.inputs[0].dims.length===3)Yu(e,t);else if(e.inputs[0].dims.length===5)Ju(e,e.inputs,t);else{let r=Pr(t,e.inputs);Yi(e,e.inputs,r)}}}),$h,Z0=U(()=>{"use strict";te(),ct(),ie(),ae(),$h=(e,t,r)=>{let i=e.length>2,a=t.outputShape,n=t.format==="NHWC",s=t.group,u=e[1].dims,l=u[2]/s,p=u[3],c=n?Se(l):1,m=n&&p===1&&l>=4,g=m?Math.floor(l/4)*4:Math.floor(l/c)*c,_=l-g,y=n?Se(p):1,x=n?p===1?c:y:1,S=O.size(a)/y,$=[Math.ceil(S/64),1,1];le("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${$}`);let w=["rank","rank"],k=[t.strides[0],t.strides[1]],I=[t.kernelShape[n?1:2],t.kernelShape[n?2:3]],E=[t.dilations[0],t.dilations[1]],C=[I[0]+(t.dilations[0]<=1?0:(t.kernelShape[n?1:2]-1)*(t.dilations[0]-1)),I[1]+(t.dilations[1]<=1?0:(t.kernelShape[n?2:3]-1)*(t.dilations[1]-1))],A=[C[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),C[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],v=[{type:12,data:S},{type:12,data:k},{type:12,data:I},{type:12,data:E},{type:12,data:C},{type:6,data:A},{type:12,data:g},{type:12,data:l},{type:12,data:p},...Q(e[0].dims,e[1].dims)];i&&(v.push(...Q(e[2].dims)),w.push("rank")),v.push(...Q(a));let M=P=>{let G=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:k.length},{name:"filter_dims",type:"u32",length:I.length},{name:"dilations",type:"u32",length:I.length},{name:"effective_filter_dims",type:"u32",length:C.length},{name:"pads",type:"i32",length:A.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],W=Ce(e[0].dataType),H=n?1:2,B=n?2:3,j=n?3:1,Y=D("W",e[1].dataType,e[1].dims.length,x),ee=D("Dy",e[0].dataType,e[0].dims.length,c),re=[ee,Y];i&&re.push(D("bias",e[2].dataType,[a[j]].length,y));let J=F("result",e[0].dataType,a.length,y),ye=()=>{let X="";if(m)c===4?X+=`
        let xValue = ${ee.getByOffset("x_offset")};
        let wValue = ${Y.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:c===2?X+=`
          dotProd = dotProd + dot(vec4<${W}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}), vec4<${W}>(${Y.getByOffset("w_offset")}, ${Y.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:c===1&&(X+=`
          dotProd = dotProd + dot(vec4<${W}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}, ${ee.getByOffset("x_offset + 2u")}, ${ee.getByOffset("x_offset + 3u")}), vec4<${W}>(${Y.getByOffset("w_offset")}, ${Y.getByOffset("w_offset + 1u")}, ${Y.getByOffset("w_offset + 2u")}, ${Y.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(X+=`
                  let xValue = ${n?ee.getByOffset(`${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${c}`):ee.get("batch","inputChannel","idyR","idyC")};
        `,c===1)X+=`
          let w_offset = ${Y.indicesToOffset(`${Y.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${Y.getByOffset(`w_offset / ${x}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let L=0;L<c;L++)X+=`
            let wValue${L} = ${Y.getByOffset(`${Y.indicesToOffset(`${Y.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${L}, wOutChannel)`)} / ${x}`)};
            dotProd = dotProd + xValue[${L}] * wValue${L};`;return X},R=()=>{if(_===0)return"";if(!m)throw new Error(`packInputAs4 ${m} is not true.`);let X="";if(c===1){X+="dotProd = dotProd";for(let L=0;L<_;L++)X+=`
            + ${ee.getByOffset(`x_offset + ${L}`)} * ${Y.getByOffset(`w_offset + ${L}`)}`;X+=";"}else if(c===2){if(_!==2)throw new Error(`Invalid inputChannelsRemainder ${_}.`);X+=`
          let xValue = ${ee.getByOffset("x_offset")};
          let wValue = ${Y.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return X},K=`
            let outputIndices = ${J.offsetToIndices(`global_idx * ${y}`)};
            let batch = ${J.indicesGet("outputIndices",0)};
            let d1 = ${J.indicesGet("outputIndices",j)};
            let r = ${J.indicesGet("outputIndices",H)};
            let c = ${J.indicesGet("outputIndices",B)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${J.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${W}(dyRCorner) + ${W}(wR)) / ${W}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${W}(uniforms.Dy_shape[${H}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${W}(dyCCorner) + ${W}(wC)) / ${W}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${W}(uniforms.Dy_shape[${B}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${m?`
                var x_offset = ${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${c};
                var w_offset = ${Y.indicesToOffset(`${Y.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${x};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${m?4:c}) {
                  ${ye()}
                  inputChannel = inputChannel + ${m?4:c};
                }
                ${R()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${y}]`:""};
            ${J.setByOffset("global_idx","value")};
          `;return`
    ${P.registerUniforms(G).declareVariables(...re,J)}
      ${P.mainStart()}
      ${P.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${K}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${c}${x}${y}${m}${_}`,inputDependencies:w},getRunData:()=>({dispatchGroup:{x:$[0],y:$[1],z:$[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:v}),getShaderSource:M}}}),el,tl,rl,Ji,bh,il,ea,al,vh,Q0=U(()=>{"use strict";Z0(),Vt(),bt(),el=(e,t,r,i,a,n)=>(e-1)*t+r+(i-1)*a+1-n,tl=(e,t,r,i,a)=>{let n=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=n,r[a]=e-n):t==="SAME_LOWER"&&(r[i]=e-n,r[a]=n)},rl=(e,t,r,i,a,n,s,u,l,p)=>{let c=e.length-2,m=p.length===0;l.length<c&&l.push(...Array(c-l.length).fill(0));let g=e[0],_=t[u?3:1]*a;for(let y=0,x=e.length-c-(u?1:0);y<c;++y,++x){let S=e[x],$=m?S*s[y]:p[y],w=el(S,s[y],n[y],t[x],r[y],$);tl(w,i,n,y,y+c),m&&p.push(s[y]*(S-1)+l[y]+(t[x]-1)*r[y]+1-n[y]-n[y+c])}p.splice(0,0,g),p.splice(u?3:1,0,_)},Ji=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((m,g)=>m*g,1)===0){r.length=0;for(let m=2;m<t[1].dims.length;++m)r.push(t[1].dims[m])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),n=e.outputShape.slice(),s=e.outputPadding.slice(),u=t[0].dims,l=e.dilations.slice();if(l.reduce((m,g)=>m+g,0)===0){let m=t[0].dims.length-2;l=new Array(m).fill(1)}let p=e.strides.slice();if(p.reduce((m,g)=>m+g,0)===0){let m=t[0].dims.length-2;p=new Array(m).fill(1)}rl(u,r,l,e.autoPad,e.group,a,p,i,s,n);let c=Object.assign({},e);return Object.assign(c,{kernelShape:r,pads:a,outputPadding:s,outputShape:n,dilations:l,strides:p}),c},bh=e=>{let t=ln(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,n=e.group??1,s=e.kernelShape,u=e.pads,l=e.strides,p=e.wIsConst(),c=e.outputPadding,m=e.outputShape;return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,outputPadding:c,outputShape:m,pads:u,strides:l,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},il=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.reduce((s,u)=>s+u,0)>0&&t.dilations.length!==n)throw new Error(`dilations should be ${n}D`);if(t.strides.reduce((s,u)=>s+u,0)>0&&t.strides.length!==n)throw new Error(`strides should be ${n}D`);if(t.pads.reduce((s,u)=>s+u,0)>0&&t.pads.length!==n*2)throw new Error(`pads should be ${n*2}D`);if(t.outputPadding.length!==n&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${n}D`);if(t.kernelShape.reduce((s,u)=>s+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},ea=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(qe(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let n=[t[0],a];t.length===3&&n.push(t[2]),e.compute($h(n,r,i),{inputs:n})},al=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let n=t.dilations;(n.length===0||n[0]===0)&&(n=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],s=[1].concat(s),n=[1].concat(n),a=[1].concat(a);let l=t.outputPadding;l=[0].concat(l);let p=Ji({...t,pads:u,strides:s,dilations:n,kernelShape:a,outputPadding:l},i);ea(e,i,p,c=>r?[c[0],c[2],c[3]]:[c[0],c[1],c[3]])},vh=(e,t)=>{if(il(e.inputs,t),e.inputs[0].dims.length===3)al(e,t);else{let r=Ji(t,e.inputs);ea(e,e.inputs,r)}}}),nl,xh,Sh,X0=U(()=>{"use strict";te(),ie(),ke(),ae(),nl=(e,t,r,i)=>{let a=O.size(t),n=t.length,s=D("input",e,n),u=F("output",e,n),l=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),p=O.normalizeAxis(l,n),c=m=>{let g=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,_=Z("uniforms.input_shape","uniforms.axis",n),y=i.reverse?g+(i.exclusive?" + 1":""):"0",x=i.reverse?_:g+(i.exclusive?"":" + 1");return`
                ${m.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,u)}
                ${m.mainStart()}
                  ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${y};
                  let last : i32 = ${x};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:p},...Q(t,t)]}),getShaderSource:c}},xh=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(nl(i,r,a,t),{inputs:[0]})},Sh=e=>{let t=e.exclusive===1,r=e.reverse===1;return he({exclusive:t,reverse:r})}}),sl,ol,ul,kh,Th,Y0=U(()=>{"use strict";te(),ie(),ke(),ae(),sl=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},ol=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let n=0;n<t;++n)a.push(r.indicesSet("a",e[n],`i[${n}]`));return a.push("return a;}"),a.join(`
`)},ul=(e,t)=>{let r,i,a,n,s,u,l=t.format==="NHWC",p=t.blocksize,c=t.mode==="DCR";l?([r,i,a,n]=e.dims,s=c?[r,i,a,p,p,n/p**2]:[r,i,a,n/p**2,p,p],u=c?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,n]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=c?[r,p,p,n/p**2,i,a]:[r,n/p**2,p,p,i,a],u=c?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let m=e.reshape(s),g=m.dims.length,_=e.dataType,y=D("a",_,g),x=F("output",_,g),S=$=>`
  ${$.registerUniform("output_size","u32").declareVariables(y,x)}

  ${ol(u,g,y,x)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${x.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${x.setByOffset("global_idx",y.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:$=>{let w=l?[r,i*p,a*p,n/p**2]:[r,n/p**2,i*p,a*p],k=O.size(w),I=m.dims,E=O.sortBasedOnPerm(I,u);return{outputs:[{dims:w,dataType:$[0].dataType}],dispatchGroup:{x:Math.ceil(k/64)},programUniforms:[{type:12,data:k},...Q(I,E)]}},getShaderSource:S}},kh=(e,t)=>{sl(e.inputs),e.compute(ul(e.inputs[0],t))},Th=e=>he({blocksize:e.blocksize,mode:e.mode,format:e.format})}),lt,sr,Lr,ta,yt,ll,dl,pl,ra,ia,aa,cl,hl,na,fl,Ih,Eh,J0=U(()=>{"use strict";te(),ie(),ke(),ae(),lt=256,sr=512,Lr=2*Math.PI,ta=e=>{let t=[],r=e;for(let i of[4,2,3,5])for(;r%i===0;)t.push(i),r/=i;return r===1?t:void 0},yt=e=>{let t=e.toPrecision(9);return/[.eE]/.test(t)?t:`${t}.0`},ll=(e,t,r,i,a)=>{let n=r/e,s=sr-i,u=p=>`smem[${s}u + base + ${p*t}u]`,l=`  for (var t = local_idx; t < ${n}u; t += ${lt}u) {
`;l+=`    let twiddleIndex = t % ${t}u;
    let angleUnit = f32(twiddleIndex);
`,l+=`    var leg: array<vec2<f32>, 5>;
`;for(let p=0;p<e;p++){let c=`${i}u + t + ${p*n}u`;if(p===0)l+=`    leg[0] = smem[${c}];
`;else{let m=a*Lr*p/(e*t);l+=`    { let a = ${yt(m)} * angleUnit; leg[${p}] = cmul(smem[${c}], vec2<f32>(cos(a), sin(a))); }
`}}if(l+=`    let base = (t / ${t}u) * ${t*e}u + twiddleIndex;
`,e===2)l+=`    ${u(0)} = leg[0] + leg[1];
    ${u(1)} = leg[0] - leg[1];
`;else if(e===4){let p=a<0?"vec2<f32>(oddDiff.y, -oddDiff.x)":"vec2<f32>(-oddDiff.y, oddDiff.x)";l+=`    let evenSum = leg[0] + leg[2]; let evenDiff = leg[0] - leg[2];
`,l+=`    let oddSum = leg[1] + leg[3]; let oddDiff = leg[1] - leg[3];
`,l+=`    let oddRot = ${p};
`,l+=`    ${u(0)} = evenSum + oddSum;
    ${u(1)} = evenDiff + oddRot;
`,l+=`    ${u(2)} = evenSum - oddSum;
    ${u(3)} = evenDiff - oddRot;
`}else for(let p=0;p<e;p++){let c=["leg[0]"];for(let m=1;m<e;m++){let g=a*Lr*(m*p)/e,_=yt(Math.cos(g)),y=yt(Math.sin(g));c.push(`vec2<f32>(leg[${m}].x*${_} - leg[${m}].y*${y}, leg[${m}].x*${y} + leg[${m}].y*${_})`)}l+=`    ${u(p)} = ${c.join(" + ")};
`}return`${l}  }
  workgroupBarrier();
`},dl=(e,t,r)=>{let i="",a=1,n=0;for(let s of e)i+=ll(s,a,t,n,r),a*=s,n=sr-n;return{code:i,resultOffset:n}},pl=(e,t,r,i,a)=>{let n=e.dims,s=n.length,u=n[s-1],l=n[t],p=r&&i?(l-1)*2:l;a!==void 0&&(p=a);let c=r&&i?1:2,m=i&&!r?Math.floor(p/2)+1:p,g=n.slice();g[t]=m,g[s-1]=c;let _=1;for(let x=t+1;x<s-1;x++)_*=n[x];let y=O.size(n)/u/l;return{dataType:e.dataType,outputDims:g,length:p,signalLength:l,inner:_,batch:y,inputComponents:u,outputComponents:c,outputLength:m,inverse:r,onesided:i}},ra=(e,t)=>[t,e.length,e.inputComponents,e.outputComponents,e.inverse,e.onesided].join(";"),ia=e=>[{type:12,data:e.batch},{type:12,data:e.signalLength},{type:12,data:e.inner},{type:12,data:e.outputLength}],aa=(e,t,r)=>e.registerUniform("batch","u32").registerUniform("signalLength","u32").registerUniform("inner","u32").registerUniform("outputLength","u32").declareVariables(t,r),cl=e=>{let{dataType:t,length:r,inputComponents:i,outputComponents:a,inverse:n,onesided:s}=e,u=Ee(t),l=n?1:-1,p=n?1/r:1,c=ta(r),m=g=>{let _=D("x",t,[1]),y=F("y",t,[1]),x=E=>{let C=`inBase + (${E}) * uniforms.inner * ${i}u`,A=`f32(${_.getByOffset(C)})`,v=i===2?`f32(${_.getByOffset(`${C} + 1u`)})`:"0.0";return`vec2<f32>(${A}, ${v})`},S;if(n&&s){let E=Math.floor(r/2)+1,C=r%2===0?`select(provided, provided - 1u, provided == ${E}u)`:"provided";S=`
    let provided = min(uniforms.signalLength, ${E}u);
    for (var i = local_idx; i < ${r}u; i += ${lt}u) {
      if (i < provided) { smem[i] = ${x("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();
    for (var k = local_idx + 1u; k < ${C}; k += ${lt}u) {
      let h = smem[k];
      smem[${r}u - k] = vec2<f32>(h.x, -h.y);
    }
    workgroupBarrier();`}else S=`
    let loadCount = min(uniforms.signalLength, ${r}u);
    for (var i = local_idx; i < ${r}u; i += ${lt}u) {
      if (i < loadCount) { smem[i] = ${x("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();`;let{code:$,resultOffset:w}=dl(c,r,l),k=p===1?`smem[${w}u + i]`:`smem[${w}u + i] * ${yt(p)}`,I=a===2?y.setByOffset("off + 1u",`${u}(v.y)`):"";return`
  ${aa(g,_,y)}
  var<workgroup> smem: array<vec2<f32>, ${2*sr}>;
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${g.mainStart(lt)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${i}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${a}u;
    ${S}
${$}    for (var i = local_idx; i < uniforms.outputLength; i += ${lt}u) {
      let v = ${k};
      let off = outBase + i * uniforms.inner * ${a}u;
      ${y.setByOffset("off",`${u}(v.x)`)}
      ${I}
    }
  }`};return{name:"DFT",shaderCache:{hint:ra(e,"fft"),inputDependencies:["type"]},getShaderSource:m,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:ia(e),dispatchGroup:{x:e.batch}})}},hl=e=>{let{dataType:t,length:r,inputComponents:i,outputComponents:a,inverse:n,onesided:s}=e,u=Ee(t),l=n?1:-1,p=n?1/r:1,c=m=>{let g=D("x",t,[1]),_=F("y",t,[1]),y=k=>{let I=`inBase + (${k}) * uniforms.inner * ${i}u`,E=`f32(${g.getByOffset(I)})`,C=i===2?`f32(${g.getByOffset(`${I} + 1u`)})`:"0.0";return`vec2<f32>(${E}, ${C})`},x=n&&s?`fn spectrum(inBase: u32, k: u32) -> vec2<f32> {
    let provided = min(uniforms.signalLength, ${Math.floor(r/2)+1}u);
    if (k < provided) { return ${y("k")}; }
    let m = ${r}u - k;
    if (m < provided) {
      let h = ${y("m")};
      return vec2<f32>(h.x, -h.y);
    }
    return vec2<f32>(0.0, 0.0);
  }`:`fn spectrum(inBase: u32, n: u32) -> vec2<f32> {
    if (n < uniforms.signalLength) { return ${y("n")}; }
    return vec2<f32>(0.0, 0.0);
  }`,S=`
      let angle = ${yt(l*Lr)} * f32(knMod) / ${yt(r)};
      acc += cmul(spectrum(inBase, n), vec2<f32>(cos(angle), sin(angle)));
      knMod += k;
      if (knMod >= ${r}u) { knMod -= ${r}u; }`,$=a===2?_.setByOffset("off + 1u",`${u}(v.y)`):"",w=p===1?"acc":`acc * ${yt(p)}`;return`
  ${aa(m,g,_)}
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${x}
  ${m.mainStart(lt)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${i}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${a}u;
    for (var k = local_idx; k < uniforms.outputLength; k += ${lt}u) {
      var acc = vec2<f32>(0.0, 0.0);
      var knMod = 0u;
      for (var n = 0u; n < ${r}u; n++) {${S}
      }
      let v = ${w};
      let off = outBase + k * uniforms.inner * ${a}u;
      ${_.setByOffset("off",`${u}(v.x)`)}
      ${$}
    }
  }`};return{name:"DFT",shaderCache:{hint:ra(e,"direct"),inputDependencies:["type"]},getShaderSource:c,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:ia(e),dispatchGroup:{x:e.batch}})}},na=e=>{if(!e||e.dataType===0)return;if(O.size(e.dims)!==1)throw new Error("DFT optional scalar inputs must have exactly 1 element.");if(e.dataType===6)return e.getInt32Array()[0];let t=Number(e.getBigInt64Array()[0]);if(!Number.isSafeInteger(t))throw new Error("DFT optional scalar inputs are out of JavaScript safe integer range.");return t},fl=e=>{if(!e||e.length<1)throw new Error("DFT requires at least 1 input.");let t=e[0].dims;if(t.length<2)throw new Error("DFT input must have at least 2 dimensions.");let r=t[t.length-1];if(r!==1&&r!==2)throw new Error("DFT input's innermost dimension must be 1 (real) or 2 (complex).")},Ih=(e,t)=>{fl(e.inputs);let r=e.inputs[0],i=r.dims.length,a=t.inverse!==0,n=t.onesided!==0,s=na(e.inputs[1]);if(s!==void 0&&s<=0)throw new Error("dft_length must be greater than zero.");let u=O.normalizeAxis(na(e.inputs[2])??t.axis,i);if(u===i-1)throw new Error("DFT axis must refer to a signal dimension, not the innermost (real/imaginary) dimension.");if(a&&n&&r.dims[i-1]!==2)throw new Error("Inverse one-sided DFT (IRFFT) requires complex-valued input (innermost dimension 2).");let l=pl(r,u,a,n,s);if(l.length<=0)throw new Error(`Invalid DFT length: ${l.length}`);let p=l.length<=sr&&ta(l.length)!==void 0?cl(l):hl(l);e.compute(p,{inputs:[0]})},Eh=e=>he({axis:e.axis??1,inverse:e.inverse??0,onesided:e.onesided??0})}),qr,or,sa,ml,gl,yl,_l,oa,wl,Ch,zh,ey=U(()=>{"use strict";te(),ie(),ke(),ae(),qr="[a-zA-Z]|\\.\\.\\.",or="("+qr+")+",sa="^"+or+"$",ml="("+or+",)*"+or,gl="^"+ml+"$",yl=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},_l=class{constructor(e,t){var a;this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(gl)))throw new Error("Invalid LHS term");if(r.split(",").forEach((n,s)=>{let u=e[s].dims.slice();if(!n.match(RegExp(sa)))throw new Error("Invalid LHS term");let l=this.processTerm(n,!0,u,s);this.lhs.push(l)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([n,s])=>s.count===1||n==="...").map(([n])=>n).join("");else if(!i.match(RegExp(or)))throw new Error("Invalid RHS");(a=i.match(RegExp(qr,"g")))==null||a.forEach(n=>{if(n==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(n);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,n=!1,s=[],u=0;if(!e.match(RegExp(sa))&&!t&&e!=="")throw new Error("Invalid LHS term");let l=e.match(RegExp(qr,"g")),p=new yl(i);return l==null||l.forEach((c,m)=>{if(c==="..."){if(n)throw new Error("Only one ellipsis is allowed per input term");n=!0;let g=a-l.length+1;if(g<0)throw new Error("Ellipsis out of bounds");if(s=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw new Error("Ellipsis must be specified in the LHS");for(let _=0;_<s.length;_++){let y=String.fromCharCode(48+_);p.addSymbol(y,m+_),this.addSymbol(y,r[u++],i)}}else p.addSymbol(c,m+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(c,r[u++],i)}),p}},oa=e=>e+"_max",wl=(e,t,r,i)=>{let a=e.map(p=>p.length).map((p,c)=>D(`input${c}`,t,p)),n=O.size(i),s=F("output",t,i.length),u=[...r.symbolToInfo.keys()].filter(p=>!r.rhs.symbolToIndices.has(p)),l=p=>{let c=[],m="var prod = 1.0;",g="var sum = 0.0;",_="sum += prod;",y=[],x=[],S=[],$=[],w=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((I,E)=>{var C;if(r.rhs.symbolToIndices.has(E)){let A=(C=r.rhs.symbolToIndices.get(E))==null?void 0:C[0];A!==void 0&&r.lhs.forEach((v,M)=>{if(I.inputIndices.includes(M)){let P=v.symbolToIndices.get(E);if(P===void 0)throw new Error("Invalid symbol error");P.forEach(G=>{c.push(`${a[M].indicesSet(`input${M}Indices`,G,s.indicesGet("outputIndices",A))}`)})}})}else r.lhs.forEach((A,v)=>{if(I.inputIndices.includes(v)){let M=A.symbolToIndices.get(E);if(M===void 0)throw new Error("Invalid symbol error");M.forEach(P=>{y.push(`${a[v].indicesSet(`input${v}Indices`,P,`${E}`)}`)}),$.push(`prod *= ${a[v].getByIndices(`input${v}Indices`)};`)}}),x.push(`for(var ${E}: u32 = 0; ${E} < uniforms.${oa(E)}; ${E}++) {`),S.push("}")});let k=w?[...c,`let sum = ${a.map((I,E)=>I.getByIndices(`input${E}Indices`)).join(" * ")};`]:[...c,g,...x,...y,m,...$,_,...S];return`
            ${p.registerUniforms(u.map(I=>({name:`${oa(I)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,s)}

            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${a.map((I,E)=>`var input${E}Indices: ${a[E].type.indices};`).join(`
`)}
            ${k.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let p=u.filter(m=>r.symbolToInfo.has(m)).map(m=>{var g;return{type:12,data:((g=r.symbolToInfo.get(m))==null?void 0:g.dimValue)||0}});p.push({type:12,data:n});let c=e.map((m,g)=>[...Q(m)]).reduce((m,g)=>m.concat(g),p);return c.push(...Q(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:c}},getShaderSource:l}},Ch=(e,t)=>{let r=new _l(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((n,s)=>n.dims);e.compute(wl(a,e.inputs[0].dataType,r,i))},zh=e=>{let t=e.equation.replace(/\s+/g,"");return he({equation:t})}}),$l,ua,bl,vl,Ah,ty=U(()=>{"use strict";te(),ie(),ae(),$l=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},ua=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},bl=(e,t)=>e.length>t.length?ua(e,t):ua(t,e),vl=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=bl(t,r),a=e[0].dataType,n=a===9||O.size(t)===1,s=a===9||t.length>0&&t[t.length-1]%4===0?4:1,u=n||i.length>0&&i[i.length-1]%4===0?4:1,l=Math.ceil(O.size(i)/u),p=m=>{let g=D("input",a,t.length,s),_=F("output",a,i.length,u),y;if(a===9){let x=(S,$,w="")=>`
          let outputIndices${$} = ${_.offsetToIndices(`outputOffset + ${$}u`)};
          let offset${$} = ${g.broadcastedIndicesToOffset(`outputIndices${$}`,_)};
          let index${$} = offset${$} / 4u;
          let component${$} = offset${$} % 4u;
          ${S}[${$}] = ${w}(${g.getByOffset(`index${$}`)}[component${$}]);
        `;y=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${x("data",0,"u32")}
        ${x("data",1,"u32")}
        ${x("data",2,"u32")}
        ${x("data",3,"u32")}
        ${_.setByOffset("global_idx","data")}
      }`}else y=`
        let outputIndices = ${_.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",_)};
        let data = ${_.type.value}(${g.getByOffset(`inputOffset / ${s}`)});
        ${_.setByOffset("global_idx","data")}
      }`;return`
    ${m.registerUniform("vec_size","u32").declareVariables(g,_)}
    ${m.mainStart()}
    ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${y}`},c=[{type:12,data:l},...Q(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${u}`,inputDependencies:["rank"]},getShaderSource:p,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:c})}},Ah=e=>{$l(e.inputs),e.compute(vl(e.inputs),{inputs:[0]})}}),xl,Oh,ry=U(()=>{"use strict";te(),ie(),ae(),un(),xl=e=>{let t=e[0].dataType,r=O.size(e[0].dims),i=O.size(e[1].dims),a=i%4===0,n=s=>{let u=D("x",t,[1],4),l=D("bias",t,[1],4),p=F("y",t,[1],4),c=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],m=_=>`
      let bias${_}_offset: u32 = (global_idx * 4 + ${_}) % uniforms.bias_size;
      let bias${_} = ${l.getByOffset(`bias${_}_offset / 4`)}[bias${_}_offset % 4];`,g=a?`
      let bias = ${l.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${m(0)}${m(1)}${m(2)}${m(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(c).declareVariables(u,l,p)}

    ${Ra(Ee(t))}

    ${s.mainStart(Xt)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${p.setByOffset("global_idx",Na("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:n,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/Xt/4)}})}},Oh=e=>{e.inputs.length<2||O.size(e.inputs[1].dims)===0?Qc(e):e.compute(xl(e.inputs))}}),Sl,kl,Bh,Rh,iy=U(()=>{"use strict";te(),ie(),ke(),ae(),Sl=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},kl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=O.normalizeAxis(t.axis,a),s=r.slice(0);s.splice(n,1,...i);let u=r[n],l=e[0].dataType===9?4:1,p=Math.ceil(O.size(s)/l),c=[{type:12,data:p},{type:6,data:u},{type:12,data:n},...Q(e[0].dims,e[1].dims,s)],m=g=>{let _=D("data",e[0].dataType,e[0].dims.length,l),y=D("inputIndices",e[1].dataType,e[1].dims.length),x=F("output",e[0].dataType,s.length,l),S=w=>{let k=i.length,I=`var indicesIndices${w}  = ${y.type.indices}(0);`;for(let E=0;E<k;E++)I+=`${k>1?`indicesIndices${w}[${E}]`:`indicesIndices${w}`} = ${s.length>1?`outputIndices${w}[uniforms.axis + ${E}]`:`outputIndices${w}`};`;I+=`
          var idx${w} = ${y.getByIndices(`indicesIndices${w}`)};
          if (idx${w} < 0) {
            idx${w} = idx${w} + uniforms.axisDimLimit;
          }
          var dataIndices${w} : ${_.type.indices};
        `;for(let E=0,C=0;E<a;E++)E===n?(I+=`${a>1?`dataIndices${w}[${E}]`:`dataIndices${w}`} = u32(idx${w});`,C+=k):(I+=`${a>1?`dataIndices${w}[${E}]`:`dataIndices${w}`} = ${s.length>1?`outputIndices${w}[${C}]`:`outputIndices${w}`};`,C++);return I},$;if(e[0].dataType===9){let w=(k,I,E="")=>`
          let outputIndices${I} = ${x.offsetToIndices(`outputOffset + ${I}u`)};
          ${S(I)};
          let offset${I} = ${_.indicesToOffset(`dataIndices${I}`)};
          let index${I} = offset${I} / 4u;
          let component${I} = offset${I} % 4u;
          ${k}[${I}] = ${E}(${_.getByOffset(`index${I}`)}[component${I}]);
        `;$=`
        let outputOffset = global_idx * ${l};
        var value = vec4<u32>(0);
        ${w("value",0,"u32")}
        ${w("value",1,"u32")}
        ${w("value",2,"u32")}
        ${w("value",3,"u32")}
        ${x.setByOffset("global_idx","value")}
      `}else $=`
      let outputIndices = ${x.offsetToIndices("global_idx")};
      ${S("")};
      let value = ${_.getByIndices("dataIndices")};
      ${x.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(_,y,x)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${$}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:c}),getShaderSource:m}},Bh=e=>he({axis:e.axis}),Rh=(e,t)=>{let r=e.inputs;Sl(r),e.compute(kl(e.inputs,t))}}),Tl,Nh,Dh,ay=U(()=>{"use strict";te(),ie(),ae(),Tl=(e,t,r,i,a,n,s,u,l)=>{let p=[{type:12,data:n},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:s},{type:12,data:u},{type:12,data:l}],c=[n];p.push(...Q(t.dims,c));let m=g=>{let _=D("indices_data",t.dataType,t.dims.length),y=F("input_slice_offsets_data",12,1,1),x=[_,y],S=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(S).declareVariables(...x)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:c,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:p}),getShaderSource:m},{inputs:[t],outputs:[-1]})[0]},Nh=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,n=r[1].dims,s=n[n.length-1],u=O.sizeToDimension(n,n.length-1),l=O.sizeFromDimension(i,t.batchDims+s),p=O.sizeToDimension(i,t.batchDims),c=O.sizeFromDimension(i,t.batchDims),m=u/p,g=new Array(s),_=l;for(let I=0;I<s;++I)g[s-1-I]=_,_*=i[t.batchDims+s-1-I];let y=Tl(e,r[1],g,t.batchDims,i,u,m,c,s),x=t.batchDims+s;if(x>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let S=n.slice(0,-1).concat(i.slice(x)),$=O.size(S),w=[{type:12,data:$},{type:12,data:l},...Q(r[0].dims,y.dims,S)],k=I=>{let E=D("data",r[0].dataType,r[0].dims.length),C=D("slice_offsets",12,y.dims.length),A=F("output",r[0].dataType,S.length);return`
          ${I.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(E,C,A)}
            ${I.mainStart()}
            ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:S,dataType:a}],dispatchGroup:{x:Math.ceil($/64)},programUniforms:w}),getShaderSource:k},{inputs:[r[0],y]})},Dh=e=>({batchDims:e.batch_dims,cacheKey:""})}),Il,El,Mh,Uh,ny=U(()=>{"use strict";te(),ie(),ke(),ae(),Il=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=O.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],n=e[2],s=e.length===4?e[3]:void 0;if(n.dims.length!==a.dims.length||!a.dims.map((u,l)=>l===r?Math.ceil(u/i)===n.dims[l]:u===n.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==n.dims.length||!s.dims.map((u,l)=>u===n.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},El=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=O.normalizeAxis(t.gatherAxis,a),s=O.normalizeAxis(t.quantizeAxis,a),u=r.slice(0);u.splice(n,1,...i);let l=O.size(u),p=e[2].dataType,c=e[0].dataType===22,m=[{type:12,data:l},{type:12,data:s},{type:12,data:n},{type:12,data:t.blockSize},...Q(...e.map((_,y)=>_.dims),u)],g=_=>{let y=D("data",e[0].dataType,e[0].dims.length),x=D("inputIndices",e[1].dataType,e[1].dims.length),S=D("scales",e[2].dataType,e[2].dims.length),$=e.length>3?D("zeroPoint",e[3].dataType,e[3].dims.length):void 0,w=F("output",p,u.length),k=[y,x,S];$&&k.push($);let I=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${_.registerUniforms(I).declareVariables(...k,w)}
        ${_.mainStart()}
        let output_indices = ${w.offsetToIndices("global_idx")};
        var indices_indices = ${x.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${w.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${x.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${w.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${y.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${w.indicesGet("output_indices","i")};
          ${y.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${x.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[n]};
        }
        ${y.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${w.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${y.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${y.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${y.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${c?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${S.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${S.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${S.getByIndices("scale_indices")};
        ${$?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${$.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${$.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${c?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${Ee(p)}(quantized_data - zero_point) * scale;
        ${w.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((_,y)=>y!==1).map(_=>_.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(_,y)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:p}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:m}),getShaderSource:g}},Mh=(e,t)=>{let r=e.inputs;Il(r,t),e.compute(El(e.inputs,t))},Uh=e=>he({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),Cl,zl,Ph,Lh,sy=U(()=>{"use strict";te(),ie(),ke(),ae(),Cl=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},zl=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,n=e[1].dims,s=e[1].dataType,u=O.normalizeAxis(t.axis,a),l=r[u],p=n.slice(0),c=O.size(p),m=D("input",i,a),g=D("indicesInput",s,n.length),_=F("output",i,p.length),y=[{type:12,data:c},{type:6,data:l},{type:12,data:u}];return y.push(...Q(r,n,p)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(c/64)},programUniforms:y}),getShaderSource:x=>`
      ${x.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(m,g,_)}
      ${x.mainStart()}
      ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${_.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${m.type.indices}(outputIndices);
      ${m.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${m.getByIndices("inputIndices")};

      ${_.setByOffset("global_idx","value")};
  }`}},Ph=e=>he({axis:e.axis}),Lh=(e,t)=>{let r=e.inputs;Cl(r),e.compute(zl(e.inputs,t))}}),Al,Ol,qh,Wh,oy=U(()=>{"use strict";te(),ie(),ae(),Al=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},Ol=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,n,s]=Dp.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),u=[a,n];if(!u)throw new Error("Can't use gemm on the given tensors");let l=16,p=Math.ceil(n/l),c=Math.ceil(a/l),m=!0,g=O.size(u),_=[{type:12,data:m?p:g},{type:12,data:a},{type:12,data:n},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],y=["type","type"];e.length===3&&(_.push(...Q(e[2].dims)),y.push("rank")),_.push(...Q(u));let x=$=>{let w="";t.transA&&t.transB?w="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?w="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?w="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(w="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let k=t.alpha===1?"":"value *= uniforms.alpha;",I=D("a",e[0].dataType,e[0].dims),E=D("b",e[1].dataType,e[1].dims),C=I.type.value,A=null,v=[I,E];e.length===3&&(A=D("c",e[2].dataType,e[2].dims.length),v.push(A));let M=F("output",e[0].dataType,u.length);v.push(M);let P=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${$.registerUniforms(P).declareVariables(...v)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${C}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${w}
    }

    ${k}
    ${A!=null?`let cOffset = ${A.broadcastedIndicesToOffset("vec2(m, n)",M)}; value += ${C}(uniforms.beta) * ${A.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},S=$=>{let w=D("a",e[0].dataType,e[0].dims),k=D("b",e[1].dataType,e[1].dims),I=null,E=[w,k];e.length===3&&(I=D("c",e[2].dataType,e[2].dims.length),E.push(I));let C=F("output",e[0].dataType,u.length);E.push(C);let A=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],v="",M="";t.transA&&t.transB?(M=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${k.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(M=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${k.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(M=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${k.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(M=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${k.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let P=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${$.registerUniforms(A).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${w.type.storage}, ${l}>, ${l}>;
  var<workgroup> tile_b: array<array<${k.type.storage}, ${l}>, ${l}>;
  ${$.mainStart([l,l,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${l};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${l};
    let num_tiles = (uniforms.K - 1) / ${l} + 1;
    var k_start = 0u;
    var value = ${C.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${M}
      k_start = k_start + ${l};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${l}; k++) {
        ${v}
      }
      workgroupBarrier();
    }

    ${P}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${I!=null?`let cOffset = ${I.broadcastedIndicesToOffset("vec2(m, n)",C)}; value += ${C.type.value}(uniforms.beta) * ${I.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return m?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:p*c},programUniforms:_}),getShaderSource:S}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:_}),getShaderSource:x}},qh=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},Wh=(e,t)=>{Al(e.inputs),e.compute(Ol(e.inputs,t))}}),it,dt,Ct,zt,Bl,Rl,Nl,Dl,Ml,Ul,Pl,Ll,Vh,Gh,uy=U(()=>{"use strict";te(),ie(),ke(),ae(),[it,dt,Ct,zt]=[0,1,2,3],Bl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},Rl=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,Nl=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,Dl=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,Ml=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,Ul=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${it}] = batch;
     indices[${dt}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${Ct}] = u32(r);
            indices[${zt}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${Ct}] = u32(clamp(r, 0, H - 1));
          indices[${zt}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${Ct}] = gs_reflect(r, border[1], border[3]);
          indices[${zt}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,Pl=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${it}], indices[${dt}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${it}], indices[${dt}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${it}], indices[${dt}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${it}], indices[${dt}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${it}], indices[${dt}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${it}], indices[${dt}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,Ll=(e,t)=>{let r=D("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=D("grid",e[1].dataType,i.length,2),n=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(n=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[it,dt,Ct,zt]=[0,3,1,2]);let s=F("output",e[0].dataType,n.length),u=r.type.value,l=O.size(n),p=[{type:12,data:l},...Q(e[0].dims,i,n)],c=m=>`
  ${m.registerUniform("output_size","u32").declareVariables(r,a,s)}
  ${Rl}
  ${Nl(u)}
  ${Dl(t)}
  ${Ml(t)}
  ${Ul(r,u,t)}

  ${m.mainStart()}
    ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${Ct}]);
      let W_in = i32(uniforms.x_shape[${zt}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${it}], indices[${Ct}], indices[${zt}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${Pl(s,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:m=>{let g=O.size(n);return{outputs:[{dims:n,dataType:m[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:p}},getShaderSource:c}},Vh=(e,t)=>{Bl(e.inputs),e.compute(Ll(e.inputs,t))},Gh=e=>he({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),Ne,ql,Hh,la,Wl,mr,Fh,jh=U(()=>{"use strict";te(),ie(),ke(),an(),on(),ae(),bt(),Ne=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,ql=(e,t)=>{let r=e[0],i=Ne(e,1),a=Ne(e,2),n=Ne(e,3),s=Ne(e,4),u=Ne(e,5),l=Ne(e,6),p=Ne(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let c=r.dims[0],m=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],_=m,y=0,x=0,S=Math.floor(g/t.numHeads);if(l&&p&&O.size(l.dims)&&O.size(p.dims)){if(l.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(l.dims[0]!==c||l.dims[1]!==t.numHeads||l.dims[3]!==S)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(p.dims[0]!==c||p.dims[1]!==t.numHeads||p.dims[3]!==S)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[2]!==p.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(p.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');y=l.dims[2],x=l.dims[2]}else if(l&&O.size(l.dims)||p&&O.size(p.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let $;if(i&&O.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');$=2,_=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==S)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');$=5,_=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==S)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');$=0,_=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');$=3}if(n&&O.size(n.dims)>0){if(n.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let w=y+_,k=0;if(s&&O.size(s.dims)>0){k=8;let A=s.dims;throw A.length===1?A[0]===c?k=1:A[0]===3*c+2&&(k=3):A.length===2&&A[0]===c&&A[1]===w&&(k=5),k===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let I=!1,E=g;if(a&&O.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(_!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');E=a.dims[2]}else{if(_!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');E=a.dims[1]*a.dims[3],I=!0}}let C=!1;if(s&&O.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(u&&O.size(u.dims)>0){if(u.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==c||u.dims[1]!==t.numHeads||u.dims[2]!==m||u.dims[3]!==w)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:c,sequenceLength:m,pastSequenceLength:y,kvSequenceLength:_,totalSequenceLength:w,maxSequenceLength:x,inputHiddenSize:0,hiddenSize:g,vHiddenSize:E,headSize:S,vHeadSize:Math.floor(E/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:k,scale:t.scale,broadcastResPosBias:C,passPastInKv:I,qkvFormat:$}},Hh=e=>he({...e}),la=he({perm:[0,2,1,3]}),Wl=(e,t,r,i,a,n,s)=>{let u=[i,a,n],l=O.size(u),p=[{type:12,data:l},{type:12,data:s},{type:12,data:n}],c=m=>{let g=F("qkv_with_bias",t.dataType,u),_=D("qkv",t.dataType,u),y=D("bias",r.dataType,u),x=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${m.registerUniforms(x).declareVariables(_,y,g)}
  ${m.mainStart()}
    ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p}),getShaderSource:c},{inputs:[t,r],outputs:[-1]})[0]},mr=(e,t,r,i,a,n,s,u)=>{let l=n;if(s&&O.size(s.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return l=Wl(e,n,s,t,i,r*a,u),l=l.reshape([t,i,r,a]),r===1||i===1?l:e.compute(qe(l,la.perm),{inputs:[l],outputs:[-1]})[0]}else return n.dims.length===3&&(l=n.reshape([t,i,r,a])),r===1||i===1?l:e.compute(qe(l,la.perm),{inputs:[l],outputs:[-1]})[0]},Fh=(e,t)=>{let r=ql(e.inputs,t),i=e.inputs[0],a=Ne(e.inputs,1),n=Ne(e.inputs,2),s=Ne(e.inputs,3),u=Ne(e.inputs,4),l=Ne(e.inputs,5),p=Ne(e.inputs,6),c=Ne(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if((a==null?void 0:a.dims.length)===5)throw new Error("Packed KV is not implemented");let m=a&&n&&a.dims.length===4&&n.dims.length===4,g=mr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(m)return _r(e,g,a,n,u,void 0,p,c,l,r);if(!a||!n)throw new Error("key and value must be provided");let _=mr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,s,r.hiddenSize),y=mr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,n,s,2*r.hiddenSize);_r(e,g,_,y,u,void 0,p,c,l,r)}}),Vl,Gl,Hl,Fl,La,Kh,Zh,Qh=U(()=>{"use strict";te(),ie(),ke(),ae(),Vl=e=>{if(!e||e.length<1)throw new Error("too few inputs")},Gl=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),he({numOutputs:i,axis:t.axis,splitSizes:r})},Hl=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Z("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,Fl=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},La=(e,t)=>{let r=e[0].dims,i=O.size(r),a=e[0].dataType,n=O.normalizeAxis(t.axis,r.length),s=new Array(t.numOutputs),u=D("input",a,r.length),l=new Array(t.numOutputs),p=[],c=[],m=0,g=[{type:12,data:i}];for(let y=0;y<t.numOutputs;y++){m+=t.splitSizes[y],l[y]=m;let x=r.slice();x[n]=t.splitSizes[y],c.push(x),s[y]=F(`output${y}`,a,x.length),p.push({dims:c[y],dataType:e[0].dataType})}g.push({type:12,data:l},...Q(r,...c));let _=y=>`
  ${y.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",l.length).declareVariables(u,...s)}
  ${Hl(l.length)}
  ${Fl(s)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",n)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Z("uniforms.size_in_split_axis","output_number - 1u",l.length)};
      ${u.indicesSet("indices",n,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:_,getRunData:()=>({outputs:p,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:g})}},Kh=(e,t)=>{Vl(e.inputs);let r=e.inputs.length===1?t:Gl(e.inputs,t);e.compute(La(e.inputs,r),{inputs:[0]})},Zh=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return he({axis:t,numOutputs:i,splitSizes:r})}}),jl,Jr,Xh,Yh=U(()=>{"use strict";te(),ie(),ke(),ae(),jl=(e,t)=>{let[r,i,a,n]=e,{numHeads:s,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!O.areEqual(i.dims,[])&&!O.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(n.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(!O.areEqual(a.dims,n.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let l=r.dims[0],p=r.dims[r.dims.length-2],c=a.dims[0],m=O.sizeFromDimension(r.dims,1)/p,g=u===0?a.dims[1]*2:m/s;if(u>g)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(l!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(p!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(p>c)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(g/2!==a.dims[1]&&u/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`)},Jr=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:n}=t,s=e[0].dims[0],u=O.sizeFromDimension(e[0].dims,1),l=e[0].dims[e[0].dims.length-2],p=u/l,c=e[2].dims[1],m=a===0?c*2:p/i,g=new Array(s,l,p/m,m-c),_=O.computeStrides(g),y=[{type:1,data:n},{type:12,data:g},{type:12,data:_},...e[0].dims.length===3?new Array({type:12,data:[u,p,m,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[u,m,l*m,1]}):[],...Q(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],x=S=>{let $=D("input",e[0].dataType,e[0].dims.length),w=D("position_ids",e[1].dataType,e[1].dims.length),k=D("cos_cache",e[2].dataType,e[2].dims.length),I=D("sin_cache",e[3].dataType,e[3].dims.length),E=F("output",e[0].dataType,e[0].dims.length);return S.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:_.length},{name:"input_output_strides",type:"u32",length:_.length}]),`
        ${S.declareVariables($,w,k,I,E)}

        ${S.mainStart(Xt)}
          let half_rotary_emb_dim = uniforms.${k.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${w.broadcastedIndicesToOffset("bsnh.xy",F("",w.type.tensor,2))};
            let position_id =
                u32(${w.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${$.getByOffset("i")} * ${k.get("position_id","bsnh[3]")} -
                ${$.getByOffset("j")} * ${I.get("position_id","bsnh[3]")};
            ${E.setByOffset("i","re")}
            let im = ${$.getByOffset("i")} * ${I.get("position_id","bsnh[3]")} +
                ${$.getByOffset("j")} * ${k.get("position_id","bsnh[3]")};
            ${E.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${E.setByOffset("k",$.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:he({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:x,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(O.size(g)/Xt)},programUniforms:y})}},Xh=(e,t)=>{jl(e.inputs,t),e.compute(Jr(e.inputs,t))}}),Kl,Zl,da,Ql,Jh,ly=U(()=>{"use strict";ke(),te(),on(),jh(),Qh(),bt(),Yh(),ae(),Kl=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let u=!1,l=r.dims[0],p=r.dims[1],c=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],m=p,g=0,_=!i||i.dims.length===0,y=Math.floor(_?c/(t.numHeads+2*t.kvNumHeads):c/t.numHeads);_&&(c=y*t.numHeads);let x=n&&n.dims.length!==0,S=s&&s.dims.length!==0;if(x&&n.dims.length===4&&n.dims[0]===l&&n.dims[1]!==t.kvNumHeads&&n.dims[2]===t.kvNumHeads&&n.dims[3]===y)throw new Error("BSNH pastKey/pastValue is not supported");if(x&&S){if(n.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=n.dims[2]}else if(x||S)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let $=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');m=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==y)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');m=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==y)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');m=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');$=3}let w=0,k=!1,I=t.kvNumHeads?y*t.kvNumHeads:c;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(m!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');I=a.dims[2]}else{if(m!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');I=a.dims[1]*a.dims[3],k=!0}}let E=e.length>4?e[5]:void 0;if(E){if(E.dims.length===0)throw new Error("seqlens_k must be at least 1D, got scalar.");let C=E.dims.reduce((A,v)=>A*v,1);if(C!==l)throw new Error(`seqlens_k must have batch_size (${l}) elements, got ${C}.`);for(let A=0;A<E.dims.length;A++)if(E.dims[A]!==1&&E.dims[A]!==l)throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${l}), got dims[${A}] = ${E.dims[A]}.`)}return{batchSize:l,sequenceLength:p,pastSequenceLength:g,kvSequenceLength:m,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:c,vHiddenSize:I,headSize:y,vHeadSize:Math.floor(I/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:w,scale:t.scale,broadcastResPosBias:!1,passPastInKv:k,qkvFormat:$}},Zl=he({perm:[0,2,1,3]}),da=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(qe(i,Zl.perm),{inputs:[i],outputs:[-1]})[0]),i},Ql=(e,t,r,i)=>{let a=7,n=["type","type"],s=[e*t],u=e*t,l=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],p=c=>{let m=D("seq_lens",r.dataType,r.dims),g=D("total_seq_lens",i.dataType,i.dims),_=F("pos_ids",a,s),y=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${c.registerUniforms(y).declareVariables(m,g,_)}
  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${m.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${_.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${_.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${_.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:n},getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l}),getShaderSource:p}},Jh=(e,t)=>{var I;if(e.inputs.length>14&&e.inputs[14]||e.inputs.length>15&&e.inputs[15])throw new Error("GroupQueryAttention (JSEP): q_norm_weight / k_norm_weight inputs are not supported. The per-head Q/K RMS normalization prologue is implemented only on the CUDA and native WebGPU EPs.");let r=Kl(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(((I=e.inputs[1])==null?void 0:I.dims.length)===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,n=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,l=e.inputs.length>4?e.inputs[5]:void 0,p=e.inputs.length>5?e.inputs[6]:void 0,c=r.kvNumHeads?r.kvNumHeads:r.numHeads,m=he({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,c*r.headSize,c*r.headSize]}),[g,_,y]=!a&&!n?e.compute(La([i],m),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,n],x,S;if(t.doRotary){let E=e.compute(Ql(r.batchSize,r.sequenceLength,l,p),{inputs:[l,p],outputs:[-1]})[0],C=e.inputs[7],A=e.inputs[8],v=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),M=[g,E,C,A],P=[-1];x=e.compute(Jr(M,v),{inputs:M,outputs:P})[0],M.splice(0,1,_);let G=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});S=e.compute(Jr(M,G),{inputs:M,outputs:P})[0]}let $=mr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?x:g,void 0,0),w=da(e,t.doRotary?S:_,r),k=da(e,y,r);_r(e,$,w,k,void 0,void 0,s,u,void 0,r,l,p)}}),pa,Xl,Yl,ef,dy=U(()=>{"use strict";te(),ie(),bt(),ae(),pa=(e,t,r,i,a,n,s,u)=>{let l=Se(n),p=l===1?"f32":`vec${l}f`,c=l===1?"vec2f":`mat2x${l}f`,m=a*s,g=64;m===1&&(g=256);let _=[a,s,n/l],y=[a,s,2],x=["rank","type","type"],S=[];S.push(...Q(_,y));let $=w=>{let k=D("x",t.dataType,3,l),I=D("scale",r.dataType,r.dims),E=D("bias",i.dataType,i.dims),C=F("output",1,3,2),A=[k,I,E,C];return`
  var<workgroup> workgroup_shared : array<${c}, ${g}>;
  const workgroup_size = ${g}u;
  ${w.declareVariables(...A)}
  ${w.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${p}(0);
    var squared_sum = ${p}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${p}(${k.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${c}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${$t("workgroup_shared[0][0]",l)} / f32(hight * ${l});
      let squared_sum_final = ${$t("workgroup_shared[0][1]",l)} / f32(hight * ${l});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${l};${u};${g}`,inputDependencies:x},getRunData:()=>({outputs:[{dims:y,dataType:1}],dispatchGroup:{x:m},programUniforms:S}),getShaderSource:$},{inputs:[t,r,i],outputs:[-1]})[0]},Xl=(e,t,r)=>{let i=t[0].dims,a=i,n=2,s=i[0],u=i[1],l=O.sizeFromDimension(i,n),p=Se(l),c=O.size(a)/p,m=pa(e,t[0],t[1],t[2],s,l,u,r.epsilon),g=[s,u,l/p],_=[s,u],y=["type","none"],x=S=>{let $=D("x",t[0].dataType,g.length,p),w=D("scale_shift",1,_.length,2),k=F("output",t[0].dataType,g.length,p),I=[$,w,k];return`
  ${S.registerUniform("output_size","u32").declareVariables(...I)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${k.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${w.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${$.getByOffset("global_idx")} * ${k.type.value}(scale_shift.x) + ${k.type.value}(scale_shift.y);
      ${k.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${p}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(c/64)},programUniforms:[{type:12,data:c},...Q(g,_,g)]}),getShaderSource:x},{inputs:[t[0],m]})},Yl=(e,t,r)=>{let i=t[0].dims,a=i,n=i[0],s=i[i.length-1],u=O.sizeFromDimension(i,1)/s,l=Se(s),p=O.size(a)/l,c=[{type:12,data:u},{type:12,data:Math.floor(s/l)}],m=["type","type"],g=!1,_=[0,i.length-1];for(let $=0;$<i.length-2;$++)g=g||i[$+1]!==1,_.push($+1);g=g&&i[i.length-1]!==1;let y=g?e.compute(qe(e.inputs[0],_),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},($,w)=>i[_[w]])),x=pa(e,y,t[1],t[2],n,u,s,r.epsilon),S=$=>{let w=Ce(t[0].dataType),k=l===1?"vec2f":`mat${l}x2f`,I=A=>{let v=A===0?"x":"y",M=l===1?"f32":`vec${l}f`;switch(l){case 1:return`${w}(${M}(scale.${v}))`;case 2:return`vec2<${w}>(${M}(scale[0].${v}, scale[1].${v}))`;case 4:return`vec4<${w}>(${M}(scale[0].${v}, scale[1].${v}, scale[2].${v}, scale[3].${v}))`;default:throw new Error(`Not supported compoents ${l}`)}},E=D("input",t[0].dataType,t[0].dims,l),C=F("output",t[0].dataType,a,l);return`
  @group(0) @binding(0) var<storage, read> input : array<${E.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${k}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${C.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${$.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${I(0)}, ${I(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${l}`,inputDependencies:m},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:c}),getShaderSource:S},{inputs:[t[0],x]})},ef=(e,t)=>{t.format==="NHWC"?Yl(e,e.inputs,t):Xl(e,e.inputs,t)}}),Jl,ed,tf,py=U(()=>{"use strict";te(),ie(),ae(),Jl=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},ed=(e,t,r)=>{let i=t.simplified,a=e[0].dims,n=e[1],s=!i&&e[2],u=a,l=O.normalizeAxis(t.axis,a.length),p=O.sizeToDimension(a,l),c=O.sizeFromDimension(a,l),m=O.size(n.dims),g=s?O.size(s.dims):0;if(m!==c||s&&g!==c)throw new Error(`Size of X.shape()[axis:] == ${c}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${m} and bias size of ${g}`);let _=[];for(let E=0;E<a.length;++E)E<l?_.push(a[E]):_.push(1);let y=Se(c),x=["type","type"],S=[{type:12,data:p},{type:1,data:c},{type:12,data:Math.floor(c/y)},{type:1,data:t.epsilon}];s&&x.push("type");let $=r>1,w=r>2,k=E=>{let C=Ce(e[0].dataType),A=[D("x",e[0].dataType,e[0].dims,y),D("scale",n.dataType,n.dims,y)];s&&A.push(D("bias",s.dataType,s.dims,y)),A.push(F("output",e[0].dataType,u,y)),$&&A.push(F("mean_data_output",1,_)),w&&A.push(F("inv_std_output",1,_));let v=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${E.registerUniforms(v).declareVariables(...A)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${Aa("f32",y)};
    var mean_square_vector = ${Aa("f32",y)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${Zt(C,y,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${$t("mean_vector",y)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${$t("mean_square_vector",y)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${Zt(C,y,"x[j + offset]")};
      let f32scale = ${Zt(C,y,"scale[j]")};
      output[j + offset] = ${A[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${Zt(C,y,"bias[j]")}`:""}
      );
    }

    ${$?"mean_data_output[global_idx] = mean":""};
    ${w?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},I=[{dims:u,dataType:e[0].dataType}];return $&&I.push({dims:_,dataType:1}),w&&I.push({dims:_,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${y};${r};${i}`,inputDependencies:x},getRunData:()=>({outputs:I,dispatchGroup:{x:Math.ceil(p/64)},programUniforms:S}),getShaderSource:k}},tf=(e,t)=>{Jl(e.inputs),e.compute(ed(e.inputs,t,e.outputCount))}}),td,rf,cy=U(()=>{"use strict";ie(),cn(),hn(),td=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},rf=e=>{td(e.inputs);let t=Qt.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(pn(e.inputs,{activation:""},t));else{let a=t[t.length-2],n=O.size(e.inputs[0].dims.slice(0,-2)),s=O.size(e.inputs[1].dims.slice(0,-2));if(n!==1&&a===1&&s===1){let u=e.inputs[0].reshape([1,n,i]),l=e.inputs[1].reshape([1,i,r]),p=[1,n,r],c=[u,l];e.compute(Yr(c,{activation:""},t,p),{inputs:c})}else e.compute(Yr(e.inputs,{activation:""},t))}}}),rd,id,ad,af,nf,hy=U(()=>{"use strict";te(),ie(),ke(),ae(),rd=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),n=t.blockSize/8*t.bits,s=e[1];if(!O.areEqual(s.dims,[t.n,a,n]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(O.size(u)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let l=e[3].dims,p=t.n*(t.bits===8?a:Math.floor((a*t.bits+7)/8));if(O.size(l)!==p)throw new Error("zeroPoints input size error.")}},id=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),l=O.size(u),p=e[1].dims[2]/4,c=e[0].dataType,m=Se(t.k),g=Se(p),_=Se(s),y=u.concat([a,s]),x=a>1&&s/_%2===0?2:1,S=O.size(y)/_/x,$=64,w=[],k=[l,a,n/m],I=O.convertShape(e[1].dims).slice();I.splice(-1,1,p/g),w.push(...Q(k)),w.push(...Q(I)),w.push(...Q(e[2].dims)),e.length===4&&w.push(...Q(O.convertShape(e[3].dims)));let E=[l,a,s/_];w.push(...Q(E));let C=A=>{let v=k.length,M=D("a",e[0].dataType,v,m),P=D("b",12,I.length,g),G=D("scales",e[2].dataType,e[2].dims.length),W=[M,P,G],H=e.length===4?D("zero_points",12,e[3].dims.length):void 0;H&&W.push(H);let B=E.length,j=F("output",e[0].dataType,B,_),Y=Ce(e[0].dataType),ee=(()=>{switch(m){case 1:return`array<${Y}, 8>`;case 2:return`mat4x2<${Y}>`;case 4:return`mat2x4<${Y}>`;default:throw new Error(`${m}-component is not supported.`)}})(),re=Math.floor(32/t.bits),J=Math.floor(re/8),ye=()=>{let X="";for(let L=0;L<J;L++){let _e=L*t.bits*4,$e=_e+t.bits;X+=`
          // reuse a data (pass ${L})
            var input_offset${L>0?L:""} = ${L===0?M.indicesToOffset(`${M.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${L>0?L:""}: ${ee};
            for (var j${L>0?L:""}: u32 = 0; j${L>0?L:""} < ${8/m}; j${L>0?L:""}++) {
              a_data${L>0?L:""}[j${L>0?L:""}] = ${M.getByOffset(`input_offset${L>0?L:""}`)};
              input_offset${L>0?L:""}++;
            }
          `;for(let me=0;me<_*x;me++)X+=`
            b_value = ${g===1?`b${me}_data`:`b${me}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${L*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${_e}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${$e}u) & b_mask);`}
            b_quantized_values = ${ee}(${Array.from({length:4},(Re,Oe)=>`${Y}(b_value_lower[${Oe}]), ${Y}(b_value_upper[${Oe}])`).join(", ")});
            b_dequantized_values = ${m===1?`${ee}(${Array.from({length:8},(Re,Oe)=>`(b_quantized_values[${Oe}] - ${H?`zero_point${me}`:"zero_point"}) * scale${me}`).join(", ")});`:`(b_quantized_values - ${ee}(${Array(8).fill(`${H?`zero_point${me}`:"zero_point"}`).join(",")})) * scale${me};`};
            workgroup_shared[local_id.x * ${x} + ${Math.floor(me/_)}]${_>1?`[${me%_}]`:""} += ${Array.from({length:8/m},(Re,Oe)=>`${m===1?`a_data${L>0?L:""}[${Oe}] * b_dequantized_values[${Oe}]`:`dot(a_data${L>0?L:""}[${Oe}], b_dequantized_values[${Oe}])`}`).join(" + ")};
          `}return X},R=()=>{let X=`
            var col_index = col * ${_};
            ${H?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${Y}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let L=0;L<_*x;L++)X+=`
            let scale${L} = ${G.getByOffset("col_index * nBlocksPerCol + block")};
            ${H?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${H.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${L} = ${Y}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return X},K=()=>{let X=`col_index = col * ${_};`;for(let L=0;L<_*x;L++)X+=`
            let b${L}_data = ${P.getByIndices(`${P.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return X+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${ee};
            var b_dequantized_values: ${ee};`,X};return`
        var<workgroup> workgroup_shared: array<${j.type.value}, ${x*$}>;
        ${A.declareVariables(...W,j)}
        ${A.mainStart([$,1,1])}
          let output_indices = ${j.offsetToIndices(`(global_idx / ${$}) * ${x}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${$}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/m};
            ${R()}
            for (var word: u32 = 0; word < ${p}; word += ${g}) {
              ${K()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${ye()}
                word_offset += ${re/m};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${x}) {
            var output_value: ${j.type.value} = ${j.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${$}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${x};
            }
            ${j.setByIndices(`${j.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${m};${g};${_};${x};${$}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:c}],dispatchGroup:{x:S},programUniforms:w}),getShaderSource:C}},ad=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),l=O.size(u),p=e[1].dims[2]/4,c=e[0].dataType,m=Se(t.k),g=Se(p),_=u.concat([a,s]),y=128,x=s%8===0?8:s%4===0?4:1,S=y/x,$=Math.floor(32/t.bits),w=S*g*$,k=w/m,I=w/t.blockSize,E=O.size(_)/x,C=[],A=[l,a,n/m],v=O.convertShape(e[1].dims).slice();v.splice(-1,1,p/g),C.push(...Q(A)),C.push(...Q(v)),C.push(...Q(e[2].dims)),e.length===4&&C.push(...Q(O.convertShape(e[3].dims)));let M=[l,a,s];C.push(...Q(M));let P=G=>{let W=A.length,H=D("a",e[0].dataType,W,m),B=D("b",12,v.length,g),j=D("scales",e[2].dataType,e[2].dims.length),Y=[H,B,j],ee=e.length===4?D("zero_points",12,e[3].dims.length):void 0;ee&&Y.push(ee);let re=M.length,J=F("output",e[0].dataType,re),ye=Ce(e[0].dataType),R=()=>{switch(m){case 1:return`
          let a_data0 = vec4<${ye}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${ye}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${ye}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${ye}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${m}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${H.type.value}, ${k}>;
        var<workgroup> inter_results: array<array<${J.type.value}, ${S}>, ${x}>;
        ${G.declareVariables(...Y,J)}
        ${G.mainStart([S,x,1])}
          let output_indices = ${J.offsetToIndices(`workgroup_index * ${x}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${I} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${k};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${k}; a_offset += ${y})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${H.getByIndices(`${H.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${H.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${I} + local_id.x;
            ${ee?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${ee.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${ye}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${ye}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${j.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${B.getByIndices(`${B.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/m};
            for (var i: u32 = 0; i < ${g}; i++) {
              let b_value = ${g===1?"b_data":"b_data[i]"};
              ${(()=>{let K=Math.floor($/8),X="";for(let L=0;L<K;L++){let _e=L*t.bits*4,$e=_e+t.bits;X+=`
              ${R()}
              {${t.bits===2?`
                let half_word = b_value >> ${L*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${_e}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${$e}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${ye}>(${Array.from({length:4},(me,Re)=>`${ye}(b_value_lower[${Re}]), ${ye}(b_value_upper[${Re}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${ye}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(me,Re)=>`${`dot(a_data${Re}, b_dequantized_values[${Re}])`}`).join(" + ")};
              }
              word_offset += ${8/m};`}return X})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${x}) {
            var output_value: ${J.type.value} = ${J.type.value}(0);
            for (var b = 0u; b < ${S}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${J.setByIndices(`${J.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${m};${g};${S};${x}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:c}],dispatchGroup:{x:E},programUniforms:C}),getShaderSource:P}},af=(e,t)=>{rd(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(ad(e.inputs,t)):e.compute(id(e.inputs,t))},nf=e=>he(e)}),nd,sd,od,ud,ld,dd,pd,cd,sf,fy=U(()=>{"use strict";te(),ie(),ae(),nd=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},sd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${Z("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Z("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${Z("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},od=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Z("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Z("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Z("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Z("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},ud=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Z("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Z("uniforms.x_shape",a,t)})) {
                  k = i32(${Z("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${Z("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},ld=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Z("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${Z("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${Z("uniforms.x_shape",a,t)})) {
                  k -= i32(${Z("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${Z("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},dd=(e,t,r)=>{switch(r.mode){case 0:return sd(e,t,r.pads.length);case 1:return od(e,t,r.pads.length);case 2:return ud(e,t,r.pads.length);case 3:return ld(e,t,r.pads.length);default:throw new Error("Invalid mode")}},pd=(e,t)=>{let r=O.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=O.size(r),n=[{type:12,data:a},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&n.push({type:s?e[2].dataType:1,data:t.value}),n.push(...Q(e[0].dims,r));let u=["rank"],l=p=>{let c=F("output",e[0].dataType,r.length),m=D("x",e[0].dataType,i.length),g=m.type.value,_=dd(c,i.length,t),y=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&y.push({name:"constant_value",type:s?g:"f32"}),`
            ${p.registerUniforms(y).declareVariables(m,c)}
            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${c.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${_}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(O.size(r)/64)},programUniforms:n}),getShaderSource:l}},cd=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,n=new Int32Array(2*a).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let l=0;l<u.length;l++)n[Number(u[l])]=Number(r[l]),n[Number(u[l])+a]=Number(r[l+u.length])}else r.forEach((u,l)=>n[Number(l)]=Number(u));let s=[];return n.forEach(u=>s.push(u)),{mode:t.mode,value:i,pads:s}}else return t},sf=(e,t)=>{nd(e.inputs);let r=cd(e.inputs,t);e.compute(pd(e.inputs,r),{inputs:[0]})}}),ur,ca,ha,fa,ma,hd,fd,ga,ya,of,uf,_a,lf,df,wa,pf,cf,hf,ff,my=U(()=>{"use strict";We(),te(),ie(),ae(),ur=e=>{if(ve.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},ca=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let n=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),u=t.strides.slice(),l=n?t.dilations.slice():[],p=t.pads.slice();Qr.adjustPoolAttributes(r,a,s,u,l,p);let c=Qr.computePoolOutputShape(r,a,u,l,s,p,t.autoPad,t.ceilMode),m=Object.assign({},t);n?Object.assign(m,{kernelShape:s,strides:u,pads:p,dilations:l,cacheKey:t.cacheKey}):Object.assign(m,{kernelShape:s,strides:u,pads:p,cacheKey:t.cacheKey});let g=c.slice();return g.push(g.splice(1,1)[0]),[m,i?g:c]},ha=(e,t)=>{let r=t.format==="NHWC",i=O.size(e),a=O.size(t.kernelShape),n=[{type:12,data:i},{type:12,data:a}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],l=t.strides[t.strides.length-1],p=t.pads[t.pads.length/2-1],c=t.pads[t.pads.length-1],m=!!(p+c);n.push({type:12,data:u},{type:12,data:l},{type:12,data:p},{type:12,data:c}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let _=t.kernelShape[t.kernelShape.length-2],y=t.strides[t.strides.length-2],x=t.pads[t.pads.length/2-2],S=t.pads[t.pads.length-2];g=!!(x+S),n.push({type:12,data:_},{type:12,data:y},{type:12,data:x},{type:12,data:S}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[n,s,!0,m,g]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=O.computeStrides(t.kernelShape);n.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let l=t.pads.reduce((p,c)=>p+c);return[n,s,!!l,!1,!1]}},fa=(e,t,r,i,a,n,s,u,l,p,c,m)=>{let g=a.format==="NHWC",_=t.type.value,y=F("output",t.type.tensor,i);if(a.kernelShape.length<=2){let x="",S="",$="",w=r-(g?2:1);if(c?x=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${w}] < 0 || xIndices[${w}]
                      >= uniforms.x_shape[${w}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`:x=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`,a.kernelShape.length===2){let k=r-(g?3:2);m?S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${k}] = indices[${k}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${k}] < 0 || xIndices[${k}] >= uniforms.x_shape[${k}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${k}] = indices[${k}] * uniforms.sh - uniforms.phStart + j;
                `,$=`
              }
            `}return`
            ${e.registerUniforms(l).declareVariables(t,y)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${y.offsetToIndices("global_idx")};
              var xIndices = ${y.offsetToIndices("global_idx")};

              var value = ${_}(${u});
              var pad = 0;
              ${S}
              ${x}
              ${$}
              ${s}

              output[global_idx] = value;
            }`}else{if(g)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let x=a.kernelShape.length,S=a.pads.length,$="";return p?$=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${n}
              }`:$=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${n}
            `,`
            ${e.registerUniforms(l).declareVariables(t,y)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${y.offsetToIndices("global_idx")};
              var xIndices = ${y.offsetToIndices("global_idx")};

              var offsets: array<u32, ${x}>;

              var value = ${_}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${x-1}u; j++) {
                  offsets[j] = offset / ${Z("uniforms.kernelStrides","j",x)};
                  offset -= offsets[j] * ${Z("uniforms.kernelStrides","j",x)};
                }
                offsets[${x-1}] = offset;

                isPad = false;
                for (var j = ${r-x}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Z("uniforms.strides",`j - ${r-x}u`,x)}
                    + offsets[j - ${r-x}u] - ${Z("uniforms.pads","j - 2u",S)};
                  ${$}
              }
              ${s}

              output[global_idx] = value;
            }`}},ma=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,hd=e=>`${ma(e)};${e.countIncludePad}`,fd=e=>`${ma(e)};${e.storageOrder};${e.dilations}`,ga=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),ya=(e,t,r,i)=>{let[a,n]=ca(t,i,r),s=D("x",t.dataType,t.dims.length),u=s.type.value,l="value += x_val;",p="";a.countIncludePad?p+=`value /= ${u}(uniforms.kernelSize);`:p+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[c,m,g,_,y]=ha(n,a);c.push(...Q(t.dims,n));let x=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${g};${_};${y}`,inputDependencies:x},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(O.size(n)/64)},programUniforms:c}),getShaderSource:S=>fa(S,s,t.dims.length,n.length,a,l,p,0,m,g,_,y)}},of=e=>{let t=e.count_include_pad!==0,r=ga(e);if(r.ceilMode!==0)throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding/divisor) is not yet implemented in the WebGPU AveragePool kernel");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:hd(i)}},uf=(e,t)=>{ur(e.inputs),e.compute(ya("AveragePool",e.inputs[0],!1,t))},_a={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},lf=e=>{let t=e.format;return{format:t,..._a,cacheKey:t}},df=(e,t)=>{ur(e.inputs),e.compute(ya("GlobalAveragePool",e.inputs[0],!0,t))},wa=(e,t,r,i)=>{let[a,n]=ca(t,i,r),s=`
      value = max(x_val, value);
    `,u="",l=D("x",t.dataType,t.dims.length),p=["rank"],[c,m,g,_,y]=ha(n,a);return c.push(...Q(t.dims,n)),{name:e,shaderCache:{hint:`${i.cacheKey};${g};${_};${y}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(O.size(n)/64)},programUniforms:c}),getShaderSource:x=>fa(x,l,t.dims.length,n.length,a,s,u,t.dataType===10?-65504:-1e5,m,g,_,y)}},pf=(e,t)=>{ur(e.inputs),e.compute(wa("MaxPool",e.inputs[0],!1,t))},cf=e=>{let t=e.storage_order,r=e.dilations,i=ga(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding) is not yet implemented in the WebGPU MaxPool kernel");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:fd(a)}},hf=e=>{let t=e.format;return{format:t,..._a,cacheKey:t}},ff=(e,t)=>{ur(e.inputs),e.compute(wa("GlobalMaxPool",e.inputs[0],!0,t))}}),md,gd,mf,gf,gy=U(()=>{"use strict";te(),ie(),ke(),ae(),md=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,n)=>n===t.axis||a===e[0].dims[n]).reduce((a,n)=>a&&n,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},gd=(e,t)=>{let r=O.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,n=e[0].dims,s=e[1].dataType,u=O.size(n),l=i===3||i===2,p=l?[Math.ceil(O.size(e[0].dims)/4)]:e[0].dims,c=e[1].dims,m=e.length>2?e[2]:void 0,g=m?l?[Math.ceil(O.size(m.dims)/4)]:m.dims:void 0,_=c.length===0||c.length===1&&c[0]===1,y=_===!1&&c.length===1,x=Se(u),S=_&&(!l||x===4),$=S?x:1,w=S&&!l?x:1,k=D("input",l?12:i,p.length,w),I=D("scale",s,c.length),E=m?D("zero_point",l?12:i,g.length):void 0,C=F("output",s,n.length,$),A=[k,I];E&&A.push(E);let v=[p,c];m&&v.push(g);let M=[{type:12,data:u/$},{type:12,data:r},{type:12,data:t.blockSize},...Q(...v,n)],P=G=>{let W=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${G.registerUniforms(W).declareVariables(...A,C)}
      ${G.mainStart()}
          ${G.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${C.offsetToIndices("global_idx")};

          // Set input x
          ${l?`
            let input = ${k.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${$===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${k.getByOffset("global_idx")};`};

          // Set scale input
          ${_?`let scale_value= ${I.getByOffset("0")}`:y?`
            let scale_index = ${C.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${I.getByOffset("scale_index")};`:`
            var scale_indices: ${I.type.indices} = output_indices;
            let index = ${I.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${I.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${I.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${E?_?l?`
                let zero_point_input = ${E.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${E.getByOffset("0")}`:y?l?`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${E.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${E.getByOffset("zero_point_index")};`:l?`
                let zero_point_offset = ${I.indicesToOffset("scale_indices")};
                let zero_point_input = ${E.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${E.getByIndices("scale_indices")};`:`let zero_point_value = ${l?a?"i32":"u32":k.type.value}(0);`};
      // Compute and write output
      ${C.setByOffset("global_idx",`${C.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:E?["rank","rank","rank"]:["rank","rank"]},getShaderSource:P,getRunData:()=>({outputs:[{dims:n,dataType:s}],dispatchGroup:{x:Math.ceil(u/$/64),y:1,z:1},programUniforms:M})}},mf=(e,t)=>{md(e.inputs,t),e.compute(gd(e.inputs,t))},gf=e=>he({axis:e.axis,blockSize:e.blockSize})}),yd,_d,yf,yy=U(()=>{"use strict";We(),te(),ae(),yd=(e,t,r)=>{let i=e===t,a=e<t&&r<0,n=e>t&&r>0;if(i||a||n)throw new Error("Range these inputs' contents are invalid.")},_d=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),n=[a],s=a,u=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...Q(n)],l=p=>{let c=F("output",i,n.length),m=c.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:m},{name:"delta",type:m}];return`
        ${p.registerUniforms(g).declareVariables(c)}
        ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${m}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:l,getRunData:()=>({outputs:[{dims:n,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:u})}},yf=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),ve.webgpu.validateInputContent&&yd(t,r,i),e.compute(_d(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),wd,$d,_f,wf,_y=U(()=>{"use strict";te(),ie(),ke(),ae(),wd=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,n=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${n}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${n}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${n}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${n}`;default:throw new Error(`Reduction ${e} is not supported.`)}},$d=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,n=1,s=Math.ceil(O.sizeToDimension(i,i.length-1)/n),u=i[i.length-1],l=O.sizeFromDimension(r,u),p=[{type:12,data:s},{type:12,data:u},{type:12,data:l},...Q(e[1].dims,e[2].dims,a)],c=m=>{let g=D("indices",e[1].dataType,e[1].dims.length),_=D("updates",e[2].dataType,e[2].dims.length,n),y=t.reduction!=="none"&&t.reduction!==""?Vp("output",e[0].dataType,a.length):F("output",e[0].dataType,a.length,n);return`
      ${m.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,_,y)}
      ${m.mainStart()}
        ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${wd(t.reduction,"output[data_offset + i]","value",y.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}),getShaderSource:c}},_f=e=>he({reduction:e.reduction}),wf=(e,t)=>{e.compute($d(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),bd,vd,xd,$a,Sd,kd,Td,Id,Ed,Cd,zd,Ad,ba,Od,Bd,Rd,Nd,Dd,$f,bf,wy=U(()=>{"use strict";te(),ie(),ke(),ae(),bd=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},vd=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,n)=>i[a]=e[n]),i},xd=(e,t,r,i,a,n)=>{let[s,u,l]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],p=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(c=>n.push(c));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach(c=>i.push(c)),i.length!==0&&i.length!==p&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");bd(i,t),t.axes.length>0&&vd(i,t.axes,p).forEach((c,m)=>i[m]=c)}if(l>0&&e.length>l&&e[l].dims.length===1&&e[l].dims[0]>0&&(e[l].getBigInt64Array().forEach(c=>a.push(Number(c))),a.length!==0&&a.length!==p&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>p)throw new Error("Resize requires only of scales or sizes to be specified")},$a=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,Sd=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${$a("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${$a("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",kd=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",Td=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((n,s)=>{i[n]=a[s],i[s+r]=a[t.length+s]}),i):a},Id=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(n=>a.push(n)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((n,s)=>a[n]=r[s])}else r.forEach(n=>a.push(n));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((n,s)=>Math.round(n*t[s]))}return a},Ed=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(n=>t[n]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(n=>t[n]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(n=>t[n]=i),r.axes.forEach(n=>a[n]=Math.round(e[n]*t[n]))):(t.fill(i,0,t.length),a.forEach((n,s)=>a[s]=Math.round(n*t[s]))),a},Cd=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Z("uniforms.scales","i",i)};
        var roi_low = ${Z("uniforms.roi","i",a)};
        var roi_hi = ${Z("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Z("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Z("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,zd=(e,t,r,i,a,n,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Z("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Z("uniforms.roi","i",n)};
          var roi_hi = ${Z("uniforms.roi",`i + ${r.length}`,n)};
          var input_shape_i = ${Z("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Z("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,Ad=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Z("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,ba=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",Od=(e,t,r,i,a)=>{let[n,s,u,l]=r.length===2?[-1,0,1,-1]:[0,2,3,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${ba(e,l,n,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p} = originalIndices[${s}];
      var col:${p} = originalIndices[${u}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${n}])`:"0"};
      var x11: ${p} = getInputValue(batch, channel, row1, col1);
      var x12: ${p} = getInputValue(batch, channel, row1, col2);
      var x21: ${p} = getInputValue(batch, channel, row2, col1);
      var x22: ${p} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p} = abs(row - ${p}(row1));
      var dx2: ${p} = abs(${p}(row2) - row);
      var dy1: ${p} = abs(col - ${p}(col1));
      var dy2: ${p} = abs(${p}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},Bd=(e,t,r,i,a,n,s,u,l,p)=>{let c=r.length===2,m=!0,[g,_]=c?[0,1]:m?[2,3]:[1,2],y=e.type.value,x=S=>{let $=S===g?"row":"col";return`
      fn ${$}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${y} {
        var output_index = ${t.indicesGet("output_indices",S)};
        var originalIdx: ${y} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[S]},
        ${i[S]}, ${r[S]}, ${n[S]}, ${n[S]} + ${r.length});
        var fractOriginalIdx: ${y} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[S]} - 1))) {
          return ${l};
        }
        var data: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${$}: ${y} = originalIdx + ${y}(i);
          if (${$} < 0 || ${$} >= ${r[S]}) {
            ${p?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${l};`:`${$} = max(0, min(${$}, ${r[S]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",S,`u32(${$})`)};
          data[i + 1] = ${S===g?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${x(g)};
    ${x(_)};
  fn getCubicInterpolationCoefs(s: ${y}) -> array<${y}, 4> {
    var absS = abs(s);
    var coeffs: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${y} = 1.0 - absS;
    var twoMinusAbsS: ${y} = 2.0 - absS;
    var onePlusAbsS: ${y} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${y}, 4>, coefs: array<${y}, 4>) -> ${y} {
    var coefsSum: ${y} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${y} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},Rd=(e,t,r,i,a)=>{let[n,s,u,l,p]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],c=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${c} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",l,`max(0, min(width, ${r[l]} - 1))`)};
      ${ba(e,p,n,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${c} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${c} = originalIndices[${s}];
      var height:${c} = originalIndices[${u}];
      var width:${c} = originalIndices[${l}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[l]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[l]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${p}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${n}])`:"0"};

      var x111: ${c} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${c} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${c} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${c} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${c} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${c} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${c} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${c} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${c} = abs(depth - ${c}(depth1));
      var dx2: ${c} = abs(${c}(depth2) - depth);
      var dy1: ${c} = abs(height - ${c}(height1));
      var dy2: ${c} = abs(${c}(height2) - height);
      var dz1: ${c} = abs(width - ${c}(width1));
      var dz2: ${c} = abs(${c}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},Nd=(e,t,r,i,a,n)=>{let s=e.dims,u=Td(n,t.axes,s.length),l=Id(s,i,a,t.axes),p=i.slice();i.length===0&&(p=s.map((w,k)=>w===0?1:l[k]/w),t.keepAspectRatioPolicy!=="stretch"&&(l=Ed(s,p,t)));let c=F("output",e.dataType,l.length),m=D("input",e.dataType,s.length),g=O.size(l),_=s.length===l.length&&s.every((w,k)=>w===l[k]),y=t.coordinateTransformMode==="tf_crop_and_resize",x=t.extrapolationValue,S=m.type.value,$=w=>`
      ${_?"":`
      ${Sd(t.coordinateTransformMode,S)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${Ad(m,s)};
              ${kd(t.nearestMode,r,S)};
              ${zd(m,c,s,l,p.length,u.length,y)};
              `;case"linear":return`
              ${Cd(c,s,l,p.length,u.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${Od(m,c,s,y,x)}`;if(s.length===3||s.length===5)return`${Rd(m,c,s,y,x)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${Bd(m,c,s,l,p,u,t.cubicCoeffA,y,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${w.registerUniform("output_size","u32").registerUniform("scales","f32",p.length).registerUniform("roi","f32",u.length).declareVariables(m,c)}
      ${w.mainStart()}
        ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${_?"output[global_idx] = input[global_idx];":`
        let output_indices = ${c.offsetToIndices("global_idx")};
        var input_indices: ${m.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${m.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${p.length>0?t.mode==="cubic"?p:p.length:""}|${a.length>0?a:""}|${u.length>0?u:""}|${_}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:$,getRunData:()=>({outputs:[{dims:l,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:p},{type:1,data:u},...Q(s,l)]})}},Dd=e=>{let t=e.customDataBuffer;return new Uint32Array(t.buffer,t.byteOffset,1)[0]},$f=(e,t)=>{let r=[],i=[],a=[],n=Dd(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");xd(e.inputs,t,n,r,i,a),e.compute(Nd(e.inputs[0],t,n,r,i,a),{inputs:[0]})},bf=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,n=e.excludeOutside!==0,s=e.extrapolationValue,u=e.keepAspectRatioPolicy,l=e.mode,p=e.nearestMode===""?"simple":e.nearestMode;return he({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:n,extrapolationValue:s,keepAspectRatioPolicy:u,mode:l,nearestMode:p})}}),Md,Ud,vf,$y=U(()=>{"use strict";te(),ie(),ae(),Md=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],n=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==n)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},Ud=(e,t,r,i)=>{let a=t.simplified,n=e[0].dims,s=O.size(n),u=n,l=s,p=n.slice(-1)[0],c=i?n.slice(0,-1).concat(1):[],m=!a&&e.length>3,g=e.length>4,_=i&&r>1,y=i&&r>2,x=r>3,S=64,$=Se(p),w=[{type:12,data:l},{type:12,data:$},{type:12,data:p},{type:1,data:t.epsilon}],k=E=>{let C=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],A=[D("x",e[0].dataType,e[0].dims,$),D("skip",e[1].dataType,e[1].dims,$),D("gamma",e[2].dataType,e[2].dims,$)];m&&A.push(D("beta",e[3].dataType,e[3].dims,$)),g&&A.push(D("bias",e[4].dataType,e[4].dims,$)),A.push(F("output",e[0].dataType,u,$)),_&&A.push(F("mean_output",1,c)),y&&A.push(F("inv_std_output",1,c)),x&&A.push(F("input_skip_bias_sum",e[0].dataType,u,$));let v=Ce(e[0].dataType),M=Ce(1,$);return`

      ${E.registerUniforms(C).declareVariables(...A)}
      var<workgroup> sum_shared : array<${M}, ${S}>;
      var<workgroup> sum_squared_shared : array<${M}, ${S}>;

      ${E.mainStart([S,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${S};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${S};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${S-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":v+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${x?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${Zt(v,$,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${S};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${$t("sum",$)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${$t("square_sum",$)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${_?"mean_output[global_idx] = mean;":""}
        ${y?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${v}(mean)`}) *
            ${v}(inv_std_dev) * gamma[offset1d + i]
            ${m?"+ beta[offset1d + i]":""};
        }
      }`},I=[{dims:u,dataType:e[0].dataType}];return r>1&&I.push({dims:c,dataType:1}),r>2&&I.push({dims:c,dataType:1}),r>3&&I.push({dims:n,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${$};${_};${y};${x}`,inputDependencies:e.map((E,C)=>"type")},getShaderSource:k,getRunData:()=>({outputs:I,dispatchGroup:{x:Math.ceil(l/p)},programUniforms:w})}},vf=(e,t)=>{Md(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(Ud(e.inputs,t,e.outputCount,!1),{outputs:r})}}),Pd,lr,Ld,va,qd,Wd,xf,Sf,by=U(()=>{"use strict";te(),ie(),ke(),ae(),Pd=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},lr=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},Ld=(e,t)=>{if(e.length>1){let r=lr(e,1),i=lr(e,2),a=lr(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),he({starts:r,ends:i,axes:a})}else return t},va=(e,t,r,i,a)=>{let n=e;return e<0&&(n+=r[i[t]]),a[t]<0?Math.max(0,Math.min(n,r[i[t]]-1)):Math.max(0,Math.min(n,r[i[t]]))},qd=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Z("uniforms.input_shape","i",r.length)};
            let steps_i = ${Z("uniforms.steps","i",r.length)};
            let signs_i = ${Z("uniforms.signs","i",r.length)};
            let starts_i = ${Z("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,Wd=(e,t)=>{let r=e[0].dims,i=O.size(r),a=t.axes.length>0?O.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],n=lr(e,4);n.forEach($=>$!==0||(()=>{throw new Error("step cannot be 0")})),n.length===0&&(n=Array(a.length).fill(1));let s=t.starts.map(($,w)=>va($,w,r,a,n)),u=t.ends.map(($,w)=>va($,w,r,a,n));if(a.length!==s.length||a.length!==u.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let $=0;$<r.length;++$)a.includes($)||(s.splice($,0,0),u.splice($,0,r[$]),n.splice($,0,1));let l=n.map($=>Math.sign($));n.forEach(($,w,k)=>{if($<0){let I=(u[w]-s[w])/$,E=s[w],C=E+I*n[w];s[w]=C,u[w]=E,k[w]=-$}});let p=r.slice(0);a.forEach(($,w)=>{p[$]=Math.ceil((u[$]-s[$])/n[$])});let c={dims:p,dataType:e[0].dataType},m=F("output",e[0].dataType,p.length),g=D("input",e[0].dataType,e[0].dims.length),_=O.size(p),y=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:l.length},{name:"steps",type:"u32",length:n.length}],x=[{type:12,data:_},{type:12,data:s},{type:6,data:l},{type:12,data:n},...Q(e[0].dims,p)],S=$=>`
      ${$.registerUniforms(y).declareVariables(g,m)}
        ${qd(g,m,r)}
        ${$.mainStart()}
          ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${m.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${m.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${l.length}_${s.length}_${n.length}`,inputDependencies:["rank"]},getShaderSource:S,getRunData:()=>({outputs:[c],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:x})}},xf=(e,t)=>{Pd(e.inputs,t);let r=Ld(e.inputs,t);e.compute(Wd(e.inputs,r),{inputs:[0]})},Sf=e=>{let t=e.starts,r=e.ends,i=e.axes;return he({starts:t,ends:r,axes:i})}}),Vd,Gd,kf,Tf,vy=U(()=>{"use strict";te(),ie(),ke(),bt(),ae(),Vd=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},Gd=(e,t)=>{let r=e.inputs[0],i=r.dims,a=O.size(i),n=i.length,s=O.normalizeAxis(t.axis,n),u=s<i.length-1,l,p=[];u?(p=Array.from({length:n},(A,v)=>v),p[s]=n-1,p[n-1]=s,l=e.compute(qe(r,p),{inputs:[r],outputs:[-1]})[0]):l=r;let c=l.dims,m=c[n-1],g=a/m,_=Se(m),y=m/_,x=64;g===1&&(x=256);let S=(A,v)=>v===4?`max(max(${A}.x, ${A}.y), max(${A}.z, ${A}.w))`:v===2?`max(${A}.x, ${A}.y)`:v===3?`max(max(${A}.x, ${A}.y), ${A}.z)`:A,$=D("x",l.dataType,l.dims,_),w=F("result",l.dataType,l.dims,_),k=$.type.value,I=Ce(l.dataType)==="f32"?`var threadMax = ${k}(-3.4028234663852886e+38f);`:`var threadMax = ${k}(-65504.0h);`,E=A=>`
      var<workgroup> rowMaxShared : ${k};
      var<workgroup> rowSumShared : ${k};
      var<workgroup> threadShared : array<${k}, ${x}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${k} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${k}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${A.registerUniform("packedCols","i32").declareVariables($,w)}
      ${A.mainStart(x)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${x};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${I}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${k}(${S("threadShared[0]",_)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${k}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${k}(${$t("threadShared[0]",_)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${k}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,C=e.compute({name:"Softmax",shaderCache:{hint:`${_};${x}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:c,dataType:l.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:y}]}),getShaderSource:E},{inputs:[l],outputs:[u?-1:0]})[0];u&&e.compute(qe(C,p),{inputs:[C]})},kf=(e,t)=>{Vd(e.inputs),Gd(e,t)},Tf=e=>he({axis:e.axis})}),xa,Hd,Fd,jd,If,xy=U(()=>{"use strict";te(),ie(),ae(),xa=e=>Array.from(e.getBigInt64Array(),Number),Hd=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(xa(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},Fd=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},jd=(e,t)=>{let r=e[0].dims,i=t??xa(e[1]),a=Fd(r,i),n=O.size(a),s=e[0].dataType,u=D("input",s,r.length),l=F("output",s,a.length),p=c=>`
      const inputShape = ${u.indices(...r)};
      ${c.registerUniform("output_size","u32").declareVariables(u,l)}
      ${c.mainStart()}
      ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${l.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${l.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${l.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},...Q(e[0].dims,a)]}),getShaderSource:p}},If=e=>{Hd(e.inputs),e.compute(jd(e.inputs),{inputs:[0]})}}),Kd,Zd,Ef,Sy=U(()=>{"use strict";te(),ie(),ae(),Kd=(e,t,r,i,a)=>{let n=F("output_data",a,r.length,4),s=D("a_data",t[1].dataType,t[1].dims.length,4),u=D("b_data",t[2].dataType,t[2].dims.length,4),l=D("c_data",t[0].dataType,t[0].dims.length,4),p,c=(m,g,_)=>`select(${g}, ${m}, ${_})`;if(!i)p=n.setByOffset("global_idx",c(s.getByOffset("global_idx"),u.getByOffset("global_idx"),l.getByOffset("global_idx")));else{let m=(g,_,y="")=>{let x=`a_data[index_a${_}][component_a${_}]`,S=`b_data[index_b${_}][component_b${_}]`,$=`bool(c_data[index_c${_}] & (0xffu << (component_c${_} * 8)))`;return`
            let output_indices${_} = ${n.offsetToIndices(`global_idx * 4u + ${_}u`)};
            let offset_a${_} = ${s.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let offset_b${_} = ${u.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let offset_c${_} = ${l.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let index_a${_} = offset_a${_} / 4u;
            let index_b${_} = offset_b${_} / 4u;
            let index_c${_} = offset_c${_} / 4u;
            let component_a${_} = offset_a${_} % 4u;
            let component_b${_} = offset_b${_} % 4u;
            let component_c${_} = offset_c${_} % 4u;
            ${g}[${_}] = ${y}(${c(x,S,$)});
          `};a===9?p=`
            var data = vec4<u32>(0);
            ${m("data",0,"u32")}
            ${m("data",1,"u32")}
            ${m("data",2,"u32")}
            ${m("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:p=`
            ${m("output_data[global_idx]",0)}
            ${m("output_data[global_idx]",1)}
            ${m("output_data[global_idx]",2)}
            ${m("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(l,s,u,n)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${p}
      }`},Zd=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,n=!(O.areEqual(t,r)&&O.areEqual(r,i)),s=t,u=O.size(t);if(n){let p=Qt.calcShape(Qt.calcShape(t,r,!1),i,!1);if(!p)throw new Error("Can't perform where op on the given tensors");s=p,u=O.size(s)}let l=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:p=>Kd(p,e,s,n,a),getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:l},...Q(i,t,r,s)]})}},Ef=e=>{e.compute(Zd(e.inputs))}}),Cf,ky=U(()=>{"use strict";U0(),on(),P0(),L0(),q0(),W0(),V0(),K0(),Q0(),X0(),Y0(),J0(),ey(),ty(),ry(),iy(),ay(),ny(),sy(),oy(),uy(),ly(),dy(),py(),cy(),hy(),jh(),fy(),my(),gy(),yy(),_y(),sn(),wy(),Yh(),$y(),by(),vy(),Qh(),xy(),bt(),un(),Sy(),Cf=new Map([["Abs",[_c]],["Acos",[wc]],["Acosh",[$c]],["Add",[th]],["ArgMax",[fc,Ba]],["ArgMin",[hc,Ba]],["Asin",[bc]],["Asinh",[vc]],["Atan",[xc]],["Atanh",[Sc]],["Attention",[mc]],["AveragePool",[uf,of]],["BatchNormalization",[gc]],["BiasAdd",[yc]],["BiasSplitGelu",[eh]],["Cast",[Tc,kc]],["Ceil",[Ec]],["Clip",[Ic]],["Concat",[ph,ch]],["Conv",[Pa,Ua]],["ConvTranspose",[vh,bh]],["Cos",[Cc]],["Cosh",[zc]],["CumSum",[xh,Sh]],["DepthToSpace",[kh,Th]],["DequantizeLinear",[mf,gf]],["DFT",[Ih,Eh]],["Div",[rh]],["Einsum",[Ch,zh]],["Elu",[Ac,fr]],["Equal",[ih]],["Erf",[Oc]],["Exp",[Bc]],["Expand",[Ah]],["FastGelu",[Oh]],["Floor",[Rc]],["FusedConv",[Pa,Ua]],["Gather",[Rh,Bh]],["GatherElements",[Lh,Ph]],["GatherBlockQuantized",[Mh,Uh]],["GatherND",[Nh,Dh]],["Gelu",[Nc]],["Gemm",[Wh,qh]],["GlobalAveragePool",[df,lf]],["GlobalMaxPool",[ff,hf]],["Greater",[oh]],["GreaterOrEqual",[lh]],["GridSample",[Vh,Gh]],["GroupQueryAttention",[Jh]],["HardSigmoid",[Vc,Wc]],["HardSwish",[Gc]],["InstanceNormalization",[ef]],["LayerNormalization",[tf]],["LeakyRelu",[Dc,fr]],["Less",[uh]],["LessOrEqual",[dh]],["Log",[Yc]],["MatMul",[rf]],["MatMulNBits",[af,nf]],["MaxPool",[pf,cf]],["Mul",[ah]],["MultiHeadAttention",[Fh,Hh]],["Neg",[Uc]],["Not",[Mc]],["Pad",[sf]],["Pow",[nh]],["QuickGelu",[Jc,fr]],["Range",[yf]],["Reciprocal",[Pc]],["ReduceMin",[uc]],["ReduceMean",[ic]],["ReduceMax",[oc]],["ReduceSum",[dc]],["ReduceProd",[lc]],["ReduceL1",[ac]],["ReduceL2",[nc]],["ReduceLogSum",[cc]],["ReduceLogSumExp",[sc]],["ReduceSumSquare",[pc]],["Relu",[Lc]],["Resize",[$f,bf]],["RotaryEmbedding",[Xh]],["ScatterND",[wf,_f]],["Sigmoid",[qc]],["Sin",[Hc]],["Sinh",[Fc]],["Slice",[xf,Sf]],["SkipLayerNormalization",[vf]],["Split",[Kh,Zh]],["Sqrt",[jc]],["Softmax",[kf,Tf]],["Sub",[sh]],["Tan",[Kc]],["Tanh",[Zc]],["ThresholdedRelu",[Xc,fr]],["Tile",[If]],["Transpose",[Hp,Fp]],["Where",[Ef]]])}),zf,Ty=U(()=>{"use strict";We(),ct(),ae(),zf=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){Ge(e.programInfo.name);let n=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let p of t)u.push({binding:u.length,resource:{buffer:p.buffer}});for(let p of r)u.push({binding:u.length,resource:{buffer:p.buffer}});a&&u.push({binding:u.length,resource:a});let l=n.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let p={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:l,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p)}s.setPipeline(e.computePipeline),s.setBindGroup(0,l),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Le(e.programInfo.name)}dispose(){}build(e,t){Ge(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(p=>{r.features.has(p.feature)&&i.push(`enable ${p.extension};`)});let a=Gp(t,this.backend.device.limits),n=e.getShaderSource(a),s=`${i.join(`
`)}
${a.additionalImplementations}
${n}`,u=r.createShaderModule({code:s,label:e.name});le("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let l=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return Le(e.name),{programInfo:e,computePipeline:l,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let n=t*r*i,s=Math.ceil(Math.sqrt(n));if(s>a){if(s=Math.ceil(Math.cbrt(n)),s>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),Af={};Yt(Af,{WebGpuBackend:()=>Of});var Qd,Xd,Yd,Of,Iy=U(()=>{"use strict";We(),te(),ct(),Pp(),D0(),ky(),Ty(),Qd=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let n=e[i].dims.length;r.push(`${a};${n}`);break}case"dims":{let n=e[i].dims.join(",");r.push(`${a};${n}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},Xd=(e,t,r)=>{var a,n;let i=e.name;return(a=e.shaderCache)!=null&&a.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${Qd(t,((n=e.shaderCache)==null?void 0:n.inputDependencies)??new Array(t.length).fill("dims"))}`,i},Yd=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},Of=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=u=>t.features.has(u)&&r.push(u)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i);let n=t,s=t.info??(typeof n.requestAdapterInfo=="function"?await n.requestAdapterInfo():void 0);this.adapterInfo=new Yd(s),this.gpuDataManager=Wp(this),this.programManager=new zf(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,tn(e.logLevel,!!e.debug),this.device.onuncapturederror=u=>{u.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${u.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){var e;typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&((e=this.env)!=null&&e.webgpu)&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;Ge(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{var i;let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let a=0;a<t.length/2;a++){let n=r[a],s=n.kernelId,u=this.kernels.get(s),l=u.kernelType,p=u.kernelName,c=n.programName,m=n.inputTensorViews,g=n.outputTensorViews,_=t[a*2],y=t[a*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=_);let x=Number(_-this.queryTimeBase),S=Number(y-this.queryTimeBase);if(!Number.isSafeInteger(x)||!Number.isSafeInteger(S))throw new RangeError("incorrect timestamp range");if((i=this.env.webgpu.profiling)!=null&&i.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:m.map($=>({dims:$.dims,dataType:pt($.dataType)})),outputsMetadata:g.map($=>({dims:$.dims,dataType:pt($.dataType)})),kernelId:s,kernelType:l,kernelName:p,programName:c,startTime:x,endTime:S});else{let $="";m.forEach((k,I)=>{$+=`input[${I}]: [${k.dims}] | ${pt(k.dataType)}, `});let w="";g.forEach((k,I)=>{w+=`output[${I}]: [${k.dims}] | ${pt(k.dataType)}, `}),console.log(`[profiling] kernel "${s}|${l}|${p}|${c}" ${$}${w}start time: ${x} ns, execution time: ${S-x} ns`)}jr("GPU",`${c}::${_}::${y}`)}e.unmap(),this.pendingQueries.delete(e)}),Le()}run(e,t,r,i,a,n){Ge(e.name);let s=[];for(let w=0;w<t.length;++w){let k=t[w].data;if(k===0)continue;let I=this.gpuDataManager.get(k);if(!I)throw new Error(`no GPU data for input: ${k}`);s.push(I)}let{outputs:u,dispatchGroup:l,programUniforms:p}=e.getRunData(t),c=r.length===0?u.map((w,k)=>k):r;if(c.length!==u.length)throw new Error(`Output size ${c.length} must be equal to ${u.length}.`);let m=[],g=[];for(let w=0;w<u.length;++w){if(!Number.isInteger(c[w])||c[w]<-3||c[w]>=n)throw new Error(`Invalid output index: ${c[w]}`);if(c[w]===-3)continue;let k=c[w]===-1,I=c[w]===-2,E=k||I?a(u[w].dataType,u[w].dims):i(c[w],u[w].dataType,u[w].dims);if(m.push(E),E.data===0)continue;let C=this.gpuDataManager.get(E.data);if(!C)throw new Error(`no GPU data for output: ${E.data}`);if(k&&this.temporaryData.push(C),I){let A=this.kernelPersistentData.get(this.currentKernelId);A||(A=[],this.kernelPersistentData.set(this.currentKernelId,A)),A.push(C)}g.push(C)}if(s.length!==t.length||g.length!==m.length){if(g.length===0)return Le(e.name),m;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let _;if(p){let w=0,k=[];p.forEach(A=>{let v=typeof A.data=="number"?[A.data]:A.data;if(v.length===0)return;let M=A.type===10?2:4,P,G;A.type===10?(G=v.length>4?16:v.length>2?8:v.length*M,P=v.length>4?16:M*v.length):(G=v.length<=2?v.length*M:16,P=16),w=Math.ceil(w/G)*G,k.push(w);let W=A.type===10?8:4;w+=v.length>4?Math.ceil(v.length/W)*P:v.length*M});let I=16;w=Math.ceil(w/I)*I;let E=new ArrayBuffer(w);p.forEach((A,v)=>{let M=k[v],P=typeof A.data=="number"?[A.data]:A.data;if(A.type===6)new Int32Array(E,M,P.length).set(P);else if(A.type===12)new Uint32Array(E,M,P.length).set(P);else if(A.type===10)new Uint16Array(E,M,P.length).set(P);else if(A.type===1)new Float32Array(E,M,P.length).set(P);else throw new Error(`Unsupported uniform type: ${pt(A.type)}`)});let C=this.gpuDataManager.create(w,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(C.buffer,0,E,0,w),this.gpuDataManager.release(C.id),_={offset:0,size:w,buffer:C.buffer}}let y=this.programManager.normalizeDispatchGroupSize(l),x=y[1]===1&&y[2]===1,S=Xd(e,t,x),$=this.programManager.getArtifact(S);if($||($=this.programManager.build(e,y),this.programManager.setArtifact(S,$),le("info",()=>`[artifact] key: ${S}, programName: ${e.name}`)),p&&$.uniformVariablesInfo){if(p.length!==$.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${$.uniformVariablesInfo.length}, got ${p.length} in program "${$.programInfo.name}".`);for(let w=0;w<p.length;w++){let k=p[w],I=k.type,E=typeof k.data=="number"?1:k.data.length,[C,A]=$.uniformVariablesInfo[w];if(I!==C||E!==A)throw new Error(`Uniform variable ${w} mismatch: expect type ${C} with size ${A}, got type ${I} with size ${E} in program "${$.programInfo.name}".`)}}if(le("info",()=>`[ProgramManager] run "${e.name}" (key=${S}) with ${y[0]}x${y[1]}x${y[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let w={kernelId:this.currentKernelId,programName:$.programInfo.name,inputTensorViews:t,outputTensorViews:m};this.pendingKernels.push(w),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(w)}return this.programManager.run($,s,g,y,_),Le(e.name),m}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=Cf.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let n={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,n)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,n=i.kernelName,s=i.kernelEntry,u=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${n}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),le("info",()=>`[WebGPU] Start to run kernel "[${a}] ${n}"...`);let l=this.env.debug;this.temporaryData=[];try{return l&&this.device.pushErrorScope("validation"),s(t,u[1]),0}catch(p){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${n}" failed. ${p}`)),1}finally{l&&r.push(this.device.popErrorScope().then(p=>p?`GPU validation error for kernel "[${a}] ${n}": ${p.message}`:null));for(let p of this.temporaryData)this.gpuDataManager.release(p.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let n=a.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,n);return a.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await za(this,e,t);return rn(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){var e;this.queryType="none",(((e=this.env.webgpu.profiling)==null?void 0:e.mode)==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){le("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){le("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){le("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),n=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(n.computePipeline),a.setBindGroup(0,n.bindGroup),a.dispatchWorkgroups(...n.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),Bf={};Yt(Bf,{init:()=>Rf});var Wr,Jd,Rf,Ey=U(()=>{"use strict";te(),ct(),ie(),N0(),Wr=class Nf{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(O.size(t)!==O.size(this.dims))throw new Error("Invalid new shape");return new Nf(this.module,this.dataType,this.data,t)}},Jd=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo,this.deviceLimits=t.device.limits;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,n=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,n));let s=Number(e.getValue(i*a++,n));this.outputCount=Number(e.getValue(i*a++,n)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,n));let u=[];for(let l=0;l<s;l++){let p=Number(e.getValue(i*a++,n)),c=Number(e.getValue(i*a++,"*")),m=Number(e.getValue(i*a++,n)),g=[];for(let _=0;_<m;_++)g.push(Number(e.getValue(i*a++,n)));u.push(new Wr(e,p,c,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){var s;let r=((s=t==null?void 0:t.inputs)==null?void 0:s.map(u=>typeof u=="number"?this.inputs[u]:u))??this.inputs,i=(t==null?void 0:t.outputs)??[],a=(u,l,p)=>new Wr(this.module,l,this.output(u,p),p),n=(u,l)=>{let p=Dt(u,l);if(!p)throw new Error(`Unsupported data type: ${u}`);let c=p>0?this.backend.gpuDataManager.create(p).id:0;return new Wr(this.module,u,c,l)};return this.backend.run(e,r,i,a,n,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",n=this.module.stackAlloc((1+t.length)*i);this.module.setValue(n,t.length,a);for(let s=0;s<t.length;s++)this.module.setValue(n+i*(s+1),t[s],a);return this.module._JsepOutput(this.opKernelContext,e,n)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},Rf=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let n=(Iy(),yr(Af)).WebGpuBackend,s=new n;await s.initialize(r,i),a("webgpu",[s,u=>s.alloc(Number(u)),u=>s.free(u),(u,l,p,c=!1)=>{if(c)le("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(l)}, size=${Number(p)}`),s.memcpy(Number(u),Number(l));else{le("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(l)}, size=${Number(p)}`);let m=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(p));s.upload(Number(l),m)}},async(u,l,p)=>{le("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${l}, size=${p}`),await s.download(Number(u),()=>t.HEAPU8.subarray(Number(l)>>>0,Number(l+p)>>>0))},(u,l,p)=>s.createKernel(u,Number(l),p,t.UTF8ToString(t._JsepGetNodeName(Number(l)))),u=>s.releaseKernel(u),(u,l,p,c)=>{le("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${p}, kernel=${u}, contextDataOffset=${l}`);let m=new Jd(t,s,Number(l));return s.computeKernel(Number(u),m,c)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let n=new qp(r);a("webnn",[n,()=>n.reserveTensorId(),s=>n.releaseTensorId(s),async(s,u,l,p,c)=>n.ensureTensor(s,u,l,p,c),(s,u)=>{n.uploadTensor(s,u)},async(s,u)=>n.downloadTensor(s,u),(s,u)=>n.registerMLContext(s,u),!!r.trace])}}}),ep,fn,mn,_t,tp,Sa,ei,gn,yn,dr,rp,At,Df,Mf,ka,_n,wn,$n,Uf=U(()=>{"use strict";We(),O0(),B0(),te(),Wt(),Xa(),en(),ep=(e,t)=>{ge()._OrtInit(e,t)!==0&&ce("Can't initialize onnxruntime.")},fn=async e=>{ep(e.wasm.numThreads,Zr(e.logLevel))},mn=async(e,t)=>{var i,a;(a=(i=ge()).asyncInit)==null||a.call(i);let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let n=e.webgpu.powerPreference;if(n!==void 0&&n!=="low-power"&&n!=="high-performance")throw new Error(`Invalid powerPreference setting: "${n}"`);let s=e.webgpu.forceFallbackAdapter;if(s!==void 0&&typeof s!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${s}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:n,forceFallbackAdapter:s}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let n=(Ey(),yr(Bf)).init;t==="webgpu"&&await n("webgpu",ge(),e,r),t==="webnn"&&await n("webnn",ge(),e)}},_t=new Map,tp=e=>{let t=ge(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&ce("Can't get session input/output count.");let n=i===4?"i32":"i64";return[Number(t.getValue(a,n)),Number(t.getValue(a+i,n))]}finally{t.stackRestore(r)}},Sa=(e,t)=>{let r=ge(),i=r.stackSave(),a=0;try{let n=r.PTR_SIZE,s=r.stackAlloc(2*n);r._OrtGetInputOutputMetadata(e,t,s,s+n)!==0&&ce("Can't get session input/output metadata.");let u=Number(r.getValue(s,"*"));a=Number(r.getValue(s+n,"*"));let l=r.HEAP32[a/4];if(l===0)return[u,0];let p=r.HEAPU32[a/4+1],c=[];for(let m=0;m<p;m++){let g=Number(r.getValue(a+8+m*n,"*"));c.push(g!==0?r.UTF8ToString(g):Number(r.getValue(a+8+(m+p)*n,"*")))}return[u,l,c]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},ei=e=>{let t=ge(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},gn=async(e,t)=>{var m,g,_,y;let r,i,a=ge();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=ei(e);let n=0,s=0,u=0,l=[],p=[],c=[];try{if([s,l]=await Np(t),(t==null?void 0:t.externalData)&&a.mountExternalData){let v=[];for(let M of t.externalData){let P=typeof M=="string"?M:M.path,G=typeof M=="string"?M:M.data;v.push(ri(G).then(W=>{a.mountExternalData(P,W)}))}await Promise.all(v)}for(let v of(t==null?void 0:t.executionProviders)??[])if((typeof v=="string"?v:v.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof v!="string"){let M=v,P=M==null?void 0:M.context,G=M==null?void 0:M.gpuDevice,W=M==null?void 0:M.deviceType,H=M==null?void 0:M.powerPreference;P?a.currentContext=P:G?a.currentContext=await a.webnnCreateMLContext(G):a.currentContext=await a.webnnCreateMLContext({deviceType:W,powerPreference:H})}else a.currentContext=await a.webnnCreateMLContext();break}n=await a._OrtCreateSession(r,i,s),(m=a.webgpuOnCreateSession)==null||m.call(a,n),n===0&&ce("Can't create a session."),(g=a.jsepOnCreateSession)==null||g.call(a),a.currentContext&&(a.webnnRegisterMLContext(n,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[x,S]=tp(n),$=!!(t!=null&&t.enableGraphCapture),w=[],k=[],I=[],E=[],C=[];for(let v=0;v<x;v++){let[M,P,G]=Sa(n,v);M===0&&ce("Can't get an input name."),p.push(M);let W=a.UTF8ToString(M);w.push(W),I.push(P===0?{name:W,isTensor:!1}:{name:W,isTensor:!0,type:pt(P),shape:G})}for(let v=0;v<S;v++){let[M,P,G]=Sa(n,v+x);M===0&&ce("Can't get an output name."),c.push(M);let W=a.UTF8ToString(M);k.push(W),E.push(P===0?{name:W,isTensor:!1}:{name:W,isTensor:!0,type:pt(P),shape:G});{if($&&(t==null?void 0:t.preferredOutputLocation)===void 0){C.push("gpu-buffer");continue}let H=typeof(t==null?void 0:t.preferredOutputLocation)=="string"?t.preferredOutputLocation:((_=t==null?void 0:t.preferredOutputLocation)==null?void 0:_[W])??"cpu",B=a.webnnIsGraphOutput;if(H==="cpu"&&B&&B(n,W)){C.push("ml-tensor-cpu-output");continue}if(H!=="cpu"&&H!=="cpu-pinned"&&H!=="gpu-buffer"&&H!=="ml-tensor")throw new Error(`Not supported preferred output location: ${H}.`);if($&&H!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${H}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);C.push(H)}}let A=null;return C.some(v=>v==="gpu-buffer"||v==="ml-tensor"||v==="ml-tensor-cpu-output")&&(u=a._OrtCreateBinding(n),u===0&&ce("Can't create IO binding."),A={handle:u,outputPreferredLocations:C,outputPreferredLocationsEncoded:C.map(v=>v==="ml-tensor-cpu-output"?"ml-tensor":v).map(v=>Ca(v))}),_t.set(n,[n,p,c,A,$,!1]),[n,w,k,I,E]}catch(x){throw p.forEach(S=>a._OrtFree(S)),c.forEach(S=>a._OrtFree(S)),u!==0&&a._OrtReleaseBinding(u)!==0&&ce("Can't release IO binding."),n!==0&&a._OrtReleaseSession(n)!==0&&ce("Can't release session."),x}finally{a._free(r),s!==0&&a._OrtReleaseSessionOptions(s)!==0&&ce("Can't release session options."),l.forEach(x=>a._free(x)),(y=a.unmountExternalData)==null||y.call(a)}},yn=e=>{var l,p,c;let t=ge(),r=_t.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,n,s,u]=r;s&&(u&&t._OrtClearBoundOutputs(s.handle)!==0&&ce("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&ce("Can't release IO binding.")),(l=t.jsepOnReleaseSession)==null||l.call(t,e),(p=t.webnnOnReleaseSession)==null||p.call(t,e),(c=t.webgpuOnReleaseSession)==null||c.call(t,e),a.forEach(m=>t._OrtFree(m)),n.forEach(m=>t._OrtFree(m)),t._OrtReleaseSession(i)!==0&&ce("Can't release session."),_t.delete(e)},dr=new Map,rp=1,At=new Map,Df=e=>{let t=ge(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a LoRA adapter. failed to allocate a buffer of size ${e.byteLength}.`);try{t.HEAPU8.set(e,r);let i=t._OrtCreateLoraAdapter(r,e.byteLength);i===0&&ce("Can't create a LoRA adapter.");let a=rp++;return dr.set(a,i),a}finally{t._free(r)}},Mf=e=>{let t=ge(),r=dr.get(e);if(r===void 0)throw new Error(`cannot release LoRA adapter. invalid adapter id: ${e}`);if(At.has(e))throw new Error(`cannot release LoRA adapter. the adapter is used by a run in progress. adapter id: ${e}`);t._OrtReleaseLoraAdapter(r)!==0&&ce("Can't release LoRA adapter."),dr.delete(e)},ka=async(e,t,r,i,a,n,s=!1)=>{if(!e){t.push(0);return}let u=ge(),l=u.PTR_SIZE,p=e[0],c=e[1],m=e[3],g=m,_,y;if(p==="string"&&(m==="gpu-buffer"||m==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&m!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${n} when enableGraphCapture is true.`);if(m==="gpu-buffer"){let $=e[2].gpuBuffer;y=Dt(Nt(p),c);{let w=u.jsepRegisterBuffer;if(!w)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');_=w(i,n,$,y)}}else if(m==="ml-tensor"){let $=e[2].mlTensor;y=Dt(Nt(p),c);let w=u.webnnRegisterMLTensor;if(!w)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');_=w(i,$,Nt(p),c)}else{let $=e[2];if(Array.isArray($)){y=l*$.length,_=u._malloc(y),r.push(_);for(let w=0;w<$.length;w++){if(typeof $[w]!="string")throw new TypeError(`tensor data at index ${w} is not a string`);u.setValue(_+w*l,Ye($[w],r),"*")}}else{let w=u.webnnIsGraphInput,k=u.webnnIsGraphOutput;if(p!=="string"&&w&&k){let I=u.UTF8ToString(a);if(w(i,I)||k(i,I)){let E=Nt(p);y=Dt(E,c),g="ml-tensor";let C=u.webnnCreateTemporaryTensor,A=u.webnnUploadTensor;if(!C||!A)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let v=await C(i,E,c);A(v,new Uint8Array($.buffer,$.byteOffset,$.byteLength)),_=v}else y=$.byteLength,_=u._malloc(y),r.push(_),u.HEAPU8.set(new Uint8Array($.buffer,$.byteOffset,y),_)}else y=$.byteLength,_=u._malloc(y),r.push(_),u.HEAPU8.set(new Uint8Array($.buffer,$.byteOffset,y),_)}}let x=u.stackSave(),S=u.stackAlloc(4*c.length);try{c.forEach((w,k)=>u.setValue(S+k*l,w,l===4?"i32":"i64"));let $=u._OrtCreateTensor(Nt(p),_,y,S,c.length,Ca(g));$===0&&ce(`Can't create tensor for input/output. session=${i}, index=${n}.`),t.push($)}finally{u.stackRestore(x)}},_n=async(e,t,r,i,a,n,s=[])=>{var B,j,Y,ee;let u=ge(),l=u.PTR_SIZE,p=_t.get(e);if(!p)throw new Error(`cannot run inference. invalid session id: ${e}`);let c=p[0],m=p[1],g=p[2],_=p[3],y=p[4],x=p[5],S=[];if(s.length>0){if(_)throw new Error("LoRA adapters are not supported for a session that uses IO binding, e.g. when an output is preferred to be on GPU, or when the WebNN execution provider produces an output.");for(let re of s){let J=dr.get(re);if(J===void 0)throw new Error(`cannot run inference. invalid LoRA adapter id: ${re}`);S.push(J)}}let $=t.length,w=i.length,k=0,I=[],E=[],C=[],A=[],v=[],M=u.stackSave(),P=u.stackAlloc($*l),G=u.stackAlloc($*l),W=u.stackAlloc(w*l),H=u.stackAlloc(w*l);try{for(let R of s)At.set(R,(At.get(R)??0)+1);[k,I]=Rp(n,S),Mt("wasm prepareInputOutputTensor");for(let R=0;R<$;R++)await ka(r[R],E,A,e,m[t[R]],t[R],y);for(let R=0;R<w;R++)await ka(a[R],C,A,e,g[i[R]],$+i[R],y);Ut("wasm prepareInputOutputTensor");for(let R=0;R<$;R++)u.setValue(P+R*l,E[R],"*"),u.setValue(G+R*l,m[t[R]],"*");for(let R=0;R<w;R++)u.setValue(W+R*l,C[R],"*"),u.setValue(H+R*l,g[i[R]],"*");if(_&&!x){let{handle:R,outputPreferredLocations:K,outputPreferredLocationsEncoded:X}=_;if(m.length!==$)throw new Error(`input count from feeds (${$}) is expected to be always equal to model's input count (${m.length}).`);Mt("wasm bindInputsOutputs");for(let L=0;L<$;L++){let _e=t[L];await u._OrtBindInput(R,m[_e],E[L])!==0&&ce(`Can't bind input[${L}] for session=${e}.`)}for(let L=0;L<w;L++){let _e=i[L];(B=a[L])!=null&&B[3]?(v.push(C[L]),u._OrtBindOutput(R,g[_e],C[L],0)!==0&&ce(`Can't bind pre-allocated output[${L}] for session=${e}.`)):u._OrtBindOutput(R,g[_e],0,X[_e])!==0&&ce(`Can't bind output[${L}] to ${K[L]} for session=${e}.`)}Ut("wasm bindInputsOutputs"),_t.set(e,[c,m,g,_,y,!0])}(j=u.jsepOnRunStart)==null||j.call(u,c),(Y=u.webnnOnRunStart)==null||Y.call(u,c);let re;_?re=await u._OrtRunWithBinding(c,_.handle,w,W,k):re=await u._OrtRun(c,G,P,$,H,w,W,k),re!==0&&ce("failed to call OrtRun().");let J=[],ye=[];Mt("wasm ProcessOutputTensor");for(let R=0;R<w;R++){let K=Number(u.getValue(W+R*l,"*"));if(K===C[R]||v.includes(C[R])){J.push(a[R]),K!==C[R]&&u._OrtReleaseTensor(K)!==0&&ce("Can't release tensor.");continue}let X=u.stackSave(),L=u.stackAlloc(4*l),_e=!1,$e,me=0;try{u._OrtGetTensorData(K,L,L+l,L+2*l,L+3*l)!==0&&ce(`Can't access output tensor data on index ${R}.`);let Re=l===4?"i32":"i64",Oe=Number(u.getValue(L,Re));me=u.getValue(L+l,"*");let vt=u.getValue(L+l*2,"*"),xt=Number(u.getValue(L+l*3,Re)),He=[];for(let Te=0;Te<xt;Te++)He.push(Number(u.getValue(vt+Te*l,Re)));u._OrtFree(vt)!==0&&ce("Can't free memory for tensor dims.");let Be=He.reduce((Te,xe)=>Te*xe,1);$e=pt(Oe);let fe=_==null?void 0:_.outputPreferredLocations[i[R]];if($e==="string"){if(fe==="gpu-buffer"||fe==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let Te=[];for(let xe=0;xe<Be;xe++){let Me=u.getValue(me+xe*l,"*"),Je=u.getValue(me+(xe+1)*l,"*"),St=xe===Be-1?void 0:Je-Me;Te.push(u.UTF8ToString(Me,St))}J.push([$e,He,Te,"cpu"])}else if(fe==="gpu-buffer"&&Be>0){let Te=u.jsepGetBuffer;if(!Te)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let xe=Te(me),Me=Dt(Oe,Be);if(Me===void 0||!Ya($e))throw new Error(`Unsupported data type: ${$e}`);_e=!0,J.push([$e,He,{gpuBuffer:xe,download:u.jsepCreateDownloader(xe,Me,$e),dispose:()=>{u._OrtReleaseTensor(K)!==0&&ce("Can't release tensor.")}},"gpu-buffer"])}else if(fe==="ml-tensor"&&Be>0){let Te=u.webnnEnsureTensor,xe=u.webnnIsGraphInputOutputTypeSupported;if(!Te||!xe)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(Dt(Oe,Be)===void 0||!Ja($e))throw new Error(`Unsupported data type: ${$e}`);if(!xe(e,$e,!1))throw new Error(`preferredLocation "ml-tensor" for ${$e} output is not supported by current WebNN Context.`);let Me=await Te(e,me,Oe,He,!1);_e=!0,J.push([$e,He,{mlTensor:Me,download:u.webnnCreateMLTensorDownloader(me,$e),dispose:()=>{u.webnnReleaseTensorId(me),u._OrtReleaseTensor(K)}},"ml-tensor"])}else if(fe==="ml-tensor-cpu-output"&&Be>0){let Te=u.webnnCreateMLTensorDownloader(me,$e)(),xe=J.length;_e=!0,ye.push((async()=>{let Me=[xe,await Te];return u.webnnReleaseTensorId(me),u._OrtReleaseTensor(K),Me})()),J.push([$e,He,[],"cpu"])}else{let Te=ti($e),xe=new Te(Be);new Uint8Array(xe.buffer,xe.byteOffset,xe.byteLength).set(u.HEAPU8.subarray(me,me+xe.byteLength)),J.push([$e,He,xe,"cpu"])}}finally{u.stackRestore(X),$e==="string"&&me&&u._free(me),_e||u._OrtReleaseTensor(K)}}_&&!y&&(u._OrtClearBoundOutputs(_.handle)!==0&&ce("Can't clear bound outputs."),_t.set(e,[c,m,g,_,y,!1]));for(let[R,K]of await Promise.all(ye))J[R][2]=K;return Ut("wasm ProcessOutputTensor"),J}finally{(ee=u.webnnOnRunEnd)==null||ee.call(u,c),u.stackRestore(M),E.forEach(re=>u._OrtReleaseTensor(re)),C.forEach(re=>u._OrtReleaseTensor(re)),A.forEach(re=>u._free(re)),k!==0&&u._OrtReleaseRunOptions(k),I.forEach(re=>u._free(re));for(let re of s){let J=At.get(re)-1;J===0?At.delete(re):At.set(re,J)}}},wn=e=>{let t=ge(),r=_t.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&ce("Can't get an profile file name."),t._OrtFree(a)},$n=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),at,De,jt,pr,cr,Vr,Ta,Gr,Ot,Bt,ip,Pf,Lf,qf,Wf,Vf,Gf,Hf,Ff,jf,bn=U(()=>{"use strict";We(),Uf(),Wt(),Za(),en(),at=()=>!!ve.wasm.proxy&&typeof document<"u",jt=!1,pr=!1,cr=!1,Gr=new Map,Ot=(e,t)=>{let r=Gr.get(e);r?r.push(t):Gr.set(e,[t])},Bt=()=>{if(jt||!pr||cr||!De)throw new Error("worker not ready")},ip=e=>{switch(e.data.type){case"init-wasm":jt=!1,e.data.err?(cr=!0,Ta[1](e.data.err)):(pr=!0,Ta[0]()),Vr&&(URL.revokeObjectURL(Vr),Vr=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Gr.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}default:}},Pf=async()=>{if(!pr){if(jt)throw new Error("multiple calls to 'initWasm()' detected.");if(cr)throw new Error("previous call to 'initWasm()' failed.");if(jt=!0,at())return new Promise((e,t)=>{De==null||De.terminate(),Op().then(([r,i])=>{try{De=i,De.onerror=n=>t(n),De.onmessage=ip,Ta=[e,t];let a={type:"init-wasm",in:ve};!a.in.wasm.wasmPaths&&(r||Ea)&&(a.in.wasm.wasmPaths={wasm:new URL("/projeto54900/public/app/assets/ort-wasm-simd-threaded.jsep-Dt5UNR3U.wasm",import.meta.url).href}),De.postMessage(a),Vr=r}catch(a){t(a)}},t)});try{await Qa(ve.wasm),await fn(ve),pr=!0}catch(e){throw cr=!0,e}finally{jt=!1}}},Lf=async e=>{if(at())return Bt(),new Promise((t,r)=>{Ot("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:ve}};De.postMessage(i)});await mn(ve,e)},qf=async e=>at()?(Bt(),new Promise((t,r)=>{Ot("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};De.postMessage(i,[e.buffer])})):ei(e),Wf=async(e,t)=>{if(at()){if(t!=null&&t.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Bt(),new Promise((r,i)=>{Ot("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},n=[];e instanceof Uint8Array&&n.push(e.buffer),De.postMessage(a,n)})}else return gn(e,t)},Vf=async e=>{if(at())return Bt(),new Promise((t,r)=>{Ot("release",[t,r]);let i={type:"release",in:e};De.postMessage(i)});yn(e)},Gf=async e=>{if(at())throw new Error("LoRA adapter is not supported for proxy.");let t=typeof e=="string"?await ri(e):e;return Df(t)},Hf=async e=>{if(at())throw new Error("LoRA adapter is not supported for proxy.");Mf(e)},Ff=async(e,t,r,i,a,n,s)=>{if(at()){if(s.length>0)throw new Error("LoRA adapter is not supported for proxy.");if(r.some(u=>u[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(u=>u))throw new Error("pre-allocated output tensor is not supported for proxy.");return Bt(),new Promise((u,l)=>{Ot("run",[u,l]);let p=r,c={type:"run",in:{sessionId:e,inputIndices:t,inputs:p,outputIndices:i,options:n}};De.postMessage(c,$n(p))})}else return _n(e,t,r,i,a,n,s)},jf=async e=>{if(at())return Bt(),new Promise((t,r)=>{Ot("end-profiling",[t,r]);let i={type:"end-profiling",in:e};De.postMessage(i)});wn(e)}}),vn,Kf=U(()=>{"use strict";We(),bn(),vn=class{async loadAdapter(e){Ge(),this.adapterId=await Gf(e),Le()}async dispose(){return Hf(this.adapterId)}}}),Ia,ap,Zf,Cy=U(()=>{"use strict";We(),Kf(),bn(),te(),Ka(),en(),Ia=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},ap=e=>{switch(e[3]){case"cpu":return new nt(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Ya(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return nt.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!Ja(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return nt.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},Zf=class{async fetchModelAndCopyToWasmMemory(e){return qf(await ri(e))}async loadModel(e,t){Ge();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await Wf(r,t),Le()}async dispose(){return Vf(this.sessionId)}async run(e,t,r,i=[]){Ge();let a=i.map(_=>{if(!(_ instanceof vn))throw new Error("LoRA adapter was not created by the WebAssembly backend.");return _.adapterId}),n=[],s=[];Object.entries(e).forEach(_=>{let y=_[0],x=_[1],S=this.inputNames.indexOf(y);if(S===-1)throw new Error(`invalid input '${y}'`);n.push(x),s.push(S)});let u=[],l=[];Object.entries(t).forEach(_=>{let y=_[0],x=_[1],S=this.outputNames.indexOf(y);if(S===-1)throw new Error(`invalid output '${y}'`);u.push(x),l.push(S)});let p=n.map((_,y)=>Ia(_,()=>`input "${this.inputNames[s[y]]}"`)),c=u.map((_,y)=>_?Ia(_,()=>`output "${this.outputNames[l[y]]}"`):null),m=await Ff(this.sessionId,s,p,l,c,r,a),g={};for(let _=0;_<m.length;_++)g[this.outputNames[l[_]]]=u[_]??ap(m[_]);return Le(),g}startProfiling(){}endProfiling(){jf(this.sessionId)}}}),Qf,zy=U(()=>{"use strict";Qf=e=>{if(e!=null&&e.epContextDataRead)throw new Error('session option "epContextDataRead" is not supported by ONNX Runtime Web')}}),Xf={};Yt(Xf,{OnnxruntimeWebAssemblyBackend:()=>Wa,initializeFlags:()=>qa,wasmBackend:()=>Yf});var qa,Wa,Yf,Ay=U(()=>{"use strict";We(),Kf(),bn(),Cy(),zy(),qa=()=>{(typeof ve.wasm.initTimeout!="number"||ve.wasm.initTimeout<0)&&(ve.wasm.initTimeout=0);let e=ve.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),ve.wasm.simd=!1),typeof ve.wasm.proxy!="boolean"&&(ve.wasm.proxy=!1),typeof ve.wasm.trace!="boolean"&&(ve.wasm.trace=!1),typeof ve.wasm.numThreads!="number"||!Number.isInteger(ve.wasm.numThreads)||ve.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)ve.wasm.numThreads=1;else{let t=typeof navigator>"u"?f0("node:os").cpus().length:navigator.hardwareConcurrency;ve.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},Wa=class{async init(e){qa(),await Pf(),await Lf(e)}async createInferenceSessionHandler(e,t){Qf(t);let r=new Zf;return await r.loadModel(e,t),r}async createLoraAdapterHandler(e){let t=new vn;return await t.loadAdapter(e),t}},Yf=new Wa});We();We();We();var Oy="1.31.1",Ry=Tp;{let e=(Ay(),yr(Xf)).wasmBackend;Kt("webgpu",e,5),Kt("webnn",e,5),Kt("cpu",e,10),Kt("wasm",e,10)}Object.defineProperty(ve.versions,"web",{value:Oy,enumerable:!0});/**
* @license
* Copyright 2021 Google LLC. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* =============================================================================
*//**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *//**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */export{Sp as InferenceSession,kp as LoraAdapter,jr as TRACE,Mt as TRACE_EVENT_BEGIN,Ut as TRACE_EVENT_END,Ge as TRACE_FUNC_BEGIN,Le as TRACE_FUNC_END,nt as Tensor,Ry as default,ve as env,Kt as registerBackend};
