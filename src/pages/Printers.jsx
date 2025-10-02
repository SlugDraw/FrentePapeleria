import { Switch, Button, Select, Card, Typography, Space } from "antd";
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { Toaster } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  mostrarDatosPc,
  mostrarListaImpresoraLocales,
  editarImpresoras,
  getImpresoras,
} from "../querys/printsQuerys";
import { useEffect, useState } from "react";
import ticket from "../tickets/TicketPrueba";
import Swal from "sweetalert2";
import Loader from "../utils/Loader";

const { Title, Text } = Typography;
const { Option } = Select;

const Printers = () => {
  const queryClient = useQueryClient();
  const [statePrintDirecto, setStatePrintDirecto] = useState(false);
  const [selectImpresora, setSelectImpresora] = useState(
    "seleccione una impresora"
  );
  const [idImpresora, setIdImpresora] = useState("");

  const {
    data: dataPcLocal,
    isLoading: isLocadingDatosPc,
    error: errorDatosPc,
  } = useQuery({
    queryKey: ["mostrar datos de PC"],
    queryFn: mostrarDatosPc,
  });

  const {
    data: impresoraGuardada,
    isLoading: isLoadingImpresoraCaja,
    error: errorImpresoraCaja,
  } = useQuery({
    queryKey: ["mostrar impresora por caja"],
    queryFn: getImpresoras,
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      if (data) {
        setStatePrintDirecto(data.isDirecto || false);
        setSelectImpresora({ name: data.nombre || "seleccione una impresora" });
        setIdImpresora(data.id || null);
      }
    },
  });

  const probarTicket = async () => {
    const response = await ticket("b64");
    // Convertir el contenido base64 en un archivo Blob
    const binaryString = atob(response.content);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    // Crear un archivo simulando un archivo subido
    const file = new File([blob], "GeneratedTicket.pdf", {
      type: "application/pdf",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("printerName", selectImpresora);
    const responseApi = await fetch("http://localhost:5075/api/print-ticket", {
      method: "POST",
      body: formData,
    });
    if (responseApi.ok) {
      Swal.fire({
        icon: "success",
        title: "PDF enviado",
        text: "El PDF se envió a imprimir correctamente.",
      });
    } else {
      const error = await responseApi.text();
      Swal.fire({
        icon: "error",
        title: "Error al imprimir",
        text: error,
      });
    }
  };

  const {
    data: dataImpresorasLocales,
    isLoading: isloadingImpresorasLocales,
    error: errorImpresorasLocales,
  } = useQuery({
    queryKey: ["mostrar lista impresoras locales"],
    queryFn: mostrarListaImpresoraLocales,
    enabled: !!dataPcLocal,
  });

  const { mutate: doEditar, isPending } = useMutation({
    mutationKey: ["editar impresoras"],
    mutationFn: editar,
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error al editar impresoras",
        text: error.message,
      });
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Datos guardados",
      });
      queryClient.invalidateQueries(["mostrar impresora por caja"]);
    },
  });

  async function editar() {
    const p = {
      id: idImpresora,
      state: statePrintDirecto,
      name: statePrintDirecto ? selectImpresora : "seleccione una impresora",
    };

    const retornado = await editarImpresoras(p);
    setIdImpresora(retornado.id);
    setStatePrintDirecto(retornado.isDirecto);
  }

  useEffect(() => {
    if (impresoraGuardada) {
      setStatePrintDirecto(impresoraGuardada.isDirecto || false);
      setSelectImpresora(
        impresoraGuardada.nombre || "seleccione una impresora"
      );
      setIdImpresora(impresoraGuardada.id || null);
    }
  }, [impresoraGuardada]);

  const error = errorDatosPc;

  if (isLoadingImpresoraCaja || isLocadingDatosPc || isloadingImpresorasLocales)
    return <Loader></Loader>;
  return (
    <div className="p-4 md:p-6">
      <Toaster />

      {dataPcLocal ? (
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          {/* Panel izquierdo */}
          <div className="flex-1 space-y-4">
            <Title level={2} className="text-center md:text-left">
              IMPRESORAS
            </Title>

            <Card className="w-1/3 !p-3 !border-0 !shadow-none !bg-transparent">
              <Text>Imprimir directo</Text>
              <Switch
                checked={statePrintDirecto}
                onChange={() => {
                  setStatePrintDirecto((prev) => !prev);
                  doEditar();
                }}
              />
            </Card>

            <Card className="bg-pink-600 text-white p-4">
              {statePrintDirecto ? (
                <Space direction="vertical" size="middle" className="w-full">
                  <Button
                    type="primary"
                    onClick={probarTicket}
                    icon={<PrinterOutlined />}
                    className="bg-pink-600 text-white w-full md:w-auto"
                  >
                    Probar
                  </Button>

                  <Select
                    value={selectImpresora}
                    onChange={(value) => setSelectImpresora(value)}
                    className="w-full"
                    placeholder="Seleccione impresora"
                  >
                    {dataImpresorasLocales.map((imp) => (
                      <Option key={imp.name} value={imp.name}>
                        {imp.name}
                      </Option>
                    ))}
                  </Select>

                  <Button
                    onClick={doEditar}
                    disabled={isPending}
                    className="bg-white text-pink-600 w-full md:w-auto"
                  >
                    Guardar
                  </Button>
                </Space>
              ) : (
                <Text className="text-center md:text-left">
                  Se mostrará un cuadro de diálogo al momento de imprimir
                </Text>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="flex-1 space-y-4">
            <Title level={2} className="text-center md:text-left">
              IMPRESORAS
            </Title>
            <Text type="secondary">Descargue e instale el servidor</Text>

            <Card className="bg-blue-900 text-white p-4 flex flex-col items-center md:items-start space-y-4">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() =>
                  descargarArchivo(
                    "https://drive.google.com/file/d/1v5Q632tEWx8yTlfnC4HYT6SsGKnORduw/view?usp=sharing"
                  )
                }
              >
                Descargar
              </Button>
            </Card>

            <Text type="secondary">
              Servicio para imprimir directo a impresoras térmicas
            </Text>

            <div className="flex items-center space-x-2 text-blue-900">
              <PrinterOutlined />
              <Text>Si ya instaló, actualice esta página.</Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Printers;
