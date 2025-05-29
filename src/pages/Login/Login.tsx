import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { type User } from '../../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Hàm lấy API URL
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:7021'; // Cổng API 7021
  }
  return 'https://api.yourproductionurl.com';
};

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
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setApiError(false);
    
    try {
      // Gọi API đăng nhập thật
      const API_URL = getApiUrl();
      console.log(`Calling API: ${API_URL}/api/Auth/login`);
      
      const response = await axios.post(`${API_URL}/api/Auth/login`, {
        username: values.username,
        password: values.password
      }, { timeout: 5000 }); // 5s timeout
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        message.success('Đăng nhập thành công!');
        
        // Lưu token nếu có
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        }
        
        // Map dữ liệu từ API với interface User
        const userData: User = {
          staffId: response.data.data.staffId,
          username: response.data.data.username,
          fullName: response.data.data.fullName || response.data.data.name,
          sRole: response.data.data.sRole || response.data.data.role,
          access: response.data.data.access,
          email: response.data.data.email,
          phoneNumber: response.data.data.phoneNumber
        };
        
        // Lưu thông tin người dùng
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Gọi hàm onLogin từ props
        onLogin(userData);
        
        // Điều hướng đến dashboard
        navigate('/dashboard');
      } else {
        message.error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login API error:', error);
      setApiError(true);
      message.error('Không thể kết nối đến máy chủ. Đang sử dụng tài khoản mẫu.');
      
      // Fallback sang tài khoản mẫu khi API lỗi
      fallbackToSampleAccounts(values);
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm fallback sử dụng tài khoản mẫu khi API không phản hồi
  const fallbackToSampleAccounts = (values: LoginFormValues) => {
    // Thông tin đăng nhập mẫu
    const users = [
      {
        staffId: 1,
        username: 'admin',
        password: 'admin123',
        fullName: 'Quản trị viên',
        sRole: 'Admin',
        access: 'admin',
        email: 'admin@example.com',
        phoneNumber: '0987654321'
      },
      {
        staffId: 2,
        username: 'staff',
        password: 'staff123',
        fullName: 'Nhân viên',
        sRole: 'Staff',
        access: 'user',
        email: 'staff@example.com',
        phoneNumber: '0123456789'
      }
    ];
    
    const user = users.find(
      u => u.username === values.username && u.password === values.password
    );
    
    if (user) {
      message.success('Đăng nhập thành công (chế độ offline)');
      
      // Map dữ liệu mẫu vào User interface
      const userData: User = {
        staffId: user.staffId,
        username: user.username,
        fullName: user.fullName,
        sRole: user.sRole,
        access: user.access,
        email: user.email,
        phoneNumber: user.phoneNumber
      };
      
      // Lưu thông tin người dùng
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', `mock-token-${Date.now()}`);
      
      // Gọi hàm onLogin từ props
      onLogin(userData);
      
      // Điều hướng đến dashboard
      navigate('/dashboard');
    } else {
      message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
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
            {apiError && (
              <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-md">
                Đang sử dụng chế độ offline
              </div>
            )}
          </div>

          {/* Form đăng nhập */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={{
              username: "admin",
              password: "admin123"
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

            {/* Thông tin mẫu */}
            <div className="bg-blue-50 p-3 rounded-md mt-4">
              <p className="text-sm text-blue-800 font-medium">Thông tin đăng nhập mẫu:</p>
              <p className="text-xs text-blue-700 mt-1">
                - Quản trị viên: <b>admin / admin123</b>
              </p>
              <p className="text-xs text-blue-700">
                - Nhân viên: <b>staff / staff123</b>
              </p>
              <p className="text-xs text-blue-500 mt-1">
                * Tài khoản mẫu sẽ được dùng khi không kết nối được API
              </p>
            </div>
          </Form>
          
          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} PoolQMS</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;