import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import JsBarcode from "jsbarcode";

pdfMake.vfs = pdfFonts.vfs;

const Credencial = async (empleado) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, empleado.codigo, {
    format: "CODE128",
    lineColor: "#000",
    width: 2,
    height: 60,
    displayValue: true,
    margin: 0,
  });

  await new Promise((r) => setTimeout(r, 50));
  const barcodeImage = canvas.toDataURL("image/png");

  const docDefinition = {
    pageSize: {
      width: 250,
      height: 400,
    },
    pageMargins: [10, 10, 10, 10],

    content: [
      {
        text: "Delta Papelerías",
        style: "titulo",
        alignment: "center",
      },
      {
        text: `Nombre: ${empleado.nombre} ${empleado.apellidos}`,
        margin: [0, 5],
      },

      {
        text: `Rol: ${empleado.rol}`,
        margin: [0, 5],
      },
      {
        image: barcodeImage,
        width: 180,
        alignment: "center",
        margin: [0, 0, 0, 5],
      },
    ],

    styles: {
      titulo: {
        fontSize: 18,
        bold: true,
      },

      codigo: {
        fontSize: 22,
        bold: true,
      },
    },
  };

  pdfMake.createPdf(docDefinition).getBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    win.addEventListener("load", () => {
      win.print();
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    });
  });
};

export default Credencial;
