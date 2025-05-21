import React, { useState, useEffect } from 'react';
import { 
  Button, Modal, Form, Input, Select, 
  Popconfirm, message, Space, Tag, Spin
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined
} from '@ant-design/icons';
import { FaSwimmingPool } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

// Mô hình dữ liệu cho hồ bơi
interface Pool {
  id: number; // Thay đổi từ string sang number
  name: string;
  size: number;      // Kích thước theo m3
  capacity: number;  // Sức chứa (số người)
  location: string;  // Vị trí hồ bơi
  status: 'active' | 'maintenance' | 'closed';  // Trạng thái hoạt động
  description?: string;
}

const PoolList: React.FC = () => {
  // State quản lý danh sách hồ bơi
  const [pools, setPools] = useState<Pool[]>([]);
  // State quản lý modal thêm/sửa
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [form] = Form.useForm();
  // State quản lý loading
  const [loading, setLoading] = useState(false);
  // State quản lý tìm kiếm
  const [searchText, setSearchText] = useState('');
  // ID tự tăng cho hồ bơi mới
  const [nextId, setNextId] = useState<number>(4); // Bắt đầu từ 4 vì mockPools đã có 3 bản ghi

  // Lấy thông tin người dùng và quyền từ context
  const { isAdmin } = useAuth();

  // Giả lập dữ liệu
  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      const mockPools: Pool[] = [
        {
          id: 1,
          name: 'Hồ bơi Olympic',
          size: 1250,
          capacity: 2500,
          location: 'Khu A',
          status: 'active',
        },
        {
          id: 2,
          name: 'Hồ bơi trẻ em',
          size: 200,
          capacity: 500,
          location: 'Khu B',
          status: 'active',
        },
        {
          id: 3,
          name: 'Hồ bơi giải trí',
          size: 450,
          capacity: 1000,
          location: 'Khu C',
          status: 'maintenance',
        },
      ];
      setPools(mockPools);
      setLoading(false);
    }, 800);
  }, []);
  
  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredPools = pools.filter(
    pool => 
      pool.name.toLowerCase().includes(searchText.toLowerCase()) ||
      pool.location.toLowerCase().includes(searchText.toLowerCase())
  );

  // Mở modal thêm mới
  const showAddModal = () => {
    if (!isAdmin) {
      message.warning('Bạn không có quyền thêm hồ bơi mới');
      return;
    }
    setEditingPool(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Mở modal sửa
  const showEditModal = (pool: Pool) => {
    if (!isAdmin) {
      message.warning('Bạn không có quyền chỉnh sửa hồ bơi');
      return;
    }
    setEditingPool(pool);
    form.setFieldsValue(pool);
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Xử lý thêm/sửa
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const formData = {
        ...values,
        id: editingPool?.id || nextId // Sử dụng nextId thay vì tạo id từ Date.now()
      };

      if (editingPool) {
        // Cập nhật hồ bơi
        setPools(pools.map(pool => 
          pool.id === editingPool.id ? formData as Pool : pool
        ));
        message.success('Đã cập nhật thông tin hồ bơi thành công!');
      } else {
        // Thêm hồ bơi mới
        setPools([...pools, formData as Pool]);
        setNextId(nextId + 1); // Tăng giá trị ID tự tăng
        message.success('Đã thêm hồ bơi mới thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  // Xử lý xóa
  const handleDelete = (id: number) => { // Thay đổi kiểu tham số từ string sang number
    if (!isAdmin) {
      message.warning('Bạn không có quyền xóa hồ bơi');
      return;
    }
    setPools(pools.filter(pool => pool.id !== id));
    message.success('Đã xóa hồ bơi thành công!');
  };

  // Render trạng thái hồ bơi
  const renderStatus = (status: string) => {
    let color = 'green';
    let text = 'Hoạt động';
    
    if (status === 'maintenance') {
      color = 'orange';
      text = 'Bảo trì';
    } else if (status === 'closed') {
      color = 'red';
      text = 'Đóng cửa';
    }
    
    return (
      <Tag color={color}>
        {text}
      </Tag>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Danh sách hồ bơi</h1>
          <p className="text-gray-600">Quản lý tất cả các hồ bơi trong hệ thống</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <Input
            placeholder="Tìm kiếm hồ bơi..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full md:w-60"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Thêm hồ bơi
            </Button>
          )}
        </div>
      </div>

      {/* Bảng HTML giống Dashboard */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spin tip="Đang tải..." />
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên hồ bơi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kích thước
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sức chứa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPools.map((pool) => (
                  <tr key={pool.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pool.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <FaSwimmingPool className="text-blue-500 mr-2" />
                        <span>{pool.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pool.size} m<sup>3</sup>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pool.capacity} người
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pool.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderStatus(pool.status)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Space size="small">
                          <Button
                            icon={<EditOutlined />}
                            type="primary"
                            size="small"
                            onClick={() => showEditModal(pool)}
                            ghost
                          >
                            Sửa
                          </Button>
                          <Popconfirm
                            title="Bạn có chắc chắn muốn xóa hồ bơi này?"
                            onConfirm={() => handleDelete(pool.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button
                              icon={<DeleteOutlined />}
                              type="primary"
                              size="small"
                              danger
                              ghost
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      </td>
                    )}
                  </tr>
                ))}

                {filteredPools.length === 0 && !loading && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-sm text-gray-500">
                      Không tìm thấy hồ bơi nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          </div>
        </div>
      </div>

      {/* Phân trang đơn giản */}
      <div className="flex justify-end mt-4">
        <div className="text-sm text-gray-500">
          Tổng số: {filteredPools.length} hồ bơi
        </div>
      </div>
      
      {/* Modal thêm/sửa hồ bơi */}
      <Modal
        title={editingPool ? "Chỉnh sửa thông tin hồ bơi" : "Thêm hồ bơi mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingPool ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Tên hồ bơi"
              rules={[{ required: true, message: 'Vui lòng nhập tên hồ bơi!' }]}
            >
              <Input placeholder="Nhập tên hồ bơi" />
            </Form.Item>

            <Form.Item
              name="size"
              label="Kích thước (m³)"
              rules={[{ required: true, message: 'Vui lòng nhập kích thước hồ bơi!' }]}
            >
              <Input type="number" min={0} placeholder="Nhập kích thước" />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Sức chứa (người)"
              rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
            >
              <Input type="number" min={0} placeholder="Nhập sức chứa" />
            </Form.Item>

            <Form.Item
              name="location"
              label="Vị trí"
              rules={[{ required: true, message: 'Vui lòng nhập vị trí!' }]}
            >
              <Input placeholder="Nhập vị trí hồ bơi" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="maintenance">Bảo trì</Select.Option>
                <Select.Option value="closed">Đóng cửa</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              className="md:col-span-2"
            >
              <Input.TextArea rows={3} placeholder="Nhập mô tả hồ bơi" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PoolList;
