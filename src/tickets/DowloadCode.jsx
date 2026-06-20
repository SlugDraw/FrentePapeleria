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

  // Descargar PNG
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${descripcion}.png`;
  link.click();
};

export default DownloadCode;
