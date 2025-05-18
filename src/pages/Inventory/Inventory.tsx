import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Tag, Space, Input, Modal, Form, 
  InputNumber, Select, Tabs, message, Tooltip, Progress, Popconfirm
} from 'antd';
import { 
  PlusOutlined, EditOutlined, HistoryOutlined, 
  SearchOutlined, InfoCircleOutlined, PlusCircleOutlined,
  DeleteOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';

// Định nghĩa các kiểu dữ liệu
interface Chemical {
  id: string;
  name: string;
  type: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  reorderLevel: number;
  lastRestocked: Date;
  description?: string;
}

interface AdjustmentRecord {
  id: string;
  chemicalId: string;
  chemicalName: string;
  poolId: string;
  poolName: string;
  amount: number;
  unit: string;
  adjustedBy: string;
  note?: string;
  timestamp: Date;
  isRestock?: boolean; // Để phân biệt giữa sử dụng và nạp thêm
}

interface Pool {
  id: string;
  name: string;
}

const InventoryStock: React.FC = () => {
  // State cho dữ liệu
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentRecord[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  
  // State cho modal
  const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isRestockModalVisible, setIsRestockModalVisible] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  
  // Form
  const [form] = Form.useForm();

  // Tab active
  const [activeTab, setActiveTab] = useState<string>("inventory");

  // Tải dữ liệu hóa chất và hồ bơi
  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockChemicals: Chemical[] = [
        {
          id: "chem-1",
          name: "Chlorine",
          type: "Chất khử trùng",
          currentStock: 75,
          unit: "kg",
          minThreshold: 20,
          reorderLevel: 30,
          lastRestocked: new Date(2025, 4, 10),
          description: "Chất khử trùng chính để diệt khuẩn"
        },
        {
          id: "chem-2",
          name: "Sodium Bicarbonate",
          type: "Điều chỉnh pH",
          currentStock: 45,
          unit: "kg",
          minThreshold: 15,
          reorderLevel: 25,
          lastRestocked: new Date(2025, 4, 8),
          description: "Tăng độ pH và kiềm"
        },
        {
          id: "chem-3",
          name: "Muriatic Acid",
          type: "Điều chỉnh pH",
          currentStock: 18,
          unit: "lít",
          minThreshold: 10,
          reorderLevel: 20,
          lastRestocked: new Date(2025, 4, 12),
          description: "Giảm độ pH"
        },
        {
          id: "chem-4",
          name: "Algaecide",
          type: "Diệt tảo",
          currentStock: 30,
          unit: "lít",
          minThreshold: 10,
          reorderLevel: 15,
          lastRestocked: new Date(2025, 4, 5),
          description: "Ngăn ngừa và tiêu diệt tảo"
        },
        {
          id: "chem-5",
          name: "Calcium Chloride",
          type: "Điều chỉnh độ cứng",
          currentStock: 50,
          unit: "kg",
          minThreshold: 15,
          reorderLevel: 25,
          lastRestocked: new Date(2025, 4, 3),
          description: "Tăng độ cứng của nước"
        },
        {
          id: "chem-6",
          name: "Clarifier",
          type: "Làm trong nước",
          currentStock: 5,
          unit: "lít",
          minThreshold: 5,
          reorderLevel: 10,
          lastRestocked: new Date(2025, 4, 1),
          description: "Làm trong nước, loại bỏ các hạt lơ lửng"
        }
      ];

      const mockPools: Pool[] = [
        { id: "pool-1", name: "Hồ bơi chính" },
        { id: "pool-2", name: "Hồ bơi trẻ em" },
        { id: "pool-3", name: "Hồ bơi spa" }
      ];

      const mockAdjustmentHistory: AdjustmentRecord[] = [
        {
          id: "adj-1",
          chemicalId: "chem-1",
          chemicalName: "Chlorine",
          poolId: "pool-1",
          poolName: "Hồ bơi chính",
          amount: 2.5,
          unit: "kg",
          adjustedBy: "Nguyễn Văn A",
          timestamp: new Date(2025, 4, 17, 9, 30),
          note: "Điều chỉnh sau khi đo chỉ số thấp"
        },
        {
          id: "rst-1",
          chemicalId: "chem-1",
          chemicalName: "Chlorine",
          poolId: "",
          poolName: "",
          amount: 25,
          unit: "kg",
          adjustedBy: "Trần Văn B",
          timestamp: new Date(2025, 4, 10, 14, 0),
          note: "Nạp thêm từ nhà cung cấp ABC",
          isRestock: true
        },
        {
          id: "adj-2",
          chemicalId: "chem-3",
          chemicalName: "Muriatic Acid",
          poolId: "pool-2",
          poolName: "Hồ bơi trẻ em",
          amount: 1.2,
          unit: "lít",
          adjustedBy: "Trần Thị B",
          timestamp: new Date(2025, 4, 16, 15, 0),
          note: "pH quá cao, cần điều chỉnh"
        },
        {
          id: "rst-2",
          chemicalId: "chem-3",
          chemicalName: "Muriatic Acid",
          poolId: "",
          poolName: "",
          amount: 10,
          unit: "lít",
          adjustedBy: "Trần Văn B",
          timestamp: new Date(2025, 4, 12, 9, 0),
          note: "Bổ sung kho",
          isRestock: true
        }
      ];

      setChemicals(mockChemicals);
      setPools(mockPools);
      setAdjustmentHistory(mockAdjustmentHistory);
      setLoading(false);
    }, 1000);
  }, []);

  // Lọc hóa chất theo tìm kiếm
  const filteredChemicals = chemicals.filter(chemical => 
    chemical.name.toLowerCase().includes(searchText.toLowerCase()) || 
    chemical.type.toLowerCase().includes(searchText.toLowerCase())
  );

  // Hiển thị modal thêm hóa chất mới
  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  // Hiển thị modal điều chỉnh hóa chất
  const showAdjustModal = (chemical: Chemical) => {
    setSelectedChemical(chemical);
    form.resetFields();
    form.setFieldsValue({
      chemicalId: chemical.id,
      amount: 0,
      unit: chemical.unit
    });
    setIsAdjustModalVisible(true);
  };

  // Hiển thị modal nạp thêm hóa chất
  const showRestockModal = (chemical: Chemical) => {
    setSelectedChemical(chemical);
    form.resetFields();
    form.setFieldsValue({
      chemicalId: chemical.id,
      amount: 0,
      unit: chemical.unit
    });
    setIsRestockModalVisible(true);
  };

  // Xử lý thêm hóa chất mới
  const handleAddChemical = () => {
    form.validateFields().then(values => {
      const newChemical: Chemical = {
        id: `chem-${Date.now()}`,
        name: values.name,
        type: values.type,
        currentStock: values.currentStock,
        unit: values.unit,
        minThreshold: values.minThreshold,
        reorderLevel: values.reorderLevel,
        lastRestocked: new Date(),
        description: values.description
      };

      setChemicals([...chemicals, newChemical]);
      setIsAddModalVisible(false);
      form.resetFields();
      message.success('Đã thêm hóa chất mới thành công!');
    });
  };

  // Xử lý điều chỉnh hóa chất
  const handleAdjustChemical = () => {
    form.validateFields().then(values => {
      if (selectedChemical) {
        // Cập nhật tồn kho
        const updatedChemicals = chemicals.map(chem => {
          if (chem.id === selectedChemical.id) {
            return {
              ...chem,
              currentStock: Math.max(0, chem.currentStock - values.amount)
            };
          }
          return chem;
        });

        // Thêm vào lịch sử điều chỉnh
        const newAdjustment: AdjustmentRecord = {
          id: `adj-${Date.now()}`,
          chemicalId: selectedChemical.id,
          chemicalName: selectedChemical.name,
          poolId: values.poolId,
          poolName: pools.find(pool => pool.id === values.poolId)?.name || "",
          amount: values.amount,
          unit: selectedChemical.unit,
          adjustedBy: "Người dùng hiện tại",  // Cần thay bằng user hiện tại từ auth
          timestamp: new Date(),
          note: values.note
        };

        setChemicals(updatedChemicals);
        setAdjustmentHistory([newAdjustment, ...adjustmentHistory]);
        setIsAdjustModalVisible(false);
        message.success('Đã điều chỉnh hóa chất thành công!');
      }
    });
  };

  // Xử lý nạp thêm hóa chất
  const handleRestockChemical = () => {
    form.validateFields().then(values => {
      if (selectedChemical) {
        // Cập nhật tồn kho
        const updatedChemicals = chemicals.map(chem => {
          if (chem.id === selectedChemical.id) {
            return {
              ...chem,
              currentStock: chem.currentStock + values.amount,
              lastRestocked: new Date()
            };
          }
          return chem;
        });

        // Thêm vào lịch sử điều chỉnh
        const newAdjustment: AdjustmentRecord = {
          id: `rst-${Date.now()}`,
          chemicalId: selectedChemical.id,
          chemicalName: selectedChemical.name,
          poolId: "",
          poolName: "",
          amount: values.amount,
          unit: selectedChemical.unit,
          adjustedBy: "Người dùng hiện tại",  // Cần thay bằng user hiện tại từ auth
          timestamp: new Date(),
          note: values.note,
          isRestock: true
        };

        setChemicals(updatedChemicals);
        setAdjustmentHistory([newAdjustment, ...adjustmentHistory]);
        setIsRestockModalVisible(false);
        message.success('Đã nạp thêm hóa chất thành công!');
      }
    });
  };

  // Hiển thị trạng thái tồn kho
  const renderStockStatus = (current: number, min: number, reorder: number) => {
    let color = 'green';
    let status = 'Đầy đủ';
    
    if (current <= min) {
      color = 'red';
      status = 'Thấp';
    } else if (current <= reorder) {
      color = 'orange';
      status = 'Cần đặt thêm';
    }
    
    const percent = Math.min(100, (current / reorder) * 100);
    
    return (
      <div>
        <Progress 
          percent={percent} 
          showInfo={false} 
          strokeColor={color} 
          size="small" 
        />
        <Tag color={color} style={{ marginTop: '8px' }}>{status}</Tag>
      </div>
    );
  };

  // Cấu hình cột bảng hóa chất
  const chemicalColumns = [
    {
      title: 'Tên hóa chất',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Chemical) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.type}</div>
        </div>
      ),
    },
    {
      title: 'Tồn kho hiện tại',
      key: 'stock',
      render: (text: string, record: Chemical) => (
        <div>
          <div className="text-lg font-medium">
            {record.currentStock} {record.unit}
          </div>
          <div className="text-xs text-gray-500">
            Nạp gần nhất: {record.lastRestocked.toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text: string, record: Chemical) => 
        renderStockStatus(record.currentStock, record.minThreshold, record.reorderLevel),
    },
    {
      title: 'Ngưỡng tối thiểu',
      key: 'threshold',
      render: (text: string, record: Chemical) => (
        <div>
          <div className="text-sm">Tối thiểu: {record.minThreshold} {record.unit}</div>
          <div className="text-sm">Đặt lại: {record.reorderLevel} {record.unit}</div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: string, record: Chemical) => (
        <Space size="middle">
          <Button 
            onClick={() => showAdjustModal(record)} 
            icon={<EditOutlined />} 
            type="primary" 
            size="small"
            className="bg-blue-500"
          >
            Điều chỉnh
          </Button>
          <Button 
            onClick={() => showRestockModal(record)} 
            icon={<PlusCircleOutlined />} 
            type="primary" 
            size="small"
            className="bg-green-600"
          >
            Nạp thêm
          </Button>
          <Tooltip title="Xem lịch sử">
            <Button 
              icon={<HistoryOutlined />} 
              size="small"
              onClick={() => {
                setActiveTab("history");
                setSearchText(record.name);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa hóa chất này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteChemical(record.id)}
          >
            <Button 
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Cấu hình cột bảng lịch sử
  const historyColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: Date) => (
        <div>
          <div>{date.toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      title: 'Hóa chất',
      dataIndex: 'chemicalName',
      key: 'chemicalName',
    },
    {
      title: 'Loại thao tác',
      key: 'actionType',
      render: (_: unknown, record: AdjustmentRecord) => (
        <Tag color={record.isRestock ? 'green' : 'blue'}>
          {record.isRestock ? 'Nạp thêm' : 'Sử dụng'}
        </Tag>
      ),
    },
    {
      title: 'Hồ bơi',
      dataIndex: 'poolName',
      key: 'poolName',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Số lượng',
      key: 'amount',
      render: (text: string, record: AdjustmentRecord) => (
        <div>{record.amount} {record.unit}</div>
      ),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'adjustedBy',
      key: 'adjustedBy',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '-',
    },
  ];

  // Filter lịch sử theo searchText
  const filteredHistory = adjustmentHistory.filter(record => 
    record.chemicalName.toLowerCase().includes(searchText.toLowerCase()) || 
    (record.poolName && record.poolName.toLowerCase().includes(searchText.toLowerCase()))
  );

  const items = [
    {
      key: 'inventory',
      label: <span><InfoCircleOutlined /> Tồn kho hóa chất</span>,
      children: (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <Input 
              placeholder="Tìm kiếm hóa chất..." 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-full md:w-64"
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
              className="mt-2 md:mt-0 bg-blue-500"
            >
              Thêm hóa chất mới
            </Button>
          </div>
          
          <Card className="mt-4 shadow-md">
            <Table 
              columns={chemicalColumns} 
              dataSource={filteredChemicals}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'history',
      label: <span><HistoryOutlined /> Lịch sử thao tác</span>,
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Input 
              placeholder="Tìm kiếm theo hóa chất hoặc hồ bơi..." 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
          
          <Card className="mt-4 shadow-md">
            <Table 
              columns={historyColumns} 
              dataSource={filteredHistory}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </div>
      ),
    }
  ];

  // Thêm hàm xử lý xóa hóa chất
  const handleDeleteChemical = (chemicalId: string) => {
    // Tìm xem hóa chất đã được sử dụng trong lịch sử chưa
    const hasUsageRecords = adjustmentHistory.some(
      record => record.chemicalId === chemicalId && !record.isRestock
    );
    
    if (hasUsageRecords) {
      Modal.confirm({
        title: 'Cảnh báo',
        icon: <ExclamationCircleOutlined />,
        content: 'Hóa chất này đã được sử dụng trong lịch sử. Việc xóa sẽ ảnh hưởng đến dữ liệu lịch sử. Bạn vẫn muốn tiếp tục?',
        okText: 'Xóa',
        cancelText: 'Hủy',
        onOk: () => {
          deleteChemicalAndHistory(chemicalId);
        }
      });
    } else {
      deleteChemicalAndHistory(chemicalId);
    }
  };
  
  // Hàm xóa hóa chất và lịch sử liên quan
  const deleteChemicalAndHistory = (chemicalId: string) => {
    // Xóa hóa chất
    const updatedChemicals = chemicals.filter(chem => chem.id !== chemicalId);
    setChemicals(updatedChemicals);
    
    // Xóa lịch sử liên quan (tùy chọn)
    const updatedHistory = adjustmentHistory.filter(
      record => record.chemicalId !== chemicalId
    );
    setAdjustmentHistory(updatedHistory);
    
    message.success('Đã xóa hóa chất thành công!');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý hóa chất hồ bơi</h1>
        <p className="text-gray-600">Theo dõi tồn kho và điều chỉnh hóa chất cho các hồ bơi</p>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={items}
      />

      {/* Modal thêm hóa chất mới */}
      <Modal
        title="Thêm hóa chất mới"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={handleAddChemical}
        okText="Thêm mới"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên hóa chất"
            rules={[{ required: true, message: 'Vui lòng nhập tên hóa chất!' }]}
          >
            <Input placeholder="Nhập tên hóa chất" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Loại hóa chất"
            rules={[{ required: true, message: 'Vui lòng chọn loại hóa chất!' }]}
          >
            <Select placeholder="Chọn loại hóa chất">
              <Select.Option value="Chất khử trùng">Chất khử trùng</Select.Option>
              <Select.Option value="Điều chỉnh pH">Điều chỉnh pH</Select.Option>
              <Select.Option value="Diệt tảo">Diệt tảo</Select.Option>
              <Select.Option value="Điều chỉnh độ cứng">Điều chỉnh độ cứng</Select.Option>
              <Select.Option value="Làm trong nước">Làm trong nước</Select.Option>
            </Select>
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="currentStock"
              label="Số lượng hiện có"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng" />
            </Form.Item>
            
            <Form.Item
              name="unit"
              label="Đơn vị"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}
            >
              <Select placeholder="Chọn đơn vị">
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="lít">lít</Select.Option>
                <Select.Option value="gói">gói</Select.Option>
              </Select>
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="minThreshold"
              label="Ngưỡng tối thiểu"
              rules={[{ required: true, message: 'Vui lòng nhập ngưỡng tối thiểu!' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Ngưỡng tối thiểu" />
            </Form.Item>
            
            <Form.Item
              name="reorderLevel"
              label="Mức đặt lại"
              rules={[{ required: true, message: 'Vui lòng nhập mức đặt lại!' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Mức đặt lại" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả về hóa chất" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal điều chỉnh hóa chất */}
      <Modal
        title={`Điều chỉnh ${selectedChemical?.name || 'hóa chất'}`}
        open={isAdjustModalVisible}
        onCancel={() => setIsAdjustModalVisible(false)}
        onOk={handleAdjustChemical}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="chemicalId" hidden>
            <Input />
          </Form.Item>
          
          {selectedChemical && (
            <div className="bg-blue-50 p-3 rounded mb-4">
              <p className="text-blue-800">
                <strong>Tồn kho hiện tại:</strong> {selectedChemical.currentStock} {selectedChemical.unit}
              </p>
            </div>
          )}
          
          <Form.Item
            name="poolId"
            label="Hồ bơi"
            rules={[{ required: true, message: 'Vui lòng chọn hồ bơi!' }]}
          >
            <Select placeholder="Chọn hồ bơi">
              {pools.map(pool => (
                <Select.Option key={pool.id} value={pool.id}>{pool.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="Lượng sử dụng"
            rules={[
              { required: true, message: 'Vui lòng nhập lượng sử dụng!' },
              () => ({
                validator(_, value) {
                  if (!value || !selectedChemical) {
                    return Promise.resolve();
                  }
                  if (value > selectedChemical.currentStock) {
                    return Promise.reject(new Error('Lượng sử dụng không thể lớn hơn tồn kho!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber 
              min={0} 
              max={selectedChemical?.currentStock || 0} 
              style={{ width: '100%' }} 
              placeholder="Nhập lượng sử dụng" 
              addonAfter={selectedChemical?.unit}
            />
          </Form.Item>
          
          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú về việc điều chỉnh" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal nạp thêm hóa chất */}
      <Modal
        title={`Nạp thêm ${selectedChemical?.name || 'hóa chất'}`}
        open={isRestockModalVisible}
        onCancel={() => setIsRestockModalVisible(false)}
        onOk={handleRestockChemical}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="chemicalId" hidden>
            <Input />
          </Form.Item>
          
          {selectedChemical && (
            <div className="bg-green-50 p-3 rounded mb-4">
              <p className="text-green-800">
                <strong>Tồn kho hiện tại:</strong> {selectedChemical.currentStock} {selectedChemical.unit}
              </p>
            </div>
          )}
          
          <Form.Item
            name="amount"
            label="Số lượng nạp thêm"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng nạp thêm!' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }} 
              placeholder="Nhập số lượng nạp thêm" 
              addonAfter={selectedChemical?.unit}
            />
          </Form.Item>

          <Form.Item
            name="supplier"
            label="Nhà cung cấp"
          >
            <Input placeholder="Nhập tên nhà cung cấp (không bắt buộc)" />
          </Form.Item>
          
          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú về việc nạp thêm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryStock;
