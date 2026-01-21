module.exports=[35112,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactDOM},69789,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(3009),e=a.i(75762),f=a.i(28028),g=a.i(10886),h=a.i(76456),i=a.i(99661);let j=(0,h.createOverlayComponent)(function(a,b){let c=new i.Popup(a,b.overlayContainer);return(0,g.createElementObject)(c,b)},function(a,b,{position:d},e){(0,c.useEffect)(function(){let{instance:c}=a;function f(a){a.popup===c&&(c.update(),e(!0))}function g(a){a.popup===c&&e(!1)}return b.map.on({popupopen:f,popupclose:g}),null==b.overlayContainer?(null!=d&&c.setLatLng(d),c.openOn(b.map)):b.overlayContainer.bindPopup(c),function(){b.map.off({popupopen:f,popupclose:g}),b.overlayContainer?.unbindPopup(),b.map.removeLayer(c)}},[a,b,e,d])});var k=a.i(71352);function l({memories:a}){let b=(0,k.useMap)();return(0,c.useEffect)(()=>{if(0===a.length)return;let c=i.default.latLngBounds(a.map(a=>[a.userLocation.lat,a.userLocation.lng]));c.isValid()&&b.fitBounds(c,{padding:[50,50],maxZoom:10})},[b,a]),null}function m({memories:a,words:c,onSelectMemory:g}){let h=i.default.divIcon({html:`
      <div style="
        width: 32px;
        height: 32px;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          background-color: #f59e0b;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 28px;
          height: 28px;
          background-color: rgba(245, 158, 11, 0.2);
          border-radius: 50%;
        "></div>
      </div>
    `,className:"custom-marker",iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-16]});return(0,b.jsxs)(d.MapContainer,{center:[52,5],zoom:3,scrollWheelZoom:!0,style:{height:"100%",width:"100%"},className:"z-0",attributionControl:!1,children:[(0,b.jsx)(e.TileLayer,{attribution:'© <a href="https://carto.com/">CARTO</a>',url:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}),a.length>0&&(0,b.jsx)(l,{memories:a}),a.map(a=>{let d=c.find(b=>b.id===a.cardId);return(0,b.jsx)(f.Marker,{position:[a.userLocation.lat,a.userLocation.lng],icon:h,eventHandlers:{click:()=>g(a)},children:(0,b.jsx)(j,{children:(0,b.jsxs)("div",{className:"text-center min-w-[120px]",children:[(0,b.jsx)("p",{className:"font-serif font-bold text-stone-800",children:d?.word}),(0,b.jsx)("p",{className:"text-xs text-stone-500",children:a.userLocation.name})]})})},a.id)})]})}a.s(["default",()=>m],69789)}];

//# sourceMappingURL=_7ff19504._.js.map