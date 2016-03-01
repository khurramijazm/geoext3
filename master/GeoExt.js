Ext.define("GeoExt.mixin.SymbolCheck",{extend:"Ext.Mixin",statics:{_checked:{},check:function(a){},normalizeSymbol:(function(){var a=function(b){};return a}()),checkSymbol:function(a,b){},isDefinedSymbol:function(a){}},onClassMixedIn:function(a){}});Ext.define("GeoExt.component.FeatureRenderer",{extend:"Ext.Component",alias:"widget.gx_renderer",mixins:["GeoExt.mixin.SymbolCheck"],config:{imgCls:"",minWidth:20,minHeight:20,resolution:1,feature:undefined,pointFeature:undefined,lineFeature:undefined,polygonFeature:undefined,textFeature:undefined,symbolizers:undefined,symbolType:"Polygon"},initComponent:function(){var b=this;var c=this.getId();this.autoEl={tag:"div","class":this.getImgCls(),id:c};if(!this.getLineFeature()){this.setLineFeature(new ol.Feature({geometry:new ol.geom.LineString([[-8,-3],[-3,3],[3,-3],[8,3]])}))}if(!this.getPointFeature()){this.setPointFeature(new ol.Feature({geometry:new ol.geom.Point([0,0])}))}if(!this.getPolygonFeature()){this.setPolygonFeature(new ol.Feature({geometry:new ol.geom.Polygon([[[-8,-4],[-6,-6],[6,-6],[8,-4],[8,4],[6,6],[-6,6],[-8,4]]])}))}if(!this.getTextFeature()){this.setTextFeature(new ol.Feature({geometry:new ol.geom.Point([0,0])}))}this.map=new ol.Map({controls:[],interactions:[],layers:[new ol.layer.Vector({source:new ol.source.Vector()})]});var a=this.getFeature();if(!a){this.setFeature(this["get"+this.getSymbolType()+"Feature"]())}else{this.applyFeature(a)}b.callParent(arguments)},onRender:function(){this.callParent(arguments);this.drawFeature()},afterRender:function(){this.callParent(arguments);this.initCustomEvents()},initCustomEvents:function(){this.clearCustomEvents();this.el.on("click",this.onClick,this)},clearCustomEvents:function(){if(this.el&&this.el.clearListeners){this.el.clearListeners()}},onClick:function(){this.fireEvent("click",this)},beforeDestroy:function(){this.clearCustomEvents();if(this.map){this.map.setTarget(null)}},onResize:function(){this.setRendererDimensions();this.callParent(arguments)},drawFeature:function(){this.map.setTarget(this.el.id);this.setRendererDimensions()},setRendererDimensions:function(){var h=this.feature.getGeometry().getExtent();var j=ol.extent.getWidth(h);var g=ol.extent.getHeight(h);var e=this.initialConfig.resolution;if(!e){e=Math.max(j/this.width||0,g/this.height||0)||1}this.map.setView(new ol.View({minResolution:e,maxResolution:e,projection:new ol.proj.Projection({code:"",units:"pixels"})}));var c=Math.max(this.width||this.getMinWidth(),j/e);var i=Math.max(this.height||this.getMinHeight(),g/e);var b=ol.extent.getCenter(h);var f=c*e/2;var d=i*e/2;var a=[b[0]-f,b[1]-d,b[0]+f,b[1]+d];this.el.setSize(Math.round(c),Math.round(i));this.map.updateSize();this.map.getView().fit(a,this.map.getSize())},applySymbolizers:function(b){var a=this.getFeature();if(a&&b){a.setStyle(b)}return b},applyFeature:function(a){var c=this.getSymbolizers();if(a&&c){a.setStyle(c)}if(this.map){var b=this.map.getLayers().item(0).getSource();b.clear();b.addFeature(a)}return a},update:function(a){if(a.feature){this.setFeature(a.feature)}if(a.symbolizers){this.setSymbolizers(a.symbolizers)}}});Ext.define("GeoExt.data.model.Base",{extend:"Ext.data.Model",requires:["Ext.data.identifier.Uuid"],identifier:"uuid",schema:{id:"geoext-schema",namespace:"GeoExt.data.model"},inheritableStatics:{loadRawData:function(d){var c=this,a=c.getProxy().getReader().readRecords(d||{}),b=a.getRecords(),e=a.getSuccess();if(e&&b.length){return b[0]}}}});Ext.define("GeoExt.data.model.Layer",{extend:"GeoExt.data.model.Base",mixins:["GeoExt.mixin.SymbolCheck"],fields:[{name:"isLayerGroup",type:"boolean",convert:function(b,a){var c=a.getOlLayer();if(c){return(c instanceof ol.layer.Group)}}},{name:"text",type:"string",convert:function(b,a){if(!b&&a.get("isLayerGroup")){return"ol.layer.Group"}else{return b}}},{name:"opacity",type:"number",convert:function(b,a){var c;if(a.data instanceof ol.layer.Base){c=a.getOlLayer();return c.get("opacity")}}},{name:"minResolution",type:"number",convert:function(b,a){var c;if(a.data instanceof ol.layer.Base){c=a.getOlLayer();return c.get("minResolution")}}},{name:"maxResolution",type:"number",convert:function(b,a){var c;if(a.data instanceof ol.layer.Base){c=a.getOlLayer();return c.get("maxResolution")}}}],proxy:{type:"memory",reader:{type:"json"}},getOlLayer:function(){if(this.data instanceof ol.layer.Base){return this.data}}});Ext.define("GeoExt.data.store.Layers",{extend:"Ext.data.Store",alternateClassName:["GeoExt.data.LayerStore"],requires:["GeoExt.data.model.Layer"],mixins:["GeoExt.mixin.SymbolCheck"],model:"GeoExt.data.model.Layer",config:{map:null},constructor:function(a){var b=this;b.callParent([a]);if(a.map){this.bindMap(a.map)}},bindMap:function(c){var b=this;if(!b.map){b.map=c}if(c instanceof ol.Map){var a=c.getLayers();a.forEach(function(d){b.loadRawData(d,true)});a.forEach(function(d){d.on("propertychange",b.onChangeLayer,b)});a.on("add",b.onAddLayer,b);a.on("remove",b.onRemoveLayer,b)}b.on({load:b.onLoad,clear:b.onClear,add:b.onAdd,remove:b.onRemove,update:b.onStoreUpdate,scope:b});b.data.on({replace:b.onReplace,scope:b});b.fireEvent("bind",b,c)},unbindMap:function(){var a=this;if(a.map&&a.map.getLayers()){a.map.getLayers().un("add",a.onAddLayer,a);a.map.getLayers().un("remove",a.onRemoveLayer,a)}a.un("load",a.onLoad,a);a.un("clear",a.onClear,a);a.un("add",a.onAdd,a);a.un("remove",a.onRemove,a);a.un("update",a.onStoreUpdate,a);a.data.un("replace",a.onReplace,a);a.map=null},onChangeLayer:function(b){var d=b.target;var c=this.findBy(function(e){return e.getOlLayer()===d});if(c>-1){var a=this.getAt(c);if(b.key==="title"){a.set("title",d.get("title"))}else{this.fireEvent("update",this,a,Ext.data.Record.EDIT)}}},onAddLayer:function(b){var d=b.element;var c=this.map.getLayers().getArray().indexOf(d);var e=this;d.on("propertychange",e.onChangeLayer,e);if(!e._adding){e._adding=true;var a=e.proxy.reader.read(d);e.insert(c,a.records);delete e._adding}},onRemoveLayer:function(a){var c=this;if(!c._removing){var b=a.element,d=c.getByLayer(b);if(d){c._removing=true;b.un("propertychange",c.onChangeLayer,c);c.remove(d);delete c._removing}}},onLoad:function(c,b,g){var e=this;if(g){if(!Ext.isArray(b)){b=[b]}if(!e._addRecords){e._removing=true;e.map.getLayers().forEach(function(h){h.un("propertychange",e.onChangeLayer,e)});e.map.getLayers().clear();delete e._removing}var a=b.length;if(a>0){var f=new Array(a);for(var d=0;d<a;d++){f[d]=b[d].getOlLayer();f[d].on("propertychange",e.onChangeLayer,e)}e._adding=true;e.map.getLayers().extend(f);delete e._adding}}delete e._addRecords},onClear:function(){var a=this;a._removing=true;a.map.getLayers().forEach(function(b){b.un("propertychange",a.onChangeLayer,a)});a.map.getLayers().clear();delete a._removing},onAdd:function(b,a,c){var g=this;if(!g._adding){g._adding=true;var e;for(var d=0,f=a.length;d<f;++d){e=a[d].getOlLayer();e.on("propertychange",g.onChangeLayer,g);if(c===0){g.map.getLayers().push(e)}else{g.map.getLayers().insertAt(c,e)}}delete g._adding}},onRemove:function(g,b){var f=this;var d;var e;var j;var c,h;if(!f._removing){var a=function(i){if(i===e){j=true}};for(c=0,h=b.length;c<h;++c){d=b[c];e=d.getOlLayer();j=false;e.un("propertychange",f.onChangeLayer,f);f.map.getLayers().forEach(a);if(j){f._removing=true;f.removeMapLayer(d);delete f._removing}}}},onStoreUpdate:function(c,a,b){if(b===Ext.data.Record.EDIT){if(a.modified&&a.modified.title){var d=a.getOlLayer();var e=a.get("title");if(e!==d.get("title")){d.set("title",e)}}}},removeMapLayer:function(a){this.map.getLayers().remove(a.getOlLayer())},onReplace:function(b,a){this.removeMapLayer(a)},getByLayer:function(b){var a=this.findBy(function(c){return c.getOlLayer()===b});if(a>-1){return this.getAt(a)}},destroy:function(){this.unbind();this.callParent()},loadRecords:function(a,b){if(b&&b.addRecords){this._addRecords=true}this.callParent(arguments)},loadRawData:function(e,b){var d=this,a=d.proxy.reader.read(e),c=a.records;if(a.success){d.totalCount=a.total;d.loadRecords(c,b?d.addRecordsOptions:undefined);d.fireEvent("load",d,c,true)}}});Ext.define("GeoExt.component.Map",{extend:"Ext.Component",alias:["widget.gx_map","widget.gx_component_map"],requires:["GeoExt.data.store.Layers"],mixins:["GeoExt.mixin.SymbolCheck"],config:{map:null,pointerRest:false,pointerRestInterval:1000,pointerRestPixelTolerance:3},mapRendered:false,layerStore:null,lastPointerPixel:null,isMouseOverMapEl:null,constructor:function(a){var c=this;c.callParent([a]);if(!(c.getMap() instanceof ol.Map)){var b=new ol.Map({view:new ol.View({center:[0,0],zoom:2})});c.setMap(b)}c.layerStore=Ext.create("GeoExt.data.store.Layers",{storeId:c.getId()+"-store",map:c.getMap()});c.on("resize",c.onResize,c)},onResize:function(){var b=this;if(!b.mapRendered){var a=b.getTargetEl?b.getTargetEl():b.element;b.getMap().setTarget(a.dom);b.mapRendered=true}else{b.getMap().updateSize()}},bufferedPointerMove:Ext.emptyFn,unbufferedPointerMove:function(f){var e=this;var c=e.getPointerRestPixelTolerance();var d=f.pixel;if(!e.isMouseOverMapEl){e.fireEvent("pointerrestout",f);return}if(e.lastPointerPixel){var b=Math.abs(e.lastPointerPixel[0]-d[0]);var a=Math.abs(e.lastPointerPixel[1]-d[1]);if(b>c||a>c){e.lastPointerPixel=d}else{e.fireEvent("pointerrest",f,e.lastPointerPixel);return}}else{e.lastPointerPixel=d}e.fireEvent("pointerrest",f,null)},registerPointerRestEvents:function(){var a=this;var b=a.getMap();if(a.bufferedPointerMove===Ext.emptyFn){a.bufferedPointerMove=Ext.Function.createBuffered(a.unbufferedPointerMove,a.getPointerRestInterval(),a)}b.on("pointermove",a.bufferedPointerMove);if(!a.rendered){a.on("afterrender",a.bindOverOutListeners,a)}else{a.bindOverOutListeners()}},bindOverOutListeners:function(){var a=this;var b=a.getTargetEl?a.getTargetEl():a.element;if(b){b.on({mouseover:a.onMouseOver,mouseout:a.onMouseOut,scope:a})}},unbindOverOutListeners:function(){var a=this;var b=a.getTargetEl?a.getTargetEl():a.element;if(b){b.un({mouseover:a.onMouseOver,mouseout:a.onMouseOut,scope:a})}},onMouseOver:function(){this.isMouseOverMapEl=true},onMouseOut:function(){this.isMouseOverMapEl=false},unregisterPointerRestEvents:function(){var a=this.getMap();this.unbindOverOutListeners();if(a){a.un("pointermove",this.bufferedPointerMove)}},applyPointerRest:function(a){if(a){this.registerPointerRestEvents()}else{this.unregisterPointerRestEvents()}return a},getCenter:function(){return this.getMap().getView().getCenter()},setCenter:function(a){this.getMap().getView().setCenter(a)},getExtent:function(){return this.getView().calculateExtent(this.getMap().getSize())},setExtent:function(a){this.getView().fit(a,this.getMap().getSize())},getLayers:function(){return this.getMap().getLayers()},addLayer:function(a){if(a instanceof ol.layer.Base){this.getMap().addLayer(a)}else{Ext.Error.raise("Can not add layer "+a+" as it is not an instance of ol.layer.Base")}},removeLayer:function(a){if(a instanceof ol.layer.Base){if(Ext.Array.contains(this.getLayers().getArray(),a)){this.getMap().removeLayer(a)}}else{Ext.Error.raise("Can not add layer "+a+" as it is not an instance of ol.layer.Base")}},getStore:function(){return this.layerStore},getView:function(){return this.getMap().getView()},setView:function(a){this.getMap().setView(a)}});Ext.define("GeoExt.component.OverviewMap",{extend:"Ext.Component",alias:["widget.gx_overview","widget.gx_overviewmap","widget.gx_component_overviewmap"],mixins:["GeoExt.mixin.SymbolCheck"],config:{anchorStyle:null,boxStyle:null,layers:[],magnification:5,map:null,parentMap:null,recenterOnClick:true,recenterDuration:500},statics:{rotateCoordAroundCoord:function(g,b,d){var e=Math.cos(d);var c=Math.sin(d);var a=(e*(g[0]-b[0])-c*(g[1]-b[1])+b[0]);var f=(c*(g[0]-b[0])+e*(g[1]-b[1])+b[1]);return[a,f]},rotateGeomAroundCoord:function(c,f,b){var d=this;var a=[];var e;if(c instanceof ol.geom.Point){a.push(d.rotateCoordAroundCoord(c.getCoordinates(),f,b));c.setCoordinates(a[0])}else{if(c instanceof ol.geom.Polygon){e=c.getCoordinates()[0];e.forEach(function(g){a.push(d.rotateCoordAroundCoord(g,f,b))});c.setCoordinates([a])}}return c}},boxFeature:null,anchorFeature:null,extentLayer:null,mapRendered:false,constructor:function(){this.initOverviewFeatures();this.callParent(arguments)},initComponent:function(){var a=this;if(!a.getParentMap()){Ext.Error.raise("No parentMap defined for overviewMap")}else{if(!(a.getParentMap() instanceof ol.Map)){Ext.Error.raise("parentMap is not an instance of ol.Map")}}a.initOverviewMap();a.on("beforedestroy",a.onBeforeDestroy,a);a.on("resize",a.onResize,a);a.callParent()},initOverviewFeatures:function(){var a=this;a.boxFeature=new ol.Feature();a.anchorFeature=new ol.Feature();a.extentLayer=new ol.layer.Vector({source:new ol.source.Vector()})},initOverviewMap:function(){var d=this,e=d.getParentMap(),a;if(d.getLayers().length<1){a=d.getParentMap().getLayers();a.forEach(function(f){if(f instanceof ol.layer.Tile||f instanceof ol.layer.Image){d.getLayers().push(f)}})}d.getLayers().push(d.extentLayer);if(!d.getMap()){var c=e.getView();var b=new ol.Map({controls:new ol.Collection(),interactions:new ol.Collection(),view:new ol.View({center:c.getCenter(),zoom:c.getZoom(),projection:c.getProjection()})});d.setMap(b)}Ext.each(d.getLayers(),function(f){d.getMap().addLayer(f)});e.getView().on("propertychange",d.onParentViewPropChange,d);e.on("postrender",d.updateBox,d);d.setOverviewMapProperty("center");d.setOverviewMapProperty("resolution");d.extentLayer.getSource().addFeatures([d.boxFeature,d.anchorFeature])},onParentViewPropChange:function(a){if(a.key==="center"||a.key==="resolution"){this.setOverviewMapProperty(a.key)}},overviewMapClicked:function(b){var e=this;var f=e.getParentMap();var d=f.getView();var c=d.getCenter();var a=ol.animation.pan({duration:e.getRecenterDuration(),source:c});f.beforeRender(a);d.setCenter(b.coordinate)},updateBox:function(){var f=this,a=f.getParentMap().getView(),g=a.calculateExtent(f.getParentMap().getSize()),e=a.getRotation(),d=a.getCenter(),c=ol.geom.Polygon.fromExtent(g);c=f.self.rotateGeomAroundCoord(c,d,e);f.boxFeature.setGeometry(c);var b=new ol.geom.Point(ol.extent.getTopLeft(g));b=f.self.rotateGeomAroundCoord(b,d,e);f.anchorFeature.setGeometry(b)},setOverviewMapProperty:function(b){var d=this,c=d.getParentMap().getView(),a=d.getMap().getView();if(b==="center"){a.set("center",c.getCenter())}if(b==="resolution"){a.set("resolution",d.getMagnification()*c.getResolution())}},applyRecenterOnClick:function(a){var b=this,c=b.getMap();if(!c){b.addListener("afterrender",function(){b.setRecenterOnClick(a)},b,{single:true});return}if(a){c.on("click",b.overviewMapClicked,b)}else{c.un("click",b.overviewMapClicked,b)}},onBeforeDestroy:function(){var b=this,d=b.getMap(),c=b.getParentMap(),a=c&&c.getView();if(d){d.un("click",b.overviewMapClicked,b)}if(c){c.un("postrender",b.updateBox,b);a.un("propertychange",b.onParentViewPropChange,b)}},onResize:function(){var a=this,c=a.getEl().dom,b=a.getMap();if(!a.mapRendered){b.setTarget(c);a.mapRendered=true}else{a.getMap().updateSize()}},applyAnchorStyle:function(a){this.anchorFeature.setStyle(a);return a},applyBoxStyle:function(a){this.boxFeature.setStyle(a);return a}});Ext.define("GeoExt.component.Popup",{requires:[],extend:"Ext.Component",alias:["widget.gx_popup","widget.gx_component_popup"],config:{overlay:null,map:null},overlayElement:null,overlayElementCreated:false,cls:"gx-popup",constructor:function(b){var c=this,a=b||{},d;if(!Ext.isDefined(a.map)){Ext.Error.raise("Required configuration 'map' not passed")}if(Ext.isDefined(a.renderTo)){d=Ext.get(a.renderTo).dom}else{d=Ext.dom.Helper.append(Ext.getBody(),"<div>");c.overlayElementCreated=true}a.renderTo=d;c.overlayElement=d;c.callParent([a])},initComponent:function(){var a=this;a.on({afterrender:a.setOverlayElement,beforedestroy:a.onBeforeDestroy,scope:a});a.callParent();a.setupOverlay()},setupOverlay:function(){var b=this;var a=new ol.Overlay({autoPan:true,autoPanAnimation:{duration:250}});b.getMap().addOverlay(a);a.on("change:position",b.updateLayout,b);b.setOverlay(a)},setOverlayElement:function(){this.getOverlay().set("element",this.overlayElement)},position:function(b){var a=this;a.getOverlay().setPosition(b)},onBeforeDestroy:function(){var b=this;if(b.overlayElementCreated&&b.overlayElement){var a=b.overlayElement.parentNode;a.removeChild(b.overlayElement)}b.getOverlay().un("change:position",b.doLayout,b)}});Ext.define("GeoExt.data.model.print.LayoutAttribute",{extend:"GeoExt.data.model.Base",fields:[{name:"name",type:"string"},{name:"type",type:"string"},{name:"clientInfo",type:"auto"},{name:"layoutId",reference:{type:"print.Layout",inverse:"attributes"}}]});Ext.define("GeoExt.data.model.print.Layout",{extend:"GeoExt.data.model.Base",requires:["GeoExt.data.model.print.LayoutAttribute"],fields:[{name:"name",type:"string"},{name:"capabilityId",reference:{type:"print.Capability",inverse:"layouts"}}]});Ext.define("GeoExt.data.model.print.Capability",{extend:"GeoExt.data.model.Base",requires:["GeoExt.data.model.print.Layout"],fields:[{name:"app",type:"string"},{name:"formats",type:"auto",defaultValue:[]}]});Ext.define("GeoExt.data.MapfishPrintProvider",{extend:"Ext.Base",mixins:["Ext.mixin.Observable","GeoExt.mixin.SymbolCheck"],requires:["GeoExt.data.model.print.Capability","Ext.data.JsonStore"],config:{capabilities:null,url:""},statics:{_serializers:[],registerSerializer:function(c,b){var a=GeoExt.data.MapfishPrintProvider;a._serializers.push({olSourceCls:c,serializerCls:b})},unregisterSerializer:function(b){var c=GeoExt.data.MapfishPrintProvider._serializers;var a;Ext.each(c,function(e,d){if(e.serializerCls===b){a=d;return false}});if(Ext.isDefined(a)){Ext.Array.removeAt(c,a);return true}return false},findSerializerBySource:function(c){var b=GeoExt.data.MapfishPrintProvider._serializers;var a;Ext.each(b,function(d){if(c instanceof d.olSourceCls){a=d.serializerCls;return false}});if(!a){Ext.log.warn("Couldn't find a suitable serializer for source. Did you require() an appropriate serializer class?")}return a},getLayerArray:function(a){var l=[];var g=true;if(a instanceof GeoExt.data.store.Layers){a.each(function(j){var i=j.getOlLayer();l.push(i)})}else{if(a instanceof ol.Collection){l=Ext.clone(a.getArray())}else{l=Ext.clone(a)}}while(g){var b=[];var c=[];for(var f=0;f<l.length;f++){if(l[f] instanceof ol.layer.Group){b.push(l[f]);var h=l[f].getLayers().getArray();var m=h.length;for(var e=0;e<m;e++){c.push(h[e])}}}if(b.length>0){for(var d=0;d<b.length;d++){l=Ext.Array.remove(l,b[d])}l=Ext.Array.merge(l,c)}else{g=false}}return l},getSerializedLayers:function(f,e,d){var c=f.getLayers();var b=f.getView().getResolution();var g=[];var a=this.getLayerArray(c);if(Ext.isDefined(e)){a=Ext.Array.filter(a,e,d)}Ext.each(a,function(h){var j=h.getSource();var k={};var i=this.findSerializerBySource(j);if(i){k=i.serialize(h,j,b);g.push(k)}},this);return g},renderPrintExtent:function(l,c,g){var h=l.getWidth();var b=l.getHeight();var j=h/b;var k=0.6;var d=g.width/g.height;var i;var e;var a;var f;if(d>=j){i=h*k;e=i/d}else{e=b*k;i=e*d}a=l.getView().calculateExtent([i,e]);f=new ol.Feature(ol.geom.Polygon.fromExtent(a));c.getSource().addFeature(f);return f}},capabilityRec:null,constructor:function(a){this.mixins.observable.constructor.call(this,a);if(!a.capabilities&&!a.url){Ext.Error.raise("Print capabilities or Url required")}this.initConfig(a);this.fillCapabilityRec()},fillCapabilityRec:function(){var b;var a=this.getCapabilities();var c=this.getUrl();var d=function(){this.capabilityRec=b.getAt(0);this.fireEvent("ready",this)};if(a){b=Ext.create("Ext.data.JsonStore",{model:"GeoExt.data.model.print.Capability",listeners:{datachanged:d,scope:this}});b.loadRawData(a)}else{if(c){b=Ext.create("Ext.data.Store",{autoLoad:true,model:"GeoExt.data.model.print.Capability",proxy:{type:"jsonp",url:c,callbackKey:"jsonp"},listeners:{load:d,scope:this}})}}}});Ext.define("GeoExt.data.model.OlObject",{extend:"GeoExt.data.model.Base",mixins:["GeoExt.mixin.SymbolCheck"],statics:{getOlCLassRef:function(c){var b=ol,a;if(Ext.isString(c)){a=c.split(".");if(Ext.Array.indexOf(a,"ol")===0){a.shift()}Ext.Array.each(a,function(d){b=b[d]})}return b}},olClass:"ol.Object",olObject:null,proxy:{type:"memory",reader:"json"},constructor:function(b){var a=this,c=this.statics(),d=c.getOlCLassRef(this.olClass);b=b||{};if(!(b instanceof d)){b=new d(b)}a.olObject=b;a.callParent([this.olObject.getProperties()]);a.olObject.on("propertychange",a.onPropertychange,a)},onPropertychange:function(a){var c=a.target,b=a.key;if(!this.__updating){this.set(b,c.get(b))}},set:function(a,b){var c={};this.callParent(arguments);this.__updating=true;if(Ext.isString(a)){c[a]=b}else{c=a}Ext.Object.each(c,function(e,d){this.olObject.set(e,d)},this);this.__updating=false},destroy:function(){this.olObject.un("propertychange",this.onPropertychange,this);this.callParent(arguments)}});Ext.define("GeoExt.data.model.Feature",{extend:"GeoExt.data.model.OlObject",getFeature:function(){return this.olObject}});Ext.define("GeoExt.data.model.LayerTreeNode",{extend:"GeoExt.data.model.Layer",requires:["Ext.data.NodeInterface"],mixins:["Ext.mixin.Queryable","GeoExt.mixin.SymbolCheck"],fields:[{name:"leaf",type:"boolean",convert:function(b,a){var c=a.get("isLayerGroup");if(c===undefined||c){return false}else{return true}}},{name:"__toggleMode",type:"string",defaultValue:"classic"}],proxy:{type:"memory",reader:{type:"json"}},constructor:function(){var a;this.callParent(arguments);a=this.getOlLayer();if(a instanceof ol.layer.Base){this.set("checked",a.get("visible"));a.on("change:visible",this.onLayerVisibleChange,this)}},onLayerVisibleChange:function(a){var b=a.target;if(!this.__updating){this.set("checked",b.get("visible"))}},set:function(a,c){var b=this;b.callParent(arguments);if(a==="checked"){b.__updating=true;if(b.get("isLayerGroup")&&b.get("__toggleMode")==="classic"){b.getOlLayer().set("visible",c);if(b.childNodes){b.eachChild(function(d){d.getOlLayer().set("visible",c)})}}else{b.getOlLayer().set("visible",c)}b.__updating=false;if(b.get("__toggleMode")==="classic"){b.toggleParentNodes(c)}}},toggleParentNodes:function(b){var a=this;if(b===true){a.__updating=true;a.bubble(function(c){if(!c.isRoot()){c.set("__toggleMode","ol3");c.set("checked",true);c.set("__toggleMode","classic")}});a.__updating=false}if(b===false){a.__updating=true;a.bubble(function(d){if(!d.isRoot()){var c=true;d.eachChild(function(e){if(e.get("checked")){c=false}});if(c){d.set("__toggleMode","ol3");d.set("checked",false);d.set("__toggleMode","classic")}}});a.__updating=false}},getRefItems:function(){return this.childNodes},getRefOwner:function(){return this.parentNode}},function(){Ext.data.NodeInterface.decorate(this)});Ext.define("GeoExt.data.serializer.Base",{extend:"Ext.Base",requires:["GeoExt.data.MapfishPrintProvider"],mixins:["GeoExt.mixin.SymbolCheck"],inheritableStatics:{sourceCls:null,serialize:function(){Ext.raise("This method must be overriden by subclasses.");return null},register:function(a){GeoExt.data.MapfishPrintProvider.registerSerializer(a.sourceCls,a)},validateSource:function(a){if(!(a instanceof this.sourceCls)){Ext.raise("Cannot serialize this source with this serializer")}}}});Ext.define("GeoExt.data.serializer.ImageWMS",{extend:"GeoExt.data.serializer.Base",mixins:["GeoExt.mixin.SymbolCheck"],inheritableStatics:{sourceCls:ol.source.ImageWMS,serialize:function(a,b){this.validateSource(b);var c={baseURL:b.getUrl(),customParams:b.getParams(),layers:[b.getParams().LAYERS],opacity:a.getOpacity(),styles:[""],type:"WMS"};return c}}},function(a){a.register(a)});Ext.define("GeoExt.data.serializer.TileWMS",{extend:"GeoExt.data.serializer.Base",mixins:["GeoExt.mixin.SymbolCheck"],inheritableStatics:{sourceCls:ol.source.TileWMS,serialize:function(a,b){this.validateSource(b);var c={baseURL:b.getUrls()[0],customParams:b.getParams(),layers:[b.getParams().LAYERS],opacity:a.getOpacity(),styles:[""],type:"WMS"};return c}}},function(a){a.register(a)});Ext.define("GeoExt.data.serializer.Vector",{extend:"GeoExt.data.serializer.Base",mixins:["GeoExt.mixin.SymbolCheck"],inheritableStatics:{PRINTSTYLE_TYPES:{POINT:"Point",LINE_STRING:"LineString",POLYGON:"Polygon"},GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE:{},FALLBACK_SERIALIZATION:{geoJson:{type:"FeatureCollection",features:[]},opacity:1,style:{version:"2","*":{symbolizers:[{type:"point",strokeColor:"white",strokeOpacity:1,strokeWidth:4,strokeDashstyle:"solid",fillColor:"red"}]}},type:"geojson"},FEAT_STYLE_PREFIX:"_gx3_style_",GX_UID_PROPERTY:"__gx_uid__",format:new ol.format.GeoJSON(),sourceCls:ol.source.Vector,serialize:function(g,a,b){var j=this;j.validateSource(a);var c=a.getFeatures();var i=j.format;var e=[];var d={version:2};Ext.each(c,function(n){var p=n.getGeometry();if(Ext.isEmpty(p)){return}var l=p.getType();var k=i.writeFeatureObject(n);var o=null;var m=n.getStyleFunction();if(Ext.isDefined(m)){o=m.call(n,b)}else{m=g.getStyleFunction();if(Ext.isDefined(m)){o=m.call(g,n,b)}}if(o!==null&&o.length>0){e.push(k);if(Ext.isEmpty(k.properties)){k.properties={}}Ext.each(o,function(t,s){var r=j.getUid(t);var q=j.FEAT_STYLE_PREFIX+s;j.encodeVectorStyle(d,l,t,r,q);k.properties[q]=r})}});var f;if(e.length>0){var h={type:"FeatureCollection",features:e};f={geoJson:h,opacity:g.getOpacity(),style:d,type:"geojson"}}else{f=this.FALLBACK_SERIALIZATION}return f},encodeVectorStyle:function(t,a,o,e,v){var r=this;var s=r.PRINTSTYLE_TYPES;var d=r.GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE;if(!Ext.isDefined(d[a])){return}var i=d[a];var u="["+v+" = '"+e+"']";if(Ext.isDefined(t[u])){return}var b={symbolizers:[]};t[u]=b;var h=o.getFill();var l=o.getImage();var n=o.getStroke();var g=o.getText();var c=!Ext.isEmpty(h);var m=!Ext.isEmpty(l);var k=!Ext.isEmpty(n);var j=!Ext.isEmpty(g);var q=s.POLYGON;var f=s.LINE_STRING;var p=s.POINT;if(i===q&&c){r.encodeVectorStylePolygon(b.symbolizers,h,n)}else{if(i===f&&k){r.encodeVectorStyleLine(b.symbolizers,n)}else{if(i===p&&m){r.encodeVectorStylePoint(b.symbolizers,l)}}}if(j){r.encodeTextStyle(b.symbolizers,g)}},encodeVectorStylePolygon:function(d,a,c){var b={type:"polygon"};this.encodeVectorStyleFill(b,a);if(c!==null){this.encodeVectorStyleStroke(b,c)}d.push(b)},encodeVectorStyleLine:function(c,b){var a={type:"line"};this.encodeVectorStyleStroke(a,b);c.push(a)},encodeVectorStylePoint:function(h,c){var e;if(c instanceof ol.style.Circle){e={type:"point"};e.pointRadius=c.getRadius();var b=c.getFill();if(b!==null){this.encodeVectorStyleFill(e,b)}var g=c.getStroke();if(g!==null){this.encodeVectorStyleStroke(e,g)}}else{if(c instanceof ol.style.Icon){var f=c.getSrc();if(Ext.isDefined(f)){e={type:"point",externalGraphic:f};var d=c.getRotation();if(d!==0){var a=d*180/Math.PI;e.rotation=a}}}}if(Ext.isDefined(e)){h.push(e)}},encodeTextStyle:function(j,h){var o={type:"Text"};var k=h.getText();if(!Ext.isDefined(k)){return}o.label=k;var c=h.getTextAlign();if(Ext.isDefined(c)){o.labelAlign=c}var m=h.getRotation();if(Ext.isDefined(m)){var a=(m*180/Math.PI)+"";o.labelRotation=a}var f=h.getFont();if(Ext.isDefined(f)){var d=f.split(" ");if(d.length>=3){o.fontWeight=d[0];o.fontSize=d[1];o.fontFamily=d.splice(2).join(" ")}}var i=h.getStroke();if(i!==null){var n=i.getColor();var e=ol.color.asArray(n);o.haloColor=this.rgbArrayToHex(e);o.haloOpacity=e[3];var b=i.getWidth();if(Ext.isDefined(b)){o.haloRadius=b}}var l=h.getFill();if(l!==null){var g=ol.color.asArray(l.getColor());o.fontColor=this.rgbArrayToHex(g)}if(Ext.isDefined(o.labelAlign)){o.labelXOffset=h.getOffsetX();o.labelYOffset=-h.getOffsetY()}j.push(o)},encodeVectorStyleFill:function(c,a){var d=a.getColor();if(d!==null){var b=ol.color.asArray(d);c.fillColor=this.rgbArrayToHex(b);c.fillOpacity=b[3]}},encodeVectorStyleStroke:function(a,e){var b=e.getColor();if(b!==null){var c=ol.color.asArray(b);a.strokeColor=this.rgbArrayToHex(c);a.strokeOpacity=c[3]}var d=e.getWidth();if(Ext.isDefined(d)){a.strokeWidth=d}},padHexValue:function(a){return a.length===1?"0"+a:a},rgbToHex:function(f,e,a){f=Number(f);e=Number(e);a=Number(a);if(isNaN(f)||f<0||f>255||isNaN(e)||e<0||e>255||isNaN(a)||a<0||a>255){Ext.raise('"('+f+","+e+","+a+'") is not a valid  RGB color')}var d=this.padHexValue(f.toString(16));var c=this.padHexValue(e.toString(16));var h=this.padHexValue(a.toString(16));return"#"+d+c+h},rgbArrayToHex:function(a){return this.rgbToHex(a[0],a[1],a[2])},getUid:function(b){if(!Ext.isObject(b)){Ext.raise("Cannot get uid of non-object.")}var a=this.GX_UID_PROPERTY;if(!Ext.isDefined(b[a])){b[a]=Ext.id()}return b[a]}}},function(a){var d={POINT:"Point",LINE_STRING:"LineString",LINEAR_RING:"LinearRing",POLYGON:"Polygon",MULTI_POINT:"MultiPoint",MULTI_LINE_STRING:"MultiLineString",MULTI_POLYGON:"MultiPolygon",GEOMETRY_COLLECTION:"GeometryCollection",CIRCLE:"Circle"};var c=a.PRINTSTYLE_TYPES;var b={};b[d.POINT]=c.POINT;b[d.MULTI_POINT]=c.POINT;b[d.LINE_STRING]=c.LINE_STRING;b[d.MULTI_LINE_STRING]=c.LINE_STRING;b[d.POLYGON]=c.POLYGON;b[d.MULTI_POLYGON]=c.POLYGON;a.GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE=b;a.register(a)});Ext.define("GeoExt.data.serializer.WMTS",{extend:"GeoExt.data.serializer.Base",mixins:["GeoExt.mixin.SymbolCheck"],inheritableStatics:{sourceCls:ol.source.WMTS,serialize:function(e,a){this.validateSource(a);var f=a.getProjection();var i=a.getTileGrid();var b=a.getDimensions();var g=Ext.Object.getKeys(b);var c=i.getMatrixIds();var h=[];Ext.each(c,function(l,k){var j=Math.pow(2,k);h.push({identifier:l,scaleDenominator:i.getResolution(k)*f.getMetersPerUnit()/0.00028,tileSize:ol.size.toSize(i.getTileSize(k)),topLeftCorner:i.getOrigin(k),matrixSize:[j,j]})});var d={baseURL:a.getUrls()[0],dimensions:g,dimensionParams:b,imageFormat:a.getFormat(),layer:a.getLayer(),matrices:h,matrixSet:a.getMatrixSet(),opacity:e.getOpacity(),requestEncoding:a.getRequestEncoding(),style:a.getStyle(),type:"WMTS",version:a.getVersion()};return d}}},function(a){a.register(a)});Ext.define("GeoExt.data.serializer.XYZ",{extend:"GeoExt.data.serializer.Base",mixins:["GeoExt.mixin.SymbolCheck"],symbols:["ol.layer.Base#getOpacity","ol.size.toSize","ol.source.XYZ","ol.source.XYZ#getTileGrid","ol.source.XYZ#getUrls","ol.tilegrid.TileGrid#getResolutions","ol.tilegrid.TileGrid#getTileSize"],inheritableStatics:{sourceCls:ol.source.XYZ,validateSource:function(a){if(!(a instanceof this.sourceCls)){Ext.raise("Cannot serialize this source with this serializer")}if(a.getUrls()===null){Ext.raise("Cannot serialize this source without an URL. Usage of tileUrlFunction is not yet supported")}},serialize:function(a,c){this.validateSource(c);var b=c.getTileGrid();var d={baseURL:c.getUrls()[0],opacity:a.getOpacity(),resolutions:b.getResolutions(),tileSize:ol.size.toSize(b.getTileSize()),type:"OSM"};return d}}},function(a){a.register(a)});Ext.define("GeoExt.data.store.OlObjects",{extend:"Ext.data.Store",requires:["GeoExt.data.model.OlObject"],mixins:["GeoExt.mixin.SymbolCheck"],olCollection:null,model:"GeoExt.data.model.OlObject",proxy:{type:"memory",reader:"json"},listeners:{add:function(b,a,c){var e=b.olCollection,f=a.length,d;b.__updating=true;for(d=0;d<f;d++){e.insertAt(c+d,a[d].olObject)}b.__updating=false},remove:function(b,a,c){var e=b.olCollection,f=a.length,d;b.__updating=true;for(d=0;d<f;d++){e.removeAt(c)}b.__updating=false}},constructor:function(a){a=a||{};if(a.data instanceof ol.Collection){this.olCollection=a.data}else{this.olCollection=new ol.Collection(a.data||[])}delete a.data;a.data=this.olCollection.getArray();this.callParent([a]);this.olCollection.on("add",this.onOlCollectionAdd,this);this.olCollection.on("remove",this.onOlCollectionRemove,this)},onOlCollectionAdd:function(b){var d=b.target,c=b.element,a=Ext.Array.indexOf(d.getArray(),c);if(!this.__updating){this.insert(a,c)}},onOlCollectionRemove:function(b){var c=b.element,a=this.findBy(function(d){return d.olObject===c});if(a!==-1){if(!this.__updating){this.removeAt(a)}}},destroy:function(){this.olCollection.un("add",this.onCollectionAdd,this);this.olCollection.un("remove",this.onCollectionRemove,this);delete this.olCollection;this.callParent(arguments)}});Ext.define("GeoExt.data.store.Features",{extend:"GeoExt.data.store.OlObjects",mixins:["GeoExt.mixin.SymbolCheck"],model:"GeoExt.data.model.Feature",config:{layer:null},map:null,createLayer:false,layerCreated:false,style:null,features:null,constructor:function(b){var c=this,a=b||{};if(c.style===null){c.style=new ol.style.Style({image:new ol.style.Circle({radius:6,fill:new ol.style.Fill({color:"#3399CC"}),stroke:new ol.style.Stroke({color:"#fff",width:2})})})}if(a.features){a.data=a.features}else{if(a.layer&&a.layer instanceof ol.layer.Vector){if(a.layer.getSource()){a.data=a.layer.getSource().getFeatures()}}}if(!a.data){a.data=new ol.Collection()}c.callParent([a]);if(c.createLayer===true&&!c.layer){c.drawFeaturesOnMap()}c.bindLayerEvents()},getFeatures:function(){return this.olCollection},getByFeature:function(a){return this.getAt(this.findBy(function(b){return b.getFeature()===a}))},destroy:function(){var a=this;a.unbindLayerEvents();if(a.map&&a.layerCreated===true){a.map.removeLayer(a.layer)}a.callParent(arguments)},drawFeaturesOnMap:function(){var a=this;a.source=new ol.source.Vector({features:a.getFeatures()});a.layer=new ol.layer.Vector({source:a.source,style:a.style});if(a.map){a.map.addLayer(a.layer)}a.layerCreated=true},bindLayerEvents:function(){var a=this;if(a.layer&&a.layer.getSource() instanceof ol.source.Vector){a.layer.getSource().on("addfeature",a.onFeaturesAdded,a);a.layer.getSource().on("removefeature",a.onFeaturesRemoved,a)}},unbindLayerEvents:function(){var a=this;if(a.layer&&a.layer.getSource() instanceof ol.source.Vector){a.layer.getSource().un("addfeature",a.onFeaturesAdded,a);a.layer.getSource().un("removefeature",a.onFeaturesRemoved,a)}},onFeaturesAdded:function(a){this.add(a.feature)},onFeaturesRemoved:function(b){var c=this;if(!c._removing){var a=c.getByFeature(b.feature);if(a){c._removing=true;c.remove(a);delete c._removing}}}});Ext.define("GeoExt.util.Layer",{statics:{findParentGroup:function(b,c){var d,a=GeoExt.util.Layer.findParentGroup,e=GeoExt.util.Layer.getLayerIndex;if(e(b,c)!==-1){d=c}else{c.getLayers().forEach(function(f){if(!d&&f instanceof ol.layer.Group){d=a(b,f)}})}return d},getLayerIndex:function(b,c){var a=-1;c.getLayers().forEach(function(e,d){if(a===-1&&e===b){a=d}});return a}}});Ext.define("GeoExt.data.store.LayersTree",{extend:"Ext.data.TreeStore",alternateClassName:["GeoExt.data.TreeStore"],requires:["GeoExt.util.Layer"],mixins:["GeoExt.mixin.SymbolCheck"],model:"GeoExt.data.model.LayerTreeNode",config:{layerGroup:null,textProperty:"name",folderToggleMode:"classic"},statics:{KEY_COLLAPSE_REMOVE_OPT_OUT:"__remove_by_collapse__"},inverseLayerOrder:true,collectionEventsSuspended:false,proxy:{type:"memory",reader:{type:"json"}},root:{expanded:true},constructor:function(){var a=this;a.callParent(arguments);var b=a.layerGroup.getLayers();Ext.each(b.getArray(),function(c){a.addLayerNode(c)},a,a.inverseLayerOrder);a.bindGroupLayerCollectionEvents(a.layerGroup);a.on({remove:a.handleRemove,noderemove:a.handleNodeRemove,nodeappend:a.handleNodeAppend,nodeinsert:a.handleNodeInsert,scope:a})},applyFolderToggleMode:function(a){if(a==="classic"||a==="ol3"){var b=this.getRootNode();if(b){b.cascadeBy({before:function(c){c.set("__toggleMode",a)}})}}else{Ext.raise("Invalid folderToggleMode set in "+this.self.getName()+": "+a+"; 'classic' or 'ol3' are valid.")}return a},handleRemove:function(b,a){var d=this;var c=d.self.KEY_COLLAPSE_REMOVE_OPT_OUT;d.suspendCollectionEvents();Ext.each(a,function(e){if(c in e&&e[c]===true){delete e[c];return}var g=e.getOlLayer();if(g instanceof ol.layer.Group){d.unbindGroupLayerCollectionEvents(g)}var f=GeoExt.util.Layer.findParentGroup(g,d.getLayerGroup());if(!f){f=d.getLayerGroup()}if(f){f.getLayers().remove(g)}});d.resumeCollectionEvents()},handleNodeRemove:function(a,b){var c=this;var e=b.getOlLayer();if(!e){e=c.getLayerGroup()}if(e instanceof ol.layer.Group){b.un("beforecollapse",c.onBeforeGroupNodeCollapse);c.unbindGroupLayerCollectionEvents(e)}var d=GeoExt.util.Layer.findParentGroup(e,c.getLayerGroup());if(d){c.suspendCollectionEvents();d.getLayers().remove(e);c.resumeCollectionEvents()}},handleNodeAppend:function(a,f){var d=this;var e=a.getOlLayer();var c=f.getOlLayer();if(!e){e=d.getLayerGroup()}var b=GeoExt.util.Layer.getLayerIndex(c,e);if(b===-1){d.suspendCollectionEvents();if(d.inverseLayerOrder){e.getLayers().insertAt(0,c)}else{e.getLayers().push(c)}d.resumeCollectionEvents()}},handleNodeInsert:function(e,d,j){var i=this;var k=e.getOlLayer();if(!k){k=i.getLayerGroup()}var g=d.getOlLayer();var a=j.getOlLayer();var b=k.getLayers();var c=GeoExt.util.Layer.getLayerIndex(a,k);var h=c;if(i.inverseLayerOrder){h+=1}var f=GeoExt.util.Layer.getLayerIndex(g,k);if(f!==h){i.suspendCollectionEvents();b.insertAt(h,g);i.resumeCollectionEvents()}},addLayerNode:function(g){var e=this;var f=GeoExt.util.Layer.findParentGroup(g,e.getLayerGroup());var b=GeoExt.util.Layer.getLayerIndex(g,f);if(e.inverseLayerOrder){var c=f.getLayers().getLength();b=c-b-1}var a;if(f===e.getLayerGroup()){a=e.getRootNode()}else{a=e.getRootNode().findChildBy(function(h){return h.getOlLayer()===f},e,true)}if(!a){return}var d=Ext.create("GeoExt.data.model.LayerTreeNode",g);d.set("text",g.get(e.getTextProperty()));d.commit();a.insertChild(b,d);if(g instanceof ol.layer.Group){d.on("beforecollapse",e.onBeforeGroupNodeCollapse,e);g.getLayers().forEach(e.addLayerNode,e)}},onBeforeGroupNodeCollapse:function(b){var a=this.self.KEY_COLLAPSE_REMOVE_OPT_OUT;b.cascadeBy(function(c){c[a]=true})},bindGroupLayerCollectionEvents:function(c){var a=this;if(c instanceof ol.layer.Group){var b=c.getLayers();b.on("remove",a.onLayerCollectionRemove,a);b.on("add",a.onLayerCollectionAdd,a);b.forEach(a.bindGroupLayerCollectionEvents,a)}},unbindGroupLayerCollectionEvents:function(c){var a=this;if(c instanceof ol.layer.Group){var b=c.getLayers();b.un("remove",a.onLayerCollectionRemove,a);b.un("add",a.onLayerCollectionAdd,a);b.forEach(a.unbindGroupLayerCollectionEvents,a)}},onLayerCollectionAdd:function(a){var b=this;if(b.collectionEventsSuspended){return}var c=a.element;b.addLayerNode(c);b.bindGroupLayerCollectionEvents(c)},onLayerCollectionRemove:function(a){var d=this;if(d.collectionEventsSuspended){return}var e=a.element;var c=d.getRootNode().findChildBy(function(f){return f.getOlLayer()===e});if(!c){return}if(e instanceof ol.layer.Group){d.unbindGroupLayerCollectionEvents(e)}var b=c.parentNode;b.removeChild(c)},suspendCollectionEvents:function(){this.collectionEventsSuspended=true},resumeCollectionEvents:function(){this.collectionEventsSuspended=false}});Ext.define("GeoExt.grid.column.Symbolizer",{extend:"Ext.grid.column.Column",alternateClassName:"GeoExt.grid.SymbolizerColumn",alias:["widget.gx_symbolizercolumn"],requires:["GeoExt.component.FeatureRenderer"],defaultRenderer:function(f,g,c){var d=this,a=Ext.id();if(c){var i=c.olObject,h="Line",e=i.getGeometry();if(e instanceof ol.geom.Point||e instanceof ol.geom.MultiPoint){h="Point"}else{if(e instanceof ol.geom.Polygon||e instanceof ol.geom.MultiPolygon){h="Polygon"}}var b=new Ext.util.DelayedTask(function(){var j=Ext.get(a);if(j){Ext.create("GeoExt.component.FeatureRenderer",{renderTo:j,symbolizers:d.determineStyle(c),symbolType:h})}});b.delay(0)}g.css="gx-grid-symbolizercol";return Ext.String.format('<div id="{0}"></div>',a)},determineStyle:function(a){var b=a.olObject;return b.getStyle()||b.getStyleFunction()||(a.store?a.store.layer.getStyle():null)}});