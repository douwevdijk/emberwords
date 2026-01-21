(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,81263,e=>{"use strict";var t=e.i(43476),o=e.i(71645),n=e.i(10007),i=e.i(23177),r=e.i(51892),a=e.i(24049),s=e.i(50699),l=e.i(32322);let p=(0,s.createOverlayComponent)(function(e,t){let o=new l.Popup(e,t.overlayContainer);return(0,a.createElementObject)(o,t)},function(e,t,{position:n},i){(0,o.useEffect)(function(){let{instance:o}=e;function r(e){e.popup===o&&(o.update(),i(!0))}function a(e){e.popup===o&&i(!1)}return t.map.on({popupopen:r,popupclose:a}),null==t.overlayContainer?(null!=n&&o.setLatLng(n),o.openOn(t.map)):t.overlayContainer.bindPopup(o),function(){t.map.off({popupopen:r,popupclose:a}),t.overlayContainer?.unbindPopup(),t.map.removeLayer(o)}},[e,t,i,n])});var c=e.i(36730);function u({memories:e}){let t=(0,c.useMap)();return(0,o.useEffect)(()=>{if(0===e.length)return;let o=l.default.latLngBounds(e.map(e=>[e.userLocation.lat,e.userLocation.lng]));o.isValid()&&t.fitBounds(o,{padding:[50,50],maxZoom:10})},[t,e]),null}function d({memories:e,words:o,onSelectMemory:a}){let s=l.default.divIcon({html:`
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
    `,className:"custom-marker",iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-16]});return(0,t.jsxs)(n.MapContainer,{center:[52,5],zoom:3,scrollWheelZoom:!0,style:{height:"100%",width:"100%"},className:"z-0",attributionControl:!1,children:[(0,t.jsx)(i.TileLayer,{attribution:'© <a href="https://carto.com/">CARTO</a>',url:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}),e.length>0&&(0,t.jsx)(u,{memories:e}),e.map(e=>{let n=o.find(t=>t.id===e.cardId);return(0,t.jsx)(r.Marker,{position:[e.userLocation.lat,e.userLocation.lng],icon:s,eventHandlers:{click:()=>a(e)},children:(0,t.jsx)(p,{children:(0,t.jsxs)("div",{className:"text-center min-w-[120px]",children:[(0,t.jsx)("p",{className:"font-serif font-bold text-stone-800",children:n?.word}),(0,t.jsx)("p",{className:"text-xs text-stone-500",children:e.userLocation.name})]})})},e.id)})]})}e.s(["default",()=>d],81263)}]);