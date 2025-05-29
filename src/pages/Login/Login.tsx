import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { login as loginApi } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      
      // Gọi API đăng nhập từ service
      const response = await loginApi(values.username, values.password);
      
      if (response.success) {
        message.success('Đăng nhập thành công!');
        
        // Cập nhật context
        login({
          staffId: response.data.staffId,
          username: response.data.username,
          fullName: response.data.fullName,
          sRole: response.data.sRole,
          access: response.data.access,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          sAddress: response.data.sAddress
        });
        
        // Chuyển hướng đến dashboard
        navigate('/dashboard');
      } else {
        // Hiển thị thông báo lỗi từ API
        message.error(response.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">PoolQMS</h2>
            <p className="text-gray-600 mt-1">Hệ thống quản lý chất lượng hồ bơi</p>
          </div>

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
                className="w-full"
                loading={loading}
                size="large"
              >
                Đăng nhập
              </Button>
            </Form.Item>
            
            <div className="bg-blue-50 p-3 rounded-md mt-4">
              <p className="text-sm text-blue-800 font-medium">Thông tin đăng nhập</p>
              <p className="text-xs text-blue-700 mt-1">
                Sử dụng tài khoản được cấp bởi quản trị viên hệ thống.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Nếu quên mật khẩu, vui lòng liên hệ với quản trị viên để được hỗ trợ.
              </p>
            </div>
          </Form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;