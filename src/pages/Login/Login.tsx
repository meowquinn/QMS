import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, CopyOutlined } from '@ant-design/icons';
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

  // Tài khoản mẫu cứng
  const sampleAccounts = [
    { username: 'nguyenvanan', role: 'Quản trị viên' },
    { username: 'tranthibinh', role: 'Nhân viên' }
  ];

  // Hàm sử dụng tài khoản mẫu
  const useSampleAccount = (username: string) => {
    form.setFieldsValue({
      username,
      password: 'password123'
    });
  };

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      console.log('Đang đăng nhập với:', values);
      
      const userData = await login(values.username, values.password);
      console.log('Kết quả đăng nhập:', userData);
      
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

            {/* Thông tin tài khoản mẫu cứng */}
            <div className="bg-blue-50 p-3 rounded-md mt-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Tài khoản mẫu:</p>
              
              {sampleAccounts.map((account, index) => (
                <div key={index} className="flex justify-between items-center mb-1">
                  <p className="text-xs text-blue-700">
                    - {account.role}: <b>{account.username} / password123</b>
                  </p>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={() => useSampleAccount(account.username)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Dùng tài khoản này"
                  />
                </div>
              ))}
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