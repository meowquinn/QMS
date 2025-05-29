import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { login as loginApi } from '../../services/authService';
import { type User } from '../../contexts/AuthContext';


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

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      
      // Gọi API đăng nhập
      const response = await loginApi(values.username, values.password);
      
      // Nếu đăng nhập thành công
      if (response.success) {
        message.success('Đăng nhập thành công!');
        
        // Chuyển đổi dữ liệu từ API sang đúng kiểu User
        const userData: User = {
          staffId: response.data.staffId,
          username: response.data.username,
          fullName: response.data.fullName,
          sRole: response.data.sRole,
          access: response.data.access,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          sAddress: response.data.sAddress
        };
        
        // Gọi hàm onLogin với dữ liệu đã chuyển đổi
        onLogin(userData);
      } else {
        // Xử lý lỗi đăng nhập
        message.error(response.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      // Xử lý lỗi khi gọi API
      console.error('Lỗi đăng nhập:', error);
      message.error('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
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
            initialValues={{
              username: process.env.NODE_ENV === 'development' ? 'admin' : '',
              password: process.env.NODE_ENV === 'development' ? 'admin123' : '',
            }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="Tên đăng nhập"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
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

            {/* Thông tin trợ giúp */}
            <div className="bg-blue-50 p-3 rounded-md mt-4">
              <p className="text-sm text-blue-800 font-medium">Thông tin đăng nhập</p>
              <p className="text-xs text-blue-700 mt-1">
                Sử dụng tài khoản được cung cấp bởi quản trị viên hệ thống.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Nếu quên mật khẩu, vui lòng liên hệ với quản trị viên để được hỗ trợ.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 pt-2 border-t border-blue-100">
                  <p className="text-xs text-blue-800 font-medium">Tài khoản mẫu:</p>
                  <div className="grid grid-cols-2 gap-1 mt-1 text-xs text-blue-700">
                    <div>Admin:</div>
                    <div>admin / admin123</div>
                    <div>Nhân viên:</div>
                    <div>staff / staff123</div>
                  </div>
                </div>
              )}
            </div>
          </Form>
          
          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} PoolQMS. Bản quyền thuộc về công ty.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;