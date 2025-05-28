import React, { useState, useEffect } from 'react';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../services/staffService';
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
import type { StaffMember } from '../../services/types';

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

  // Tải dữ liệu từ API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        
        // Nếu là admin, lấy tất cả nhân viên
        if (isAdmin) {
          const data = await getAllStaff();
          setStaffList(data);
          setFilteredStaff(data);
        } else {
          // Nếu là user thường, chỉ lấy thông tin của chính mình
          // Hoặc một danh sách hạn chế (tùy thuộc vào API của bạn)
          try {
            const data = await getAllStaff();
            setStaffList(data);
            setFilteredStaff(data);
          } catch (error) {
            if (typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { status?: number } }).response?.status === 403) {
              // Nếu không có quyền xem tất cả, thử lấy thông tin cá nhân
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              // Tạo mảng chỉ có user hiện tại
              const userData = currentUser.staffId ? [currentUser] : [];
              setStaffList(userData);
              setFilteredStaff(userData);
            } else {
              throw error; // Ném lỗi để xử lý bên ngoài
            }
          }
        }
      } catch (error) {
        message.error('Không thể tải danh sách nhân viên');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [isAdmin]);

  // Xử lý tìm kiếm nhân viên
  useEffect(() => {
    const filteredData = staffList.filter(staff => 
      staff.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      staff.sRole.toLowerCase().includes(searchText.toLowerCase()) ||
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
    form.setFieldsValue({
      ...staff,
      // Đặt giá trị cho các trường trong form theo đúng tên trường mới
      fullName: staff.fullName,
      sRole: staff.sRole,
      phoneNumber: staff.phoneNumber,
      sAddress: staff.sAddress
    });
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Xử lý thêm/sửa nhân viên
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingStaff) {
        // Cập nhật nhân viên hiện có
        const updatedData = {
          ...values,
          // Chỉ gửi mật khẩu mới nếu người dùng đã nhập
          ...(values.sPassword ? { sPassword: values.sPassword } : {})
        };
        
        await updateStaff(editingStaff.staffId, updatedData);
        setStaffList(prev => prev.map(staff => 
          staff.staffId === editingStaff.staffId ? { ...staff, ...updatedData } : staff
        ));
        message.success('Đã cập nhật thông tin nhân viên thành công!');
      } else {
        // Thêm nhân viên mới
        const staffData = {
          ...values,
          sPassword: values.sPassword || 'password123' // Mật khẩu mặc định nếu không nhập
        };
        
        const newStaff = await createStaff(staffData);
        setStaffList(prev => [...prev, newStaff]);
        message.success('Đã thêm nhân viên mới thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Có lỗi xảy ra khi xử lý dữ liệu nhân viên');
      }
    }
  };

  // Xử lý xóa nhân viên
  const handleDelete = async (staffId: number) => {
    if (!isAdmin) {
      message.warning('Bạn không có quyền xóa nhân viên');
      return;
    }
    
    try {
      await deleteStaff(staffId);
      setStaffList(prev => prev.filter(staff => staff.staffId !== staffId));
      message.success('Đã xóa nhân viên thành công!');
    } catch (error) {
      message.error('Không thể xóa nhân viên này');
      console.error(error);
    }
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

  const adminColumns = [
    {
      title: 'ID',
      dataIndex: 'staffId',
      key: 'staffId',
      width: 100,
      render: (staffId: number) => (
        <span className="text-xs text-gray-500">
          {staffId}
        </span>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_text: string, record: StaffMember) => (
        <div className="font-medium text-gray-800">
          {record.fullName}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'sRole',
      key: 'sRole',
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
          <Tooltip title={record.phoneNumber}>
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
            onConfirm={() => handleDelete(record.staffId)}
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

  // Columns cho user thường
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'staffId',
      key: 'staffId',
      width: 100,
      render: (staffId: number) => (
        <span className="text-xs text-gray-500 font-mono">
          {staffId}
        </span>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_text: string, record: StaffMember) => (
        <div className="font-medium text-gray-800">
          {record.fullName}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'sRole',
      key: 'sRole',
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_text: string, record: StaffMember) => (
        <Space size="middle">
          <Tooltip title={record.phoneNumber}>
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
            rowKey="staffId"
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
                  {record.sAddress && (
                    <div className="text-sm mb-1">
                      <span className="font-semibold">Địa chỉ:</span> {record.sAddress}
                    </div>
                  )}
                </div>
              ),
              rowExpandable: record => !!record.sAddress,
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
              name="fullName"
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
              name="phoneNumber"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="sRole"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select placeholder="Chọn vai trò">
                <Select.Option value="Quản lý">Quản lý</Select.Option>
                <Select.Option value="Kỹ thuật viên">Kỹ thuật viên</Select.Option>
                <Select.Option value="Nhân viên đo đạc">Nhân viên đo đạc</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                {
                  validator(_, value) {
                    if (!value || (editingStaff && value === editingStaff.username)) {
                      return Promise.resolve();
                    }
                    
                    const isDuplicate = staffList.some(
                      staff => staff.username === value && staff.staffId !== (editingStaff?.staffId || 0)
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
              name="sPassword"
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
              name="sAddress"
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
