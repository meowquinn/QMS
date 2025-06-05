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

import type { Pool, Chemical, AdjustmentRecord } from '../../services/types';
import { 
  addChemical, deleteChemical, restockChemical, applyChemical, 
  getAllChemicals, getChemicalHistory 
} from '../../services/chemicalService';
import { getAllPools } from '../../services/poolService';

const InventoryStock: React.FC = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentRecord[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isRestockModalVisible, setIsRestockModalVisible] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("inventory");

  // Tải dữ liệu hóa chất và hồ bơi
  const reloadAll = async () => {
    setLoading(true);
    try {
      const [chemRes, poolRes, historyRes] = await Promise.all([
        getAllChemicals(),
        getAllPools(),
        getChemicalHistory()
      ]);
      
      // Debug logs
      console.log("Chemicals API response:", chemRes);
      console.log("Chemicals data:", chemRes?.data);
      console.log("Pools API response:", poolRes);
      console.log("History API response:", historyRes);
      
      // Xử lý kết quả an toàn
      const chemicalsData = Array.isArray(chemRes?.data) ? chemRes.data : 
                           (chemRes && typeof chemRes === 'object' ? (chemRes.data || []) : []);
      
      console.log("Processed chemicals data:", chemicalsData);
      
      setChemicals(chemicalsData);
      setPools(Array.isArray(poolRes?.data) ? poolRes.data : []);
      setAdjustmentHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
    } catch (error) {
      console.error("Error in reloadAll:", error);
      message.error('Không thể tải dữ liệu hóa chất hoặc lịch sử!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAll();
  }, []);

  // Lọc hóa chất theo tìm kiếm - với xử lý an toàn
  const filteredChemicals = React.useMemo(() => {
    console.log("Current chemicals state:", chemicals);
    
    if (!Array.isArray(chemicals)) {
      console.warn("chemicals is not an array:", chemicals);
      return [];
    }
    
    const filtered = chemicals.filter(chemical => {
      if (!chemical) return false;
      
      const nameMatch = chemical.chemicalName && 
        chemical.chemicalName.toLowerCase().includes(searchText.toLowerCase());
      
      const typeMatch = chemical.chemicalType && 
        chemical.chemicalType.toLowerCase().includes(searchText.toLowerCase());
      
      return nameMatch || typeMatch;
    });
    
    console.log("Filtered chemicals:", filtered);
    return filtered;
  }, [chemicals, searchText]);

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
      chemicalId: chemical.chemicalId,
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
      chemicalId: chemical.chemicalId,
      amount: 0,
      unit: chemical.unit
    });
    setIsRestockModalVisible(true);
  };

  // Thêm hóa chất mới
  const handleAddChemical = async () => {
    try {
      const values = await form.validateFields();
      const newChemical = {
        chemicalName: values.name,
        chemicalType: values.type,
        quantity: values.currentStock,
        unit: values.unit,
        minThreshold: values.minThreshold,
        reorderLevel: values.reorderLevel,
        chDescription: values.description
      };
      await addChemical(newChemical);
      message.success('Đã thêm hóa chất mới thành công!');
      setIsAddModalVisible(false);
      form.resetFields();
      await reloadAll();
    } catch (error) {
      message.error('Thêm hóa chất thất bại!');
    }
  };

  // Sử dụng hóa chất
  const handleAdjustChemical = async () => {
    try {
      const values = await form.validateFields();
      if (selectedChemical) {
        const pool = pools.find(pool => pool.poolsId === values.poolsId);
        const usageData = {
          chemicalId: selectedChemical.chemicalId,
          chemicalName: selectedChemical.chemicalName,
          poolId: pool ? pool.poolsId : 0,
          poolName: pool ? pool.poolName : "",
          quantity: values.amount,
          unit: selectedChemical.unit,
          adjustedBy: 1, // staffId thực tế nếu có
          cStatus: "Hoàn thành",
          note: values.note,
          action: "Sử dụng"
        };
        await applyChemical(usageData);
        setIsAdjustModalVisible(false);
        message.success('Đã điều chỉnh hóa chất thành công!');
        await reloadAll();
      }
    } catch (error) {
      message.error('Điều chỉnh hóa chất thất bại!');
    }
  };

  // Nạp thêm hóa chất
  const handleRestockChemical = async () => {
    try {
      const values = await form.validateFields();
      if (selectedChemical) {
        const restockData = {
          chemicalId: selectedChemical.chemicalId,
          chemicalName: selectedChemical.chemicalName,
          poolId: 0,
          poolName: "",
          quantity: values.amount,
          unit: selectedChemical.unit,
          adjustedBy: 1, // staffId thực tế nếu có
          cStatus: "Hoàn thành",
          note: values.note,
          action: "Nạp thêm"
        };
        await restockChemical(restockData);
        setIsRestockModalVisible(false);
        message.success('Đã nạp thêm hóa chất thành công!');
        await reloadAll();
      }
    } catch (error) {
      message.error('Nạp thêm hóa chất thất bại!');
    }
  };

  // Xóa hóa chất
  const handleDeleteChemical = (chemicalId: number) => {
    const hasUsageRecords = adjustmentHistory.some(
      record => record.chemicalId === chemicalId && record.action === "Sử dụng"
    );
    if (hasUsageRecords) {
      Modal.confirm({
        title: 'Cảnh báo',
        icon: <ExclamationCircleOutlined />,
        content: 'Hóa chất này đã được sử dụng trong lịch sử. Việc xóa sẽ ảnh hưởng đến dữ liệu lịch sử. Bạn vẫn muốn tiếp tục?',
        okText: 'Xóa',
        cancelText: 'Hủy',
        onOk: () => deleteChemicalAndHistory(chemicalId)
      });
    } else {
      deleteChemicalAndHistory(chemicalId);
    }
  };

  const deleteChemicalAndHistory = async (chemicalId: number) => {
    try {
      await deleteChemical(chemicalId);
      message.success('Đã xóa hóa chất thành công!');
      await reloadAll();
    } catch (error) {
      message.error('Xóa hóa chất thất bại!');
    }
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
      title: 'ID',
      dataIndex: 'chemicalId',
      key: 'id',
      width: 100,
      render: (text: string) => (
        <span className="text-xs text-gray-500 font-mono">
          {text?.length > 10 ? `${text.substring(0, 10)}...` : text}
        </span>
      ),
    },
    {
      title: 'Tên hóa chất',
      dataIndex: 'chemicalName',
      key: 'name',
    },
    {
      title: 'Loại',
      dataIndex: 'chemicalType',
      key: 'type',
    },
    {
      title: 'Số lượng hiện có',
      key: 'stock',
      render: (record: Chemical) => (
        <span>{record.quantity} {record.unit}</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: string, record: Chemical) => 
        renderStockStatus(record.quantity, record.minThreshold, record.reorderLevel),
    },
    {
      title: 'Ngưỡng tối thiểu',
      key: 'threshold',
      render: (_: string, record: Chemical) => (
        <div>
          <div className="text-sm">Tối thiểu: {record.minThreshold} {record.unit}</div>
          <div className="text-sm">Đặt lại: {record.reorderLevel} {record.unit}</div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'chDescription',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
      width: 200,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: string, record: Chemical) => (
        <Space size="middle">
          <Tooltip title="Sử dụng hóa chất">
            <Button
              icon={<EditOutlined />}
              type="primary"
              size="small"
              onClick={() => showAdjustModal(record)}
              className="bg-blue-500"
              ghost
            />
          </Tooltip>
          <Tooltip title="Nạp hóa chất">
            <Button 
              onClick={() => showRestockModal(record)} 
              icon={<PlusCircleOutlined />} 
              type="primary" 
              size="small"
              className="bg-green-600"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa hóa chất này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteChemical(record.chemicalId)}
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
      title: 'ID',
      dataIndex: 'historyId',
      key: 'id',
      width: 100,
      render: (text: string) => (
        <span className="text-xs text-gray-500 font-mono">
          {text && text.toString().length > 10 ? `${text.toString().substring(0, 10)}...` : text}
        </span>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'cTimestamp',
      key: 'timestamp',
      render: (timestamp: string | Date) => {
        try {
          const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
          return (
            <span>
              {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          );
        } catch (error) {
          return <span>Invalid date</span>;
        }
      },
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
        <Tag color={record.action === "Nạp thêm" ? 'green' : 'blue'}>
          {record.action}
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
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => quantity,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
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
          <Card className="mt-4 shadow-md overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table 
                columns={chemicalColumns} 
                dataSource={filteredChemicals}
                rowKey={record => record?.chemicalId?.toString() || Math.random().toString()}
                loading={loading}
                pagination={{ pageSize: 6 }}
                scroll={{ x: 'max-content' }}
                locale={{ emptyText: 'Không có dữ liệu hóa chất' }}
              />
            </div>
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
              rowKey="historyId"
              loading={loading}
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </div>
      ),
    }
  ];

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
        title={`Điều chỉnh ${selectedChemical?.chemicalName || 'hóa chất'}`}
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
                <strong>Tồn kho hiện tại:</strong> {selectedChemical.quantity} {selectedChemical.unit}
              </p>
            </div>
          )}
          <Form.Item
            name="poolsId"  // Thay vì poolId
            label="Hồ bơi"
            rules={[{ required: true, message: 'Vui lòng chọn hồ bơi!' }]}
          >
            <Select placeholder="Chọn hồ bơi">
              {pools.map(pool => (
                <Select.Option key={pool.poolsId} value={pool.poolsId}>{pool.poolName}</Select.Option>
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
                  if (value > selectedChemical.quantity) {
                    return Promise.reject(new Error('Lượng sử dụng không thể lớn hơn tồn kho!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber 
              min={0} 
              max={selectedChemical?.quantity || 0} 
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
        title={`Nạp thêm ${selectedChemical?.chemicalName || 'hóa chất'}`}
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
                <strong>Tồn kho hiện tại:</strong> {selectedChemical.quantity} {selectedChemical.unit}
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
