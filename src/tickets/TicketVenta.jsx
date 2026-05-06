import { logoBase64 } from "../assets/logoBase64";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;
pdfMake.documentBaseUrl = "";

const TicketVenta = (empleado, data, productos) => {
  const { serial, total, fecha, formaDePago } = data;

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
      { text: `${fecha}` },
      { text: `Empleado: ${empleado}` },
      { text: `Forma de pago: ${formaDePago}` },
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
            ...productos.map((p) => {
              const precio = Number(p?.precio || p?.producto?.precio || 0);
              const cantidad = Number(p?.cantidad || 0);
              const descuento = Number(
                p?.descuento || p?.producto?.descuento || 0,
              );

              const subtotal = precio * cantidad;
              const totalConDescuento =
                descuento > 0 ? subtotal * (1 - descuento / 100) : subtotal;
              const descripcion =
                p?.descripcion ??
                p?.producto?.descripcion ??
                "Producto Eliminado";

              const texto = `(${cantidad} X $${precio.toFixed(2)}) ${descripcion.toUpperCase()}`;

              return [
                texto,
                {
                  text:
                    descuento > 0
                      ? [
                          {
                            text: `$${subtotal.toFixed(2)} `,
                            decoration: "lineThrough",
                            color: "#999",
                          },
                          {
                            text: `$${totalConDescuento.toFixed(2)}`,
                            bold: true,
                          },
                        ]
                      : `$${subtotal.toFixed(2)}`,
                  alignment: "right",
                },
              ];
            }),
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
        fontSize: 6,
        margin: [0, 5, 0, 0],
      },
      {
        text: "Col. Ampliación las Águilas",
        alignment: "center",
        fontSize: 6,
        margin: [0, 5, 0, 0],
      },
      {
        text: "Este ticket no es factura, conserve su ticket",
        alignment: "center",
        fontSize: 6,
        margin: [0, 5, 0, 0],
      },
      {
        text: "Este ticket no es comprobante fiscal",
        alignment: "center",
        fontSize: 6,
        margin: [0, 5, 0, 0],
      },
      {
        text: "Si requiere factura solicitarla unicamente en el mes que realizo su compra",
        alignment: "center",
        fontSize: 6,
        margin: [0, 5, 0, 0],
      },
      {
        text: "Conserve su ticket para cualquier aclaración",
        alignment: "center",
        fontSize: 6,
        margin: [0, 5, 0, 0],
      },
      {
        text: "¡Gracias por su compra!",
        alignment: "center",
        margin: [0, 8, 0, 0],
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      total: { fontSize: 12, bold: true },
    },
  };

  pdfMake.createPdf(docDefinition).print();
  console.timeEnd("TicketVenta print");
};

export default TicketVenta;
