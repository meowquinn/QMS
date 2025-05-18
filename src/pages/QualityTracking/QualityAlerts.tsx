import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Badge, Select, DatePicker, Button, Alert, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { InfoCircleOutlined, WarningOutlined, AlertOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Define alert levels
type AlertLevel = 'low' | 'medium' | 'high';

interface PoolAlert {
  id: string;
  poolId: string;
  poolName: string;
  parameter: string;
  value: number;
  threshold: string;
  timestamp: Date;
  level: AlertLevel;
  resolved: boolean;
  notes?: string;
}

const QualityAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<PoolAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<PoolAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showResolved, setShowResolved] = useState<boolean>(false);
  
  // Sample pool data
  const pools = [
    { id: 'pool1', name: 'Hồ bơi chính' },
    { id: 'pool2', name: 'Hồ bơi trẻ em' },
    { id: 'pool3', name: 'Hồ bơi spa' },
  ];

  // Mock data for alerts
  useEffect(() => {
    // This would be an API call in a real application
    const mockAlerts: PoolAlert[] = [
      {
        id: '1',
        poolId: 'pool1',
        poolName: 'Hồ bơi chính',
        parameter: 'pH',
        value: 8.1,
        threshold: '> 7.6',
        timestamp: new Date(2025, 4, 14, 9, 30),
        level: 'medium',
        resolved: false,
        notes: 'Cần điều chỉnh pH xuống'
      },
      {
        id: '2',
        poolId: 'pool2',
        poolName: 'Hồ bơi trẻ em',
        parameter: 'Chlorine',
        value: 6.2,
        threshold: '> 5.0 mg/L',
        timestamp: new Date(2025, 4, 13, 15, 45),
        level: 'high',
        resolved: true,
        notes: 'Đã điều chỉnh lại lượng Chlorine'
      },
      {
        id: '3',
        poolId: 'pool3',
        poolName: 'Hồ bơi spa',
        parameter: 'pH',
        value: 6.8,
        threshold: '< 7.0',
        timestamp: new Date(2025, 4, 15, 8, 15),
        level: 'low',
        resolved: false
      },
      {
        id: '4',
        poolId: 'pool1',
        poolName: 'Hồ bơi chính',
        parameter: 'Temperature',
        value: 31.5,
        threshold: '> 30.0°C',
        timestamp: new Date(2025, 4, 15, 13, 0),
        level: 'low',
        resolved: false
      },
      {
        id: '5',
        poolId: 'pool2',
        poolName: 'Hồ bơi trẻ em',
        parameter: 'pH',
        value: 6.5,
        threshold: '< 7.0',
        timestamp: new Date(2025, 4, 12, 10, 30),
        level: 'medium',
        resolved: true
      },
      {
        id: '6',
        poolId: 'pool1',
        poolName: 'Hồ bơi trẻ em',
        parameter: 'pH',
        value: 9,
        threshold: '> 7.0',
        timestamp: new Date(2025, 4, 12, 10, 30),
        level: 'high',
        resolved: false
      }
    ];

    setAlerts(mockAlerts);
    setFilteredAlerts(mockAlerts);
    setLoading(false);
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let result = [...alerts];
    
    // Filter by pool
    if (selectedPool !== 'all') {
      result = result.filter(alert => alert.poolId === selectedPool);
    }
    
    // Filter by alert level
    if (selectedLevel !== 'all') {
      result = result.filter(alert => alert.level === selectedLevel);
    }
    
    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      result = result.filter(alert => {
        const alertDate = new Date(alert.timestamp);
        return alertDate >= dateRange[0]! && alertDate <= dateRange[1]!;
      });
    }
    
    // Filter by resolution status
    if (!showResolved) {
      result = result.filter(alert => !alert.resolved);
    }
    
    setFilteredAlerts(result);
  }, [selectedPool, selectedLevel, dateRange, showResolved, alerts]);

  // Handle alert resolution
  const handleResolveAlert = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  // Table columns configuration
  const columns: TableColumnsType<PoolAlert> = [
    {
      title: 'Hồ bơi',
      dataIndex: 'poolName',
      key: 'poolName',
    },
    {
      title: 'Thông số',
      dataIndex: 'parameter',
      key: 'parameter',
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (value: string, record: PoolAlert) => (
        <span>
          {value} 
          {record.parameter === 'Temperature' ? '°C' : 
           record.parameter === 'Chlorine' ? ' mg/L' : ''}
        </span>
      ),
    },
    {
      title: 'Ngưỡng',
      dataIndex: 'threshold',
      key: 'threshold',
    },
    {
      title: 'Mức độ',
      dataIndex: 'level',
      key: 'level',
      render: (level: AlertLevel) => {
        let color = '';
        let text = '';
        let icon = null;
        
        switch(level) {
          case 'low':
            color = 'blue';
            text = 'Thấp';
            icon = <InfoCircleOutlined />;
            break;
          case 'medium':
            color = 'orange';
            text = 'Trung bình';
            icon = <WarningOutlined />;
            break;
          case 'high':
            color = 'red';
            text = 'Cao';
            icon = <AlertOutlined />;
            break;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
      onFilter: (value, record: PoolAlert) => record.level === String(value),
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) => (
        <span>{timestamp.toLocaleString('vi-VN')}</span>
      ),
      sorter: (a: PoolAlert, b: PoolAlert) => a.timestamp.getTime() - b.timestamp.getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: PoolAlert) => (
        <Badge 
          status={record.resolved ? 'success' : 'processing'} 
          text={record.resolved ? 'Đã xử lý' : 'Chưa xử lý'} 
        />
      ),
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
      render: (_: unknown, record: PoolAlert) => (
        !record.resolved ? (
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleResolveAlert(record.id)}
          >
            Đánh dấu đã xử lý
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cảnh báo chất lượng nước</h1>
        <Badge count={filteredAlerts.filter(a => !a.resolved).length} overflowCount={99} />
      </div>
      
      <Alert
        message="Thông tin"
        description="Theo dõi các cảnh báo về chất lượng nước và xử lý kịp thời. Mức độ cảnh báo dựa trên mức độ nguy hiểm và thời gian cần xử lý."
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ cảnh báo</label>
            <Select
              className="w-full"
              value={selectedLevel}
              onChange={setSelectedLevel}
            >
              <Option value="all">Tất cả mức độ</Option>
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
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
                setSelectedLevel('all');
                setDateRange([null, null]);
                setShowResolved(false);
              }}
            >
              Đặt lại bộ lọc
            </Button>
            <Button 
              type={showResolved ? 'primary' : 'default'}
              onClick={() => setShowResolved(!showResolved)}
            >
              {showResolved ? 'Ẩn đã xử lý' : 'Hiện đã xử lý'}
            </Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <Table 
          columns={columns}
          dataSource={filteredAlerts}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true, 
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} cảnh báo` 
          }}
        />
      </Card>
    </div>
  );
};

export default QualityAlerts;
