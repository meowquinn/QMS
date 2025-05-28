import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { login } from '../../services/authService';


interface LoginProps {
  onLogin: (userData: unknown) => void;
}

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      
      // Gọi API login với tài khoản và mật khẩu từ form
      const userData = await login(values.username, values.password);
      
      message.success('Đăng nhập thành công!');
      
      // Truyền thông tin người dùng lên component cha
      onLogin({
        staffId: userData.staffId,
        username: userData.username,
        fullName: userData.fullName,
        sRole: userData.sRole,
        access: userData.access,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        sAddress: userData.sAddress
      });
      
    } catch (error) {
      console.error('Chi tiết lỗi đăng nhập:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
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
            <h2 className="text-2xl font-bold text-gray-800">PoolQMS</h2>
            <p className="text-gray-600 mt-1">Hệ thống quản lý chất lượng hồ bơi</p>
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
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="Tên đăng nhập"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />} 
                placeholder="Mật khẩu"
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

            {/* Hướng dẫn */}
            <div className="bg-blue-50 p-3 rounded-md mt-4">
              <p className="text-sm text-blue-800 font-medium">Hướng dẫn đăng nhập:</p>
              <p className="text-xs text-blue-700 mt-1">
                Vui lòng sử dụng tài khoản và mật khẩu được cấp để đăng nhập vào hệ thống.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Nếu quên mật khẩu, vui lòng liên hệ quản trị viên để được hỗ trợ.
              </p>
            </div>
          </Form>
          
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              © 2024 PoolQMS - Hệ thống quản lý chất lượng hồ bơi
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;