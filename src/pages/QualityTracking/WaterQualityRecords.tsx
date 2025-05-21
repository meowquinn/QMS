import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Badge, Select, DatePicker, Button, Alert, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  InfoCircleOutlined, WarningOutlined, AlertOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';


const { Option } = Select;
const { RangePicker } = DatePicker;

// Define measurement status
type MeasurementStatus = 'normal' | 'warning' | 'critical';

// Định nghĩa kiểu dữ liệu cho bản ghi đo chất lượng nước
interface WaterQualityRecord {
  id: string;
  poolId: string;
  poolName: string;
  pHValue: number;
  chlorineValue: number;
  temperatureValue: number;
  timestamp: Date;
  status: MeasurementStatus;
  measuredBy: string;
  resolved: boolean;
  notes?: string;
  needsAction: boolean; // Có cần xử lý không (pH hoặc Clo vượt ngưỡng)
}

const QualityMeasurements: React.FC = () => {
  const [records, setRecords] = useState<WaterQualityRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<WaterQualityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showOnlyExceeded, setShowOnlyExceeded] = useState<boolean>(false);
  
  // Dữ liệu mẫu về hồ bơi
  const pools = [
    { id: 'pool1', name: 'Hồ bơi chính' },
    { id: 'pool2', name: 'Hồ bơi trẻ em' },
    { id: 'pool3', name: 'Hồ bơi spa' },
  ];

  // Ngưỡng tiêu chuẩn cho các thông số
  const standards = {
    pH: { min: 7, max: 7.6 },
    chlorine: { min: 0.5, max: 3.0 },
    temperature: { min: 26.0, max: 32.0 }
  };

  // Dữ liệu mẫu cho các bản ghi đo
  useEffect(() => {
    // Giả lập API call để lấy dữ liệu
    setTimeout(() => {
      const mockRecords: WaterQualityRecord[] = [
        {
          id: '1',
          poolId: 'pool1',
          poolName: 'Hồ bơi chính',
          pHValue: 8.1,
          chlorineValue: 2.5,
          temperatureValue: 28.5,
          timestamp: new Date(2025, 4, 18, 9, 30),
          status: 'warning',
          measuredBy: 'Nguyễn Văn A',
          resolved: false,
          notes: 'pH cao, cần điều chỉnh xuống',
          needsAction: true
        },
        {
          id: '2',
          poolId: 'pool1',
          poolName: 'Hồ bơi chính',
          pHValue: 7.4,
          chlorineValue: 1.8,
          temperatureValue: 28.0,
          timestamp: new Date(2025, 4, 17, 15, 45),
          status: 'normal',
          measuredBy: 'Trần Thị B',
          resolved: false,
          notes: '',
          needsAction: false
        },
        {
          id: '3',
          poolId: 'pool2',
          poolName: 'Hồ bơi trẻ em',
          pHValue: 6.8,
          chlorineValue: 0.6,
          temperatureValue: 29.5,
          timestamp: new Date(2025, 4, 18, 8, 15),
          status: 'critical',
          measuredBy: 'Lê Văn C',
          resolved: false,
          notes: 'pH thấp và chlorine thấp, cần điều chỉnh gấp',
          needsAction: true
        },
        {
          id: '4',
          poolId: 'pool2',
          poolName: 'Hồ bơi trẻ em',
          pHValue: 7.2,
          chlorineValue: 1.2,
          temperatureValue: 29.0,
          timestamp: new Date(2025, 4, 17, 9, 0),
          status: 'normal',
          measuredBy: 'Nguyễn Văn A',
          resolved: true,
          notes: 'Sau khi điều chỉnh, các chỉ số đã ổn định',
          needsAction: false
        },
        {
          id: '5',
          poolId: 'pool3',
          poolName: 'Hồ bơi spa',
          pHValue: 7.3,
          chlorineValue: 4.2,
          temperatureValue: 35.0,
          timestamp: new Date(2025, 4, 18, 11, 20),
          status: 'warning',
          measuredBy: 'Trần Thị B',
          resolved: true,
          notes: 'Chlorine cao, đã điều chỉnh xuống',
          needsAction: true
        },
        {
          id: '6',
          poolId: 'pool3',
          poolName: 'Hồ bơi spa',
          pHValue: 7.5,
          chlorineValue: 2.0,
          temperatureValue: 36.5,
          timestamp: new Date(2025, 4, 17, 16, 30),
          status: 'normal',
          measuredBy: 'Lê Văn C',
          resolved: false,
          notes: '',
          needsAction: false
        },
        {
          id: '7',
          poolId: 'pool1',
          poolName: 'Hồ bơi chính',
          pHValue: 7.6,
          chlorineValue: 2.2,
          temperatureValue: 28.2,
          timestamp: new Date(2025, 4, 16, 10, 15),
          status: 'normal',
          measuredBy: 'Nguyễn Văn A',
          resolved: false,
          notes: '',
          needsAction: false
        },
      ];

      setRecords(mockRecords);
      setFilteredRecords(mockRecords);
      setLoading(false);
    }, 1000);
  }, []);

  // Áp dụng bộ lọc khi chúng thay đổi
  useEffect(() => {
    let result = [...records];
    
    // Lọc theo hồ bơi
    if (selectedPool !== 'all') {
      result = result.filter(record => record.poolId === selectedPool);
    }
    
    // Lọc theo trạng thái
    if (selectedStatus !== 'all') {
      result = result.filter(record => record.status === selectedStatus);
    }
    
    // Lọc theo khoảng thời gian
    if (dateRange[0] && dateRange[1]) {
      result = result.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= dateRange[0]! && recordDate <= dateRange[1]!;
      });
    }
    
    // Lọc để chỉ hiển thị các giá trị vượt ngưỡng nếu được chọn
    if (showOnlyExceeded) {
      result = result.filter(record => record.needsAction);
    }
    
    setFilteredRecords(result);
  }, [selectedPool, selectedStatus, dateRange, showOnlyExceeded, records]);

  // Xử lý đánh dấu đã xử lý
  const handleResolveIssue = (recordId: string) => {
    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === recordId ? { ...record, resolved: true } : record
      )
    );
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
    {},
    {
      title: 'Hồ bơi',
      dataIndex: 'poolName',
      key: 'poolName',
    },
    {
      title: 'pH đã đo',
      key: 'pHValue',
      render: (_, record) => renderPHValue(record.pHValue),
      sorter: (a, b) => a.pHValue - b.pHValue,
    },
    {
      title: 'Clo đã đo',
      key: 'chlorineValue',
      render: (_, record) => renderChlorineValue(record.chlorineValue),
      sorter: (a, b) => a.chlorineValue - b.chlorineValue,
    },
    {
      title: 'Nhiệt độ đã đo',
      key: 'temperatureValue',
      render: (_, record) => {
        // Kiểm tra trạng thái của nhiệt độ
        let status = 'normal';
        if (record.temperatureValue < standards.temperature.min) {
          status = 'low';
        } else if (record.temperatureValue > standards.temperature.max) {
          status = 'high';
        }
        
        // Chọn màu sắc phù hợp
        const color = status === 'normal' ? 'green' : (status === 'high' ? 'red' : 'blue');
        
        return (
          <span style={{ color, fontWeight: status !== 'normal' ? 'bold' : 'normal' }}>
            {record.temperatureValue.toFixed(1)} °C
          </span>
        );
      },
      sorter: (a, b) => a.temperatureValue - b.temperatureValue,
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
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) => (
        <span>{timestamp.toLocaleString('vi-VN')}</span>
      ),
      sorter: (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Người đo',
      dataIndex: 'measuredBy',
      key: 'measuredBy',
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
            onClick={() => handleResolveIssue(record.id)}
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
            >
              <Option value="all">Tất cả hồ bơi</Option>
              {pools.map(pool => (
                <Option key={pool.id} value={pool.id}>{pool.name}</Option>
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
              onChange={(_, dateStrings) => {
                const startDate = dateStrings[0] ? new Date(dateStrings[0]) : null;
                const endDate = dateStrings[1] ? new Date(dateStrings[1]) : null;
                setDateRange([startDate, endDate]);
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
            rowKey="id"
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

export default QualityMeasurements;
