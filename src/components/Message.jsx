import { CircleAlert, CircleCheck, Info } from 'lucide-react';

const icons = {
  error: CircleAlert,
  success: CircleCheck,
  info: Info,
};

// type: "error" | "success" | "info"
const Message = ({ type = 'info', children }) => {
  if (!children) return null;

  const Icon = icons[type] || Info;

  return (
    <div className={`message message-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
};

export default Message;
