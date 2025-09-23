import createPdf from "../utils/CreatePDF";
const TicketPrueba = async (output) => {
  const content = [
    {
      text: "PRUEBA EXITOSA",
      style: "header",
      margin: [0, 10, 0, 0],
    },
  ];

  //estilos
  const styles = {
    header: {
      fontSize: 9,
      bold: true,
      alignment: "center",
    },
  };
  const response = await createPdf({ content, styles }, output);
  return response;
};
export default TicketPrueba;
