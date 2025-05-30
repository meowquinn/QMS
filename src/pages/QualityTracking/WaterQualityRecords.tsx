import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Badge, Select, DatePicker, Button, Alert, Tooltip, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  InfoCircleOutlined, WarningOutlined, AlertOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';
import { getWaterQualityHistory, updateWaterQualityNotes } from '../../services/waterQualityService';
import { getAllPools } from '../../services/poolService';
import type { Pool } from '../../services/types';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Define measurement status
type MeasurementStatus = 'normal' | 'warning' | 'critical';

// Định nghĩa kiểu dữ liệu cho bản ghi đo chất lượng nước
interface WaterQualityRecord {
  parameterId: number;
  poolId: number;
  poolName: string;
  pHLevel: number;
  chlorineMgPerL: number;
  temperatureC: number;
  pTimestamp: Date;
  status: MeasurementStatus;
  createdById?: number;
  createdByName?: string;
  resolved: boolean;
  notes?: string;
  needsAction: boolean;
}

const WaterQualityRecords: React.FC = () => {
  const [records, setRecords] = useState<WaterQualityRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<WaterQualityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showOnlyExceeded, setShowOnlyExceeded] = useState<boolean>(false);
  const [pools, setPools] = useState<Pool[]>([]);
  
  // Ngưỡng tiêu chuẩn cho các thông số
  const standards = {
    pH: { min: 7, max: 7.6 },
    chlorine: { min: 0.5, max: 3.0 },
    temperature: { min: 26.0, max: 32.0 }
  };

  // Lấy danh sách hồ bơi từ API
  useEffect(() => {
    const fetchPools = async () => {
      try {
        const poolsData = await getAllPools();
        setPools(poolsData);
      } catch (error) {
        console.error('Không thể tải danh sách hồ bơi:', error);
        message.error('Không thể tải danh sách hồ bơi');
      }
    };

    fetchPools();
  }, []);

  // Lấy dữ liệu chất lượng nước từ API
  useEffect(() => {
    const fetchWaterQualityData = async () => {
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

    fetchWaterQualityData();
  }, [selectedPool, dateRange]);

  // Áp dụng bộ lọc trạng thái và lọc vượt ngưỡng trên dữ liệu client
  useEffect(() => {
    let result = [...records];
    
    // Lọc theo trạng thái
    if (selectedStatus !== 'all') {
      result = result.filter(record => record.status === selectedStatus);
    }
    
    // Lọc để chỉ hiển thị các giá trị vượt ngưỡng nếu được chọn
    if (showOnlyExceeded) {
      result = result.filter(record => record.needsAction);
    }
    
    setFilteredRecords(result);
  }, [selectedStatus, showOnlyExceeded, records]);

  // Xử lý đánh dấu đã xử lý
  const handleResolveIssue = async (parameterId: number) => {
    try {
      // Tìm bản ghi cần cập nhật để lấy ghi chú hiện tại
      const recordToUpdate = records.find(r => r.parameterId === parameterId);
      if (!recordToUpdate) return;

      // Thêm ghi chú về việc đã xử lý
      const updatedNotes = recordToUpdate.notes 
        ? `${recordToUpdate.notes}\n[${new Date().toLocaleString()}] Đã xử lý vấn đề.` 
        : `[${new Date().toLocaleString()}] Đã xử lý vấn đề.`;

      // Gọi API để cập nhật ghi chú
      await updateWaterQualityNotes(parameterId, updatedNotes);

      // Cập nhật state cục bộ
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.parameterId === parameterId 
            ? { ...record, resolved: true, notes: updatedNotes } 
            : record
        )
      );

      message.success('Đã đánh dấu bản ghi là đã xử lý');
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      message.error('Không thể cập nhật trạng thái bản ghi');
    }
  };

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
    const status = checkPHStatus(value);
    const color = status === 'normal' ? 'green' : (status === 'high' ? 'red' : 'orange');
    
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
        if (!record.needsAction) {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Bình thường</Tag>;
        }

        let color = '';
        let text = '';
        let icon = null;
        
        switch(record.status) {
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
      key: 'createdByName',
      render: (_, record) => record.createdByName || 'Không xác định',
    },
    {
      title: 'Xử lý',
      key: 'resolution',
      render: (_, record) => {
        if (!record.needsAction) {
          return <span>-</span>;
        }
        return (
          <Badge 
            status={record.resolved ? 'success' : 'processing'} 
            text={record.resolved ? 'Đã xử lý' : 'Chưa xử lý'} 
          />
        );
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
        if (!record.needsAction || record.resolved) {
          return null;
        }
        
        return (
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleResolveIssue(record.parameterId)}
          >
            Đánh dấu đã xử lý
          </Button>
        );
      },
    },
  ];

  // Đếm số lượng vấn đề chưa xử lý
  const unresolvedCount = filteredRecords.filter(r => r.needsAction && !r.resolved).length;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Theo dõi chất lượng nước</h1>
        {unresolvedCount > 0 && (
          <Badge count={unresolvedCount} overflowCount={99}>
            <Tag color="red" icon={<AlertOutlined />}>
              Có {unresolvedCount} chỉ số cần xử lý
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
    </div>
  );
};

export default WaterQualityRecords;
