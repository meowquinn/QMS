import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth, type User } from "../../contexts/AuthContext";
import { login } from "../../services/authService";

// Hàm lấy API URL với cổng 7021
// const getApiUrl = () => {
//   if (
//     window.location.hostname === "localhost" ||
//     window.location.hostname === "127.0.0.1"
//   ) {
//     return "http://localhost:7021"; // Cổng API 7021
//   }
//   return "https://api.yourproductionurl.com"; // URL môi trường production
// };

interface LoginProps {
  onLogin: (userData: User) => void;
}

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      // const API_URL = getApiUrl();

      const response = await login(values.username, values.password);

    

      if (response) {
        message.success("Đăng nhập thành công!");

        // Lưu token nếu có
        // if (response.data.data?.token) {
        //   localStorage.setItem("token", response.data.data.token);
        //   axios.defaults.headers.common[
        //     "Authorization"
        //   ] = `Bearer ${response.data.data.token}`;
        // }

        // Chuẩn bị dữ liệu người dùng
        const userData = {
          staffId: response.staffId,
          username: response.username,
          fullName: response.fullName,
          sRole: response.sRole,
          access: response.access,
          email: response.email,
          phoneNumber: response.phoneNumber,
        };

        // Lưu thông tin người dùng
        localStorage.setItem("user", JSON.stringify(userData));

        // Gọi hàm onLogin được truyền từ component cha
        onLogin(userData);

        // Cập nhật context
        if (authLogin) {
          authLogin({
            staffId: response.staffId,
            username: response.username,
            fullName: response.fullName,
            sRole: response.sRole,
            access: response.access,
            email: response.email,
            phoneNumber: response.phoneNumber,
          });
        }

        // Điều hướng đến dashboard
        navigate("/dashboard");
      } else {
        message.error( "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      message.error(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Card đăng nhập */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-600">PoolQMS</h2>
            <p className="text-gray-600 mt-1">
              Hệ thống quản lý chất lượng hồ bơi
            </p>
          </div>

          {/* Form đăng nhập */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Tên đăng nhập"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Mật khẩu"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                loading={loading}
                size="large"
              >
                Đăng nhập
              </Button>
            </Form.Item>

            {/* Thông tin hỗ trợ */}
            <div className="mt-4 text-xs text-gray-500">
              <p>
                Sử dụng tài khoản được cung cấp bởi quản trị viên để đăng nhập
                vào hệ thống.
              </p>
              <p>Liên hệ bộ phận kỹ thuật nếu bạn gặp sự cố khi đăng nhập.</p>
            </div>
          </Form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} PoolQMS. Bản quyền thuộc về công ty.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
