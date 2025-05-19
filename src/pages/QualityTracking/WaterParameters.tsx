import React, { useState, useEffect } from 'react';
import { Alert, Button, Form, Input, Select, DatePicker, TimePicker, Card } from 'antd';
import type { Moment } from 'moment';

const { Option } = Select;

// Define threshold constants
const PH_MIN = 7.0;
const PH_MAX = 7.6;
const CHLORINE_MIN = 0.5; // mg/L 
const CHLORINE_MAX = 3.0; // mg/L 

interface WaterParameterFormData {
  poolId: string;
  date: Date | null;
  time: Date | null;
  temperature: number | null;
  pH: number | null;
  chlorine: number | null;
  notes: string;
}

const WaterParameters: React.FC = () => {
  const [formData, setFormData] = useState<WaterParameterFormData>({
    poolId: '',
    date: null,
    time: null,
    temperature: null,
    pH: null,
    chlorine: null,
    notes: '',
  });
  
  const [warnings, setWarnings] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sample pool data - would come from API in a real application
  const pools = [
    { id: 'pool1', name: 'Hồ bơi chính' },
    { id: 'pool2', name: 'Hồ bơi trẻ em' },
    { id: 'pool3', name: 'Hồ bơi spa' },
  ];

  // Validate the parameters and set warnings
  useEffect(() => {
    const newWarnings = [];
    
    if (formData.pH !== null) {
      if (formData.pH < PH_MIN) {
        newWarnings.push(`Cảnh báo: Độ pH (${formData.pH}) thấp hơn ngưỡng tối thiểu (${PH_MIN})`);
      } else if (formData.pH > PH_MAX) {
        newWarnings.push(`Cảnh báo: Độ pH (${formData.pH}) cao hơn ngưỡng tối đa (${PH_MAX})`);
      }
    }
    
    if (formData.chlorine !== null) {
      if (formData.chlorine < CHLORINE_MIN) {
        newWarnings.push(`Cảnh báo: Nồng độ Clo (${formData.chlorine} mg/L) thấp hơn ngưỡng tối thiểu (${CHLORINE_MIN} mg/L)`);
      } else if (formData.chlorine > CHLORINE_MAX) {
        newWarnings.push(`Cảnh báo: Nồng độ Clo (${formData.chlorine} mg/L) cao hơn ngưỡng tối đa (${CHLORINE_MAX} mg/L)`);
      }
    }
    
    setWarnings(newWarnings);
  }, [formData.pH, formData.chlorine]);

  const handleInputChange = (
    field: keyof WaterParameterFormData,
    value: string | number | Date | null
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Cập nhật hàm handleNumberChange để kiểm tra và lọc giá trị âm
  const handleNumberChange = (field: keyof WaterParameterFormData, value: string) => {
    // Chuyển đổi giá trị nhập vào thành số
    const numValue = value ? parseFloat(value) : null;
    
    // Nếu giá trị là số và không âm, cập nhật state
    if (numValue !== null && numValue < 0) {
      return;
    }
    
    setFormData({
      ...formData,
      [field]: numValue,
    });
  };

  const handleSubmit = () => {
    setSubmitting(true);
    
    // Validate required fields
    if (!formData.poolId || !formData.date || !formData.time || 
        formData.pH === null || formData.chlorine === null || formData.temperature === null) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      setSubmitting(false);
      return;
    }
    
    // In a real app, would submit to API here
    console.log('Submitting data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      // Reset form after successful submission
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          poolId: '',
          date: null,
          time: null,
          temperature: null,
          pH: null,
          chlorine: null,
          notes: '',
        });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nhập Chỉ Số Nước Hồ Bơi</h1>
      
      {submitted && (
        <Alert 
          message="Thành công" 
          description="Dữ liệu đã được lưu thành công!" 
          type="success" 
          showIcon 
          className="mb-4"
        />
      )}
      
      {warnings.length > 0 && (
        <div className="mb-4">
          {warnings.map((warning, index) => (
            <Alert 
              key={index} 
              message="Cảnh báo" 
              description={warning} 
              type="warning" 
              showIcon 
              className="mb-2"
            />
          ))}
        </div>
      )}
      
      <Card title="Thông tin đo lường" className="mb-6">
        <Form layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Hồ bơi" required>
              <Select
                placeholder="Chọn hồ bơi"
                value={formData.poolId || undefined}
                onChange={(value: string) => handleInputChange('poolId', value)}
                className="w-full"
              >
                {pools.map(pool => (
                  <Option key={pool.id} value={pool.id}>{pool.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Ngày" required>
                <DatePicker 
                  className="w-full" 
                  onChange={(date: Moment | null) => handleInputChange('date', date ? date.toDate() : null)}
                />
              </Form.Item>
              
              <Form.Item label="Giờ" required>
                <TimePicker 
                  className="w-full" 
                  format="HH:mm"
                  onChange={(time) => handleInputChange('time', time ? time.toDate() : null)}
                />
              </Form.Item>
            </div>
            
            <Form.Item 
              label="Nhiệt độ (°C)" 
              required
              help="Nhập nhiệt độ nước hồ bơi"
            >
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ví dụ: 28.5"
                value={formData.temperature === null ? '' : formData.temperature}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange('temperature', e.target.value)}
              />
            </Form.Item>
            
            <Form.Item 
              label="Độ pH" 
              required
              help={`Giá trị tiêu chuẩn: ${PH_MIN} - ${PH_MAX}`}
              validateStatus={
                formData.pH !== null && (formData.pH < PH_MIN || formData.pH > PH_MAX) 
                  ? 'warning' 
                  : undefined
              }
            >
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ví dụ: 7.2"
                value={formData.pH === null ? '' : formData.pH}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange('pH', e.target.value)}
              />
            </Form.Item>
            
            <Form.Item 
              label="Nồng độ Clo (mg/L)" 
              required
              help={`Giá trị tiêu chuẩn: ${CHLORINE_MIN} - ${CHLORINE_MAX} mg/L`}
              validateStatus={
                formData.chlorine !== null && 
                (formData.chlorine < CHLORINE_MIN || formData.chlorine > CHLORINE_MAX)
                  ? 'warning' 
                  : undefined
              }
            >
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ví dụ: 1.5"
                value={formData.chlorine === null ? '' : formData.chlorine}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange('chlorine', e.target.value)}
              />
            </Form.Item>
            
            <Form.Item label="Ghi chú">
              <Input.TextArea
                rows={4}
                placeholder="Nhập ghi chú nếu có"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
              />
            </Form.Item>
          </div>
          
          <div className="mt-4">
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={submitting}
              size="large"
            >
              Lưu dữ liệu
            </Button>
          </div>
        </Form>
      </Card>
      
      <div className="bg-blue-50 p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Hướng dẫn</h3>
        <ul className="list-disc pl-5 text-blue-700">
          <li>Độ pH tiêu chuẩn nên trong khoảng {PH_MIN} - {PH_MAX}</li>
          <li>Nồng độ Clo nên trong khoảng {CHLORINE_MIN} - {CHLORINE_MAX} mg/L</li>
          <li>Đo đạc và cập nhật thông số ít nhất 2 lần mỗi ngày</li>
          <li>Ghi rõ các bất thường vào phần ghi chú nếu có</li>
        </ul>
      </div>
    </div>
  );
};

export default WaterParameters;