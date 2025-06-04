import React, { useState, useEffect } from 'react';
import { Alert, Button, Form, Input, Select, DatePicker, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { Moment } from 'moment';
import moment from 'moment';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { getAllPools } from '../../services/poolService';
import { addWaterQualityParameter } from '../../services/waterQualityService';
import { useAuth } from '../../contexts/AuthContext';
import type { Pool } from '../../services/types';

// Import User interface từ authService để TypeScript nhận diện đúng kiểu dữ liệu
import { getCurrentUser } from '../../services/authService';

const { Option } = Select;
const { Text } = Typography;

// Định nghĩa các ngưỡng tiêu chuẩn
const PH_MIN = 7.0;
const PH_MAX = 7.6;
const CHLORINE_MIN = 0.5; // mg/L 
const CHLORINE_MAX = 3.0; // mg/L 

// Định nghĩa trạng thái đo
type MeasurementStatus = 'normal' | 'warning' | 'critical';

// Gợi ý hoá chất dựa vào thông số
interface ChemicalSuggestion {
  type: 'info' | 'warning';
  message: string;
  recommendation: string;
}

// Cập nhật interface form data để phù hợp với bảng WaterQualityParameters
interface WaterParameterFormData {
  poolId: string;
  timestamp: Date | null;
  temperature: number | null;
  pH: number | null;
  chlorine: number | null;
  notes: string;
  resolved: boolean;
  needsAction: boolean;
}

// Interface dữ liệu gửi đến API theo cấu trúc bảng mới
interface WaterQualitySubmitData {
  poolId: number;
  poolName: string;
  pTimestamp: Date;
  temperatureC: number;
  pHLevel: number;
  chlorineMgPerL: number;
  notes: string;
  createdBy?: string; // Changed from createdById to createdBy as per the table structure
  rStatus: string;
  resolved: boolean;
  needsAction: boolean;
}

const WaterParameters: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<WaterParameterFormData>({
    poolId: '',
    timestamp: null,
    temperature: null,
    pH: null,
    chlorine: null,
    notes: '',
    resolved: false, // Mặc định là false theo yêu cầu mới
    needsAction: true, // Mặc định là true theo yêu cầu mới
  });
  
  const [suggestions, setSuggestions] = useState<ChemicalSuggestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Thêm state cho danh sách hồ bơi và loading
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [measurementStatus, setMeasurementStatus] = useState<MeasurementStatus>('normal');

  // Fetch danh sách hồ bơi từ API
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        const poolsData = await getAllPools();
        setPools(poolsData);
      } catch (error) {
        console.error('Lỗi khi tải danh sách hồ bơi:', error);
        message.error('Không thể tải danh sách hồ bơi');
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  // Đánh giá các thông số và đưa ra gợi ý
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
    
    // Cập nhật trạng thái đo và needsAction tự động
    if (formData.pH !== null && formData.chlorine !== null) {
      const status = calculateStatus();
      setMeasurementStatus(status);
      
      // Nếu trạng thái là warning hoặc critical thì needsAction = true
      if (status !== 'normal') {
        setFormData(prev => ({
          ...prev,
          needsAction: true
        }));
      }
    }
  }, [formData.pH, formData.chlorine]);

  const handleInputChange = (
    field: keyof WaterParameterFormData,
    value: string | number | Date | null | boolean
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

  // Thêm ghi chú về điều chỉnh hoá chất.
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

  // Tính toán trạng thái dựa trên các giá trị đo lường
  const calculateStatus = (): MeasurementStatus => {
    if (formData.pH === null || formData.chlorine === null) {
      return 'normal';
    }
    
    // Kiểm tra từng điều kiện để xác định trạng thái, không xét nhiệt độ
    const isPHNormal = formData.pH >= PH_MIN && formData.pH <= PH_MAX;
    const isChlorineNormal = formData.chlorine >= CHLORINE_MIN && formData.chlorine <= CHLORINE_MAX;
    
    if (isPHNormal && isChlorineNormal) {
      return 'normal';
    } else {
      // Nếu có bất kỳ thông số nào vượt khỏi ngưỡng quá nhiều, coi là critical
      const isPHCritical = formData.pH < PH_MIN - 1 || formData.pH > PH_MAX + 1;
      const isChlorineCritical = formData.chlorine < CHLORINE_MIN - 0.3 || formData.chlorine > CHLORINE_MAX + 1;
      
      if (isPHCritical || isChlorineCritical) {
        return 'critical';
      }
      
      // Các trường hợp còn lại là warning
      return 'warning';
    }
  };

  // Chuyển đổi status sang string để lưu vào database
  const getStatusString = (status: MeasurementStatus): string => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
      default:
        return 'Normal';
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Validate required fields
      if (!formData.poolId || !formData.timestamp || 
          formData.pH === null || formData.chlorine === null || formData.temperature === null) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        setSubmitting(false);
        return;
      }
      
      // Tìm thông tin hồ bơi từ danh sách
      const selectedPool = pools.find(pool => pool.poolsId.toString() === formData.poolId);
      
      if (!selectedPool) {
        message.error('Không tìm thấy thông tin hồ bơi');
        setSubmitting(false);
        return;
      }
      
      // Tính toán trạng thái dựa trên các giá trị đo lường
      const status = calculateStatus();
      const statusString = getStatusString(status);
      
      // Lấy thông tin người tạo
      const currentUser = user || getCurrentUser();
      const createdBy = currentUser?.fullName || (currentUser?.staffId ? String(currentUser.staffId) : undefined) || 'Unknown';
      
      // Tạo đối tượng dữ liệu theo cấu trúc bảng WaterQualityParameters
      const waterQualityData: WaterQualitySubmitData = {
        poolId: parseInt(formData.poolId),
        poolName: selectedPool.poolName,
        pTimestamp: formData.timestamp as Date,
        temperatureC: formData.temperature as number,
        pHLevel: formData.pH as number,
        chlorineMgPerL: formData.chlorine as number,
        notes: formData.notes,
        createdBy: createdBy, // Thay đổi từ createdById sang createdBy và sử dụng tên người dùng
        rStatus: statusString, // Trạng thái được chuyển đổi thành chuỗi
        resolved: formData.resolved,
        needsAction: formData.needsAction
      };
      
      console.log('Submitting data:', waterQualityData);
      
      // Gọi API để lưu dữ liệu vào database
      await addWaterQualityParameter(waterQualityData);
      
      setSubmitting(false);
      setSubmitted(true);
      message.success('Đã lưu thông số nước thành công!');
      
      // Đợi một chút rồi reset form và redirect
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          poolId: '',
          timestamp: null,
          temperature: null,
          pH: null,
          chlorine: null,
          notes: '',
          resolved: false,
          needsAction: true,
        });
        setSuggestions([]);
        
        // Chuyển hướng đến trang lịch sử đo
        navigate('/quality/records');
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error);
      message.error('Có lỗi xảy ra khi lưu dữ liệu');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nhập Chỉ Số Nước Hồ Bơi</h1>
      
      {submitted && (
        <Alert 
          message="Thành công" 
          description="Dữ liệu đã được lưu thành công! Đang chuyển đến trang lịch sử..." 
          type="success" 
          showIcon 
          className="mb-4"
        />
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
                loading={loading}
                disabled={loading || submitting}
              >
                {pools.map(pool => (
                  <Option key={pool.poolsId.toString()} value={pool.poolsId.toString()}>
                    {pool.poolName}
                  </Option>
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </Form.Item>
            
            {/* Hiển thị trạng thái và thêm các trường mới */}
            <Form.Item label="Trạng thái">
              <div className={`p-2 rounded-md ${
                measurementStatus === 'normal' 
                  ? 'bg-green-100 text-green-800' 
                  : measurementStatus === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {measurementStatus === 'normal' && "Bình thường"}
                {measurementStatus === 'warning' && "Cảnh báo"}
                {measurementStatus === 'critical' && "Nguy hiểm"}
              </div>
            </Form.Item>
            
            {/* Hiển thị gợi ý hóa chất khi có nhập dữ liệu */}
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
                    <div className="space-y-2">
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
                        disabled={submitting}
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
                disabled={submitting}
              />
            </Form.Item>
          </div>
          
          <div className="mt-4">
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={submitting}
              size="large"
              disabled={loading || submitted}
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