import { useEffect, useRef } from "react";
import { Modal, Form, Input } from "antd";
import { BarcodeOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import JsBarcode from "jsbarcode";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearProducto, actualizarProducto } from "../../querys/productQuerys";
import { useAuth } from "../../context/Authcontext";

// Calcular dígito de control para EAN-13
const calcularCheckDigitEAN13 = (numero12) => {
  const digits = numero12.split("").map(Number);
  let sumaImpares = 0;
  let sumaPares = 0;

  for (let i = 0; i < digits.length; i++) {
    if ((i + 1) % 2 === 0) sumaPares += digits[i];
    else sumaImpares += digits[i];
  }

  const total = sumaImpares + sumaPares * 3;
  return (10 - (total % 10)) % 10;
};

// Generar un código EAN-13 válido
const generarEAN13 = () => {
  const base = Math.floor(Math.random() * 1e12)
    .toString()
    .padStart(12, "0");
  const check = calcularCheckDigitEAN13(base);
  return base + check;
};

const ModalProducto = ({ visible, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const inputRef = useRef(null);
  const barcodeRef = useRef(null);
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const { mutate: crearProductoMutate, isLoading: creating } = useMutation({
    mutationKey: ["crearProducto"],
    mutationFn: crearProducto,
    onSuccess: () => {
      queryClient.invalidateQueries(["productos"]);
      Swal.fire({
        icon: "success",
        title: "Producto creado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
      onCancel();
      form.resetFields();
      if (barcodeRef.current) barcodeRef.current.innerHTML = "";
    },
    onError: (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        Swal.fire({
          title: "Sesión expirada",
          text: "Inicia sesión de nuevo",
          icon: "error",
          confirmButtonText: "Aceptar",
        }).then(() => {
          logout();
        });
      }
    },
  });

  const { mutate: actualizarProductoMutate, isLoading: updating } = useMutation(
    {
      mutationKey: ["actualizarProducto"],
      mutationFn: actualizarProducto,
      onSuccess: () => {
        queryClient.invalidateQueries(["productos"]);
        Swal.fire({
          icon: "success",
          title: "Producto actualizado correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
        onCancel();
        form.resetFields();
      },
      onError: (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          Swal.fire({
            title: "Sesión expirada",
            text: "Inicia sesión de nuevo",
            icon: "error",
            confirmButtonText: "Aceptar",
          }).then(() => {
            logout();
          });
        }
      },
    },
  );

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(
        initialValues || {
          nombre: "",
          descripcion: "",
          precio: "",
          stock: "",
          code: "",
        },
      );

      if (initialValues && initialValues.code) {
        renderBarcode(initialValues.code);
      } else {
        if (barcodeRef.current) barcodeRef.current.innerHTML = "";
        if (inputRef.current) inputRef.current.input.value = "";
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (initialValues) {
        actualizarProductoMutate({ id: initialValues.id, ...values });
      } else {
        crearProductoMutate(values);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Por favor revisa los campos del formulario.",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (barcodeRef.current) barcodeRef.current.innerHTML = "";
    if (inputRef.current) inputRef.current.input.value = "";
    onCancel();
  };

  const renderBarcode = (codigo) => {
    if (barcodeRef.current && codigo) {
      try {
        JsBarcode(barcodeRef.current, codigo, {
          format: "EAN13",
          lineColor: "#000",
          width: 2,
          height: 80,
          displayValue: true,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al generar el código de barras",
          text: "El código ingresado no es válido para EAN-13, se autogenero uno nuevo, favor de revisar.",
        });
        const code = generarEAN13();
        form.setFieldsValue({ code: code });
        JsBarcode(barcodeRef.current, code, {
          format: "EAN13",
          lineColor: "#000",
          width: 2,
          height: 80,
          displayValue: true,
        });
      }
    } else if (barcodeRef.current) {
      barcodeRef.current.innerHTML = "";
    }
  };

  const handleInputChange = (e) => renderBarcode(e.target.value);

  const handleGenerarCodigo = () => {
    const codigo = generarEAN13();
    form.setFieldsValue({ code: codigo });
    renderBarcode(codigo);
  };

  return (
    <Modal
      open={visible}
      title={initialValues ? "Editar Producto" : "Crear Producto"}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={initialValues ? "Actualizar" : "Crear"}
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="code"
          label="Código de Barras"
          rules={[{ required: true, message: "Por favor ingrese el código" }]}
        >
          <Input
            ref={inputRef}
            autoComplete="off"
            onChange={handleInputChange}
            suffix={
              <BarcodeOutlined
                onClick={handleGenerarCodigo}
                style={{
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#1890ff",
                }}
              />
            }
          />
        </Form.Item>
        <svg ref={barcodeRef}></svg>
        <Form.Item
          name="nombre"
          label="Nombre"
          rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="descripcion"
          label="Descripción"
          rules={[
            { required: true, message: "Por favor ingrese la descripción" },
          ]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="precio"
          label="Precio"
          rules={[{ required: true, message: "Por favor ingrese el precio" }]}
        >
          <Input type="number" step="0.01" autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="stock"
          label="Stock"
          rules={[{ required: true, message: "Por favor ingrese el stock" }]}
        >
          <Input type="number" autoComplete="off" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalProducto;
