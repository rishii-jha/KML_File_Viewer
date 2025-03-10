import React, { useState } from 'react';
import { Upload, FileText, Map } from 'lucide-react';
import { kml } from '@tmcw/togeojson';
import { KMLMap } from './components/KMLMap';

function App() {
  const [geoJSONData, setGeoJSONData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [summary, setSummary] = useState({
    placemarks: 0,
    lineStrings: 0,
    points: 0,
    polygons: 0,
    multiGeometries: 0,
  });
  const [details, setDetails] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const parser = new DOMParser();
      const kmlDoc = parser.parseFromString(e.target?.result, 'text/xml');
      const geoJSON = kml(kmlDoc);
      setGeoJSONData(geoJSON);
      
      // Calculate summary
      const newSummary = {
        placemarks: kmlDoc.getElementsByTagName('Placemark').length,
        lineStrings: kmlDoc.getElementsByTagName('LineString').length,
        points: kmlDoc.getElementsByTagName('Point').length,
        polygons: kmlDoc.getElementsByTagName('Polygon').length,
        multiGeometries: kmlDoc.getElementsByTagName('MultiGeometry').length,
      };
      setSummary(newSummary);

      // Calculate details
      const newDetails = [];
      geoJSON.features.forEach((feature) => {
        if (feature.geometry.type === 'LineString') {
          const coords = feature.geometry.coordinates;
          let length = 0;
          for (let i = 1; i < coords.length; i++) {
            const dx = coords[i][0] - coords[i-1][0];
            const dy = coords[i][1] - coords[i-1][1];
            length += Math.sqrt(dx * dx + dy * dy);
          }
          newDetails.push({
            type: 'LineString',
            length,
            coordinates: coords,
          });
        }
      });
      setDetails(newDetails);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">KML File Viewer</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <Upload className="w-5 h-5 mr-2" />
              Upload KML
              <input
                type="file"
                accept=".kml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Summary
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Map className="w-5 h-5 mr-2" />
              Details
            </button>
          </div>

          {showSummary && (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(summary).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{key}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showDetails && details.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {details.map((detail, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.length?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Map View</h2>
          <KMLMap geoJSONData={geoJSONData} />
        </div>
      </div>
    </div>
  );
}

export default App;