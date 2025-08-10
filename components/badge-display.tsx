interface BadgeProps {
  shape: "circle" | "rosette";
  color: string;
  emoji: string;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

export function BadgeDisplay({
  shape,
  color,
  emoji,
  title,
  description,
  size = "md",
}: BadgeProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const generateGradient = (baseColor: string) => {
    // Create gradient from lighter top-left to darker bottom-right
    const rgb = hexToRgb(baseColor);
    if (!rgb) return baseColor;

    const lighter = `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(
      255,
      rgb.g + 40
    )}, ${Math.min(255, rgb.b + 40)})`;
    const darker = `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(
      0,
      rgb.g - 40
    )}, ${Math.max(0, rgb.b - 40)})`;

    return `linear-gradient(135deg, ${lighter} 0%, ${baseColor} 50%, ${darker} 100%)`;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    const [, redHex, greenHex, blueHex] = result;
    return {
      r: parseInt(redHex, 16),
      g: parseInt(greenHex, 16),
      b: parseInt(blueHex, 16),
    };
  };

  const badgeStyle = {
    background: generateGradient(color),
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  };

  return (
    <div className="text-center space-y-2">
      <div
        className={`${
          sizeClasses[size]
        } mx-auto flex items-center justify-center text-white font-bold border-4 border-white shadow-lg ${
          shape === "circle" ? "rounded-full" : "rounded-lg"
        }`}
        style={badgeStyle}
      >
        <span className={textSizeClasses[size]}>{emoji}</span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
