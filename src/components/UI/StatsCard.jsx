import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  const formattedChange = change !== undefined ? Math.floor(change) : null;

  // Rút gọn hiển thị nếu quá dài
  const shortValue = value.toString().length > 12 
    ? value.toString().slice(0, 12) + '...' 
    : value;

  return (
    <div className="card p-4 overflow-hidden">
      <div className="flex items-center justify-between">
        {/* Nội dung text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>

          {/* Hiển thị số rút gọn nhưng tooltip là số đầy đủ */}
          <p
            className="text-3xl font-bold text-gray-900 truncate cursor-pointer"
            title={value}
          >
            {shortValue}
          </p>

          {formattedChange !== null && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span
                className={`text-sm font-medium truncate ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formattedChange}% so với tháng trước
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={`p-3 rounded-xl ${colorClasses[color]} flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
