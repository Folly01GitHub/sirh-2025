
import React from "react";
import { icons, LucideProps } from "lucide-react";

interface LucideIconProps extends LucideProps {
  name: keyof typeof icons;
  size?: number;
  color?: string;
  className?: string;
}

const LucideIcon: React.FC<LucideIconProps> = ({ name, size = 16, color, className, ...rest }) => {
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} className={className} {...rest} />;
};

export default LucideIcon;
