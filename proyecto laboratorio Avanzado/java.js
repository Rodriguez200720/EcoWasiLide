var map = L.map('map').setView([-13.5257199,-71.9270339],13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'© OpenStreetMap'
}).addTo(map);

var userLocation=null;
var userMarker=null;
var watchID=null;
var rutaLayer=null;

/* ZONAS */
var zonas=[
{lat:-13.528045,lng:-71.928117,tipo:"rojo"},
{lat:-13.526943,lng:-71.930334,tipo:"rojo"},
{lat:-13.524488,lng:-71.928703,tipo:"rojo"},

{lat:-13.522412,lng:-71.926981,tipo:"verde"},
{lat:-13.526502,lng:-71.927734,tipo:"verde"},
{lat:-13.5257199,lng:-71.9270339,tipo:"verde"}

];

zonas.forEach(zona=>{
let iconUrl= zona.tipo==="rojo"
?"https://maps.google.com/mapfiles/ms/icons/red-dot.png"
:"https://maps.google.com/mapfiles/ms/icons/green-dot.png";

let icon=L.icon({iconUrl:iconUrl,iconSize:[32,32]});

let marker=L.marker([zona.lat,zona.lng],{icon:icon}).addTo(map);

marker.on("click",()=>{
if(userLocation){
calcularRuta(userLocation,zona);
}else{
alert("Primero activa el GPS 📡");
}
});
});

/* ACTIVAR GPS */
function activarUbicacion(){

if(navigator.geolocation){

watchID=navigator.geolocation.watchPosition(function(pos){

userLocation={
lat:pos.coords.latitude,
lng:pos.coords.longitude
};

if(userMarker){
map.removeLayer(userMarker);
}

userMarker=L.marker(
[userLocation.lat,userLocation.lng],
{
icon:L.icon({
iconUrl:"https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
iconSize:[32,32]
})
}
).addTo(map);

map.setView([userLocation.lat,userLocation.lng],15);

},
function(){
alert("Permite la ubicación.");
},
{enableHighAccuracy:true});

}

}

/* DETENER GPS */
function detenerUbicacion(){

if(watchID){
navigator.geolocation.clearWatch(watchID);
watchID=null;
alert("GPS detenido 🛑");
}

}

/* CALCULAR RUTA */
function calcularRuta(origen,destino){

fetch(`https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson&steps=true`)
.then(res=>res.json())
.then(data=>{

if(rutaLayer){
map.removeLayer(rutaLayer);
}

let coords=data.routes[0].geometry.coordinates;
let latlngs=coords.map(c=>[c[1],c[0]]);

rutaLayer=L.polyline(latlngs,{color:"blue",weight:5}).addTo(map);

map.fitBounds(rutaLayer.getBounds());

let distancia=(data.routes[0].distance/1000).toFixed(2);
let tiempo=(data.routes[0].duration/60).toFixed(0);

let pasos=data.routes[0].legs[0].steps;

let instrucciones="<b>Ruta:</b><br>";
pasos.forEach((paso,i)=>{
if(paso.name!=""){
instrucciones+=(i+1)+". "+paso.name+"<br>";
}
});

document.getElementById("info").innerHTML=
"Distancia: "+distancia+" km<br>"+
"Tiempo estimado: "+tiempo+" min<br><br>"+
instrucciones;

});

}
/* SIDEBAR */
function toggleMenu(){
document.getElementById("sidebar").classList.toggle("active");
}

