import { logoBase64 } from "../assets/logoBase64";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;
pdfMake.documentBaseUrl = "";

const TicketVenta = (empleado, data, productos) => {
  console.time("TicketVenta print");
  const {
    serial,
    total,
    fecha,
    formaDePago,
    descuentoTotal = 0,
    pagosMixtos = [],
  } = data;
  const subtotalSinDescuentos = productos.reduce((acumulado, producto) => {
    const precio = Number(producto?.precio || producto?.producto?.precio || 0);
    const cantidad = Number(producto?.cantidad || 0);
    return acumulado + precio * cantidad;
  }, 0);
  const subtotalConDescuentos = productos.reduce((acumulado, producto) => {
    const precio = Number(producto?.precio || producto?.producto?.precio || 0);
    const cantidad = Number(producto?.cantidad || 0);
    const descuento = Number(
      producto?.descuento || producto?.producto?.descuento || 0,
    );
    return acumulado + precio * cantidad * (1 - descuento / 100);
  }, 0);
  const importeDescuentoTotal =
    subtotalConDescuentos * (Number(descuentoTotal) / 100);
  const esPagoMixto = formaDePago === "Mixto" && pagosMixtos.length > 0;

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
      ...(esPagoMixto
        ? [
            { text: "Desglose de pago", bold: true, margin: [0, 4, 0, 2] },
            {
              table: {
                widths: ["*", "auto"],
                body: [
                  [
                    { text: "Forma", bold: true },
                    { text: "Importe", bold: true, alignment: "right" },
                  ],
                  ...pagosMixtos.map((pago) => [
                    pago.formaDePago,
                    {
                      text: `$${Number(pago.monto || 0).toFixed(2)}`,
                      alignment: "right",
                    },
                  ]),
                ],
              },
              layout: "noBorders",
            },
          ]
        : []),
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
      ...(Number(descuentoTotal) > 0
        ? [
            {
              text: `DESCUENTO GENERAL (${Number(descuentoTotal)}%): -$${importeDescuentoTotal.toFixed(2)}`,
              alignment: "right",
            },
          ]
        : []),
      {
        text: `SUBTOTAL SIN DESCUENTOS: $${subtotalSinDescuentos.toFixed(2)}`,
        alignment: "right",
        margin: [0, 4, 0, 0],
      },
      {
        text: `TOTAL: $${Number(total).toFixed(2)}`,
        style: "total",
        alignment: "right",
      },
      {
        text: "Calzada de las Águilas #783 Col. Ampliación las Águilas",
        alignment: "center",
        fontSize: 8,
        margin: [0, 5, 0, 0],
      },
      {
        text: "* Este ticket no es comprobante fiscal, si requiere factura deberá",
        alignment: "center",
        fontSize: 8,
        margin: [0, 5, 0, 0],
      },
      {
        text: "solicitarse en el mes de la compra, presentando su ticket",
        alignment: "center",
        fontSize: 8,
        margin: [0, 0, 0, 0],
      },
      {
        text: "* No contamos con cambios ni devoluciones, salvo por defecto de",
        alignment: "center",
        fontSize: 8,
        margin: [0, 0, 0, 0],
      },
      {
        text: "fabricación, no aplica en artículos con daño físico",
        alignment: "center",
        fontSize: 8,
        margin: [0, 0, 0, 0],
      },
      {
        text: "¡GRACIAS POR SU PREFERENCIA!",
        alignment: "center",
        margin: [0, 8, 0, 0],
        italics: true,
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      total: { fontSize: 12, bold: true },
    },
    defaultStyle: { color: "#000000" },
  };

  pdfMake.createPdf(docDefinition).print();
  console.timeEnd("TicketVenta print");
};

export default TicketVenta;
