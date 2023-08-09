(function () {
  const lat = -12.0862663;
  const lng = -76.9915014;
  const mapa = L.map("mapa").setView([lat, lng], 13);
  let marker;

  //Utilizar propvider y geocoder
  const geocodeService = L.esri.Geocoding.geocodeService();

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  //el pin
  marker = new L.marker([lat, lng], {
    draggable: true, //Permite mover el pin
    autoPan: true, //si se pasa del limite el pin se centra
  }).addTo(mapa);

  //Detectar el movimiento del pin
  marker.on("moveend", function (e) {
    marker = e.target;

    const position = marker.getLatLng();
    mapa.panTo(new L.LatLng(position.lat, position.lng));

    //Obtener informacion de las calles al soltar el pin
    geocodeService
      .reverse()
      .latlng(position, 13)
      .run(function (error, resultado) {
        marker.bindPopup(resultado.address.LongLabel);

        //Llenar los campos
        document.querySelector(".calle").textContent =
          resultado?.address?.Address ?? "";
        document.querySelector("#calle").value =
          resultado?.address?.Address ?? "";
        document.querySelector("#lat").value = resultado?.latlng?.lat ?? "";
        document.querySelector("#lng").value = resultado?.latlng?.lng ?? "";
      });
  });
})();
