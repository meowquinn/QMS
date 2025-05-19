import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';


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

  const onFinish = (values: LoginFormValues) => {
    setLoading(true);
    
    // Giả lập API call
    setTimeout(() => {
      // Thông tin đăng nhập mẫu
      const users = [
        {
          username: 'admin',
          password: 'admin123',
          name: 'Quản trị viên',
          role: 'Quản lý hệ thống',
          access: 'admin'
        },
        {
          username: 'staff',
          password: 'staff123',
          name: 'Nhân viên',
          role: 'Nhân viên đo đạc',
          access: 'user'
        }
      ];
      
      const user = users.find(
        u => u.username === values.username && u.password === values.password
      );
      
      if (user) {
        message.success('Đăng nhập thành công!');
        // Truyền thông tin người dùng lên component cha
        onLogin({
          username: user.username,
          name: user.name,
          role: user.role,
          access: user.access
        });
      } else {
        message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
      
      setLoading(false);
    }, 1000);
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

            {/* Thông tin mẫu */}
            <div className="bg-blue-50 p-3 rounded-md mt-4">
              <p className="text-sm text-blue-800 font-medium">Thông tin đăng nhập mẫu:</p>
              <p className="text-xs text-blue-700 mt-1">
                - Quản trị viên: <b>admin / admin123</b>
              </p>
              <p className="text-xs text-blue-700">
                - Nhân viên: <b>staff / staff123</b>
              </p>
            </div>
          </Form>
          
          {/* Footer */}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;