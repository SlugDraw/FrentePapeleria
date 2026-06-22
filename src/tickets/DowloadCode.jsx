import JsBarcode from "jsbarcode";

const DownloadCode = (code, descripcion) => {
  // Crear canvas temporal
  const canvas = document.createElement("canvas");

  // Generar código de barras
  JsBarcode(canvas, code, {
    format: "CODE128",
    width: 3,
    height: 100,
    fontSize: 20,
    displayValue: true,
  });

  const originalWidth = canvas.width;
  const originalHeight = canvas.height;

  // Espacio extra para el título
  const titleHeight = 40;

  // Crear nuevo canvas más alto
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = originalWidth;
  finalCanvas.height = originalHeight + titleHeight;

  const ctx = finalCanvas.getContext("2d");

  // Fondo blanco
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  // Dibujar descripción arriba
  ctx.fillStyle = "#000000";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(descripcion, finalCanvas.width / 2, 28);

  // Dibujar el código de barras debajo
  ctx.drawImage(canvas, 0, titleHeight);

  // Descargar PNG
  const link = document.createElement("a");
  link.href = finalCanvas.toDataURL("image/png");
  link.download = `${descripcion}.png`;
  link.click();
};

export default DownloadCode;
