import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Select,
  Tabs,
  message,
  Tooltip,
  Progress,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  HistoryOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import type { Pool, Chemical, AdjustmentRecord } from "../../services/types";
import {
  addChemical,
  deleteChemical,
  restockChemical,
  getAllChemicals,
  getChemicalHistory,
  updateChemical,
  createChemicalUsageHistory,
} from "../../services/chemicalService";
import { getAllPools } from "../../services/poolService";
import { getCurrentUser } from "../../services/authService";

const InventoryStock: React.FC = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [pools, setPools] = useState<Pool[]>([]); // Thêm state pools
  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isRestockModalVisible, setIsRestockModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [actionFilter, setActionFilter] = useState<string | null>(null); // Thêm filter cho lịch sử

  const staffId = getCurrentUser()?.staffId || 0;

  // Tải dữ liệu hóa chất và hồ bơi
  const reloadAll = async () => {
    setLoading(true);
    try {
      const [chemRes, poolRes, historyRes] = await Promise.all([
        getAllChemicals(),
        getAllPools(),
        getChemicalHistory(),
      ]);

      // Xử lý kết quả an toàn
      setChemicals(Array.isArray(chemRes?.data) ? chemRes.data : []);
      setPools(Array.isArray(poolRes?.data) ? poolRes.data : []);
      setAdjustmentHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
    } catch (error) {
      console.error("Error in reloadAll:", error);
      message.error("Không thể tải dữ liệu hóa chất hoặc lịch sử!");
    } finally {
      setLoading(false);
    }
  };

  // Chỉ load dữ liệu một lần khi component mount và khi chuyển tab
  useEffect(() => {
    if (activeTab === 'inventory') {
      // Load danh sách hóa chất khi ở tab inventory
      getAllChemicals()
        .then((res) => {
          console.log("Chemicals data:", res?.data); // Debug để xem dữ liệu
          setChemicals(Array.isArray(res?.data) ? res.data : []);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading chemicals:", error);
          message.error("Không thể tải dữ liệu hóa chất!");
          setLoading(false);
        });

      // Load pools cùng lúc
      getAllPools()
        .then((res) => {
          setPools(Array.isArray(res?.data) ? res.data : []);
        })
        .catch((error) => {
          console.error("Error loading pools:", error);
        });
    } else if (activeTab === 'history') {
      // Load lịch sử khi ở tab history
      getChemicalHistory()
        .then((res) => {
          setAdjustmentHistory(Array.isArray(res?.data) ? res.data : []);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading history:", error);
          message.error("Không thể tải lịch sử hóa chất!");
          setLoading(false);
        });
    }
  }, [activeTab]);

  // Lọc hóa chất theo tìm kiếm
  const filteredChemicals = useMemo(() => {
    if (!Array.isArray(chemicals)) {
      return [];
    }

    return chemicals.filter((chemical) => {
      if (!chemical) return false;

      const nameMatch =
        chemical.chemicalName &&
        chemical.chemicalName.toLowerCase().includes(searchText.toLowerCase());

      const typeMatch =
        chemical.chemicalType &&
        chemical.chemicalType.toLowerCase().includes(searchText.toLowerCase());

      return nameMatch || typeMatch;
    });
  }, [chemicals, searchText]);

  // Filter lịch sử theo searchText và actionFilter
  const filteredHistory = useMemo(() => {
    return adjustmentHistory.filter(
      (record) => 
        (searchText === "" || 
          record.chemicalName.toLowerCase().includes(searchText.toLowerCase()) ||
          (record.poolName && record.poolName.toLowerCase().includes(searchText.toLowerCase()))) &&
        (actionFilter === null || record.action === actionFilter)
    ).sort((a, b) => new Date(b.cTimestamp || Date.now()).getTime() - new Date(a.cTimestamp || Date.now()).getTime());
  }, [adjustmentHistory, searchText, actionFilter]);

  // Hiển thị modal thêm hóa chất mới
  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  // Hiển thị modal chỉnh sửa
  const showEditModal = (chemical: Chemical) => {
    setSelectedChemical(chemical);
    form.resetFields();
    form.setFieldsValue({
      chemicalId: chemical.chemicalId,
      name: chemical.chemicalName,
      type: chemical.chemicalType,
      minThreshold: chemical.minThreshold,
      reorderLevel: chemical.reorderLevel,
      description: chemical.chDescription
    });
    setIsEditModalVisible(true);
  };
  // Xử lý cập nhật hóa chất
  const handleEditChemical = async () => {
    try {
      const values = await form.validateFields();
      if (selectedChemical) {
        const updatedChemical = {
          chemicalId: selectedChemical.chemicalId,
          chemicalName: values.name,
          chemicalType: values.type,
          quantity: selectedChemical.quantity,
          unit: selectedChemical.unit,
          minThreshold: values.minThreshold,
          reorderLevel: values.reorderLevel,
          chDescription: values.description,
        };
        
        await updateChemical(updatedChemical);
        message.success("Đã cập nhật thông tin hóa chất thành công!");
        setIsEditModalVisible(false);
        await reloadAll();
      }
    } catch (error) {
      message.error("Cập nhật thông tin hóa chất thất bại!");
    }
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
        chDescription: values.description,
      };
      await addChemical(newChemical);
      message.success("Đã thêm hóa chất mới thành công!");
      setIsAddModalVisible(false);
      form.resetFields();
      await reloadAll();
    } catch (error) {
      message.error("Thêm hóa chất thất bại!");
    }
  };

  // Nạp thêm hóa chất
  const handleRestockChemical = async () => {
    try {
      const values = await form.validateFields();
      if (selectedChemical) {
        // Gọi API nạp thêm hóa chất
        await restockChemical({
          chemicalId: selectedChemical.chemicalId,
          quantity: values.amount
        });
        
        // Tạo lịch sử sử dụng
        await createChemicalUsageHistory({
          chemicalId: selectedChemical.chemicalId,
          chemicalName: selectedChemical.chemicalName,
          poolId: 0,
          poolName: "",
          quantity: values.amount,
          unit: selectedChemical.unit,
          adjustedBy: staffId,
          note: values.note || "Nạp thêm hóa chất",
          action: "Nạp thêm",
        });

        setIsRestockModalVisible(false);
        message.success("Đã nạp thêm hóa chất thành công!");
        await reloadAll();
      }
    } catch (error) {
      message.error("Nạp thêm hóa chất thất bại!");
    }
  };

  // Xóa hóa chất
  const handleDeleteChemical = (chemicalId: number) => {
    const hasUsageRecords = adjustmentHistory.some(
      (record) =>
        record.chemicalId === chemicalId && record.action === "Sử dụng"
    );
    if (hasUsageRecords) {
      Modal.confirm({
        title: "Cảnh báo",
        icon: <ExclamationCircleOutlined />,
        content:
          "Hóa chất này đã được sử dụng trong lịch sử. Việc xóa sẽ ảnh hưởng đến dữ liệu lịch sử. Bạn vẫn muốn tiếp tục?",
        okText: "Xóa",
        cancelText: "Hủy",
        onOk: () => deleteChemicalAndHistory(chemicalId),
      });
    } else {
      deleteChemicalAndHistory(chemicalId);
    }
  };

  const deleteChemicalAndHistory = async (chemicalId: number) => {
    try {
      await deleteChemical(chemicalId);
      message.success("Đã xóa hóa chất thành công!");
      await reloadAll();
    } catch (error) {
      message.error("Xóa hóa chất thất bại!");
    }
  };

  // Hiển thị trạng thái tồn kho
  const renderStockStatus = (current: number, min: number, reorder: number) => {
    let color = "green";
    let status = "Đầy đủ";
    if (current <= min) {
      color = "red";
      status = "Thấp";
    } else if (current <= reorder) {
      color = "orange";
      status = "Cần đặt thêm";
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
        <Tag color={color} style={{ marginTop: "8px" }}>
          {status}
        </Tag>
      </div>
    );
  };

  // Cấu hình cột bảng hóa chất
  const chemicalColumns = [
    {
      title: "ID",
      dataIndex: "chemicalId",
      key: "id",
      width: 100,
      render: (text: string) => (
        <span className="text-xs text-gray-500 font-mono">
          {text?.length > 10 ? `${text.substring(0, 10)}...` : text}
        </span>
      ),
    },
    {
      title: "Tên hóa chất",
      dataIndex: "chemicalName",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "chemicalType",
      key: "type",
    },
    {
      title: "Số lượng hiện có",
      key: "stock",
      render: (record: Chemical) => (
        <span>
          {record.quantity} {record.unit}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: string, record: Chemical) =>
        renderStockStatus(
          record.quantity,
          record.minThreshold,
          record.reorderLevel
        ),
    },
    {
      title: "Ngưỡng tối thiểu",
      key: "threshold",
      render: (_: string, record: Chemical) => (
        <div>
          <div className="text-sm">
            Tối thiểu: {record.minThreshold} {record.unit}
          </div>
          <div className="text-sm">
            Đặt lại: {record.reorderLevel} {record.unit}
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "chDescription",
      key: "description",
      width: 100,
      render: (text: string | undefined) =>
        text ? (
          <Tooltip title={text}>
            <InfoCircleOutlined style={{ cursor: "pointer" }} />
          </Tooltip>
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: string, record: Chemical) => (
        <Space size="middle">
          {/* Xóa nút Điều chỉnh/Sử dụng hóa chất */}
          <Tooltip title="Nạp thêm hóa chất">
            <Button
              onClick={() => {
                setSelectedChemical(record);
                form.resetFields();
                setIsRestockModalVisible(true);
              }}
              icon={<PlusCircleOutlined />}
              type="primary"
              size="small"
              className="bg-green-600"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin hóa chất">
            <Button
              onClick={() => showEditModal(record)}
              icon={<EditOutlined />}
              type="default"
              size="small"
              className="bg-yellow-500"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa hóa chất này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteChemical(record.chemicalId)}
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Cấu hình cột bảng lịch sử
  const historyColumns = [
    {
      title: "ID",
      dataIndex: "historyId",
      key: "id",
      width: 100,
      render: (text: string) => (
        <span className="text-xs text-gray-500 font-mono">
          {text && text.toString().length > 10
            ? `${text.toString().substring(0, 10)}...`
            : text}
        </span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "cTimestamp",
      key: "timestamp",
      render: (timestamp: string | Date) => {
        try {
          const date =
            typeof timestamp === "string" ? new Date(timestamp) : timestamp;
          return (
            <span>
              {date.toLocaleDateString()}{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          );
        } catch (error) {
          return <span>Invalid date</span>;
        }
      },
    },
    {
      title: "Hóa chất",
      dataIndex: "chemicalName",
      key: "chemicalName",
    },
    {
      title: "Loại thao tác",
      key: "actionType",
      render: (_: unknown, record: AdjustmentRecord) => (
        <Tag color={record.action === "Nạp thêm" ? "green" : "blue"}>
          {record.action}
        </Tag>
      ),
    },
    {
      title: "Hồ bơi",
      dataIndex: "poolName",
      key: "poolName",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => quantity,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Người thực hiện",
      dataIndex: "adjustedBy",
      key: "adjustedBy",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string) => note || "-",
    },
  ];

  const items = [
    {
      key: "inventory",
      label: (
        <span>
          <InfoCircleOutlined /> Tồn kho hóa chất
        </span>
      ),
      children: (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <Input
              placeholder="Tìm kiếm hóa chất..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
                rowKey={(record) =>
                  record?.chemicalId?.toString() || Math.random().toString()
                }
                loading={loading}
                pagination={{ pageSize: 6 }}
                scroll={{ x: "max-content" }}
                locale={{ emptyText: "Không có dữ liệu hóa chất" }}
              />
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: "history",
      label: (
        <span>
          <HistoryOutlined /> Lịch sử thao tác
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Tìm kiếm theo hóa chất hoặc hồ bơi..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full md:w-64"
            />
            <Select
              placeholder="Lọc theo loại thao tác"
              style={{ width: 180 }}
              value={actionFilter}
              onChange={(value) => setActionFilter(value)}
              allowClear
            >
              <Select.Option value="Sử dụng">Sử dụng</Select.Option>
              <Select.Option value="Nạp thêm">Nạp thêm</Select.Option>
            </Select>
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
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Quản lý hóa chất hồ bơi
        </h1>
        <p className="text-gray-600">
          Theo dõi tồn kho và điều chỉnh hóa chất cho các hồ bơi
        </p>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
      
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
            rules={[{ required: true, message: "Vui lòng nhập tên hóa chất!" }]}
          >
            <Input placeholder="Nhập tên hóa chất" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại hóa chất"
            rules={[
              { required: true, message: "Vui lòng chọn loại hóa chất!" },
            ]}
          >
            <Select placeholder="Chọn loại hóa chất">
              <Select.Option value="Chất khử trùng">
                Chất khử trùng
              </Select.Option>
              <Select.Option value="Điều chỉnh pH">Điều chỉnh pH</Select.Option>
              <Select.Option value="Diệt tảo">Diệt tảo</Select.Option>
              <Select.Option value="Điều chỉnh độ cứng">
                Điều chỉnh độ cứng
              </Select.Option>
              <Select.Option value="Làm trong nước">
                Làm trong nước
              </Select.Option>
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="currentStock"
              label="Số lượng hiện có"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Nhập số lượng"
              />
            </Form.Item>
            <Form.Item
              name="unit"
              label="Đơn vị"
              rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
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
              rules={[
                { required: true, message: "Vui lòng nhập ngưỡng tối thiểu!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Ngưỡng tối thiểu"
              />
            </Form.Item>
            <Form.Item
              name="reorderLevel"
              label="Mức đặt lại"
              rules={[
                { required: true, message: "Vui lòng nhập mức đặt lại!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Mức đặt lại"
              />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả về hóa chất" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Modal chỉnh sửa thông tin hóa chất */}
      <Modal
        title={`Chỉnh sửa thông tin ${selectedChemical?.chemicalName || "hóa chất"}`}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleEditChemical}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="chemicalId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên hóa chất"
            rules={[{ required: true, message: "Vui lòng nhập tên hóa chất!" }]}
          >
            <Input placeholder="Nhập tên hóa chất" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại hóa chất"
            rules={[
              { required: true, message: "Vui lòng chọn loại hóa chất!" },
            ]}
          >
            <Select placeholder="Chọn loại hóa chất">
              <Select.Option value="Chất khử trùng">
                Chất khử trùng
              </Select.Option>
              <Select.Option value="Điều chỉnh pH">Điều chỉnh pH</Select.Option>
              <Select.Option value="Diệt tảo">Diệt tảo</Select.Option>
              <Select.Option value="Điều chỉnh độ cứng">
                Điều chỉnh độ cứng
              </Select.Option>
              <Select.Option value="Làm trong nước">
                Làm trong nước
              </Select.Option>
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="minThreshold"
              label="Ngưỡng tối thiểu"
              rules={[
                { required: true, message: "Vui lòng nhập ngưỡng tối thiểu!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Ngưỡng tối thiểu"
                addonAfter={selectedChemical?.unit}
              />
            </Form.Item>
            <Form.Item
              name="reorderLevel"
              label="Mức đặt lại"
              rules={[
                { required: true, message: "Vui lòng nhập mức đặt lại!" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Mức đặt lại"
                addonAfter={selectedChemical?.unit}
              />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả về hóa chất" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Modal nạp thêm hóa chất */}
      <Modal
        title={`Nạp thêm ${selectedChemical?.chemicalName || "hóa chất"}`}
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
                <strong>Tồn kho hiện tại:</strong> {selectedChemical.quantity}{" "}
                {selectedChemical.unit}
              </p>
            </div>
          )}
          <Form.Item
            name="amount"
            label="Số lượng nạp thêm"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng nạp thêm!" },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng nạp thêm"
              addonAfter={selectedChemical?.unit}
            />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú về việc nạp thêm"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryStock;
