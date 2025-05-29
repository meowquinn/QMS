import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Thêm hàm getApiUrl trực tiếp vào file này
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:7021';
  }
  return 'https://api.yourproductionurl.com'; // Thay thế bằng API URL thực tế
};

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // Nếu đã đăng nhập, chuyển hướng đến dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const API_URL = getApiUrl();
      
      console.log('Sending login request to:', `${API_URL}/api/auth/login`);
      
      // Đơn giản hóa quá trình login theo mẫu đã cho
      const response = await axios.post(`${API_URL}/api/auth/login`, { 
        username: values.username, 
        password: values.password 
      });
      
      console.log('Login response:', response);
      
      if (response.status === 200 && response.data.success) {
        message.success('Đăng nhập thành công!');
        
        // Lưu token
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        }
        
        // Lưu thông tin người dùng vào localStorage trước
        const userData = {
          staffId: response.data.data.staffId,
          username: response.data.data.username,
          fullName: response.data.data.fullName,
          sRole: response.data.data.sRole,
          access: response.data.data.access,
          email: response.data.data.email,
          phoneNumber: response.data.data.phoneNumber,
          sAddress: response.data.data.sAddress
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Sau đó cập nhật context
        login(userData);
        
        console.log('Login successful, redirecting to dashboard...');
        
        // Sử dụng navigate của React Router thay vì window.location
        // như trong ví dụ được cung cấp
        navigate('/dashboard');
      } else {
        message.error(response.data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Hiển thị thông báo lỗi cụ thể nếu có
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data?.message || 'Đăng nhập thất bại');
      } else {
        message.error('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau!');
      }
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
            <h2 className="text-2xl font-bold text-blue-600">PoolQMS</h2>
            <p className="text-gray-600 mt-1">Hệ thống quản lý chất lượng hồ bơi</p>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={{
              username: 'admin',
              password: 'admin123'
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