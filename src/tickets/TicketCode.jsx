import JsBarcode from "jsbarcode";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;
pdfMake.documentBaseUrl = "";

const TicketCode = async (codigo) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, codigo, {
    format: "EAN13",
    lineColor: "#000",
    width: 2,
    height: 60,
    displayValue: true,
    margin: 0,
  });

  await new Promise((r) => setTimeout(r, 50));
  const barcodeImage = canvas.toDataURL("image/png");

  const docDefinition = {
    pageSize: { width: 227, height: "auto" },
    pageMargins: [5, 5, 5, 5],
    content: [
      {
        text: "Ticket de Venta",
        alignment: "center",
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      {
        image: barcodeImage,
        fit: [200, 80],
        alignment: "center",
        margin: [0, 0, 0, 5],
      },
      { text: codigo, alignment: "center", fontSize: 10 },
    ],
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

export default TicketCode;

/* 
import JsBarcode from "jsbarcode";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;
pdfMake.documentBaseUrl = "";

const TicketCode = async (codigo) => {
  // Crear el canvas y generar el código de barras
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, codigo, {
    format: "EAN13",
    lineColor: "#000",
    width: 2,
    height: 60,
    displayValue: true,
    margin: 0,
  });

  await new Promise((r) => setTimeout(r, 50));
  const barcodeImage = canvas.toDataURL("image/png");

  // Definición del PDF
  const docDefinition = {
    pageSize: { width: 227, height: "auto" }, // 80 mm
    pageMargins: [5, 5, 5, 5],
    content: [
      {
        text: "Ticket de Venta",
        alignment: "center",
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      {
        image: barcodeImage,
        fit: [200, 80],
        alignment: "center",
        margin: [0, 0, 0, 5],
      },
      {
        text: codigo,
        alignment: "center",
        fontSize: 10,
      },
    ],
  };

  // Crear PDF como blob
  pdfMake.createPdf(docDefinition).getBlob((blob) => {
    const blobURL = URL.createObjectURL(blob);

    // Crear un iframe oculto para imprimir el PDF
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = blobURL;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      // Esperar un poco para asegurar render
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Limpiar después
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobURL);
        }, 1000);
      }, 300);
    };
  });
};

export default TicketCode; */
