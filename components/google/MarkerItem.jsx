import { MarkerF } from '@react-google-maps/api';

const MarkerItem = ({ item, onClick }) => {
  return (
    <MarkerF
      position={item.coordinates}
      onClick={onClick}
    />
  );
};

export default MarkerItem;
