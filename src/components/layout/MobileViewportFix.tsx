// After a payment redirect, Android Chrome and iOS lay a phone out at desktop width.
// width=device-width is ignored there; an explicit pixel width is applied only in that case.
const mobileViewportFix = `(function(){
  function fix(){
    var sw=screen.width|0,sh=screen.height|0,short=sw<sh?sw:sh;
    if(!short||short>820||innerWidth<=sw*1.2)return;
    var meta=document.querySelector('meta[name="viewport"]');
    if(!meta){
      meta=document.createElement("meta");
      meta.setAttribute("name","viewport");
      document.head.appendChild(meta);
    }
    var content="width="+sw+", initial-scale=1, viewport-fit=cover";
    meta.setAttribute("content","width="+sw);
    requestAnimationFrame(function(){meta.setAttribute("content",content);});
  }
  fix();
  addEventListener("pageshow",fix);
})();`;

export default function MobileViewportFix() {
  return <script dangerouslySetInnerHTML={{ __html: mobileViewportFix }} />;
}
