import React, { useState, useEffect } from 'react';
import { Alert, Button, Form, Input, Select, DatePicker, Card, Typography } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

// Define threshold constants
const PH_MIN = 7.0;
const PH_MAX = 7.6;
const CHLORINE_MIN = 0.5; // mg/L 
const CHLORINE_MAX = 3.0; // mg/L 

// Gợi ý hoá chất dựa vào thông số
interface ChemicalSuggestion {
  type: 'info' | 'warning';
  message: string;
  recommendation: string;
}

interface WaterParameterFormData {
  poolId: string;
  timestamp: Date | null;  // Đã gộp date và time thành timestamp
  temperature: number | null;
  pH: number | null;
  chlorine: number | null;
  notes: string;
}

const WaterParameters: React.FC = () => {
  const [formData, setFormData] = useState<WaterParameterFormData>({
    poolId: '',
    timestamp: null,  // Trường duy nhất cho ngày và giờ
    temperature: null,
    pH: null,
    chlorine: null,
    notes: '',
  });
  
  // Bỏ state warnings không dùng nữa
  const [suggestions, setSuggestions] = useState<ChemicalSuggestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sample pool data - would come from API in a real application
  const pools = [
    { id: 'pool1', name: 'Hồ bơi chính' },
    { id: 'pool2', name: 'Hồ bơi trẻ em' },
    { id: 'pool3', name: 'Hồ bơi spa' },
  ];

  // Validate the parameters and set suggestions (đã loại bỏ warnings)
  useEffect(() => {
    const newSuggestions: ChemicalSuggestion[] = [];
    
    if (formData.pH !== null) {
      if (formData.pH < PH_MIN) {
        newSuggestions.push({
          type: 'warning',
          message: `Độ pH (${formData.pH}) thấp hơn ngưỡng tối thiểu (${PH_MIN})`,
          recommendation: 'Thêm Sodium carbonate (Na₂CO₃ - Soda ash) hoặc Sodium bicarbonate (NaHCO₃) để tăng độ pH.'
        });
      } else if (formData.pH > PH_MAX) {
        newSuggestions.push({
          type: 'warning',
          message: `Độ pH (${formData.pH}) cao hơn ngưỡng tối đa (${PH_MAX})`,
          recommendation: 'Thêm Sodium bisulfate (NaHSO₄) hoặc Muriatic acid (HCl - Axit clohydric) để giảm độ pH.'
        });
      } else {
        newSuggestions.push({
          type: 'info',
          message: `Độ pH (${formData.pH}) trong ngưỡng tiêu chuẩn (${PH_MIN} - ${PH_MAX})`,
          recommendation: 'Không cần điều chỉnh.'
        });
      }
    }
    
    if (formData.chlorine !== null) {
      if (formData.chlorine < CHLORINE_MIN) {
        newSuggestions.push({
          type: 'warning',
          message: `Nồng độ Clo (${formData.chlorine} mg/L) thấp hơn ngưỡng tối thiểu (${CHLORINE_MIN} mg/L)`,
          recommendation: 'Thêm Calcium hypochlorite (Ca(ClO)₂) hoặc Sodium hypochlorite (NaClO) để tăng nồng độ Clo.'
        });
      } else if (formData.chlorine > CHLORINE_MAX) {
        newSuggestions.push({
          type: 'warning',
          message: `Nồng độ Clo (${formData.chlorine} mg/L) cao hơn ngưỡng tối đa (${CHLORINE_MAX} mg/L)`,
          recommendation: 'Dừng thêm Clo và để cho nồng độ giảm tự nhiên, hoặc thêm Sodium thiosulfate (Na₂S₂O₃) để giảm nồng độ Clo nhanh hơn.'
        });
      } else {
        newSuggestions.push({
          type: 'info',
          message: `Nồng độ Clo (${formData.chlorine} mg/L) trong ngưỡng tiêu chuẩn (${CHLORINE_MIN} - ${CHLORINE_MAX} mg/L)`,
          recommendation: 'Không cần điều chỉnh.'
        });
      }
    }
    
    setSuggestions(newSuggestions);
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

  // Xử lý thay đổi timestamp
  const handleTimestampChange = (value: Moment | null) => {
    handleInputChange('timestamp', value ? value.toDate() : null);
  };

  // Thêm ghi chú về điều chỉnh hoá chất
  const addChemicalAdjustmentNotes = () => {
    let notes = formData.notes;
    
    // Tạo ghi chú từ gợi ý
    suggestions.forEach(suggestion => {
      if (suggestion.type === 'warning') {
        const adjustmentNote = `- ${suggestion.message}. ${suggestion.recommendation}\n`;
        if (!notes.includes(adjustmentNote)) {
          notes += notes ? `\n${adjustmentNote}` : adjustmentNote;
        }
      }
    });
    
    handleInputChange('notes', notes);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    
    // Validate required fields
    if (!formData.poolId || !formData.timestamp || 
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
          timestamp: null,
          temperature: null,
          pH: null,
          chlorine: null,
          notes: '',
        });
        setSuggestions([]);
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
      
      {/* Đã loại bỏ phần cảnh báo ở đây */}
      
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
            
            <Form.Item label="Thời gian đo" required>
              <DatePicker 
                className="w-full" 
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày và giờ"
                value={formData.timestamp ? moment(formData.timestamp) : null}
                onChange={handleTimestampChange}
              />
            </Form.Item>
            
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
            
            {/* Hiển thị gợi ý hóa chất khi cả pH và chlorine đã được nhập */}
            {(formData.pH !== null || formData.chlorine !== null) && (
              <div className="md:col-span-2 mb-4">
                <Card 
                  className="bg-blue-50" 
                  title={
                    <div className="flex items-center">
                      <InfoCircleOutlined className="mr-2 text-blue-500" />
                      <span className="font-medium">Gợi ý điều chỉnh hóa chất</span>
                    </div>
                  }
                >
                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className={`p-2 rounded-md ${suggestion.type === 'warning' ? 'bg-orange-100' : 'bg-green-100'}`}>
                          <div className="flex items-start">
                            {suggestion.type === 'warning' ? (
                              <WarningOutlined className="mt-1 mr-2 text-orange-500" />
                            ) : (
                              <InfoCircleOutlined className="mt-1 mr-2 text-green-500" />
                            )}
                            <div>
                              <Text strong>{suggestion.message}</Text>
                              <div className="mt-1 text-sm">
                                <Text type={suggestion.type === 'warning' ? 'danger' : 'success'}>
                                  {suggestion.recommendation}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button 
                        type="primary" 
                        size="small" 
                        ghost 
                        onClick={addChemicalAdjustmentNotes}
                        className="mt-2"
                      >
                        Thêm gợi ý vào ghi chú
                      </Button>
                    </div>
                  ) : (
                    <Text>Vui lòng nhập đầy đủ thông số để nhận gợi ý</Text>
                  )}
                </Card>
              </div>
            )}
            
            <Form.Item label="Ghi chú" className="md:col-span-2">
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
          <li>Khi thông số không đạt chuẩn, hãy điều chỉnh theo gợi ý và ghi lại hành động đã thực hiện</li>
        </ul>
      </div>
    </div>
  );
};

export default WaterParameters;