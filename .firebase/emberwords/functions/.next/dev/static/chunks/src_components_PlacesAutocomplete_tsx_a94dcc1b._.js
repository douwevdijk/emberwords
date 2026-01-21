(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/PlacesAutocomplete.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlacesAutocomplete
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$locationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/locationService.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function PlacesAutocomplete({ onSelect, onCancel }) {
    _s();
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const autocompleteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlacesAutocomplete.useEffect": ()=>{
            // Check if Google Places is already loaded
            if (window.google?.maps?.places) {
                setIsLoaded(true);
                setIsLoading(false);
                return;
            }
            // Check if script is already being loaded
            const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
            if (existingScript) {
                // Wait for existing script to load
                const checkLoaded = setInterval({
                    "PlacesAutocomplete.useEffect.checkLoaded": ()=>{
                        if (window.google?.maps?.places) {
                            setIsLoaded(true);
                            setIsLoading(false);
                            clearInterval(checkLoaded);
                        }
                    }
                }["PlacesAutocomplete.useEffect.checkLoaded"], 100);
                return ({
                    "PlacesAutocomplete.useEffect": ()=>clearInterval(checkLoaded)
                })["PlacesAutocomplete.useEffect"];
            }
            // Load new script
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$locationService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GOOGLE_PLACES_API_KEY"]}&libraries=places&language=nl`;
            script.async = true;
            script.onload = ({
                "PlacesAutocomplete.useEffect": ()=>{
                    setIsLoaded(true);
                    setIsLoading(false);
                }
            })["PlacesAutocomplete.useEffect"];
            script.onerror = ({
                "PlacesAutocomplete.useEffect": ()=>{
                    console.error('Failed to load Google Places API');
                    setIsLoading(false);
                }
            })["PlacesAutocomplete.useEffect"];
            document.head.appendChild(script);
        }
    }["PlacesAutocomplete.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlacesAutocomplete.useEffect": ()=>{
            if (!isLoaded || !inputRef.current) return;
            // Initialize autocomplete
            autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
                fields: [
                    'geometry',
                    'name',
                    'formatted_address',
                    'address_components'
                ]
            });
            // Listen for place selection
            autocompleteRef.current.addListener('place_changed', {
                "PlacesAutocomplete.useEffect": ()=>{
                    const place = autocompleteRef.current?.getPlace();
                    if (place?.geometry?.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        // Extract city and country from address components
                        let city = '';
                        let country = '';
                        place.address_components?.forEach({
                            "PlacesAutocomplete.useEffect": (component)=>{
                                if (component.types.includes('locality')) {
                                    city = component.long_name;
                                }
                                if (component.types.includes('country')) {
                                    country = component.long_name;
                                }
                            }
                        }["PlacesAutocomplete.useEffect"]);
                        // Build display name
                        const name = city ? `${place.name}, ${city}` : place.name || place.formatted_address || 'Geselecteerde locatie';
                        onSelect({
                            lat,
                            lng,
                            name,
                            city,
                            country
                        });
                    }
                }
            }["PlacesAutocomplete.useEffect"]);
            // Focus input
            inputRef.current.focus();
        }
    }["PlacesAutocomplete.useEffect"], [
        isLoaded,
        onSelect
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center py-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "animate-spin text-amber-500",
                size: 24
            }, void 0, false, {
                fileName: "[project]/src/components/PlacesAutocomplete.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/PlacesAutocomplete.tsx",
            lineNumber: 104,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                        size: 20,
                        className: "absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 z-10"
                    }, void 0, false, {
                        fileName: "[project]/src/components/PlacesAutocomplete.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: inputRef,
                        type: "text",
                        placeholder: "Zoek een plaats, restaurant, cafe...",
                        className: "w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                    }, void 0, false, {
                        fileName: "[project]/src/components/PlacesAutocomplete.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/PlacesAutocomplete.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onCancel,
                className: "text-sm text-stone-500 hover:text-stone-700",
                children: "Annuleer"
            }, void 0, false, {
                fileName: "[project]/src/components/PlacesAutocomplete.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/PlacesAutocomplete.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s(PlacesAutocomplete, "/LpwWzahnocAPge23GBTkpm9NF0=");
_c = PlacesAutocomplete;
var _c;
__turbopack_context__.k.register(_c, "PlacesAutocomplete");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_PlacesAutocomplete_tsx_a94dcc1b._.js.map