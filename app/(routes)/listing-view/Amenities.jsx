'use client';

import React from 'react';
import { 
  Snowflake, 
  Trees, 
  Pool, 
  Sun, 
  Dog,
  Home,
  MapPin,
  CalendarDays,
  Clock
} from 'lucide-react';

const Amenities = ({ listing }) => {
  // Ensure listing exists and has required keys
  if (!listing) {
    return <p className="text-gray-500">No listing data available.</p>;
  }

  const features = [
    { 
      label: 'Furnishing', 
      value: listing.furnishing,
      icon: Home ? <Home className="w-6 h-6" /> : null
    },
    { 
      label: 'Heating/Cooling', 
      value: listing.heating_cooling,
      icon: Snowflake ? <Snowflake className="w-6 h-6" /> : null
    },
    { 
      label: 'View', 
      value: listing.view,
      icon: Sun ? <Sun className="w-6 h-6" /> : null
    },
    { 
      label: 'Garden', 
      value: listing.garden ? 'Yes' : null,
      icon: Trees ? <Trees className="w-6 h-6" /> : null
    },
    { 
      label: 'Pool', 
      value: listing.pool ? 'Yes' : null,
      icon: Pool ? <Pool className="w-6 h-6" /> : null
    },
    { 
      label: 'Solar Panels', 
      value: listing.solar_panels ? 'Yes' : null,
      icon: Sun ? <Sun className="w-6 h-6" /> : null
    },
    { 
      label: 'Pets Allowed', 
      value: listing.pets_allowed ? 'Yes' : null,
      icon: Dog ? <Dog className="w-6 h-6" /> : null
    },
    { 
      label: 'Neighborhood', 
      value: listing.neighborhood,
      icon: MapPin ? <MapPin className="w-6 h-6" /> : null
    },
    { 
      label: 'Available From', 
      value: listing.available_from,
      icon: CalendarDays ? <CalendarDays className="w-6 h-6" /> : null
    },
    { 
      label: 'Availability Duration', 
      value: listing.availability_duration,
      icon: Clock ? <Clock className="w-6 h-6" /> : null
    },
  ];

  const filteredFeatures = features.filter((feature) => feature.value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredFeatures.length > 0 ? (
        filteredFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-4">
            {feature.icon}
            <div>
              <div className="font-medium">{feature.label}</div>
              <div className="text-gray-600">{feature.value}</div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No features available.</p>
      )}
    </div>
  );
};

export default React.memo(Amenities);
