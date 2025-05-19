import React, { useState, useEffect } from 'react';
import { 
  Table, Input, Button, Modal, Form, 
  Select, Space, message, Tag, Popconfirm,
  Card, Tooltip
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, UserOutlined, PhoneOutlined, 
  MailOutlined, LockOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

// Cập nhật lại interface theo yêu cầu
interface StaffMember {
  id: string;
  name: string;
  role: string;
  username: string;     // Tên đăng nhập
  password: string;     // Mật khẩu
  phone: string;
  email: string;
  access: 'admin' | 'user';
  address?: string;     // Địa chỉ (tùy chọn)
}

const Staff: React.FC = () => {
  // State quản lý
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [form] = Form.useForm();
  const { isAdmin } = useAuth();

  // Tải dữ liệu mẫu
  useEffect(() => {
    // Giả lập API call để lấy dữ liệu
    setTimeout(() => {
      const mockData: StaffMember[] = [
        {
          id: '1',
          name: 'Nguyễn Văn An',
          role: 'Quản lý',
          username: 'nguyenvanan',
          password: 'password123',
          phone: '0901234567',
          email: 'an.nguyen@example.com',
          access: 'admin',
          address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        },
        {
          id: '2',
          name: 'Trần Thị Bình',
          role: 'Nhân viên đo đạc',
          username: 'tranthibinh',
          password: 'password123',
          phone: '0912345678',
          email: 'binh.tran@example.com',
          access: 'user',
          address: '456 Đường Lê Lợi, Quận 3, TP.HCM',
        },
        {
          id: '3',
          name: 'Lê Văn Cường',
          role: 'Kỹ thuật viên',
          username: 'levancuong',
          password: 'password123',
          phone: '0923456789',
          email: 'cuong.le@example.com',
          access: 'user',
          address: '789 Đường Hai Bà Trưng, Quận 5, TP.HCM',
        },
        {
          id: '4',
          name: 'Phạm Thị Dung',
          role: 'Nhân viên vệ sinh',
          username: 'phamthidung',
          password: 'password123',
          phone: '0934567890',
          email: 'dung.pham@example.com',
          access: 'user',
          address: '101 Đường Nguyễn Du, Quận 1, TP.HCM'
        },
        {
          id: '5',
          name: 'Hoàng Văn Đức',
          role: 'Nhân viên đo đạc',
          username: 'hoangvanduc',
          password: 'password123',
          phone: '0945678901',
          email: 'duc.hoang@example.com',
          access: 'user',
          address: '202 Đường Võ Văn Tần, Quận 3, TP.HCM',
        },
        {
          id: '6',
          name: 'Vũ Thị Hà',
          role: 'Kỹ thuật viên',
          username: 'vuthiha',
          password: 'password123',
          phone: '0956789012',
          email: 'ha.vu@example.com',
          access: 'admin',
          address: '303 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM'
        },
      ];

      setStaffList(mockData);
      setFilteredStaff(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Xử lý tìm kiếm nhân viên
  useEffect(() => {
    const filteredData = staffList.filter(staff => 
      staff.name.toLowerCase().includes(searchText.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchText.toLowerCase()) ||
      (isAdmin && staff.username.toLowerCase().includes(searchText.toLowerCase())) ||
      (isAdmin && staff.email.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredStaff(filteredData);
  }, [searchText, staffList, isAdmin]);

  // Hiển thị modal thêm nhân viên mới
  const showAddModal = () => {
    if (!isAdmin) {
      message.warning('Bạn không có quyền thêm nhân viên mới');
      return;
    }
    setEditingStaff(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Hiển thị modal chỉnh sửa nhân viên
  const showEditModal = (staff: StaffMember) => {
    if (!isAdmin) {
      message.warning('Bạn không có quyền chỉnh sửa thông tin nhân viên');
      return;
    }
    setEditingStaff(staff);
    
    // Không hiển thị mật khẩu khi chỉnh sửa
    const { ...restData } = staff;
    form.setFieldsValue(restData);
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Xử lý thêm/sửa nhân viên
  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingStaff) {
        // Cập nhật nhân viên hiện có
        const updatedStaff = {
          ...editingStaff,
          ...values,
          // Nếu mật khẩu được nhập mới thì cập nhật, nếu không giữ nguyên
          password: values.password ? values.password : editingStaff.password
        };
        setStaffList(staffList.map(staff => 
          staff.id === editingStaff.id ? updatedStaff : staff
        ));
        message.success('Đã cập nhật thông tin nhân viên thành công!');
      } else {
        // Thêm nhân viên mới
        const newStaff = {
          ...values,
          id: `staff-${Date.now()}`,
          password: values.password || 'password123' // Mật khẩu mặc định nếu không nhập
        };
        setStaffList([...staffList, newStaff]);
        message.success('Đã thêm nhân viên mới thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  // Xử lý xóa nhân viên
  const handleDelete = (id: string) => {
    if (!isAdmin) {
      message.warning('Bạn không có quyền xóa nhân viên');
      return;
    }
    setStaffList(staffList.filter(staff => staff.id !== id));
    message.success('Đã xóa nhân viên thành công!');
  };

  // Render quyền truy cập
  const renderAccess = (access: string) => {
    switch (access) {
      case 'admin':
        return <Tag color="red">Quản trị viên</Tag>;
      case 'user':
        return <Tag color="blue">Nhân viên</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  // Cấu hình các cột trong bảng cho admin
  const adminColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (_text: string, record: StaffMember) => (
        <div className="font-medium text-gray-800">
          {record.name}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_text: string, record: StaffMember) => (
        <Space size="middle">
          <Tooltip title={record.phone}>
            <PhoneOutlined className="text-blue-600" />
          </Tooltip>
          <Tooltip title={record.email}>
            <MailOutlined className="text-blue-600" />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Quyền truy cập',
      dataIndex: 'access',
      key: 'access',
      render: renderAccess,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_text: string, record: StaffMember) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            onClick={() => showEditModal(record)}
            className="bg-blue-500"
            ghost
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
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
      )
    }
  ];

  // Cấu hình các cột trong bảng cho nhân viên thường
  const userColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (_text: string, record: StaffMember) => (
        <div className="font-medium text-gray-800">
          {record.name}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_text: string, record: StaffMember) => (
        <Space size="middle">
          <Tooltip title={record.phone}>
            <PhoneOutlined className="text-blue-600" />
          </Tooltip>
          <Tooltip title={record.email}>
            <MailOutlined className="text-blue-600" />
          </Tooltip>
        </Space>
      ),
    }
  ];

  // Chọn cột hiển thị dựa trên quyền người dùng
  const columns = isAdmin ? adminColumns : userColumns;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Danh sách nhân viên</h1>
          <p className="text-gray-600">Quản lý thông tin của tất cả nhân viên trong hệ thống</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <Input
            placeholder="Tìm kiếm nhân viên..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full md:w-60"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {isAdmin && (
            <Button
              type="primary"
              className="bg-blue-500"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Thêm nhân viên
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table
            dataSource={filteredStaff}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Tổng số: ${total} nhân viên`,
            }}
            expandable={isAdmin ? {
              expandedRowRender: record => (
                <div className="p-2">
                  {record.address && (
                    <div className="text-sm mb-1">
                      <span className="font-semibold">Địa chỉ:</span> {record.address}
                    </div>
                  )}
                </div>
              ),
              rowExpandable: record => !!record.address,
            } : undefined}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>

      {/* Modal thêm/sửa nhân viên */}
      <Modal
        title={editingStaff ? "Chỉnh sửa thông tin nhân viên" : "Thêm nhân viên mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        width={800}
        okText={editingStaff ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            access: 'user',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ tên nhân viên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select placeholder="Chọn vai trò">
                <Select.Option value="Quản lý">Quản lý</Select.Option>
                <Select.Option value="Kỹ thuật viên">Kỹ thuật viên</Select.Option>
                <Select.Option value="Nhân viên đo đạc">Nhân viên đo đạc</Select.Option>
                <Select.Option value="Nhân viên vệ sinh">Nhân viên vệ sinh</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                {
                  validator(_, value) {
                    // Nếu đang chỉnh sửa và tên đăng nhập không thay đổi, hoặc là tạo mới
                    if (!value || (editingStaff && value === editingStaff.username)) {
                      return Promise.resolve();
                    }
                    
                    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
                    const isDuplicate = staffList.some(
                      staff => staff.username === value && staff.id !== (editingStaff?.id || '')
                    );
                    
                    if (isDuplicate) {
                      return Promise.reject(new Error('Tên đăng nhập đã tồn tại!'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="password"
              label={editingStaff ? "Đặt lại mật khẩu" : "Mật khẩu"}
              rules={[
                { 
                  required: !editingStaff, 
                  message: 'Vui lòng nhập mật khẩu!' 
                },
                { 
                  min: 6, 
                  message: 'Mật khẩu phải có ít nhất 6 ký tự!' 
                }
              ]}
              tooltip={editingStaff ? "Để trống nếu không muốn thay đổi mật khẩu" : "Mật khẩu cần tối thiểu 6 ký tự"}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder={editingStaff ? "Nhập mật khẩu mới để thay đổi" : "Nhập mật khẩu"} 
              />
            </Form.Item>

            <Form.Item
              name="access"
              label="Quyền truy cập"
              rules={[{ required: true, message: 'Vui lòng chọn quyền truy cập!' }]}
            >
              <Select placeholder="Chọn quyền truy cập">
                <Select.Option value="admin">Quản trị viên</Select.Option>
                <Select.Option value="user">Nhân viên</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              className="md:col-span-2"
            >
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ nhân viên" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Staff;
