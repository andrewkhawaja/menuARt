import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeGenerator: React.FC = () => {
  const [qrValue, setQrValue] = useState(`${window.location.origin}/ar-menu`);
  const [qrSize, setQrSize] = useState(200);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrLabel, setQrLabel] = useState('Scan for AR Menu');
  const [showCustomization, setShowCustomization] = useState(false);

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `ar-menu-qr-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
      const qrImage = canvas.toDataURL('image/png');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
              }
              .qr-label {
                margin-top: 20px;
                font-size: 18px;
                font-weight: bold;
              }
              @media print {
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${qrImage}" alt="AR Menu QR Code" />
              <div class="qr-label">${qrLabel}</div>
            </div>
            <div class="no-print" style="margin-top: 30px;">
              <button onclick="window.print();" style="padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print QR Code
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Link to="/admin" className="text-amber-800 hover:text-amber-600">
            ← Back to Admin Panel
          </Link>
          <h1 className="text-3xl font-bold text-amber-800">QR Code Generator</h1>
          <div></div> {/* Empty div for flex spacing */}
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 flex flex-col items-center justify-center p-4">
                <QRCodeSVG 
                  id="qr-code"
                  value={qrValue}
                  size={qrSize}
                  fgColor={qrColor}
                  bgColor={qrBgColor}
                  level="H"
                  includeMargin={true}
                />
                <p className="mt-4 text-center text-gray-700">{qrLabel}</p>
              </div>
              
              <div className="md:w-1/2 p-4">
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">QR Code URL</label>
                  <input
                    type="text"
                    value={qrValue}
                    onChange={(e) => setQrValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Default is the AR menu page. You can customize to point to specific items.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">QR Code Label</label>
                  <input
                    type="text"
                    value={qrLabel}
                    onChange={(e) => setQrLabel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowCustomization(!showCustomization)}
                  className="text-amber-600 hover:text-amber-800 mb-4 flex items-center"
                >
                  {showCustomization ? 'Hide' : 'Show'} Advanced Customization
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showCustomization ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    )}
                  </svg>
                </button>
                
                {showCustomization && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-2">QR Code Size</label>
                      <input
                        type="range"
                        min="100"
                        max="300"
                        value={qrSize}
                        onChange={(e) => setQrSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Small</span>
                        <span>Large</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">QR Code Color</label>
                      <input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-full h-10 p-1 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">Background Color</label>
                      <input
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="w-full h-10 p-1 rounded-lg"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                  >
                    Download QR Code
                  </button>
                  <button
                    onClick={printQRCode}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                  >
                    Print QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-amber-800 mb-4">How to Use QR Codes</h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                QR codes provide a seamless way for your customers to access the AR menu experience.
                Here are some tips for effective use:
              </p>
              
              <h3 className="text-xl font-medium text-amber-800 mt-4 mb-2">Placement Ideas</h3>
              <p>
                Place QR codes on table tents, menu cards, at the entrance, or on promotional materials.
                Ensure they are printed at a sufficient size (at least 2x2 inches) for easy scanning.
              </p>
              
              <h3 className="text-xl font-medium text-amber-800 mt-4 mb-2">Instructions for Customers</h3>
              <p>
                Consider adding a brief instruction next to the QR code, such as "Scan to view our menu in AR"
                or "Experience our dishes in 3D before ordering."
              </p>
              
              <h3 className="text-xl font-medium text-amber-800 mt-4 mb-2">Testing</h3>
              <p>
                Always test your QR codes with different devices and lighting conditions to ensure they
                scan properly. The high error correction level (H) helps with scanning reliability even
                if the code is slightly damaged or poorly lit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
