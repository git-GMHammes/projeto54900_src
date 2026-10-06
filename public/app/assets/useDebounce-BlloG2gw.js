import{r as o}from"./index-Cumi54td.js";function n(e,t=400){const[r,s]=o.useState(e);return o.useEffect(()=>{const u=setTimeout(()=>s(e),t);return()=>clearTimeout(u)},[e,t]),r}export{n as u};
