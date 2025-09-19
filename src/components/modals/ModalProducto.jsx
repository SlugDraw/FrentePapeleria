import { useEffect, useRef } from "react";
import { Modal, Form, Input } from "antd";
import { BarcodeOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import JsBarcode from "jsbarcode";

// 👉 Calcular dígito de control para EAN-13
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

// 👉 Generar un código EAN-13 válido
const generarEAN13 = () => {
  const base = Math.floor(Math.random() * 1e12)
    .toString()
    .padStart(12, "0");
  const check = calcularCheckDigitEAN13(base);
  return base + check;
};

const ModalProducto = ({ visible, onCancel, onOk, initialValues }) => {
  const [form] = Form.useForm();
  const inputRef = useRef(null);
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (visible) {

      form.setFieldsValue(
        initialValues || {
          nombre: "",
          descripcion: "",
          precio: "",
          stock: "",
          code: "",
          barcodeRef: null,
        }
      );
      if(initialValues && initialValues.code){
        renderBarcode(initialValues.code);
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields(); // valida todos los campos

      // Enviar los datos al backend
      const token = localStorage.getItem("token"); // o donde tengas el token
      if (initialValues) {
        values.id = initialValues.id; // Asegúrate de que el ID esté incluido en los valores
      }

      if (initialValues && !values.password) {
        delete values.password;
      }

      console.log(JSON.stringify(values));

      const response = initialValues
        ? await fetch(`http://localhost:8080/api/v1/products/${values.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // si tu backend requiere token
            },
            body: JSON.stringify(values),
          })
        : await fetch("http://localhost:8080/api/v1/products/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // si tu backend requiere token
            },
            body: JSON.stringify(values),
          });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error al crear producto",
          text:
            errorData.message || "Ocurrió un error al registrar el producto.",
        });
        return; // no resetear formulario si falla
      }

      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: initialValues
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente",
        text: initialValues
          ? "El producto ha sido actualizado correctamente"
          : "El producto ha sido registrado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      onOk(values); // llamar a callback externo si lo necesitas
      form.resetFields(); // limpiar formulario
    } catch (errorInfo) {
      console.log("Validación fallida o error en request:", errorInfo);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (barcodeRef.current) {
      barcodeRef.current.innerHTML = ""; // limpia el svg
    }
    if (inputRef.current) {
      inputRef.current.input.value = ""; // limpia input
    }
    onCancel();
  };

  const renderBarcode = (codigo) => {
    if (barcodeRef.current && codigo) {
      JsBarcode(barcodeRef.current, codigo, {
        format: "EAN13",
        lineColor: "#000",
        width: 2,
        height: 80,
        displayValue: true,
      });
    } else if (barcodeRef.current) {
      barcodeRef.current.innerHTML = "";
    }
  };

  // 👉 Al cambiar el valor del input, redibujar el código
  const handleInputChange = (e) => {
    renderBarcode(e.target.value);
  };

  // 👉 Generar nuevo código automáticamente
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
          rules={[
            {
              required: true,
              message: "Por favor ingrese el código de barras",
            },
          ]}
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
          rules={[{ required: true, message: "Por favor ingrese un nombre" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="descripcion"
          label="Descripcion"
          rules={[{ required: true, message: "Por favor la descripcion" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="precio"
          label="Precio"
          rules={
            initialValues
              ? []
              : [{ required: true, message: "Por favor ingrese el precio" }]
          }
        >
          <Input type="number" step="0.01" autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="stock"
          label="Stock"
          rules={
            initialValues
              ? []
              : [{ required: true, message: "Por favor ingrese el stock" }]
          }
        >
          <Input type="number" autoComplete="off" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalProducto;
