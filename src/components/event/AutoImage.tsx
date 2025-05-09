import React, { useEffect, useRef, useState } from 'react';

const AutoEventImage = ({ title, width = 512, height = 200, bgColor = '#A33B20', textColor = '#3B413C' }) => {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Optional gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, bgColor);
    gradient.addColorStop(1, '#C97D60');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxWidth = width - 40;
    const words = title.split(' ');
    let line = '';
    const lines = [];

    for (const word of words) {
      const testLine = line + word + ' ';
      const { width: testWidth } = ctx.measureText(testLine);
      if (testWidth > maxWidth && line !== '') {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    const lineHeight = 40;
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2 + lineHeight / 2;

    lines.forEach((l, i) => {
      ctx.fillText(l, width / 2, startY + i * lineHeight);
    });

    setImageUrl(canvas.toDataURL('image/png'));
  }, [title, width, height, bgColor, textColor]);

  return (
    <>
      <canvas ref={canvasRef} width={width} height={height} style={{ display: 'none' }} />
      {imageUrl && <img src={imageUrl} alt={title} className="object-cover w-full h-auto" />}
    </>
  );
};

export default AutoEventImage;
