import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Badge, Select, DatePicker, Button, Alert, Tooltip, message, Modal, InputNumber } from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  InfoCircleOutlined, WarningOutlined, AlertOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';
import { getWaterQualityHistory, updateWaterQualityResolved } from '../../services/waterQualityService';
import { getAllPools } from '../../services/poolService';
import { getAllStaff } from '../../services/staffService'; // Đảm bảo có hàm này
import type { Pool, WaterQualityRecord, Chemical } from '../../services/types';
import { 
  getAllChemicals, 
  applyMultipleChemicalsForPool, 
  createChemicalUsageHistory 
} from '../../services/chemicalService'; // Lấy danh sách hóa chất
import { getCurrentUser } from '../../services/authService';

const { Option } = Select;
const { RangePicker } = DatePicker;



const WaterQualityRecords: React.FC = () => {
  const [records, setRecords] = useState<WaterQualityRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<WaterQualityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showOnlyExceeded, setShowOnlyExceeded] = useState<boolean>(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [staffMap, setStaffMap] = useState<Record<number, string>>({});
  
  // Ngưỡng tiêu chuẩn cho các thông số
  const standards = {
    pH: { min: 7, max: 7.6 },
    chlorine: { min: 0.5, max: 3.0 },
    temperature: { min: 26.0, max: 32.0 }
  };

  const staffId = getCurrentUser()?.staffId; // Lấy staffId từ user hiện tại

  // Thêm vào đầu component WaterQualityRecords
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WaterQualityRecord | null>(null);
  const [selectedChemicals, setSelectedChemicals] = useState<Array<{
    chemicalId: number;
    amount: number;
    chemicalName?: string;
    unit?: string;
  }>>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]); // Lấy từ API kho hóa chất
  const [selectedChemicalId, setSelectedChemicalId] = useState<number | undefined>(undefined); // State mới để lưu hóa chất đang chọn

  // Lấy danh sách hồ bơi từ API
  useEffect(() => {
    const fetchPools = async () => {
      try {
        const poolsResponse = await getAllPools();
        setPools(poolsResponse.data);
      } catch (error) {
        console.error('Không thể tải danh sách hồ bơi:', error);
        message.error('Không thể tải danh sách hồ bơi');
      }
    };

    fetchPools();
  }, []);

  // Lấy dữ liệu chất lượng nước từ API
  const reloadRecords = async () => {
    try {
      setLoading(true);
      
      // Tạo bộ lọc cho API từ state
      // Đảm bảo startDate và endDate không phải là null khi truyền vào API
      const filters: {
        poolId?: number;
        startDate?: Date;
        endDate?: Date;
      } = {};
      if (selectedPool !== 'all') {
        filters.poolId = parseInt(selectedPool);
      }
      if (dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0] || undefined;
        filters.endDate = dateRange[1] || undefined;
      }
      
      const data = await getWaterQualityHistory(filters);
      setRecords(data);
      setFilteredRecords(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu chất lượng nước:', error);
      message.error('Không thể tải dữ liệu chất lượng nước');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPool, dateRange]);

  // Lấy danh sách nhân viên và tạo map staffId -> fullName
  useEffect(() => {
    getAllStaff().then((staffList: Array<{ staffId: number; fullName: string }>) => {
      const map: Record<number, string> = {};
      staffList.forEach((staff: { staffId: number; fullName: string }) => {
        map[staff.staffId] = staff.fullName;
      });
      setStaffMap(map);
    });
  }, []);

  // Áp dụng bộ lọc trạng thái và lọc vượt ngưỡng trên dữ liệu client
  useEffect(() => {
    let result = [...records];
    
    // Lọc theo trạng thái
    if (selectedStatus !== 'all') {
      result = result.filter(record => record.rStatus === selectedStatus);
    }
    
    // Lọc để chỉ hiển thị các giá trị vượt ngưỡng nếu được chọn
    if (showOnlyExceeded) {
      result = result.filter(record => record.needsAction);
    }
    
    setFilteredRecords(result);
  }, [selectedStatus, showOnlyExceeded, records]);


  // Kiểm tra giá trị pH
  const checkPHStatus = (value: number) => {
    if (value < standards.pH.min) return 'low';
    if (value > standards.pH.max) return 'high';
    return 'normal';
  };

  // Kiểm tra giá trị Chlorine
  const checkChlorineStatus = (value: number) => {
    if (value < standards.chlorine.min) return 'low';
    if (value > standards.chlorine.max) return 'high';
    return 'normal';
  };

  // Định dạng giá trị pH để hiển thị với màu sắc phù hợp
  const renderPHValue = (value: number) => {
    const rStatus = checkPHStatus(value);
    const color = rStatus === 'normal' ? 'green' : (status === 'high' ? 'red' : 'orange');
    
    return (
      <span style={{ color, fontWeight: status !== 'normal' ? 'bold' : 'normal' }}>
        {value.toFixed(1)}
      </span>
    );
  };

  // Định dạng giá trị Chlorine để hiển thị với màu sắc phù hợp
  const renderChlorineValue = (value: number) => {
    const status = checkChlorineStatus(value);
    const color = status === 'normal' ? 'green' : (status === 'high' ? 'red' : 'orange');
    
    return (
      <span style={{ color, fontWeight: status !== 'normal' ? 'bold' : 'normal' }}>
        {value.toFixed(1)} mg/L
      </span>
    );
  };

  // Định nghĩa các cột trong bảng
  const columns: TableColumnsType<WaterQualityRecord> = [
    {
      title: 'ID',
      dataIndex: 'parameterId',
      key: 'parameterId',
      width: 80,
    },
    {
      title: 'Hồ bơi',
      dataIndex: 'poolName',
      key: 'poolName',
    },
    {
      title: 'pH đã đo',
      key: 'pHLevel',
      render: (_, record) => renderPHValue(record.pHLevel),
      sorter: (a, b) => a.pHLevel - b.pHLevel,
    },
    {
      title: 'Clo đã đo',
      key: 'chlorineMgPerL',
      render: (_, record) => renderChlorineValue(record.chlorineMgPerL),
      sorter: (a, b) => a.chlorineMgPerL - b.chlorineMgPerL,
    },
    {
      title: 'Nhiệt độ đã đo',
      key: 'temperatureC',
      render: (_, record) => {
        // Kiểm tra trạng thái của nhiệt độ
        let status = 'normal';
        if (record.temperatureC < standards.temperature.min) {
          status = 'low';
        } else if (record.temperatureC > standards.temperature.max) {
          status = 'high';
        }
        
        // Chọn màu sắc phù hợp
        const color = status === 'normal' ? 'green' : (status === 'high' ? 'red' : 'blue');
        
        return (
          <span style={{ color, fontWeight: status !== 'normal' ? 'bold' : 'normal' }}>
            {record.temperatureC.toFixed(1)} °C
          </span>
        );
      },
      sorter: (a, b) => a.temperatureC - b.temperatureC,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        let color = '';
        let text = '';
        let icon = null;
        switch(record.rStatus) {
          case 'normal':
            color = 'green';
            text = 'Bình thường';
            icon = <CheckCircleOutlined />;
            break;
          case 'warning':
            color = 'orange';
            text = 'Cảnh báo';
            icon = <WarningOutlined />;
            break;
          case 'critical':
            color = 'red';
            text = 'Nguy hiểm';
            icon = <AlertOutlined />;
            break;
          default:
            color = 'default';
            text = 'Không xác định';
        }
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'pTimestamp',
      key: 'pTimestamp',
      render: (timestamp: Date) => (
        <span>{new Date(timestamp).toLocaleString('vi-VN')}</span>
      ),
      sorter: (a, b) => new Date(a.pTimestamp).getTime() - new Date(b.pTimestamp).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Người đo',
      key: 'createdBy',
      render: (_, record) =>
        staffMap[record.createdBy ?? 0] || record.createdBy || 'Không xác định',
    },
    {
      title: 'Xử lý',
      key: 'resolution',
      render: (_, record) => {
        if (record.resolved) {
          return (
            <Badge 
              status="success"
              text="Đã xử lý"
            />
          );
        }
        if (record.needsAction) {
          return (
            <Badge 
              status="processing"
              text="Chưa xử lý"
            />
          );
        }
        return <span>-</span>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string | undefined) => (
        notes ? (
          <Tooltip title={notes}>
            <InfoCircleOutlined style={{ cursor: 'pointer' }} />
          </Tooltip>
        ) : <span>-</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        // Nếu đã được xử lý (resolved = true), không hiển thị nút "Xử lý"
        if (record.resolved) {
          return null;
        }
        
        // Chỉ hiển thị nút "Xử lý" khi chưa được xử lý và cần xử lý
        if (record.needsAction) {
          return (
            <Button 
              type="primary" 
              onClick={() => showProcessModal(record)}
            >
              Xử lý
            </Button>
          );
        }
        
        // Trường hợp không cần xử lý
        return <span>-</span>;
      },
    },
  ];

  // Đếm số lượng vấn đề chưa xử lý
  const unresolvedCount = filteredRecords.filter(r => r.needsAction && !r.resolved).length;

  // Khi mở modal xử lý
  const showProcessModal = (record: WaterQualityRecord) => {
    setSelectedRecord(record);
    setSelectedChemicals([]); // Reset danh sách hóa chất đã chọn
    setIsProcessModalVisible(true);
  };

  // Thêm useEffect để load danh sách hóa chất khi mở modal
  useEffect(() => {
    if (isProcessModalVisible) {
      // Load danh sách hóa chất
      getAllChemicals()
        .then(res => {
          if (res && res.data) {
            setChemicals(res.data);
          }
        })
        .catch(error => {
          console.error("Error loading chemicals:", error);
          message.error("Không thể tải danh sách hóa chất");
        });
    }
  }, [isProcessModalVisible]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Theo dõi chất lượng nước</h1>
        {unresolvedCount > 0 && (
          <Badge count={unresolvedCount} overflowCount={99}>
            <Tag color="red" icon={<AlertOutlined />}>
              Có {unresolvedCount} trạng thái cần xử lý
            </Tag>
          </Badge>
        )}
      </div>
      
      <Alert
        message="Thông tin về tiêu chuẩn chất lượng nước"
        description={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-bold">pH:</span> {standards.pH.min} - {standards.pH.max}
            </div>
            <div>
              <span className="font-bold">Clo:</span> {standards.chlorine.min} - {standards.chlorine.max} mg/L
            </div>
            <div>
              <span className="font-bold">Nhiệt độ:</span> {standards.temperature.min} - {standards.temperature.max} °C
            </div>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />
      
      <Card title="Bộ lọc" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hồ bơi</label>
            <Select
              className="w-full"
              value={selectedPool}
              onChange={setSelectedPool}
              loading={loading}
            >
              <Option value="all">Tất cả hồ bơi</Option>
              {pools.map(pool => (
                <Option key={pool.poolsId.toString()} value={pool.poolsId.toString()}>
                  {pool.poolName}
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <Select
              className="w-full"
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="normal">Bình thường</Option>
              <Option value="warning">Cảnh báo</Option>
              <Option value="critical">Nguy hiểm</Option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
            <RangePicker 
              className="w-full"
              onChange={(dates) => {
                if (dates) {
                  const startDate = dates[0]?.toDate() || null;
                  const endDate = dates[1]?.toDate() || null;
                  setDateRange([startDate, endDate]);
                } else {
                  setDateRange([null, null]);
                }
              }}
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              type="primary" 
              className="mr-2"
              onClick={() => {
                setSelectedPool('all');
                setSelectedStatus('all');
                setDateRange([null, null]);
                setShowOnlyExceeded(false);
              }}
            >
              Đặt lại bộ lọc
            </Button>
            <Button 
              type={showOnlyExceeded ? 'primary' : 'default'}
              onClick={() => setShowOnlyExceeded(!showOnlyExceeded)}
            >
              {showOnlyExceeded ? 'Hiện tất cả' : 'Chỉ hiện cần xử lý'}
            </Button>
          </div>
        </div>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table 
            columns={columns}
            dataSource={filteredRecords}
            rowKey="parameterId"
            loading={loading}
            rowClassName={(record) => record.needsAction && !record.resolved ? 'bg-red-50' : ''}
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true, 
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} kết quả đo` 
            }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>

      <Modal
        title="Xử lý chỉ số bất thường"
        open={isProcessModalVisible}
        onCancel={() => setIsProcessModalVisible(false)}
        onOk={async () => {
          if (selectedChemicals.length === 0 || !selectedRecord) {
            message.error("Vui lòng chọn ít nhất một hóa chất!");
            return;
          }
          
          try {
            // Kiểm tra số lượng tồn trước
            for (const item of selectedChemicals) {
              const selectedChemical = chemicals.find(c => c.chemicalId === item.chemicalId);
              if (!selectedChemical) {
                message.error(`Không tìm thấy hóa chất ID: ${item.chemicalId}`);
                return;
              }
              
              if (item.amount > selectedChemical.quantity) {
                message.error(`Số lượng ${selectedChemical.chemicalName} vượt quá tồn kho!`);
                return;
              }
            }
            
            // Gọi API một lần duy nhất với tất cả hóa chất
            await applyMultipleChemicalsForPool({
              chemicals: selectedChemicals.map(item => ({
                chemicalId: item.chemicalId,
                quantity: item.amount
              }))
            });
            
            // ===== Tạo lịch sử sử dụng cho từng hóa chất =====
            for (const item of selectedChemicals) {
              const selectedChemical = chemicals.find(c => c.chemicalId === item.chemicalId);
              if (!selectedChemical) continue;
              
              // Gọi API tạo lịch sử sử dụng hóa chất
              await createChemicalUsageHistory({
                historyId: 0,
                chemicalId: item.chemicalId,
                chemicalName: selectedChemical.chemicalName,
                poolId: selectedRecord.poolId,
                poolName: selectedRecord.poolName,
                quantity: item.amount,
                unit: selectedChemical.unit,
                adjustedBy: staffId ?? 0,
                note: `Xử lý chỉ số bất thường, Lịch sử đo ID: ${selectedRecord.parameterId}`,
                action: "Sử dụng"
              });
            }
            
            message.success("Đã xử lý và cập nhật kho!");
            setIsProcessModalVisible(false);
            
            // Cập nhật trạng thái bản ghi đo nếu cần
            if (selectedRecord && updateWaterQualityResolved) {
              await updateWaterQualityResolved(selectedRecord.parameterId, {
                resolved: true,
                resolvedBy: staffId ?? 0
              });
            }
            
            // Reload data
            if (reloadRecords) {
              reloadRecords();
            }
          } catch (error) {
            message.error("Xử lý thất bại: " + (error instanceof Error ? error.message : String(error)));
          }
        }}
        okText="Xác nhận xử lý"
        cancelText="Hủy"
      >
        <div className="mb-4">
          <h3 className="mb-2">Thêm hóa chất</h3>
          
          {/* Phần chọn và thêm hóa chất mới */}
          <div className="flex space-x-2 mb-4">
            <Select
              style={{ width: "70%" }}
              placeholder="Chọn hóa chất"
              value={selectedChemicalId}  // Thêm state mới để lưu hóa chất đang chọn
              onChange={(value) => setSelectedChemicalId(value)}
              showSearch
              optionFilterProp="children"
            >
              {chemicals
                .filter(c => !selectedChemicals.some(sc => sc.chemicalId === c.chemicalId))
                .map(chemical => (
                  <Select.Option key={chemical.chemicalId} value={chemical.chemicalId}>
                    {chemical.chemicalName} (Tồn: {chemical.quantity} {chemical.unit})
                  </Select.Option>
                ))
              }
            </Select>
                        <Button 
                          type="primary"
                          onClick={() => {
                            if (selectedChemicalId) {
                              const chemical = chemicals.find(c => c.chemicalId === selectedChemicalId);
                              if (chemical) {
                                setSelectedChemicals([
                                  ...selectedChemicals,
                                  {
                                    chemicalId: chemical.chemicalId,
                                    amount: 1,
                                    chemicalName: chemical.chemicalName,
                                    unit: chemical.unit
                                  }
                                ]);
                                setSelectedChemicalId(undefined);
                              }
                            } else {
                              message.warning('Vui lòng chọn hóa chất');
                            }
                          }}
                        >
                          Thêm
                        </Button>
                      </div>
            
                      {/* Danh sách hóa chất đã chọn */}
                      {selectedChemicals.map((item, index) => (
                        <div key={index} className="flex items-center mb-2 p-2 border rounded">
                          <div className="flex-1">{item.chemicalName} ({item.unit})</div>
                          <InputNumber
                            min={0.1}
                            step={0.1}
                            value={item.amount}
                            onChange={value => {
                              const updatedChemicals = [...selectedChemicals];
                              updatedChemicals[index].amount = Number(value || 0);
                              setSelectedChemicals(updatedChemicals);
                            }}
                            style={{ width: 100 }}
                          />
                          <Button 
                            danger 
                            type="text"
                            onClick={() => {
                              const updatedChemicals = selectedChemicals.filter((_, i) => i !== index);
                              setSelectedChemicals(updatedChemicals);
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Modal>
                </div>
              );
            };
            
            export default WaterQualityRecords;
