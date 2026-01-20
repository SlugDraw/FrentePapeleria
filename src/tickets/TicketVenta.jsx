import { logoBase64 } from "../assets/logoBase64";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;
pdfMake.documentBaseUrl = "";

const TicketVenta = (empleado, data, productos) => {
  const { serial, total } = data;

  const docDefinition = {
    pageSize: { width: 226.77, height: "auto" },
    pageMargins: [10, 10, 10, 10],
    content: [
      {
        image: logoBase64,
        fit: [206.77, 999],
        alignment: "center",
        margin: [0, 0, 0, 5],
      },
      { text: `Folio: ${serial}`, margin: [0, 10, 0, 0] },
      { text: `Empleado: ${empleado}` },
      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 206, y2: 0, lineWidth: 1 }],
        margin: [0, 5, 0, 5],
      },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            // ENCABEZADOS
            [
              { text: "Producto", bold: true },
              { text: "Subtotal", bold: true, alignment: "right" },
            ],

            // FILAS DE PRODUCTOS
            ...productos.map((p) => [
              `(${p.cantidad}) ${p?.nombre || p?.producto.nombre}`,
              {
                text: `$${(
                  Number(p?.precio || p?.producto.precio) * Number(p.cantidad)
                ).toFixed(2)}`,
                alignment: "right",
              },
            ]),
          ],
        },
        layout: "noBorders",
        margin: [0, 5, 0, 5],
      },
      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 206, y2: 0, lineWidth: 1 }],
        margin: [0, 5, 0, 5],
      },
      {
        text: `TOTAL: $${Number(total).toFixed(2)}`,
        style: "total",
        alignment: "right",
      },
      {
        text: "Calzada de las Águilas #783",
        alignment: "center",
        fontSize: 8,
        margin: [0, 5, 0, 0],
      },
      {
        text: "Col. Ampliación las Águilas",
        alignment: "center",
        fontSize: 8,
        margin: [0, 5, 0, 0],
      },
      {
        text: "Este ticket no es factura, conserve su ticket",
        alignment: "center",
        fontSize: 6,
        margin: [0, 5, 0, 0],
      },
      {
        text: "Este ticket no es un comprobante fiscal",
        alignment: "center",
        fontSize: 6,
        margin: [0, 5, 0, 0],
      },
      {
        text: "¡Gracias por su compra!",
        alignment: "center",
        margin: [0, 10, 0, 0],
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      total: { fontSize: 12, bold: true },
    },
  };

  pdfMake.createPdf(docDefinition).print();
  /* pdfMake.createPdf(docDefinition).getBlob((blob) => {
    const url = URL.createObjectURL(blob);

    const win = window.open(url);

    if (!win) {
      alert("Debes permitir ventanas emergentes para imprimir el ticket.");
      return;
    }

    win.addEventListener("load", () => {
      win.print();

      setTimeout(() => {
        URL.revokeObjectURL(url);
        win.close();
      }, 1000);
    });
  });
 */
  console.timeEnd("TicketVenta print");
};

export default TicketVenta;
